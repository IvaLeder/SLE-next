import Image from "next/image";
import { heroImages } from "@/lib/hero-images";

export default function Hero({ lang }: { lang: "en" | "hr" }) {
  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      <Image
        src={heroImages[lang]}
        alt="Hero"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}