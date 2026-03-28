import Link from "next/link";
import { auth0 } from "@/lib/auth0";

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getErrorBanner(errorCode?: string) {
  switch (errorCode) {
    case "blocked":
      return {
        title: "Access Blocked",
        description:
          "This account has been blocked and cannot sign in. Contact support if you believe this is a mistake.",
        className: "border-error bg-error/10 text-error",
      };
    case "session_expired":
      return {
        title: "Session Expired",
        description: "Your login session expired. Please try signing in again.",
        className: "border-secondary bg-secondary/10 text-secondary",
      };
    case "auth_failed":
      return {
        title: "Authentication Failed",
        description: "Sign in could not be completed. Please retry.",
        className: "border-secondary bg-secondary/10 text-secondary",
      };
    default:
      return null;
  }
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const session = await auth0.getSession();
  const params = searchParams ? await searchParams : {};
  const rawError = params.error;
  const errorCode = Array.isArray(rawError) ? rawError[0] : rawError;
  const errorBanner = getErrorBanner(errorCode);

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

        {errorBanner && (
          <section className={`mb-8 border px-4 py-4 ${errorBanner.className}`}>
            <p className="font-headline text-sm font-black uppercase tracking-wider">{errorBanner.title}</p>
            <p className="mt-1 font-label text-xs uppercase tracking-wide opacity-90">{errorBanner.description}</p>
          </section>
        )}

        {/* Auth Module */}
        <div className="bg-transparent p-0 relative">

          {/* Top Right Accent */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-container" />

          <div className="space-y-8">
            <div className="flex border-b border-black/5 mb-10">
              <span className="flex-1 py-3 font-headline font-bold text-sm uppercase text-primary border-b-2 border-primary text-center">
                Auth0 Universal Login
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full text-center py-4 font-headline font-black uppercase tracking-wider bg-primary-container text-on-primary-container"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/auth/logout"
                    className="w-full text-center py-4 font-headline font-black uppercase tracking-wider border border-outline-variant text-on-surface"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="w-full text-center py-4 font-headline font-black uppercase tracking-wider bg-primary-container text-on-primary-container"
                  >
                    Enter Stadium
                  </Link>
                  <Link
                    href="/auth/login?screen_hint=signup"
                    className="w-full text-center py-4 font-headline font-black uppercase tracking-wider border border-outline-variant text-on-surface"
                  >
                    Draft Profile
                  </Link>
                </>
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
