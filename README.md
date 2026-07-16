# DevVault ── AI-Powered Developer Knowledge Vault

DevVault is a state-of-the-art, AI-powered developer knowledge base and note-taking application. It enables developers to store, categorize, and catalog code snippets and technical notes, explore public community knowledge, analyze vault metrics, and interact with an integrated **Google Gemini AI** mentor for instant explanations and coding assistance.

---

## ✨ Features

### 🔒 Local vs 🌍 Community Visibility
- **Local (Private)**: Store private notes and snippets visible only inside your dashboard vault.
- **Community (Public)**: Share developer notes with the community under the **Explore** tab. Other users can view and bookmark them, but only the owner can edit, delete, or change its visibility.

### 🧠 Gemini AI Integration
- **Auto-Suggestions**: Get instant category and tag suggestions based on note title and description while editing/creating items.
- **Explain Snippet**: Instantly generate deep structural explanations (including code walkthroughs and time/space complexities) using markdown overlays.
- **Interactive AI Mentor**: Open a drawer-style chat window to ask context-specific technical questions directly about any note.

### 📊 Workspace Analytics
- Track snippet counts, custom categories, and language usage statistics.
- Interactive weekly activity bar charts graphing your contributions from Monday to Sunday.
- Distribution breakdown graphs showing language percentages, categories, and bookmark/pin allocations.

### 📁 Advanced Filters & Bookmarking
- Multi-dimensional search indexing titles, descriptions, categories, languages, and tags.
- Pin notes to the top of your dashboard.
- Add community snippets to your dashboard vault using the Favourites star toggle.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Framer Motion (premium animations), Vanilla CSS (custom tailored theme variables), Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose schemas), JWT authorization, Google Gemini SDK.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)
- Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_signature_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application on `http://localhost:5173`.

---

## 📄 License
This project is licensed under the MIT License.
