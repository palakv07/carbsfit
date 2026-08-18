# CarbsFit 🥗🔥
> **Gamified AI Fitness, Indian Meal Tracking & Personalized Coaching for Gen Z**

[![Live Demo](https://img.shields.io/badge/Live_Demo-carbsfit--app.surge.sh-00F0FF?style=for-the-badge&logo=rocket)](https://carbsfit-app.surge.sh)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-FF4154?style=for-the-badge)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Application
🔗 **Live Demo**: [https://carbsfit-app.surge.sh](https://carbsfit-app.surge.sh)

---

## ✨ Features

- 📸 **AI Meal Vision Scanner**: Snap or upload photos of Indian dishes (Masala Dosa, Biryani, Paneer Tikka, Chole Bhature, Dal Roti, etc.) to get instant macro/calorie estimates, health grades (A/B/C), and healthier Indian swap suggestions.
- 🏋️‍♂️ **Dynamic AI Workout Generator**: Generates custom daily workout routines tailored to your age, weight goals, activity level, and **what you ate today** (e.g. heavy-carb meals trigger fat-burning HIIT circuits). Includes interactive exercise timers and XP rewards.
- 🤖 **AI Fitness Coach ("Zara")**: An interactive companion providing nutrition tips, meal recommendations, and motivation in Hinglish & English.
- 🎮 **Gamified Quests & XP Progression**: Level up from *Carb Rookie* to *Lean Legend*. Complete daily quests (hydration, step goals, carb control), earn XP, build streak multipliers, and unlock achievement badges.
- 👤 **Personalized Onboarding & Profile**: Step-by-step onboarding that calculates target calories, carbs, protein, and water needs based on BMI, age, gender, height, and target weight loss/gain.
- 🛡️ **Zero-Crash Resilient Architecture**: Includes smart fallback engines for AI meal recognition and workout generation, ensuring 100% application stability even when API keys are unconfigured.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, TypeScript 5.8
- **Routing & SSR Framework**: `@tanstack/react-router`, `@tanstack/react-start` (Server Functions & SSR)
- **Styling & UI**: Tailwind CSS v4, Lucide React, Glassmorphism design system, Sonner notifications
- **Database & Auth**: `@supabase/supabase-js`
- **Build & Bundling**: Vite, `@tailwindcss/vite`, `vite-tsconfig-paths`

---

## 📂 Project Architecture

```
carbsfit/
├── src/
│   ├── components/       # Shell layouts, navigation, and UI components
│   ├── hooks/            # Custom React hooks (e.g. responsive viewport hooks)
│   ├── integrations/     # Supabase client, admin client & middleware
│   ├── lib/              # State store, targets calculation, AI server functions
│   │   ├── auth.tsx              # Supabase authentication context
│   │   ├── scan.functions.ts     # AI meal vision analysis server functions
│   │   ├── workout.functions.ts  # AI workout plan generation server functions
│   │   ├── store.ts              # Sync state store with persistent local storage
│   │   └── targets.ts            # TDEE, BMI, macro calculations
│   ├── routes/           # File-based router screens
│   │   ├── __root.tsx            # Global layout wrapper & meta tags
│   │   ├── index.tsx             # Main Dashboard & quest widgets
│   │   ├── scan.tsx              # AI meal scanner interface
│   │   ├── workout.tsx           # AI workout generator & active timers
│   │   ├── coach.tsx             # AI assistant chat interface
│   │   ├── onboarding.tsx        # Multi-step profile setup wizard
│   │   ├── profile.tsx           # User statistics & achievement badges
│   │   ├── quests.tsx            # Daily quest list & progress logger
│   │   ├── login.tsx             # Authentication login screen
│   │   └── signup.tsx            # Account registration screen
│   └── styles.css        # Core design system tokens, keyframes & glassy utilities
├── vite.config.ts        # Vite build & TanStack Start plugin configuration
├── wrangler.jsonc        # Deployment manifest configuration
└── package.json          # Dependency list and npm scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/carbsfit.git
   cd carbsfit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional):
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # AI Gateway (OpenAI / Gemini / Custom Gateway)
   OPENAI_API_KEY=your-openai-api-key
   AI_GATEWAY_URL=https://api.openai.com/v1/chat/completions
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
