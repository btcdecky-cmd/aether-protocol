/**
 * Seed campaigns with PAS / number-led hooks (marketing-skills patterns).
 * Run: npx tsx scripts/seed.ts
 */

import type { Campaign } from "../src/db/schema/campaigns";

const now = new Date().toISOString();

/** Seed data — in production this inserts into Postgres via Drizzle */
export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-helix-onboard",
    projectId: "proj-helix",
    slug: "helix-first-stake",
    title: "Stake your first SOL on Helix",
    hook: "Cut your staking setup from 3 tools to 1 click — earn on day one.",
    description:
      "Problem: juggling explorers, wallets, and validators. Agitate: missed epochs and idle SOL. Solve: complete Helix’s guided stake flow and claim a protocol reward.",
    objective: "activation",
    status: "active",
    priority: "override",
    zones: ["discover", "journey", "project"],
    category: "staking",
    budgetLamports: 50_000_000_000,
    spentLamports: 2_500_000_000,
    rewardPerCompletionLamports: 50_000_000,
    maxCompletions: 1000,
    completionCount: 50,
    tasks: [
      {
        id: "t1",
        type: "visit",
        title: "Open Helix stake UI",
        description: "Visit the official Helix staking page from Discover.",
        rewardLamports: 10_000_000,
      },
      {
        id: "t2",
        type: "quiz",
        title: "Epoch basics",
        description: "Answer 3 questions on epochs and commission.",
        rewardLamports: 15_000_000,
      },
      {
        id: "t3",
        type: "onchain",
        title: "Stake ≥ 0.1 SOL",
        description: "Submit a real stake instruction; we verify on-chain.",
        rewardLamports: 25_000_000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "camp-quarry-lp",
    projectId: "proj-quarry",
    slug: "quarry-first-lp",
    title: "Provide liquidity on Quarry",
    hook: "Still earning 0% on idle USDC? Route it into Quarry in under 5 minutes.",
    description:
      "Before: stables sitting in a wallet. After: LP position with transparent fees. Bridge: complete Quarry’s deposit checklist and claim Aether rewards.",
    objective: "liquidity",
    status: "active",
    priority: "contract",
    zones: ["discover", "project", "lend_teaser"],
    category: "defi",
    budgetLamports: 80_000_000_000,
    spentLamports: 0,
    rewardPerCompletionLamports: 80_000_000,
    maxCompletions: 500,
    completionCount: 0,
    tasks: [
      {
        id: "t1",
        type: "visit",
        title: "Open Quarry pools",
        description: "Land on the SOL/USDC pool page.",
        rewardLamports: 20_000_000,
      },
      {
        id: "t2",
        type: "onchain",
        title: "Deposit LP",
        description: "Add liquidity (min 5 USDC equivalent).",
        rewardLamports: 60_000_000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "camp-signal-learn",
    projectId: "proj-signal",
    slug: "signal-oracle-101",
    title: "Oracle 101 with Signal",
    hook: "47% of failed liquidations start with stale prices — learn how Signal keeps feeds live.",
    description:
      "Feature: multi-source price feeds. Advantage: fewer bad liquidations. Benefit: you understand risk before you lend.",
    objective: "education",
    status: "active",
    priority: "contract",
    zones: ["discover", "journey"],
    category: "oracles",
    budgetLamports: 20_000_000_000,
    spentLamports: 1_000_000_000,
    rewardPerCompletionLamports: 25_000_000,
    maxCompletions: 800,
    completionCount: 40,
    tasks: [
      {
        id: "t1",
        type: "visit",
        title: "Read Signal docs",
        description: "Open the oracle architecture page.",
        rewardLamports: 5_000_000,
      },
      {
        id: "t2",
        type: "quiz",
        title: "Price freshness quiz",
        description: "Pass a short quiz on heartbeats and aggregation.",
        rewardLamports: 20_000_000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "camp-atlas-wallet",
    projectId: "proj-atlas",
    slug: "atlas-first-tx",
    title: "Send your first Atlas transaction",
    hook: "What if your first mainnet tx took 90 seconds — and paid you back?",
    description:
      "Guided first transfer on Atlas infrastructure. Ideal for wallets still on step 1–2 of the Aether journey.",
    objective: "discovery",
    status: "active",
    priority: "override",
    zones: ["journey", "discover"],
    category: "infra",
    budgetLamports: 30_000_000_000,
    spentLamports: 5_000_000_000,
    rewardPerCompletionLamports: 30_000_000,
    maxCompletions: 1000,
    completionCount: 166,
    tasks: [
      {
        id: "t1",
        type: "onchain",
        title: "Send 0.001 SOL",
        description: "Any destination; we verify signature + confirmation.",
        rewardLamports: 30_000_000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "camp-northwind-remnant",
    projectId: "proj-northwind",
    slug: "northwind-explore",
    title: "Explore Northwind markets",
    hook: "Browse live markets — no deposit required to learn the UI.",
    description:
      "Organic remnant inventory: complete a free tour of Northwind. No escrow payout beyond a tiny protocol tip when funded.",
    objective: "discovery",
    status: "active",
    priority: "remnant",
    zones: ["discover"],
    category: "markets",
    budgetLamports: 5_000_000_000,
    spentLamports: 0,
    rewardPerCompletionLamports: 5_000_000,
    maxCompletions: 2000,
    completionCount: 0,
    tasks: [
      {
        id: "t1",
        type: "visit",
        title: "Open markets page",
        description: "Spend 30s on the markets grid.",
        rewardLamports: 5_000_000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "camp-draft-example",
    projectId: "proj-lumen",
    slug: "lumen-pending",
    title: "Lumen retention sprint",
    hook: "Win back wallets that tried Lumen once — 2x reward this week only.",
    description: "Draft example for the advertise UI (pending_review path).",
    objective: "retention",
    status: "pending_review",
    priority: "contract",
    zones: ["project", "discover"],
    category: "payments",
    budgetLamports: 40_000_000_000,
    spentLamports: 0,
    rewardPerCompletionLamports: 40_000_000,
    maxCompletions: 400,
    completionCount: 0,
    tasks: [
      {
        id: "t1",
        type: "onchain",
        title: "Complete one Lumen payment",
        description: "Any merchant demo payment ≥ 0.01 SOL equivalent.",
        rewardLamports: 40_000_000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

console.log(`Seeded ${SEED_CAMPAIGNS.length} campaigns (in-memory export).`);
console.log(
  "Statuses:",
  [...new Set(SEED_CAMPAIGNS.map((c) => c.status))].join(", "),
);
console.log(
  "Priorities:",
  [...new Set(SEED_CAMPAIGNS.map((c) => c.priority))].join(", "),
);
