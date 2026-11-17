import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

function createDotGridTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#ffffff';

  const spacing = 16;
  const radius = 1.8;

  for (let x = spacing / 2; x < size; x += spacing) {
    for (let y = spacing / 2; y < size; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 1);
  return texture;
}

const ProjectStackBackground = forwardRef(({ stackOffsetX = -3.3 }, ref) => {
  const containerRef = useRef(null);
  const triggerFnRef = useRef(null);

  useImperativeHandle(ref, () => ({
    triggerSkim: (direction = 'up') => {
      if (triggerFnRef.current) {
        triggerFnRef.current(direction);
      }
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, & Transparent Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 11.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Group positioned on the Center-Left
    const stackGroup = new THREE.Group();
    stackGroup.position.x = stackOffsetX;
    stackGroup.rotation.y = 0.42;
    scene.add(stackGroup);

    // 3. Box Stack Setup
    const BOX_COUNT = 7;
    const BOX_WIDTH = 2.6;
    const BOX_HEIGHT = 0.65;
    const BOX_DEPTH = 1.6;
    const SPACING = 0.5;
    const STEP = BOX_HEIGHT + SPACING;
    const TOTAL_SPAN = BOX_COUNT * STEP;

    const IDLE_DOT_COLOR = new THREE.Color(0xcbd5e1);
    const EXPAND_COLOR = new THREE.Color(0x6366f1);

    const dotTexture = createDotGridTexture();
    const boxGeometry = new THREE.BoxGeometry(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH);

    const boxes = [];

    for (let i = 0; i < BOX_COUNT; i++) {
      const faceMaterial = new THREE.MeshBasicMaterial({
        color: IDLE_DOT_COLOR.clone(),
        map: dotTexture,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(boxGeometry, faceMaterial);

      const baseIndex = i - Math.floor(BOX_COUNT / 2);
      const initialY = baseIndex * STEP;

      mesh.userData = {
        baseY: initialY,
        currentBob: 0,
        currentPushY: 0,
      };
      mesh.position.y = initialY;

      stackGroup.add(mesh);
      boxes.push(mesh);
    }

    // 4. Raycaster Setup for Hover Interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-999, -999);
    let isHoveringExpanded = false;

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerLeave = () => {
      pointer.set(-999, -999);
      isHoveringExpanded = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    // 5. Bidirectional Animation Timeline
    const SCROLL_PHASE_MS = 400;
    const STOP_DURATION = 0.8;
    const MAX_SCROLL_SPEED = 18.0;

    let state = 'idle';
    let scrollDir = 1;
    let scrollOffset = 0;
    let currentSpeed = 0;

    let stopStartOffset = 0;
    let stopTargetOffset = 0;
    let stopProgress = 0;

    let bobBlend = 1;
    let bobPhaseTime = 0;

    let selectedBox = null;
    let skimTimeoutId = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Proper positive modulo wrapping so negative offsets (scrolling down) wrap cleanly
    const getWrappedY = (baseY, offset) => {
      const halfSpan = TOTAL_SPAN / 2;
      let y = (((baseY + offset + halfSpan) % TOTAL_SPAN) + TOTAL_SPAN) % TOTAL_SPAN - halfSpan;
      return y;
    };

    triggerFnRef.current = (direction = 'up') => {
      if (skimTimeoutId) clearTimeout(skimTimeoutId);

      scrollDir = direction === 'down' ? -1 : 1;
      selectedBox = null;
      isHoveringExpanded = false;
      state = 'scrolling';
      currentSpeed = 12.0 * scrollDir;

      skimTimeoutId = setTimeout(() => {
        state = 'stopping';
        stopStartOffset = scrollOffset;
        stopProgress = 0;

        // Travel 4 slots in the active direction and snap onto an exact STEP multiple
        const extraTravel = STEP * 4 * scrollDir;
        const rawTarget = scrollOffset + extraTravel;
        stopTargetOffset = Math.round(rawTarget / STEP) * STEP;
      }, SCROLL_PHASE_MS);
    };

    // 6. Render Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);

      const isIdleState = state === 'idle' || state === 'expanding';
      const targetBobBlend = isIdleState ? 1.0 : 0.0;
      bobBlend = THREE.MathUtils.lerp(bobBlend, targetBobBlend, dt * 6);

      if (bobBlend > 0.001) {
        bobPhaseTime += dt;
      }

      if (state === 'scrolling') {
        const targetVel = MAX_SCROLL_SPEED * scrollDir;
        currentSpeed = THREE.MathUtils.lerp(currentSpeed, targetVel, dt * 14);
        scrollOffset += currentSpeed * dt;
      } else if (state === 'stopping') {
        stopProgress += dt / STOP_DURATION;
        const t = Math.min(stopProgress, 1);
        const eased = easeOutCubic(t);

        scrollOffset = THREE.MathUtils.lerp(stopStartOffset, stopTargetOffset, eased);

        if (t >= 1) {
          state = 'expanding';
          bobPhaseTime = 0;

          selectedBox = boxes.reduce((closest, box) => {
            const yA = Math.abs(getWrappedY(box.userData.baseY, scrollOffset));
            const yB = Math.abs(getWrappedY(closest.userData.baseY, scrollOffset));
            return yA < yB ? box : closest;
          });
        }
      }

      // Check Raycaster Hover on expanded center box
      if (state === 'expanding' && selectedBox) {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(selectedBox, false);
        isHoveringExpanded = intersects.length > 0;
        document.body.style.cursor = isHoveringExpanded ? 'pointer' : '';
      } else if (isHoveringExpanded) {
        isHoveringExpanded = false;
        document.body.style.cursor = '';
      }

      const HOVER_SCALE_Y = 2.3;
      const targetSelectedScaleY = isHoveringExpanded ? HOVER_SCALE_Y : 1.0;
      const extraHalfHeight = isHoveringExpanded
        ? BOX_HEIGHT * (HOVER_SCALE_Y - 1) * 0.5 + 0.12
        : 0;

      boxes.forEach((box, idx) => {
        const trackY = getWrappedY(box.userData.baseY, scrollOffset);
        const isTarget = box === selectedBox && state === 'expanding';

        let targetPushY = 0;
        if (state === 'expanding' && selectedBox && !isTarget) {
          targetPushY = trackY > 0 ? extraHalfHeight : -extraHalfHeight;
        }

        box.userData.currentPushY = THREE.MathUtils.lerp(
          box.userData.currentPushY,
          targetPushY,
          dt * 10
        );

        const targetBob = Math.sin(bobPhaseTime * 2.2 + idx * 0.55) * 0.035 * bobBlend;
        box.userData.currentBob = THREE.MathUtils.lerp(box.userData.currentBob, targetBob, dt * 8);

        box.position.y = trackY + box.userData.currentPushY + box.userData.currentBob;

        const targetScaleX = isTarget ? 1.65 : 1.0;
        const targetScaleY = isTarget ? targetSelectedScaleY : 1.0;
        const targetScaleZ = isTarget ? 1.15 : 1.0;
        const targetColor = isTarget ? EXPAND_COLOR : IDLE_DOT_COLOR;
        const targetOpacity = isTarget ? 1.0 : 0.72;

        box.scale.x = THREE.MathUtils.lerp(box.scale.x, targetScaleX, dt * 12);
        box.scale.y = THREE.MathUtils.lerp(box.scale.y, targetScaleY, dt * 10);
        box.scale.z = THREE.MathUtils.lerp(box.scale.z, targetScaleZ, dt * 12);

        box.material.color.lerp(targetColor, dt * 12);
        box.material.opacity = THREE.MathUtils.lerp(box.material.opacity, targetOpacity, dt * 12);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);

      stackGroup.position.x = newW < 768 ? 0 : stackOffsetX;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.body.style.cursor = '';
      cancelAnimationFrame(animationFrameId);
      if (skimTimeoutId) clearTimeout(skimTimeoutId);
      dotTexture.dispose();
      boxGeometry.dispose();
      boxes.forEach((b) => b.material.dispose());
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [stackOffsetX]);

  return (
    <div
      ref={containerRef}
      className="projects-three-bg"
      aria-hidden="true"
    />
  );
});

export default ProjectStackBackground;