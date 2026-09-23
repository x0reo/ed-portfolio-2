import React from 'react';
import '../styles/Hero.css';

function Hero({ onNavigate }) {
  return (
    <section id="hero" className="section hero-section">
      <div className="section-content">
        <h1>Welcome to My Portfolio</h1>
        <p>Hello! I'm a passionate developer creating amazing web experiences.</p>
        <button className="cta-button" onClick={() => onNavigate('aboutme')}>
          Learn More
        </button>
      </div>
    </section>
  );
}

export default Hero;
