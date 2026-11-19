import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createCircleDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

const CATEGORY_NODES_CONFIG = [
  { id: 'frontend', label: 'Frontend', position: [0.0, 1.5, 3.2] },
  { id: 'backend', label: 'Backend', position: [3.2, 0.4, 1.0] },
  { id: 'database', label: 'Database', position: [2.0, -1.4, -2.6] },
  { id: 'ai', label: 'AI', position: [-2.2, 1.2, -2.5] },
  { id: 'gamedev', label: 'Game Dev', position: [-3.1, -0.9, 1.4] },
];

function SkillsNeuralBackground({ labelRefs, selectedCategory, onSelectCategory, onInteract }) {
  const containerRef = useRef(null);
  const selectedCategoryRef = useRef(selectedCategory);
  selectedCategoryRef.current = selectedCategory;

  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    const dotTexture = createCircleDotTexture();

    const WHITE_DOT_COUNT = 180;
    const allNodePositions = [];

    for (let i = 0; i < WHITE_DOT_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.2 + Math.cbrt(Math.random()) * 2.6;

      allNodePositions.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.78,
          r * Math.cos(phi)
        )
      );
    }

    const categoryVectors = CATEGORY_NODES_CONFIG.map(
      (cfg) => new THREE.Vector3(...cfg.position)
    );
    allNodePositions.push(...categoryVectors);

    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(allNodePositions);
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      map: dotTexture,
      size: 0.14,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const whiteDotPoints = new THREE.Points(pointsGeometry, pointsMaterial);
    networkGroup.add(whiteDotPoints);

    const linePositions = [];
    for (let i = 0; i < allNodePositions.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < allNodePositions.length; j++) {
        const dist = allNodePositions[i].distanceTo(allNodePositions[j]);
        if (dist < 1.55 && connections < 5) {
          linePositions.push(
            allNodePositions[i].x,
            allNodePositions[i].y,
            allNodePositions[i].z,
            allNodePositions[j].x,
            allNodePositions[j].y,
            allNodePositions[j].z
          );
          connections++;
        }
      }
    }

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.14,
    });
    const synapticLines = new THREE.LineSegments(linesGeometry, linesMaterial);
    networkGroup.add(synapticLines);

    const indigoGeometry = new THREE.SphereGeometry(0.18, 24, 24);
    const haloGeometry = new THREE.SphereGeometry(0.32, 24, 24);

    const indigoMeshes = CATEGORY_NODES_CONFIG.map((cfg) => {
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      });

      const coreMesh = new THREE.Mesh(indigoGeometry, coreMat);
      const haloMesh = new THREE.Mesh(haloGeometry, haloMat);
      coreMesh.add(haloMesh);

      coreMesh.position.set(...cfg.position);
      coreMesh.userData = { id: cfg.id, haloMesh, haloMat };
      networkGroup.add(coreMesh);
      return coreMesh;
    });

    let isDragging = false;
    let dragDistance = 0;
    let prevPointer = { x: 0, y: 0 };

    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;
    let lastInteractionTime = -Infinity;

    const IDLE_RESUME_DELAY = 1.5;

    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    const getNDC = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (e) => {
      if (e.target.closest('.skill-details-panel') || e.target.closest('.neural-node-label')) {
        return;
      }
      isDragging = true;
      dragDistance = 0;
      prevPointer = { x: e.clientX, y: e.clientY };
      container.style.cursor = 'grabbing';
      onInteractRef.current?.();
    };

    const handlePointerMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - prevPointer.x;
        const dy = e.clientY - prevPointer.y;
        dragDistance += Math.hypot(dx, dy);

        targetRotY += dx * 0.0085;
        targetRotX = THREE.MathUtils.clamp(
          targetRotX + dy * 0.0085,
          -Math.PI / 2.2,
          Math.PI / 2.2
        );
        prevPointer = { x: e.clientX, y: e.clientY };

        if (dragDistance >= 4) {
          lastInteractionTime = performance.now() / 1000;
          onInteractRef.current?.();
        }
        return;
      }

      getNDC(e.clientX, e.clientY);
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(indigoMeshes, false);
      container.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    const handlePointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = 'grab';

      if (dragDistance >= 4) {
        lastInteractionTime = performance.now() / 1000;
        onInteractRef.current?.();
      } else {
        getNDC(e.clientX, e.clientY);
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObjects(indigoMeshes, false);

        if (hits.length > 0) {
          onSelectCategory(hits[0].object.userData.id);
        } else if (selectedCategoryRef.current) {
          onSelectCategory(null);
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Computes target Euler angles to orient the clicked node directly toward +Z
    const getTargetRotationForNode = (localPos) => {
      const nodeRotY = -Math.atan2(localPos.x, localPos.z);
      const horizontalDist = Math.hypot(localPos.x, localPos.z);
      const nodeRotX = Math.atan2(localPos.y, horizontalDist);
      return { nodeRotX, nodeRotY };
    };

    const clock = new THREE.Clock();
    const projVector = new THREE.Vector3();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const nowSec = performance.now() / 1000;

      const activeId = selectedCategoryRef.current;
      const isMobile = (container.clientWidth || window.innerWidth) < 768;

      if (activeId) {
        const selectedMesh = indigoMeshes.find((m) => m.userData.id === activeId);
        if (selectedMesh && !isDragging) {
          const { nodeRotX, nodeRotY } = getTargetRotationForNode(selectedMesh.position);
          const diffY = Math.atan2(Math.sin(nodeRotY - targetRotY), Math.cos(nodeRotY - targetRotY));
          targetRotY += diffY * Math.min(dt * 8, 1);
          targetRotX = THREE.MathUtils.lerp(targetRotX, nodeRotX, dt * 8);
        }
      } else if (!isDragging && nowSec - lastInteractionTime >= IDLE_RESUME_DELAY) {
        targetRotY += dt * 0.22;
      }

      const damping = 1 - Math.exp(-8.5 * dt);
      rotY = THREE.MathUtils.lerp(rotY, targetRotY, damping);
      rotX = THREE.MathUtils.lerp(rotX, targetRotX, damping);

      networkGroup.rotation.order = 'YXZ';
      networkGroup.rotation.y = rotY;
      networkGroup.rotation.x = rotX;

      const targetGroupX = activeId && !isMobile ? 2.6 : 0;
      networkGroup.position.x = THREE.MathUtils.lerp(networkGroup.position.x, targetGroupX, dt * 6);

      const canvasW = container.clientWidth;
      const canvasH = container.clientHeight;

      // Projects 3D node world positions onto 2D screen coordinates for the HTML labels
      indigoMeshes.forEach((mesh, idx) => {
        const isSelected = activeId === mesh.userData.id;
        const targetScale = isSelected ? 1.45 : 1.0;
        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, dt * 10));

        const pulse = 1 + Math.sin(elapsed * 3 + idx) * 0.16;
        mesh.userData.haloMesh.scale.setScalar(pulse);
        mesh.userData.haloMat.opacity = isSelected ? 0.5 : 0.25;

        mesh.getWorldPosition(projVector);
        const depthZ = projVector.z;
        projVector.project(camera);

        const screenX = (projVector.x * 0.5 + 0.5) * canvasW;
        const screenY = (-projVector.y * 0.5 + 0.5) * canvasH;

        const labelEl = labelRefs.current[mesh.userData.id];
        if (labelEl) {
          labelEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`;
          labelEl.style.opacity = isSelected || depthZ > -0.5 ? '1' : '0.45';
          labelEl.style.zIndex = isSelected ? '10' : depthZ > 0 ? '4' : '2';
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(animationFrameId);
      dotTexture.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      indigoGeometry.dispose();
      haloGeometry.dispose();
      indigoMeshes.forEach((m) => {
        m.material.dispose();
        m.userData.haloMat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [labelRefs, onSelectCategory]);

  return <div ref={containerRef} className="skills-three-bg" />;
}

export { CATEGORY_NODES_CONFIG };
export default SkillsNeuralBackground;