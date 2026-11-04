import type {Metadata} from 'next';
import Portfolio from './portfolio';
import {getContent} from './get-content';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const {content}=await getContent();return {title:content.profile.name,description:content.profile.bio};}
export default async function Page(){const {content,unavailable}=await getContent();return <Portfolio content={content} unavailable={unavailable}/>}
