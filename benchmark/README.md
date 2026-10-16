# Benchmark: AI provider comparison (decision 002)

Sends the real samples in `../test-data/` to each AI model and scores the answers against the hand-checked correct answers. Results feed [decision 002](../docs/decisions/002-ai-provider.md).

**What it tests**

| Test | Samples | Measures |
|---|---|---|
| **Extraction:** reading a graded test | `test-data/graded-tests/` | Finds the missed questions (recall + precision), reads the student's answers, spots partial credit |
| **Grading:** judging the student's work | `test-data/student-work/` | Gets pass / redo / needs check / skipped right, counts **wrongful redos** (the costliest error, per decision 003), skips blank questions |

The prompts are in `prompts/`, taken from the backend doc §8.2. Generation (decision 010) is not tested yet.

## One-time setup

1. **Get API keys** (each needs an account with billing; the person who owns the account creates the key):
   - Anthropic: console.anthropic.com → API keys
   - OpenAI: platform.openai.com → API keys
   - Google: aistudio.google.com → Get API key. **Use a project with billing turned on**: free-tier data may be used to improve Google's products, which decision 006 rules out.
2. **Copy `.env.example` to `.env`** in this folder and paste the keys in. `.env` stays on this computer and is never shared. You can skip a provider by leaving its line blank.
3. **Install:** `npm install` (already done once).
4. **Confirm model IDs:** `npm run list-models`. Entries marked `"confirm": true` in `models.json` came from web research; fix any ID that isn't in the list.

## Running

```bash
npm run bench -- --dry-run          # checks samples and scoring; no API calls, free
npm run bench                       # all models, both tests
npm run bench -- grading --models claude-opus-5-5,gemini-3.8-flash
npm run bench -- --repeat 3         # run each test 3 times to see consistency
```

Each run saves `results/<date-time>/summary.md` (the comparison table) and `raw.json` (every reply and per-question detail).

**Cost:** one full run is roughly 11 calls per model (1 extraction with 6 photos, 10 grading pages). Expect cents to under a dollar per model, so a few dollars for all six. Set a spending limit in each provider's console first.

## Privacy

- Photos are stripped of EXIF and IPTC metadata (including any GPS location) before they are sent.
- The prompts tell the models not to repeat names or schools.
- Sending samples to a provider means that provider receives a child's schoolwork. Check each provider's API data terms (no training on API data, short retention) before the first run. That check is part of decision 002 anyway.
- `results/` is kept out of git, like `test-data/`.

## Adding samples

- **Graded test:** new folder in `test-data/graded-tests/` with `photo-1.jpg`… and an `expected.json` like sample 001.
- **Student work:** new folder in `test-data/student-work/` with photos and an `expected.json` like sample 002. `acceptable` lists the grades that count as right; set `verified: true` once the tutor has checked the item.
