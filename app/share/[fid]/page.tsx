import type { Metadata } from 'next';
import { APP_URL, APP_NAME, APP_DESCRIPTION } from '../../../lib/constants';
import { getMiniAppEmbedMetadata } from '../../../lib/utils';

export const revalidate = 300;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ fid: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] }>;
}): Promise<Metadata> {
  const { fid } = await params;
  const sp = await searchParams;
  const shareImageUrl = sp?.share_image_url
    ? Array.isArray(sp.share_image_url)
      ? sp.share_image_url[0]
      : sp.share_image_url
    : `${APP_URL}/api/opengraph-image?fid=${fid}`;

  return {
    title: `${APP_NAME} - Share`,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [shareImageUrl],
    },
    other: {
      'fc:frame': JSON.stringify(getMiniAppEmbedMetadata(shareImageUrl)),
    },
  };
}

export default function SharePage({
  params,
  searchParams,
}: {
  params: { fid: string };
  searchParams?: { [key: string]: string | string[] };
}) {
  const shareImageUrl = searchParams?.share_image_url
    ? Array.isArray(searchParams.share_image_url)
      ? searchParams.share_image_url[0]
      : searchParams.share_image_url
    : `${APP_URL}/api/opengraph-image?fid=${params.fid}`;

  // Render only the preview image
  return (
    <html>
      <head>
        <title>{APP_NAME} - Share</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#000' }}>
        <img
          src={shareImageUrl}
          alt={`Share image for ${params.fid}`}
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
        />
      </body>
    </html>
  );
}
