export type Guide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  /** Rough reading length for UI */
  minutes: number;
  sections: {
    heading: string;
    paragraphs: string[];
    list?: string[];
  }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
};

export const GUIDES: Guide[] = [
  {
    slug: "saelg-iphone-danmark",
    title: "Sælg iPhone i Danmark",
    description:
      "Overblik over hvordan du sælger en brugt iPhone i Danmark — privat, til professionelle købere, og hvordan iBud hjælper dig med at finde det bedste bud.",
    eyebrow: "Guide",
    lede: "Du kan sælge privat, bytte i butik eller sende til en online køber. Her er forskellen — og hvordan du finder det bedste bud uden at tjekke alt manuelt.",
    minutes: 6,
    sections: [
      {
        heading: "Tre typiske veje",
        paragraphs: [
          "Når du skal sælge en brugt iPhone i Danmark, lander de fleste i én af tre kategorier: privat salg, trade-in hos en forhandler, eller salg til en professionel køber der specialiserer sig i brugte telefoner.",
          "Privat salg kan give den højeste pris — men du bruger tid på annoncer, møder og risiko. Trade-in er nemt, men buddet er ofte lavere. Professionelle købere ligger midt imellem: du får et klart tilbud, sender eller afleverer telefonen, og får udbetaling når den er vurderet.",
        ],
      },
      {
        heading: "Hvorfor buddene varierer",
        paragraphs: [
          "Køberne vægter lager, stand, efterspørgsel og deres egen lagerbeholdning forskelligt. Det samme iPhone-model kan derfor få markant forskellige estimater samme dag.",
          "Det er derfor det betaler sig at sammenligne — ikke bare vælge det første sted du kender.",
        ],
        list: [
          "Model og lagerstørrelse",
          "Stand (funktion, skærm, kosmetik, batteri)",
          "Om du sælger online eller i butik",
          "Hvor hurtigt du vil have pengene",
        ],
      },
      {
        heading: "Hvordan iBud hjælper",
        paragraphs: [
          "iBud er lavet til én ting: at pege dig det rigtige sted hen. Du søger din model, vælger lager og stand, og vi henter estimater fra flere danske købere. Det højeste bud står først — med link videre.",
          "Vi køber ikke din telefon. Du handler direkte med stedet. Buddene er estimater; den endelige pris aftales typisk efter inspektion.",
        ],
      },
      {
        heading: "Sådan kommer du i gang",
        paragraphs: [
          "Start med at finde din model. Vær ærlig om standen — det sparer dig for skuffelser senere. Sammenlign buddene, vælg det sted der passer dig, og følg deres flow for forsendelse eller butiksbesøg.",
        ],
      },
    ],
    faqs: [
      {
        question: "Hvor får jeg mest for min iPhone i Danmark?",
        answer:
          "Det ændrer sig løbende. Sammenlign aktuelle estimater på iBud — så ser du, hvilket sted byder højest for din model, lager og stand lige nu.",
      },
      {
        question: "Er privat salg altid bedst?",
        answer:
          "Privat salg kan give højere pris, men kræver mere arbejde og bærer mere risiko. Professionelle købere er ofte hurtigere og mere forudsigelige.",
      },
    ],
    relatedSlugs: [
      "hvad-er-min-iphone-vaerd",
      "privat-vs-professionel",
      "stand-ved-salgsvurdering",
    ],
  },
  {
    slug: "hvad-er-min-iphone-vaerd",
    title: "Hvad er min iPhone værd?",
    description:
      "Lær hvad der afgør værdien af din brugte iPhone — model, lager og stand — og hvordan du får et aktuelt estimat på iBud.",
    eyebrow: "Guide",
    lede: "Værdien er ikke én fast pris. Den afhænger af model, lager, stand og hvad køberne byder lige nu. Her er det, der betyder mest.",
    minutes: 5,
    sections: [
      {
        heading: "Model er udgangspunktet",
        paragraphs: [
          "Nyere modeller og Pro-varianter ligger typisk højere. Ældre modeller falder i værdi, men kan stadig være værd at sælge — især hvis standen er fin.",
          "På iBud vælger du præcis din model, så estimaterne matcher det, du faktisk har.",
        ],
      },
      {
        heading: "Lager gør en forskel",
        paragraphs: [
          "128 GB og 256 GB er ofte de mest efterspurgte. Større lager kan give et højere bud, men forskellen afhænger af modellen og markedet.",
          "Vælg den lagerstørrelse, der står i Indstillinger → Generelt → Om denne iPhone, hvis du er i tvivl.",
        ],
      },
      {
        heading: "Stand vejer tungt",
        paragraphs: [
          "En telefon der virker normalt, har intakt skærm og pæn kosmetik får typisk det bedste bud. Ridser, revner, dårligt batteri eller funktionsfejl trækker prisen ned.",
          "Vær ærlig i vurderingen. Et for rosende estimat ender ofte med en lavere endelig pris efter inspektion.",
        ],
      },
      {
        heading: "Få et bud nu",
        paragraphs: [
          "Det bedste svar på “hvad er min iPhone værd?” er et aktuelt estimat. Brug iBud: søg din model, vælg lager og stand, og se buddene rangeret med det bedste først.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kan jeg få en præcis pris online?",
        answer:
          "Onlinebud er næsten altid estimater. Den endelige pris aftales typisk, når stedet har set eller testet telefonen.",
      },
      {
        question: "Falder værdien hurtigt?",
        answer:
          "Ja, især lige efter nye model-lanceringer. Hvis du overvejer at sælge, kan det betale sig at sammenligne bud snart frem for at vente.",
      },
    ],
    relatedSlugs: [
      "stand-ved-salgsvurdering",
      "saelg-iphone-danmark",
      "forbered-telefonen",
    ],
  },
  {
    slug: "stand-ved-salgsvurdering",
    title: "Stand ved salgsvurdering",
    description:
      "Hvad betyder stand, når du sælger din iPhone? Få styr på funktion, skærm, kosmetik og batteri — så estimatet matcher den endelige pris.",
    eyebrow: "Guide",
    lede: "Stand er ofte det, der skiller et godt bud fra et skuffende. Her er hvad køberne typisk kigger efter — og hvordan du beskriver det ærligt.",
    minutes: 5,
    sections: [
      {
        heading: "Fungerer telefonen normalt?",
        paragraphs: [
          "Køberne starter med det basale: tænder den, kan den ringe, bruge Wi-Fi, kamera og knapper? Hvis noget er i stykker, falder buddet — eller tilbuddet kan blive afvist.",
          "På iBud spørger vi, om telefonen virker normalt. Svar ærligt, også hvis der er små fejl.",
        ],
      },
      {
        heading: "Skærm",
        paragraphs: [
          "En intakt skærm uden revner eller døde pixels er vigtigt. Små ridser i glas kan være okay; dybe ridser, chips eller en knækket skærm trækker typisk markant ned.",
          "Original skærm vs. udskiftet skærm kan også påvirke vurderingen hos nogle købere.",
        ],
      },
      {
        heading: "Kosmetik",
        paragraphs: [
          "Kosmetik dækker bagside, rammer og generelt udseende. “Fin” betyder normalt kun lette brugsspor. Mere synlige ridser, buler eller misfarvning lander i en lavere kategori.",
          "Tag dig tid til at kigge telefonen under godt lys, før du vælger stand.",
        ],
      },
      {
        heading: "Batteri",
        paragraphs: [
          "Batterihelbred under ca. 80–85 % kan give et lavere bud. Du finder batterihelbred under Indstillinger → Batteri → Batteritilstand og opladning (eller tilsvarende, afhængigt af iOS-version).",
          "Et godt batteri er ikke alt — men det hjælper, især på nyere modeller.",
        ],
      },
    ],
    faqs: [
      {
        question: "Hvad hvis jeg overvurderer standen?",
        answer:
          "Så justerer køberen typisk prisen efter inspektion. Et ærligt estimat er tættere på det, du faktisk får udbetalt.",
      },
      {
        question: "Tæller original emballage?",
        answer:
          "Nogle steder giver det et lille plus, men det er sjældent afgørende. Model, lager og stand vejer langt tungere.",
      },
    ],
    relatedSlugs: [
      "hvad-er-min-iphone-vaerd",
      "forbered-telefonen",
      "privat-vs-professionel",
    ],
  },
  {
    slug: "privat-vs-professionel",
    title: "Privat salg vs. professionel køber",
    description:
      "Skal du sælge din iPhone privat eller til en professionel køber? Se fordele, ulemper og hvornår iBud’s sammenligning giver mest mening.",
    eyebrow: "Guide",
    lede: "Højere pris eller mindre besvær? Valget mellem privat salg og professionel køber handler om mere end beløbet på papiret.",
    minutes: 5,
    sections: [
      {
        heading: "Privat salg",
        paragraphs: [
          "Privat kan du ofte opnå en højere pris, fordi køberen er en slutbruger. Du sætter selv prisen, forhandler og aftaler afhentning eller forsendelse.",
        ],
        list: [
          "Potentielt højere udbetaling",
          "Mere tid til annonce, beskeder og møder",
          "Risiko for no-shows, snyd eller reklamationer",
          "Du håndterer betaling og overdragelse selv",
        ],
      },
      {
        heading: "Professionel køber",
        paragraphs: [
          "Professionelle købere (online eller i butik) giver typisk et hurtigt estimat, klar proces og udbetaling når telefonen er godkendt. Prisen er ofte lavere end privat — til gengæld er forløbet mere forudsigeligt.",
        ],
        list: [
          "Hurtigere og mere struktureret proces",
          "Lavere risiko for dig som sælger",
          "Estimater kan justeres efter inspektion",
          "Bud varierer mellem steder — sammenligning betaler sig",
        ],
      },
      {
        heading: "Hvornår iBud passer",
        paragraphs: [
          "Hvis du vælger den professionelle vej, er den største fejl at gå til det første sted du kender. iBud viser flere bud side om side, så du kan vælge det bedste uden manuelt research-arbejde.",
          "Hvis du hellere vil sælge privat, kan et iBud-estimat stadig være et pejlemærke for, hvad markedet cirka ligger på.",
        ],
      },
    ],
    faqs: [
      {
        question: "Hvad er sikrest?",
        answer:
          "Professionelle købere med klar proces og dokumentation er typisk mindre risikable end private møder og kontantbetaling.",
      },
      {
        question: "Kan jeg fortryde?",
        answer:
          "Det afhænger af stedet. Læs vilkårene, før du sender eller afleverer telefonen — især omkring prisjustering efter inspektion.",
      },
    ],
    relatedSlugs: [
      "saelg-iphone-danmark",
      "green-vs-swappie-vs-greenmind",
      "hvad-er-min-iphone-vaerd",
    ],
  },
  {
    slug: "green-vs-swappie-vs-greenmind",
    title: "Green vs Swappie vs GreenMind",
    description:
      "Neutral sammenligning af populære steder at sælge iPhone i Danmark. Se forskelle i proces — og brug iBud til at finde det aktuelle bedste bud.",
    eyebrow: "Sammenligning",
    lede: "Green, Swappie og GreenMind er tre af de steder, mange danskere overvejer. De er ikke ens — og det bedste bud skifter. Her er forskellen i grove træk.",
    minutes: 6,
    sections: [
      {
        heading: "Fælles for dem alle",
        paragraphs: [
          "Du får typisk et estimat baseret på model, lager og stand. Derefter sender du telefonen eller afleverer den, og den endelige pris aftales efter vurdering. iBud køber ikke selv — vi pejer dig videre.",
        ],
      },
      {
        heading: "Green",
        paragraphs: [
          "Dansk webshop med fokus på brugte Apple-produkter. Salgsflowet er online, og forsendelse indgår ofte i processen. God mulighed hvis du gerne vil klare det hjemmefra.",
        ],
      },
      {
        heading: "Swappie",
        paragraphs: [
          "International aktør med dansk side. Fokus på genbrugte iPhones, gratis forsendelse i mange cases, og et bud der typisk er gældende i en periode. Praktisk hvis du vil have et klart online-forløb.",
        ],
      },
      {
        heading: "GreenMind",
        paragraphs: [
          "Kendt for butikker rundt i Danmark. Du kan ofte få en vurdering på stedet, hvis du hellere vil aflevere personligt end sende telefonen.",
        ],
      },
      {
        heading: "Hvem er “bedst”?",
        paragraphs: [
          "Der er ikke én vinder. Det afhænger af din model, stand, og om du foretrækker butik eller forsendelse. Det konkrete beløb er det, der afgør det for de fleste — og det er præcis det, iBud rangerer.",
          "Vi viser også bud fra flere andre steder, når de er tilgængelige. Brug sammenligningen, vælg det bud der passer dig, og gå videre direkte til stedet.",
        ],
      },
    ],
    faqs: [
      {
        question: "Anbefaler iBud ét bestemt sted?",
        answer:
          "Nej. Vi rangerer efter estimeret beløb for din konkrete forespørgsel. Du vælger selv, hvor du vil sælge.",
      },
      {
        question: "Hvorfor er buddene forskellige?",
        answer:
          "Køberne har forskellige omkostninger, lagerbehov og vurderingsregler. Derfor kan det samme iPhone give forskellige estimater samme dag.",
      },
    ],
    relatedSlugs: [
      "privat-vs-professionel",
      "saelg-iphone-danmark",
      "hvad-er-min-iphone-vaerd",
    ],
  },
  {
    slug: "forbered-telefonen",
    title: "Sådan forbereder du telefonen",
    description:
      "Tjekliste før du sælger din iPhone: backup, Find min iPhone, nulstilling og forsendelse — så handlen går glat.",
    eyebrow: "Guide",
    lede: "En god forberedelse sparer dig for forsinkelser og afviste salg. Gør de her ting, før du sender eller afleverer telefonen.",
    minutes: 4,
    sections: [
      {
        heading: "Lav en backup",
        paragraphs: [
          "Tag backup til iCloud eller en computer, før du sletter noget. Når telefonen er solgt, er dine data væk fra enheden — backup er dit sikkerhedsnet.",
        ],
      },
      {
        heading: "Slå Find min iPhone fra",
        paragraphs: [
          "De fleste købere kræver, at Aktiveringslås / Find er slået fra. Gå til Indstillinger → [dit navn] → Find → Find min iPhone, og slå den fra. Du skal bruge din Apple-adgangskode.",
          "Hvis Find stadig er aktiv, kan handlen ikke gennemføres.",
        ],
      },
      {
        heading: "Nulstil til fabriksindstillinger",
        paragraphs: [
          "Når backup er på plads og Find er slået fra: Indstillinger → Generelt → Overfør eller nulstil iPhone → Slet alt indhold og alle indstillinger.",
          "Telefonen skal starte på opsætningsskærmen, når køberen modtager den.",
        ],
      },
      {
        heading: "Pak den ordentligt",
        paragraphs: [
          "Hvis du sender: brug bobleplast eller tilsvarende, en robust kasse, og følg stedets instruktioner. Gem tracking hvis du får det.",
          "Hvis du afleverer i butik: medbring telefonen opladet, så vurderingen kan ske med det samme.",
        ],
      },
    ],
    faqs: [
      {
        question: "Skal SIM-kortet blive i?",
        answer:
          "Nej. Tag dit SIM (og evt. eSIM-profil) med dig. Køberen skal have en tom, nulstillet enhed.",
      },
      {
        question: "Hvad med tilbehør?",
        answer:
          "Følg det konkrete steds vejledning. Ofte er det kun telefonen der kræves; oplader og æske er sjældent nødvendige.",
      },
    ],
    relatedSlugs: [
      "stand-ved-salgsvurdering",
      "saelg-iphone-danmark",
      "hvad-er-min-iphone-vaerd",
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getRelatedGuides(guide: Guide): Guide[] {
  return guide.relatedSlugs
    .map(getGuideBySlug)
    .filter((g): g is Guide => Boolean(g));
}
