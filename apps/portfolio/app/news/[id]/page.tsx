import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {newsId} from '@portfolio/content';
import Navigation from '../../navigation';
import {getContent} from '../../get-content';
export const dynamic='force-dynamic';
type Props={params:Promise<{id:string}>};
async function article(id:string){const {content}=await getContent();const news=content.news.find((n,i)=>newsId(n,i)===id);if(!news)notFound();return {content,news};}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {id}=await params;const {content,news}=await article(id);return {title:`${news.summary||news.title} — ${content.profile.name}`,description:news.summary||news.title};}
export default async function NewsPage({params}:Props){const {id}=await params;const {content:c,news:n}=await article(id);return <><Navigation name={c.profile.name} logo={c.profile.logo}/><main className="news-article-page"><a className="news-back" href="/#bio">← Back to news</a><article><h1>{n.summary||n.title}</h1>{n.date&&<time className="news-date">{n.date}</time>}{n.summary&&n.summary!==n.title&&<p className="news-summary">{n.title}</p>}{n.image&&<img className="news-cover" src={n.image} alt={n.summary||n.title}/>}<div className="news-article-body">{(n.content||n.title).split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>{(n.url||n.attachment)&&<div className="news-article-links">{n.url&&<a href={n.url} target="_blank" rel="noreferrer">{n.linkLabel||'Read more'}</a>}{n.attachment&&<a href={n.attachment} target="_blank" rel="noreferrer">{n.attachmentLabel||'Download attachment'}</a>}</div>}</article>{c.news.length>1&&<aside className="news-related"><h2>More news</h2><ul>{c.news.map((news,index)=>({news,id:newsId(news,index)})).filter(item=>item.id!==id).slice(0,3).map(item=><li key={item.id}><a href={'/news/'+item.id}>{item.news.summary||item.news.title}</a></li>)}</ul></aside>}</main></>}
