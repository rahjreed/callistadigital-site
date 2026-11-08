import React, { useLayoutEffect } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Braces, Camera, Gamepad2, Globe2,
  House, Layers3, Mail, MonitorSmartphone, Radio, Workflow,
} from 'lucide-react';
import { email, projects, tools } from './site.js';

const navigation = [
  ['Home', '/'],
  ['Services', '/#services'],
  ['Our Work', '/#work'],
  ['Creator Tools', '/tools'],
  ['About', '/#about'],
  ['Contact', '/#contact'],
];

const services = [
  [Globe2, 'Websites & landing pages', 'Make a strong first impression, explain your offer clearly, and give visitors a clear next step on any screen.'],
  [MonitorSmartphone, 'Custom apps & portals', 'Give customers a place to get things done and your team a better way to manage the work behind it.'],
  [Layers3, 'Progressive web apps', 'Give repeat visitors an app-like experience they can open in a browser and install on supported devices.'],
  [Workflow, 'Lead capture & integrations', 'Connect inquiry forms to the tools your team already uses so new leads reach the right people.'],
  [Gamepad2, 'Games, quizzes & learning', 'Help people learn, practice, and remember through interactive experiences they can play in a browser.'],
  [Braces, 'Creator tools & utilities', 'Turn repetitive tasks into focused browser tools that make everyday work easier.'],
];

function Brand() {
  return <a className="brand" href="/">
    <img src="/favicon.png" width="39" height="39" alt="" />
    <span>Callista Digital</span>
  </a>;
}

function Header({ toolsPage }) {
  return <header className="header">
    <div className="shell header-inner">
      <Brand />
      <nav aria-label="Main navigation">
        {navigation.map(([label, url]) => (
          <a key={label} href={url} aria-current={url === (toolsPage ? '/tools' : '/') ? 'page' : undefined}>{label}</a>
        ))}
      </nav>
    </div>
  </header>;
}

function Footer() {
  return <footer className="footer">
    <div className="shell footer-inner">
      <Brand />
      <p>Independent web & software studio</p>
      <a href={'mailto:' + email}>{email}</a>
    </div>
  </footer>;
}

function ToolsGrid() {
  return <div className="tools-grid">
    {tools.map(({ name, description, url, icon: Icon }) => (
      <article className="tool-card" key={name}>
        <div className="tool-top">
          <span className="tool-icon"><Icon aria-hidden="true" size={23} /></span>
          <span className={'status' + (url ? ' available' : '')}>{url ? 'Available Now' : 'Coming Soon'}</span>
        </div>
        <h2 className="tool-title">{name}</h2>
        <p>{description}</p>
        {url && <a className="text-link" href={url}>Launch Tool <ArrowUpRight aria-hidden="true" size={18} /></a>}
      </article>
    ))}
  </div>;
}

function ProjectCard({ project }) {
  const { name, category, description, url, action, artwork, image } = project;
  return <article className="project-card">
    <div className={'project-art ' + artwork} aria-hidden="true">
      {image && <img src={image} alt="" />}
      {artwork === 'close' && <House size={80} strokeWidth={1} />}
      {artwork === 'roger' && <Radio size={80} strokeWidth={1} />}
    </div>
    <div className="project-copy">
      <p className="eyebrow">{category}</p>
      <h3>{name}</h3>
      <p>{description}</p>
      <a className="text-link" href={url}>{action} <ArrowUpRight aria-hidden="true" size={18} /></a>
    </div>
  </article>;
}

function Home() {
  return <>
    <section className="hero">
      <div className="hero-art" aria-hidden="true" />
      <div className="shell hero-copy">
        <p className="eyebrow"><span className="signal" /> Independent web & software studio</p>
        <h1>Websites, Apps &amp; Digital Tools That <em>Move Business Forward.</em></h1>
        <p className="lede">We build modern websites, custom applications, and practical digital solutions that help businesses grow, connect with customers, and work smarter.</p>
        <div className="actions">
          <a className="button primary" href="#contact">Start Your Project <ArrowRight aria-hidden="true" size={19} /></a>
          <a className="button secondary" href="#work">Explore Our Work <ArrowDown aria-hidden="true" size={18} /></a>
        </div>
      </div>
    </section>

    <section className="band" id="services" aria-labelledby="services-title">
      <div className="shell section">
        <p className="eyebrow">01 / Services</p>
        <h2 id="services-title">What we build</h2>
        <p className="intro">From a first impression on the web to the software your customers use every day.</p>
        <div className="service-grid">
          {services.map(([Icon, title, description]) => <article className="service-card" key={title}>
            <Icon aria-hidden="true" size={24} />
            <h3>{title}</h3>
            <p>{description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="shell section" id="work" aria-labelledby="work-title">
      <p className="eyebrow">02 / Portfolio</p>
      <h2 id="work-title">Selected work</h2>
      <p className="intro">Explore live examples of the sites, apps, and interactive experiences we build.</p>
      <div className="project-grid">{projects.map(project => <ProjectCard key={project.name} project={project} />)}</div>
    </section>

    <section className="band" aria-labelledby="creator-title">
      <div className="shell section split">
        <div>
          <p className="eyebrow">03 / Creator tools</p>
          <h2 id="creator-title">Useful tools for everyday work</h2>
          <p className="intro">Try our free video teleprompter and see what’s in development.</p>
          <a className="text-link" href="/tools">Browse Creator Tools <ArrowRight aria-hidden="true" size={18} /></a>
        </div>
        <div className="tool-teaser">
          <Camera aria-hidden="true" size={32} />
          <span className="status available">Available Now</span>
          <h3>Mr. Prompterson</h3>
          <p>A free online teleprompter for video creators.</p>
        </div>
      </div>
    </section>

    <section className="shell section split" id="about" aria-labelledby="about-title">
      <div>
        <p className="eyebrow">04 / About</p>
        <h2 id="about-title">About Callista Digital</h2>
      </div>
      <div className="about-copy">
        <p>Callista Digital is an independent web and software studio. We build for businesses that need a better way to reach customers, deliver a service, or run a process.</p>
        <p>We start with who will use the product and what they need to do. Those answers guide the design, the technology, and what goes into the first release.</p>
      </div>
    </section>

    <section className="band" id="contact" aria-labelledby="contact-title">
      <div className="shell section contact">
        <p className="eyebrow">05 / Contact</p>
        <h2 id="contact-title">Tell us about your project</h2>
        <p className="intro">Share what you’re building, who it’s for, and what you’d like it to accomplish.</p>
        <a className="button primary" href={'mailto:' + email + '?subject=Callista%20Digital%20project%20inquiry'}>
          <Mail aria-hidden="true" size={19} /> {email}
        </a>
      </div>
    </section>
  </>;
}

function CreatorTools() {
  return <section className="tools-page" aria-labelledby="tools-title">
    <div className="shell section">
      <p className="eyebrow"><span className="signal" /> Callista Digital / Utilities</p>
      <h1 id="tools-title">Creator Tools</h1>
      <p className="lede">Browser-based utilities for creators and small teams. Explore what’s available and what we’re building next.</p>
      <ToolsGrid />
    </div>
  </section>;
}

export default function App({ toolsPage }) {
  useLayoutEffect(() => {
    // Cross-page fragment links can arrive before React mounts their targets.
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView();
  }, []);

  return <>
    <a className="skip" href="#main">Skip to content</a>
    <Header toolsPage={toolsPage} />
    <main id="main" tabIndex={-1}>{toolsPage ? <CreatorTools /> : <Home />}</main>
    <Footer />
  </>;
}
