import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";


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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script
          id="strip-extension-dom-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const shouldStrip = (name) =>
                  name === "bis_skin_checked" ||
                  name === "bis_register" ||
                  name.startsWith("__processed_");

                const scrub = (root) => {
                  const scope = root && root.querySelectorAll ? root : document;
                  const elements = scope.querySelectorAll ? scope.querySelectorAll("*") : [];

                  for (const el of elements) {
                    const attrs = Array.from(el.attributes || []);
                    for (const attr of attrs) {
                      if (shouldStrip(attr.name)) {
                        el.removeAttribute(attr.name);
                      }
                    }
                  }
                };

                scrub(document);
              })();
            `,
          }}
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} bg-surface-container-lowest text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container`}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            {children}
          </div>
          <footer className="py-8 bg-[#0e0e13] border-t border-outline-variant/10 text-center relative z-40 mb-20 md:mb-0">
            <div className="container mx-auto px-6">
              <p className="font-headline text-[10px] uppercase tracking-[0.4em] text-secondary opacity-40">
                Tactical Simulation Unit v4.02 // Made by Reyansh Varshney
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
