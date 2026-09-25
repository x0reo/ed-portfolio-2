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
  const lastScrollPosition = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Preload ALL assets in the assets folder
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
          img.onerror = () => resolve(url); // Resolve anyway so broken assets don't freeze app
        }
      });
    };

    // Wait until every single image is loaded
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

  // Intersection Observer
  useEffect(() => {
    if (isLoading) return undefined;

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
  }, [isLoading]);

  // Scroll listener
  useEffect(() => {
    let scrollEventTimeout;

    const handleScroll = () => {
      if (isScrollingToSection.current) {
        isScrollingToSection.current = false;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }

      clearTimeout(scrollEventTimeout);
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