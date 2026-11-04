import starter from './seed.json';
export type Entry={id:string;title:string;description:string;venue:string;year:string;url:string;image:string;linkLabel?:string;secondaryUrl?:string;secondaryLabel?:string};
export type NewsEntry={id?:string;title:string;date:string;summary?:string;content?:string;image?:string;url?:string;linkLabel?:string;attachment?:string;attachmentLabel?:string};
export type Timeline={title:string;organization:string;date:string;description?:string};
export type Content={profile:{name:string;role:string;institution:string;bio:string;email:string;portrait:string;logo?:string;cvUrl:string;github:string;linkedin:string;googleScholar?:string};interests:string[];education:Timeline[];experience:Timeline[];news:NewsEntry[];publications:Entry[];talks:Entry[];tutorials:Entry[];projects:Entry[];skills?:Entry[];startups?:Entry[];grants?:Entry[];achievements?:Entry[]};
export const seed:Content=starter;

export function newsId(entry:NewsEntry,index:number){return entry.id||`news-${index+1}`;}
