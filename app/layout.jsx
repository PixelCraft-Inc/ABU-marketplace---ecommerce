// Removed next/font/google import due to build-time fetch failures in CI/local environment.
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { assets } from '@/assets/assets'

// Using system font fallback instead of fetching Google Fonts during build.

export const metadata = {
    title: "ABU Marketplace - Shop smarter",
    description: "ABU Marketplace - Shop smarter",
    icons: {
        icon: assets.Abulogo?.src ?? '/assets/Abulogo.png',
        shortcut: assets.Abulogo?.src ?? '/assets/Abulogo.png',
        apple: assets.Abulogo?.src ?? '/assets/Abulogo.png'
    }
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
        <html lang="en">
            <body className={`antialiased`}>
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
        </ClerkProvider>
    );
}
