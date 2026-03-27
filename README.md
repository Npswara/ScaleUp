# Scaleup: Career Intelligence

**A strategic ecosystem for the modern professional. Built with AI, refined by human ambition.**

Scaleup is a comprehensive career intelligence platform designed to help professionals navigate their career growth with data-driven insights and strategic planning. It combines advanced AI analysis with practical tools to bridge the gap between current skills and future ambitions.

## 🚀 Key Features

### 🗺️ Strategic Career Roadmap
Generate a personalized, step-by-step roadmap for your target career goal.
- **Milestone Planning**: Clear phases from entry to mastery.
- **Learning Integration**: Direct search links to Coursera for every skill and step.
- **Visual Learning**: Curated YouTube tutorials integrated directly into your roadmap.
- **Progress Tracking**: Mark milestones as complete and watch your strategic alignment grow.

### 📊 Intelligence Dashboard
Your central hub for career strategy.
- **Strategic Insights**: AI-powered analysis of your profile and market trends.
- **Competency Alignment**: Real-time tracking of your proficiency in required skills.
- **Emerging Paths**: Discover alternative career trajectories based on your unique nature.
- **Market Outlook**: Stay informed with demand levels and salary growth projections.

### 🛠️ Professional Toolkit
- **Interview Practice**: AI-simulated interviews tailored to your target role.
- **LinkedIn Review**: Strategic analysis of your profile with actionable improvement tips.
- **CV/Resume Maker**: Professional resume builder with PDF export capabilities.
- **CV Review**: Upload your existing CV for a deep strategic audit.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Backend**: Node.js, Express
- **AI Engine**: Google Gemini API (@google/genai)
- **Database**: SQLite (via better-sqlite3) for local persistence
- **PDF Generation**: jsPDF, html2canvas
- **Video Integration**: YouTube Search API

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd scaleup-career-intelligence
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## 📂 Project Structure

- `src/components/`: Reusable UI components and main view modules.
- `src/services/`: AI and external API integration logic.
- `src/lib/`: Utility functions and shared logic.
- `src/types.ts`: Global TypeScript definitions.
- `server.ts`: Express server for API routes and Vite middleware.

## 📄 License

This project is built as a strategic tool for professional development.

---
*Built with precision for those who refuse to settle.*
