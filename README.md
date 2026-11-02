# NoteAI homepage — visual MVP

A Persian right-to-left landing page based on the approved warm editorial design. Built with Next.js App Router, React, TypeScript, and custom CSS without an external UI library.

## Included
- Responsive homepage with a CSS-built illustrative product dashboard
- Light/dark theme switcher persisted in `localStorage`
- Responsive mobile navigation
- Persian metadata, keywords, Open Graph basics, `robots.txt`, and `sitemap.xml`
- Feature strip, three-step workflow, CTA section, and footer
- Accessible labels, skip link, focus-friendly controls, and reduced-motion support
- Original reference image preserved at `docs/reference-design.png`

## Not implemented yet
- Real authentication or onboarding
- Audio recording or background recording
- AI transcription, image analysis, or note generation
- Database, subscription, payment, email capture, or a real waitlist backend
- Real audio playback: the dashboard is a visual mockup

The generated dashboard/board is illustrative CSS, not real captured lecture data. Do not advertise the AI workflow as available until the underlying functionality has been integrated and tested.

## Run locally

Requirements: Node.js 20.9+ (recommended) and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Build and run production mode:

```bash
npm run build
npm run start
```

## Before launch

1. Set `NEXT_PUBLIC_SITE_URL` to the real production domain (see `.env.example`).
2. Run lint and production build.
3. Test the responsive layouts and theme on real browsers.
4. Load a properly licensed Persian font locally. CSS currently uses system font fallbacks such as Vazirmatn, IRANSans, and Tahoma.
5. Replace the illustrative product mockup and any planned-feature wording if it does not reflect actual released functionality.

See `docs/IMPLEMENTATION_STATUS.md` for outstanding items.
