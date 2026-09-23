import React, { useState, useEffect } from 'react';
import { FaHome, FaUser, FaBriefcase, FaBolt, FaEnvelope } from 'react-icons/fa';
import '../styles/Navigation.css';

function Navigation({ activeSection, onSectionClick, sections }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Update CSS variable when expanded state changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isExpanded ? '250px' : '80px'
    );
  }, [isExpanded]);

  const sectionIcons = {
    hero: FaHome,
    aboutme: FaUser,
    projects: FaBriefcase,
    skills: FaBolt,
    contact: FaEnvelope,
  };

  const getSectionLabel = (section) => {
    return section.charAt(0).toUpperCase() + section.slice(1).replace('me', ' Me');
  };

  return (
    <nav
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-content">
        <ul className="nav-menu">
          {sections.map(section => {
            const IconComponent = sectionIcons[section];
            return (
              <li key={section}>
                <button
                  className={`nav-button ${activeSection === section ? 'active' : ''}`}
                  onClick={() => onSectionClick(section)}
                  title={getSectionLabel(section)}
                >
                  <span className="nav-icon">
                    <IconComponent />
                  </span>
                  <span className={`nav-text ${isExpanded ? 'visible' : 'hidden'}`}>
                    {getSectionLabel(section)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
