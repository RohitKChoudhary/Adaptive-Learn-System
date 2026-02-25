## Packages
react-markdown | Rendering course markdown content
remark-gfm | GitHub flavored markdown support for tables/lists in courses
framer-motion | Page transitions and smooth UI animations
recharts | Progress and accuracy data visualization
lucide-react | Icons for the UI

## Notes
- Base URL for API calls is `/` (proxied by Vite).
- JWT Authentication: Tokens are stored in `localStorage` as `learnai_token`.
- All authenticated API requests include `Authorization: Bearer <token>`.
- The app defaults to a deep navy and electric blue dark theme as requested.
