import PortfolioEffects from "./PortfolioEffects";
import ResumeLink from "./ResumeLink";
import { getLatestCv, getProjects } from "../lib/portfolio";

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4l0 -8" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <path d="M16.5 7.5v.01" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 4l11.733 16h4.267l-11.733 -16l-4.267 0" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M8 11v5" />
      <path d="M8 8v.01" />
      <path d="M12 16v-5" />
      <path d="M16 16v-3a2 2 0 1 0 -4 0" />
      <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4l0 -10" />
    </svg>
  );
}

function ProjectCard({ project }) {
  const links = [
    project.source_url ? ["Source", project.source_url] : null,
    project.demo_url ? ["Demo", project.demo_url] : null,
  ].filter(Boolean);
  const target = project.demo_url || project.source_url || "#";
  const tags = Array.isArray(project.tech_stack)
    ? project.tech_stack
    : String(project.tech_stack || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  return (
    <article className="project-card">
      <div className="project-card__box">
        <div className="project-card__content">
          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__brief">{project.description}</p>
          <ul className="project-card__links">
            {links.map(([label, href]) => (
              <li key={`${project.title}-${label}`}>
                <a className="link link--alt" href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <ul className="project-card__tags">
            <li>{tags.join(", ")}</li>
          </ul>
        </div>
        <a href={target} target={target === "#" ? undefined : "_blank"} rel={target === "#" ? undefined : "noreferrer"} aria-label={`Open ${project.title}`}>
          <div className="project-card__go-corner">
            <div className="project-card__go-arrow">→</div>
          </div>
        </a>
      </div>
    </article>
  );
}

export default async function Home() {
  const [projects, cv] = await Promise.all([getProjects(), getLatestCv()]);
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        url: project.demo_url || project.source_url || "https://nihalt.in/",
        programmingLanguage: Array.isArray(project.tech_stack)
          ? project.tech_stack
          : undefined,
      },
    })),
  };

  return (
    <>
      <PortfolioEffects />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <header id="particles-js">
        <p className="display-topright text-size-xlarge">
          <ResumeLink href={cv.fileUrl} />
        </p>
        <div className="header container">
          <p className="header__overline">hi! my name is</p>
          <h1 className="header__title">Nihal T</h1>
          <h2 style={{ display: "none" }}>Nihal</h2>
          <p className="header__subtitle" aria-hidden="true">
            I am <span id="rotateText" className="txt-rotate" data-period="2000" data-rotate='["a developer."]'></span>
          </p>
          <a href="#partAbout">
            <button className="btn-arrow"><span>About Me</span></button>
          </a>
        </div>
        <p className="display-bottomleft text-size-xlarge">
          <a className="link" href="mailto:nihal.chiyoor@gmail.com">Say Hello!</a>
        </p>
        <p className="display-bottomright text-size-xlarge flex flex--mini-social-icons">
          <a aria-label="Check out my Instagram page." href="https://www.instagram.com/_nihaal_t" target="_blank" rel="noreferrer"><InstagramIcon /></a>
          <a aria-label="Check out my Twitter page." href="https://twitter.com/@_nihaal_t" target="_blank" rel="noreferrer"><XIcon /></a>
          <a aria-label="Check out my Github page." href="https://github.com/MrNihalT" target="_blank" rel="noreferrer"><GithubIcon /></a>
          <a aria-label="Check out my Linkedin page." href="https://linkedin.com/in/nihal-t-8863b3293" target="_blank" rel="noreferrer"><LinkedinIcon /></a>
        </p>
      </header>

      <section id="partAbout">
        <div className="container">
          <div className="heading heading--lined">
            <h3>01. Intro</h3>
            <h2>About Me</h2>
          </div>
          <div className="flex flex--about">
            <div>
              <p style={{ maxWidth: "60ch" }}>
                Hi, I&apos;m Nihal T.<br />
                A passionate web developer dedicated to crafting seamless and impactful digital solutions.<br /><br />
                I specialize in building user-friendly websites and mobile applications, turning ideas into reality through clean code and innovative design. I enjoy solving challenges and collaborating with others to create meaningful projects that make a difference.<br /><br />
                Always eager to learn and grow, I&apos;m on the lookout for opportunities to push boundaries and expand my skillset. Let&apos;s create something extraordinary together!
                <br /><br />
                <a href="#partChat" className="link link--alt">Let&apos;s get to work, shall we?</a>
              </p>
              <q id="quote-content" className="text-size-large">
                Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.
              </q>
              <p id="quote-author" className="text-weight-bold">~ Antoine de Saint-Exupery</p>
            </div>
            <div>
              <div className="tagcloud" aria-label="Technology skills"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="partProjects">
        <div className="container">
          <div className="heading heading--lined">
            <h3>02. Development</h3>
            <h2>Things I&apos;ve Built</h2>
          </div>
          <div className="grid grid--projects">
            {projects.map((project) => <ProjectCard key={project.id || project.title} project={project} />)}
          </div>
        </div>
      </section>

      <section id="partChat">
        <div className="container text-align-center">
          <div className="heading">
            <h3>03. Contact</h3>
            <h2>Get In Touch</h2>
          </div>
          <div className="flex flex--contact">
            <p style={{ maxWidth: "70ch" }}>
              Interested in working together? Let&apos;s have a chat. I&apos;d love to collaborate or help out with a project. Whether you have a question or just want to say hi, hit me up!
            </p>
            <a href="mailto:nihal.chiyoor@gmail.com">
              <button className="btn-rounded animabutton btn-left" style={{ minWidth: "12.5rem" }}>
                Say Hello!
              </button>
            </a>
          </div>
        </div>
      </section>
      <hr className="section-divider" />
      <footer id="partFooter">
        <div className="container text-align-center no-margin">
          <p>Handcrafted with love by myself.</p>
          <p>Copyright &copy; Nihal T | 2026</p>
        </div>
      </footer>
    </>
  );
}
