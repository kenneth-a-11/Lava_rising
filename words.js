// WORD BANK - Philippine edition. Member 3: keep adding words (more words = fairer game).
// Words are grouped in rows (several per line), separated by commas. Lowercase, letters only.
// Spaces, hyphens, and accents are ignored when checking
// (so "Kare-Kare" and "karekare" both work; "Puerto Princesa" = "puertoprincesa").
const WORD_BANK = [
  {
    category: "Filipino Dishes",
    words: `
      adobo, sinigang, lechon, pancit, sisig, karekare,
      kaldereta, menudo, afritada, mechado, bulalo, tinola,
      nilaga, dinuguan, pinakbet, laing, bicolexpress, lumpia,
      paksiw, tapsilog, longsilog, tocino, longganisa, bistek,
      balut, kilawin, pochero, arrozcaldo, goto, lugaw,
      batchoy, crispypata, chicharon, tokwatbaboy, tinapa, tuyo,
      daing, bagnet, pinangat, ginataan, lechonkawali, sinampalukan
    `
  },
  {
    category: "Filipino Snacks & Desserts",
    words: `
      halohalo, bibingka, puto, kutsinta, suman, turon,
      bananacue, camotecue, lecheflan, polvoron, pastillas, ubehalaya,
      taho, bukopie, maruya, biko, sapinsapin, palitaw,
      kakanin, cassavacake, mamon, ensaymada, pandesal, pianono,
      yema, fishball, kwekkwek, isaw, bukayo, espasol,
      tikoy, pichipichi, buchi, masareal
    `
  },
  {
    category: "Philippine Provinces",
    words: `
      batangas, cavite, laguna, rizal, quezon, bulacan,
      pampanga, tarlac, zambales, bataan, nuevaecija, pangasinan,
      launion, ilocosnorte, ilocossur, abra, benguet, ifugao,
      kalinga, apayao, cagayan, isabela, batanes, aurora,
      albay, camarinesnorte, camarinessur, catanduanes, masbate, sorsogon,
      aklan, antique, capiz, guimaras, iloilo, negrosoccidental,
      negrosoriental, cebu, bohol, siquijor, leyte, samar,
      biliran, palawan, marinduque, mindoro, romblon, davao,
      cotabato, sultankudarat, sarangani, zamboanga, bukidnon, camiguin,
      lanao, misamis, agusan, surigao, dinagat, basilan,
      sulu, tawitawi, maguindanao
    `
  },
  {
    category: "Philippine Cities",
    words: `
      manila, quezoncity, makati, pasig, taguig, marikina,
      pasay, caloocan, mandaluyong, muntinlupa, paranaque, valenzuela,
      malabon, navotas, baguio, vigan, tagaytay, angeles,
      olongapo, naga, legazpi, iloilo, bacolod, dumaguete,
      tacloban, ormoc, cebu, davao, cagayandeoro, zamboanga,
      generalsantos, butuan, puertoprincesa, dasmarinas, antipolo, lipa,
      tuguegarao, laoag, dagupan, cabanatuan, kidapawan, koronadal
    `
  },
  {
    category: "Tourist Spots",
    words: `
      boracay, elnido, coron, siargao, mayon, chocolatehills,
      banaueterraces, intramuros, vigan, pagsanjan, taal, hundredislands,
      tubbataha, undergroundriver, panglao, donsol, sagada, kawasan,
      apoisland, camiguin, batanes, mountpulag, mountapo, samalisland,
      malapascua, bantayan, fortsantiago, rizalpark, luneta, calaguas,
      pinatubo, caramoan, anilao, bohol
    `
  },
  {
    category: "Philippine Wildlife & Fish",
    words: `
      tarsier, tamaraw, carabao, philippineeagle, haribon, butanding,
      whaleshark, pangolin, binturong, bearcat, philippinecrocodile, dugong,
      kalaw, hornbill, cockatoo, flyingfox, cloudrat, pawikan,
      seaturtle, bangus, tilapia, galunggong, tuna, dilis,
      tulingan, talakitok, lapulapu, maya, tamsi, mayang,
      kalanggay, monitorlizard, sailfish
    `
  },
  {
    category: "Tropical Fruits & Crops",
    words: `
      mango, banana, pineapple, papaya, coconut, calamansi,
      durian, mangosteen, lanzones, rambutan, jackfruit, langka,
      santol, guava, bayabas, atis, guyabano, soursop,
      pomelo, suha, dalandan, chico, macopa, duhat,
      kamias, tamarind, sampalok, avocado, pili, buko,
      ube, cassava, kamote, gabi, saging, sineguelas,
      balimbing, marang, lakatan, latundan, abaca, rice,
      sugarcane
    `
  },
  {
    category: "Festivals & Traditions",
    words: `
      sinulog, atiatihan, dinagyang, masskara, pahiyas, panagbenga,
      kadayawan, moriones, higantes, pintados, kaamulan, sandugo,
      santacruzan, sublian, obando, turumba, simbanggabi, parol,
      belen, pasko, nochebuena, undas, fiesta, salubong,
      giantlantern, pamahiin, mano, pagmamano, harana, pabasa,
      sinakulo, flores
    `
  },
  {
    category: "Filipino Childhood Games",
    words: `
      patintero, tumbangpreso, luksongtinik, luksongbaka, sipa, piko,
      taguan, agawanbase, holen, jackstones, tex, trumpo,
      sungka, dama, bahaybahayan, langitlupa, shatong, palosebo,
      kadangkadang, sipaan, tagutaguan, pogs, yoyo, kite,
      saranggola, paperboat, pitikbulag, syato, dampa
    `
  },
  {
    category: "Philippine Heroes",
    words: `
      rizal, bonifacio, aguinaldo, mabini, luna, delpilar,
      lapulapu, sakay, silang, aquino, josephrizal, andresbonifacio,
      emilioaguinaldo, apolinariomabini, antonioluna, marcelodelpilar, gregoriodelpilar, gabrielasilang,
      diegosilang, melchoraaquino, tandangsora, franciscobalagtas, dagohoy, emiliojacinto,
      jacinto, ramonmagsaysay, manuelquezon, josephestrada, corazonaquino, sultankudarat
    `
  },
  {
    category: "Philippine Languages & Groups",
    words: `
      tagalog, filipino, cebuano, ilocano, hiligaynon, waray,
      kapampangan, bikolano, pangasinense, maranao, tausug, maguindanaon,
      chavacano, ifugao, igorot, aeta, badjao, mangyan,
      tboli, bagobo, kalinga, ilonggo, bisaya, tagakaolo,
      subanen, manobo, yakan, ibanag, ivatan
    `
  },
];

// Compatibility: strips the commas and line breaks, turning each block back into a
// single space-separated string, so existing code that does words.split(" ") keeps working.
WORD_BANK.forEach(c => { c.words = c.words.split(/[\s,]+/).filter(Boolean).join(" "); });