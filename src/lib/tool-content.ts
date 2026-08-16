import type { Lang } from "@/lib/tools";

type LocalizedList = Record<Lang, readonly [string, string, string]>;

export interface ToolContent {
  steps: LocalizedList;
  learns: LocalizedList;
  note?: Record<Lang, string>;
}

/**
 * Crawlable, tool-specific guidance. Keeping this separate from the interactive
 * components means every detail page has useful content before JavaScript runs.
 */
export const TOOL_CONTENT: Record<string, ToolContent> = {
  "name-in-binary": {
    steps: {
      en: [
        "Type a name using up to 14 letters.",
        "Read each letter as an eight-digit pattern of 1s and 0s.",
        "Choose two bead colours and copy the pattern to make a bracelet.",
      ],
      hr: [
        "Upišite ime s najviše 14 slova.",
        "Pročitajte svako slovo kao osmeroznamenkasti niz jedinica i nula.",
        "Odaberite dvije boje perlica i prenesite uzorak na narukvicu.",
      ],
    },
    learns: {
      en: [
        "Computers represent characters with numbers.",
        "Binary uses only two symbols: 0 and 1.",
        "A digital pattern can become a physical design.",
      ],
      hr: [
        "Računala prikazuju znakove pomoću brojeva.",
        "Binarni zapis koristi samo dva znaka: 0 i 1.",
        "Digitalni niz može postati fizički uzorak.",
      ],
    },
  },
  "caesar-cipher": {
    steps: {
      en: [
        "Choose whether you want to encode or decode a message.",
        "Type the message and move the shift slider.",
        "Copy the result and challenge someone to reverse the shift.",
      ],
      hr: [
        "Odaberite želite li šifrirati ili dešifrirati poruku.",
        "Upišite poruku i pomaknite klizač.",
        "Kopirajte rezultat i izazovite nekoga da dekodira poruku.",
      ],
    },
    learns: {
      en: [
        "A substitution cipher replaces each letter by a rule.",
        "The alphabet wraps around after its final letter.",
        "Encoding and decoding use opposite shifts.",
      ],
      hr: [
        "Supstitucijska šifra zamjenjuje svako slovo prema pravilu.",
        "Abeceda se nakon zadnjeg slova vraća na početak.",
        "Šifriranje i dešifriranje koriste suprotne pomake.",
      ],
    },
  },
  "tower-of-hanoi": {
    steps: {
      en: [
        "Choose how many disks you want in the puzzle.",
        "Move one top disk at a time to another peg.",
        "Build the full tower on the last peg without placing a larger disk on a smaller one.",
      ],
      hr: [
        "Odaberite broj diskova u zagonetki.",
        "Premještajte po jedan gornji disk na drugi štap.",
        "Složite cijeli toranj na zadnjem štapu, uz uvjet da veći disk nikad ne bude na manjem.",
      ],
    },
    learns: {
      en: [
        "A large problem becomes manageable when split into smaller repeats.",
        "Every extra disk doubles most of the work.",
        "Planning ahead uses fewer moves than trial and error.",
      ],
      hr: [
        "Veliki problem postaje lakši kada ga podijelimo na manje ponavljajuće korake.",
        "Svaki dodatni disk približno udvostručuje posao.",
        "Planiranje unaprijed dovodi do cilja brže od nasumičnog pokušavanja.",
      ],
    },
  },
  "activity-spinner": {
    steps: {
      en: [
        "Press the spin button when you need an activity idea.",
        "Wait for the wheel to choose a hands-on project.",
        "Open the selected guide, gather the materials and start exploring.",
      ],
      hr: [
        "Pritisnite gumb za vrtnju kada trebate ideju za aktivnost.",
        "Pričekajte da kotač odabere praktični projekt.",
        "Otvorite odabrani članak, pripremite materijale i krenite istraživati.",
      ],
    },
    learns: {
      en: [
        "Random choice can make it easier to begin.",
        "Each result leads to a complete hands-on STEM guide.",
        "Repeating the spin creates a varied activity list.",
      ],
      hr: [
        "Nasumičan izbor može olakšati početak.",
        "Svaki rezultat vodi do cjelovitog praktičnog STEM članka.",
        "Ponovnim okretanjem možete dobiti različite aktivnosti.",
      ],
    },
  },
  "fraction-visualizer": {
    steps: {
      en: [
        "Set the denominator to divide one whole into equal parts.",
        "Set the numerator to colour some of those parts.",
        "Compare the pie, bar, decimal, percentage and simplified fraction.",
      ],
      hr: [
        "Postavite nazivnik kako biste cjelinu podijelili na jednake dijelove.",
        "Postavite brojnik kako biste obojili neke od tih dijelova.",
        "Usporedite krug, traku, decimalni broj, postotak i skraćeni razlomak.",
      ],
    },
    learns: {
      en: [
        "The denominator tells how many equal parts make the whole.",
        "The numerator tells how many parts are selected.",
        "Fractions, decimals and percentages can describe the same amount.",
      ],
      hr: [
        "Nazivnik govori na koliko je jednakih dijelova podijeljena cjelina.",
        "Brojnik govori koliko je dijelova odabrano.",
        "Razlomak, decimalni broj i postotak mogu opisivati istu količinu.",
      ],
    },
  },
  "multiplication-visualizer": {
    steps: {
      en: [
        "Choose two factors and view the fact as equal groups, an array or jumps on a number line.",
        "Flip the factors or split one factor into two easier parts to see why the product stays the same.",
        "Cross off fact families you understand, then practise the smaller set that remains.",
      ],
      hr: [
        "Odaberite dva faktora i prikažite množenje kao jednake skupine, polje ili skokove na brojevnoj crti.",
        "Okrenite faktore ili jedan faktor rastavite na dva lakša dijela i pratite zašto umnožak ostaje isti.",
        "Prekrižite skupine koje razumijete, a zatim vježbajte manji skup koji je preostao.",
      ],
    },
    learns: {
      en: [
        "Multiplication describes equal groups and rectangular arrays.",
        "Flipping the factors changes the arrangement but not the product.",
        "A difficult fact can be split into easier known facts and recombined.",
      ],
      hr: [
        "Množenje opisuje jednake skupine i pravokutna polja.",
        "Okretanje faktora mijenja raspored, ali ne i umnožak.",
        "Tešku činjenicu možemo rastaviti na lakše poznate činjenice i ponovno ih spojiti.",
      ],
    },
  },
  "pattern-maker": {
    steps: {
      en: [
        "Choose shapes, colours, pictures, letters or numbers.",
        "Complete the missing part of a repeating pattern or build your own.",
        "Print a worksheet to continue the activity away from the screen.",
      ],
      hr: [
        "Odaberite oblike, boje, sličice, slova ili brojeve.",
        "Dovršite dio niza koji nedostaje ili složite vlastiti niz.",
        "Ispišite radni list i nastavite aktivnost bez ekrana.",
      ],
    },
    learns: {
      en: [
        "Patterns repeat according to a predictable rule.",
        "Finding the smallest repeating unit reveals what comes next.",
        "Creating a pattern builds sequencing and early algebra skills.",
      ],
      hr: [
        "Nizovi se ponavljaju prema predvidivom pravilu.",
        "Najmanja ponavljajuća jedinica otkriva što dolazi sljedeće.",
        "Slaganje niza razvija razumijevanje redoslijeda i rane matematičke vještine.",
      ],
    },
  },
  "find-birthday-in-pi": {
    steps: {
      en: [
        "Enter a birthday or another short sequence of digits.",
        "Search the first million decimal places of pi.",
        "Read the position and surrounding digits when the sequence is found.",
      ],
      hr: [
        "Upišite datum rođenja ili neki drugi kratki niz znamenki.",
        "Pretražite prvih milijun decimala broja pi.",
        "Pogledajte položaj i okolne znamenke pronađenog niza.",
      ],
    },
    learns: {
      en: [
        "Pi has infinitely many decimal places and does not repeat in a fixed pattern.",
        "A short digit sequence may appear far into a long number.",
        "The position counts how deep into pi the match begins.",
      ],
      hr: [
        "Broj pi ima beskonačno mnogo decimala bez stalnog ponavljajućeg uzorka.",
        "Kratak niz znamenki može se pojaviti duboko unutar dugog broja.",
        "Položaj pokazuje na kojoj decimali broja pi počinje podudaranje.",
      ],
    },
  },
  clock: {
    steps: {
      en: [
        "Drag the hour and minute hands or use the step buttons.",
        "Compare the clock face with the time written in digits and words.",
        "Switch to practice mode and reveal the answer after making a guess.",
      ],
      hr: [
        "Povucite satnu i minutnu kazaljku ili koristite gumbe za pomicanje.",
        "Usporedite brojčanik s vremenom zapisanim brojkama i riječima.",
        "Uključite vježbu i otkrijte odgovor nakon pokušaja.",
      ],
    },
    learns: {
      en: [
        "One trip of the minute hand moves the hour hand to the next number.",
        "Each numbered interval represents five minutes.",
        "Analog time can be expressed in digits and everyday phrases.",
      ],
      hr: [
        "Jedan puni krug minutne kazaljke pomiče satnu na sljedeći broj.",
        "Svaki razmak između brojeva predstavlja pet minuta.",
        "Vrijeme na analognom satu možemo zapisati brojkama i riječima.",
      ],
    },
  },
  "morse-code": {
    steps: {
      en: [
        "Choose whether to translate text to Morse or Morse back to text.",
        "Type a message and read the dots and dashes.",
        "Press play to hear and see the timing of the signal.",
      ],
      hr: [
        "Odaberite prijevod teksta u Morseov kod ili Morseova koda u tekst.",
        "Upišite poruku i pročitajte točkice i crtice.",
        "Pritisnite reprodukciju kako biste čuli i vidjeli ritam signala.",
      ],
    },
    learns: {
      en: [
        "Morse code represents letters with short and long signals.",
        "Pauses separate parts of a letter, letters and words.",
        "The same code can travel as sound, light or written symbols.",
      ],
      hr: [
        "Morseov kod prikazuje slova kratkim i dugim signalima.",
        "Pauze razdvajaju dijelove slova, slova i riječi.",
        "Isti kod može putovati kao zvuk, svjetlo ili zapisani znakovi.",
      ],
    },
  },
  "developmental-leaps": {
    steps: {
      en: [
        "Choose the due-date or birth-date calculation.",
        "Enter the date to create an estimated calendar of ten leaps.",
        "Open each period to read the commonly described changes and skills.",
      ],
      hr: [
        "Odaberite izračun prema terminu poroda ili datumu rođenja.",
        "Upišite datum za približni kalendar deset skokova.",
        "Otvorite svako razdoblje i pročitajte često opisane promjene i vještine.",
      ],
    },
    learns: {
      en: [
        "The popular leap schedule is calculated from an estimated timeline.",
        "Children develop at different rates and may not match a calendar.",
        "Observing the individual child matters more than a predicted date.",
      ],
      hr: [
        "Popularni raspored skokova računa se prema približnoj vremenskoj crti.",
        "Djeca se razvijaju različitim tempom i ne moraju pratiti kalendar.",
        "Promatranje pojedinog djeteta važnije je od predviđenog datuma.",
      ],
    },
    note: {
      en: "This calculator is an educational planning aid, not a medical or developmental assessment. Contact a qualified healthcare professional if you have concerns about a child's development.",
      hr: "Ovaj kalkulator služi za informativno planiranje, a ne za medicinsku ili razvojnu procjenu. Ako ste zabrinuti za razvoj djeteta, obratite se kvalificiranom zdravstvenom stručnjaku.",
    },
  },
  "color-mixer": {
    steps: {
      en: [
        "Choose paint mixing or light mixing.",
        "Select two or three colours and adjust the tint or shade.",
        "Switch to the quiz to predict the result before revealing it.",
      ],
      hr: [
        "Odaberite miješanje boja ili miješanje svjetlosti.",
        "Odaberite dvije ili tri boje pa prilagodite svjetlinu ili sjenu.",
        "Uključite kviz i predvidite rezultat prije nego što ga otkrijete.",
      ],
    },
    learns: {
      en: [
        "Paint and coloured light combine in different ways.",
        "Primary colours create secondary and tertiary colours.",
        "Adding white makes a tint while adding black makes a shade.",
      ],
      hr: [
        "Slikarske boje i obojena svjetlost miješaju se na različite načine.",
        "Primarne boje stvaraju sekundarne i tercijarne boje.",
        "Dodavanjem bijele nastaje svjetliji ton, a dodavanjem crne sjena.",
      ],
    },
  },
};

export function getToolContent(toolKey: string): ToolContent | undefined {
  return TOOL_CONTENT[toolKey];
}
