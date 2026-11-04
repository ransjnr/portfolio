import {createHmac,timingSafeEqual} from 'node:crypto';import {cookies} from 'next/headers';
export function session(){const secret=process.env.CMS_SESSION_SECRET;if(!secret||secret.length<32)throw Error('Configure CMS_SESSION_SECRET (32+ characters)');return secret;}
export function sign(value:string){return createHmac('sha256',session()).update(value).digest('hex');}
export async function authenticated(){const value=(await cookies()).get('cms_session')?.value;if(!value)return false;const [expiry,sig]=value.split('.');if(!expiry||!sig||Number(expiry)<Date.now())return false;const a=Buffer.from(sig),b=Buffer.from(sign(expiry));return a.length===b.length&&timingSafeEqual(a,b);}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
