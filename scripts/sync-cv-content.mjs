// Fill missing CV-derived entries without overwriting existing edits or media.
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {resolve} from 'node:path';
const seed=JSON.parse(await readFile('packages/content/seed.json','utf8'));
const env=Object.fromEntries((await readFile('services/content-api/.env','utf8')).split('\n').filter(line=>line&&!line.startsWith('#')).map(line=>line.split(/=(.*)/s).slice(0,2)));
const base=process.env.CONTENT_API_URL||`http://localhost:${env.PORT||4000}`;
const headers={Authorization:`Bearer ${env.ADMIN_API_TOKEN}`,'Content-Type':'application/json'};
const response=await fetch(base+'/v1/admin/content',{headers});if(!response.ok)throw Error('Cannot read CMS content');const state=await response.json();const draft=structuredClone(state.draft);let added=0;
for(const [key,value] of Object.entries(seed.profile))if(draft.profile[key]===undefined){draft.profile[key]=value;added++;}
function matches(a,b){if(typeof a==='string'||typeof b==='string')return a===b;return (a.id&&b.id&&a.id===b.id)||(a.title===b.title&&(!a.organization||!b.organization||a.organization===b.organization));}
const summary=[];
for(const [key,expected] of Object.entries(seed)){if(!Array.isArray(expected))continue;if(!Array.isArray(draft[key]))draft[key]=[];let count=0;for(const entry of expected){const existing=draft[key].find(item=>matches(item,entry));if(existing===undefined){draft[key].push(structuredClone(entry));count++;added++;}}
 summary.push({section:key,cv:expected.length,cmsDraft:draft[key].length,published:state.published[key]?.length||0,added:count});}
if(added){await mkdir('services/content-api/data',{recursive:true});await writeFile(resolve('services/content-api/data',`before-cv-sync-${Date.now()}.json`),JSON.stringify(state,null,2));const saved=await fetch(base+'/v1/admin/content',{method:'PUT',headers,body:JSON.stringify(draft)});if(!saved.ok)throw Error('Unable to populate CMS: '+await saved.text());if(JSON.stringify(state.draft)===JSON.stringify(state.published)){const published=await fetch(base+'/v1/admin/publish',{method:'POST',headers});if(!published.ok)throw Error('Unable to publish added CV entries');}else console.log('Filled missing draft entries; retained your separate unpublished changes.');}
console.table(summary);console.log(added?`Filled ${added} missing CV entries/fields.`:'Verified: all CV-derived website content is already present in the saved CMS.');
