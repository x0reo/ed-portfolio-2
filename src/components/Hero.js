import React, { useEffect, useRef, useState } from 'react';
import '../styles/Hero.css';
import heroImage from '../assets/heroimg.jpg';

function Hero({ onNavigate, isAppLoading = false }) {
  const heroRef = useRef(null);
  const circleProgressRef = useRef(null); // Ref to drive direct DOM manipulation for cross-browser support
  
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [portraitState, setPortraitState] = useState('hidden');

  const radius = 128;
  const circumference = 2 * Math.PI * radius;

  // Intersection Observer
  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsHeroVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  // Animation Sequence
  useEffect(() => {
    if (!isHeroVisible || isAppLoading) return undefined;

    let frameId;
    let t1, t2;
    const duration = 2200;
    const start = performance.now();

    setPortraitState('hidden');

    const tick = (time) => {
      const linearProgress = Math.min(1, (time - start) / duration);
      const easedProgress = 1 - (1 - linearProgress) ** 3;
      const currentDashOffset = circumference - easedProgress * circumference;

      if (circleProgressRef.current) {
        circleProgressRef.current.style.strokeDashoffset = `${currentDashOffset}px`;
      }

      if (linearProgress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        if (circleProgressRef.current) {
          circleProgressRef.current.style.strokeDashoffset = `0px`;
        }

        setPortraitState('visible');
        t1 = window.setTimeout(() => {
          setPortraitState('hidden');
          t2 = window.setTimeout(() => {
            setPortraitState('visible');
          }, 50);
        }, 50);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isHeroVisible, isAppLoading, circumference]);

  return (
    <section id="hero" ref={heroRef} className="section hero-section">
      <div className="hero-content">
        <div className="hero-visual">
          <div className="portrait-shell">
            <svg className="portrait-ring" viewBox="0 0 320 320">
              <circle className="portrait-ring-track" cx="160" cy="160" r={radius} />
              <circle
                ref={circleProgressRef}
                className="portrait-ring-progress"
                cx="160"
                cy="160"
                r={radius}
                style={{
                  strokeDasharray: `${circumference}px`,
                  strokeDashoffset: `${circumference}px`,
                }}
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
          <p className="hero-intro">Hello! I am</p>
          <h1>Edward John Camarillo</h1>
          <p className="hero-info">I am a passionate Software Developer with an ability to build efficient and user-friendly applications. Let's build something amazing together!</p>
          <button className="cta-button" onClick={() => onNavigate('aboutme')}>
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;