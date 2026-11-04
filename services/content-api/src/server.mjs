import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {timingSafeEqual} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {schema} from './schema.mjs';
import {createMediaStore,readBody,MediaError} from './media.mjs';
const here=dirname(fileURLToPath(import.meta.url));const file=resolve(process.env.DATA_FILE||resolve(here,'../data/content.json'));
const token=process.env.ADMIN_API_TOKEN;if(!token||token.length<32)throw Error('Set ADMIN_API_TOKEN to a random value of at least 32 characters');
const seed=JSON.parse(await readFile(resolve(here,'../../../packages/content/seed.json'),'utf8'));
let state;try{state=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;state={draft:seed,published:seed,updatedAt:null,publishedAt:null};}
const media=createMediaStore(resolve(process.env.MEDIA_DIR||resolve(dirname(file),'media')));
// Add newly introduced page collections without changing existing drafts or published content.
let migrated=false;
for(const snapshot of ['draft','published'])for(const key of ['startups','grants','achievements'])if(state[snapshot][key]===undefined){state[snapshot][key]=structuredClone(seed[key]||[]);migrated=true;}
// Existing news headlines become full articles without overwriting edited fields.
for(const snapshot of ['draft','published'])state[snapshot].news=state[snapshot].news.map((news,index)=>{
 const reference=seed.news.find(item=>item.id===news.id||item.title===news.title);
 const defaults={id:reference?.id||`news-${index+1}`,summary:reference?.summary||'',content:reference?.content||news.title,image:'',url:reference?.url||'',linkLabel:reference?.linkLabel||'',attachment:'',attachmentLabel:''};
 const next={...defaults,...news};
 if(Object.keys(defaults).some(key=>news[key]===undefined))migrated=true;
 return next;
});
for(const snapshot of ['draft','published'])if(state[snapshot].profile.googleScholar===undefined){state[snapshot].profile.googleScholar='';migrated=true;}
if(migrated)await persist(state);
let queue=Promise.resolve();
function authorized(req){const a=Buffer.from(req.headers.authorization||''),b=Buffer.from('Bearer '+token);return a.length===b.length&&timingSafeEqual(a,b);}
const server=createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');const send=(code,data)=>{res.writeHead(code);res.end(JSON.stringify(data));};
try{const path=new URL(req.url,'http://localhost').pathname;
if(req.method==='GET'&&path==='/health')return send(200,{ok:true});
if(req.method==='GET'&&path==='/v1/content')return send(200,state.published);
const publicMedia=path.match(/^\/v1\/media\/([a-f0-9-]{36})\/[^/]+$/);
if((req.method==='GET'||req.method==='HEAD')&&publicMedia){const {record,buffer}=await media.get(publicMedia[1]);res.setHeader('Content-Type',record.mime);res.setHeader('Content-Length',buffer.length);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','public, max-age=31536000, immutable');res.setHeader('Content-Security-Policy',"default-src 'none'; sandbox");res.setHeader('Content-Disposition',(record.mime.startsWith('image/')?'inline':'attachment')+"; filename*=UTF-8''"+encodeURIComponent(record.name));res.writeHead(200);return res.end(req.method==='HEAD'?undefined:buffer);}
if(!authorized(req))return send(401,{error:'Unauthorized'});
if(path==='/v1/admin/media'&&req.method==='GET')return send(200,await media.list());
if(path==='/v1/admin/media'&&req.method==='POST'){let name;try{name=decodeURIComponent(req.headers['x-file-name']||'upload');}catch{throw new MediaError(400,'Invalid file name');}return send(201,await media.upload(await readBody(req),name,req.headers['content-type']));}
const mediaAction=path.match(/^\/v1\/admin\/media\/([a-f0-9-]{36})(\/crop)?$/);
if(mediaAction&&((req.method==='POST'&&mediaAction[2])||(req.method==='PATCH'&&!mediaAction[2]))){const data=JSON.parse((await readBody(req,16384)).toString());return send(mediaAction[2]?201:200,mediaAction[2]?await media.crop(mediaAction[1],data):await media.rename(mediaAction[1],data.name));}
if(req.method==='GET'&&path==='/v1/admin/content')return send(200,state);
if(req.method==='PUT'&&path==='/v1/admin/content'){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>1048576)return send(413,{error:'Content is too large'});}const result=schema.safeParse(JSON.parse(raw));if(!result.success)return send(400,{error:'Invalid content',details:result.error.flatten()});
queue=queue.catch(()=>{}).then(async()=>{const next={...state,draft:result.data,updatedAt:new Date().toISOString()};await persist(next);state=next;});await queue;return send(200,state);}
if(req.method==='POST'&&path==='/v1/admin/publish'){queue=queue.catch(()=>{}).then(async()=>{const next={...state,published:structuredClone(state.draft),publishedAt:new Date().toISOString()};await persist(next);state=next;});await queue;return send(200,state);}
return send(404,{error:'Not found'});}catch(e){console.error(e.message);return send(e instanceof MediaError?e.status:e instanceof SyntaxError?400:500,{error:e instanceof MediaError?e.message:e instanceof SyntaxError?'Invalid JSON':'Unable to process request'});}
});
server.listen(Number(process.env.PORT||4000),'0.0.0.0',()=>console.log('Content API listening on port '+server.address().port));
async function persist(value){await mkdir(dirname(file),{recursive:true});await writeFile(file+'.tmp',JSON.stringify(value,null,2));await rename(file+'.tmp',file);}
