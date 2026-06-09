# TTB Label Verifier

An AI-powered prototype for verifying alcohol beverage labels against TTB (Alcohol and Tobacco Tax and Trade Bureau) application form data.

**Live demo:** https://ttb-label-verifier-snowy.vercel.app

---

## Setup & Run Instructions

### Prerequisites
- Node.js 18+
- An Anthropic API key (console.anthropic.com)

### Local development

```bash
# Clone the repo
git clone https://github.com/Thraxiis/ttb-label-verifier.git
cd ttb-label-verifier

# Install dependencies
npm install

# Create your environment file
# Create a file named .env.local in the project root with:
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

```bash
npm i -g vercel
vercel
vercel --prod
```

Add `ANTHROPIC_API_KEY` as an environment variable in your Vercel project settings before deploying.

---

## How to Use

1. Upload a label image (JPG or PNG) using the drop zone or file browser
2. Enter the corresponding application form field values
3. Click **Analyze label**
4. Review the per-field verification results on the right

---

## Approach & Tools

### Stack
- **Next.js 15** (App Router) — full-stack framework; API routes proxy the Anthropic key server-side so it is never exposed to the browser
- **TypeScript** — shared types across the API route, client fetch wrapper, and all components
- **Tailwind CSS** — utility-first styling
- **Anthropic Claude claude-sonnet-4-6** — vision model for label image extraction and field comparison
- **Vercel** — deployment

### How verification works

Each verification is a single API call to Claude with two inputs: the label image (base64-encoded, resized to a 1120px max dimension before sending) and the application form field values. Claude extracts all visible fields from the label image, compares them against the provided form values, and returns a structured JSON result with per-field match statuses and a dedicated government warning check.

Match statuses follow TTB compliance logic:
- **Pass** — values match exactly or are clearly equivalent (e.g. `750 mL` vs `750ml`, `USA` vs `United States`)
- **Needs review** — minor variant likely requiring agent judgment (e.g. capitalization differences like `OLD TOM` vs `Old Tom`)
- **Fail** — substantive mismatch or required element is wrong
- **Missing** — field not found on label

The government warning is checked separately with strict rules: `GOVERNMENT WARNING:` must appear in all-caps bold, followed by the standard two-part warning statement word-for-word.

### Image handling

Label images are resized client-side to a 1120px maximum dimension and converted to JPEG before sending to the API. This reduces payload size while preserving enough resolution for Claude to read label text reliably.

---

## Assumptions & Trade-offs

| Decision | Rationale |
|---|---|
| Single API call per label | Simplest path to a working result; avoids multi-step orchestration |
| No persistent storage | Prototype scope; results live in React state for the session only |
| No COLA integration | Out of scope per project brief |
| Fuzzy match logic in prompt | Simpler than string-distance libraries for MVP; Claude handles common variants well |
| ~8–10s response time | Vision calls with detailed extraction take longer than text-only; streaming is implemented so the request doesn't time out, but the full result still renders at once |
| Batch upload not implemented | Core single-label flow prioritized for prototype; batch orchestration would reuse the same API route in a concurrent queue |

---

## Known Limitations

- Response time is 8–10 seconds per label due to vision model processing time
- No batch upload in current prototype
- No persistent audit log of verifications
- Government warning bold detection relies on Claude's visual interpretation, which may vary with image quality