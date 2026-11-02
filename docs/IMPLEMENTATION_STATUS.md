# Implementation status

## This delivery
- Responsive Persian RTL landing page, built in Next.js App Router.
- Warm editorial, cream/forest-green visual direction based on the approved reference image.
- Light/dark theme toggle with `localStorage` preference and system preference on first visit.
- CSS-built NoteAI dashboard preview, including an illustrative recording waveform, transcript list, board mockup and generated-notes card.
- Features, three-step workflow, CTA area and footer.
- Homepage metadata, Persian keywords, Open Graph basics, robots and sitemap routes.

## Not implemented / not verified
- No audio recording pipeline.
- No background recording support.
- No AI provider or production API connection.
- No account system, database, payment, subscription, or waitlist backend.
- No real device/browser test, Lighthouse run, or production build verification in this environment.
- The dashboard preview is illustrative UI; the waveform control is not a real audio player.

## Acceptance checklist before launch
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the actual domain.
- [ ] Run `npm install`, `npm run lint`, and `npm run build` in an environment with registry access.
- [ ] Test widths 320, 360, 390, 430, 768, 1024, 1440 and 1920 px.
- [ ] Test Light and Dark themes, persistence after refresh, keyboard navigation and contrast.
- [ ] Replace any illustrative product claims with verified capabilities or clearly mark them as planned.
- [ ] Add licensed Persian font files locally and update font-face declarations if needed.
- [ ] Verify production SEO metadata, canonical URL and social preview image.
