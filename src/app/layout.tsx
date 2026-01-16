import "./globals.css";
import { Lora } from "next/font/google";
import Script from "next/script";

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.className}>
      <body>
        {children}

        <Script
          id="mcjs"
          src="https://chimpstatic.com/mcjs-connected/js/users/375a897a3f9418343fcbaf481/c773f4cf05070574aec78bc84.js"
          strategy="afterInteractive" />

      </body>
    </html>
  );
}
