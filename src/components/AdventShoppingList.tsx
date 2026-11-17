import { affiliateSearchUrl, STOREFRONTS } from "@/lib/affiliate";
import type { SeasonalLang } from "@/lib/seasonal";

/**
 * "One shopping list for all 24 doors" on the STEM Advent Calendar landing.
 * Only the supplies worth ordering ahead; kitchen staples are left out. Each
 * item is an affiliate search link (see src/lib/affiliate.ts) and names the
 * doors that use it, so the numbers must stay in step with advent-doors.json.
 *
 * English only for now: the Croatian storefront (amazon.de) has no Associates
 * tag and Croatian readers mostly shop locally, so the HR page renders nothing.
 */
type Item = { name: string; q: string; doors: number[] };
type Week = { title: string; days: string; items: Item[] };

const WEEKS: Week[] = [
  {
    title: "Week 1",
    days: "Doors 1 to 7",
    items: [
      { name: "Baking soda, a big bag", q: "baking soda 2 lb", doors: [1, 7] },
      { name: "White hair conditioner", q: "white hair conditioner", doors: [1, 7] },
      { name: "Balloons", q: "latex balloons 12 inch assorted", doors: [2] },
      { name: "White tissue paper", q: "white tissue paper sheets", doors: [2, 3] },
      { name: "Star and heart cookie cutters", q: "christmas cookie cutters star heart tree", doors: [5] },
      { name: "Acrylic paint set", q: "acrylic craft paint set kids", doors: [6, 14, 19, 20] },
      { name: "Paint brushes", q: "paint brushes kids craft set", doors: [6, 19, 20] },
      { name: "Narrow ribbon", q: "christmas ribbon narrow red", doors: [6, 18] },
    ],
  },
  {
    title: "Week 2",
    days: "Doors 8 to 14",
    items: [
      { name: "Red, green and gold paper", q: "red green gold craft paper sheets", doors: [8] },
      { name: "Red and white pipe cleaners", q: "red white pipe cleaners chenille stems", doors: [10] },
      { name: "Liquid food coloring", q: "liquid food coloring set", doors: [11] },
      { name: "Jingle bells", q: "jingle bells craft small", doors: [11] },
      { name: "Cinnamon sticks", q: "cinnamon sticks 3 inch", doors: [11, 18] },
      { name: "Glycerin", q: "vegetable glycerin food grade", doors: [12] },
      { name: "Fine silver glitter", q: "fine silver glitter craft", doors: [12, 14] },
      { name: "Mini bottle-brush trees", q: "mini bottle brush trees", doors: [12] },
      { name: "Craft sticks", q: "jumbo craft sticks popsicle", doors: [13] },
      { name: "White pom poms", q: "white pom poms craft", doors: [13] },
      { name: "Fizzing tablets", q: "effervescent antacid tablets", doors: [14] },
    ],
  },
  {
    title: "Week 3",
    days: "Doors 15 to 21",
    items: [
      { name: "Split pins (brass fasteners)", q: "brass paper fasteners split pins", doors: [15] },
      { name: "Brown origami paper", q: "brown kraft origami paper square", doors: [16] },
      { name: "Red and white pony beads", q: "red white pony beads", doors: [17] },
      { name: "Googly eyes", q: "googly eyes assorted sizes self adhesive", doors: [18] },
      { name: "Low-temperature hot glue gun", q: "mini hot glue gun low temp", doors: [18, 20] },
      { name: "Mini pom poms", q: "mini pom poms craft assorted", doors: [19] },
      { name: "Wooden skewers", q: "bamboo wooden skewers", doors: [10, 21] },
    ],
  },
  {
    title: "Week 4",
    days: "Doors 22 to 24",
    items: [
      { name: "Low-voltage LEDs", q: "LED diodes assorted 3mm 5mm", doors: [22] },
      { name: "Copper nails", q: "copper nails", doors: [22] },
      { name: "Zinc (galvanized) nails", q: "galvanized nails", doors: [22] },
      { name: "Alligator clip leads", q: "alligator clip test leads", doors: [22] },
    ],
  },
];

const COPY = {
  title: "One shopping list for all 24 doors",
  body: "Most doors use things you already have at home. These are the few supplies worth ordering before 1 December, grouped by week so nothing runs out halfway through.",
  door: "Door",
  doors: "Doors",
  disclosure: "As an Amazon Associate I earn from qualifying purchases. It costs you nothing extra.",
};

export default function AdventShoppingList({ lang }: { lang: SeasonalLang }) {
  if (lang !== "en") return null;

  return (
    <section id="shopping-list" className="mt-6 scroll-mt-20 rounded-3xl bg-[#FBF7EE] p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900">
        <span aria-hidden="true">🛒 </span>
        {COPY.title}
      </h2>
      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-gray-700">{COPY.body}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {WEEKS.map((week) => (
          <div key={week.title} className="rounded-2xl bg-white p-5 font-sans shadow-sm ring-1 ring-black/5">
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-[#9F1F35]">{week.title}</span>
              <span className="text-xs text-gray-500">{week.days}</span>
            </p>
            <ul className="mt-3 space-y-2">
              {week.items.map((item) => (
                <li key={item.name} className="flex items-baseline justify-between gap-3 text-[15px]">
                  <a
                    href={affiliateSearchUrl("en", item.q)}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="font-medium text-gray-800 underline decoration-[#E9B949] underline-offset-2 hover:text-[#9F1F35]"
                  >
                    {item.name}
                  </a>
                  <span className="shrink-0 text-xs text-gray-500">
                    {item.doors.length > 1 ? COPY.doors : COPY.door} {item.doors.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Only claim to be an Associate once the storefront's tag is set. */}
      {STOREFRONTS.en.tag && <p className="mt-4 font-sans text-[13px] leading-relaxed text-gray-600">{COPY.disclosure}</p>}
    </section>
  );
}
