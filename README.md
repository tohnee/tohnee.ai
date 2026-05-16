# Tohnee.ai — Research Lab

Research lab building safe and beneficial AGI, amplifying individual potential through autonomous agents and the One-Person Company operating system.

## Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **3D**: Three.js / @react-three/fiber
- **Routing**: React Router v7
- **SEO**: react-helmet-async
- **Icons**: Lucide React

## Development

```bash
npm run dev       # Start dev server
npm run build     # Type-check + production build
npm run lint      # Lint check
npm run preview   # Preview production build
```

## Deployment

```bash
npm run deploy        # Build + deploy to Cloudflare Pages preview
npm run deploy:prod   # Build + deploy to Cloudflare Pages production
```

## Project Structure

```
public/          # Static assets (favicon, sitemap, robots.txt, images)
src/
  components/    # Shared UI components (Layout, SEO, ErrorBoundary, etc.)
  pages/         # Route pages (Home, Research, Models, Agents, OPC, Company, etc.)
    auth/        # Auth-related pages
    company/     # Company sub-pages (Blog, Careers, Charter)
    content/     # Content detail pages (ArticleView, ModelView, AgentView)
  assets/        # Local assets
  App.tsx        # Root app with route definitions
  main.tsx       # Entry point
  index.css      # Global styles + Tailwind setup
```

## Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/research` | Research index |
| `/research/:slug` | Article view |
| `/models` | Model catalog |
| `/models/:slug` | Model detail |
| `/agents` | Agent overview |
| `/agents/:slug` | Agent detail |
| `/opc` | OPC OS |
| `/company` | About |
| `/company/blog` | Blog |
| `/company/careers` | Careers |
| `/company/charter` | Charter |
| `/login` | Login |
| `/search` | Search |
| `/try` | Try Tohnee-7B |

## License

Private — Tohnee.ai
