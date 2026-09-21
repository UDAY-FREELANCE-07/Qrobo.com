'use client';

import { BookOpen, Box, Bot, Code2, Cog, Cpu, FileCode2, Lightbulb, Laptop2, Network, PenLine, ScanLine, Sparkles, Users, Wrench } from 'lucide-react';

function Feature({ icon: Icon, title, text, tone }: { icon: typeof BookOpen; title: string; text: string; tone: 'mint' | 'lilac' | 'rose' | 'green' }) {
  return (
    <div className="platform-feature">
      <span className={`platform-feature-icon platform-${tone}`}><Icon className="h-5 w-5" /></span>
      <span><strong>{title}</strong><small>{text}</small></span>
    </div>
  );
}

function LearnRobot() {
  return (
    <div className="learn-robot platform-parallax" aria-hidden="true">
      <div className="learn-robot-antenna" />
      <div className="learn-robot-head">
        <div className="learn-robot-screen"><span className="learn-eye" /><span className="learn-eye" /><i className="learn-smile" /></div>
        <span className="learn-robot-ear learn-robot-ear-left" /><span className="learn-robot-ear learn-robot-ear-right" />
      </div>
      <div className="learn-robot-body"><span className="learn-robot-badge">Qrobo</span></div>
      <span className="learn-robot-arm learn-robot-arm-left" />
      <span className="learn-robot-arm learn-robot-arm-right"><i /></span>
    </div>
  );
}

function ProjectsCar() {
  return (
    <div className="project-car platform-parallax" aria-hidden="true">
      <div className="project-car-scan"><ScanLine className="h-5 w-5" /></div>
      <div className="project-car-sensor"><span /><span /><span /></div>
      <div className="project-car-board"><Cpu className="h-7 w-7" /><i className="project-led" /></div>
      <div className="project-car-wheel project-car-wheel-left" /><div className="project-car-wheel project-car-wheel-right" />
      <div className="project-car-chassis" />
    </div>
  );
}

export function LearnBanner() {
  return (
    <section className="platform-banner learn-banner">
      <div className="platform-light platform-light-one" /><div className="platform-light platform-light-two" />
      <div className="platform-dots" /><div className="platform-particles"><i /><i /><i /><i /><i /></div>
      <div className="platform-copy">
        <p className="platform-kicker">SKILLS TODAY <span>•</span> SMARTER TOMORROW</p>
        <h1>Learn. <em>Build.</em> <b>Create.</b></h1>
        <p className="platform-description">Step-by-step tutorials, hands-on guides and real projects<br className="hidden sm:block" /> to fuel your curiosity in electronics, robotics, 3D printing and more.</p>
        <div className="platform-features">
          <Feature icon={BookOpen} title="Beginner Friendly" text="Learn at your own pace" tone="mint" />
          <Feature icon={Lightbulb} title="Hands-on Projects" text="From basics to advanced" tone="lilac" />
          <Feature icon={Users} title="Build Your Skills" text="For a smarter future" tone="rose" />
        </div>
      </div>
      <div className="learn-art">
        <div className="platform-doodle learn-doodle-one">Learn<br />Build<br />Innovate</div>
        <div className="platform-doodle learn-doodle-two">Ideas<br />into Reality</div>
        <div className="learn-arrow-doodle" />
        <div className="learn-note-card"><strong>Small<br />Lessons<br />Big<br />Creations</strong><Lightbulb className="h-7 w-7" /></div>
        <div className="learn-category-stack">
          <div className="learn-category learn-category-electronics"><Cpu /> Electronics</div>
          <div className="learn-category learn-category-code"><Code2 /> Code</div>
          <div className="learn-category learn-category-print"><Box /> 3D Print</div>
          <div className="learn-category learn-category-robotics"><Bot /> Robotics</div>
        </div>
        <LearnRobot />
      </div>
    </section>
  );
}

export function ProjectsBanner() {
  return (
    <section className="platform-banner projects-banner">
      <div className="platform-light platform-light-one" /><div className="platform-light platform-light-two" />
      <div className="platform-dots" /><div className="platform-particles"><i /><i /><i /><i /><i /></div>
      <div className="projects-art projects-art-left">
        <div className="platform-doodle projects-doodle-left">IDEAS<br />SKILLS<br />REAL PROJECTS</div>
        <div className="projects-arrow-doodle" />
        <div className="project-books"><span>Robotics</span><span>Electronics</span><span>IoT Projects</span><span>3D Printing</span></div>
        <Wrench className="project-doodle-tool" />
      </div>
      <div className="platform-copy projects-copy">
        <h1>Projects</h1>
        <p className="platform-description">Explore student projects and robotics projects with guides<br className="hidden sm:block" /> and component lists</p>
        <div className="platform-features">
          <Feature icon={Lightbulb} title="Get Inspired" text="Real-world projects" tone="lilac" />
          <Feature icon={Cog} title="Step-by-Step" text="Easy to follow guides" tone="green" />
          <Feature icon={Users} title="Build & Share" text="Join the maker community" tone="rose" />
        </div>
      </div>
      <div className="projects-art projects-art-right">
        <div className="project-note-card">Small<br />Projects<br /><strong>Big<br />Learning!</strong></div>
        <div className="project-laptop"><div><span>Build</span><span>Learn</span><span>Innovate</span><span>Repeat</span></div><Laptop2 /></div>
        <div className="project-storage"><span>MAKE<br />SPACE<br />HAPPEN</span></div>
        <div className="project-doodle-right">Build<br />Learn<br />Innovate<br />Repeat</div>
        <ProjectsCar />
      </div>
    </section>
  );
}
