import { TIERS } from './constants';

interface NeynarUser {
  fid?: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  score?: number;
  rank?: number;
}

export async function getNeynarUser(fid?: number): Promise<NeynarUser | null> {
  if (!fid) return null;

  // Try to fetch Builder Score & Rank from Talent Protocol
  try {
    const TALENT_API_KEY = process.env.TALENT_API_KEY || '';
    const scoreRes = await fetch(`https://api.talentprotocol.com/farcaster/scores?fids=${fid}`, {
      headers: {
        accept: 'application/json',
        'X-API-KEY': TALENT_API_KEY
      }
    });

    if (!scoreRes.ok) {
      // if Talent call fails, return minimal info
      return {
        fid,
        username: String(fid),
        display_name: String(fid),
        pfp_url: '',
        score: 0,
        rank: null as any
      };
    }

    const scoreData = await scoreRes.json();
    const scoreObj = scoreData.scores && scoreData.scores[0] ? scoreData.scores[0] : null;

    const score = scoreObj?.points ?? 0;
    const rank = scoreObj?.rank_position ?? null;
    const slug = scoreObj?.slug ?? String(fid);

    // We don't have a guaranteed pfp source via Talent; generate an SVG placeholder if necessary
    const initial = (slug && String(slug).charAt(0).toUpperCase()) || 'B';
    const pfp = `data:image/svg+xml;utf8,${encodeURIComponent(`<?xml version='1.0' encoding='utf-8'?><svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><rect width='100%' height='100%' rx='120' fill='%236C5CE7'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='96' fill='white'>${initial}</text></svg>`)}`;

    return {
      fid,
      username: slug,
      display_name: scoreObj?.display_name ?? slug,
      pfp_url: pfp,
      score,
      rank
    };
  } catch (err) {
    console.error('getNeynarUser error', err);
    return null;
  }
}

export function calculateReward(score: number, rank: number | null) {
  if (!rank) return 0;
  // find tier
  const tier = Object.keys(TIERS).find((k) => {
    const t = TIERS[Number(k) as 1 | 2 | 3];
    return rank <= t.maxRank;
  });
  if (!tier) return 0;
  const tierConfig = TIERS[Number(tier) as 1 | 2 | 3];
  const reward = (score / tierConfig.totalPoints) * tierConfig.poolAmount;
  return Math.round(reward);
}
