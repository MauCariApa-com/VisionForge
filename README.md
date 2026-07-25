# VisionForge

VisionForge is a browser-based AI image generation playground built with React, TypeScript, Tailwind CSS, and shadcn/ui. It lets you generate images using Cloudflare Workers AI or your own custom providers.

## Features

- 🎨 **AI Image Generation** – Turn text prompts into images using state-of-the-art models
- ⚙️ **Multiple Providers** – Built-in Cloudflare Workers AI support plus custom provider configuration
- 🖼️ **Model Management** – Add, edit, and remove custom models for any provider
- 📐 **Flexible Controls** – Tune width, height, aspect ratio, inference steps, CFG scale, and seed
- 🗂️ **History Gallery** – Keep your last 50 generated images in local browser storage
- 🌗 **Dark Mode** – Toggle between light and dark themes
- 🔒 **Privacy-First** – API keys are stored only in your browser's localStorage

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Sonner (toasts)

## Getting Started

### Prerequisites

- Node.js 18+
- A Cloudflare account ID and API key (for Cloudflare Workers AI)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dev server runs on `http://localhost:8080` and proxies Cloudflare API requests via `/api/cloudflare`.

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_CLOUDFLARE_API_KEY=your_cloudflare_api_key
VITE_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

These values are used as defaults. Users can also enter their API keys directly in the Settings page.

### Build

```bash
npm run build
```

## Usage

1. Describe the image you want in the prompt box
2. Choose a provider and model from the sidebar
3. Adjust generation controls as needed
4. Click **Generate Image**
5. Download or delete images from your gallery

## Custom Providers

Add custom image generation providers in Settings. A custom provider needs:

- A unique provider ID
- A display name
- An API base URL
- Optional environment variable name for backend fallback checking

Custom providers may require CORS configuration or a backend relay when deployed as a static SPA.

## Project Structure

```
src/
├── components/          # UI components
├── components/ui/       # shadcn/ui components
├── components/settings/ # Settings page components
├── lib/                 # Utilities and stores (settings, history)
├── pages/               # Route pages
├── services/            # Image generation services
└── hooks/               # Custom React hooks
```

## License

MIT