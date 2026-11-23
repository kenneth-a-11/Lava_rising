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

  // Extra categories. script.js loads this file automatically and adds them to WORD_BANK.
  // hard: true  -> hidden on Easy difficulty
  // pack: "fil" -> Filipino pack, can be switched off in Settings
  // Extra word content for Word Lava. Load AFTER words.js and BEFORE script.js.
  //
  //  1. Merges categories that share a name (words.js and its extras both define
  //     "Philippine Provinces", "Transportation" and "Musical Instruments").
  //  2. Removes stray tokens that came from multi-word entries ("nueva ecija" became two words).
  //  3. Adds new categories.
  //       hard: true  -> hidden on Easy, drawn 3x as often on Hard
  //       pack: "fil" -> Filipino/Tagalog pack, can be switched off in Settings
  (function () {
    if (typeof WORD_BANK === "undefined" || WORD_BANK.__moreLoaded) return;
    WORD_BANK.__moreLoaded = true;

    const clean = s => s.toLowerCase().split(/[\s,]+/).map(w => w.replace(/[^a-z]/g, "")).filter(Boolean);
    const unique = list => [...new Set(list)];

    // ----- 1. merge duplicate category names -----
    const byName = new Map(), merged = [];
    WORD_BANK.forEach(c => {
      const key = c.category.trim().toLowerCase(), first = byName.get(key);
      if (!first) { byName.set(key, c); merged.push(c); return; }
      first.words = unique([...clean(first.words), ...clean(c.words)]).join(" ");
      if (!c.pack) delete first.pack;   // the merged category is only "pack" if every copy was
      if (!c.hard) delete first.hard;
    });
    WORD_BANK.length = 0;
    WORD_BANK.push(...merged);

    // ----- 2. clean up stray tokens -----
    const find = name => WORD_BANK.find(c => c.category === name);
    const remove = (name, words) => {
      const c = find(name), drop = new Set(words.split(" "));
      if (c) c.words = clean(c.words).filter(w => !drop.has(w)).join(" ");
    };
    const extend = (name, words) => {
      const c = find(name);
      if (c) c.words = unique([...clean(c.words), ...clean(words)]).join(" ");
    };
    remove("Philippine Provinces", "nueva ecija tawi");
    remove("Philippine Heroes and Places", "chocolate hills");
    extend("Philippine Heroes and Places", "chocolatehills");
    remove("Tagalog Animals", "ibis");
    remove("Tagalog Colors", "langit");

    // ----- 3. new categories -----
    const add = (category, words, flags = {}) => {
      if (find(category)) return extend(category, words);
      WORD_BANK.push({ category, words: unique(clean(words)).join(" "), ...flags });
    };

    // standard (available on every difficulty)
    add("Farm Animals", `
      cow, pig, sheep, goat, horse, chicken,
      duck, goose, turkey, rooster, hen, donkey,
      carabao, lamb, calf, piglet, bull, ox,
      rabbit, pony, mule, llama, foal, kid,
      ram, ewe
    `);

    add("Insects & Creepy Crawlies", `
      ant, bee, wasp, fly, mosquito, beetle,
      butterfly, moth, dragonfly, grasshopper, cricket, cockroach,
      ladybug, firefly, caterpillar, termite, cicada, mantis,
      flea, tick, spider, centipede, locust, hornet,
      aphid, weevil, gnat, scorpion
    `);

    add("Colors", `
      red, blue, green, yellow, orange, purple,
      pink, brown, black, white, gray, grey,
      violet, indigo, cyan, magenta, maroon, crimson,
      scarlet, turquoise, teal, beige, gold, silver,
      navy, lavender, lime, olive, coral, peach
    `);

    add("Shapes", `
      circle, square, triangle, rectangle, oval, diamond,
      star, heart, hexagon, pentagon, octagon, cube,
      sphere, cone, cylinder, pyramid, crescent, rhombus,
      trapezoid, prism, arc, spiral
    `);

    add("Clothes", `
      shirt, pants, shorts, skirt, dress, jacket,
      coat, sweater, hoodie, socks, shoes, boots,
      sandals, slippers, hat, cap, scarf, gloves,
      belt, tie, vest, jeans, blouse, uniform,
      pajamas, raincoat, underwear, sneakers, mittens
    `);

    add("Vegetables", `
      carrot, potato, tomato, onion, garlic, cabbage,
      lettuce, spinach, broccoli, cucumber, eggplant, pepper,
      pumpkin, radish, celery, corn, peas, beans,
      squash, okra, cauliflower, ginger, turnip, beet,
      kale, mushroom
    `);

    add("Furniture", `
      chair, table, sofa, couch, bed, desk,
      shelf, cabinet, drawer, wardrobe, stool, bench,
      dresser, mirror, lamp, bookcase, ottoman, cradle,
      hammock, futon, recliner, nightstand
    `);

    add("Tools", `
      hammer, saw, drill, wrench, pliers, screwdriver,
      chisel, axe, shovel, rake, hoe, ladder,
      level, plane, file, clamp, mallet, crowbar,
      sander, trowel, spade, pickaxe, wheelbarrow
    `);

    add("Birds", `
      eagle, sparrow, parrot, owl, hawk, crow,
      robin, pigeon, duck, swan, goose, penguin,
      ostrich, flamingo, peacock, pelican, falcon, heron,
      stork, crane, seagull, woodpecker, hummingbird, kingfisher,
      cockatoo, canary, vulture
    `);

    add("Rooms & Parts of a House", `
      kitchen, bedroom, bathroom, garage, attic, basement,
      hallway, balcony, porch, garden, nursery, pantry,
      laundry, closet, terrace, patio, rooftop, stairs,
      ceiling, floor
    `);

    add("Fruits", `
      apple, banana, orange, grape, lemon, lime,
      peach, pear, plum, cherry, berry, melon,
      mango, papaya, kiwi, fig, date, apricot,
      coconut, pineapple, watermelon, strawberry, blueberry, raspberry,
      pomegranate, guava
    `);

    add("At the Beach", `
      sand, shell, wave, tide, coral, sunset,
      towel, umbrella, sandcastle, surfboard, seaweed, lighthouse,
      dune, pier, island, harbor, lagoon, snorkel,
      anchor, sunscreen, seagull
    `);

    add("Desserts & Sweets", `
      cake, pie, cookie, brownie, donut, candy,
      chocolate, pudding, icecream, cupcake, muffin, waffle,
      pancake, sundae, custard, fudge, caramel, tart,
      macaron, gelato, popsicle, cheesecake
    `);

    // hard tier (hidden on Easy, drawn more often on Hard)
    add("World Capitals", `
      paris, london, madrid, rome, berlin, lisbon,
      dublin, oslo, stockholm, helsinki, copenhagen, warsaw,
      vienna, brussels, athens, budapest, bucharest, sofia,
      zagreb, belgrade, kyiv, reykjavik, bern, amsterdam,
      prague, tokyo, seoul, beijing, bangkok, hanoi,
      jakarta, manila, canberra, ottawa, cairo, nairobi,
      lima, bogota, delhi, moscow, ankara, tehran,
      baghdad, riyadh
    `, { hard: true });

    add("Planets & Space", `
      mercury, venus, earth, mars, jupiter, saturn,
      uranus, neptune, pluto, moon, sun, comet,
      asteroid, meteor, galaxy, nebula, quasar, orbit,
      eclipse, supernova, telescope, satellite, cosmos, constellation,
      pulsar, blackhole
    `, { hard: true });

    add("Gems & Minerals", `
      diamond, ruby, emerald, sapphire, opal, topaz,
      amethyst, garnet, jade, pearl, quartz, onyx,
      turquoise, agate, beryl, zircon, peridot, citrine,
      jasper, obsidian, malachite, granite, marble, graphite
    `, { hard: true });

    add("Currencies", `
      peso, dollar, euro, yen, yuan, won,
      rupee, ringgit, baht, dong, pound, franc,
      krone, rand, real, ruble, dinar, riyal,
      shekel, lira, dirham, zloty, forint, kyat
    `, { hard: true });

    add("Dinosaurs & Prehistoric Animals", `
      tyrannosaurus, triceratops, stegosaurus, velociraptor, brachiosaurus, diplodocus,
      ankylosaurus, spinosaurus, allosaurus, pterodactyl, mammoth, mastodon,
      megalodon, iguanodon, apatosaurus, parasaurolophus, brontosaurus, dilophosaurus,
      smilodon
    `, { hard: true });

    add("Famous Painters", `
      picasso, monet, vangogh, davinci, michelangelo, rembrandt,
      dali, matisse, warhol, manet, cezanne, rubens,
      vermeer, goya, klimt, kahlo, pollock, renoir,
      degas, munch, raphael, botticelli, amorsolo, luna,
      hidalgo, magritte, turner, gauguin
    `, { hard: true });

    add("Organs & Body Systems", `
      heart, lung, liver, kidney, stomach, brain,
      intestine, pancreas, spleen, bladder, esophagus, skeleton,
      muscle, artery, vein, nerve, skin, gallbladder,
      thyroid, appendix, trachea, diaphragm
    `, { hard: true });

    add("Math Words", `
      addition, subtraction, multiplication, division, fraction, decimal,
      percent, integer, prime, factor, multiple, algebra,
      geometry, equation, variable, angle, triangle, radius,
      diameter, circumference, perimeter, area, volume, ratio,
      average, median, mean, mode, exponent
    `, { hard: true });

    add("Languages of the World", `
      english, spanish, french, german, italian, portuguese,
      russian, chinese, japanese, korean, arabic, hindi,
      turkish, dutch, greek, swahili, vietnamese, thai,
      tagalog, hebrew, polish, swedish, norwegian
    `, { hard: true });

    add("Famous Landmarks", `
      eiffel, eiffeltower, colosseum, pyramids, stonehenge, acropolis,
      louvre, bigben, tajmahal, greatwall, statueofliberty, goldengate,
      machupicchu, petra, angkorwat, sagradafamilia, burjkhalifa, empirestate,
      kremlin, alhambra, leaningtower
    `, { hard: true });

    // Filipino / Tagalog pack
    add("Tagalog Body Parts", `
      ulo, buhok, mukha, mata, ilong, bibig,
      dila, ngipin, tainga, leeg, balikat, braso,
      siko, kamay, daliri, dibdib, tiyan, likod,
      baywang, hita, tuhod, binti, paa, sakong,
      utak, puso, baga, atay, noo, kilay,
      pilikmata, pisngi, baba, kuko
    `, { pack: "fil" });

    add("Gulay (Tagalog Vegetables)", `
      kangkong, talong, ampalaya, sitaw, kalabasa, upo,
      sayote, labanos, petsay, pechay, repolyo, sibuyas,
      bawang, luya, kamatis, patatas, karot, okra,
      mustasa, malunggay, togue, singkamas, gabi, kamote,
      mais
    `, { pack: "fil" });

    add("Tagalog Nature & Weather", `
      ulan, hangin, araw, buwan, bituin, bundok,
      dagat, ilog, bagyo, ulap, kidlat, kulog,
      baha, init, lamig, lupa, puno, bulaklak,
      damo, buhangin, alon, langit, apoy, tubig,
      bato
    `, { pack: "fil" });

    add("Tagalog Days & Months", `
      lunes, martes, miyerkules, huwebes, biyernes, sabado,
      linggo, enero, pebrero, marso, abril, mayo,
      hunyo, hulyo, agosto, setyembre, oktubre, nobyembre,
      disyembre
    `, { pack: "fil" });

    add("Tagalog Household", `
      bahay, pinto, bintana, mesa, upuan, kama,
      unan, kumot, tasa, plato, kutsara, tinidor,
      kutsilyo, walis, timba, tabo, sahig, kisame,
      bubong, hagdan, kusina, banyo, silid, sala
    `, { pack: "fil" });

    add("Tagalog Polite Words", `
      salamat, po, opo, hindi, pasensya, paumanhin,
      kumusta, paalam, mabuhay, pakiusap, tabi, magandangumaga,
      magandanghapon, magandanggabi, magandangaraw, walanganuman
    `, { pack: "fil" });

    add("Tagalog Verbs", `
      kain, inom, takbo, lakad, tulog, gising,
      upo, tayo, sulat, basa, tawa, iyak,
      sayaw, kanta, luto, linis, ligo, laro,
      bili, benta, punta, uwi, tingin, dinig,
      sigaw, bulong, tulong, hanap
    `, { pack: "fil", hard: true });

    add("Tagalog Adjectives", `
      maganda, pangit, malaki, maliit, mataas, mababa,
      mabilis, mabagal, mainit, malamig, matamis, maasim,
      maalat, mapait, masaya, malungkot, galit, takot,
      matapang, mabait, masipag, tamad, mahal, mura,
      bago, luma, malinis, marumi
    `, { pack: "fil", hard: true });

    add("Philippine Regions", `
      ilocos, cagayanvalley, centralluzon, calabarzon, mimaropa, bicol,
      westernvisayas, centralvisayas, easternvisayas, zamboangapeninsula, northernmindanao, davao,
      soccsksargen, caraga, barmm, car, ncr
    `, { pack: "fil", hard: true });

    // ===== MODERN / TRENDING (added Nov 2026) =====

    // Filipino pack, hard tier: local streetwear
    add("Filipino Streetwear Brands", `
      highminds, hghmnds, teammanila, theclothing, skoop, skoopkommunity,
      dbtk, dontblamethekids, supportyourfriends, syf, originmanila, hsobrand,
      younggod, fivers, mnla, enimal, deadways, royalty,
      nobody, progress, vendetta, quasi, kltrd, aogiri,
      wsh, witnesssurrealhypnosis, hysteria, enternostalgia, illest, lifedesign,
      mondaysuck, staffco, thetwelfthhouse, tropicalfutures, factoryforhire
    `, { pack: "fil", hard: true });

    // standard tier
    add("Clothing & Sneaker Brands", `
      nike, adidas, puma, newbalance, converse, vans,
      crocs, uniqlo, zara, hm, shein, cottonon,
      levis, gap, fila, reebok, asics, skechers,
      underarmour, champion, carhartt, supreme, stussy, bape,
      patagonia, northface, lululemon, gymshark, hoka, salomon,
      bench, penshoppe, bayo, human, oxygen, kamiseta,
      rustylopez
    `);

    add("Sneaker Models", `
      airjordan, airforce, dunk, yeezy, samba, gazelle,
      campus, superstar, stansmith, chuck, oldskool, clog,
      ultraboost, airmax, pegasus, vomero, cortez, blazer,
      killshot, cloudmonster, gelkayano, clifton, bondi, speedcat
    `);

    add("Fashion Trends & Terms", `
      streetwear, athleisure, oversized, baggy, cargo, techwear,
      gorpcore, normcore, quietluxury, thrift, thrifting, ukayukay,
      vintage, upcycle, ootd, drip, fit, glowup,
      capsule, dropshipping, minimalist, bucketHat, beanie, crop,
      jorts, tote
    `);

    add("Social Media & Apps", `
      tiktok, instagram, facebook, youtube, threads, bluesky,
      twitter, snapchat, pinterest, discord, twitch, reddit,
      telegram, viber, messenger, whatsapp, spotify, netflix,
      capcut, canva, reels, shorts, stories, livestream,
      hashtag, influencer, vlogger, vlog, podcast, meme,
      emoji, filter, algorithm, viral, trending
    `);

    add("Popular Video Games", `
      mobilelegends, valorant, roblox, genshinimpact, minecraft, fortnite,
      callofduty, freefire, dota, wildrift, pubg, apex,
      overwatch, amongus, clashofclans, pokemon, pokemongo, zenless,
      wutheringwaves, honkai, stardew, terraria, eldenring, helldivers,
      fifa
    `);

    add("Gamer Words", `
      gg, noob, clutch, tank, support, jungle,
      carry, gank, ult, buff, nerf, lag,
      ping, afk, rank, mythic, legend, epic,
      grandmaster, diamond, platinum, bot, smurf, meta,
      cracked, cooked, sweaty, tryhard, speedrun, lobby,
      squad
    `);

    add("Gadgets & Devices", `
      iphone, android, airpods, smartwatch, earbuds, powerbank,
      tablet, ipad, macbook, chromebook, kindle, drone,
      gopro, playstation, xbox, steamdeck, gamingchair, headset,
      ringlight, tripod, gimbal, microphone, smartphone, charger,
      magsafe, hotspot, router
    `);

    add("Gen Z & Internet Slang", `
      rizz, delulu, aura, sus, slay, goat,
      nocap, cap, bet, vibe, vibes, npc,
      cracked, cooked, fomo, yolo, ghosting, stan,
      lit, mid, salty, flex, drip, situationship,
      bffr, skibidi, gyatt, sigma, mewing, brainrot,
      clockit, sixseven, bussin, yapping
    `);

    add("Filipino Slang & Expressions", `
      sanaall, sanaol, slr, chz, gagi, grabe,
      yown, awit, werpa, beshie, hala, kaloka,
      keri, lowkey
    `);

    add("Trending Food & Drinks", `
      matcha, boba, milktea, dubaichocolate, tanghulu, croffle,
      bingsu, mochi, samgyupsal, tteokbokki, kimbap, ramyeon,
      shawarma, smashburger, dirtysoda, cheesetea, pistachio, hojicha,
      ubelatte
    `);

    add("Coffee & Milk Tea Chains", `
      starbucks, coffeebean, dunkin, krispykreme, tigersugar, gongcha,
      chatime, serenitea, macaoimperial, bos, figaro, tomntoms,
      ucc
    `);

    add("Collectibles & Toys", `
      labubu, popmart, sonnyangel, jellycat, stanley, funko,
      lego, hellokitty, sanrio, cinnamoroll, kuromi, pochacco,
      chiikawa, squishmallow, tamagotchi, skullpanda, crybaby, pokemoncards
    `);

    add("Streaming & Entertainment", `
      netflix, youtube, disneyplus, primevideo, viu, iwanttfc,
      kumu, spotify, applemusic, twitch, kdrama, anime,
      manga, webtoon, kpop, ppop, opm, podcast
    `);

    add("Transportation", `
      ebike, escooter, ev, moveit, joyride, grab,
      angkas, lalamove, carpool, rideshare, hybrid
    `);

    // Filipino pack
    add("Philippine Apps & Online Shops", `
      gcash, maya, gotyme, shopee, lazada, grab,
      foodpanda, angkas, moveit, joyride, lalamove, zalora,
      carousell, tiktokshop, kumu
    `, { pack: "fil" });

    // hard tier
    add("OPM & P-Pop Artists", `
      bini, benandben, moiradelatorre, arthurnery, cupofjoe, zacktabudlo,
      adie, tjmonterde, juankarlos, dionela, maki, hevabi,
      jroa, skustaclee, flowg, loonie, omarbaliw, shantidope,
      gloc, sarahgeronimo, regine, morissette, kztandingan, yeng
    `, { pack: "fil", hard: true });

    add("AI Tools & Terms", `
      chatgpt, claude, gemini, copilot, perplexity, grok,
      deepseek, midjourney, sora, suno, canva, notion,
      figma, cursor, openai, anthropic, nvidia, chatbot,
      prompt, agent, token, model, hallucination
    `, { hard: true });

    add("Money & Fintech", `
      gcash, maya, gotyme, bitcoin, ethereum, crypto,
      blockchain, wallet, stablecoin, binance, coinsph, paypal,
      wise, qrph, remittance, fintech
    `, { hard: true });
  })();

  // Compatibility: strips the commas and line breaks, turning each block back into a
  // single space-separated string, so existing code that does words.split(" ") keeps working.
  WORD_BANK.forEach(c => { c.words = c.words.split(/[\s,]+/).filter(Boolean).join(" "); });