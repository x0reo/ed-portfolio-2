import React from 'react';
import '../styles/Skills.css';

function Skills() {
  const skillCategories = [
    {
      id: 1,
      category: 'Frontend',
      skills: 'React, JavaScript, CSS, HTML',
    },
    {
      id: 2,
      category: 'Backend',
      skills: 'Node.js, Express, Databases',
    },
    {
      id: 3,
      category: 'Tools',
      skills: 'Git, VS Code, Webpack',
    },
    {
      id: 4,
      category: 'Other',
      skills: 'REST APIs, Responsive Design',
    },
  ];

  return (
    <section id="skills" className="section skills-section">
      <div className="section-content">
        <h2>Skills</h2>
        <div className="skills-grid">
          {skillCategories.map(item => (
            <div key={item.id} className="skill-item">
              <h4>{item.category}</h4>
              <p>{item.skills}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
