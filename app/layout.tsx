import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Trabalhe conosco | ASSISTEC',description:'Cadastre seu interesse em oportunidades para mecânico e borracheiro de pesados na ASSISTEC.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
