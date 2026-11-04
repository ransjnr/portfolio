'use client';

import {useEffect, useState} from 'react';
import Navigation from './navigation';
import {newsId,type Content,type Entry,type Timeline} from '@portfolio/content';

const referenceBase = 'https://toufiqmusah.github.io/toufiqmusah/';
const originalAssets = new Set(['assets/headshot.jpeg','assets/notion-face.png','assets/background.webp','assets/icons8-mail-48.png','assets/icons8-github.svg','assets/icons8-linkedin.svg','assets/scholar-image.png','assets/cv-logo.png','assets/kccr.png','assets/rail.png','paper-figures/towards.png','paper-figures/how-brats.png','paper-figures/automated-ischemic.png','paper-figures/large-kernel.png','paper-figures/brats7.png','paper-figures/mirasol.jpeg','paper-figures/indaba-2.jpeg','paper-figures/hitch.gif','paper-figures/intro-torch.gif','paper-figures/end-to-end.png','paper-figures/pie.tiff']);
function asset(url:string){const path=url.replace(referenceBase,'');return url.startsWith(referenceBase)&&originalAssets.has(path)?'/reference/'+path:url;}
function Authors({text,name}:{text:string;name:string}){if(!name)return <>{text}</>;const words=name.trim().split(/\s+/);const abbreviation=words.length>1?`${words[words.length-1]}, ${words[0][0]}.`:name;const escape=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const names=[name,abbreviation];const parts=text.split(new RegExp(`(${names.map(escape).join('|')})`,'g'));return <>{parts.map((part,i)=>names.includes(part)?<strong key={i}>{part}</strong>:<span key={i}>{part}</span>)}</>}

export default function Portfolio({content:c}:{content:Content;unavailable:boolean}) {
  const [expanded,setExpanded]=useState<string|null>(null);
  useEffect(()=>{if(!expanded)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setExpanded(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[expanded]);
  const p=c.profile;
  const initials=p.name.split(/\s+/).filter(Boolean).map(part=>part[0]).slice(0,2).join('');
  const social=[{url:p.email?'mailto:'+p.email:'',icon:'icons8-mail-48.png',label:'Email'},{url:p.github,icon:'icons8-github.svg',label:'GitHub'},{url:p.linkedin,icon:'icons8-linkedin.svg',label:'LinkedIn'},{url:p.googleScholar||'',icon:'scholar-image.png',label:'Google Scholar'},{url:p.cvUrl,icon:'cv-logo.png',label:'CV'}];
  return <>
    <Navigation name={p.name} logo={p.logo} home/>
    <main>
      <section className="hero" id="bio">
        <div className="hero-content">
          <aside className="profile-section">
            <div className="profile-image">{p.portrait?<img src={asset(p.portrait)} alt={p.name}/>:<span className="profile-initials" aria-label={p.name}>{initials}</span>}</div>
            <div className="profile-name">{p.name}</div>
            <div className="profile-title">{p.role}</div>
            <div className="profile-org">{p.institution}</div>
            <div className="social-links">{social.map(s=>s.url?<a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}><img src={'/reference/assets/'+s.icon} alt="" width="30"/></a>:<span key={s.label} className="social-unconfigured" role="img" aria-label={s.label+' — coming soon'} title={s.label+' — coming soon'}><img src={'/reference/assets/'+s.icon} alt="" width="30"/></span>)}</div>
            <div className="news-panel" aria-label="Latest news" style={{backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"}}>
              <div className="news-header"><div className="news-title">News</div></div>
              <div className="news-body"><ul className="news-list">{c.news.map((n,i)=><li key={newsId(n,i)} className="news-item"><a className="news-article-link" href={'/news/'+newsId(n,i)}>{n.title}{n.date&&<>{' '}{n.date}.</>}</a></li>)}</ul></div>
            </div>
          </aside>
          <div className="about-section">
            <h1>About Me</h1>
            <p className="about-text">{p.bio}</p>
            <div className="info-grid">
              <div className="info-section"><h2>Research Interests</h2><ul>{c.interests.map((interest,i)=><li key={i}>{interest}</li>)}</ul></div>
              <div className="info-section"><h2>Education</h2>{c.education.map((education,i)=><div className="education-item" key={i}><h3>{education.title}</h3><small>{education.date}</small><p>{education.organization}</p>{education.description&&<p className="education-description">{education.description}</p>}</div>)}</div>
            </div>
            <div className="info-section"><h2>Experience</h2><div className="experience-list">{c.experience.slice(0,2).map((experience,i)=><Experience key={i} experience={experience}/>)}</div>
              {c.experience.length>2&&<details className="full-experience"><summary>View full research &amp; professional experience</summary><div className="experience-list">{c.experience.map((experience,i)=><Experience key={i} experience={experience} detailed/>)}</div></details>}
            </div>
          </div>
        </div>
      </section>
      <section id="papers"><h2>Selected Publications</h2>{c.publications.map(entry=><article className="paper-item" key={entry.id}>
        <button className={'paper-image'+(entry.image?'':' paper-image-empty')} disabled={!entry.image} aria-label={'Expand figure: '+entry.title} onClick={()=>entry.image&&setExpanded(asset(entry.image))}>{entry.image&&<img src={asset(entry.image)} alt={entry.title}/>}</button>
        <div className="paper-details"><h3>{entry.title}</h3><p><Authors text={entry.description} name={p.name}/>{entry.venue&&<> {entry.venue}</>}</p>{entry.url&&<a href={entry.url} target="_blank" rel="noreferrer">{entry.linkLabel||'[Read more]'}</a>}{entry.secondaryUrl&&<> &nbsp; <a href={entry.secondaryUrl} target="_blank" rel="noreferrer">{entry.secondaryLabel||'[Link]'}</a></>}</div>
      </article>)}</section>
      <section id="talks"><h2>Selected Talks &amp; Tutorials</h2><div className="talks-grid">{(['talks','tutorials'] as const).map(key=><div className="talks-column" key={key}><h3 className="column-title">{key==='talks'?'Talks':'Tutorials & Articles'}</h3>{c[key].map(entry=><Talk key={entry.id} entry={entry}/>)}</div>)}</div></section>
      <section id="projects" className="projects-section" aria-labelledby="projects-title">
        <h2 id="projects-title">Projects</h2>
        {c.projects.length>0?<div className="projects-grid">{c.projects.map(entry=><article className="project-item" key={entry.id}>
          <Thumbnail entry={entry} className="project-image"/>
          <div className="project-details"><h3>{entry.url?<a href={entry.url} target="_blank" rel="noreferrer">{entry.title}</a>:entry.title}</h3>
            {(entry.venue||entry.year)&&<p className="project-meta">{[entry.venue,entry.year].filter(Boolean).join(' • ')}</p>}
            <p className="project-description">{entry.description}</p>
            {(entry.url||entry.secondaryUrl)&&<div className="project-links">{entry.url&&<a href={entry.url} target="_blank" rel="noreferrer">{entry.linkLabel||'View project'}</a>}{entry.secondaryUrl&&<a href={entry.secondaryUrl} target="_blank" rel="noreferrer">{entry.secondaryLabel||'Source code'}</a>}</div>}
          </div>
        </article>)}</div>:<p className="projects-empty">Projects will be added soon.</p>}
      </section>
      {!!c.skills?.length&&<section className="projects-section skills-section" aria-labelledby="skills-title"><h2 id="skills-title">Skills &amp; Tools</h2><div className="skills-content">{c.skills.map(skill=><details className="skill-item skill-disclosure" key={skill.id}><summary><h3>{skill.title}</h3></summary><p>{skill.description}</p></details>)}</div></section>}
    </main>
    {expanded&&<button autoFocus className="lightbox active" aria-label="Close expanded figure" onClick={()=>setExpanded(null)}><img src={expanded} alt="Expanded publication figure"/></button>}
  </>
}
function Thumbnail({entry:e,className}:{entry:Entry;className:string}){const image=e.image?<img src={asset(e.image)} alt={e.title}/>:null;return e.url?<a className={className} href={e.url} target="_blank" rel="noreferrer" aria-label={e.title}>{image}</a>:<div className={className} aria-hidden={!e.image}>{image}</div>}
function Talk({entry:e}:{entry:Entry}){return <article className="talk-item"><Thumbnail entry={e} className="talk-image"/><div className="talk-details"><h3>{e.url?<a href={e.url} target="_blank" rel="noreferrer">{e.title}</a>:e.title}</h3><p>{e.secondaryLabel&&e.secondaryUrl&&e.secondaryLabel!==e.description?<><a href={e.url||undefined} target="_blank" rel="noreferrer">{e.description.split(' • ')[0]}</a> &nbsp;•&nbsp; <a href={e.secondaryUrl} target="_blank" rel="noreferrer">{e.secondaryLabel}</a></>:e.secondaryUrl||e.url?<a href={e.secondaryUrl||e.url} target="_blank" rel="noreferrer">{e.description}</a>:e.description}</p></div></article>}

function Experience({experience:e,detailed=false}:{experience:Timeline;detailed?:boolean}){return <div className="experience-item"><div className="experience-info"><h3>{e.title}</h3><p>{e.organization} • {e.date}</p>{detailed&&e.description&&<p className="experience-description">{e.description}</p>}</div></div>}
