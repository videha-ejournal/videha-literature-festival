const archiveMeta = JSON.parse(document.getElementById("archiveMeta").textContent);
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
const gajendraBooks = [
  {section:"01 · उपन्यास",title:"गोहि सभक बीच जलसमाधि",detail:"Maithili novel · complete teaching edition",file:"Gohi_Sabhak_Beech_Jalsamadhi.pdf"},
  {section:"01 · उपन्यास",title:"Water-Burial Among the Crocodiles",detail:"English translation · novel",file:"Water_Burial_Among_the_Crocodiles.pdf"},
  {section:"02 · कथा",title:"Gajendra Thakur Chayanit Katha",detail:"Selected Maithili stories",file:"Gajendra_Thakur_Chayanit_Katha.pdf"},
  {section:"02 · कथा",title:"Gajendra Thakur · 82 Selected Stories",detail:"Selected stories collection",file:"Gajendra_Thakur_82_Selected_Stories.pdf"},
  {section:"03 · कविता",title:"Rang-Sangam · Khand 1",detail:"Poetry and stage writing",file:"GAJENDRA_THAKUR_SAMAGRA_RANG_SANGAM.pdf"},
  {section:"03 · कविता",title:"Rang-Sangam · Khand 2",detail:"Poetry and stage writing",file:"Rang_Sangam_Khand_2.pdf"},
  {section:"04 · आलोचना",title:"प्रबन्ध · निबन्ध · समालोचना",detail:"Critical and applied studies",file:"GAJENDRA_THAKUR_SAMAGRA_PNS.pdf"},
  {section:"05 · इतिहास",title:"A Parallel History of Mithila & Maithili Literature",detail:"History collection and reference volumes",file:"VIDEHA_Parallel_History.pdf"},
  {section:"05 · इतिहास",title:"History of Mithila, Vajji & Anga",detail:"From prehistory to the contemporary period",file:"HISTORY_MITHILA_ANGA_VAJJI.pdf"},
  {section:"06 · दर्शन",title:"गजेन्द्र ठाकुरक समानान्तर दर्शन",detail:"Parallel Philosophy",file:"GAJENDRA_THAKUR_PARALLEL_PHILOSOPHY.pdf"},
  {section:"06 · दर्शन",title:"Bhamati · भामती",detail:"Sanskrit into Maithili translation",file:"GAJENDRA_THAKUR_SAMAGRA_Bhamati.pdf"},
  {section:"06 · दर्शन",title:"Ātmatattvaviveka · आत्मतत्त्वविवेक",detail:"Sanskrit into Maithili translation",file:"GAJENDRA_THAKUR_SAMAGRA_Atmatattvaviveka.pdf"},
  {section:"06 · दर्शन",title:"Nyāyakusumāñjali · न्यायकुसुमाञ्जलि",detail:"Sanskrit into Maithili translation",file:"GAJENDRA_THAKUR_SAMAGRA_NYAYAKUSUMANJALI.pdf"},
  {section:"06 · दर्शन",title:"Tattvacintāmaṇi · तत्त्वचिन्तामणि",detail:"Sanskrit into Maithili translation",file:"GAJENDRA_THAKUR_SAMAGRA_Tattvacintamani.pdf"},
  {section:"07 · भाषा",title:"Maithili–English Thesaurus",detail:"Maithili reference work",file:"GAJENDRA_THAKUR_SAMAGRA_Maithili_English_Thesaurus.pdf"},
  {section:"07 · भाषा",title:"English–Maithili Thesaurus",detail:"English reference work",file:"GAJENDRA_THAKUR_SAMAGRA_English_Maithili_Thesaurus.pdf"},
  {section:"08 · रंगमंच",title:"Rang-Sangam · सम्पूर्ण PDF",detail:"Maithili plays and English stage adaptations",file:"GAJENDRA_THAKUR_SAMAGRA_RANG_SANGAM.pdf"},
  {section:"09 · बाल साहित्य",title:"३७ टा मैथिली बाल उपन्यास",detail:"Children’s novels collection",file:"GAJENDRA_THAKUR_SAMAGRA_37_MAITHILI_CHILDREN_NOVELS.pdf"},
  {section:"10 · दृश्य-श्रव्य",title:"ए.आइ. सँ वीडियो बनाउ",detail:"AI video self-learning edition",file:"GAJENDRA_THAKUR_SAMAGRA_AI_VIDEO.pdf"},
  {section:"10 · दृश्य-श्रव्य",title:"मैथिली रेडियो नाटक",detail:"Radio drama self-learning guide",file:"GAJENDRA_THAKUR_SAMAGRA_MAITHILI_RADIO_NATAK.pdf"},
  {section:"11 · समग्र सम्पादकीय",title:"गजेन्द्र ठाकुर समग्रक सम्पादकीय",detail:"Editorial and selected works",file:"Gajendra_Thakur_Samagra_Sampadakiya.pdf"},
  {section:"12 · अनुवाद",title:"संस्कृत साहित्य · 13 books in Maithili translation",detail:"Thirteen translated literary works",file:"GAJENDRA_THAKUR_SAMAGRA_Sanskrit_Sahitya_13_Books.pdf"},
  {section:"12 · अनुवाद",title:"गजेन्द्र ठाकुर समग्र · अनुवाद खण्ड",detail:"Other-language to Maithili and Maithili to English translations",file:"GAJENDRA_THAKUR_SAMAGRA_ANUVAD_KHAND.pdf"},
  {section:"12 · अनुवाद",title:"विदेह–सदेह 1–37",detail:"Selected and edited periodical archive",file:"GAJENDRA_THAKUR_SAMAGRA_Videha_Sadeha_1-37.pdf"},
];
const gajendraPdf = file => `https://raw.githubusercontent.com/videha-ejournal/videha-ejournal/main/${encodeURIComponent(file)}`;
function renderGajendraShelf(){
  const groups=[...new Set(gajendraBooks.map(book=>book.section))];
  $("#gajendraShelf").innerHTML=groups.map(section=>`<section class="gajendra-group" aria-labelledby="gajendra-${section.slice(0,2)}"><h4 id="gajendra-${section.slice(0,2)}">${section}</h4><div class="gajendra-grid">${gajendraBooks.filter(book=>book.section===section).map((book,index)=>`<article class="gajendra-card"><h5${languageAttribute(book.title)}>${escapeHTML(book.title)}</h5><p>${escapeHTML(book.detail)}</p><a href="${gajendraPdf(book.file)}" target="_blank" rel="noopener" download>Read PDF ↗</a></article>`).join("")}</div></section>`).join("");
}
suppliedBooks.forEach((book)=>books.push({...book,url:book.links[0].url}));
childTitles.forEach((title, i) => books.push({ title, category: "Children’s literature", detail: `Illustrated Maithili children’s novel ${i + 1} of 37`, url: "https://archive.org/download/videha-petar-2/37_MAITHILI%20NOVELS.pdf" }));
playTitles.forEach(title => books.push({ title, category: "Theatre", detail: "Maithili and English illustrated stage-play editions", url: "https://www.videha.co.in/Audio_Video.htm" }));
[
  ["Maithili Thesaurus", "Language", "A cumulative Maithili reference work"],
  ["Gajendra Thakur Samagra", "Collected works", "Collected creative, critical, historical and translated writings"],
].forEach(([title, category, detail]) => books.push({ title, category, detail, url: "https://www.videha.co.in/gajendra-thakur-samagra.htm" }));
books.forEach(book => { book.source = "curated"; book.author = book.author || "Gajendra Thakur · author, editor or translator"; });

const baseCovers = [
  ["decoding-the-panji.webp", "Decoding the Panji of Mithila I"], ["decoding-panji-ii-front.webp", "Decoding the Panji II"], ["decoding-panji-vol-iii-spread.webp", "Decoding the Panji III"], ["decoding-panji-vol-iv-spread.webp", "Decoding the Panji IV"], ["decoding-panji-vol-v-spread.webp", "Decoding the Panji V"], ["decoding-panji-vi-front.webp", "Decoding the Panji VI"], ["mithila-parallel-history-front-cover-6x9.webp", "A Parallel History"], ["parallel-philosophy-front-cover-6x9.webp", "Parallel Philosophy"], ["atmatattvaviveka-front-cover-en.webp", "Ātmatattvaviveka"], ["bhamati-front-cover-en.webp", "Bhāmatī"], ["nyaya-kusumanjali-front-cover-en.webp", "Nyāyakusumāñjali"], ["tattvacintamani-front-cover-en.webp", "Tattvacintāmaṇi"], ["cover-front.webp", "History of Mithila, Vajji & Anga"]
];
const gajendraDesktopCovers = [
  ["01_01_Sahasrabadhani_Front_Cover_6x9.png", "01 01 Sahasrabadhani 6x9"],
  ["01_The_Other_Side_of_Memory_Front_Cover_6x9.png", "01 The Other Side of Memory 6x9"],
  ["02_01_srashirsha_front.png", "02 01 srashirsha"],
  ["03_01_gohi_jalsamadhi_front_cover.png", "03 01 gohi jalsamadhi"],
  ["04_01_KutNaam_Tarhadime_Gohi_Front_Cover_6x9.png", "04 01 KutNaam Tarhadime Gohi 6x9"],
  ["05_01_Bijji_Gohi_Sabhak_Beech_Front_Cover_6x9.png", "05 01 Bijji Gohi Sabhak Beech 6x9"],
  ["06_01_Saatam_Sakshi_Front_Cover_6x9.png", "06 01 Saatam Sakshi 6x9"],
  ["07_01_Paatak_Bhitar_Likhal_Naam_Front_6x9.png", "07 01 Paatak Bhitar Likhal Naam 6x9"],
  ["A_Water_Burial_Among_the_Crocodiles_Front_Cover_6x9.png", "A Water Burial Among the Crocodiles 6x9"],
  ["Anuvad_Khand_Front_Cover.png", "Anuvad Khand"],
  ["Anuvadak_8x11_FRONT_COVER.png", "Anuvadak 8x11"],
  ["Atmatattvaviveka_Front_Cover_EN.png", "Atmatattvaviveka EN"],
  ["Bhamati_Front_Cover_EN.png", "Bhamati EN"],
  ["Code_Name_Crocodile_in_the_Depths_Front_Cover_6x9.png", "Code Name Crocodile in the Depths 6x9"],
  ["complete_single_volume_front.png", "complete single volume"],
  ["cover_front_Tome_I_Consolidated_REVISED.png", "Tome I Consolidated REVISED"],
  ["cover_front_Tome_I_Part_1_REVISED.png", "Tome I Part 1 REVISED"],
  ["cover_front_Tome_I_Part_2_REVISED.png", "Tome I Part 2 REVISED"],
  ["cover_front_Tome_II_REVISED.png", "Tome II REVISED"],
  ["cover_front_Tome_III_REVISED.png", "Tome III REVISED"],
  ["cover_front_Tome_IV_REVISED.png", "Tome IV REVISED"],
  ["cover_front.png", ""],
  ["cover-___-___-__.jpg", ""],
  ["Cover-p001.png", "p001"],
  ["Decoding_Panji_II_Front.png", "Decoding Panji II"],
  ["Decoding_Panji_VI_front.png", "Decoding Panji VI"],
  ["Five_Percent_Darkness_Front_Cover_6x9.png", "Five Percent Darkness 6x9"],
  ["Front_2.png", "2"],
  ["FRONT_SADEHA_28.png", "SADEHA 28"],
  ["FRONT_SADEHA_37.jpeg", "SADEHA 37"],
  ["FRONT_TOME_1.png", "TOME 1"],
  ["FRONT_TOME_2.png", "TOME 2"],
  ["FRONT_TOME_3.png", "TOME 3"],
  ["FRONT_TOME_4.png", "TOME 4"],
  ["Front.png", ""],
  ["Gajendra_Thakur_82_Stories_Front_Cover_6x9.png", "Gajendra Thakur 82 Stories 6x9"],
  ["Gajendra_Thakur_Samagra_Front_Cover.png", "Gajendra Thakur Samagra"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_FRONT_6x9.png", "Gajendra Thakur Samagrak Sampadakiya 6x9"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_09_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 09"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_1_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 1"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_13_Front_Cover.png", "Gajendra Thakur Samagrak Sampadakiya Khand 13"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_14_Front_Cover.png", "Gajendra Thakur Samagrak Sampadakiya Khand 14"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_15_Front_Cover.png", "Gajendra Thakur Samagrak Sampadakiya Khand 15"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_2_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 2"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_20_Front_Cover_6x9.png", "Gajendra Thakur Samagrak Sampadakiya Khand 20 6x9"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_25_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 25"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_26_Front_6x9_300DPI.png", "Gajendra Thakur Samagrak Sampadakiya Khand 26 6x9 300DPI"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_27_Front_6x9_300DPI.png", "Gajendra Thakur Samagrak Sampadakiya Khand 27 6x9 300DPI"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_28_Tattvacintamani_Front_6x9_300DPI.png", "Gajendra Thakur Samagrak Sampadakiya Khand 28 Tattvacintamani 6x9 300DPI"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_29_Bhamati_Front_6x9_300DPI.png", "Gajendra Thakur Samagrak Sampadakiya Khand 29 Bhamati 6x9 300DPI"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_3_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 3"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_30_Front_6x9_300DPI.png", "Gajendra Thakur Samagrak Sampadakiya Khand 30 6x9 300DPI"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_31_Front_6x9_300DPI.png", "Gajendra Thakur Samagrak Sampadakiya Khand 31 6x9 300DPI"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_32_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 32"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_33_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 33"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_34_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 34"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_4_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 4"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_41_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 41"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_42_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 42"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_43_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 43"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_44_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 44"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_45_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 45"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_46_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 46"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_47_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 47"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_48_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 48"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_49_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 49"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_5_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 5"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_50_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 50"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_51_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 51"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_52_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 52"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_53_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 53"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_54_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 54"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_55_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 55"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_56_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 56"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_57_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 57"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_58_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 58"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_59_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 59"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_60_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 60"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_61_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 61"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_62_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 62"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_63_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 63"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_64_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 64"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_65_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 65"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_66_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 66"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_67_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 67"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_68_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 68"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_69_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 69"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_70_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 70"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_71_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 71"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_72_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 72"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_73_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 73"],
  ["Gajendra_Thakur_Samagrak_Sampadakiya_Khand_74_Front.png", "Gajendra Thakur Samagrak Sampadakiya Khand 74"],
  ["Hundred-Story_Trilogy_Vol_II_Front_Cover_6x9.png", "Hundred Story Trilogy Vol II 6x9"],
  ["Hundred-Story_Trilogy_Vol1_Front_Cover_6x9.png", "Hundred Story Trilogy Vol1 6x9"],
  ["Jal_Samadhi_Among_the_Crocodiles_Mithila_Front_Cover_6x9_2.png", "Jal Samadhi Among the Crocodiles Mithila 6x9 2"],
  ["JalPanji_Front_Cover_6x9_UltraModern.png", "JalPanji 6x9 UltraModern"],
  ["Je_Naam_Pothime_Nahi_Bilingual_Front_Cover.png", "Je Naam Pothime Nahi Bilingual"],
  ["Khand_1_front.jpg", "Khand 1"],
  ["Khand_2_front.png", "Khand 2"],
  ["Khand_3_front.png", "Khand 3"],
  ["Khand_4_front.png", "Khand 4"],
  ["Khand_5_front.png", "Khand 5"],
  ["Khand_6_front.png", "Khand 6"],
  ["Khand_7_Front.png", "Khand 7"],
  ["Khand_8_Front.png", "Khand 8"],
  ["Kurukshetram_Inner_Mind_English_Front_Cover_6x9.png", "Kurukshetram Inner Mind English 6x9"],
  ["Kurukshetram_Inner_Mind_Volume_II_Front_Cover_6x9.png", "Kurukshetram Inner Mind Volume II 6x9"],
  ["Light_Front_Cover_6x9.png", "Light 6x9"],
  ["Mithila_Parallel_History_Front_Cover_6x9.png", "Mithila Parallel History 6x9"],
  ["Mongoose_Front_Cover_6x9.png", "Mongoose 6x9"],
  ["NAVYA_NYAYA_OFFSHORE_GAMBLING_WEB_8x11_CLASSIC_FRONT.png", "NAVYA NYAYA OFFSHORE GAMBLING WEB 8x11 CLASSIC"],
  ["New_Wings_Front_Cover_6x9.png", "New Wings 6x9"],
  ["Nit_Naval_Ashish_Anchinhar_front_cover.png", "Nit Naval Ashish Anchinhar"],
  ["Nit_Naval_Bechan_Thakur_front_cover.png", "Nit Naval Bechan Thakur"],
  ["Nit_Naval_Kamla_Chaudhary_Front_Cover_6x9.png", "Nit Naval Kamla Chaudhary 6x9"],
  ["Nit_Naval_Kumar_Pawan_front_cover_6x9.png", "Nit Naval Kumar Pawan 6x9"],
  ["Nit_Naval_Kunal_Front_Cover_6x9.png", "Nit Naval Kunal 6x9"],
  ["Nit_Naval_Lalita_Jha_Front_Cover_6x9.png", "Nit Naval Lalita Jha 6x9"],
  ["Nit_Naval_Nand_Kumar_Mishra_Front_Cover_6x9.png", "Nit Naval Nand Kumar Mishra 6x9"],
  ["Nit_Naval_Parmeshwar_Kapari_Front_Cover_6x9.png", "Nit Naval Parmeshwar Kapari 6x9"],
  ["Nit_Naval_Virendra_Mallick_Front_Cover_6x9.png", "Nit Naval Virendra Mallick 6x9"],
  ["Nit_Naval_Vrishesh_Chandra_Lal_Front_Cover_6x9.png", "Nit Naval Vrishesh Chandra Lal 6x9"],
  ["Nit_Naval_Yoganand_Jha_Front_Cover_6x9.png", "Nit Naval Yoganand Jha 6x9"],
  ["Nyaya_Kusumanjali_Front_Cover_EN.png", "Nyaya Kusumanjali EN"],
  ["Panik_Lekha_Bilingual_Front_Cover.png", "Panik Lekha Bilingual"],
  ["Parallel_History_Front_Cover_6x9.png", "Parallel History 6x9"],
  ["Parallel_Philosophy_Front_Cover_6x9.png", "Parallel Philosophy 6x9"],
  ["PART_1_FRONT.png", "PART 1"],
  ["PART_2_FRONT.png", "PART 2"],
  ["PNS_Front_Cover_A4.png", "PNS A4"],
  ["Rang_Sangam_Front_Cover.png", "Rang Sangam"],
  ["Rang_Sangam_Khand2_Front_6x9.png", "Rang Sangam Khand2 6x9"],
  ["Sahasrabadhani_Front_Cover_6x9.png", "Sahasrabadhani 6x9"],
  ["Samanantar_Darshan_Front_Cover_6x9.png", "Samanantar Darshan 6x9"],
  ["swapna_me_mijjhar_hoit_front_cover_8x11.png", "swapna me mijjhar hoit 8x11"],
  ["Tattvacintamani_Front_Cover_EN.png", "Tattvacintamani EN"],
  ["The_Hundred-Story_Trilogy_Vol_III_Front_Cover_6x9.png", "The Hundred Story Trilogy Vol III 6x9"],
  ["The_Name_Written_Within_The_Leaf_FRONT_COVER_6x9.png", "The Name Written Within The Leaf 6x9"],
  ["The_Seventh_Witness_Front_Cover_6x9.png", "The Seventh Witness 6x9"],
  ["Three_Streams_Vol_I_Front_Cover_6x9.png", "Three Streams Vol I 6x9"],
  ["Three_Streams_Vol3_Front_Cover_6x9.png", "Three Streams Vol3 6x9"],
  ["vidah-front.jpg", "vidah"],
  ["videha-front.jpg", "videha"],
  ["volume_0_front.png", "volume 0"],
  ["volume_1_front.png", "volume 1"],
  ["volume_2_front.png", "volume 2"],
  ["Vyapti_Bilingual_Front_Cover.png", "Vyapti Bilingual"],
  ["Water-Burial_Trilogy_Front_Cover_6x9.png", "Water Burial Trilogy 6x9"]
];
// The canonical Gajendra covers live in the dedicated asset subfolder.
gajendraDesktopCovers.forEach((cover) => { cover[0] = `gajendra-covers/${cover[0]}`; });
const covers = [...baseCovers];

const videoPlaylists = "https://www.youtube.com/@videha_ejournal/playlists";
const elearningPlaylists = "https://www.youtube.com/@videha-elearning/playlists";
const gajendraPlaylists = "https://www.youtube.com/user/ggajendra71/playlists";
const accessiblePlaylists = "https://www.youtube.com/@accessible_videha/playlists";
const rangmanchMedia = [
  {group:"Playlists",title:"विदेह डोक्यूमेन्टरी / नाटक · Videha Documentary / Drama",kind:"playlist",id:"PLXne1kENT3DE",url:"https://www.youtube.com/playlist?list=PLXne1kENT3DE"},
  {group:"Playlists",title:"विदेह नाट्य उत्सव · Videha Nāṭya Utsav",kind:"playlist",id:"PLWihOy3I0j1k",url:"https://youtube.com/playlist?list=PLWihOy3I0j1k"},
  {group:"Playlists",title:"Animated Drama",kind:"playlist",id:"PLHsUvziVO3Y8",url:"https://www.youtube.com/playlist?list=PLHsUvziVO3Y8"},
  {group:"Performances",title:"ममता गाबय गीत",kind:"video",id:"4jhaQ3Nw38I",url:"https://youtu.be/4jhaQ3Nw38I"},
  {group:"Performances",title:"कन्यादान",kind:"video",id:"V3KWthhB6Kg",url:"https://youtu.be/V3KWthhB6Kg"},
  {group:"Performances",title:"ललका पाग · भाग 1",kind:"video",id:"0IEgYJSe-q8",url:"https://youtu.be/0IEgYJSe-q8"},
  {group:"Performances",title:"ललका पाग · भाग 2",kind:"video",id:"1lH_lubNQaI",url:"https://youtu.be/1lH_lubNQaI"},
  {group:"Performances",title:"नचिकेताक एक छल राजा · भाग 1",kind:"video",id:"gzW8FTK6RQU",url:"https://youtu.be/gzW8FTK6RQU"},
  {group:"Performances",title:"नचिकेताक एक छल राजा · भाग 2",kind:"video",id:"04Uqa_r04Z4",url:"https://youtu.be/04Uqa_r04Z4"},
  {group:"Performances",title:"काठक लोक · महेन्द्र मलंगिया · भाग 1",kind:"video",id:"AMOU4nIk0AY",url:"https://youtu.be/AMOU4nIk0AY"},
  {group:"Performances",title:"काठक लोक · महेन्द्र मलंगिया · भाग 2",kind:"video",id:"oCd3UxfiXvQ",url:"https://youtu.be/oCd3UxfiXvQ"},
  {group:"Theatre network",title:"मिनाप · Mithila Natya Kala Parishad",kind:"link",url:"https://www.youtube.com/@mithilanatyakalaparishadmi5636"},
  {group:"Theatre network",title:"मैलोरंग",kind:"link",url:"https://www.youtube.com/@praakshjha"},
  {group:"Theatre network",title:"भंगिमा मैथिली थिएटर",kind:"link",url:"https://www.youtube.com/@bhangimamaithilitheatre9509"},
  {group:"Theatre network",title:"मैथिली रंगमंच",kind:"link",url:"https://www.youtube.com/@maithilirangmanch9536"},
  {group:"Theatre network",title:"कोकिल मंच",kind:"link",url:"https://www.youtube.com/@kokilmanch4330"},
  {group:"Theatre network",title:"रफ कट्स · नचिकेता",kind:"link",url:"https://www.youtube.com/@UdayaSingh"},
  {group:"Texts & criticism",title:"कुसमा-सलहेस आ अन्य छओ गोट नाटक · कुणाल",kind:"link",url:"https://archive.org/download/videha-petar_202604/Kunal%20Kusuma%20Salhesh%20and%206%20more%20plays.pdf"},
  {group:"Texts & criticism",title:"भूत-प्रेतक नाट्यशाला · गजेन्द्र ठाकुरक मैथिली अनुवाद",kind:"link",url:"https://archive.org/download/449221-kani-hansiyau-ne/453362-bhoot-pretak-natyashala.pdf"},
  {group:"Texts & criticism",title:"नबघर · चारिटा नाटक · बेचन ठाकुर",kind:"link",url:"https://archive.org/download/videha-petar_202604/Bechan%20Thakur%20Nav%20Ghar.pdf"},
  {group:"Texts & criticism",title:"रोबोट · अनूदित साइंस-फिक्शन नाटक · योगेन्द्र पाठक ‘वियोगी’",kind:"link",url:"https://archive.org/download/dudh-pain-pharak-pharak-umesh-mandal/ROBOT_VIYOGI.pdf"},
  {group:"Texts & criticism",title:"नाटककार लल्लन प्रसाद ठाकुर समग्र रचनावली",kind:"link",url:"https://archive.org/download/maithili_202209/Lallan_Pd_Thakur_Samagra.pdf"},
  {group:"Texts & criticism",title:"विदेह सदेह 8 · मैथिली नाट्य उत्सव · देवनागरी",kind:"link",url:"https://archive.org/download/videha-shishu-utsav/VIDEHA_NATYA_UTSAV.pdf"},
  {group:"Texts & criticism",title:"विदेह सदेह 8 · मैथिली नाट्य उत्सव · मिथिलाक्षर",kind:"link",url:"https://archive.org/download/videha-shishu-utsav/VIDEHA_NATYA_UTSAV_Tirhuta.pdf"},
  {group:"Texts & criticism",title:"नाटक विशेषांक · Videha 72 · 15 December 2010",kind:"link",url:"https://archive.org/download/videha-15-12-2011/Videha_15_12_2010.pdf"},
  {group:"Texts & criticism",title:"जिन्दगीक मोल पर टिप्पणी · Videha 354",kind:"link",url:"https://archive.org/download/videha-262/VIDEHA_354.pdf"},
  {group:"Texts & criticism",title:"नन्द विलास रायक कथा, एकांकी आ टिप्पणी · Videha 361",kind:"link",url:"https://archive.org/download/videha-262/VIDEHA_361.pdf"},
];
const stages = [
  {title:"Kavita Sabha", kicker:"POETRY", text:"Poetry across the current journal, historic issues, collected verse and recorded Videha programmes.", links:[{label:"Read poetry",url:"https://www.videha.co.in/verse.htm"},{label:"Videha eJournal video",url:videoPlaylists},{label:"Gajendra Thakur video",url:gajendraPlaylists}]},
  {title:"Rangmanch", kicker:"THEATRE", text:"Named performance videos, drama playlists, theatre organisations, texts and criticism from Videha’s Audio/Video index.", links:[{label:"Open Rangmanch player",url:"#rangmanchArchive"},{label:"Original Audio/Video index",url:"https://www.videha.co.in/Audio_Video.htm"},{label:"Find Rang-Sangam",query:"Rang-Sangam"}]},
  {title:"Shishu Utsav", kicker:"YOUNG READERS", text:"Thirty-seven illustrated novels, stories, quizzes and learning material for children and adolescents.", links:[{label:"Children’s programme",url:"https://www.videha.co.in/kids.htm"},{label:"Find children’s books",query:"Children"},{label:"Videha E-learning video",url:elearningPlaylists}]},
  {title:"Anuvad Manch", kicker:"TRANSLATION", text:"Sanskrit philosophical texts, multilingual literary translation and movement between Maithili and English.", links:[{label:"Find translations",query:"translation"},{label:"Browse Pothi records",source:"pothi"},{label:"Videha E-learning video",url:elearningPlaylists}]},
  {title:"Samiksha Kaksh", kicker:"CRITICISM", text:"Author criticism, literary historiography, forgotten writers and arguments about the Maithili canon.", links:[{label:"Discussion archive · 12 parts",url:"#criticismArchive"},{label:"Find criticism",query:"Criticism"},{label:"Find Parallel History",query:"Parallel History"}]},
  {title:"Archive Assembly", kicker:"PUBLIC MEMORY", text:"Issue-by-issue discovery across the preserved Videha and Sadeha archive.", links:[{label:"Search periodicals",url:"#issues"},{label:"Videha eJournal video",url:videoPlaylists},{label:"Gajendra Thakur video",url:gajendraPlaylists},{label:"Accessible Videha",url:accessiblePlaylists}]},
];

let issueRecords = [];
let bookLimit = 24;
let issueLimit = 30;
let currentBookSource = "all";
let currentBookView = "shelf";

function renderCovers(){ const assetRoot=location.pathname.includes("/mai/")?"../":""; const allCovers=[...covers,...extraGajendraCovers]; $("#coverRail").innerHTML = allCovers.map(([src,title]) => `<article class="cover-card"><img src="${new URL(assetRoot+"assets/"+encodeURI(src),location.href).href}" alt="Book cover: ${title}" loading="lazy"><span>${title}</span></article>`).join(""); }
function renderRangmanch(group="all"){
  const records=group==="all"?rangmanchMedia:rangmanchMedia.filter(item=>item.group===group);
  $("#rangmanchCount").textContent=`${records.length} source-linked records shown`;
  $("#rangmanchGrid").innerHTML=records.map(item=>item.kind==="link"?`<a class="rangmanch-item" href="${escapeHTML(item.url)}" target="_blank" rel="noopener"><span>${escapeHTML(item.group)}</span><strong${languageAttribute(item.title)}>${escapeHTML(item.title)}</strong><em>Open source ↗</em></a>`:`<button class="rangmanch-item playable" type="button" data-rangmanch-kind="${item.kind}" data-rangmanch-id="${escapeHTML(item.id)}" data-rangmanch-title="${escapeHTML(item.title)}"><span>${escapeHTML(item.group)}</span><strong${languageAttribute(item.title)}>${escapeHTML(item.title)}</strong><em>Play here ▶</em></button>`).join("");
}
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
  const devanagariDigits="०१२३४५६७८९";
  const normalizeIssueQuery=value=>String(value).trim().toLowerCase().replace(/[०-९]/g,d=>String(devanagariDigits.indexOf(d)));
  const q=normalizeIssueQuery($("#issueSearch").value), pub=$("#publication").value, year=$("#issueYear").value;
  const matches=issueRecords.filter(x=>(pub==="all"||x.publication===pub)&&(year==="all"||String(x.year)===year)&&(!q||`${x.issue} ${x.title} ${x.date||""} ${x.year||""}`.toLowerCase().includes(q))).sort((a,b)=>b.issue-a.issue);
  const publicationLabel = pub === "VIDEHA" ? "archived Videha files" : pub === "SADEHA" ? "preserved Sadeha files" : "preserved publication files";
  $("#issueCount").textContent=`Showing ${Math.min(issueLimit,matches.length)} of ${matches.length} ${publicationLabel}`;
  $("#issueGrid").innerHTML=matches.slice(0,issueLimit).map(x=>`<article class="issue-card"><span class="issue-no">${x.publication} · ${x.issue}${x.version?` · VERSION ${x.version}`:""}</span><h3>${x.title}</h3><time datetime="${x.dateISO||""}">${x.date||"Date not recorded"}</time><a href="${x.source}" target="_blank" rel="noopener">Read archived issue ↗</a></article>`).join("") || "<p>No issues match those filters.</p>";
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
function openTranslate(){ const lang=$("#language").value; const url=`https://translate.google.com/translate?sl=${document.documentElement.lang}&tl=${encodeURIComponent(lang)}&u=${encodeURIComponent(location.href)}`; window.open(url,"_blank","noopener"); }
function legacyGlobalSearch(q){
  q=q.trim().toLowerCase(); if(!q)return;
  const foundBooks=books.filter(b=>`${b.title} ${b.category} ${b.detail} ${b.author||""}`.toLowerCase().includes(q)).slice(0,60);
  const foundIssues=issueRecords.filter(x=>`${x.publication} ${x.issue} ${x.title} ${x.date||""} ${x.year||""}`.toLowerCase().includes(q)).slice(0,60);
  const foundStages=stages.filter(s=>`${s.title} ${s.kicker} ${s.text}`.toLowerCase().includes(q));
  const foundRangmanch=rangmanchMedia.filter(item=>`${item.group} ${item.title}`.toLowerCase().includes(q)).slice(0,30);
  const foundWorld=$$(".world-program-link").filter(link=>`${link.dataset.genre||""} ${link.textContent}`.toLowerCase().includes(q)).slice(0,30).map(link=>({kind:"World programme",title:link.querySelector("b")?.textContent||link.textContent,desc:link.querySelector("span")?.textContent||"Official external programme",url:link.href}));
  const all=[...foundBooks.map(x=>({kind:"Book",title:x.title,desc:`${x.category} · ${x.detail}`,url:x.url})),...foundIssues.map(x=>({kind:"Issue",title:x.title,desc:`${x.publication} ${x.issue} · ${x.date||"undated"}`,url:x.source})),...foundStages.map(x=>({kind:"Stage",title:x.title,desc:x.text,url:x.links[0].url||"#stages"})),...foundRangmanch.map(x=>({kind:"Rangmanch",title:x.title,desc:x.group,url:x.url})),...foundWorld];
  $("#searchDialogTitle").textContent=`Results for “${q}”`;
  $("#searchResults").innerHTML=all.length?all.map(x=>`<article class="search-result"><span class="kind">${x.kind}</span><div><h3>${x.title}</h3><p>${x.desc}</p></div><a href="${x.url}" ${x.url.startsWith("http")?'target="_blank" rel="noopener"':""}>Open ↗</a></article>`).join(""):"<p>No matching books, issues, stages, media or world programmes were found.</p>";
  $("#searchDialog").hidden=false; document.body.style.overflow="hidden"; $("#closeSearch").focus();
}

let initPromise;
function init(){ return initPromise ||= loadData(); }
async function loadData(){
  renderCovers(); renderRangmanch(); renderGajendraShelf();
  if(!$("#language").options.length) Object.entries(langs).forEach(([code,name])=>$("#language").insertAdjacentHTML("beforeend",`<option value="${code}">${name}</option>`));

  try{
    const pothi=await fetch(`data/pothi.json?v=${encodeURIComponent(archiveMeta.generated||"")}`,{cache:"no-store"}).then(r=>r.json());
    pothi.forEach(x=>{const category=/गजेन्द्र ठाकुर|Gajendra Thakur/i.test(x.author)?"Gajendra Thakur archive":"Videha Pothi";books.push({title:x.title,category,detail:x.author||"Videha Pothi archive record",author:x.author||"Author not stated in source catalogue",url:x.url||"https://www.videha.co.in/pothi.htm",source:"pothi"});});
    $("#pothiCount").textContent=pothi.length.toLocaleString("en-IN");
  }catch{}
  try{
    const githubBooks=await fetch(`data/github-library.json?v=${encodeURIComponent(archiveMeta.generated||"")}`,{cache:"no-store"}).then(r=>r.json());
    githubBooks.forEach(x=>books.push({...x,author:"GitHub catalogue · author not encoded",source:"github"}));
    $("#githubCount").textContent=githubBooks.length.toLocaleString("en-IN");
  }catch{}
  $("#curatedCount").textContent=books.filter(book=>book.source==="curated").length.toLocaleString("en-IN");
  $("#allBookCount").textContent=books.length.toLocaleString("en-IN");
  $("#searchStatus").textContent=`Search ${books.length.toLocaleString("en-IN")} book and study records, ${archiveMeta.stats.totalFiles} Videha–Sadeha files, ${rangmanchMedia.length} Rangmanch records and ${$$(".world-program-link").length} world programmes.`;
  [...new Set(books.map(b=>b.category))].sort().forEach(c=>$("#bookCategory").insertAdjacentHTML("beforeend",`<option>${c}</option>`));
  renderBooks();
  try{
    const data=await fetch(`data/archive.json?v=${encodeURIComponent(archiveMeta.generated||"")}`,{cache:"no-store"}).then(r=>r.json()); issueRecords=data.archive; $("#videhaCount").textContent=data.stats.videhaIssues; $("#lastUpdated").textContent=`Archive data updated ${new Date(data.generated).toLocaleDateString("en-IN",{dateStyle:"medium"})}`;
    [...new Set(issueRecords.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a).forEach(y=>$("#issueYear").insertAdjacentHTML("beforeend",`<option>${y}</option>`)); renderIssues();
  }catch(e){$("#issueCount").textContent="Archive index could not be loaded.";}

}

$("#bookSearch").addEventListener("input",()=>renderBooks(true)); $("#bookCategory").addEventListener("change",()=>renderBooks(true)); $("#clearBooks").addEventListener("click",()=>{$("#bookSearch").value="";$("#bookCategory").value="all";renderBooks(true)}); $("#moreBooks").addEventListener("click",()=>{bookLimit+=24;renderBooks()});
$$('[data-book-source]').forEach(button=>button.addEventListener("click",()=>{currentBookSource=button.dataset.bookSource;$$('[data-book-source]').forEach(item=>item.classList.toggle("active",item===button));renderBooks(true)}));
$$('[data-book-view]').forEach(button=>button.addEventListener("click",()=>{currentBookView=button.dataset.bookView;$$('[data-book-view]').forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",active)});renderBooks(true)}));
$$('[data-archive-part]').forEach(button=>button.addEventListener("click",()=>{
  const part=button.dataset.archivePart;
  const identifier=`videha-discussion-criticism-part-${part}`;
  $("#archivePlayer").src=`https://archive.org/embed/${identifier}?playlist=1`;
  $("#archivePlayer").title=`Videha Discussion and Criticism, Part ${part} Internet Archive player`;
  $("#archivePlayerTitle").textContent=`Playing collection: Part ${part} of 12`;
  $("#archiveDetailsLink").href=`https://archive.org/details/${identifier}`;
  $("#archiveDetailsLink").textContent=`Open Part ${part} on Internet Archive ↗`;
  $$('[data-archive-part]').forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",active)});
}));
$$('[data-rangmanch-filter]').forEach(button=>button.addEventListener("click",()=>{
  $$('[data-rangmanch-filter]').forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",active)});
  renderRangmanch(button.dataset.rangmanchFilter);
}));
$("#rangmanchGrid").addEventListener("click",event=>{
  const control=event.target.closest("[data-rangmanch-kind]");
  if(!control)return;
  const isPlaylist=control.dataset.rangmanchKind==="playlist";
  $("#rangmanchPlayer").src=isPlaylist?`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(control.dataset.rangmanchId)}`:`https://www.youtube-nocookie.com/embed/${encodeURIComponent(control.dataset.rangmanchId)}`;
  $("#rangmanchPlayer").title=`Rangmanch player: ${control.dataset.rangmanchTitle}`;
  $("#rangmanchPlayerTitle").textContent=`Now selected: ${control.dataset.rangmanchTitle}`;
  $("#rangmanchPlayer").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"center"});
});
$("#issueSearch").addEventListener("input",()=>init().then(()=>renderIssues(true))); $("#publication").addEventListener("change",()=>init().then(()=>renderIssues(true))); $("#issueYear").addEventListener("change",()=>init().then(()=>renderIssues(true))); $("#moreIssues").addEventListener("click",()=>{issueLimit+=30;renderIssues()});
$("#globalSearchForm").addEventListener("submit",e=>{e.preventDefault();globalSearch($("#globalSearch").value)}); $("#closeSearch").addEventListener("click",()=>{$("#searchDialog").hidden=true;document.body.style.overflow=""});
$("#listenBtn").addEventListener("click",()=>listen()); $("#readerListen").addEventListener("click",()=>listen($(".reader-copy p:nth-of-type(2)").textContent));
$("#translateBtn").addEventListener("click",()=>togglePanel("#translatePanel")); $("#goTranslate").addEventListener("click",openTranslate);
$("#languageSwitch")?.addEventListener("click",e=>{const hash=location.hash;if(hash)e.currentTarget.href+=(e.currentTarget.href.endsWith('/')?'':'/')+hash;});
$("#accessBtn").addEventListener("click",()=>togglePanel("#accessPanel"));
$("#accessPanel").addEventListener("click",e=>{const a=e.target.dataset.access;if(!a)return;const body=document.body;const classes={spacing:"spacious",width:"readable-width",links:"highlight-links",images:"hide-images",motion:"stop-motion",targets:"large-targets",cursor:"large-cursor",reader:"reader-view",gray:"gray-colour",invert:"invert-colour",dark:"dark-contrast",high:"high-contrast"};if(a==="larger")body.classList.add("large");if(a==="smaller")body.classList.remove("large");if(a==="normal"||a==="colour-normal"){body.classList.remove("contrast","dark-contrast","high-contrast","gray-colour","invert-colour");}if(classes[a])body.classList.toggle(classes[a]);if(a==="reset"){body.className="";$("#accessSizeValue").textContent="100%";}if(a==="larger")$("#accessSizeValue").textContent="116%";if(a==="smaller")$("#accessSizeValue").textContent="100%";});
$("#copyCitation")?.addEventListener("click",async()=>{const citation=`Videha Literature Festival. “Videha and Sadeha periodical archive.” ${location.href.split('#')[0]}`;try{await navigator.clipboard.writeText(citation);$("#copyCitation").textContent="Citation copied";}catch{$("#copyCitation").textContent=citation;}});
document.addEventListener("click",event=>{
  const queryControl=event.target.closest("[data-book-query]");
  if(queryControl){event.preventDefault();currentBookSource="all";$$('[data-book-source]').forEach(item=>item.classList.toggle("active",item.dataset.bookSource==="all"));$("#bookSearch").value=queryControl.dataset.bookQuery;$("#bookCategory").value="all";renderBooks(true);$("#books").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});return;}
  const sourceControl=event.target.closest("[data-book-source-jump]");
  if(sourceControl){event.preventDefault();currentBookSource=sourceControl.dataset.bookSourceJump;$$('[data-book-source]').forEach(item=>item.classList.toggle("active",item.dataset.bookSource===currentBookSource));$("#bookSearch").value="";$("#bookCategory").value="all";renderBooks(true);$("#books").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});return;}
  const issueControl=event.target.closest("[data-issue-publication]");
  if(issueControl){$("#publication").value=issueControl.dataset.issuePublication;renderIssues(true);}
});
$(".menu-toggle").addEventListener("click",e=>{const open=$("#primary-nav").classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",open)}); $$("#primary-nav a").forEach(a=>a.addEventListener("click",()=>$("#primary-nav").classList.remove("open")));
window.addEventListener("scroll",()=>$("#toTop").classList.toggle("show",scrollY>700),{passive:true}); $("#toTop").addEventListener("click",()=>scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}));

function normalize(value='') {
  let text=String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[०-९]/g,n=>'०१२३४५६७८९'.indexOf(n));
  const aliases={'पंजी':'panji','विद्यापति':'vidyapati','विदेह':'videha','सदेह':'sadeha','कन्यादान':'kanyadaan','kanyadan':'kanyadaan','अंक':'issue','गजेन्द्र':'gajendra','ठाकुर':'thakur','नाटक':'theatre','कविता':'poetry'};
  for(const [from,to] of Object.entries(aliases))text=text.replaceAll(from.normalize('NFKD').replace(/\p{M}/gu,''),to);
  return text.replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
let scope='all', searchOrder='relevance', searchLimit=60, searchOpener, searchTicket=0;
function searchRecords(){
  return [...books.map(b=>({scope:'books',title:b.title,desc:`${b.category} · ${b.detail} · ${b.author||''}`,url:b.url})),
    ...issueRecords.map(r=>({scope:'issues',title:r.title,desc:`${r.publication} issue ${r.issue} ${r.date||''} ${r.year||''}`,url:r.source,issue:r.issue})),
    {scope:'issues',title:`Current Videha Issue ${archiveMeta.currentIssue}`,desc:archiveMeta.currentIssueDate,url:archiveMeta.currentIssueUrl,issue:archiveMeta.currentIssue},
    ...stages.map(s=>({scope:'stages',title:s.title,desc:s.kicker+' '+s.text,url:s.links[0].url||'#stages'})),
    ...rangmanchMedia.map(m=>({scope:'media',title:m.title,desc:m.group,url:m.url})),
    ...$$('.world-program-link').map(a=>({scope:'world',title:a.querySelector('b')?.textContent||a.textContent,desc:a.textContent+' '+a.dataset.genre,url:a.href}))];
}
function closeResults(){
  $('#searchDialog').hidden=true;document.body.style.overflow='';
  $$('body > [inert]').forEach(el=>el.inert=false);
  if(searchOpener?.isConnected)searchOpener.focus();
}
async function globalSearch(query, reset=true){
  const ticket=++searchTicket;
  if($('#searchDialog').hidden)searchOpener=document.activeElement;
  $('#searchStatus').textContent=document.documentElement.lang==='mai'?'खोज तैयार भऽ रहल अछि…':'Loading search records…';
  await init();if(ticket!==searchTicket)return;
  if(reset)searchLimit=60;
  const q=normalize(query), words=q.split(' ').filter(Boolean);
  const matches=searchRecords().filter(r=>words.every(w=>normalize(r.title+' '+r.desc).includes(w)));
  $$('[data-scope-count]').forEach(el=>el.textContent=`(${matches.filter(r=>el.dataset.scopeCount==='all'||r.scope===el.dataset.scopeCount).length})`);
  const results=matches.filter(r=>scope==='all'||r.scope===scope);
  results.sort((a,b)=>searchOrder==='title'?a.title.localeCompare(b.title,['mai','en'],{numeric:true}):['newest','oldest'].includes(searchOrder)?(a.issue==null)-(b.issue==null)||((a.issue||0)-(b.issue||0))*(searchOrder==='newest'?-1:1):Number(normalize(b.title).includes(q))-Number(normalize(a.title).includes(q)));
  const url=new URL(location.href);query.trim()?url.searchParams.set('q',query.trim()):url.searchParams.delete('q');scope==='all'?url.searchParams.delete('scope'):url.searchParams.set('scope',scope);searchOrder==='relevance'?url.searchParams.delete('sort'):url.searchParams.set('sort',searchOrder);history.replaceState(null,'',url);
  const mai=document.documentElement.lang==='mai';
  $('#searchDialogTitle').textContent=mai?`${results.length} परिणाम`:`${results.length} results${query?' for “'+query+'”':''}`;
  $('#searchStatus').textContent=mai?`${results.length} परिणाम`:`${results.length} matching records · ${scope}`;
  $('#searchResults').innerHTML=`<div class="search-scopes"><label>${mai?'खोजक क्षेत्र':'Scope'} <select id="dialogScope">${['all','books','issues','stages','media','world'].map((s,i)=>`<option value="${s}" ${s===scope?'selected':''}>${mai?['सभ','पोथी','अंक','मंच','दृश्य-श्रव्य','विश्व संवाद'][i]:s} (${matches.filter(r=>s==='all'||r.scope===s).length})</option>`).join('')}</select></label><label>${mai?'क्रम':'Sort'} <select id="dialogSort">${['relevance','title','newest','oldest'].map((s,i)=>`<option value="${s}" ${s===searchOrder?'selected':''}>${mai?['प्रासंगिकता','शीर्षक','नव अंक पहिने','पुरान अंक पहिने'][i]:s}</option>`).join('')}</select></label><button id="dialogClear">${mai?'सभ हटाउ':'Clear all'}</button></div><p>${mai?'देखाओल परिणाम':'Showing'} ${Math.min(results.length,searchLimit)} / ${results.length}</p>`+
    results.slice(0,searchLimit).map(r=>`<article class="search-result"><span class="kind">${escapeHTML(r.scope)}</span><div><h3${languageAttribute(r.title)}>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.desc)}</p></div><a href="${escapeHTML(r.url)}">${mai?'खोलू':'Open'} →</a></article>`).join('')+(results.length>searchLimit?`<button id="moreSearch">${mai?'आओर परिणाम':'Show more results'}</button>`:'');
  $('#dialogScope').onchange=e=>{scope=e.target.value;syncSearchControls();globalSearch(query);};
  $('#dialogSort').onchange=e=>{searchOrder=e.target.value;syncSearchControls();globalSearch(query);};
  $('#dialogClear').onclick=clearSearch;
  $('#moreSearch')?.addEventListener('click',()=>{searchLimit+=60;globalSearch(query,false);});
  const opening=$('#searchDialog').hidden;
  $('#searchDialog').hidden=false;document.body.style.overflow='hidden';
  $$('body > *').filter(el=>!['SCRIPT','STYLE'].includes(el.tagName)&&el.id!=='searchDialog').forEach(el=>el.inert=true);
  if(opening)$('#closeSearch').focus();else $('#dialogScope').focus();
}
function syncSearchControls(){
  $$('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scope===scope));if($('#searchSort'))$('#searchSort').value=searchOrder;
}
function clearSearch(){
  searchTicket++;scope='all';searchOrder='relevance';$('#globalSearch').value='';syncSearchControls();closeResults();
  const url=new URL(location.href);['q','scope','sort'].forEach(k=>url.searchParams.delete(k));history.replaceState(null,'',url);
  $('#searchStatus').textContent=document.documentElement.lang==='mai'?'नव खोज शुरू करू।':'Search cleared. Choose a scope or enter a new search.';
  $$('[data-scope-count]').forEach(el=>el.textContent='');$('#globalSearch').focus();
}
function setupNext(){
  const params=new URLSearchParams(location.search);
  scope=['books','issues','stages','media','world'].includes(params.get('scope'))?params.get('scope'):'all';
  searchOrder=['title','newest','oldest'].includes(params.get('sort'))?params.get('sort'):'relevance';syncSearchControls();
  $$('[data-scope]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.scope;syncSearchControls();globalSearch($('#globalSearch').value);}));
  $('#searchSort')?.addEventListener('change',e=>{searchOrder=e.target.value;globalSearch($('#globalSearch').value);});
  $('#clearAll')?.addEventListener('click',clearSearch);$('#closeSearch')?.addEventListener('click',closeResults);
  document.addEventListener('keydown',event=>{
    if($('#searchDialog').hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeResults();}
    if(event.key==='Tab'){
      const controls=$$('a[href],button,select,input,[tabindex="0"]',$('#searchDialog')).filter(el=>!el.hidden&&!el.disabled);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  document.addEventListener('toggle',e=>{if(e.target.open && e.target.querySelector?.('#books,#issues,#stages'))init();},true);
  document.addEventListener('focusin',e=>{if(e.target.closest('#books,#issues'))init();});
  if(params.has('q')||params.has('scope')){$('#globalSearch').value=params.get('q')||'';globalSearch($('#globalSearch').value);}
  else if(['#books','#issues'].includes(location.hash))init();
}

setupNext();
const extraGajendraCovers = ["0000-Kurukshetram_Antarmanak_Mithila_Front_Cover_6x9.png","0001-37-maithili-childrens-graphic-novels-kindle-cover_1.jpg","0002-37-maithili-childrens-graphic-novels-kindle-cover_2.jpg","0003-00_37_CHILDREN_NOVELS_FRONT_COVER_6x9_page-0001.jpg","0004-37_Maithili_Children_Graphic_Novels_FRONT_COVER_6x9_page-0001.jpg","0005-khand_1_front.png","0006-khand_2_front.png","0007-khand_3_front.png","0008-khand_4_front.png","0009-Akulait-Sur_front-cover.png","0010-Divan-e-Videha_Front_Cover_6x9.png","0011-Divan-e-Videha_Khand2_Front_Cover_6x9.png","0012-Nav_Pankhi_Front_Cover_6x9.png","0013-01_01_Sahasrabadhani_Front_Cover_6x9.png","0014-02_01_srashirsha_front.png","0015-03_01_gohi_jalsamadhi_front_cover.png","0016-04_01_KutNaam_Tarhadime_Gohi_Front_Cover_6x9.png","0017-05_01_Bijji_Gohi_Sabhak_Beech_Front_Cover_6x9.png","0018-06_01_Saatam_Sakshi_Front_Cover_6x9.png","0019-07_01_Paatak_Bhitar_Likhal_Naam_Front_6x9.png","0020-RangSangam_Front_Cover_8x11.png","0021-Rang_Sangam_Khand2_Front_6x9.png","0022-Front.png","0023-Je_Naam_Pothime_Nahi_Bilingual_Front_Cover.png","0024-Panik_Lekha_Bilingual_Front_Cover.png","0025-Vyapti_Bilingual_Front_Cover.png","0026-gohi_jalsamadhi_cover_with_text.png","0027-Khand_5_front.png","0028-Khand_6_front.png","0029-FRONT_SADEHA_28.png","0030-FRONT_SADEHA_37.jpeg","0031-FRONT_TOME_1.png","0032-FRONT_TOME_2.png","0033-FRONT_TOME_3.png","0034-FRONT_TOME_4.png","0035-cover_front.png","0036-cover_front_Tome_I_Consolidated_REVISED.png","0037-cover_front_Tome_I_Part_1_REVISED.png","0038-cover_front_Tome_I_Part_2_REVISED.png","0039-cover_front_Tome_II_REVISED.png","0040-cover_front_Tome_III_REVISED.png","0041-cover_front_Tome_IV_REVISED.png","0042-cover_front_Tome_I.png","0043-cover_front_Tome_I_Part_1.png","0044-cover_front_Tome_I_Part_2.png","0045-cover_front_Tome_II.png","0046-cover_front_Tome_III.png","0047-cover_front_Tome_IV.png","0048-Front_2.png","0049-Gonhi_Sabhak_Beech_Jalsamadhi_Front_Cover_fixed.jpg","0050-Cover_Front__3__page-0001.jpg","0051-Cover_Front_page-0001.jpg","0052-DONE_FRONT.png","0053-vidah-front.jpg","0054-videha-front.jpg","0055-English_Maithili_Thesaurus_front_cover_A4_300dpi.jpg","0056-Maithili_English_Thesaurus_front_cover_A4_300dpi.jpg","0057-978-93-340-8313-2_frontcover.jpg","0058-cover_Videha_405_Hitnath_Jha.jpg","0059-English_Maithili_Thesaurus_FrontCover-p001.png","0060-Maithili_English_Thesaurus_Front_Cover-p001.png","0061-English_Maithili_Thesaurus_front_cover_page-0001.jpg","0062-Maithili_English_Thesaurus_front_cover_page-0001.jpg","0063-Decoding_Panji_II_Front.jpg","0064-Decoding_the_Panji_of_Mithila_Volume_II_Front_Cover.png","0065-Decoding_Panji_VI_front.jpg","0066-Decoding_Panji_Vol_III_FRONT_cover.png","0067-Decoding_Panji_Vol_IV_FRONT_cover.png","0068-Decoding_Panji_Vol_V_FRONT_cover.png","0069-Tattvacintamani_Front_Cover_6x9_300dpi.png","0070-Gohi_Jalsamadhi_BalSanskaran_Front_Cover.png","0071-Anuvad_Khand_Front_Cover.png","0072-PNS_front_2.png","0073-PNS_front.png","0074-PNS_Vol1_Front_Cover_8x11.png","0075-PNS_Vol2_Front_Cover_8x11.png","0076-PNS_Front_Cover_A4.png","0077-Gajendra_Thakur_Samagra_Front_Cover.png","0078-Sadeha_Vol1_Sadhantik_Front_Cover.png","0079-Sadeha_Vol2_Anuprayukt_Front_Cover.png","0080-Videha_Sadeha_1-37_Front_Cover_8x11.png","0081-VIDEHA_AI_VIDEO_front_cover_6x9.png","0082-VIDEHA_RADIO_NATAK_front_cover_6x9.png","0083-swapna_me_mijjhar_hoit_front_cover_8x11.png","0084-Bhamati_Front_Cover_6x9_300dpi.png","0085-NyayaKusumanjali_Front_Cover_6x9__1_.png","0086-Nyaya_Kusumanjali_Front_Cover_6x9_300dpi.png","0087-________________front_cover_6x9_300dpi.png","0088-Atmatattvaviveka_Front_Cover_6x9_300dpi.png","0089-Atmatattvaviveka_Front_Cover_EN.png","0090-Bhamati_Front_Cover_EN.png","0091-Nyaya_Kusumanjali_Front_Cover_EN.png","0092-Tattvacintamani_Front_Cover_EN.png","0093-Abhijnanashakuntalam_English_Front_Cover_6x9.png","0094-Abhijnanashakuntalam_Maithili_Front_Cover_6x9.png","0095-Agamadambara_Maithili_Front_Cover_6x9.png","0096-Much_Ado_About_Religion_English_Front_Cover_6x9.png","0097-Bhagavadajjukam_Front_Cover_6x9.png","0098-Bhallata_Kshemendra_Nilakantha_English_Front_Cover_6x9.png","0099-Bhallata_Kshemendra_Nilakantha_Maithili_Front_Cover_6x9.png","0100-Chaturbhani_English_Front_Cover_6x9.png","0101-Chaturbhani_Maithili_Front_Cover_6x9.png","0102-Damak_Prahasanam_Maithili_Front_Cover_6x9.png","0103-Damak_Prahasanam_English_Front_Cover_6x9.png","0104-Hasyarnava_English_Front_Cover_6x9.png","0105-Hasyarnava_Maithili_Front_Cover_6x9.png","0106-Kadambari_Front_Cover_6x9.png","0107-Mattavilasa_English_Front_Cover_6x9.png","0108-Mattavilasa_Maithili_Front_Cover_6x9.png","0109-Maatik_Khelauna_Gaadi_Maithili_Front_Cover_6x9.png","0110-The_Little_Clay_Cart_English_Front_Cover_6x9.png","0111-Mudrarakshasa_English_Front_Cover_6x9_300dpi.png","0112-Mudrarakshasa_Maithili_Front_Cover_6x9_300dpi.png","0113-Palandumandana_English_Front_Cover_6x9.png","0114-Palandumandana_Maithili_Front_Cover_6x9.png","0115-Ramas_Last_Act_English_Front_Cover_6x9.png","0116-Uttara_Ramacharitam_Maithili_Front_Cover_6x9.png","0117-Sanskrit_Sahitya_13_Books_Front_Cover_8x11.png","0118-Front_Cover.png","0119-Full_Cover_Front_2.png","0120-Full_Cover_Front.png","0121-Videha-Shodh-Lekh_Front-Cover_8x11.png","0122-When_Dreams_Merge_Front_Cover.png","0123-Swapn_me_Mijjar_Hoit_Front_Cover_8x11.png","0124-02_discovery_literary_flyer.png","0125-flyer_02_discovery.png","0126-Videha_446_Dev_Cover_Front.png","0127-Videha_446_Tirhuta_Cover_Front.png","0128-01_Videha-Shodh-Lekh_Front-Cover_8x11.png","0129-Tattvacintamani_Front_Cover_Devanagari_6x9_300dpi.png","0130-Tattvacintamani_Front_Cover_Tirhuta_6x9_300dpi.png","0131-Parallel_Philosophy_Front_Cover_6x9.png","0132-Mithila_Parallel_History_Front_Cover_6x9.png","0133-VIDEHA_DISCOVERY_OF_MITHILA__ENGLISH.png","0134-Gajendra_Thakur_Samagrak_Sampadakiya_FRONT_6x9.png","0135-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_1_Front.png","0136-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_2_Front.png","0137-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_3_Front.png","0138-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_4_Front.png","0139-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_5_Front.png","0140-Khand_7_Front.png","0141-Khand_8_Front.png","0142-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_09_Front.png","0143-Khand_10_Front.png","0144-Khand_11_Front.png","0145-Khand_12_Front.png","0146-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_13_Front_Cover.png","0147-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_14_Front_Cover.png","0148-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_15_Front_Cover.png","0149-Bijji_Gohi_Sabhak_Beech_Khand16_Front_Cover_6x9.png","0150-Paanch_Pratishat_Andhar_Khand17_Front_Cover_6x9.png","0151-Khand_18_Front_6x9_300dpi.png","0152-Khand_19_Front_6x9_300dpi.png","0153-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_20_Front_Cover_6x9.png","0154-Samagra_Khand_21_Front_Cover.png","0155-Samagra_Khand_22_Front_Cover.png","0156-Samagra_Khand_23_Front_Cover.png","0157-Samagra_Khand_24_Front_Cover.png","0158-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_25_Front.png","0159-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_26_Front_6x9_300DPI.png","0160-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_27_Front_6x9_300DPI.png","0161-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_28_Tattvacintamani_Front_6x9_300DPI.png","0162-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_29_Bhamati_Front_6x9_300DPI.png","0163-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_30_Front_6x9_300DPI.png","0164-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_31_Front_6x9_300DPI.png","0165-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_32_Front.png","0166-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_33_Front.png","0167-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_34_Front.png","0168-Khand_35_Front_Cover.png","0169-Khand_36_Front_Cover.png","0170-Khand_37_Front_Cover.png","0171-Khand_38_Front_Cover.png","0172-Khand_39_Front_Cover.png","0173-Khand_40_Front_Cover.png","0174-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_41_Front.png","0175-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_42_Front.png","0176-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_43_Front.png","0177-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_44_Front.png","0178-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_45_Front.png","0179-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_46_Front.png","0180-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_47_Front.png","0181-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_48_Front.png","0182-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_49_Front.png","0183-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_50_Front.png","0184-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_51_Front.png","0185-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_52_Front.png","0186-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_53_Front.png","0187-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_54_Front.png","0188-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_55_Front.png","0189-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_56_Front.png","0190-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_57_Front.png","0191-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_58_Front.png","0192-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_59_Front.png","0193-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_60_Front.png","0194-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_61_Front.png","0195-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_62_Front.png","0196-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_63_Front.png","0197-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_64_Front.png","0198-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_65_Front.png","0199-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_66_Front.png","0200-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_67_Front.png","0201-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_68_Front.png","0202-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_69_Front.png","0203-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_70_Front.png","0204-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_71_Front.png","0205-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_72_Front.png","0206-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_73_Front.png","0207-Gajendra_Thakur_Samagrak_Sampadakiya_Khand_74_Front.png","0208-Gohi_Jalsamadhi_KishorSanskaran_Front_Cover.png","0209-Gohi_Bal_Sanskaran_Front_Cover_6x9_FINAL_FIXED.png","0210-gohi_jalsamadhi_baal_front_cover.png","0211-gohi_jalsamadhi_kishor_front_cover.png","0212-gohi_jalsamadhi_front_cover.png","0213-complete_single_volume_front.png","0214-volume_0_front.png","0215-volume_1_front.png","0216-volume_2_front.png","0217-Water-Burial_Trilogy_Front_Cover_6x9.png","0218-01_cover.jpg","0219-Parallel_Philosophy_Volume_II_Front_Cover_8x11.png","0220-Samanantar_Darshan_Vol2_Front_Cover_8x11.png","0221-Samanantar_Darshan_VolII_Front_Cover_8x11.png","0222-Parallel_Philosophy_Vol2_Front_Cover.png","0223-Samanantar_Darshan_Front_Cover_6x9.png","0224-Samanantar_Darshan_1-2_front.png","0225-03_Front.png","0226-05_front-cover_6x9.png","0227-Front_Cover_8x11_EXACT.png","0228-front_cover_8x11_300dpi.png","0229-History_Mithila_Vajji_Anga_Vol2_FRONT_COVER_8x11.png","0230-Mithila_vajji_anga-socio-cultural-economic-front.png","0231-cover_Volume_II_Part_2.png","0232-History_Mithila_Vajji_Anga_Vol2_Part1_FRONT_COVER_8x11.png","0233-History_Mithila_Vajji_Anga_Vol2_Part2_FRONT_COVER_8x11.png","0234-History_Mithila_Vajji_Anga_Vol2_Part3_FRONT_COVER_8x11.png","0235-00_FINAL_FRONT.png","0236-HISTORY_FRONT.png","0237-Mithila_Parallel_History_Front_Cover_9x11.png","0238-Ijot_front_cover_6x9_2.png","0239-Ijot_front_cover_6x9.png","0240-Smritik_Dosar_Dis_Front_Cover_6x9.png","0241-Smritik_Dosar_Dis_Front_Cover_6x9_Green.png","0242-Smritik-Dosar-Dis_Front-Cover_5.png","0243-Cover_6.png","0244-Cover_7.png","0245-Cover_8.png","0246-Katha_Shatatrayi_Front_6x9.png","0247-Katha-Tridhara_Front_6x9.png","0248-Videha_Three_Covers_Text_6x9.png","0249-VIDEHA_BAJJIKA_FRONT_COVER_6x9_300DPI.png","0250-VIDEHA_STYLE_GUIDES_COMBINED_FRONT_COVER_6x9_300DPI.png","0251-VIDEHA_SHUDDHA_MAITHILI_MANUAL_FRONT_COVER_6x9_300DPI.png","0252-Videha_Style_Manual_front_cover_6x9.png","0253-Videha_Style_Manual_front_cover_v2_6x9.png","0254-Videha_Style_Manual_front_cover_v3_green_6x9.png","0255-01_Videha_Three_Covers_Text_6x9.png","0256-03_VIDEHA_STYLE_GUIDES_COMBINED_FRONT_COVER_6x9_300DPI.png","0257-05_VIDEHA_THETHI_ANGIKA_FRONT_COVER_6x9_300DPI.png","0258-07_VIDEHA_BAJJIKA_FRONT_COVER_6x9_300DPI.png","0259-09_Videha_Style_Manual_front_cover_v2_6x9.png","0260-11_Videha_Style_Manual_front_cover_v3_green_6x9.png","0261-13_VIDEHA_SHUDDHA_MAITHILI_MANUAL_FRONT_COVER_6x9_300DPI.png","0262-15_Videha_Style_Manual_front_cover_6x9.png","0263-VIDEHA_THETHI_ANGIKA_FRONT_COVER_6x9_300DPI.png","0264-Paanch_Pratishat_Andhar_Front_Cover_6x9.png","0265-Anuvadak_FRONT_COVER_8x11.png","0266-Navya_Nyaya_8x11_CLASSIC_Front_Cover.png","0267-KutNaam_Tarhadime_Gohi_Front_Cover_6x9.png","0268-Bijji_Gohi_Sabhak_Beech_Front_Cover_6x9.png","0269-Saatam_Sakshi_FRONT_6x9_VidehaCSS_Illustrated.png","0270-Saatam_Sakshi_FRONT_6x9_VidehaCSS.png","0271-Satam_Sakshi-front.png","0272-Saatam_Sakshi_Front_Cover_6x9.png","0273-Paatak_Bhitar_Likhal_Naam_Front_6x9.png","0274-Paatak_Bhitar_Front_Cover.png","0275-Jal-Panji_Front_Cover_6x9.png","0276-Kurukshetram_Antarmanak_6x9_Front.png","0277-cover_4_front.png","0278-cover_5_front.png","0279-Kurukshetram_Front.png","0280-Kurukshetram_New_Literary_Front.png","0281-7_Kurukshetram_Front.png","0282-8_Kurukshetram_Front.png","0283-9_Kurukshetram_New_Literary_Front.png","0284-Kurukshetram_Antarmanak_Dwitiya_Khand_Front_Cover_6x9.png","0285-Kurukshetram_Antarmanak_Pratham_Khand_Front_Cover_6x9.png","0286-Nit_Naval_Ashish_Anchinhar_front_cover.png","0287-Nit_Naval_Bechan_Thakur_front_cover.png","0288-Nit_Naval_Vrishesh_Chandra_Lal_Front_Cover_6x9.png","0289-Nit_Naval_Kamla_Chaudhary_Front_Cover_6x9.png","0290-Nit_Naval_Kumar_Pawan_front_cover_6x9.png","0291-Nit_Naval_Lalita_Jha_Front_Cover_6x9.png","0292-Nit_Naval_Nand_Kumar_Mishra_Front_Cover_6x9.png","0293-Nit_Naval_Kunal_Front_Cover_6x9.png","0294-Nit_Naval_Parmeshwar_Kapari_Front_Cover_6x9.png","0295-Cover-p001.png","0296-01_Nit_Naval_Kamla_Chaudhary_Front_Cover_6x9.png","0297-02_Nit_Naval_Yoganand_Jha_Front_Cover_6x9.png","0298-03_Nit_Naval_Lalita_Jha_Front_Cover_6x9.png","0299-04_Nit_Naval_Kunal_Front_Cover_6x9.png","0300-05_Nit_Naval_Parmeshwar_Kapari_Front_Cover_6x9.png","0301-06_Nit_Naval_Virendra_Mallick_Front_Cover_6x9.png","0302-07_Nit_Naval_Vrishesh_Chandra_Lal_Front_Cover_6x9.png","0303-10_Nit_Naval_Ashish_Anchinhar_front_cover.png","0304-11_Nit_Naval_Bechan_Thakur_front_cover.png","0305-12_Nit_Naval_Kumar_Pawan_front_cover_6x9.png","0306-13_Nit_Naval_Kumar_Pawan_front_cover_6x9.png","0307-14_Nit_Naval_Nand_Kumar_Mishra_Front_Cover_6x9.png","0308-Nit_Naval_Virendra_Mallick_Front_Cover_6x9.png","0309-Nit_Naval_Yoganand_Jha_Front_Cover_6x9.png","0310-cover-___-___-__.jpg","0311-Gajendra_Thakur_82_Stories_Front_Cover_6x9.png","0312-Code_Name_Crocodile_in_the_Depths_Front_Cover_6x9.png","0313-Five_Percent_Darkness_Front_Cover_6x9.png","0314-Kurukshetram_Inner_Mind_English_Front_Cover_6x9.png","0315-Kurukshetram_Inner_Mind_Front_Cover_6x9.png","0316-Kurukshetram_Inner_Mind_Volume_I_Front_Cover_6x9.png","0317-Kurukshetram_Inner_Mind_Volume_II_Front_Cover_6x9.png","0318-Light_Front_Cover_6x9.png","0319-Mongoose_Front_Cover_6x9.png","0320-NAVYA_NYAYA_OFFSHORE_GAMBLING_WEB_8x11_CLASSIC_FRONT.png","0321-New_Wings_Front_Cover_6x9.png","0322-01_The_Other_Side_of_Memory_Front_Cover_6x9.png","0323-A_Water_Burial_Among_the_Crocodiles_Front_Cover_6x9.png","0324-Hundred-Story_Trilogy_Vol_II_Front_Cover_6x9.png","0325-Hundred-Story_Trilogy_Vol1_Front_Cover_6x9.png","0326-Jal_Samadhi_Among_the_Crocodiles_Mithila_Front_Cover_6x9_2.png","0327-Jal_Samadhi_Among_the_Crocodiles_Mithila_Front_Cover_6x9.png","0328-JalPanji_Front_Cover_6x9_UltraModern.png","0329-The_Hundred-Story_Trilogy_Vol_III_Front_Cover_6x9.png","0330-The_Name_Written_Within_The_Leaf_FRONT_COVER_6x9.png","0331-The_Seventh_Witness_Front_Cover_6x9.png","0332-Three_Streams_Vol_I_Front_Cover_6x9.png","0333-Three_Streams_Vol2_Front_Cover_6x9.png","0334-Three_Streams_Vol3_Front_Cover_6x9.png","0335-The_Hundred_Story_Trilogy_Volume_III_Part_1_Front_Cover_6x9.png","0336-The_Hundred_Story_Trilogy_Volume_III_Part_2_Front_Cover_6x9.png","0337-PART_1_FRONT.png","0338-PART_2_FRONT.png","0339-Three_Streams_Vol_II_Part_1_Front_Cover_6x9.png","0340-Three_Streams_Vol_II_Part_2_Front_Cover_6x9.png","0341-cover_merged.jpg","0342-Parallel_History_Front_Cover_6x9.png","0343-1_Parvat_Front.jpeg","0345-Sahasrabadhani_Front_Cover_6x9.png"].map((name) => ["gajendra-covers/"+name, name.replace(/^[0-9]+-/,'').replace(/[_-]+/g,' ').replace(/\.[^.]+$/,'')]);
