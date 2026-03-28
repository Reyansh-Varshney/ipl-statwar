# 🏏 IPL StatWar - Live Tactical Simulation Unit

![IPL StatWar Engine](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)
![AI Models](https://img.shields.io/badge/AI-Gemini%20%7C%20Groq%20%7C%20OpenRouter-orange)

**IPL StatWar** is a cutting-edge real-time multiplayer cricket trivia and statistics battleground. Step into the digital arena, challenge your tactical IQ, and outsmart rivals with millisecond-perfect sports data. 

Engineered with an intelligent **AI Routing System**, it automatically falls back between top-tier AI providers (Google Gemini with Google Search Grounding → Groq → OpenRouter → Cloudflare) to ensure ultra-low latency and highly accurate IPL questions dynamically generated on the fly. 

**Powered By:** Next.js 16 (Turbopack), Supabase, Auth0, and an ultra-resilient Multi-AI framework.  
**Created by**: Reyansh Varshney

---

## ⚡ Features

- **Tactical Arenas**: Create private war rooms with adjustable intensity (Easy to Extreme) and payload volumes (5 to 20 questions).
- **Multi-Provider AI Engine**: Grounded, verifiable IPL questions delivered with 100% uptime via cascading AI fallback priority (Gemini 2.5 Flash → Llama 3.3).
- **Anti-Cheat Validation**: Strict schema and answer validation ensuring zero hallucinations, zero ambiguous ties, and no leaked answers in options.
- **Dynamic Leaderboards**: Global and room-based score tracking (Upcoming natively).
- **Secure Network**: Robust user authentication via Auth0.

---

## 🚀 Quick Start (Local Deployment)

### Prerequisites
- Node.js `v20.x` or higher
- `npm` or `pnpm`

### 1. Clone the Repository
```bash
git clone <your-repo-link>
cd ipl-statwar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory. You will need keys for Auth, Database, and at least one AI provider.

```env
# ==========================================
# 🔐 AUTH0 & DATABASE (REQUIRED)
# ==========================================
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=iplstatwars.jp.auth0.com
AUTH0_CLIENT_ID=ST274GDBGfj2kbieuu9l8J3hcGxFksF2
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_SECRET=generate_with_openssl_rand_hex_32

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ==========================================
# 🧠 AI ENGINE ROUTING (AT LEAST ONE REQUIRED)
# ==========================================
# Primary Provider (With Search Grounding)
GEMINI_API_KEY=your_gemini_api_key

# Fallback 1 (Ultra-fast Inference)
GROQ_API_KEY=your_groq_api_key

# Fallback 2 
OPENROUTER_API_KEY=your_openrouter_api_key

# Fallback 3
CLOUDFLARE_API_KEY=your_cf_api_key
CLOUDFLARE_ACCOUNT_ID=your_cf_account_id
CLOUDFLARE_GATEWAY_ID=your_cf_gateway_id
```
*(Note: Only `GEMINI_API_KEY` is strictly required to run the primary quiz engine locally).*

### 4. Initiate the Engine
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to access the Command Center.

---

## 🌐 Production Deployment (Vercel)

IPL StatWar is optimized for seamless deployment on **Vercel**.

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and create a "New Project".
3. Import the `ipl-statwar` repository.
4. **Important:** Open the **Environment Variables** section in the deployment settings and paste all values from your `.env.local`.
5. Click **Deploy**. Vercel will automatically detect Next.js and build using the `npm run build` command. 

*(Project requires no specific custom build commands. Standard `next build` natively works).*

### ✅ Production Readiness Checklist

Before promoting to production, verify the following:

1. **Rotate any previously exposed secrets** (Auth0, Supabase, AI keys, Clerk legacy keys).
2. **Set production env vars in Vercel** (never commit `.env` files).
3. **Set `APP_BASE_URL` to your production origin** (for example `https://yourdomain.com`).
4. **Update Auth0 application URLs** to match production exactly:
  - Callback URL: `https://yourdomain.com/auth/callback`
  - Logout URL: `https://yourdomain.com/`
5. **Keep `AUTH0_SECRET` stable** after release (changing it invalidates existing sessions).
6. **Remove unused legacy auth vars** (`NEXTAUTH_*`, `CLERK_*`) from deployment environment.
7. **Run production build locally**: `npm run build`.
8. **Test critical auth flows** in production preview:
  - Login
  - Signup (`/auth/login?screen_hint=signup`)
  - Logout
  - Blocked-user callback handling

---

## 🏗 System Architecture

- **Frontend**: Next.js App Router, React 19, Tailwind CSS (v3.4.17 legacy config).
- **Backend API**: Next.js Route Handlers (`/api/rooms/*`).
- **Database**: Supabase PostgreSQL.
- **AI Middleware**: Custom `lib/ai/router.ts` failover logic using Zod for strict JSON schema output parsing. 

---

<p align="center">
  <small>Tactical Simulation Unit v4.02 // Engineered for the true Cricket Analyst.</small>
</p>
