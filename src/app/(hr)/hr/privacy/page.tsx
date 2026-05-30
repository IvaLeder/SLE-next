import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti | STEM Little Explorers",
  description: "Kako STEM Little Explorers prikuplja, koristi i štiti vaše osobne podatke.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/privacy",
    languages: {
      en: "https://stemlittleexplorers.com/en/privacy",
      hr: "https://stemlittleexplorers.com/hr/privacy",
    },
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/privacy" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10 prose prose-lg">
        <h1>Politika privatnosti</h1>
        <p className="lead">
          Ova politika privatnosti odnosi se na{" "}
          <strong>stemlittleexplorers.com</strong>.
        </p>

        <p>
          Ova pravila o privatnosti sastavljena su kako bismo bolje služili onima
          koji su zabrinuti kako se njihova &ldquo;osobna identifikacijska
          informacija&rdquo; (PII) upotrebljava na mreži. PII, kako je opisano u
          američkom zakonu o privatnosti i informacijskoj sigurnosti, jesu
          informacije koje se mogu koristiti same ili s drugim informacijama za
          identifikaciju, kontakt ili pronalaženje pojedine osobe, ili za
          prepoznavanje pojedinca u kontekstu. Pažljivo pročitajte naša pravila o
          privatnosti kako biste razumjeli kako prikupljamo, upotrebljavamo,
          štitimo ili na drugi način postupamo s vašim osobnim informacijama u
          skladu s našom web lokacijom.
        </p>

        <h2>Koje osobne podatke prikupljamo?</h2>
        <p>
          Prilikom naručivanja ili registracije na našu web lokaciju, prema potrebi,
          od vas će se možda tražiti da unesete svoje ime, adresu e-pošte, poštansku
          adresu ili druge pojedinosti kako bismo vam pomogli u vašem iskustvu.
        </p>

        <h2>Kada prikupljamo podatke?</h2>
        <p>
          Podatke prikupljamo kada se prijavite na našu stranicu, pretplatite se na
          newsletter, odgovorite na anketu, ispunite obrazac, unesete podatke na našu
          stranicu ili nam pošaljete povratne informacije o našim proizvodima ili
          uslugama.
        </p>

        <h2>Kako upotrebljavamo vaše podatke?</h2>
        <p>
          Možemo koristiti podatke koje prikupljamo od vas kada se registrirate,
          kupite, prijavite na naš newsletter, odgovorite na anketu ili marketinšku
          komunikaciju, surfate web stranicom ili koristite određene druge značajke
          web mjesta na sljedeće načine:
        </p>
        <ul>
          <li>Poboljšati našu web stranicu kako bismo vam bolje služili.</li>
          <li>
            Da bismo vam mogli bolje služiti u odgovoru na vaše zahtjeve za
            korisničkim uslugama.
          </li>
          <li>
            Poslati periodične poruke e-pošte u vezi s vašom narudžbom ili drugim
            proizvodima i uslugama.
          </li>
          <li>
            Pratiti s vama nakon dopisivanja (live chat, e-mail ili telefonski upit).
          </li>
        </ul>

        <h2>Kako štitimo vaše podatke?</h2>
        <ul>
          <li>
            Ne koristimo skeniranje ranjivosti i/ili skeniranje prema PCI standardima.
          </li>
          <li>
            Pružamo samo članke i informacije. Nikada ne tražimo brojeve kreditnih
            kartica.
          </li>
          <li>Koristimo redovito skeniranje zlonamjernog softvera.</li>
        </ul>
        <p>
          Ne upotrebljavamo SSL certifikat jer nikada ne tražimo brojeve kreditnih
          kartica niti dijelimo podatke s uslugama trećih strana.
        </p>

        <h2>Koristimo li &ldquo;kolačiće&rdquo;?</h2>
        <p>
          Da. Kolačići su male datoteke koje web mjesto ili njezin davatelj usluga
          prenosi na tvrdi disk vašeg računala putem vašeg web preglednika (ako to
          dopustite), a koje omogućavaju sustavima web mjesta ili davatelja usluga da
          prepoznaju vaš preglednik te snime i zapamte određene informacije.
          Upotrebljavamo kolačiće kako bismo razumjeli vaše postavke na temelju
          prethodnih ili trenutačnih aktivnosti na web-lokaciji, što nam omogućuje
          pružanje poboljšanih usluga. Također upotrebljavamo kolačiće koji nam
          pomažu u prikupljanju skupnih podataka o prometu na web-lokaciji i
          interakciji kako bismo ubuduće ponudili bolja iskustva i alate.
        </p>
        <p>Kolačiće upotrebljavamo kako bismo:</p>
        <ul>
          <li>Razumjeli i spremili postavke korisnika za buduće posjete.</li>
          <li>
            Sastavili zbirne podatke o prometu na web-lokaciji i interakcijama kako
            bismo u budućnosti ponudili bolja iskustva i alate. Također možemo
            koristiti usluge pouzdanih trećih strana koje prate ove informacije u naše
            ime.
          </li>
        </ul>
        <p>
          Možete odabrati da vas računalo upozori svaki put kada se kolačić šalje ili
          možete isključiti sve kolačiće. To možete učiniti putem postavki
          preglednika. Budući da je svaki preglednik malo drugačiji, pogledajte
          izbornik pomoći svog preglednika da biste saznali ispravan način izmjene
          kolačića. Ako isključite kolačiće, neke od značajki koje vašu web-lokaciju
          čine učinkovitijom možda neće ispravno funkcionirati.
        </p>

        <h2>Objavljivanje trećoj strani</h2>
        <p>
          Ne prodajemo, ne trgujemo niti na drugi način prenosimo vanjskim stranama
          vaše osobne podatke, osim ako korisnike unaprijed ne obavijestimo. To ne
          uključuje partnere za web hosting i druge strane koji nam pomažu u vođenju
          naše web stranice, obavljanju poslovanja ili služenju našim korisnicima, sve
          dok te strane pristanu zadržati taj podatak povjerljivim. Možemo također
          objaviti podatke kada je njihovo izdavanje prikladno za pridržavanje zakona,
          provođenje pravila našeg web mjesta ili zaštitu naših ili tuđih prava,
          imovine ili sigurnosti.
        </p>
        <p>
          Međutim, informacije o posjetiteljima koje nisu osobne mogu se dostaviti
          drugim stranama za marketing, oglašavanje ili druge svrhe.
        </p>

        <h2>Veze trećih strana</h2>
        <p>
          Na našoj web stranici ne uključujemo niti nudimo proizvode ili usluge trećih
          strana.
        </p>

        <h2>Google</h2>
        <p>
          Googleovi zahtjevi za oglašavanje mogu se sažeti pomoću{" "}
          <a
            href="https://support.google.com/adwordspolicy/answer/1316548?hl=en"
            target="_blank"
            rel="noreferrer"
          >
            Googleovih načela oglašavanja
          </a>
          . Postavljena su kako bi pružila pozitivno iskustvo za korisnike.
        </p>
        <p>
          Koristimo Google AdSense oglašavanje na našoj web stranici. Google, kao
          dobavljač treće strane, koristi kolačiće za prikazivanje oglasa na našoj web
          stranici. Googleova upotreba DART kolačića omogućuje mu posluživanje oglasa
          korisnicima na temelju prethodnih posjeta našoj web stranici i drugim web
          stranicama na Internetu. Korisnici mogu odustati od korištenja DART kolačića
          posjetom pravilima o privatnosti za Google oglas i sadržajnu mrežu.
        </p>
        <p>Primijenili smo sljedeće:</p>
        <ul>
          <li>Izvješćivanje o pojavljivanjima na Google prikazivačkoj mreži</li>
          <li>Izvještavanje o demografskim podacima i interesima</li>
        </ul>
        <p>
          Mi, zajedno s dobavljačima treće strane kao što je Google, upotrebljavamo
          kolačiće prve strane (kao što su kolačići Google Analyticsa) i kolačiće
          treće strane (poput kolačića DoubleClick) ili druge identifikatore treće
          strane za prikupljanje podataka o interakcijama korisnika s pojavljivanjima
          oglasa i drugim funkcijama servisnih usluga koje se odnose na našu web
          stranicu.
        </p>
        <p>
          <strong>Isključivanje:</strong> Korisnici mogu postaviti postavke za način
          na koji im Google oglašava pomoću stranice Postavke Google oglasa. Umjesto
          toga, možete se isključiti posjetom stranici za isključivanje Network
          Advertising Initiative ili upotrebom dodatka za preglednik za isključivanje
          usluge Google Analytics.
        </p>

        <h2>Zakon o zaštiti privatnosti na internetu u Kaliforniji (CalOPPA)</h2>
        <p>
          CalOPPA je prvi državni zakon u zemlji koji od komercijalnih web stranica i
          online usluga zahtijeva objavljivanje pravila o privatnosti. Doseg zakona
          proteže se daleko izvan Kalifornije te zahtijeva od bilo koje osobe ili
          tvrtke u Sjedinjenim Američkim Državama (i vjerojatno svijetu) koja upravlja
          web stranicama koje prikupljaju osobne podatke od potrošača u Kaliforniji da
          na svojoj internetskoj stranici postavi jasnu politiku privatnosti, navodeći
          upravo podatke koji se prikupljaju i one pojedince ili tvrtke s kojima se
          dijele.
        </p>
        <p>Prema CalOPPA, slažemo se sa sljedećim:</p>
        <ul>
          <li>Korisnici mogu posjetiti našu stranicu anonimno.</li>
          <li>
            Nakon što se izrade ova pravila o privatnosti, dodat ćemo vezu na njih na
            našoj početnoj stranici ili, kao minimum, na prvoj značajnoj stranici
            nakon ulaska na našu web stranicu.
          </li>
          <li>
            Naša veza Pravila o privatnosti sadrži riječ &ldquo;Privatnost&rdquo; i
            lako se može pronaći na gore navedenoj stranici.
          </li>
          <li>
            Bit ćete obaviješteni o svim izmjenama pravila o privatnosti na ovoj
            stranici.
          </li>
          <li>Svoje osobne podatke možete promijeniti tako da nas kontaktirate.</li>
        </ul>

        <h2>Kako naša web-lokacija obrađuje &ldquo;Ne prati&rdquo; signale?</h2>
        <p>
          Poštujemo &ldquo;Ne prati&rdquo; signale te ne pratimo, ne postavljamo
          kolačiće niti koristimo oglašavanje kada je mehanizam preglednika &ldquo;Ne
          prati&rdquo; (DNT) uspostavljen.
        </p>

        <h2>Dopušta li naša web-lokacija praćenje ponašanja treće strane?</h2>
        <p>
          Također je važno napomenuti da dopuštamo praćenje ponašanja treće strane.
        </p>

        <h2>COPPA (Zakon o zaštiti privatnosti djece na internetu)</h2>
        <p>
          Kada je riječ o prikupljanju osobnih podataka djece mlađe od 13 godina,
          Zakon o zaštiti privatnosti djece na internetu (COPPA) stavlja roditelje u
          kontrolu. Savezna trgovinska komisija, agencija za zaštitu potrošača
          Sjedinjenih Američkih Država, primjenjuje COPPA pravilo, koje navodi što
          operatori web stranica i mrežnih usluga moraju poduzeti kako bi zaštitili
          privatnost i sigurnost djece na internetu.
        </p>
        <p>Ne oglašavamo se izravno djeci mlađoj od 13 godina.</p>

        <h2>Fair Information Practices</h2>
        <p>
          Načela Fair Information Practices čine okosnicu zakona o privatnosti u
          Sjedinjenim Američkim Državama, a koncepti koje sadrže imaju značajnu ulogu
          u razvoju zakona o zaštiti podataka širom svijeta. Razumijevanje načela Fair
          Information Practices i načina na koji ih treba provoditi ključno je za
          usklađivanje s različitim zakonima o privatnosti koji štite osobne podatke.
        </p>
        <p>
          Kako bismo bili u skladu s Fair Information Practices, poduzet ćemo sljedeće
          reakcijske mjere ukoliko dođe do kršenja podataka:
        </p>
        <ul>
          <li>Obavijestit ćemo vas e-poštom u roku od 1 radnog dana.</li>
          <li>
            Obavijestit ćemo korisnike putem obavijesti na licu mjesta u roku od 1
            radnog dana.
          </li>
        </ul>
        <p>
          Također se slažemo s načelom individualne pravne zaštite (Individual Redress
          Principle), koje zahtijeva da pojedinci imaju pravo zakonski ostvarivati
          primjenjiva prava protiv prikupljača i obrađivača podataka koji se ne
          pridržavaju zakona. Ovo načelo zahtijeva ne samo da pojedinci imaju ovršiva
          prava prema korisnicima podataka, već i da pojedinci imaju mogućnost
          pribjeći sudovima ili vladinim agencijama radi istrage i/ili gonjenja
          nepoštivanja od strane obrađivača podataka.
        </p>

        <h2>CAN-SPAM Act</h2>
        <p>
          CAN-SPAM Act je zakon koji određuje pravila za komercijalnu e-poštu,
          utvrđuje zahtjeve za komercijalne poruke, daje primateljima pravo da
          zaustave slanje poruka e-pošte i navodi teške kazne za prekršaje.
        </p>
        <p>Prikupljamo vašu adresu e-pošte kako bismo:</p>
        <ul>
          <li>
            Slali informacije, odgovarali na upite i/ili druge zahtjeve ili pitanja.
          </li>
          <li>
            Slali sadržaj našoj mailing listi ili nastavili slati e-poštu našim
            klijentima nakon što se dogodila izvorna transakcija.
          </li>
        </ul>
        <p>Kako bismo bili u skladu s CAN-SPAM, prihvaćamo sljedeće:</p>
        <ul>
          <li>Ne koristiti lažne ili obmanjujuće teme ili adrese e-pošte.</li>
          <li>Označiti poruku kao oglas na neki razuman način.</li>
          <li>Uključiti fizičku adresu našeg poslovanja ili sjedišta web mjesta.</li>
          <li>
            Pratiti usluge trećih strana za marketing e-pošte radi usklađenosti, ako
            se koriste.
          </li>
          <li>Brzo poštovati zahtjeve za isključivanje/odjavu.</li>
          <li>
            Dopustiti korisnicima otkazivanje pretplate pomoću veze pri dnu svake
            e-pošte.
          </li>
        </ul>
        <p>
          Ako u bilo kojem trenutku želite otkazati pretplatu na primanje budućih
          poruka e-pošte, slijedite upute pri dnu svake e-pošte i odmah ćemo vas
          ukloniti iz svega dopisivanja.
        </p>

        <h2>Kontaktirajte nas</h2>
        <p>
          Ako imate pitanja u vezi s ovim pravilima o privatnosti, možete nas
          kontaktirati pomoću dolje navedenih informacija.
        </p>
        <address className="not-italic">
          stemlittleexplorers.com
          <br />
          Zagreb, Grad Zagreb 10000
          <br />
          Hrvatska
          <br />
          <a href="mailto:stem.littleexplorers@gmail.com">
            stem.littleexplorers@gmail.com
          </a>
        </address>
        <p className="text-gray-500 text-sm">Posljednja izmjena: 2017-08-11.</p>
        <p>
          Možete nas kontaktirati i u bilo kojem trenutku putem{" "}
          <Link href="/hr/contact">stranice za kontakt</Link>.
        </p>
      </main>
      <Footer lang="hr" />
    </>
  );
}
