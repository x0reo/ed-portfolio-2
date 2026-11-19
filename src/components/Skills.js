import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import SkillsNeuralBackground, { CATEGORY_NODES_CONFIG } from '../scenes/SkillsBackground';
import '../styles/Skills.css';

const SKILL_DETAILS = {
  frontend: {
    category: 'Frontend',
    description: 'Building responsive, interactive user interfaces and 3D web experiences.',
    items: ['React', 'JavaScript (ES6+)', 'Tailwind CSS', 'HTML5 / CSS3', 'Three.js'],
  },
  backend: {
    category: 'Backend',
    description: 'Designing scalable REST APIs, real-time services, and server architectures.',
    items: ['Node.js', 'Java', 'C#', 'Python', 'Express', 'Django', 'Spring Boot', 'WebSockets'],
  },
  database: {
    category: 'Database',
    description: 'Structuring relational and real-time cloud data models for reliability and speed.',
    items: ['PostgreSQL', 'Firebase', 'MySQL', 'MongoDB'],
  },
  ai: {
    category: 'AI',
    description: 'Integrating large language models and intelligent workflows into applications.',
    items: ['OpenAI API', 'LLM Integration', 'Prompt Engineering', 'AI Agents'],
  },
  gamedev: {
    category: 'Game Dev',
    description: 'Developing interactive 3D environments, AI programming, UI design, physics, and real-time rendering.',
    items: ['Three.js / WebGL', 'Unity', 'Unreal Engine', 'C#', 'C++', 'Lua', 'Godot', 'Shader & Spatial Math'],
  },
};

function Skills() {
  const labelRefs = useRef({});
  const inactivityTimerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Resets the 3-second inactivity timer whenever the 3D model or nodes are interacted with
  const resetInactivityTimer = useCallback(() => {
    setShowHint(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setShowHint(true);
    }, 3000);
  }, []);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  const handleSelectCategory = useCallback(
    (categoryId) => {
      setSelectedCategory(categoryId);
      resetInactivityTimer();
    },
    [resetInactivityTimer]
  );

  const activeDetails = selectedCategory ? SKILL_DETAILS[selectedCategory] : null;

  const handleSectionBackgroundClick = (e) => {
    if (
      selectedCategory &&
      !e.target.closest('.skill-details-panel') &&
      !e.target.closest('.neural-node-label') &&
      !e.target.closest('.skills-three-bg')
    ) {
      handleSelectCategory(null);
    }
  };

  return (
    <section
      id="skills"
      className="section skills-section"
      onClick={handleSectionBackgroundClick}
    >
      <SkillsNeuralBackground
        labelRefs={labelRefs}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onInteract={resetInactivityTimer}
      />

      <div className="neural-labels-layer">
        {CATEGORY_NODES_CONFIG.map((node) => {
          const isSelected = selectedCategory === node.id;
          return (
            <button
              key={node.id}
              type="button"
              ref={(el) => {
                labelRefs.current[node.id] = el;
              }}
              className={`neural-node-label ${isSelected ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectCategory(node.id);
              }}
            >
              <span className="node-dot-indicator" />
              <span>{node.label}</span>
            </button>
          );
        })}
      </div>

      <div className="skills-header">
        <h2>Skills</h2>
        <div className={`skills-hint ${showHint ? 'visible' : ''}`}>
          <FaInfoCircle className="skills-hint-icon" />
          <div className="skills-hint-lines">
            <span>Drag to rotate</span>
            <span>Click a node to inspect</span>
          </div>
        </div>
      </div>

      {activeDetails && (
        <aside
          className="skill-details-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="skill-panel-header">
            <h3>{activeDetails.category}</h3>
            <button
              type="button"
              className="skill-panel-close"
              onClick={() => handleSelectCategory(null)}
              aria-label="Close skill details"
            >
              <FaTimes />
            </button>
          </div>

          <p className="skill-panel-desc">{activeDetails.description}</p>

          <div className="skill-tags-list">
            {activeDetails.items.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </aside>
      )}
    </section>
  );
}

export default Skills;