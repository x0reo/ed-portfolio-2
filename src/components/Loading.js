import React, { useEffect, useRef, useState } from 'react';
import '../styles/Loading.css';

function Loading({ isReady = true, onComplete = () => {}, duration = 2000 }) {
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState('loading');
  
  const fillRef = useRef(null);

  useEffect(() => {
    let frameId;
    const start = performance.now();
    const holdDelay = 300;

    const tick = (time) => {
      const linear = Math.min(1, (time - start) / duration);
      const currentPercent = Math.floor(linear * 100);
      
      setPercent(currentPercent);

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${linear})`;
      }

      if (linear < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        if (isReady) {
          setTimeout(() => {
            setPhase('expanding');
            setTimeout(() => {
              setPhase('retracting');
              setTimeout(() => {
                onComplete();
              }, 500);
            }, 500);
          }, holdDelay);
        } else {
          frameId = window.requestAnimationFrame(tick);
        }
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [isReady, onComplete, duration]);

  return (
    <div className={`loading-overlay ${phase}`}>
      {phase === 'loading' && (
        <div className="vertical-track">
          <div ref={fillRef} className="vertical-fill">
            <span className="percent-label">{percent}%</span>
          </div>
        </div>
      )}
      <div className="wipe-panel" />
    </div>
  );
}

export default Loading;