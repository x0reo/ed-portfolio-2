import React, { useEffect, useRef, useState } from 'react';
import '../styles/Hero.css';
import heroImage from '../assets/heroimg.jpg';

function Hero({ onNavigate, isAppLoading = false }) {
  const heroRef = useRef(null);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [portraitState, setPortraitState] = useState('hidden');

  // Intersection Observer to detect when Hero section enters viewport
  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsHeroVisible(true);
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHeroVisible || isAppLoading) return undefined;

    let frameId;
    let t1, t2;
    const duration = 2200;
    const start = performance.now();

    setProgress(0);
    setPortraitState('hidden'); // 1. Initially hidden

    const tick = (time) => {
      const linearProgress = Math.min(1, (time - start) / duration);
      const easedProgress = 1 - (1 - linearProgress) ** 3;
      const nextProgress = easedProgress * 100;

      setProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        // 2. Ring is complete -> Immediately show image for 0.2s
        setPortraitState('visible');

        t1 = window.setTimeout(() => {
          // 3. Hide image for 0.2s
          setPortraitState('hidden');

          t2 = window.setTimeout(() => {
            // 4. Show image permanently
            setPortraitState('visible');
          }, 50); // 0.2s hidden duration
        }, 50); // 0.2s visible duration
      }
    };

    frameId = window.requestAnimationFrame(tick);

  return () => {
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(t1);
    window.clearTimeout(t2);
  };
}, [isHeroVisible, isAppLoading]);

  const radius = 128;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <section id="hero" ref={heroRef} className="section hero-section">
      <div className="hero-content">
        <div className="hero-visual">
          <div className="portrait-shell">
            <svg className="portrait-ring" viewBox="0 0 320 320">
              <circle className="portrait-ring-track" cx="160" cy="160" r={radius} />
              <circle
                className="portrait-ring-progress"
                cx="160"
                cy="160"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <img
              className={`portrait-image ${portraitState}`}
              src={heroImage}
              alt="Profile portrait"
            />
          </div>
        </div>

        <div className="section-content hero-copy">
          <h1>Welcome to My Portfolio</h1>
          <p>Hello! I'm a passionate developer creating amazing web experiences.</p>
          <button className="cta-button" onClick={() => onNavigate('aboutme')}>
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;