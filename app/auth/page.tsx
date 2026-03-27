"use client";
import { useState } from "react";
import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";


export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <div className="bg-[#0A0A0F] text-on-surface font-body min-h-screen flex flex-col items-center justify-center selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      {/* Background Texture */}
      <div className="fixed inset-0 pitch-grid pointer-events-none" />
      {/* High-Visibility Halo for Glassmorphism */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 blur-[150px] rounded-full pointer-events-none z-0" />


      {/* Side Beams */}
      <div className="fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary-container/20 to-transparent" />
      <div className="fixed right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      {/* Watermark */}
      <div className="fixed bottom-10 right-10 opacity-5 pointer-events-none select-none">
        <h2 className="font-headline text-[12rem] font-black italic text-white leading-none">07</h2>
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-6 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <Link href="/">
            <h1 className="font-headline text-4xl font-black italic tracking-tighter text-primary-container mb-2 uppercase">
              IPL StatWar
            </h1>
          </Link>
          <p className="font-label text-secondary text-xs tracking-[0.2em] uppercase opacity-70">
            The Digital Arena Awaits
          </p>
        </header>

        {/* Auth Module */}
        <div className="bg-transparent p-0 relative">

          {/* Top Right Accent */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-container" />

          <div className="space-y-8">
            {/* Tab Toggle */}
            <div className="flex border-b border-black/5 mb-10">

              <button
                onClick={() => setTab("login")}
                className={`flex-1 py-3 font-headline font-bold text-sm uppercase transition-colors ${
                  tab === "login"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant opacity-50 hover:opacity-100"
                }`}
              >
                Enter Stadium
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`flex-1 py-3 font-headline font-bold text-sm uppercase transition-colors ${
                  tab === "signup"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant opacity-50 hover:opacity-100"
                }`}
              >
                Draft Profile
              </button>
            </div>

            <div className="flex justify-center w-full">
              {tab === "login" ? (
                <SignIn fallbackRedirectUrl="/dashboard" routing="hash" />
              ) : (
                <SignUp fallbackRedirectUrl="/dashboard" routing="hash" />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-col items-center gap-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
              <span className="font-label text-[10px] text-outline uppercase">Server: Mumbai_01_Live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs text-secondary">verified_user</span>
              <span className="font-label text-[10px] text-outline uppercase">SSL Secure Link</span>
            </div>
          </div>
          <p className="text-[9px] font-label text-outline opacity-40 uppercase tracking-[0.3em] text-center leading-relaxed">
            By entering the arena you agree to the tactical engagement terms and privacy protocols of the IPL StatWar ecosystem.
          </p>
        </footer>
      </main>
    </div>
  );
}
