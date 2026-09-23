import React from 'react';
import '../styles/Projects.css';

function Projects() {
  const projects = [
    {
      id: 1,
      title: 'Project One',
      description: 'A brief description of your first project and the technologies used.',
    },
    {
      id: 2,
      title: 'Project Two',
      description: 'A brief description of your second project and the technologies used.',
    },
    {
      id: 3,
      title: 'Project Three',
      description: 'A brief description of your third project and the technologies used.',
    },
  ];

  return (
    <section id="projects" className="section projects-section">
      <div className="section-content">
        <h2>Projects</h2>
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
