# TraceLens AI

**Cyberpunk Forensic Investigation Terminal powered by Tambo AI**

TraceLens AI is a next-generation forensic dashboard designed for the "Generative UI" Hackathon. It simulates a high-stakes FBI investigation workflow where the interface adapts to the investigator's needs using Tambo's AI capabilities.

## 🕵️ Features

-   **Cyberpunk UI**: Immersive dark-mode interface with neon accents, smooth animations (Framer Motion), and a "terminal" aesthetic.
-   **Generative Forensic Board**: The AI Assistant dynamically renders Evidence Graphs and Timelines when requested, keeping the interface clean until needed.
-   **Real OSINT Scanner**: Uses **Google Custom Search (Serper.dev)** to find real social media profiles.
-   **Automated Forensics Engines**:
    -   **Breach Detector**: Checks for credentials in compromised databases (Simulated with real data structures).
    -   **Risk Scoring**: Real-time threat assessment algorithm.
    -   **Chain of Custody**: Immutable logging of all evidence handling (SHA-256 hashing).
-   **Report Generation**: One-click generation of professional forensic reports.

## 🧠 Best Use Case of Tambo

TraceLens demonstrates the power of **Generative UI** in complex data-heavy applications. Instead of overwhelming the investigator with every possible chart and graph:
1.  The dashboard starts with a clean summary.
2.  The investigator asks the **Tambo Assistant**: *"Show me the connection between the suspect and the IP."*
3.  Tambo **dynamically mounts** the `EvidenceGraph` component into the chat stream or main view, configured with exactly the data needed.
4.  This allows for an adaptive workflow that scales from simple checks to complex conspiracy unraveling.

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **AI/UI**: Tambo SDK (Real Integration)
-   **Search**: Serper.dev API
-   **Styling**: Tailwind CSS, clsx
-   **Animation**: Framer Motion
-   **Visualization**: React Flow (Graph), Lucide React (Icons)
-   **Backend**: Next.js API Routes (Serverless)

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Configure API Keys**:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_key_here
    NEXT_PUBLIC_TAMBO_URL=https://api.tambo.ai
    SERPER_API_KEY=your_serper_key_here
    ```
    *Get a free key from [serper.dev](https://serper.dev).*

3.  **Run Development Server**:
    **IMPORTANT: Restart the server after adding API keys!**
    ```bash
    npm run dev
    ```
4.  **Initiate Scan**:
    -   Navigate to `localhost:3000`
    -   Click **INITIALIZE TERMINAL**
    -   Enter a target (e.g., `darkwolf_007` or `elonmusk`)
    -   Interact with the AI Assistant on the Case Board.

## 📂 Project Structure

-   `app/` - Next.js App Router pages (`dashboard`, `case`, `report`).
-   `components/tambo/` - Tambo Registry and Assistant wrapper.
-   `components/forensics/` - Specialized forensic UI components (Graph, Timeline).
-   `lib/forensics/` - Backend logic engines (OSINT, Risk, Breach).
-   `types/` - TypeScript definitions for investigation entities.

---
*Built for the Tambo Hackathon 2024.*
