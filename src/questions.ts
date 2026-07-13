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
      'Kompania juaj paguan çdo muaj për një adresë virtuale biznesi. Si e trajtoni këtë pagesë për qëllime tatimore? Cilat hapa i ndërmerrni për të verifikuar nëse duhet të mbani tatim në burim apo jo?',
    required: true,
  },
  {
    id: 'arbk-atk-noterizimi',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Cilat ndryshime në ARBK dhe ATK kërkojnë nënshkrim apo dokument të noterizuar, dhe për cilat mjafton nënshkrimi i thjeshtë ose ai elektronik? Jepni shembuj konkretë nga të dyja institucionet.',
    required: true,
  },
  {
    id: 'udhetimi-zyrtar',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      "Një punonjës do të udhëtojë për punë dhe kompania dëshiron t'i dërgojë paraprakisht para për udhëtimin. Si i trajtoni këto para dhe shpenzimet e udhëtimit nga ana tatimore dhe kontabël? Çfarë dokumentacioni kërkoni nga punonjësi dhe çfarë ndodh nëse shpenzimet i tejkalojnë limitet e lejuara? Përshkruani dy situata, udhëtim brenda vendit dhe jashtë vendit.",
    required: true,
  },
  {
    id: 'angazhimi-dizajnerit',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Kompania angazhon një dizajner (person fizik në Kosovë, pa biznes të regjistruar) për një punë njëhershe prej €800. Si e trajtoni pagesën? Çfarë ndryshon nëse dizajneri është i regjistruar në ARBK si Biznes Individual me NUI? Dhe çfarë rreziku ka nëse ky angazhim vazhdon çdo muaj me orar dhe mbikëqyrje si punonjësit e tjerë?',
    required: true,
  },
  {
    id: 'vetura-tvsh',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      'Kompania blen një veturë €20,000 + TVSH, të cilën drejtori do ta përdorë edhe për punë edhe privatisht. Sa TVSH mund të zbritni? Si trajtohen karburanti dhe servisimi? Nëse vetura importohet nga jashtë, cilat ngarkesa paguhen në import dhe në cilat kuti të deklaratës së TVSH-së raportohet importi?',
    required: true,
  },
  {
    id: 'automatizimi',
    type: 'long',
    allowReferences: true,
    personalize: true,
    title:
      "Nëse do të kishit mundësinë të automatizonit një proces në punën e kontabilitetit, cilin do ta zgjidhnit dhe pse? Përshkruani shkurt si do ta zbatonit dhe cilat kontrolle do t'i mbanit manuale.",
    required: true,
  },
];
