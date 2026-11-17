import React, { useRef, useState } from 'react';
import { FaChevronUp, FaChevronDown, FaReact, FaRust } from 'react-icons/fa';
import {
  SiDjango,
  SiFlutter,
  SiAndroidstudio,
  SiFirebase,
  SiSpringboot,
  SiTailwindcss,
} from 'react-icons/si';
import { BsOpenai } from 'react-icons/bs';
import { TbPlugConnected } from 'react-icons/tb';
import ProjectStackBackground from '../scenes/ProjectStackBackground';
import '../styles/Projects.css';

const PROJECTS_DATA = [
  {
    id: 'task-tracker',
    name: 'Task Tracker',
    stacks: [{ name: 'Django', Icon: SiDjango }],
  },
  {
    id: 'lessonlab',
    name: 'LessonLab',
    stacks: [
      { name: 'OpenAI', Icon: BsOpenai },
      { name: 'Flutter', Icon: SiFlutter },
      { name: 'Rust', Icon: FaRust },
    ],
  },
  {
    id: 'vstore',
    name: 'Vstore',
    stacks: [
      { name: 'Android Studio', Icon: SiAndroidstudio },
      { name: 'Firebase', Icon: SiFirebase },
    ],
  },
  {
    id: 'mathic-matic',
    name: 'Mathic-matic',
    stacks: [
      { name: 'React', Icon: FaReact },
      { name: 'Spring Boot', Icon: SiSpringboot },
      { name: 'WebSocket', Icon: TbPlugConnected },
    ],
  },
  {
    id: 'hypertext',
    name: 'Hypertext',
    stacks: [
      { name: 'React', Icon: FaReact },
      { name: 'Tailwind CSS', Icon: SiTailwindcss },
      { name: 'OpenAI', Icon: BsOpenai },
    ],
  },
];

function Projects() {
  const stackRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollAnimDir, setScrollAnimDir] = useState(null); // 'up' | 'down' | null
  const [animTick, setAnimTick] = useState(0);

  const total = PROJECTS_DATA.length;

  const wrapIndex = (idx) => ((idx % total) + total) % total;

  const handleSelectPrevious = () => {
    setSelectedIndex((prev) => wrapIndex(prev - 1));
    setScrollAnimDir('up');
    setAnimTick((t) => t + 1);

    stackRef.current?.triggerSkim('down');
  };

  const handleSelectNext = () => {
    setSelectedIndex((prev) => wrapIndex(prev + 1));
    setScrollAnimDir('down');
    setAnimTick((t) => t + 1);

    stackRef.current?.triggerSkim('up');
  };

  const visibleSlots = [
    { position: 'top', project: PROJECTS_DATA[wrapIndex(selectedIndex - 1)], onClick: handleSelectPrevious },
    { position: 'middle', project: PROJECTS_DATA[selectedIndex], onClick: null },
    { position: 'bottom', project: PROJECTS_DATA[wrapIndex(selectedIndex + 1)], onClick: handleSelectNext },
  ];

  return (
    <section id="projects" className="section projects-section">
      <ProjectStackBackground ref={stackRef} stackOffsetX={-3.3} />

      <div className="section-content projects-layout">
        <div className="projects-carousel-wrapper">
          <h2 className="projects-heading">Projects</h2>

          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handleSelectPrevious}
            aria-label="Scroll to previous project"
          >
            <FaChevronUp />
          </button>

          <div
            key={animTick}
            className={`projects-vertical-list ${
              scrollAnimDir ? `slide-from-${scrollAnimDir}` : ''
            }`}
          >
            {visibleSlots.map(({ position, project, onClick }) => {
              const isSelected = position === 'middle';
              return (
                <button
                  key={`${position}-${project.id}`}
                  type="button"
                  className={`project-slot-btn ${isSelected ? 'is-selected' : 'is-adjacent'}`}
                  onClick={onClick || undefined}
                >
                  <span className="project-slot-name">{project.name}</span>

                  <div className="project-slot-stacks" aria-label="Tech stack">
                    {project.stacks.map(({ name, Icon }) => (
                      <span key={name} className="stack-icon-badge" title={name}>
                        <Icon />
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handleSelectNext}
            aria-label="Scroll to next project"
          >
            <FaChevronDown />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Projects;