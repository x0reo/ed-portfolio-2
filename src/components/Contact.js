import React from 'react';
import '../styles/Contact.css';

function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="section-content">
        <h2>Contact Me</h2>
        <p>I'd love to hear from you! Feel free to reach out through any of these channels:</p>
        <div className="contact-links">
          <a href="mailto:your.email@example.com" className="contact-link">Email</a>
          <a href="https://linkedin.com" className="contact-link" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com" className="contact-link" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://twitter.com" className="contact-link" target="_blank" rel="noreferrer">Twitter</a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
