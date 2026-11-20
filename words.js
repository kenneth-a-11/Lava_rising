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
  {
    category: "Philippine Islands",
    words: `
      luzon, visayas, mindanao, palawan, mindoro, panay,
      negros, samar, leyte, cebu, bohol, masbate,
      marinduque, siquijor, camiguin, basilan, sulu, tawitawi,
      catanduanes, romblon, guimaras, biliran, dinagat, siargao,
      boracay, corregidor, mactan, lubang, batan, sabtang,
      dumaran, busuanga, culion, balabac, polillo, bantayan,
      malapascua, tablas, sibuyan, burias, ticao, camotes,
      olango, pamilacan, samal
    `
  },
  {
    category: "Mountains, Lakes & Rivers",
    words: `
      mayon, taal, pinatubo, apo, pulag, kanlaon,
      bulusan, makiling, banahaw, arayat, halcon, matutum,
      isarog, iriga, malindang, kitanglad, hamiguitan, sierramadre,
      cordillera, caraballo, lanao, sampaloc, buhi, bato,
      naujan, mainit, lakesebu, pasig, cagayan, agusan,
      pampanga, agno, abra, chico, marikina, magat,
      tagoloan
    `
  },
  {
    category: "Filipino Family & Relatives",
    words: `
      nanay, tatay, kuya, ate, ditse, lolo,
      lola, tito, tita, pinsan, bunso, panganay,
      apo, ninong, ninang, kumpare, kumare, biyenan,
      manugang, hipag, bayaw, anak, asawa, kapatid,
      ina, ama, magulang, sanggol
    `
  },
  {
    category: "Filipino Slang & Expressions",
    words: `
      kilig, hugot, petmalu, lodi, charot, gigil,
      tambay, sayang, pasalubong, diskarte, pasaway, kulit,
      jowa, chika, bes, sis, pre, ewan,
      ayos, susmaryosep, naku, aray, salamat, mabuhay,
      mahal, pogi, ganda, kabayan, ingat, sige,
      oks, tara, tamad, bahala
    `
  },
  {
    category: "Folklore & Mythical Creatures",
    words: `
      aswang, manananggal, tikbalang, kapre, duwende, tiyanak,
      nuno, diwata, bakunawa, sirena, sigbin, engkanto,
      santelmo, whitelady, bungisngis, mangkukulam, batibat, bathala,
      mariamakiling, malakas, maganda, lamang, bernardocarpio
    `
  },
  {
    category: "Filipino Folk Dances",
    words: `
      tinikling, singkil, pandanggo, maglalatik, carinosa, itikitik,
      subli, binasuan, kuratsa, pangalay, sayawsabangko, rigodon,
      habanera, bulaklakan, sakuting, binanog, pandanggosailaw
    `
  },
  {
    category: "Musical Instruments",
    words: `
      kulintang, gabbang, kubing, agung, dabakan, tambuli,
      bandurria, laud, octavina, kudyapi, tongali, palendag,
      gangsa, suling, kalutang, rondalla, gitara, tambol
    `
  },
  {
    category: "Clothing & Crafts",
    words: `
      barongtagalog, baro, saya, terno, malong, tapis,
      inabel, pina, sinamay, banig, bakya, salakot,
      patadyong, tubao, kimona, camisa, tnalak, hablon,
      balintawak, mariaclara, bayong
    `
  },
  {
    category: "Transportation",
    words: `
      jeepney, tricycle, pedicab, habalhabal, bangka, banca,
      bangkero, lrt, mrt, bus, taxi, kalesa,
      kuliglig, padyak, trike, ferry, roro, uv,
      motorcycle, tren, barko, eroplano, sakay, terminal,
      sidecar, skyway, nlex, slex, edsa
    `
  },
  {
    category: "Kitchen & Household Items",
    words: `
      kawali, kaldero, sandok, palayok, bayong, tabo,
      walis, dustpan, banig, unan, kumot, lamesa,
      upuan, bintana, pinto, kutsara, tinidor, plato,
      baso, mangkok, pitsel, kalan, lusong, bangko,
      duyan, basahan, timba, bilao, sangkalan, tsinelas
    `
  },
  {
    category: "Computer Hardware & Networking",
    words: `
      keyboard, monitor, mouse, motherboard, processor, ram,
      harddrive, ssd, gpu, powersupply, cpu, router,
      modem, switch, printer, scanner, webcam, speaker,
      headset, flashdrive, laptop, desktop, server, bios,
      firmware, heatsink, crimper, connector, utp, ethernet,
      wifi, bluetooth, thermalpaste, cmos, casefan, lantester,
      patchcord, firewall, ipaddress, subnet
    `
  },
  {
    category: "Programming & Web Terms",
    words: `
      html, css, javascript, python, variable, function,
      loop, array, string, integer, boolean, browser,
      database, syntax, compiler, debug, framework, api,
      github, repository, commit, branch, merge, hosting,
      domain, frontend, backend, bootstrap, react, json,
      algorithm, operator, conditional, element, attribute, selector,
      responsive, flexbox, viewport, localstorage, eventlistener, parameter,
      object, method
    `
  },
  {
    category: "Education & Teaching Terms",
    words: `
      curriculum, lesson, syllabus, module, assessment, rubric,
      objective, pedagogy, learner, teacher, classroom, portfolio,
      inclusive, feedback, evaluation, matatag, tesda, competency,
      cognitive, affective, psychomotor, bloom, taxonomy, formative,
      summative, diagnostic, performance, lessonplan, differentiated, instruction,
      strategy, motivation, mastery, literacy, numeracy, scaffolding,
      inclusion, deped, ched
    `
  },
  {
    category: "Philippine Presidents",
    words: `
      aguinaldo, quezon, laurel, osmena, roxas, quirino,
      magsaysay, garcia, macapagal, marcos, aquino, ramos,
      estrada, arroyo, duterte
    `
  },
  {
    category: "Filipino Drinks",
    words: `
      sago, gulaman, salabat, barako, kapengbarako, tsokolate,
      samalamig, sagogulaman, calamansijuice, melonjuice, mangoshake, pineapplejuice,
      milktea, kape, gatas, tubig, bukojuice, bukopandan,
      softdrinks, orangejuice, tsaa
    `
  },
  {
    category: "Famous Filipino Brands",
    words: `
      jollibee, manginasal, chowking, greenwich, goldilocks, redribbon,
      maxs, mercurydrug, robinsons, ayala, cebupacific, pldt,
      globe, smart, gcash, maya, bdo, bpi,
      metrobank, luckyme, piattos, chippy, nova, skyflakes,
      magnolia, purefoods, ligo, datuputi, silverswan, mangtomas,
      bearbrand, alaska, milo, kopiko, oishi, selecta,
      tapaking, bench, penshoppe
    `
  },
  {
    category: "National Symbols",
    words: `
      sampaguita, narra, mango, anahaw, bangus, carabao,
      philippineeagle, arnis, sipa, bahaykubo, lupanghinirang, baybayin,
      watawat, araw, bituin, pula, asul, puti,
      dilaw
    `
  },
  {
    category: "Sports & Athletics",
    words: `
      basketball, volleyball, badminton, billiards, boxing, arnis,
      eskrima, sipa, taekwondo, chess, swimming, athletics,
      gilas, pba, uaap, seagames, sepaktakraw, futsal,
      tennis, baseball, softball, karate, judo, wrestling,
      weightlifting, archery, cycling, gymnastics, pickleball
    `
  },
];

// Compatibility: strips the commas and line breaks, turning each block back into a
// single space-separated string, so existing code that does words.split(" ") keeps working.
WORD_BANK.forEach(c => { c.words = c.words.split(/[\s,]+/).filter(Boolean).join(" "); });