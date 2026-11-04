import type {Metadata} from 'next';
import '@portfolio/ui/styles.css';import './styles.css';
export const metadata:Metadata={title:'Ransford Oppong',description:'Biomedical engineering, medical imaging, embedded AI, and software engineering.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}
