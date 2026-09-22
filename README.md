# Aether Protocol

**On-chain Solana adoption, advertising, and lending.**

Discover projects → complete real actions → earn rewards from escrow → unlock lending.

Live product loop: **Discover → Participate → Earn**. Lending markets stay locked until a campaign has paid you (journey step 6).

Repository: [github.com/btcdecky-cmd/aether-protocol](https://github.com/btcdecky-cmd/aether-protocol)

---

## What’s in this repo

| Area | Description |
|------|-------------|
| **Campaign marketplace** | Escrow-funded tasks (visit, quiz, on-chain). Status lifecycle + zones + priority. |
| **Adoption journey** | 7-step path: wallet → learn → first action → discover → task → reward → return |
| **Protocol wallet** | Derived or linked wallet, faucet, ledger |
| **Advertise** | Draft → review summary → **Fund & activate** (human gate) |
| **Lending** | Markets gated on first campaign payout |
| **Bags.fm API** | Integrated client for pools, launches, fees, creators |
| **Solana programs** | Campaign escrow + lending (Anchor-style Rust sketches) |

---

## Campaign model (v0.2)

### Status lifecycle

```
draft → pending_review → active → paused → ended
```

- **draft** — editable, no funds  
- **pending_review** — pre-fund summary card (Soku-style review gate)  
- **active** — escrow funded, eligible in zones  
- **paused** / **ended** — stop delivery; end can refund remainder  

### Zones (inventory surfaces)

Inspired by classic ad-server *zones* — **eligibility**, not banner pixels:

| Zone | Where it can show |
|------|-------------------|
| `discover` | Main discover feed |
| `journey` | Adoption journey steps |
| `project` | Project detail page |
| `lend_teaser` | Lending unlock teaser |

### Priority (fill order)

| Priority | Role |
|----------|------|
| `override` | Onboarding / protocol-critical campaigns |
| `contract` | Paid escrow (default for advertisers) |
| `remnant` | Organic / low-budget discovery fill |

### Advertise UI

1. Create draft  
2. Submit → **Review before funding** card  
3. Explicit **Fund & activate**  
4. Escrow PDA + `status = active`  

See `src/components/AdvertiseSummaryCard.tsx` and `src/lib/campaign-flow.ts`.

### Seed copy

Campaign hooks use PAS / number-led / benefit-first patterns (marketing skill frameworks, not installed as deps). Seed data: `scripts/seed.ts`.

---

## Bags.fm API integration

**Bags.fm is integrated** in this repository.

| Item | Detail |
|------|--------|
| Client | `src/lib/bags/client.ts` |
| Docs | [docs.bags.fm](https://docs.bags.fm) |
| Base URL | `https://public-api-v2.bags.fm/api/v1/` |
| Auth | `x-api-key` header — create keys at [dev.bags.fm](https://dev.bags.fm) |
| Env | `BAGS_API_KEY`, optional `BAGS_API_BASE` (see `.env.example`) |

**What Aether uses Bags for**

- Live **pool discovery** (`GET /solana/bags/pools`)  
- **Token launch feed** and metadata lookups  
- **Lifetime fees / creators** as credibility signals for projects  
- Optional **trade quotes** for activation-style tasks  

**Quick check**

```bash
# Public health
curl https://public-api-v2.bags.fm/ping

# With your key
export BAGS_API_KEY=your_key
npx tsx scripts/bags-ping.ts
```

The TypeScript client talks to the public REST API directly (no mandatory `@bagsfm/bags-sdk` install). You may optionally add the official SDK later for token launch / fee-share transaction builders.

---

## Design references (not installed)

Patterns borrowed; **nothing from these repos is installed as a dependency**:

- [hyperfx-ai/marketing-skills](https://github.com/hyperfx-ai/marketing-skills) — copy frameworks, objectives, A/B discipline  
- [About-Intelligence/soku-cli](https://github.com/About-Intelligence/soku-cli) — review-gated writes before delivery changes  
- [revive-adserver/revive-adserver](https://github.com/revive-adserver/revive-adserver) — zones, contract/remnant/override priority  

---

## Stack

- TypeScript, React, Vite / TanStack-oriented structure  
- Zod validation, Drizzle-ready schema types  
- Solana web3.js  
- Anchor-style Rust programs under `programs/`  

---

## Getting started

```bash
git clone https://github.com/btcdecky-cmd/aether-protocol.git
cd aether-protocol
cp .env.example .env
# set DATABASE_URL (Neon) and BAGS_API_KEY

npm install
npm run bags:ping    # optional Bags health
npx tsx scripts/seed.ts
npm run dev
```

Production: set `DATABASE_URL` to Neon (or any Postgres). Local PGLite preview without a data asset may fail; use a real DB for deploy.

---

## Repo layout

```
aether-protocol/
├── README.md
├── package.json
├── .env.example
├── src/
│   ├── db/schema/campaigns.ts    # status, zones, priority
│   ├── lib/
│   │   ├── bags/                 # Bags.fm API client
│   │   └── campaign-flow.ts      # draft → review → activate
│   └── components/
│       └── AdvertiseSummaryCard.tsx
├── scripts/
│   ├── seed.ts                   # PAS / number-led campaign seeds
│   └── bags-ping.ts
└── programs/
    ├── campaign-escrow/          # escrow + pay completion
    └── lending/                  # adoption-gated markets
```

---

## Roadmap

- [x] Campaign statuses, zones, priority  
- [x] Advertise review gate + summary card  
- [x] Seed hooks (PAS / number-led)  
- [x] **Bags.fm API client integrated**  
- [ ] Full TanStack Start app routes + auth (App Builder parity)  
- [ ] Neon migrations + production deploy  
- [ ] Anchor build / deploy escrow + lending  
- [ ] Bags trade quote → on-chain activation task proof  

---

## License

MIT — © Aether contributors
