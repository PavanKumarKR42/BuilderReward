import type { Metadata } from 'next';
import { APP_URL, APP_NAME, APP_DESCRIPTION } from '../../../lib/constants';
import { getMiniAppEmbedMetadata } from '../../../lib/utils';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ fid: string }> }): Promise<Metadata> {
  const { fid } = await params;
  const imageUrl = `${APP_URL}/api/opengraph-image?fid=${fid}`;

  return {
    title: `${APP_NAME} - Share`,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [imageUrl]
    },
    other: {
      'fc:frame': JSON.stringify(getMiniAppEmbedMetadata(imageUrl))
    }
  };
}

export default function SharePage({ params }: { params: { fid: string } }) {
  const fid = params.fid;
  const urlSearch = typeof window !== 'undefined' ? window.location.search : '';
  const urlParams = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(urlSearch) : null;
  const customImage = urlParams?.get('share_image_url') || `${APP_URL}/api/opengraph-image?fid=${fid}`;

  return (
    <html>
      <body style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#071029', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={customImage} alt={`Share image for ${fid}`} style={{ width: 900, height: 'auto', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }} />
          <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.8)' }}>Open this page in Warpcast to preview the embed. Share URL: <code style={{ color: 'white' }}>{`${APP_URL}/share/${fid}`}</code></div>
        </div>
      </body>
    </html>
  );
}
