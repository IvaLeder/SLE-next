"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Site-wide replacement for `next/link`: prefetch on intent, not on sight.
 *
 * Next's default prefetches every link that scrolls into view, and each
 * prefetch is ~3 separate requests (route segments). One fully scrolled
 * article made 136 requests, 88 of them prefetches of pages the reader never
 * opened (measured 2026-11-20). Vercel bills every one as a CDN request, and
 * the Pro plan's included tier is 1M a month.
 *
 * So links start with `prefetch={false}` and switch to the default (`null`)
 * the moment the reader hovers, focuses or touches them: the same
 * hover-prefetch pattern as the Next.js prefetching guide. Desktop clicks
 * still feel instant; on mobile the page loads on tap, which for these static
 * pages is a single fast CDN hit.
 *
 * An explicit `prefetch` prop from the caller always wins. Import this, not
 * `next/link` (ESLint enforces it).
 */
export default function Link({
  prefetch,
  onMouseEnter,
  onTouchStart,
  onFocus,
  ...rest
}: LinkProps) {
  const [intent, setIntent] = useState(false);
  return (
    <NextLink
      {...rest}
      prefetch={prefetch !== undefined ? prefetch : intent ? null : false}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
