# AgriPath Robo — 3D Voice Assistant

A new page at `/robo` where farmers see a friendly 3D robot avatar. The robo greets them in their selected language, asks what they need help with, gathers details through guided questions (voice or text), and explains answers aloud — covering **Crop Advice**, **Disease Detection**, and **Market Insights** in one conversation.

## User experience

```text
┌──────────────────────────────────────────────┐
│  Header (existing) + LanguageSelector         │
├──────────────────────────────────────────────┤
│                                              │
│        ╭──────────────╮                      │
│        │   3D ROBO    │   "Namaste! What    │
│        │  (animated)  │    can I help you   │
│        │  eyes blink, │    with today?"     │
│        │  head bobs,  │                     │
│        │  glows when  │   [Crop] [Disease] │
│        │  speaking)   │   [Market]         │
│        ╰──────────────╯                      │
│                                              │
│  ── Conversation transcript (scrollable) ──  │
│  Robo: ...                                   │
│  You:  ...                                   │
│                                              │
│  [🎤 Mic]  [Type your answer.........] [➤]  │
└──────────────────────────────────────────────┘
   Footer: Developed by K. Vijay — 9154521135
```

- Robo idle: gentle bob + blinking. Speaking: glow ring + mouth/antenna pulse synced to TTS.
- Listening: mic ring pulses red while STT is active.
- Three quick-action chips (Crop, Disease, Market) jump-start a flow; free voice/text also works.
- Disease flow shows an inline image upload card inside the chat when needed.

## Conversation flows (driven by Robo)

1. **Greeting** — Robo introduces itself in the selected language and offers the 3 options.
2. **Crop Advice** — Asks: location (auto-fills via geolocation), soil type, water source, farm size → calls `crop-advisor` edge function → speaks the recommendation.
3. **Disease Detection** — Asks farmer to upload/capture a leaf photo + optional description → calls `disease-detection` edge function → speaks diagnosis & treatment.
4. **Market Insights** — Asks crop name + location → calls `market-insights` edge function → speaks price trends & advice.
5. After each result Robo asks "Anything else?" and loops.

## Technical details

**New files**
- `src/pages/Robo.tsx` — page layout, conversation state, intent routing.
- `src/components/robo/RoboAvatar.tsx` — React Three Fiber `<Canvas>` with a stylized robot (head, body, eyes, antenna) built from primitives (`boxGeometry`, `sphereGeometry`, `cylinderGeometry`) — no external GLTF needed. Props: `speaking`, `listening`. Uses `useFrame` for idle bob, blink timer, and emissive glow when `speaking`.
- `src/components/robo/RoboChat.tsx` — transcript list + input bar (mic button + text input + send), reuses `useVoice` hook for STT/TTS and `useLanguage` for locale.
- `src/components/robo/RoboFlow.ts` — small state machine for the 3 flows (steps + slot filling).
- `src/hooks/useRoboConversation.ts` — orchestrates: pushes Robo questions, waits for input, calls the right edge function (streaming), aggregates the response, triggers TTS.

**Reused**
- `useVoice` (existing) for Web Speech STT + TTS in EN/TE/HI/TA/KN/MR.
- `useGeolocation` + `useWeather` to auto-fill location/weather context.
- Existing edge functions `crop-advisor`, `disease-detection`, `market-insights` (already auth-protected) — pass session token like the current pages do. Unauthenticated visitors are redirected to `/auth`.
- Existing `LanguageContext`, `Header`, `Footer`.

**Routing & nav**
- Add `<Route path="/robo" element={<Robo />} />` in `src/App.tsx`.
- Add a "Robo Assistant" link in `Header.tsx`.

**Dependencies**
- `three@^0.160.0`
- `@react-three/fiber@^8.18.0`
- `@react-three/drei@^9.122.0` (for `OrbitControls` disabled, `Float`, `Environment`)
- React 18 compatible per project constraints.

**Design tokens**
- All colors via existing semantic tokens (earthy greens, gold accents). Robo body uses `--primary` / `--accent` mapped to Three.js material colors via `getComputedStyle`.

**Constraints respected**
- Session-only history (in component state, no DB).
- Strict single-language responses (system prompts already enforce this in edge functions).
- Footer credit on the page.
- No new business logic in edge functions — only frontend orchestration.

## Out of scope
- Saving conversations.
- Lip-synced facial rig or imported GLB models.
- WhatsApp integration changes.
