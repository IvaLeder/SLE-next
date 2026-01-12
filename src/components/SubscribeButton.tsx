"use client";

export function SubscribeButton() {
  const openPopup = () => {
    // Mailchimp adds this global function automatically
    // when the popup script loads.
    // @ts-expect-error Mailchimp form
    if (window.MC_FORM) window.MC_FORM.open();
    else console.warn("Mailchimp popup not loaded yet");
  };

  return (
    <button
      onClick={openPopup}
      className="px-4 py-2 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
    >
      Subscribe to Newsletter
    </button>
  );
}