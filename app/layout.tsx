import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";


const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "IPL StatWar | The Digital Arena",
  description: "Step into the digital arena. Outsmart your rivals with tactical precision, live stats, and absolute cricket dominance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-surface-container-lowest text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container`}>
        <ClerkProvider
          appearance={{
            variables: {
              colorText: '#0f172a',
              colorTextSecondary: '#475569',
              colorPrimary: '#000000',
              colorBackground: 'rgba(255, 255, 255, 0.85)',
              colorInputBackground: 'rgba(255, 255, 255, 0.4)',
              colorInputText: '#000000',
              borderRadius: '24px',
              fontFamily: 'inherit',
            },
            elements: {
              card: "bg-white/85 backdrop-blur-3xl border border-white/40 shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-[32px] p-10 mt-8 mb-8",
              navbar: "hidden",
              footer: "hidden",
              formButtonPrimary: "bg-[#1e1e1e] hover:bg-black transition-all rounded-full h-12 text-base font-bold uppercase tracking-wider",
              formFieldInput: "rounded-xl bg-white/30 border border-black/10 transition-all focus:border-black/30 h-11",
              headerTitle: "text-[#1e1e1e] font-black text-3xl italic tracking-tighter uppercase",
              headerSubtitle: "text-[#64748b] font-medium opacity-80",
              dividerLine: "bg-black/10",
              dividerText: "text-black/30 font-bold uppercase text-[10px] tracking-widest",
              socialButtonsBlockButton: "rounded-2xl border border-black/10 bg-white/20 hover:bg-white/40 transition-all h-12",
              socialButtonsBlockButtonText: "hidden",
              socialButtonsBlockButtonArrow: "hidden",
              identityPreviewText: "text-black font-bold",
              userButtonPopoverCard: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl",
              userPreviewMainIdentifier: "text-black font-bold",
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
