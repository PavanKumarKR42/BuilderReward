import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Builder Market Value Calculator',
  description: 'Calculate Your Builder Market Worth from the $100M Reward Pool',
  metadataBase: new URL('https://builder-reward.vercel.app/'),
  openGraph: {
    title: 'Builder Market Value Calculator',
    description: 'Calculate Your Builder Market Worth from the $100M Reward Pool',
    images: ['/image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://builder-reward.vercel.app/image.png",
      button: {
        title: "CALCULATE VALUE",
        action: {
          type: "launch_frame",
          name: "Builder Value",
          url: "https://builder-reward.vercel.app/",
          splashImageUrl: "https://builder-reward.vercel.app/splash.gif",
          splashBackgroundColor: "#8b5cf6"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}