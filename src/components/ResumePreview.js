const CONTACT_ICONS = {
  mail: (
    <>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  map: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
};

function ContactIcon({ name, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {CONTACT_ICONS[name]}
    </svg>
  );
}

const filled = (item) =>
  Object.values(item).some((v) => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v)));

function SectionTitle({ children }) {
  return <h3 className="r-block-title">{children}</h3>;
}

function DateRange({ start, end }) {
  if (!start && !end) return null;
  return (
    <span className="r-date">
      {start}
      {start && end ? ' \u2013 ' : ''}
      {end}
    </span>
  );
}

function ExperienceEntry({ item }) {
  return (
    <div className="r-exp">
      <div className="r-exp-head">
        <div className="r-exp-title">
          <h4>{item.role || 'Job Title'}</h4>
          <span className="r-org">
            {item.company}
            {item.location ? ` \u00b7 ${item.location}` : ''}
          </span>
        </div>
        <DateRange start={item.start} end={item.end} />
      </div>
      {item.description.trim().length > 0 && <p className="r-desc">{item.description}</p>}
    </div>
  );
}

function EducationEntry({ item }) {
  return (
    <div className="r-exp">
      <div className="r-exp-head">
        <div className="r-exp-title">
          <h4>
            {item.degree && item.field
              ? `${item.degree}, ${item.field}`
              : item.degree || item.field || 'Degree'}
          </h4>
          {item.school && <span className="r-org">{item.school}</span>}
        </div>
        <DateRange start={item.start} end={item.end} />
      </div>
      {item.description.trim().length > 0 && <p className="r-desc">{item.description}</p>}
    </div>
  );
}

export default function ResumePreview({ data, layout = 'classic' }) {
  const { personal, summary, experience, education, skills, languages } = data;

  const contactItems = [
    { icon: 'mail', label: personal.email },
    { icon: 'phone', label: personal.phone },
    { icon: 'map', label: personal.location },
    { icon: 'globe', label: personal.website },
  ].filter((c) => c.label);

  const hasExperience = experience.some(filled);
  const hasEducation = education.some(filled);
  const visibleSkills = skills.filter(filled);
  const visibleLanguages = languages.filter(filled);

  const name = personal.name || 'Your Name';
  const role = personal.title || 'Job Title';

  const summaryBlock =
    summary.trim().length > 0 && (
      <section className="r-block">
        <SectionTitle>Professional Summary</SectionTitle>
        <p className={layout === 'minimal' ? 'minimal-summary' : 'r-summary'}>{summary}</p>
      </section>
    );

  const experienceBlock =
    hasExperience && (
      <section className="r-block">
        <SectionTitle>Work Experience</SectionTitle>
        {experience.filter(filled).map((item) => (
          <ExperienceEntry key={item.id} item={item} />
        ))}
      </section>
    );

  const educationBlock =
    hasEducation && (
      <section className="r-block">
        <SectionTitle>Education</SectionTitle>
        {education.filter(filled).map((item) => (
          <EducationEntry key={item.id} item={item} />
        ))}
      </section>
    );

  const skillsBlock =
    visibleSkills.length > 0 && (
      <section className="r-block">
        <SectionTitle>Skills</SectionTitle>
        {layout === 'minimal'
          ? visibleSkills.map((s) => (
              <span className="minimal-skill" key={s.id}>
                {s.name}
              </span>
            ))
          : visibleSkills.map((s) => (
              <div className="skill-row-p" key={s.id}>
                <span className="skill-name">{s.name}</span>
                <div className="skill-track">
                  <div className="skill-fill" style={{ width: `${s.level}%` }} />
                </div>
              </div>
            ))}
      </section>
    );

  const languagesBlock =
    visibleLanguages.length > 0 && (
      <section className="r-block">
        <SectionTitle>Languages</SectionTitle>
        {visibleLanguages.map((l) => (
          <span className="chip-p" key={l.id}>
            {l.name}
          </span>
        ))}
      </section>
    );

  const header = (
    <div className="resume-head">
      <h2 className="resume-name">{name}</h2>
      <p className="resume-role">{role}</p>
    </div>
  );

  const sideContact =
    contactItems.length > 0 && (
      <div className="sidebar-block">
        <h4 className="sidebar-title">Contact</h4>
        {contactItems.map((c) => (
          <div className="contact-item" key={c.label}>
            <ContactIcon name={c.icon} />
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    );

  const sideSkills =
    visibleSkills.length > 0 && (
      <div className="sidebar-block">
        <h4 className="sidebar-title">Skills</h4>
        {visibleSkills.map((s) => (
          <div className="skill-row-p" key={s.id}>
            <span className="skill-name">{s.name}</span>
            <div className="skill-track">
              <div className="skill-fill" style={{ width: `${s.level}%` }} />
            </div>
          </div>
        ))}
      </div>
    );

  const sideLanguages =
    visibleLanguages.length > 0 && (
      <div className="sidebar-block">
        <h4 className="sidebar-title">Languages</h4>
        {visibleLanguages.map((l) => (
          <span className="chip-p" key={l.id}>
            {l.name}
          </span>
        ))}
      </div>
    );

  if (layout === 'modern') {
    return (
      <div className="resume resume-modern">
        <header className="resume-banner">
          <h2 className="resume-name">{name}</h2>
          <p className="resume-role">{role}</p>
          {contactItems.length > 0 && (
            <div className="banner-contact">
              {contactItems.map((c) => (
                <div className="contact-item" key={c.label}>
                  <ContactIcon name={c.icon} />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          )}
        </header>
        <div className="modern-body">
          <main className="modern-main">
            {summaryBlock}
            {experienceBlock}
          </main>
          <aside className="modern-aside">
            {skillsBlock}
            {educationBlock}
            {languagesBlock}
          </aside>
        </div>
      </div>
    );
  }

  if (layout === 'minimal') {
    return (
      <div className="resume resume-minimal">
        <div className="minimal-head">
          <h2 className="resume-name">{name}</h2>
          <p className="resume-role">{role}</p>
        </div>
        {contactItems.length > 0 && (
          <div className="minimal-contact">
            {contactItems.map((c) => (
              <span key={c.label}>{c.label}</span>
            ))}
          </div>
        )}
        <main className="minimal-main">
          {summaryBlock}
          {skillsBlock}
          {experienceBlock}
          {educationBlock}
          {languagesBlock}
        </main>
      </div>
    );
  }

  const isRight = layout === 'sidebar-right';
  const sidebar = (
    <aside className="resume-sidebar">
      {header}
      {sideContact}
      {sideSkills}
      {sideLanguages}
    </aside>
  );
  const main = (
    <main className="resume-main">
      {summaryBlock}
      {experienceBlock}
      {educationBlock}
    </main>
  );

  return (
    <div className={`resume${isRight ? ' resume-sidebar-right' : ' resume-classic'}`}>
      {isRight ? (
        <>
          {main}
          {sidebar}
        </>
      ) : (
        <>
          {sidebar}
          {main}
        </>
      )}
    </div>
  );
}
