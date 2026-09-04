"use client";

import dynamic from "next/dynamic";

// YouTube.tsx carries the build-time video metadata catalogue used for
// VideoObject markup. Keep that catalogue out of articles with no video while
// preserving server-rendered thumbnails and schema on articles that use one.
const LazyYouTube = dynamic(() => import("./YouTube"));

export default LazyYouTube;
