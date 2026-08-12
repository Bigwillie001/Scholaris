# Scholaris 2.0

A rebuilt, self-contained version of the public Scholaris interface.

## Included upgrades
- Existing Scholaris concept, name, sections, and student-finance theme preserved.
- Username, course, and graduation year are editable.
- Username propagates to the header and AI Co-Pilot greeting.
- Expanded explanatory UI copy, empty states, and helper text.
- Functional funding, expense, savings goal, and roommate split calculations.
- Browser persistence via localStorage.
- Dark/light theme toggle.
- CSV export and print report.
- Demo data loader.
- AI Co-Pilot demo that analyzes the current app data locally.

## Run
Open `index.html` in a browser. No build step is required.

## Production AI
The local demo AI is intentionally provider-neutral. For a real model (e.g. Groq), add a server-side endpoint and send only the necessary Scholaris data to the model. Never expose the API key in browser JavaScript.

## Packaging
This folder can be hosted as static files or adapted into a PWA/Android wrapper later.
