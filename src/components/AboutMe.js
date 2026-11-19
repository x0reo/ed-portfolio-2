import React, { useState, useEffect } from 'react';
import '../styles/AboutMe.css';

import about1 from '../assets/aboutimg1.jpg';
import about2 from '../assets/aboutimg2.jpg';
import about3 from '../assets/aboutimg3.jpg';

const IMAGES = [about1, about2, about3];

// TODO: Improve AboutMe section details and image transitions
// TODO: Add horizontal buttons to navigate through the images in the AboutMe section
function AboutMe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animState, setAnimState] = useState('idle');

  useEffect(() => {
    IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const upcomingIndex = (currentIndex + 1) % IMAGES.length;

      setAnimState('blinking');

      const swoopTimer = setTimeout(() => {
        setCurrentIndex(upcomingIndex);
        setAnimState('swooping');
      }, 300);

      const resetTimer = setTimeout(() => {
        setAnimState('idle');
      }, 900);

      return () => {
        clearTimeout(swoopTimer);
        clearTimeout(resetTimer);
      };
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section id="aboutme" className="section about-section">
      <div className="about-container">
        {/* Left Side: Text Content */}
        <div className="about-content">
          <h2>About Me</h2>
          <p>
            I'm a developer with a passion for creating beautiful and functional web applications.
            With experience in React, JavaScript, and modern web technologies, I love solving
            complex problems and building user-friendly solutions.
          </p>
          <p>
            When I'm not coding, you can find me exploring new technologies or contributing to
            open-source projects.
          </p>
        </div>

        {/* Right Side: Halftone Image Showcase (Fades to Transparent) */}
        <div className="about-visual">
          <div className="halftone-frame">
            <img
              key={currentIndex}
              src={IMAGES[currentIndex]}
              alt="About Me visual"
              className={`about-image ${animState}`}
            />
            {/* Creates transparent halftone cutouts on the image boundaries */}
            <div className="halftone-overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutMe;