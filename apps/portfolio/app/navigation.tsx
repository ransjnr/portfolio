'use client';
import {useEffect,useRef,useState} from 'react';
export default function Navigation({name,logo,home=false}:{name:string;logo?:string;home?:boolean}){
  const [dark,setDark]=useState(false);
  const [open,setOpen]=useState(false);
  const menuButton=useRef<HTMLButtonElement>(null);
  const navigation=useRef<HTMLElement>(null);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);menuButton.current?.focus();}};const outside=(event:PointerEvent)=>{if(!navigation.current?.contains(event.target as Node))setOpen(false)};document.addEventListener('keydown',close);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',outside)}},[open]);
  useEffect(()=>setDark(localStorage.getItem('portfolio-theme')==='dark'),[]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark]);
  const initials=name.split(/\s+/).filter(Boolean).map(part=>part[0]).slice(0,2).join('');
  return <nav ref={navigation} aria-label="Main navigation"><a className="logo" href={home?'#bio':'/#bio'}>{logo?<img className="navigation-logo" src={logo} alt=""/>:<span className="logo-initials" aria-hidden="true">{initials}</span>}{name}</a><button ref={menuButton} className="mobile-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="navigation-links" onClick={()=>setOpen(!open)}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{open?<path d="m6 6 12 12M6 18 18 6"/>:<path d="M3 6h18M3 12h18M3 18h18"/>}</svg></button><ul id="navigation-links" className={'nav-links'+(open?' mobile-open':'')} onClick={event=>{if((event.target as Element).closest('a'))setOpen(false)}}>
    {[['Bio','bio'],['Papers','papers'],['Talks','talks'],['Projects','projects']].map(([label,id])=><li key={id}><a href={(home?'#':'/#')+id}>{label}</a></li>)}
    <li><a href="/entrepreneurship">Entrepreneurship</a></li>
    <li><a href="https://ngotgiants.buildscitech.com" target="_blank" rel="noreferrer">CSR</a></li>
    <li><button className="theme-toggle" aria-label="Toggle dark mode" onClick={()=>{localStorage.setItem('portfolio-theme',dark?'light':'dark');setDark(!dark)}}><svg viewBox="0 0 24 24" aria-hidden="true">{dark?<><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>:<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}</svg></button></li>
  </ul></nav>
}
