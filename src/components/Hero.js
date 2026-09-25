import React, { useEffect, useRef, useState } from 'react';
import { FaGithub, FaLinkedin, FaFacebook, FaEnvelope } from 'react-icons/fa6';
import '../styles/Hero.css';
import heroImage from '../assets/heroimg.jpg';
import resumePdf from '../assets/Edward_John_Camarillo.pdf';

const HERO_INFO_TEXT = "I am a passionate Software Developer with an ability to build efficient and user-friendly applications. Let's build something amazing together!";
const CARD_DELAY = 100;

function Hero({ isAppLoading = false }) {
  const heroRef = useRef(null);
  const circleProgressRef = useRef(null);

  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [portraitState, setPortraitState] = useState('hidden');
  const [textState, setTextState] = useState('hidden'); // 'hidden' | 'animate-headers' | 'ready-typewriter'
  const [typedText, setTypedText] = useState('');
  
  const [resumeBlinkState, setResumeBlinkState] = useState('hidden');
  const [heroContactBlinkState, setHeroContactBlinkState] = useState('hidden');

  const radius = 128;
  const circumference = 2 * Math.PI * radius;

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

  useEffect(() => {
    if (!isHeroVisible || isAppLoading) return undefined;

    let frameId;
    let t1, t2;
    const duration = 2200;
    const start = performance.now();

    setPortraitState('hidden');
    setTextState('animate-headers');
    setTypedText('');
    setResumeBlinkState('hidden');
    setHeroContactBlinkState('hidden');

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
            setTextState('ready-typewriter');
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

  useEffect(() => {
    if (textState !== 'ready-typewriter') return undefined;

    let index = 0;
    let r1, r2, delayTimer, c1, c2;
    const speed = 20;

    const intervalId = setInterval(() => {
      if (index < HERO_INFO_TEXT.length) {
        setTypedText(HERO_INFO_TEXT.slice(0, index + 1));
        index++;
      } else {
        clearInterval(intervalId);

        setResumeBlinkState('visible');
        r1 = window.setTimeout(() => {
          setResumeBlinkState('hidden');
          r2 = window.setTimeout(() => {
            setResumeBlinkState('visible');

            delayTimer = window.setTimeout(() => {
              
              setHeroContactBlinkState('visible');
              c1 = window.setTimeout(() => {
                setHeroContactBlinkState('hidden');
                c2 = window.setTimeout(() => {
                  setHeroContactBlinkState('visible');
                }, 50);
              }, 50);

            }, CARD_DELAY);

          }, 50);
        }, 50);
      }
    }, speed);

    return () => {
      clearInterval(intervalId);
      window.clearTimeout(r1);
      window.clearTimeout(r2);
      window.clearTimeout(delayTimer);
      window.clearTimeout(c1);
      window.clearTimeout(c2);
    };
  }, [textState]);

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

        <div className={`section-content hero-copy ${textState}`}>
          <p className="hero-intro">Hello! I am</p>
          <h1 className="hero-name">Edward John Camarillo</h1>
          <p className="hero-info">
            {typedText}
            {textState === 'ready-typewriter' && typedText.length < HERO_INFO_TEXT.length && (
              <span className="typewriter-cursor">|</span>
            )}
          </p>

          {/* Cards Wrapper */}
          <div className="hero-cards-wrapper">
            
            {/* Left Card: Download Resume */}
            <div className={`resume-card-container ${resumeBlinkState}`}>
              <a
                href={resumePdf}
                download="Resume.pdf"
                className="resume-card-button"
              >
                <div className="resume-button-bg" />
                <div className="resume-button-content">
                  <span className="pdf-label">PDF</span>
                  <svg
                    className="download-icon-large"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
              </a>
              <span className="resume-card-label">Resume</span>
            </div>

            {/* Right Card: 2x2 Hero Contact Grid */}
            <div className={`hero-contact-card-container ${heroContactBlinkState}`}>
              <a href="#github" className="hero-contact-link">
                <FaGithub className="hero-contact-icon" />
                <span>GitHub</span>
              </a>

              <a href="#linkedin" className="hero-contact-link">
                <FaLinkedin className="hero-contact-icon" />
                <span>LinkedIn</span>
              </a>

              <a href="#facebook" className="hero-contact-link">
                <FaFacebook className="hero-contact-icon" />
                <span>Facebook</span>
              </a>

              <a href="#gmail" className="hero-contact-link">
                <FaEnvelope className="hero-contact-icon" />
                <span>Gmail</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;