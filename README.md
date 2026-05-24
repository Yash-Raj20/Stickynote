# Sticky Notes - Frontend Client

This is the frontend client for the Sticky Notes application. It features a rich, interactive infinite canvas with real-time multiplayer capabilities.

## Tech Stack
- **Next.js** (App Router)
- **React** & **TypeScript**
- **Tailwind CSS** (for styling)
- **Zustand** (for state management)
- **Socket.IO Client** (for real-time collaboration)
- **Framer Motion** (for animations)
- **Lucide React** (for icons)

## Key Features
- Infinite scalable and pannable canvas.
- Real-time multiplayer cursors and note syncing.
- Custom minimap navigation.
- Draggable and resizable sticky notes with color customization.
- Dark mode support.
- Fully responsive Settings and Profile modals.

## Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Building for Production
```bash
npm run build
npm start
```
