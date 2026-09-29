import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Loading from './components/Loading';

const SECTIONS = ['hero', 'aboutme', 'projects', 'skills', 'contact'];

const getAssetUrls = () => {
  if (typeof require.context !== 'undefined') {
    const context = require.context('./assets', true, /\.(png|jpe?g|svg|webp)$/);
    return context.keys().map(context);
  }

  return [];
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllAssetsReady, setIsAllAssetsReady] = useState(false);

  const [activeSection, setActiveSection] = useState('hero');
  const activeSectionRef = useRef('hero');
  const isScrollingToSection = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Preload assets
  useEffect(() => {
    const imageUrls = getAssetUrls();

    if (imageUrls.length === 0) {
      setIsAllAssetsReady(true);
      return;
    }

    const preloadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        if (img.complete) {
          resolve(url);
        } else {
          img.onload = () => resolve(url);
          img.onerror = () => resolve(url);
        }
      });
    };

    Promise.all(imageUrls.map((url) => preloadImage(url)))
      .then(() => setIsAllAssetsReady(true))
      .catch(() => setIsAllAssetsReady(true));
  }, []);

  // Set initial active section from URL fragment
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

  // Updated Intersection Observer Logic
  useEffect(() => {
    if (isLoading) return undefined;

    const observerCallback = (entries) => {
      if (isScrollingToSection.current) return;

      // Filter to only entries currently intersecting the viewport threshold
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // Pick the visible entry with the highest intersection ratio
        const bestEntry = visibleEntries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );

        const newId = bestEntry.target.id;
        if (newId !== activeSectionRef.current) {
          activeSectionRef.current = newId;
          setActiveSection(newId);
          window.history.replaceState(null, '', `#${newId}`);
        }
      } else {
        // Fallback for top of page if scrolled back up to #hero
        if (window.scrollY < 100 && activeSectionRef.current !== 'hero') {
          activeSectionRef.current = 'hero';
          setActiveSection('hero');
          window.history.replaceState(null, '', '#hero');
        }
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: [0.1, 0.3, 0.5, 0.8],
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 10 && activeSectionRef.current !== 'hero' && !isScrollingToSection.current) {
        activeSectionRef.current = 'hero';
        setActiveSection('hero');
        window.history.replaceState(null, '', '#hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      isScrollingToSection.current = true;
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      activeSectionRef.current = sectionId;
      window.history.replaceState(null, '', `#${sectionId}`);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingToSection.current = false;
      }, 800);
    }
  };

  return (
    <div className="App">
      {isLoading && (
        <Loading
          isReady={isAllAssetsReady} 
          onComplete={() => setIsLoading(false)} 
        />
      )}

      <Navigation activeSection={activeSection} onSectionClick={scrollToSection} sections={SECTIONS} />

      <main className="main-content">
        <Hero onNavigate={scrollToSection} isAppLoading={isLoading} />
        <AboutMe />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </div>
  );
}

export default App;