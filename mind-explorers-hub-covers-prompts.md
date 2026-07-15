# Hub-visible covers — Phase 2a generation prompts (2026-07-14)

The 4 old-style covers currently visible on the Mind Explorers hub (`/en/minds` + `/hr/um` latest-6 grid). All are Tier-2 "free" per the 2026-07-13 GSC pull (<10 image clicks/yr each), so they're swapped ahead of the Phase-1 monitoring gate. Decision noted in BACKLOG §5b (Phase 2a).

**Workflow (same as Phase 1):**
1. Generate in AI Studio at 2K, **16:9 landscape** (existing covers are 1920×1080). Attach the approved master references (trio day hero + Aska solo refs) as ingredients to every run — they outrank the words.
2. Generate 4–8 runs each, curate. One winning image per article.
3. Hand the winners back to Claude → resize 1600w, mozjpeg q85, save to BOTH EN+HR filenames (in place, extensions stay `.jpg`), rewrite heroAlts, run `npm run images`, validate.

**Shared style block (append to every prompt):**

> STYLE: hand-painted paper collage illustration in the style of classic children's picture books, shapes cut from paper hand-painted with visible textured brushstrokes and soft color variation, crisp cut edges with painterly surfaces, subtle layered drop shadows between paper layers, muted cozy palette of deep plum (#4C3A72), warm gold (#E8B454), dusty rose (#D9A5A0), cream (#FAF6EE) and cocoa brown (#5C4A42), a single gold thread running-stitch path detail, calm and warm mood, no outlines, no text

**Lea (locked description, paste where the prompt says [LEA]):**

> Lea, a curious toddler girl about two years old, built from simple rounded hand-painted paper shapes: a large round head, small plush body, warm light skin, rosy paper cheeks, big round grey eyes, a tiny nose, and short wavy honey-brown hair with soft bangs and two small rounded pigtails tied with small plum hair ties. She wears dusty rose overalls with one gold stitched star on the chest pocket over a cream long-sleeve shirt, and small brown shoes.

**Aska (locked description, only cover #1 uses her — paste where the prompt says [ASKA]):**

> Aska, a stylized Old English Sheepdog character built from soft scalloped cloud shapes cut from hand-painted paper — white head, chest and front legs, soft grey saddle over her back and hindquarters — with a shaggy grey paper fringe fully covering her eyes (her eyes are never visible in any pose or angle), a big round charcoal nose, a small gentle smile, and a deep purple-plum fabric collar (#4C3A72, never burgundy or wine-red) with a small gold star tag.

Distinct-silhouette rule: each cover reads differently as a thumbnail — (1) vertical block tower, (2) armful of treasures, (3) running on the ribbon road, (4) easel painting coming alive.

---

## 1. Toddler at 2 years 9 months — block tower + sleeping Aska ✅ DONE 2026-07-15

Article themes: sleep troubles, outdoor play and immunity, playing independently.

**Files (overwrite in place):**
- `public/images/posts/What-to-expect-from-Toddler-with-Two-years-and-Nine-Months-Cover-Image.jpg`
- `public/images/posts/Sto-ocekivati-od-djeteta-s-Dvije-Godine-i-Devet-Mjeseci-Pocetna-Slika.jpg`

**Prompt:**

> [LEA] stands concentrating on her own, carefully placing the top block on a tall wobbly tower of hand-painted paper blocks in plum, gold, dusty rose and cocoa, taller than she is. Behind her, [ASKA] lies curled up fast asleep like a big soft cloud-blanket on a low dusty rose paper hill. Luma, a small four-pointed golden star-spark with a soft warm glow halo, floats just above the top block, as if crowning the tower. Cream hand-painted paper sky with two soft torn-paper clouds, a single gold running-stitch path winding along the ground. Composition: tower and Lea left of center, Aska curled low on the right, generous negative space above, 16:9.

**heroAlt EN:** `Papercut illustration of a toddler stacking a tall tower of paper blocks while a sheepdog sleeps behind her - what to expect from a toddler at two years and nine months`
**heroAlt HR:** `Papirnata ilustracija djeteta koje samostalno slaže visoki toranj od kockica dok pas spava iza njega - što očekivati od djeteta s dvije godine i devet mjeseci`

## 2. Three-year-old child — armful of collected treasures ✅ DONE 2026-07-14

Article themes: big emotions, learning frenzy, imitating parents, "we need everything!".

**Files (overwrite in place):**
- `public/images/posts/What-to-expect-from-a-Three-Years-old-Child-Cover-Image.jpg`
- `public/images/posts/Sto-ocekivati-od-Tri-Godine-starog-Djeteta-Pocetna-slika.jpg`

**Prompt:**

> [LEA] marches proudly along a gold running-stitch path carrying a huge armful of collected treasures cut from hand-painted paper — a big cocoa pinecone, plum and gold leaves, a crooked stick, a rose flower — the pile so tall it almost hides her beaming face. One gold leaf is falling behind her. Luma, a small four-pointed golden star-spark with a soft warm glow halo, hovers ahead of her at the path's bend, leading the way. Layered paper hills in muted rose, taupe and cocoa with small paper plants, cream hand-painted paper sky. Composition: Lea right of center walking left-to-right, Luma upper left, generous negative space, 16:9.

**heroAlt EN:** `Papercut illustration of a three year old girl proudly carrying a huge armful of leaves, sticks and treasures - what to expect from a three year old child`
**heroAlt HR:** `Papirnata ilustracija trogodišnje djevojčice koja ponosno nosi veliko naramje lišća, grančica i blaga - što očekivati od tri godine starog djeteta`

## 3. Three-and-a-half-year-old — running on the ribbon road, imagination clouds ✅ DONE 2026-07-15

Article themes: constant movement, rich imagination, doing it "my way", ultralearning.

**Files (overwrite in place):**
- `public/images/posts/What-to-expect-from-a-Three-and-a-half-years-old-Child-Cover-Image.jpg`
- `public/images/posts/Sto-ocekivati-od-tri-i-pol-godine-starog-djeteta-Pocetna-Slika.jpg`

**Prompt:**

> [LEA] runs joyfully mid-stride along a wide gently curving ribbon road of dusty rose hand-painted paper that sweeps across layered paper hills, her pigtails flying. In the cream hand-painted paper sky above her, three soft torn-paper clouds are subtly shaped like a rabbit, a whale and a dragon — clouds her imagination is turning into animals. Luma, a small four-pointed golden star-spark with a soft warm glow halo, races just ahead of her above the road. A single gold running-stitch line runs along the center of the ribbon road. Composition: road entering lower left and sweeping right, Lea center-left in full run, generous sky, 16:9.

**heroAlt EN:** `Papercut illustration of a girl running along a ribbon road under clouds shaped like animals - what to expect from a three and a half year old child`
**heroAlt HR:** `Papirnata ilustracija djevojčice koja trči cestom od vrpce ispod oblaka u obliku životinja - što očekivati od tri i pol godine starog djeteta`

## 4. Four-year-old child — easel painting coming alive ✅ DONE 2026-07-14

Article themes: imagination and roleplay, drawing and describing pictures, narrating plans.

**Files (overwrite in place):**
- `public/images/posts/What-to-expect-from-a-Four-years-old-Child-Cover-Image.jpg`
- `public/images/posts/Sto-ocekivati-od-cetverogodisnjeg-djeteta-Pocetna-Slika.jpg`

**Prompt:**

> [LEA] stands at a small wooden paper-collage easel, holding a big paintbrush with a dab of gold paint, painting a picture of rolling hills and a star. The painting is coming alive: two painted paper butterflies in plum and gold are lifting off the canvas into the air, trailing a thin gold running-stitch line. Luma, a small four-pointed golden star-spark with a soft warm glow halo, floats beside the escaping butterflies. Soft cream hand-painted paper background with a low dusty rose paper hill, a few small paper plants. Composition: easel and Lea left of center in profile, butterflies and Luma rising to the upper right, generous negative space, 16:9.

**heroAlt EN:** `Papercut illustration of a four year old girl painting at an easel as paper butterflies fly off her picture - what to expect from a four year old child`
**heroAlt HR:** `Papirnata ilustracija četverogodišnje djevojčice koja slika na štafelaju dok papirnati leptiri izlijeću iz njezine slike - što očekivati od četverogodišnjeg djeteta`

---

**Watch-outs from Phase 1:** collar drifts to burgundy (say "deep purple-plum #4C3A72" verbatim); Aska's eyes appear if the clause is omitted; Lea renders too smooth next to Aska — if so add "her hair and clothes cut from hand-painted paper with visible brushstrokes"; models add text/labels — the "no text" in the style block usually holds but check every run.

**Not touched:** the anti-stress-ball cover also shows on the hub but stays STEM (traffic-protected, ~listed under OUT in BACKLOG §5b). The hub grid will be 5/6 papercut after this batch.
