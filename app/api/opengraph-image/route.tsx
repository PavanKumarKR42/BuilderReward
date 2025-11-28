import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getNeynarUser, calculateReward } from '../../../lib/neynar';
import { APP_NAME, TIERS } from '../../../lib/constants';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get('fid');
    const fid = fidParam ? Number(fidParam) : undefined;

    const user = fid ? await getNeynarUser(fid) : null;

    const score = user?.score ?? 0;
    const rank = user?.rank ?? null;
    const reward = rank ? calculateReward(score, rank) : 0;
    const tier = rank
      ? Object.keys(TIERS).find((k) => rank <= TIERS[Number(k) as 1 | 2 | 3].maxRank)
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(180deg,#0f172a 0%, #0b1220 100%)',
            color: 'white',
            fontFamily: 'Inter, Arial, sans-serif',
            padding: 48,
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 36 }}>
            <div style={{ width: 240, height: 240, borderRadius: 120, overflow: 'hidden', border: '6px solid rgba(255,255,255,0.12)' }}>
              <img src={user?.pfp_url} width={240} height={240} style={{ objectFit: 'cover' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 40, fontWeight: 700 }}>{user?.display_name ?? user?.username ?? 'Builder'}</div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>@{user?.username ?? (user?.fid ?? '')}</div>

              <div style={{ display: 'flex', marginTop: 18, gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 16px', borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Score</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{score.toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 16px', borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Rank</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{rank ? `#${rank.toLocaleString()}` : '—'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 16px', borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Tier</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{tier ? `Tier ${tier}` : '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>{APP_NAME}</div>
            <div style={{ fontSize: 48, fontWeight: 800 }}>
              {reward ? `$${reward.toLocaleString()}` : '$0'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Market value from the $100M reward pool</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (err) {
    console.error('OpenGraph image generation error', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
