import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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

export default function SharePage() {
  // Redirect to home page
  redirect('/');
}
