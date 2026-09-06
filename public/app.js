const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];
const archiveUrl = "https://www.videha.co.in/";
const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const languageAttribute = (value = "") => /[\u0900-\u097F]/.test(value) ? ' lang="mai-Deva"' : "";

const parallelTomes = [
  { title: "A Parallel History of Mithila & Maithili Literature — Tome I", range: "Volumes 1–25", pothi: "https://store.pothi.com/book/gajendra-thakur-parallel-history-mithila-maithili-literature/", read: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_I.html" },
  { title: "A Parallel History of Mithila & Maithili Literature — Tome II", range: "Volumes 26–50", pothi: "https://store.pothi.com/book/gajendra-thakur-parallel-history-mithila-maithili-tome-2/", read: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_II.html" },
  { title: "A Parallel History of Mithila & Maithili Literature — Tome III", range: "Volumes 51–75", pothi: "https://store.pothi.com/book/gajendra-thakur-parallel-history-mithila-maithili-literature-volume-1-100-tome-3-volume-51-75-b/", read: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_III.html" },
  { title: "A Parallel History of Mithila & Maithili Literature — Tome IV", range: "Volumes 76–100", pothi: "https://store.pothi.com/book/gajendra-thakur-parallel-history-mithila-maithili-literature-volume-1-100-tome-4-volume-76-100-/", read: "https://videha-ejournal.github.io/VIDEHA_PARALLEL_HISTORY_TOME_IV.html" },
];
const parallelCommon = [
  { label: "Google Playbook", url: "https://play.google.com/store/books/details?id=uvjREQAAQBAJ" },
  { label: "Google Play audiobook", url: "https://play.google.com/store/audiobooks/details?id=AQAAAEBas1rzEM" },
  { label: "Kindle", url: "https://www.amazon.in/dp/B0GX2XRKM7" },
];
const panjiEditions = [
  { roman:"I", pothi:"https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila/", kindle:"https://www.amazon.in/dp/B0H463RVT8", play:"https://play.google.com/store/books/details?id=rrniEQAAQBAJ", audio:"https://play.google.com/store/audiobooks/details?id=AQAAAEB64VahPM" },
  { roman:"II", pothi:"https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-ii/", kindle:"https://www.amazon.in/dp/B0H6NPRTYB", play:"https://play.google.com/store/books/details?id=5RrxEQAAQBAJ", audio:"https://play.google.com/store/audiobooks/details?id=AQAAAEB6wVeBPM" },
  { roman:"III", pothi:"https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-iii/", kindle:"https://www.amazon.in/dp/B0H6R4BBFB", play:"https://play.google.com/store/books/details?id=-XD2EQAAQBAJ", audio:"https://play.google.com/store/audiobooks/details?id=AQAAAED6hDjE0M" },
  { roman:"IV", pothi:"https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-iv/", kindle:"https://www.amazon.in/dp/B0H6R6VSBF", play:"https://play.google.com/store/books/details?id=bfn2EQAAQBAJ", audio:"https://play.google.com/store/audiobooks/details?id=AQAAAED6jFbMvM" },
  { roman:"V", pothi:"https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-volume-v/", kindle:"https://www.amazon.in/dp/B0H6R4BBFD", play:"https://play.google.com/store/books/details?id=hGH4EQAAQBAJ", audio:"https://play.google.com/store/audiobooks/details?id=AQAAAED6Ui4SxM" },
  { roman:"VI", pothi:"https://store.pothi.com/book/gajendra-thakur-decoding-panji-mithila-0/", kindle:"https://www.amazon.in/dp/B0H6R2YCFP", play:"https://play.google.com/store/books/details?id=pcH6EQAAQBAJ", audio:"https://play.google.com/store/audiobooks/details?id=AQAAAED61jGW2M" },
];
const childTitles = ["Tarhari Me Pari Lok","Bal Guru","Deena Bhadari","Amar Baba","Moti Dai","Raja Salhes","Bagiyak Gach","Bahura Godhin Natua Dayal","Chauharmal aa Reshma","Mahua Ghatwarin","Chechan","Gariban Baba","Varnamala Shiksha Ankita","Gangodevik Bhagta","Miran Sahab","Jat-Jatin","Lalmain Baba","Munga–Jalim Singh","Bad Sukh Saar Paol Tua Teere","Battu","Bhat–Bhatin","Bihula","Brahman aa Thakurak Katha","Daku Rauhineya","Doki–Doka","Gonu Jha and Das Thop Baba","Jyoti Panjiyar","Kauwa aa Fuddi","Madhav Singh: Amta Gaam","Motisaeri","Murkhadhiraj","Naika Banijara","Raghuni Marar","Raja Ansari","Raja Dholan","Ugna","Ootani"];
const playTitles = ["Apala Atreyi","Bhaa Jaeb Chhu","Danveer Dadhichi","Ganga Bridge","Jalodeep","Kamalak Bhagata","Machanda","Sankarshan","Ulkamukh"];

const books = parallelTomes.map((tome) => ({
  title: tome.title, category: "Parallel History", detail: `${tome.range} · Series ISBN 978-93-5812-486-6`, url: tome.pothi,
  links: [{label:"Pothi hardback",url:tome.pothi},{label:"Read online",url:tome.read},...parallelCommon],
}));
panjiEditions.forEach((edition) => books.push({
  title: `Decoding the Panji of Mithila — Volume ${edition.roman}`, category: "Panji", detail: "Genealogy, manuscript practice and social history", url: edition.pothi,
  links: [{label:"Pothi hardback",url:edition.pothi},{label:"Kindle",url:edition.kindle},{label:"Google Playbook",url:edition.play},{label:"Audiobook",url:edition.audio}],
}));
const suppliedBooks = [
  {title:"History of Mithila, Vajji & Anga: From Prehistory to the Contemporary Period",category:"History",detail:"A Parallel History of Mithila & Maithili Literature",links:[
    {label:"Google Playbook",url:"https://play.google.com/store/books/details?id=xisIEgAAQBAJ"},{label:"Kindle",url:"https://www.amazon.in/dp/B0HHJ27ZG4"},{label:"Audiobook",url:"https://play.google.com/store/audiobooks/details?id=AQAAAEAG7l6uSM"}]},
  {title:"Gadya Padya Bharti 1 · विदेह सदेह २८",category:"Translation anthology",detail:"विभिन्न भाषासँ अनूदित गद्य आ पद्य रचना · खण्ड १ · ISBN 978-93-341-0402-8",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/editor-gajendra-thakur-gadya-padya-bharti-1/"}]},
  {title:"Gadya Padya Bharti 2 · विदेह सदेह ३७",category:"Translation anthology",detail:"विभिन्न भाषासँ अनूदित गद्य आ पद्य रचना · खण्ड २ · ISBN 978-93-5890-150-4",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/translator-gajendra-thakur-gadya-padya-bharti-2/"}]},
  {title:"ए.आइ. सँ वीडियो बनाउ",category:"Self-learning",detail:"Self-learning series",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%97%E0%A4%9C%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%A0%E0%A4%95%E0%A4%B0-%E0%A4%8F%E0%A4%86%E0%A4%87-%E0%A4%B8-%E0%A4%B5%E0%A4%A1%E0%A4%AF-%E0%A4%AC%E0%A4%A8%E0%A4%89/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=PgcDEgAAQBAJ"}]},
  {title:"मैथिली रेडियो नाटक: स्वयं सीखू मार्गदर्शिका",category:"Self-learning",detail:"Maithili radio-drama self-learning guide",links:[{label:"Pothi paperback",url:"https://store.pothi.com/book/%E0%A4%97%E0%A4%9C%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%A0%E0%A4%95%E0%A4%B0-maithili-radio-natak/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=bwcDEgAAQBAJ"}]},
  {title:"गोहि सभक बीच जलसमाधि",category:"Novel",detail:"Maithili novel · Khand 0–2",links:[{label:"Pothi · Khand 0",url:"https://store.pothi.com/book/gajendra-thakur-gohi-sabhak-beech-jalsamadhi-part-0/"},{label:"Pothi · Khand 1",url:"https://store.pothi.com/book/gajendra-thakur-gohi-sabhak-beech-jalsamadhi-part-1/"},{label:"Pothi · Khand 2",url:"https://store.pothi.com/book/gajendra-thakur-gohi-sabhak-beech-jalsamadhi-part-2/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=pKX4EQAAQBAJ"}]},
  {title:"Water-Burial Among the Crocodiles",category:"Novel · English translation",detail:"English translation by Gajendra Thakur · Volumes 0–2",links:[{label:"Pothi · Volume 0",url:"https://store.pothi.com/book/gajendra-thakur-water-burial-among-the-crocodiles-volume-0/"},{label:"Pothi · Volume 1",url:"https://store.pothi.com/book/gajendra-thakur-water-burial-among-the-crocodiles-volume-1/"},{label:"Pothi · Volume 2",url:"https://store.pothi.com/book/gajendra-thakur-water-burial-among-the-crocodiles-volume-2/"},{label:"Kindle",url:"https://www.amazon.in/dp/B0HG3NTT13"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=dmoEEgAAQBAJ"},{label:"Audiobook",url:"https://play.google.com/store/audiobooks/details?id=AQAAAEAGpHjkbM"}]},
  {title:"Gohi / Water-Burial Teaching Courses",category:"Teaching series",detail:"Two supplied teaching-course editions",links:[{label:"Gohi teaching course",url:"https://www.archive.org/download/videha-petar-2/Gohi_Jalsamadhi_Teaching_merge.pdf"},{label:"Water-Burial teaching course",url:"https://archive.org/download/videha-petar-2/Videha_Teaching_Gohi_Jalsamadhi_Batch1-87.pdf"}]},
  {title:"मैथिलीक एकटा समानान्तर व्याकरण, रचना आ भाषा विज्ञान",category:"Language",detail:"ठेठी, अंगिका आ बज्जिकाकेँ संग लऽ कऽ",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/gajendra-thakur-maithili_thethi_angika_bajjika/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=pKX4EQAAQBAJ"}]},
  {title:"भामती · Bhāmatī",category:"Sanskrit into Maithili",detail:"वाचस्पति · मूल संस्कृतसँ मैथिली अनुवाद: गजेन्द्र ठाकुर",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/gajendra-thakur-bhamti/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=PWcAEgAAQBAJ"}]},
  {title:"आत्मतत्त्वविवेक · Ātmatattvaviveka",category:"Sanskrit into Maithili",detail:"उदयन · मूल संस्कृतसँ मैथिली अनुवाद: गजेन्द्र ठाकुर",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%AE%E0%A5%82%E0%A4%B2-%E0%A4%B8%E0%A4%82%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A5%83%E0%A4%A4-%E0%A4%89%E0%A4%A6%E0%A4%AF%E0%A4%A8-atmatattvaviveka/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=I2cAEgAAQBAJ"}]},
  {title:"न्यायकुसुमाञ्जलि · Nyāyakusumāñjali",category:"Sanskrit into Maithili",detail:"उदयन · मूल संस्कृतसँ मैथिली अनुवाद: गजेन्द्र ठाकुर",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%AE%E0%A5%82%E0%A4%B2-%E0%A4%B8%E0%A4%82%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A5%83%E0%A4%A4-%E0%A4%89%E0%A4%A6%E0%A4%AF%E0%A4%A8%E0%A4%BE%E0%A4%9A%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF-%E2%80%A2-%E0%A4%B8%E0%A4%82%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A5%83%E0%A4%A4%E0%A4%B8%E0%A4%81-%E0%A4%AE%E0%A5%88%E0%A4%A5%E0%A4%BF%E0%A4%B2%E0%A5%80-%E0%A4%85%E0%A4%A8%E0%A5%81%E0%A4%B5%E0%A4%BE%E0%A4%A6-%E0%A4%97%E0%A4%9C%E0%A5%87%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%8D%E0%A4%B0-%E0%A4%A0%E0%A4%BE%E0%A4%95%E0%A5%81%E0%A4%B0-nyayakusumanjali/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=APECEgAAQBAJ"}]},
  {title:"तत्त्वचिन्तामणि · Tattvacintāmaṇi",category:"Sanskrit into Maithili",detail:"गंगेश · मूल संस्कृतसँ मैथिली अनुवाद: गजेन्द्र ठाकुर",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/gajendra-thakur-tattvachintamani/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=FLP3EQAAQBAJ"}]},
  {title:"संस्कृत साहित्य · 13 books in Maithili translation",category:"Sanskrit into Maithili",detail:"Thirteen supplied Sanskrit literary works translated by Gajendra Thakur",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/gajendra-thakur-sanskrit-sahitya-13-books/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=8ZkFEgAAQBAJ"}]},
  {title:"३७ टा मैथिली बाल उपन्यास · खण्ड १",category:"Children’s collection",detail:"Novels 1–10",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%97%E0%A4%9C%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%A0%E0%A4%95%E0%A4%B0-%E0%A5%A9%E0%A5%AD-%E0%A4%9F-%E0%A4%AE%E0%A4%A5%E0%A4%B2-%E0%A4%AC%E0%A4%B2-%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%AF%E0%A4%B8-%E0%A4%96%E0%A4%A3%E0%A4%A1-%E0%A5%A7/"},{label:"Google Playbook · complete series",url:"https://play.google.com/store/books/details?id=gdIFEgAAQBAJ"}]},
  {title:"३७ टा मैथिली बाल उपन्यास · खण्ड २",category:"Children’s collection",detail:"Novels 11–20",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%97%E0%A4%9C%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%A0%E0%A4%95%E0%A4%B0-%E0%A5%A9%E0%A5%AD-%E0%A4%9F-%E0%A4%AE%E0%A4%A5%E0%A4%B2-%E0%A4%AC%E0%A4%B2-%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%AF%E0%A4%B8-%E0%A4%96%E0%A4%A3%E0%A4%A1-%E0%A5%A8/"},{label:"Google Playbook · complete series",url:"https://play.google.com/store/books/details?id=gdIFEgAAQBAJ"}]},
  {title:"३७ टा मैथिली बाल उपन्यास · खण्ड ३",category:"Children’s collection",detail:"Novels 21–30",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%97%E0%A4%9C%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%A0%E0%A4%95%E0%A4%B0-%E0%A5%A9%E0%A5%AD-%E0%A4%9F-%E0%A4%AE%E0%A4%A5%E0%A4%B2-%E0%A4%AC%E0%A4%B2-%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%AF%E0%A4%B8-%E0%A4%96%E0%A4%A3%E0%A4%A1-%E0%A5%A9/"},{label:"Google Playbook · complete series",url:"https://play.google.com/store/books/details?id=gdIFEgAAQBAJ"}]},
  {title:"३७ टा मैथिली बाल उपन्यास · खण्ड ४",category:"Children’s collection",detail:"Novels 31–37",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%97%E0%A4%9C%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%A0%E0%A4%95%E0%A4%B0-%E0%A5%A9%E0%A5%AD-%E0%A4%9F-%E0%A4%AE%E0%A4%A5%E0%A4%B2-%E0%A4%AC%E0%A4%B2-%E0%A4%89%E0%A4%AA%E0%A4%A8%E0%A4%AF%E0%A4%B8-%E0%A4%96%E0%A4%A3%E0%A4%A1-%E0%A5%AA/"},{label:"Google Playbook · complete series",url:"https://play.google.com/store/books/details?id=gdIFEgAAQBAJ"}]},
  {title:"37 Maithili Children Novels in English Translation",category:"Children’s collection · English",detail:"English translation · Parts 1–2",links:[{label:"Pothi · Part 1",url:"https://store.pothi.com/book/gajendra-thakur-37-maithili-children-novels-in-english-translation-part-1/"},{label:"Pothi · Part 2",url:"https://store.pothi.com/book/gajendra-thakur-37-maithili-children-novels-in-english-translation-part-2/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=QtUFEgAAQBAJ"},{label:"Audiobook",url:"https://play.google.com/store/audiobooks/details?id=AQAAAEAG8l-ySM"}]},
  {title:"प्रबन्ध · निबन्ध · समालोचना",category:"Criticism",detail:"सिद्धान्त आ अनुप्रयुक्त अध्ययन · खण्ड १–२",links:[{label:"Pothi · Khand 1",url:"https://store.pothi.com/book/gajendra-thakur-%E0%A4%AA%E0%A4%B0%E0%A4%AC%E0%A4%A8%E0%A4%A7-%E0%A4%A8%E0%A4%AC%E0%A4%A8%E0%A4%A7-%E0%A4%B8%E0%A4%AE%E0%A4%B2%E0%A4%9A%E0%A4%A8-%E0%A4%96%E0%A4%A3%E0%A4%A1-%E0%A5%A7-%E0%A4%B8%E0%A4%A6%E0%A4%A7%E0%A4%A8%E0%A4%A4/"},{label:"Pothi · Khand 2",url:"https://store.pothi.com/book/gajendra-thakur-%E0%A4%AA%E0%A4%B0%E0%A4%AC%E0%A4%A8%E0%A4%A7-%E0%A4%A8%E0%A4%AC%E0%A4%A8%E0%A4%A7-%E0%A4%B8%E0%A4%AE%E0%A4%B2%E0%A4%9A%E0%A4%A8-%E0%A4%96%E0%A4%A3%E0%A4%A1-%E0%A5%A8-%E0%A4%85%E0%A4%A8%E0%A4%AA%E0%A4%B0%E0%A4%AF%E0%A4%95%E0%A4%A4-%E0%A4%85%E0%A4%A7%E0%A4%AF%E0%A4%AF%E0%A4%A8/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=B84GEgAAQBAJ"}]},
  {title:"रंग-संगम · Rang-Sangam",category:"Theatre",detail:"नओटा मैथिली नाटक आ तकर अंग्रेजी रंगमंचीय रूपान्तर",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/gajendra-thakur-%E0%A4%B0%E0%A4%97-%E0%A4%B8%E0%A4%97%E0%A4%AE/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=Ae4GEgAAQBAJ"}]},
  {title:"विदेह शोध-लेख · अंक १ सँ ४४७ धरि",category:"Research",detail:"Videha research articles from issues 1–447",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/%E0%A4%97%E0%A4%9C%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%A0%E0%A4%95%E0%A4%B0-%E0%A4%B5%E0%A4%A6%E0%A4%B9-%E0%A4%B6%E0%A4%A7-%E0%A4%B2%E0%A4%96-%E0%A4%85%E0%A4%95-%E0%A5%A7-%E0%A4%B8-%E0%A5%AA%E0%A5%AA%E0%A5%AD-%E0%A4%A7%E0%A4%B0/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=k14HEgAAQBAJ"}]},
  {title:"गजेन्द्र ठाकुरक समानान्तर दर्शन",category:"Philosophy",detail:"Gajendra Thakur’s Parallel Philosophy",links:[{label:"Pothi hardback",url:"https://store.pothi.com/book/gajendra-thakur-gajendra-thakurs-parallel-philosophy/"},{label:"Google Playbook",url:"https://play.google.com/store/books/details?id=PQ8IEgAAQBAJ"}]},
];
suppliedBooks.forEach((book)=>books.push({...book,url:book.links[0].url}));
childTitles.forEach((title, i) => books.push({ title, category: "Children’s literature", detail: `Illustrated Maithili children’s novel ${i + 1} of 37`, url: "https://archive.org/download/videha-petar-2/37_MAITHILI%20NOVELS.pdf" }));
playTitles.forEach(title => books.push({ title, category: "Theatre", detail: "Maithili and English illustrated stage-play editions", url: "https://www.videha.co.in/Audio_Video.htm" }));
[
  ["Maithili Thesaurus", "Language", "A cumulative Maithili reference work"],
  ["Gajendra Thakur Samagra", "Collected works", "Collected creative, critical, historical and translated writings"],
].forEach(([title, category, detail]) => books.push({ title, category, detail, url: "https://www.videha.co.in/gajendra-thakur-samagra.htm" }));
books.forEach(book => { book.source = "curated"; book.author = book.author || "Gajendra Thakur · author, editor or translator"; });

const covers = [
  ["decoding-the-panji.webp", "Decoding the Panji of Mithila I"], ["decoding-panji-ii-front.webp", "Decoding the Panji II"], ["decoding-panji-vol-iii-spread.webp", "Decoding the Panji III"], ["decoding-panji-vol-iv-spread.webp", "Decoding the Panji IV"], ["decoding-panji-vol-v-spread.webp", "Decoding the Panji V"], ["decoding-panji-vi-front.webp", "Decoding the Panji VI"], ["mithila-parallel-history-front-cover-6x9.webp", "A Parallel History"], ["parallel-philosophy-front-cover-6x9.webp", "Parallel Philosophy"], ["atmatattvaviveka-front-cover-en.webp", "Ātmatattvaviveka"], ["bhamati-front-cover-en.webp", "Bhāmatī"], ["nyaya-kusumanjali-front-cover-en.webp", "Nyāyakusumāñjali"], ["tattvacintamani-front-cover-en.webp", "Tattvacintāmaṇi"], ["cover-front.webp", "History of Mithila, Vajji & Anga"]
];

const videoPlaylists = "https://www.youtube.com/@videha_ejournal/playlists";
const elearningPlaylists = "https://www.youtube.com/@videha-elearning/playlists";
const gajendraPlaylists = "https://www.youtube.com/user/ggajendra71/playlists";
const accessiblePlaylists = "https://www.youtube.com/@accessible_videha/playlists";
const stages = [
  {title:"Kavita Sabha", kicker:"POETRY", text:"Poetry across the current journal, historic issues, collected verse and recorded Videha programmes.", links:[{label:"Read poetry",url:"https://www.videha.co.in/verse.htm"},{label:"Videha eJournal video",url:videoPlaylists},{label:"Gajendra Thakur video",url:gajendraPlaylists}]},
  {title:"Rangmanch", kicker:"THEATRE", text:"Nine bilingual illustrated plays, dramatic writing, stage traditions and recorded performance.", links:[{label:"Theatre & performance",url:"https://www.videha.co.in/Audio_Video.htm"},{label:"Find Rang-Sangam",query:"Rang-Sangam"},{label:"Videha eJournal video",url:videoPlaylists},{label:"Accessible Videha",url:accessiblePlaylists}]},
  {title:"Shishu Utsav", kicker:"YOUNG READERS", text:"Thirty-seven illustrated novels, stories, quizzes and learning material for children and adolescents.", links:[{label:"Children’s programme",url:"https://www.videha.co.in/kids.htm"},{label:"Find children’s books",query:"Children"},{label:"Videha E-learning video",url:elearningPlaylists}]},
  {title:"Anuvad Manch", kicker:"TRANSLATION", text:"Sanskrit philosophical texts, multilingual literary translation and movement between Maithili and English.", links:[{label:"Find translations",query:"translation"},{label:"Browse Pothi records",source:"pothi"},{label:"Videha E-learning video",url:elearningPlaylists}]},
  {title:"Samiksha Kaksh", kicker:"CRITICISM", text:"Author criticism, literary historiography, forgotten writers and arguments about the Maithili canon.", links:[{label:"Discussion archive · 12 parts",url:"#criticismArchive"},{label:"Find criticism",query:"Criticism"},{label:"Find Parallel History",query:"Parallel History"}]},
  {title:"Archive Assembly", kicker:"PUBLIC MEMORY", text:"Issue-by-issue discovery across 447 archived Videha issues and 37 Sadeha compilations.", links:[{label:"Search periodicals",url:"#issues"},{label:"Videha eJournal video",url:videoPlaylists},{label:"Gajendra Thakur video",url:gajendraPlaylists},{label:"Accessible Videha",url:accessiblePlaylists}]},
];

let issueRecords = [];
let bookLimit = 24;
let issueLimit = 30;
let currentBookSource = "all";
let currentBookView = "shelf";

function renderCovers(){ $("#coverRail").innerHTML = covers.map(([src,title]) => `<article class="cover-card"><img src="assets/${encodeURI(src)}" alt="Book cover: ${title}" loading="lazy"><span>${title}</span></article>`).join(""); }
function renderStages(){ $("#stageGrid").innerHTML = stages.map(s => `<article class="stage-card"><p class="eyebrow">${escapeHTML(s.kicker)}</p><h3>${escapeHTML(s.title)}</h3><p>${escapeHTML(s.text)}</p><div class="stage-links">${s.links.map(link => link.query ? `<button type="button" data-book-query="${escapeHTML(link.query)}">${escapeHTML(link.label)} ↓</button>` : link.source ? `<button type="button" data-book-source-jump="${escapeHTML(link.source)}">${escapeHTML(link.label)} ↓</button>` : `<a href="${escapeHTML(link.url)}" ${link.url.startsWith("http")?'target="_blank" rel="noopener"':""}>${escapeHTML(link.label)} ↗</a>`).join("")}</div></article>`).join(""); }
function renderBooks(reset=false){
  if(reset) bookLimit=24;
  const q=$("#bookSearch").value.trim().toLowerCase(), cat=$("#bookCategory").value;
  const matches=books.filter(b=>(currentBookSource==="all"||b.source===currentBookSource)&&(cat==="all"||b.category===cat)&&(!q||`${b.title} ${b.category} ${b.detail} ${b.author||""}`.toLowerCase().includes(q)));
  if(currentBookView==="bookwise")matches.sort((a,b)=>a.title.localeCompare(b.title,["mai","hi","en"],{sensitivity:"base",numeric:true}));
  if(currentBookView==="authorwise")matches.sort((a,b)=>(a.author||"").localeCompare(b.author||"",["mai","hi","en"],{sensitivity:"base"})||a.title.localeCompare(b.title,["mai","hi","en"],{sensitivity:"base",numeric:true}));
  $("#bookCount").textContent=`Showing ${Math.min(bookLimit,matches.length)} of ${matches.length} indexed books and volumes`;
  let previousAuthor="";
  $("#bookGrid").classList.toggle("authorwise",currentBookView==="authorwise");
  $("#bookGrid").innerHTML=matches.slice(0,bookLimit).map(b=>{
    const authorHeading=currentBookView==="authorwise"&&b.author!==previousAuthor?`<h3 class="author-heading"${languageAttribute(b.author)}>${escapeHTML(b.author||"Author not encoded in source catalogue")}</h3>`:"";
    previousAuthor=b.author;
    return `${authorHeading}<article class="book-card"><span class="tag">${escapeHTML(b.category)}</span><h3${languageAttribute(b.title)}>${escapeHTML(b.title)}</h3><p${languageAttribute(b.detail)}>${escapeHTML(b.detail)}</p>${currentBookView!=="authorwise"&&b.author?`<span class="byline"${languageAttribute(b.author)}>${escapeHTML(b.author)}</span>`:""}${b.links?`<div class="book-links">${b.links.map(link=>`<a href="${escapeHTML(link.url)}" target="_blank" rel="noopener">${escapeHTML(link.label)} ↗</a>`).join("")}</div>`:`<a href="${escapeHTML(b.url)}" target="_blank" rel="noopener">Open publication record ↗</a>`}</article>`;
  }).join("") || "<p>No books match those filters.</p>";
  $("#moreBooks").hidden=bookLimit>=matches.length;
}
function renderIssues(reset=false){
  if(reset) issueLimit=30;
  const q=$("#issueSearch").value.trim().toLowerCase(), pub=$("#publication").value, year=$("#issueYear").value;
  const matches=issueRecords.filter(x=>(pub==="all"||x.publication===pub)&&(year==="all"||String(x.year)===year)&&(!q||`${x.issue} ${x.title} ${x.date||""} ${x.year||""}`.toLowerCase().includes(q))).sort((a,b)=>b.issue-a.issue);
  $("#issueCount").textContent=`Showing ${Math.min(issueLimit,matches.length)} of ${matches.length} publication files`;
  $("#issueGrid").innerHTML=matches.slice(0,issueLimit).map(x=>`<article class="issue-card"><span class="issue-no">${x.publication} · ${x.issue}${x.version?` · VERSION ${x.version}`:""}</span><h3>${x.title}</h3>${x.date?`<time datetime="${x.dateISO||""}">${x.date}</time>`:""}<a href="${x.source}" target="_blank" rel="noopener">Read archived issue ↗</a></article>`).join("") || "<p>No issues match those filters.</p>";
  $("#moreIssues").hidden=issueLimit>=matches.length;
}

const langs = {"as":"Assamese","bn":"Bengali","bho":"Bhojpuri","gu":"Gujarati","hi":"Hindi","kn":"Kannada","ml":"Malayalam","mr":"Marathi","ne":"Nepali","or":"Odia","pa":"Punjabi","sa":"Sanskrit","sd":"Sindhi","si":"Sinhala","ta":"Tamil","te":"Telugu","ur":"Urdu","ar":"Arabic","zh-CN":"Chinese (Simplified)","zh-TW":"Chinese (Traditional)","nl":"Dutch","fr":"French","de":"German","el":"Greek","he":"Hebrew","id":"Indonesian","it":"Italian","ja":"Japanese","ko":"Korean","ms":"Malay","fa":"Persian","pl":"Polish","pt":"Portuguese","ro":"Romanian","ru":"Russian","es":"Spanish","sw":"Swahili","th":"Thai","tr":"Turkish","uk":"Ukrainian","vi":"Vietnamese"};
function togglePanel(id){ const el=$(id); const open=el.hidden; $$(".panel").forEach(p=>p.hidden=true); el.hidden=!open; }
function listen(text){
  if(!("speechSynthesis" in window)){ alert("Listening is not supported in this browser."); return; }
  speechSynthesis.cancel();
  const chosen=(text||window.getSelection()?.toString()||"").trim() || $(".hero-copy .dek").textContent;
  const u=new SpeechSynthesisUtterance(chosen); u.lang=/[\u0900-\u097F]/.test(chosen)?"hi-IN":"en-IN"; speechSynthesis.speak(u);
}
function openTranslate(){ const lang=$("#language").value; const url=`https://translate.google.com/translate?sl=en&tl=${encodeURIComponent(lang)}&u=${encodeURIComponent(location.href)}`; window.open(url,"_blank","noopener"); }
function globalSearch(q){
  q=q.trim().toLowerCase(); if(!q)return;
  const foundBooks=books.filter(b=>`${b.title} ${b.category} ${b.detail} ${b.author||""}`.toLowerCase().includes(q)).slice(0,60);
  const foundIssues=issueRecords.filter(x=>`${x.publication} ${x.issue} ${x.title} ${x.date||""} ${x.year||""}`.toLowerCase().includes(q)).slice(0,60);
  const foundStages=stages.filter(s=>`${s.title} ${s.kicker} ${s.text}`.toLowerCase().includes(q));
  const all=[...foundBooks.map(x=>({kind:"Book",title:x.title,desc:`${x.category} · ${x.detail}`,url:x.url})),...foundIssues.map(x=>({kind:"Issue",title:x.title,desc:`${x.publication} ${x.issue} · ${x.date||"undated"}`,url:x.source})),...foundStages.map(x=>({kind:"Stage",title:x.title,desc:x.text,url:x.links[0].url||"#stages"}))];
  $("#searchDialogTitle").textContent=`Results for “${q}”`;
  $("#searchResults").innerHTML=all.length?all.map(x=>`<article class="search-result"><span class="kind">${x.kind}</span><div><h3>${x.title}</h3><p>${x.desc}</p></div><a href="${x.url}" ${x.url.startsWith("http")?'target="_blank" rel="noopener"':""}>Open ↗</a></article>`).join(""):"<p>No matching books, issues or festival stages were found.</p>";
  $("#searchDialog").hidden=false; document.body.style.overflow="hidden"; $("#closeSearch").focus();
}

async function init(){
  renderCovers(); renderStages();
  Object.entries(langs).forEach(([code,name])=>$("#language").insertAdjacentHTML("beforeend",`<option value="${code}">${name}</option>`));
  try{
    const pothi=await fetch("data/pothi.json").then(r=>r.json());
    pothi.forEach(x=>{const category=/गजेन्द्र ठाकुर|Gajendra Thakur/i.test(x.author)?"Gajendra Thakur archive":"Videha Pothi";books.push({title:x.title,category,detail:x.author||"Videha Pothi archive record",author:x.author||"Author not stated in source catalogue",url:x.url||"https://www.videha.co.in/pothi.htm",source:"pothi"});});
    $("#pothiCount").textContent=pothi.length.toLocaleString("en-IN");
  }catch{}
  try{
    const githubBooks=await fetch("data/github-library.json").then(r=>r.json());
    githubBooks.forEach(x=>books.push({...x,author:"GitHub catalogue · author not encoded",source:"github"}));
    $("#githubCount").textContent=githubBooks.length.toLocaleString("en-IN");
  }catch{}
  $("#curatedCount").textContent=books.filter(book=>book.source==="curated").length.toLocaleString("en-IN");
  $("#allBookCount").textContent=books.length.toLocaleString("en-IN");
  $("#searchStatus").textContent=`Search ${books.length.toLocaleString("en-IN")} book and study records plus 485 Videha–Sadeha files.`;
  [...new Set(books.map(b=>b.category))].sort().forEach(c=>$("#bookCategory").insertAdjacentHTML("beforeend",`<option>${c}</option>`));
  renderBooks();
  try{
    const data=await fetch("data/archive.json").then(r=>r.json()); issueRecords=data.archive; $("#videhaCount").textContent=data.archiveMaxVideha; $("#lastUpdated").textContent=`Archive data updated ${new Date(data.generated).toLocaleDateString("en-IN",{dateStyle:"medium"})}`;
    [...new Set(issueRecords.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a).forEach(y=>$("#issueYear").insertAdjacentHTML("beforeend",`<option>${y}</option>`)); renderIssues();
  }catch(e){$("#issueCount").textContent="Archive index could not be loaded.";}
  const requestedQuery=new URLSearchParams(location.search).get("q");
  if(requestedQuery){$("#globalSearch").value=requestedQuery;globalSearch(requestedQuery);}
}

$("#bookSearch").addEventListener("input",()=>renderBooks(true)); $("#bookCategory").addEventListener("change",()=>renderBooks(true)); $("#clearBooks").addEventListener("click",()=>{$("#bookSearch").value="";$("#bookCategory").value="all";renderBooks(true)}); $("#moreBooks").addEventListener("click",()=>{bookLimit+=24;renderBooks()});
$$('[data-book-source]').forEach(button=>button.addEventListener("click",()=>{currentBookSource=button.dataset.bookSource;$$('[data-book-source]').forEach(item=>item.classList.toggle("active",item===button));renderBooks(true)}));
$$('[data-book-view]').forEach(button=>button.addEventListener("click",()=>{currentBookView=button.dataset.bookView;$$('[data-book-view]').forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",active)});renderBooks(true)}));
$("#issueSearch").addEventListener("input",()=>renderIssues(true)); $("#publication").addEventListener("change",()=>renderIssues(true)); $("#issueYear").addEventListener("change",()=>renderIssues(true)); $("#moreIssues").addEventListener("click",()=>{issueLimit+=30;renderIssues()});
$("#globalSearchForm").addEventListener("submit",e=>{e.preventDefault();globalSearch($("#globalSearch").value)}); $("#closeSearch").addEventListener("click",()=>{$("#searchDialog").hidden=true;document.body.style.overflow=""});
$("#listenBtn").addEventListener("click",()=>listen()); $("#readerListen").addEventListener("click",()=>listen($(".reader-copy p:nth-of-type(2)").textContent));
$("#translateBtn").addEventListener("click",()=>togglePanel("#translatePanel")); $("#goTranslate").addEventListener("click",openTranslate);
$("#accessBtn").addEventListener("click",()=>togglePanel("#accessPanel"));
$("#accessPanel").addEventListener("click",e=>{const a=e.target.dataset.access;if(!a)return;if(a==="size")document.body.classList.toggle("large");if(a==="spacing")document.body.classList.toggle("spacious");if(a==="contrast")document.body.classList.toggle("contrast");if(a==="reset")document.body.className="";});
document.addEventListener("click",event=>{
  const queryControl=event.target.closest("[data-book-query]");
  if(queryControl){event.preventDefault();currentBookSource="all";$$('[data-book-source]').forEach(item=>item.classList.toggle("active",item.dataset.bookSource==="all"));$("#bookSearch").value=queryControl.dataset.bookQuery;$("#bookCategory").value="all";renderBooks(true);$("#books").scrollIntoView({behavior:"smooth"});return;}
  const sourceControl=event.target.closest("[data-book-source-jump]");
  if(sourceControl){event.preventDefault();currentBookSource=sourceControl.dataset.bookSourceJump;$$('[data-book-source]').forEach(item=>item.classList.toggle("active",item.dataset.bookSource===currentBookSource));$("#bookSearch").value="";$("#bookCategory").value="all";renderBooks(true);$("#books").scrollIntoView({behavior:"smooth"});return;}
  const issueControl=event.target.closest("[data-issue-publication]");
  if(issueControl){$("#publication").value=issueControl.dataset.issuePublication;renderIssues(true);}
});
$(".menu-toggle").addEventListener("click",e=>{const open=$("#primary-nav").classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",open)}); $$("#primary-nav a").forEach(a=>a.addEventListener("click",()=>$("#primary-nav").classList.remove("open")));
window.addEventListener("scroll",()=>$("#toTop").classList.toggle("show",scrollY>700),{passive:true}); $("#toTop").addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
init();
