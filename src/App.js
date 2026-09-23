import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';

const SECTIONS = ['hero', 'aboutme', 'projects', 'skills', 'contact'];

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const activeSectionRef = useRef('hero');
  // Flag to prevent the observer from updating the URL while a smooth scroll is happening
  const isScrollingToSection = useRef(false);
  const lastScrollPosition = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Set initial active section from URL fragment on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) || 'hero';
    if (SECTIONS.includes(hash)) {
      setActiveSection(hash);
      activeSectionRef.current = hash;
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  // Handle active section updates using IntersectionObserver
  useEffect(() => {
    const observerCallback = (entries) => {
      if (isScrollingToSection.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id !== activeSectionRef.current) {
            activeSectionRef.current = id;
            setActiveSection(id);
            window.history.replaceState(null, '', `#${id}`);
          }
        }
      });
    };

    // Trigger when the section crosses the middle of the viewport
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Detect manual scrolling to clear the scrolling flag
  useEffect(() => {
    let scrollEventTimeout;

    const handleScroll = () => {
      // If user scrolls manually, clear the scrolling flag to re-enable observer
      if (isScrollingToSection.current) {
        isScrollingToSection.current = false;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }

      // Clear existing timeout
      clearTimeout(scrollEventTimeout);

      // Update last scroll position after scroll ends
      scrollEventTimeout = setTimeout(() => {
        lastScrollPosition.current = window.scrollY;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollEventTimeout);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      isScrollingToSection.current = true;
      lastScrollPosition.current = window.scrollY;
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      activeSectionRef.current = sectionId;
      window.history.replaceState(null, '', `#${sectionId}`);

      // Re-enable observer after smooth scroll animation finishes
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingToSection.current = false;
      }, 800);
    }
  };

  return (
    <div className="App">
      <Navigation activeSection={activeSection} onSectionClick={scrollToSection} sections={SECTIONS} />

      <main className="main-content">
        <Hero onNavigate={scrollToSection} />
        <AboutMe />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </div>
  );
}

export default App;