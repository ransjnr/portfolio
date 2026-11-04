import {mkdir,readFile,writeFile,readdir,rename} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {join,extname} from 'node:path';
import sharp from 'sharp';
export const MAX_UPLOAD=20*1024*1024;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export class MediaError extends Error{constructor(status,message){super(message);this.status=status;}}
function cleanName(name){return String(name||'upload').normalize('NFKC').replace(/[\x00-\x1f\x7f/\\<>:"|?*]/g,'-').slice(0,180)||'upload';}
function publicRecord(record){return {...record,url:`/media/${record.id}/${encodeURIComponent(record.name)}`};}
export async function readBody(req,limit=MAX_UPLOAD){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw new MediaError(413,`File exceeds ${Math.round(limit/1024/1024)} MB limit`);chunks.push(chunk);}return Buffer.concat(chunks);}
export function createMediaStore(directory){
 const metadata=async(id)=>{if(!uuid.test(id))throw new MediaError(404,'File not found');try{return JSON.parse(await readFile(join(directory,id+'.json'),'utf8'));}catch(e){if(e.code==='ENOENT')throw new MediaError(404,'File not found');throw e;}};
 async function store(buffer,info){await mkdir(directory,{recursive:true});const id=randomUUID();const record={id,...info,size:buffer.length,createdAt:new Date().toISOString()};await writeFile(join(directory,id+'.bin'),buffer,{flag:'wx'});await writeFile(join(directory,id+'.json'),JSON.stringify(record),{flag:'wx'});return publicRecord(record);}
 return {
  async list(){await mkdir(directory,{recursive:true});const records=await Promise.all((await readdir(directory)).filter(name=>name.endsWith('.json')&&uuid.test(name.slice(0,-5))).map(async name=>publicRecord(JSON.parse(await readFile(join(directory,name),'utf8')))));return records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));},
  async get(id){const record=await metadata(id);return {record:publicRecord(record),buffer:await readFile(join(directory,id+'.bin'))};},
  async upload(buffer,name,mime){if(!buffer.length)throw new MediaError(400,'Choose a file to upload');if(buffer.length>MAX_UPLOAD)throw new MediaError(413,'File exceeds 20 MB limit');name=cleanName(name);mime=String(mime||'').split(';')[0];
   if(mime.startsWith('image/')){let meta;try{meta=await sharp(buffer,{limitInputPixels:40_000_000,animated:true}).metadata();}catch{throw new MediaError(415,'This image cannot be read. Use JPEG, PNG, WebP, GIF, AVIF, or TIFF.');}if(!['jpeg','png','webp','gif','avif','heif','tiff'].includes(meta.format))throw new MediaError(415,'Unsupported image format');
    // Normalize orientation and strip private EXIF/GPS metadata; retain animation for GIF/WebP.
    const animated=(meta.pages||1)>1;let output;try{output=await sharp(buffer,{limitInputPixels:40_000_000,animated}).autoOrient().webp({quality:92}).toBuffer();}catch{throw new MediaError(415,'Unable to process this image');}
    if(output.length>MAX_UPLOAD)throw new MediaError(413,'Processed image exceeds 20 MB limit');const info=await sharp(output,{animated:true}).metadata();return store(output,{name:name.replace(/\.[^.]+$/,'')+'.webp',mime:'image/webp',width:info.width,height:info.pageHeight||info.height,animated,originalName:name});
   }
   const ext=extname(name).toLowerCase();const office={'.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
   if(ext==='.pdf'&&buffer.subarray(0,5).toString()==='%PDF-')mime='application/pdf';
   else if((office[ext]||ext==='.zip')&&buffer[0]===0x50&&buffer[1]===0x4b&&[0x03,0x05,0x07].includes(buffer[2]))mime=office[ext]||'application/zip';
   else if(['.txt','.csv','.md'].includes(ext)&&!buffer.includes(0))mime='text/plain';
   else throw new MediaError(415,'Unsupported file. Upload images, PDF, DOCX, XLSX, PPTX, TXT, CSV, Markdown, or ZIP.');
   return store(buffer,{name,mime});
  },
  async crop(id,area){const {record,buffer}=await this.get(id);if(!record.mime.startsWith('image/'))throw new MediaError(400,'Only images can be cropped');if(record.animated)throw new MediaError(400,'Animated images can be uploaded, but cropping is available for still images only');
   const {x,y,width,height,rotation=0}=area||{};if(![x,y,width,height,rotation].every(Number.isInteger)||x<0||y<0||width<1||height<1||![0,90,180,270].includes(rotation))throw new MediaError(400,'Invalid crop coordinates');
   const rotatedWidth=rotation%180?record.height:record.width,rotatedHeight=rotation%180?record.width:record.height;
   if(x+width>rotatedWidth||y+height>rotatedHeight)throw new MediaError(400,'Crop extends outside the image');
   let output;try{output=await sharp(buffer).rotate(rotation).extract({left:x,top:y,width,height}).webp({quality:92}).toBuffer();}catch{throw new MediaError(400,'Unable to crop this image');}
   return store(output,{name:record.name.replace(/\.[^.]+$/,'')+'-cropped.webp',mime:'image/webp',width,height,animated:false,originalId:record.originalId||record.id});
  },
  async rename(id,name){const record=await metadata(id);if(typeof name!=='string'||!name.trim())throw new MediaError(400,'Enter a file name');const extension=extname(record.name);const stem=cleanName(name.trim()).replace(/\.[^.]+$/,'');const next={...record,name:stem+extension};const temp=join(directory,id+'.'+randomUUID()+'.tmp');await writeFile(temp,JSON.stringify(next));await rename(temp,join(directory,id+'.json'));return publicRecord(next);}
 };
}
