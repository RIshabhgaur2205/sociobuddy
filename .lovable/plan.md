

## Plan: SOS Panic Room Feature

### Overview
Create an AI-powered "SOS Panic Room" page where teens describe their stressful social situation and get immediate AI guidance. Gaming-themed design with neon effects, glassmorphism, and urgency-styled UI.

### 1. New Edge Function: `supabase/functions/sos-panic-chat/index.ts`
- Same streaming pattern as `social-gym-chat`
- System prompt tailored as a crisis-support companion: calm, empathetic, gives immediate actionable advice for social panic situations (awkward moments, anxiety attacks, confrontations, being left out)
- Uses `google/gemini-3-flash-preview` model
- Handles 429/402 errors

### 2. New Page: `src/pages/SOSPanicRoom.tsx`
- **Gaming-themed design** with:
  - Dark background with red/orange neon glow effects and pulsing animations
  - Glassmorphism card for the chat area
  - Animated "SOS" header with glitch/pulse effect
  - Floating emergency-style icons/particles
- **Situation presets** as clickable cards (quick-start scenarios):
  - "Panic attack in public"
  - "Left out of a group"
  - "Awkward silence with someone"
  - "Being bullied right now"
  - "Fight with a friend"
  - "Feeling completely alone"
- **Chat interface**: User describes situation, AI streams back calming advice
- **Safety disclaimer**: If serious danger, encourage contacting a trusted adult or helpline
- Back button to home

### 3. Landing Page Section: `src/components/landing/SOSPanicSection.tsx`
- Preview section on the homepage with gaming aesthetic
- Brief description + CTA button to `/sos-panic-room`

### 4. Routing & Wiring
- **`src/App.tsx`**: Add `/sos-panic-room` route
- **`src/components/landing/Hero.tsx`**: Update "SOS Panic Room" button path from `/discover` to `/sos-panic-room`
- **`src/pages/Index.tsx`**: Add SOSPanicSection between existing sections

### Files Changed
| File | Action |
|---|---|
| `supabase/functions/sos-panic-chat/index.ts` | Create |
| `src/pages/SOSPanicRoom.tsx` | Create |
| `src/components/landing/SOSPanicSection.tsx` | Create |
| `src/App.tsx` | Add route |
| `src/components/landing/Hero.tsx` | Fix button path |
| `src/pages/Index.tsx` | Add section |

