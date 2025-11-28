import type { Metadata } from 'next';
import { APP_URL, APP_NAME, APP_DESCRIPTION } from '../../../lib/constants';
import { getMiniAppEmbedMetadata } from '../../../lib/utils';

export const revalidate = 300;

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const { fid } = await params;
  const shareImage = searchParams?.share_image_url || `${APP_URL}/api/opengraph-image?fid=${fid}`;

  return {
    title: `${APP_NAME} - Share`,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [shareImage]
    },
    other: {
      'fc:frame': JSON.stringify(getMiniAppEmbedMetadata(shareImage))
    }
  };
}

export default function SharePage({ params, searchParams }: { params: { fid: string }, searchParams?: { [key: string]: string | string[] } }) {
  const fid = params.fid;
  const customImage = (searchParams && (searchParams.share_image_url as string)) || `${APP_URL}/api/opengraph-image?fid=${fid}`;

  // Render only the preview image (no extra links/content) so embed preview is clean.
  return (
    <html>
      <body style={{ margin: 0, background: '#071029', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <img src={customImage} alt={`Share image for ${fid}`} style={{ width: '100%', maxWidth: 1200, height: 'auto', display: 'block' }} />
      </body>
    </html>
  );
}
