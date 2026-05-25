import "./globals.css";
import { Lora } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "700"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware stamps x-pathname so we can derive the correct lang here.
  // This keeps <html lang> accurate for every language segment without
  // restructuring the route tree.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const lang = pathname.startsWith("/hr") ? "hr" : "en";

  return (
    <html lang={lang} className={lora.className}>
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
