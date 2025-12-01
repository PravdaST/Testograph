/**
 * Testograph Knowledge Base - Articles from testograph.eu/learn
 *
 * Rich content database for AI Coach to provide detailed, accurate answers
 * with article recommendations
 */

export interface ArticleContent {
  title: string
  url: string
  category: string
  tldr: string
  keyFacts: string[]
  practicalTips?: string[]
  faq?: { q: string; a: string }[]
}

export const ARTICLES_CONTENT: ArticleContent[] = [
  // === TESTOUP & DOBAVKI ===
  {
    title: 'TestoUP: Sustavki, deystvie i polzi',
    url: 'https://testograph.eu/learn/supplements/testoup-sustavki-deystvie-polzi',
    category: 'Dobavki',
    tldr: 'TestoUP e tsyalostna sinergichna formula s 12 vnimatelno podbrani sustavki. Raboti na nyakolko fronta: optimizira hormonalnite signali (LH), namalyava kortizola i osiguryava gradivnite elementi za proizvodstvo na testosteron.',
    keyFacts: [
      'TestoUP sudarjha 12 nauchno podkrepeni sustavki',
      '1. Tribulus terestris - stimulira estestvnoto proizvodstvo na testosteron',
      '2. Ashwagandha - namalyava nivata na kortizol s 25-30%',
      '3. Tsink - osnoven mineral za sinteza na testosteron',
      '4. Magneziy - podobryava kachestvoto na sunya',
      '5. Selen - podpomagа proizvodstvoto na spermatozoidi',
      '6. Vitamin D - stimulira estestvnoto proizvodstvo na testosteron',
      '7. Vitamin C - poddarja energiyata',
      '8. Vitamin E - podobryava krvoobrasteniieto',
      '9. Vitamin K2 - podsilva kostite',
      '10. Vitamin B6 - stimulira metabolizma',
      '11. Vitamin B12 - povisshava energiyata',
      '12. Vitamin B9 (Folieva kiselina) - podobryava kletachniya rastej',
      'Rezultati se usestat sled 2-3 sedmitsi, po-osezaemi sled 4-8 sedmitsi',
    ],
    practicalTips: [
      'Priemay s hrana za po-dobro usvoyavane na Vitamin D',
      'Vecheren priem pomaga za po-dalbok san zaradi Magnezia i Ashwagandha',
      'Kombiniray s kreatin i surovatahen protein za optimalni rezultati',
      'Ne e neobhodim tsiklichen priem kato pri steroidi',
      'Preporachitelna doza: 2 kapsuli dnevno (sutrin i vecher)',
    ],
    faq: [
      { q: 'Kolko sustavki ima TestoUP?', a: 'TestoUP sudarjha 12 vnimatelno podbrani sustavki.' },
      { q: 'Koga shte vidya rezultati?', a: 'Podobrenie v energiyata i sunya sled 2-3 sedmitsi. Po-osezaemi rezultati za libido i sila sled 4-8 sedmitsi.' },
      { q: 'Ima li stranichni efekti?', a: 'Produktat e mnogo dobre ponosim. Pri chuvstvitelen stomah - priemay s hrana.' },
    ],
  },
  {
    title: 'Tsink za testosteron',
    url: 'https://testograph.eu/learn/supplements/tsink-za-testosteron',
    category: 'Dobavki',
    tldr: 'Tsinkat e absolyutno nezamenim mineral za proizvodstvoto na testosteron. Defitsitat vodi do sriv v nivata, a suplementatsiyata pri defitsit znachitelno gi povisshava.',
    keyFacts: [
      'Defitsitat na tsink vodi direktno do nisak testosteron',
      'Tsinkat e kofaktor za enzimite, prevrаshtashi holesterola v testosteron',
      'Pomaga za inhibirane na aromatazata',
      'Atletite gubyat tsink chrez potta',
      'Preporachitelna doza: 15-30mg dnevno',
    ],
  },
  {
    title: 'Ashwagandha za mazhe',
    url: 'https://testograph.eu/learn/supplements/ashwagandha-za-mazhe',
    category: 'Dobavki',
    tldr: 'Ashwagandha e moshten adaptogen, koyto namalyava kortizola s 25-30%, kato po tozi nachin sazdava blagopriyatna sreda za proizvodstvo na testosteron.',
    keyFacts: [
      'Namalyava serumniya kortizol s 25-30%',
      'Povisshava testosterona s 15-20% pri redoven priem',
      'Podobryava silata i muskalnata masa pri trenitrashti mazhe',
      'Podobryava kachestvoto na sunya',
      'Efektivna doza: 300-600mg ekstrakt (KSM-66 ili Sensoril)',
    ],
  },
  // === SAN I LIFESTYLE ===
  {
    title: 'San i testosteron',
    url: 'https://testograph.eu/learn/lifestyle/san-i-testosteron-vliyanie-na-sunia',
    category: 'Nachin na zhivot',
    tldr: 'Sanyat e NAY-VAJNIYAT faktor za proizvodstvoto na testosteron. Po-golyamata chast ot dnevniya testosteron se sintezira po vreme na dalbokite fazi na sunya.',
    keyFacts: [
      'Testosteronat se proizvezhda predimno po vreme na REM fazata na sunya',
      '5 chasa san za sedmitsa namalyava testosterona s 10-15%',
      'Optimalno: 7-9 chasa san vsyaka nosht',
      'Postoyanen grafik (lyagane/stavane po edno i sashto vreme) e kritichen',
      'Sinyata svetlina ot ekrani potiska melatonina',
    ],
    practicalTips: [
      'Lyagay i stavay po edno i sashto vreme, dori prez uikenda',
      'Spri ekranite 1 chas predi san',
      'Darj spalnyata hladna (18-20C)',
      'Magneziyat predi san pomaga za po-dalbok san',
    ],
  },
  {
    title: 'Stresat kato vrag na mazkoto zdrave',
    url: 'https://testograph.eu/learn/lifestyle/stresat-mazko-zdrave',
    category: 'Nachin na zhivot',
    tldr: 'Hronichniyat stres vodi do postoyano visoki niva na kortizol, koyto direktno potiska proizvodstvoto na testosteron.',
    keyFacts: [
      'Kortizolat i testosteronat imat obratna vrazka',
      'Hronichniyat stres darji tyaloto v rezhim "biy se ili byagay"',
      'Stresat uvelichava natrupvaneto na koremni maznini',
      'Adaptogeni kato Ashwagandha pomagat za regulirane na kortizola',
    ],
  },
  // === HRANENE ===
  {
    title: 'Hrani, koito povishshavat testosterona',
    url: 'https://testograph.eu/learn/testosterone/hrani-povishava-testosterona',
    category: 'Testosteron',
    tldr: 'Dietata e moshten instrument za optimizirane na testosterona. Fokusat tryabva da e varhu tseli, neobraboteni hrani, bogati na tsink, vitamin D i zdravoslovni maznini.',
    keyFacts: [
      'Yaitsata sa perfektna hrana - sadarjat holesterol, protein i vitamin D',
      'Stridite sa nay-bogatiyat iztochnik na tsink',
      'Chervenoto meso dostavya tsink, zhelyazo i nasiteni maznini',
      'Avokadoto e bogato na zdravoslovni maznini i magneziy',
      'Yadkite (osobeno brazilski orehi) sadarjat selen',
      'Maslenata riba dostavya omega-3 i vitamin D',
    ],
    practicalTips: [
      'Yaj 3-4 tseli yaitsa dnevno',
      'Vklyuchi cherveno meso 2-3 pati sedmichno',
      'Avokado, zehtyin i yadki vseki den',
      'Maznite ribi (somga, skumriya) 2 pati sedmichno',
    ],
  },
  // === TESTOSTERON ===
  {
    title: 'Kakvo e testosteron i kak raboti',
    url: 'https://testograph.eu/learn/testosterone/kakvo-e-testosteron-i-kak-raboti',
    category: 'Testosteron',
    tldr: 'Testosteronat e osnovniyat mazki polov hormon, proizvezhdan glavno v testiste. Sintezira se ot holesterol i vliyae na muskuli, kosti, nastroenie, libido i energiya.',
    keyFacts: [
      'Proizvezhda se v Laydigovite kletki na testiste',
      'Sintezira se ot holesterol',
      'Normalni niva: 300-1000 ng/dL',
      'Pikovi niva: sutrin mejdu 6-9 chasa',
      'Spada s ~1-2% godishno sled 30',
    ],
  },
  {
    title: 'Simptomi na nisak testosteron',
    url: 'https://testograph.eu/learn/testosterone/simptomi-nisuk-testosteron',
    category: 'Testosteron',
    tldr: 'Hipogonadizmat se proyavyava chrez shirok spektar ot simptomi: umora, nisak libido, zaguba na muskulna masa, natrupvane na maznini, depresiya.',
    keyFacts: [
      'Umora i lipsa na energiya',
      'Namaleno libido i erektilna disfunktsiya',
      'Zaguba na muskulna masa',
      'Uvelichavane na telesnite maznini',
      'Depresiya, razdraznitelnost',
      'Namalena motivatsiya za trenirovki',
    ],
  },
  {
    title: 'Estestveni nachini za povishshavane na testosterona',
    url: 'https://testograph.eu/learn/testosterone/estestveni-nachini-povishavane-testosteron',
    category: 'Testosteron',
    tldr: 'Optimiziraneto na testosterona e maraton, ne sprint. Osnovite sa: silovi trenirovki, kachestven san, pravilno hranene, upravlenie na stresa.',
    keyFacts: [
      '1. Silovi trenirovki s tejesti - nay-moshtniyat stimul',
      '2. 7-9 chasa kachestven san vsyaka nosht',
      '3. Dostatachno maznini i holesterol v hranata',
      '4. Tsink, magneziy i vitamin D',
      '5. Upravlenie na stresa (nisak kortizol)',
      '6. Zdravoslovno teglo',
      '7. Ogranichavane na alkohola',
    ],
  },
  // === FITNES ===
  {
    title: 'Trenirovachna programa za nachinaeshti',
    url: 'https://testograph.eu/learn/fitness/trenirovcna-programa-za-nachinaeshti',
    category: 'Fitnes',
    tldr: 'Palno rakovodstvo za mazhe zapochvashti sas silovi trenirovki. Fokus varhu izgrajdane na zdrava osnova za muskulna masa.',
    keyFacts: [
      'Zapochni s tehnika, ne s tejki tejesti',
      'Full-body trenirovki 3 pati sedmichno sa optimalni za nachinaeshti',
      'Bazovi uprajneniya: klek, martva tyaga, lejanka, grebane, ramenna presa',
      'Progresivno pretovarvane: dobavyay teglo vsyaka sedmitsa',
    ],
  },
  {
    title: 'Trenirovki za povishshavane na testosterona',
    url: 'https://testograph.eu/learn/testosterone/trenirovki-za-povisavane-na-testosterona',
    category: 'Testosteron',
    tldr: 'Silovite trenirovki s tejesti sa nay-moshtniyat estestven stimul za testosteron. Fokusat tryabva da e varhu mnogostavni uprajneniya.',
    keyFacts: [
      'Mnogostavni uprajneniya > izolirani',
      'Klekove, martva tyaga, lejanka, grebane, ramenni presi',
      'Intensivnost: 70-85% ot maksimuma',
      'Obem: 3-5 serii po 5-10 povtoreniya',
      'Pochivka: 60-90 sekundi mejdu seriite',
    ],
  },
  // === POTENTSIYA ===
  {
    title: 'Prichini za erektilna disfunktsiya',
    url: 'https://testograph.eu/learn/potency/prichini-za-erektilna-disfunktsiya',
    category: 'Potentsiya',
    tldr: 'Erektilnata disfunktsiya e kompleksen problem, ryatko prichinen ot edin faktor. Tya e chesto ranen predupreditelen znak za sardechnosadovi zabolyavaniya.',
    keyFacts: [
      'ED e ranen marker za sardechnosadovi problemi',
      'Fizicheski prichini: diabet, hipertoniya, ateroskleroza, nisak testosteron',
      'Psihologicheski: stres, trevoznost, depresiya',
      'Lifestyle: pushene, alkohol, lipsa na dvijenie',
    ],
  },
]

/**
 * Build comprehensive knowledge base prompt for system
 */
export function buildKnowledgeBasePrompt(): string {
  let prompt = `

BAZA DANNI OT NAUCHEN TSENTAR (testograph.eu/learn):
Izpolzvay tazi informatsiya za da davash KONKRETNI, DETAYLNI otgovori.
Kogato otgovaryash, tsitiray fakti ot statiite i VINAGI preporachvay relevatna statiya s link.

`

  for (const article of ARTICLES_CONTENT) {
    prompt += `
=== ${article.title} ===
Kategoriya: ${article.category}
Link: ${article.url}

TL;DR: ${article.tldr}

Klyuchovi fakti:
${article.keyFacts.map(f => `- ${f}`).join('\n')}
`

    if (article.practicalTips && article.practicalTips.length > 0) {
      prompt += `
Praktichni saveti:
${article.practicalTips.map(t => `-> ${t}`).join('\n')}
`
    }

    if (article.faq && article.faq.length > 0) {
      prompt += `
FAQ:
${article.faq.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}
`
    }

    prompt += '\n'
  }

  prompt += `
===============================================
VAJNI PRAVILA ZA OTGOVORI:
1. Davay KONKRETNI saveti bazirani na informatsiyata po-gore
2. Tsitiray klyuchovi fakti kogato sa relevantni
3. VINAGI preporachvay statiya s format: [[ARTICLE:zaglavie|link]]
4. Ako vaprosaat e za TestoUp - izpolzvay informatsiyata za sustavkite i deystviieto
5. Ako vaprosaat e za san/hranene/trenirovki - day praktichni saveti ot statiite
6. NIKOGA ne izmislyay linkove - izpolzvay SAMO linkovete ot statiite po-gore!
===============================================
`

  return prompt
}

// Export for backward compatibility
export interface Article {
  title: string
  url: string
  category: string
  description: string
  keywords: string[]
}

export const ARTICLES: Article[] = ARTICLES_CONTENT.map(a => ({
  title: a.title,
  url: a.url,
  category: a.category,
  description: a.tldr,
  keywords: a.keyFacts.slice(0, 3).map(f => f.split(' ').slice(0, 3).join(' ')),
}))
