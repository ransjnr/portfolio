import {authenticated} from './auth';import Studio from './studio';
export const dynamic='force-dynamic';export default async function Page(){let signedIn=false;try{signedIn=await authenticated()}catch{}return <Studio signedIn={signedIn}/>}
