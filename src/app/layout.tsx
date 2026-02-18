import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LayerForge AI - AI-Native Design Platform',
  description: 'Deconstruct flat images into editable, multi-layered canvases with AI-powered tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
