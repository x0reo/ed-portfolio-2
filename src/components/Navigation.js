import React, { useState, useEffect } from 'react';
import {
  FaHome,
  FaUser,
  FaBriefcase,
  FaBolt,
  FaEnvelope,
  FaLink,
  FaGithub,
  FaLinkedin,
  FaFacebook,
} from 'react-icons/fa';
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

  const socialLinks = [
    { name: 'GitHub', icon: FaGithub, href: '#github' },
    { name: 'LinkedIn', icon: FaLinkedin, href: '#linkedin' },
    { name: 'Facebook', icon: FaFacebook, href: '#facebook' },
    { name: 'Gmail', icon: FaEnvelope, href: '#gmail' },
  ];

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
          {sections.map((section) => {
            const IconComponent = sectionIcons[section];
            return (
              <li key={section}>
                <button
                  className={`nav-button ${activeSection === section ? 'active' : ''}`}
                  onClick={() => onSectionClick(section)}
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

        {/* Bottom Expandable Social Links Dock */}
        <div className="sidebar-links-dock">
          {/* Collapsed Link Indicator Icon */}
          <div className={`dock-collapsed-icon ${isExpanded ? 'fade-out' : 'fade-in'}`}>
            <FaLink />
          </div>

          {/* Expanded Social Icon Buttons */}
          <div className={`dock-social-buttons ${isExpanded ? 'fade-in' : 'fade-out'}`}>
            {socialLinks.map((link) => {
              const SocialIcon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  className="dock-social-btn"
                  aria-label={link.name}
                >
                  <SocialIcon />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;