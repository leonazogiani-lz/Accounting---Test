export type Question = {
  id: string;
  type: 'short' | 'checkbox' | 'long' | 'phone';
  title: string;
  options?: string[]; // for checkbox
  required: boolean;
  inputFilter?: 'lettersOnly'; // bllokon shifrat gjatë shkrimit/ngjitjes
  allowReferences?: boolean; // lejon lidhje (ligje, udhëzime) nën përgjigje
  personalize?: boolean; // titulli i shfaqur nis me emrin e kandidatit
};

export const TEST_DURATION_SECONDS = 45 * 60;

export const CANDIDATE_NAME_ID = 'emri-mbiemri';
export const CANDIDATE_PHONE_ID = 'numri-kontaktit';

// Pyetjet shfaqen sipas radhës së kësaj liste — shtoni pyetje të reja në fund.
export const questions: Question[] = [
  {
    id: CANDIDATE_NAME_ID,
    type: 'short',
    title: 'Emri dhe Mbiemri',
    required: true,
    inputFilter: 'lettersOnly',
  },
  {
    id: CANDIDATE_PHONE_ID,
    type: 'phone',
    title: 'Numri i Kontaktit',
    required: true,
  },
  {
    id: 'niveli-certifikimit',
    type: 'checkbox',
    title: 'Niveli i Certifikimit si Kontabilist',
    options: [
      'Teknik i Kontabilitetit',
      'Kontabilist i Çertifikuar',
      'Auditor i Çertifikuar',
      'Auditor i Çertifikuar në Sektorin Publik',
      'Auditor i Brendshëm i Çertifikuar',
      'Ekspert Tatimor',
      'Ekspert i Lartë Tatimor',
      'Ekspert i Licencuar i Forenzikës Financiare',
    ],
    required: true,
  },
  {
    id: 'adresa-virtuale',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Kompania juaj paguan çdo muaj për një adresë virtuale biznesi të ofruar nga një hapësirë coworking. Si e trajtoni këtë pagesë për qëllime tatimore?',
    required: true,
  },
  {
    id: 'arbk-atk-noterizimi',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Për cilat ndryshime pranë ARBK-së dhe ATK-së kërkohet nënshkrim i vërtetuar nga noteri ose dokument i noterizuar, dhe në cilat raste mjafton nënshkrimi i zakonshëm apo elektronik? Ju lutem, jepni shembuj konkretë për secilin institucion.',
    required: true,
  },
  {
    id: 'udhetimi-zyrtar',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Një punonjës do të udhëtojë për qëllime pune dhe kompania planifikon t’i japë paraprakisht një avans për mbulimin e shpenzimeve të udhëtimit. Si duhet të trajtohen dhe regjistrohen këto mjete nga aspekti kontabël dhe tatimor?\n\nCilat dokumente duhet t’i dorëzojë punonjësi pas përfundimit të udhëtimit, si bëhet arsyetimi dhe mbyllja e avansit, dhe si trajtohet diferenca kur shpenzimet reale janë më të larta ose më të ulëta se shuma e dhënë paraprakisht? Gjithashtu, çfarë pasoja tatimore lindin nëse mëditjet ose shpenzimet e tjera të udhëtimit tejkalojnë limitet e lejuara?\n\nJu lutem, shpjegojeni trajtimin përmes dy shembujve konkretë: një udhëtim pune brenda Kosovës dhe një udhëtim pune jashtë vendit.',
    required: true,
  },
  {
    id: 'pushimet-e-punonjesve',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Si rregullohen pushimet e punonjësve sipas legjislacionit të punës, duke përfshirë pushimin vjetor të paguar, festat zyrtare dhe pushimin pa pagesë? Sa ditë pushim pa pagesë mund të kërkojë një punonjës, a ekziston një kufi ligjor dhe në cilat raste miratimi i tij varet nga punëdhënësi? Gjithashtu, shpjegoni procedurën e kërkesës, dokumentacionin e nevojshëm dhe ndikimin e pushimit pa pagesë në pagë, kontribute dhe stazh pune.',
    required: true,
  },
  {
    id: 'automatizimi',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Nëse do të kishit mundësi të automatizonit vetëm një proces në punën e kontabilitetit, cilin proces do të zgjidhnit dhe pse? Përshkruani shkurt mënyrën se si do ta zbatonit automatizimin, përfitimet që prisni të arrini dhe kontrollet kryesore që do t’i mbanit manuale për të garantuar saktësinë dhe pajtueshmërinë.',
    required: true,
  },
];
