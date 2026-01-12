import "./globals.css";
import { Lora } from "next/font/google";

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lora.className}>
      <body>{children}</body>
    </html>
  );
}

{/* Mailchimp Popup Script */}
<script
  type="text/javascript"
  src="https://chimpstatic.com/mcjs-connected/js/users/YOUR_ID_HASH.js"
  async
></script>