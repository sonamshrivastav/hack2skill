# 🧘 ZenStudy - Student Mental Wellness Companion

ZenStudy is a feature-rich, high-fidelity mental wellness application designed specifically for competitive exam candidates (such as UPSC, JEE, NEET, and board exams) to manage preparation workload, track emotional indicators, and prevent cognitive burnout.

---

## 💡 Reviewer / Evaluator Credentials
To let the hackathon evaluation team explore the app instantly without signing up, the local database comes pre-seeded on first load:
*   **Email:** `student@zenstudy.com`
*   **Password:** `password123`

*(Note: Passwords in our local storage system are securely protected using client-side SHA-256 cryptographic hashes via the browser's native Web Crypto API).*

---

## 🚀 Key Features

1.  **Multi-User Authentication Layer:** Fully functional login, onboarding, and mock Google OAuth chooser modal. Candidate data, reflections, and chats are isolated under unique email namespaces in `localStorage`.
2.  **Zen Reflection Journaling:** A student diary where candidates can write about their workload.
3.  **18-Field GenAI Sentiment Extraction:** Live/offline analyzer that automatically parses reflections to generate scores for stress, wellness, burnout risk, focus, sleep hours, and positive habits.
4.  **Aura - Empathetic AI Companion:** A context-aware chat companion matching responses based on historical journal metrics and entrance exam parameters.
5.  **Ambient Soundscape Mixer:** Built-in audio oscillator synth generating Binaural Beats (10Hz Alpha Waves) and deep Brown Noise using the **Web Audio API** to block study distractions.
6.  **Box Breathing Visualizer:** A guide circle for 4-4-4-4 breathing cycles to calm the autonomic nervous system.
7.  **Cognitive Thought Reframer Sandbox:** Takes self-defeating exam thoughts and filters them into growth-oriented mindset affirmations.

---

## 🧠 GenAI Services Utilized

*   **Engine Model:** `gemini-2.5-flash` via the official Google Generative AI SDK.
*   **Aura Chat Memory Integration:** Evaluates historical student journals, stress patterns, and target exam date timers to provide context-aware responses (e.g. referencing specific study triggers like exam date countdowns).
*   **Structured Output Parser:** Formats sentiment analysis as a structured object containing 18 discrete metrics for mapping trends over time.
*   **Smart Offline Mode:** Instantly falls back to a locally computed sentiment dictionary if an API key is not supplied, keeping all metrics operational.

---

## 💻 Tech Stack
*   **Core:** React 18 + Vite (configured with relative base paths for static hosting).
*   **Styling:** Vanilla CSS glassmorphic aesthetics, breathing ambient background mesh nodes.
*   **Audio DSP:** Web Audio API (with proper AudioContext lifecycle handlers to prevent browser memory leaks).
*   **Security:** Web Crypto API SHA-256 hashing.
*   **Testing:** Vitest (Vite's native test runner) + automated unit tests.

---

## 🛠️ Installation & Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start development server:**
    ```bash
    npm run dev
    ```
3.  **Execute automated unit test suite:**
    ```bash
    npm run test
    ```
4.  **Build production bundle:**
    ```bash
    npm run build
    ```
