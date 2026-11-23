# Callista Digital Creator Hub — implementation brief

## Goal
Turn the existing /tools page into a free Creator Hub for entrepreneurs, creators, freelancers, and small businesses. Keep the existing home page and brand design intact. Mr. Prompterson remains free forever and continues to run at https://teleprompter.callistadigital.com/.

## Experience
1. Public Creator Hub landing page: clear value proposition, free tools, practical lessons, and invitation to join.
2. Friendly back-office-style member entry: name and invitation code. Do not present a shared code as secure authentication.
3. Capture email once at registration, with a separate unchecked optional checkbox for marketing messages. Persist consent evidence, timestamps, and source in a secure backend; never expose email data in client-side code.
4. Returning members should have a smooth experience; if persistent private member data is used, use real server-backed authentication or magic links.
5. Dashboard: prominent Launch Mr. Prompterson action, three starter lessons, script templates, free resources, and clearly labeled Callista Digital paid solutions.
6. Optional Telegram community invitation. Code distribution may happen there, but Telegram membership is not required.
7. Clear contact/unsubscribe/privacy paths. No fake earnings claims, false urgency, or forced purchase.
8. Mobile-first, keyboard accessible, fast-loading; preserve current Callista styling.

## Initial lessons
- Get comfortable on camera: use the free teleprompter and record a first video.
- Create videos that attract attention: hooks, storytelling, calls to action.
- Turn viewers into leads: landing pages, consent-based email capture, follow-up.

## Conversion
Free tool -> opt-in and onboarding -> training -> relevant paid website, landing-page, and lead-funnel offers. Track visits, completed signups, tool launches, lesson engagement, and inquiries without invasive tracking.

## Delivery gates
Implement on this feature branch, run npm test and npm run build, verify mobile and desktop, produce a Vercel preview, and request approval before merging. Do not enable production email collection until backend, privacy language, consent handling, and email integration are configured and tested.
