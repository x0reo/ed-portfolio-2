import React, { useEffect, useState } from 'react';
import '../styles/Loading.css';

function Loading({ isReady = true, onComplete = () => {}, duration = 2000 }) {
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'expanding' | 'retracting'

  useEffect(() => {
    let frameId;
    const start = performance.now();
    const holdDelay = 1000;

    const tick = (time) => {
      const linear = Math.min(1, (time - start) / duration);
      const currentPercent = Math.floor(linear * 100);
      setPercent(currentPercent);

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
          <div className="vertical-fill" style={{ height: `${percent}%` }}>
            <span className="percent-label">{percent}%</span>
          </div>
        </div>
      )}
      <div className="wipe-panel" />
    </div>
  );
}

export default Loading;