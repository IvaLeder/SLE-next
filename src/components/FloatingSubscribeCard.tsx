import { SubscribeButton } from "./SubscribeButton";

// Floating Subscribe Card Component
export default function FloatingSubscribeCard() {
  return (
    <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="w-52 p-4 rounded-2xl shadow-md border border-neutral-200 bg-white flex flex-col items-center gap-3 text-center">
        {/* Icon + Text Row */}
        <div className="flex items-center gap-2 justify-center">
          <div className="text-xl">📨</div>
          <div className="font-semibold text-sm">Get new posts!</div>
        </div>

        {/* Subscribe Button */}
        <SubscribeButton />
      </div>
    </div>
  );
}
