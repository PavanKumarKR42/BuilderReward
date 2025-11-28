import { APP_NAME } from './constants';

export function getMiniAppEmbedMetadata(imageUrl: string) {
  // This function returns a small object used by Farcaster's fc:frame metadata.
  // The exact shape can vary; include the important fields used by the client:
  return {
    type: 'mini_app',
    title: APP_NAME,
    preview: {
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    provider: {
      name: APP_NAME,
      url: imageUrl,
    },
  };
}
