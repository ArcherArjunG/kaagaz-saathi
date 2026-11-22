import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "कागज़ साथी | KaagazSathi",
  description: "Understand important papers in the language you prefer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
