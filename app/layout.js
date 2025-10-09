import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Partner App - Delivery Partner Dashboard",
  description: "Manage your deliveries, track earnings, and grow with our delivery platform",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0c90f0",
};

import { OrderProvider } from './contexts/OrderContext';
import { ProfileProvider } from './contexts/ProfileContext';
import GlobalOrderListener from '../components/GlobalOrderListener.jsx';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="theme-color" content="#0c90f0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <OrderProvider>
          <ProfileProvider>
            {children}
            {/* Global, cross-page order listener & popup */}
            <GlobalOrderListener />
          </ProfileProvider>
        </OrderProvider>
      </body>
    </html>
  );
}
