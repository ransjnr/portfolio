import {cache} from 'react';
import {seed,type Content} from '@portfolio/content';
export const getContent=cache(async()=>{let content:Content=seed;let unavailable=false;try{const response=await fetch(`${process.env.CONTENT_API_URL||'http://localhost:4000'}/v1/content`,{cache:'no-store',signal:AbortSignal.timeout(4000)});if(!response.ok)throw Error('API unavailable');content=await response.json();}catch{unavailable=true;}return {content,unavailable};});
