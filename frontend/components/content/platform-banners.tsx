import { BookOpen, Box, Bot, Code2, Cog, Cpu, Lightbulb, Users } from 'lucide-react';

type Icon = typeof BookOpen;

function Feature({ icon: Icon, title, text, tone }: { icon: Icon; title: string; text: string; tone: string }) {
  return (
    <div className="platform-feature">
      <span className={`platform-feature-icon ${tone}`}><Icon /></span>
      <span><strong>{title}</strong><small>{text}</small></span>
    </div>
  );
}

export function LearnHero() {
  return (
    <section className="platform-hero learn-hero">
      <div className="hero-blob hero-blob-left" /><div className="hero-blob hero-blob-right" />
      <div className="hero-copy">
        <p className="hero-kicker">SKILLS TODAY <span>•</span> SMARTER TOMORROW</p>
        <h1>Learn. <em>Build.</em> <b>Create.</b></h1>
        <p className="hero-description">Step-by-step tutorials, hands-on guides and real projects<br />to fuel your curiosity in electronics, robotics, 3D printing and more.</p>
        <div className="platform-features">
          <Feature icon={BookOpen} title="Beginner Friendly" text="Learn at your own pace" tone="feature-mint" />
          <Feature icon={Lightbulb} title="Hands-on Projects" text="From basics to advanced" tone="feature-lilac" />
          <Feature icon={Users} title="Build Your Skills" text="For a smarter future" tone="feature-rose" />
        </div>
      </div>
      <div className="learn-hero-art" aria-hidden="true">
        <div className="hero-doodle learn-doodle">Learn<br />Build<br />Innovate</div>
        <div className="lesson-card">Small<br />Lessons<br /><strong>Big<br />Creations</strong><span>✦</span></div>
        <div className="hero-robot"><div className="robot-antenna" /><div className="robot-head"><div className="robot-face"><i /><i /><b /></div></div><div className="robot-body">Qrobo</div><div className="robot-arm" /></div>
        <div className="category-stack"><span className="category-electronics"><Cpu /> Electronics</span><span className="category-code"><Code2 /> Code</span><span className="category-print"><Box /> 3D Print</span><span className="category-robotics"><Bot /> Robotics</span></div>
        <div className="hero-doodle learn-doodle-bottom">Ideas<br />into Reality</div>
      </div>
    </section>
  );
}

export function ProjectsHero() {
  return (
    <section className="platform-hero projects-hero">
      <div className="hero-blob hero-blob-left" /><div className="hero-blob hero-blob-right" />
      <div className="projects-books" aria-hidden="true"><span>Robotics</span><span>Electronics</span><span>IoT Projects</span><span>3D Printing</span></div>
      <div className="hero-copy projects-copy">
        <h1>Projects</h1>
        <p className="hero-description">Explore student projects and robotics projects with guides<br />and component lists</p>
        <div className="platform-features">
          <Feature icon={Lightbulb} title="Get Inspired" text="Real-world projects" tone="feature-lilac" />
          <Feature icon={Cog} title="Step-by-Step" text="Easy to follow guides" tone="feature-mint" />
          <Feature icon={Users} title="Build & Share" text="Join the maker community" tone="feature-rose" />
        </div>
      </div>
      <div className="projects-hero-art" aria-hidden="true">
        <div className="sticky-note">Small<br />Projects<br /><strong>Big<br />Learning!</strong></div>
        <div className="project-car"><div className="car-sensor"><Cpu /></div><div className="car-body" /><i /><i /></div>
        <div className="laptop-note">Build<br />Learn<br />Innovate<br />Repeat</div>
        <div className="project-box">MAKE<br />SPACE<br />HAPPEN</div>
      </div>
    </section>
  );
}
