export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://builder-reward.vercel.app';
export const APP_NAME = 'Builder Reward';
export const APP_DESCRIPTION = 'Calculate your builder market value from the $100M reward pool.';

export const TIERS = {
  1: { maxRank: 2000, poolPercent: 0.6, poolAmount: 60000000, totalPoints: 400000 },
  2: { maxRank: 5000, poolPercent: 0.3, poolAmount: 30000000, totalPoints: 400000 },
  3: { maxRank: 10000, poolPercent: 0.1, poolAmount: 10000000, totalPoints: 500000 }
} as const;

export const TOTAL_REWARD_POOL = 100000000;
