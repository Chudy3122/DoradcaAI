// src/lib/careers-data.ts - Baza danych zawodów budowlanych
export interface CareerCompetencies {
  techniczne?: number;
  fizyczne?: number;
  precyzja?: number;
  zespołowa?: number;
  kreatywność?: number;
  analityczne?: number;
  komunikacja?: number;
  przywództwo?: number;
  organizacja?: number;
  bezpieczeństwo?: number;
  matematyczne?: number;
  problemowe?: number;
  estetyka?: number;
  odwaga?: number;
  nowoczesność?: number;
  innowacyjność?: number;
  strategiczne?: number;
  biznesowe?: number;
  dokładność?: number;
  odpowiedzialność?: number;
  obserwacja?: number;
  perswazja?: number;
}

export interface Career {
  id: string;
  job: string;
  category: 'wykonawstwo' | 'instalacje' | 'projektowanie' | 'zarządzanie' | 'kontrola' | 'handel' | 'design';
  description: string;
  salary_min: number;
  salary_max: number;
  requirements: string;
  outlook: string;
  environment: string;
  location_types: string[];
  education_level: 'zawodowe' | 'średnie' | 'wyższe';
  experience_required: 'brak' | 'podstawowe' | 'średnie' | 'zaawansowane';
  holland_codes: string[];
  competencies: CareerCompetencies;
  daily_tasks: string[];
  career_path: string[];
  pros: string[];
  cons: string[];
  similar_jobs: string[];
  required_skills: string[];
  optional_skills: string[];
}

export const CONSTRUCTION_CAREERS: Record<string, Career> = {
  // ===== WYKONAWSTWO (REALISTIC) =====
  "murarz": {
    id: "murarz",
    job: "Murarz",
    category: "wykonawstwo",
    description: "Wznoszenie ścian z cegły, bloczków i innych materiałów murarskich, wykonywanie murów nośnych i działowych",
    salary_min: 5000,
    salary_max: 6670,
    requirements: "Wykształcenie zawodowe, kursy murarskie, dobra kondycja fizyczna",
    outlook: "Wysokie zapotrzebowanie, deficytowy zawód",
    environment: "Plac budowy, praca fizyczna na zewnątrz",
    location_types: ["Plac budowy", "Budynki mieszkalne", "Obiekty komercyjne"],
    education_level: "zawodowe",
    experience_required: "podstawowe",
    holland_codes: ["R"],
    competencies: { 
      techniczne: 8, 
      fizyczne: 9, 
      precyzja: 8, 
      zespołowa: 7,
      bezpieczeństwo: 8
    },
    daily_tasks: [
      "Przygotowanie zaprawy murarskiej",
      "Układanie cegieł i bloczków zgodnie z projektem",
      "Kontrola poziomów i pionów ścian",
      "Wykonywanie otworów okiennych i drzwiowych",
      "Współpraca z innymi branżami na budowie"
    ],
    career_path: [
      "Pomocnik murarza",
      "Murarz",
      "Brygadzista murarzy",
      "Kierownik robót wykończeniowych",
      "Własna firma budowlana"
    ],
    pros: [
      "Wysokie zarobki",
      "Duże zapotrzebowanie na rynku",
      "Możliwość pracy na własny rachunek",
      "Widoczne efekty pracy"
    ],
    cons: [
      "Ciężka praca fizyczna",
      "Zależność od pogody",
      "Ryzyko urazów",
      "Praca w kurzu i hałasie"
    ],
    similar_jobs: ["ciesla", "tynkarz", "zbrojarz"],
    required_skills: [
      "Czytanie planów budowlanych",
      "Obsługa narzędzi murarskich",
      "Znajomość materiałów budowlanych",
      "Techniki murowania"
    ],
    optional_skills: [
      "Prawo jazdy kat. B",
      "Podstawy betonu architektonicznego",
      "Certyfikat operatora koparko-ładowarki"
    ]
  },

  "ciesla": {
    id: "ciesla",
    job: "Cieśla",
    category: "wykonawstwo", 
    description: "Wykonywanie konstrukcji drewnianych, szalunków, więźby dachowej i elementów wykończeniowych",
    salary_min: 5500,
    salary_max: 7390,
    requirements: "Wykształcenie zawodowe, umiejętność czytania planów, znajomość obróbki drewna",
    outlook: "Bardzo wysokie zapotrzebowanie, deficytowy zawód",
    environment: "Plac budowy, warsztat, praca z drewnem",
    location_types: ["Plac budowy", "Warsztat stolarski", "Budynki drewniane"],
    education_level: "zawodowe",
    experience_required: "średnie",
    holland_codes: ["R"],
    competencies: { 
      techniczne: 9, 
      fizyczne: 8, 
      precyzja: 9, 
      kreatywność: 6,
      bezpieczeństwo: 8
    },
    daily_tasks: [
      "Przygotowanie i cięcie drewna",
      "Montaż konstrukcji więźby dachowej",
      "Wykonywanie szalunków betonowych",
      "Instalacja okien i drzwi",
      "Wykończenia drewniane wnętrz"
    ],
    career_path: [
      "Pomocnik cieśli",
      "Cieśla",
      "Mistrz cieśla",
      "Kierownik robót ciesielskich",
      "Własny zakład stolarski"
    ],
    pros: [
      "Bardzo wysokie zarobki",
      "Kreatywna praca z naturalnym materiałem",
      "Różnorodność projektów",
      "Możliwość specjalizacji (więźby, schody)"
    ],
    cons: [
      "Ryzyko urazów od narzędzi",
      "Praca na wysokości",
      "Sezonowość niektórych prac",
      "Wymagana duża precyzja"
    ],
    similar_jobs: ["murarz", "dekarz", "stolarz"],
    required_skills: [
      "Obsługa narzędzi stolarskich",
      "Znajomość gatunków drewna",
      "Techniki łączenia drewna",
      "Geometria przestrzenna"
    ],
    optional_skills: [
      "Obsługa maszyn CNC",
      "Projektowanie w CAD",
      "Certyfikat pracy na wysokości"
    ]
  },

  "dekarz": {
    id: "dekarz",
    job: "Dekarz",
    category: "wykonawstwo",
    description: "Wykonywanie pokryć dachowych, systemów rynnowych i izolacji dachów",
    salary_min: 6000,
    salary_max: 7490,
    requirements: "Wykształcenie zawodowe, brak lęku wysokości, znajomość materiałów pokrywczych",
    outlook: "Bardzo wysokie zapotrzebowanie, najlepiej płatny zawód wykonawczy",
    environment: "Dachy, praca na wysokości, różne warunki atmosferyczne",
    location_types: ["Dachy budynków", "Hale przemysłowe", "Budynki mieszkalne"],
    education_level: "zawodowe",
    experience_required: "średnie",
    holland_codes: ["R"],
    competencies: { 
      techniczne: 8, 
      fizyczne: 9, 
      odwaga: 10, 
      precyzja: 8,
      bezpieczeństwo: 9
    },
    daily_tasks: [
      "Przygotowanie podłoża dachowego",
      "Montaż pokryć dachowych (dachówka, blacha)",
      "Wykonywanie systemów rynnowych", 
      "Uszczelnianie kominów i połączeń",
      "Kontrola jakości wykonanych prac"
    ],
    career_path: [
      "Pomocnik dekarza",
      "Dekarz",
      "Brygadzista dekarzy",
      "Kierownik robót dekarskich",
      "Własna firma dekarska"
    ],
    pros: [
      "Najwyższe zarobki w wykonawstwie",
      "Bardzo duże zapotrzebowanie",
      "Praca na świeżym powietrzu",
      "Możliwość specjalizacji (dachówka, blacha)"
    ],
    cons: [
      "Bardzo wysokie ryzyko upadku",
      "Zależność od pogody",
      "Ciężka praca fizyczna",
      "Stres związany z wysokością"
    ],
    similar_jobs: ["ciesla", "blachard", "izolator"],
    required_skills: [
      "Praca na wysokości",
      "Znajomość materiałów pokrywczych",
      "Obsługa narzędzi dekarskich",
      "Systemy bezpieczeństwa"
    ],
    optional_skills: [
      "Spawanie blach",
      "Montaż systemów fotowoltaicznych",
      "Certyfikat pracy alpinistycznej"
    ]
  },

  // ===== INSTALACJE (REALISTIC + INVESTIGATIVE) =====
  "elektryk": {
    id: "elektryk",
    job: "Instalator elektryczny",
    category: "instalacje",
    description: "Projektowanie, montaż i konserwacja instalacji elektrycznych w budynkach",
    salary_min: 6000,
    salary_max: 7380,
    requirements: "Wykształcenie zawodowe, uprawnienia SEP, znajomość przepisów elektrycznych",
    outlook: "Bardzo wysokie zapotrzebowanie, deficytowy zawód",
    environment: "Budynki mieszkalne i przemysłowe, różnorodne lokalizacje",
    location_types: ["Budynki mieszkalne", "Obiekty przemysłowe", "Biura i sklepy"],
    education_level: "zawodowe",
    experience_required: "średnie",
    holland_codes: ["R", "I"],
    competencies: { 
      techniczne: 9, 
      bezpieczeństwo: 10, 
      precyzja: 9, 
      analityczne: 7,
      problemowe: 8
    },
    daily_tasks: [
      "Projektowanie tras instalacji elektrycznych",
      "Montaż przewodów i osprzętu",
      "Podłączanie urządzeń elektrycznych",
      "Pomiary i testy instalacji",
      "Diagnozowanie awarii i naprawy"
    ],
    career_path: [
      "Pomocnik elektryka",
      "Elektryk",
      "Elektryk z uprawnieniami SEP",
      "Kierownik elektryk",
      "Własne przedsiębiorstwo elektryczne"
    ],
    pros: [
      "Wysokie zarobki i stabilność",
      "Różnorodność zadań",
      "Możliwość specjalizacji",
      "Zawsze potrzebny zawód"
    ],
    cons: [
      "Ryzyko porażenia prądem",
      "Odpowiedzialność za bezpieczeństwo",
      "Konieczność ciągłego uczenia się",
      "Stresująca praca pod napięciem"
    ],
    similar_jobs: ["hydraulik", "instalator_hvac", "automatyk"],
    required_skills: [
      "Przepisy bhp elektryczne",
      "Obsługa przyrządów pomiarowych",
      "Czytanie schematów elektrycznych",
      "Znajomość norm PN-HD"
    ],
    optional_skills: [
      "Programowanie sterowników PLC",
      "Systemy inteligentnego domu",
      "Fotowoltaika i OZE"
    ]
  },

  "hydraulik": {
    id: "hydraulik", 
    job: "Hydraulik/Instalator wodno-kanalizacyjny",
    category: "instalacje",
    description: "Montaż, naprawa i konserwacja instalacji wodno-kanalizacyjnych oraz grzewczych",
    salary_min: 5800,
    salary_max: 7200,
    requirements: "Wykształcenie zawodowe, znajomość systemów instalacyjnych, umiejętność spawania",
    outlook: "Bardzo wysokie zapotrzebowanie, zawsze potrzebny zawód",
    environment: "Budynki, kotłownie, łazienki, różne warunki pracy",
    location_types: ["Mieszkania prywatne", "Budynki użyteczności publicznej", "Kotłownie"],
    education_level: "zawodowe",
    experience_required: "podstawowe",
    holland_codes: ["R", "I"],
    competencies: { 
      techniczne: 8, 
      problemowe: 8, 
      fizyczne: 7, 
      komunikacja: 6,
      precyzja: 7
    },
    daily_tasks: [
      "Diagnozowanie awarii instalacji",
      "Montaż rur i armatury",
      "Spawanie połączeń",
      "Konserwacja systemów grzewczych",
      "Doradztwo techniczno-montażowe"
    ],
    career_path: [
      "Pomocnik hydraulika",
      "Hydraulik",
      "Mistrz instalacyjny", 
      "Kierownik działu instalacji",
      "Własny zakład hydrauliczny"
    ],
    pros: [
      "Stała praca przez cały rok",
      "Duże zapotrzebowanie rynkowe",
      "Możliwość pracy na wywołanie",
      "Dobry kontakt z klientami"
    ],
    cons: [
      "Czasem brudna praca",
      "Wezwania w weekendy",
      "Stresujące sytuacje awaryjne",
      "Praca w trudnych pozycjach"
    ],
    similar_jobs: ["elektryk", "instalator_hvac", "gazownik"],
    required_skills: [
      "Spawanie rur stalowych",
      "Lutowanie miedzi",
      "Obsługa narzędzi hydraulicznych",
      "Znajomość systemów grzewczych"
    ],
    optional_skills: [
      "Systemy rekuperacji",
      "Pompy ciepła",
      "Automatyka grzewcza"
    ]
  },

  // ===== PROJEKTOWANIE (INVESTIGATIVE + ARTISTIC) =====
  "architekt": {
    id: "architekt",
    job: "Architekt",
    category: "projektowanie",
    description: "Projektowanie budynków i kompleksów architektonicznych z uwzględnieniem aspektów funkcjonalnych i estetycznych",
    salary_min: 8000,
    salary_max: 15000,
    requirements: "Wyższe wykształcenie architektoniczne, wpis do IzAA, znajomość programów CAD",
    outlook: "Stabilny popyt, konkurencyjny rynek, rosnące wymagania",
    environment: "Biuro projektowe, spotkania z klientami, wizyty na placach budowy",
    location_types: ["Biuro projektowe", "Plac budowy", "Urzędy", "Spotkania z klientami"],
    education_level: "wyższe",
    experience_required: "zaawansowane",
    holland_codes: ["I", "A"],
    competencies: { 
      kreatywność: 10, 
      techniczne: 8, 
      komunikacja: 8, 
      estetyka: 10,
      analityczne: 9
    },
    daily_tasks: [
      "Rozmowy z klientami o potrzebach",
      "Tworzenie koncepcji architektonicznych",
      "Rysowanie w programach CAD",
      "Współpraca z konstruktorami",
      "Nadzór nad realizacją projektów"
    ],
    career_path: [
      "Praktykant w biurze",
      "Architekt junior",
      "Architekt", 
      "Architekt senior/Kierownik projektów",
      "Własne biuro architektoniczne"
    ],
    pros: [
      "Kreatywna i prestiżowa praca",
      "Możliwość realizacji własnych wizji", 
      "Różnorodność projektów",
      "Potencjalnie wysokie zarobki"
    ],
    cons: [
      "Duża konkurencja na rynku",
      "Długie godziny pracy przy projektach",
      "Stres związany z terminami",
      "Odpowiedzialność prawna za projekty"
    ],
    similar_jobs: ["architekt_wnetrz", "urbanista", "projektant_instalacji"],
    required_skills: [
      "AutoCAD, ArchiCAD, Revit",
      "Znajomość przepisów budowlanych",
      "Rysowanie odręczne",
      "Historia architektury"
    ],
    optional_skills: [
      "Renderowanie 3D",
      "Certyfikaty zielonego budownictwa",
      "Projektowanie BIM"
    ]
  },

  "inzynier_konstruktor": {
    id: "inzynier_konstruktor",
    job: "Inżynier konstruktor",
    category: "projektowanie",
    description: "Projektowanie konstrukcji budowlanych, obliczenia statyczne i analiza wytrzymałościowa",
    salary_min: 7000,
    salary_max: 12000,
    requirements: "Wyższe wykształcenie budowlane, uprawnienia budowlane, znajomość programów obliczeniowych",
    outlook: "Wysokie zapotrzebowanie, wymagana specjalistyczna wiedza",
    environment: "Biuro projektowe, analiza konstrukcji, współpraca z architektami",
    location_types: ["Biuro projektowe", "Laboratorium", "Plac budowy"],
    education_level: "wyższe",
    experience_required: "zaawansowane",
    holland_codes: ["I", "A"],
    competencies: { 
      analityczne: 10, 
      matematyczne: 10, 
      techniczne: 9, 
      precyzja: 9,
      problemowe: 9
    },
    daily_tasks: [
      "Obliczenia statyczne konstrukcji",
      "Projektowanie elementów żelbetowych",
      "Analiza obciążeń budynków",
      "Współpraca z architektami",
      "Ekspertyzy techniczne budynków"
    ],
    career_path: [
      "Konstruktor junior",
      "Konstruktor",
      "Konstruktor senior",
      "Główny konstruktor",
      "Właściciel biura konstrukcyjnego"
    ],
    pros: [
      "Wysokie zarobki specjalisty",
      "Prestiżowa praca inżynierska",
      "Intelektualne wyzwania",
      "Stabilne zatrudnienie"
    ],
    cons: [
      "Duża odpowiedzialność prawna",
      "Wymagane ciągłe dokształcanie",
      "Stres związany z bezpieczeństwem",
      "Skomplikowane przepisy"
    ],
    similar_jobs: ["architekt", "projektant_instalacji", "geotechnik"],
    required_skills: [
      "Robot Structural Analysis",
      "Autodesk Structural Suite", 
      "Normy Eurokod",
      "Mechanika budowli"
    ],
    optional_skills: [
      "Projektowanie mostów",
      "Konstrukcje stalowe",
      "Analiza sejsmiczna"
    ]
  },

  // ===== ZARZĄDZANIE (ENTERPRISING + SOCIAL) =====
  "kierownik_budowy": {
    id: "kierownik_budowy",
    job: "Kierownik budowy",
    category: "zarządzanie",
    description: "Kompleksowe zarządzanie realizacją projektów budowlanych od początku do końca",
    salary_min: 8000,
    salary_max: 10308,
    requirements: "Wyższe wykształcenie budowlane, uprawnienia budowlane, doświadczenie kierownicze",
    outlook: "Bardzo wysokie zapotrzebowanie, kluczowe stanowisko w branży",
    environment: "Plac budowy, biuro, zarządzanie zespołami i podwykonawcami",
    location_types: ["Plac budowy", "Biuro", "Spotkania z inwestorami"],
    education_level: "wyższe",
    experience_required: "zaawansowane",
    holland_codes: ["E", "S"],
    competencies: { 
      przywództwo: 9, 
      komunikacja: 9, 
      organizacja: 9, 
      techniczne: 8,
      problemowe: 8
    },
    daily_tasks: [
      "Planowanie harmonogramów prac",
      "Koordynacja zespołów roboczych",
      "Kontrola jakości wykonania",
      "Negocjacje z podwykonawcami",
      "Raportowanie postępu inwestorowi"
    ],
    career_path: [
      "Asystent kierownika budowy",
      "Kierownik robót",
      "Kierownik budowy",
      "Kierownik kontraktów",
      "Dyrektor operacyjny"
    ],
    pros: [
      "Wysokie zarobki i prestiż",
      "Różnorodność wyzwań",
      "Rozwój umiejętności zarządczych",
      "Widoczne efekty pracy"
    ],
    cons: [
      "Duża odpowiedzialność i stres",
      "Długie godziny pracy",
      "Praca w weekendy",
      "Presja terminów i kosztów"
    ],
    similar_jobs: ["dyrektor_kontraktu", "kierownik_projektu", "inspektor_nadzoru"],
    required_skills: [
      "Zarządzanie projektami",
      "Znajomość procesów budowlanych",
      "Umiejętności negocjacyjne",
      "Prawo budowlane"
    ],
    optional_skills: [
      "Metodyki PMI/Prince2",
      "Lean Construction",
      "Certyfikat PMP"
    ]
  },

  // ===== KONTROLA (CONVENTIONAL + SOCIAL) =====
  "inspektor_nadzoru": {
    id: "inspektor_nadzoru",
    job: "Inspektor nadzoru budowlanego",
    category: "kontrola",
    description: "Kontrola jakości i zgodności wykonywanych robót budowlanych z projektami i normami",
    salary_min: 7000,
    salary_max: 10000,
    requirements: "Wyższe wykształcenie budowlane, uprawnienia nadzoru, znajomość norm i przepisów",
    outlook: "Stabilny popyt, wymagana niezależność i wysokie kwalifikacje",
    environment: "Plac budowy, laboratorium, biuro, kontrola i dokumentacja",
    location_types: ["Plac budowy", "Laboratorium", "Biuro"],
    education_level: "wyższe",
    experience_required: "zaawansowane",
    holland_codes: ["C", "S"],
    competencies: { 
      dokładność: 10, 
      odpowiedzialność: 9, 
      komunikacja: 8, 
      techniczne: 8,
      analityczne: 8
    },
    daily_tasks: [
      "Kontrola jakości materiałów",
      "Odbiory techniczne robót",
      "Sporządzanie protokołów",
      "Współpraca z wykonawcami",
      "Nadzór nad zgodnością z projektem"
    ],
    career_path: [
      "Asystent inspektora",
      "Inspektor nadzoru",
      "Główny inspektor",
      "Kierownik działu nadzoru",
      "Własne biuro nadzoru"
    ],
    pros: [
      "Prestiżowa i odpowiedzialna praca",
      "Stabilne zatrudnienie",
      "Możliwość pracy z różnymi projektami",
      "Uznanie w branży"
    ],
    cons: [
      "Duża odpowiedzialność prawna",
      "Czasem napięte relacje z wykonawcami",
      "Presja jakościowa",
      "Wymagana stała aktualizacja wiedzy"
    ],
    similar_jobs: ["kierownik_budowy", "rzeczoznawca", "audytor_techniczny"],
    required_skills: [
      "Normy budowlane PN-EN",
      "Procedury kontroli jakości",
      "Aparatura pomiarowa",
      "Dokumentacja techniczna"
    ],
    optional_skills: [
      "Systemy zarządzania jakością ISO",
      "Badania nieniszczące",
      "Certyfikaty laboratoryjne"
    ]
  },

  // ===== HANDEL (ENTERPRISING) =====
  "przedstawiciel_handlowy": {
    id: "przedstawiciel_handlowy",
    job: "Przedstawiciel handlowy materiałów budowlanych",
    category: "handel",
    description: "Sprzedaż materiałów i rozwiązań budowlanych dla klientów B2B i B2C",
    salary_min: 6000,
    salary_max: 12000,
    requirements: "Wykształcenie średnie/wyższe, znajomość branży budowlanej, umiejętności sprzedażowe",
    outlook: "Stabilny popyt, system wynagrodzenia prowizyjnego zwiększa potencjał zarobków",
    environment: "Biuro, hurtownie, wizyty u klientów, prezentacje produktów",
    location_types: ["Biuro sprzedaży", "Hurtownie", "Placówki klientów"],
    education_level: "średnie",
    experience_required: "podstawowe",
    holland_codes: ["E"],
    competencies: { 
      komunikacja: 9, 
      perswazja: 9, 
      biznesowe: 8, 
      techniczne: 6,
      organizacja: 7
    },
    daily_tasks: [
      "Pozyskiwanie nowych klientów",
      "Prezentacje produktów i rozwiązań",
      "Negocjowanie warunków sprzedaży",
      "Obsługa klientów kluczowych",
      "Analizowanie rynku i konkurencji"
    ],
    career_path: [
      "Konsultant handlowy",
      "Przedstawiciel handlowy",
      "Kierownik sprzedaży regionalnej",
      "Dyrektor sprzedaży",
      "Własna dystrybucja"
    ],
    pros: [
      "Potencjalnie wysokie zarobki prowizyjne",
      "Elastyczny график pracy",
      "Rozwój umiejętności biznesowych",
      "Kontakty w branży"
    ],
    cons: [
      "Niepewność dochodów",
      "Presja sprzedażowa",
      "Częste podróże",
      "Zależność od koniunktury"
    ],
    similar_jobs: ["manager_produktu", "specjalista_marketingu", "doradca_techniczny"],
    required_skills: [
      "Techniki sprzedaży",
      "Podstawy materiałoznawstwa",
      "Umiejętności prezentacyjne",
      "Obsługa systemów CRM"
    ],
    optional_skills: [
      "Znajomość języków obcych",
      "Certyfikaty producentów",
      "Marketing cyfrowy"
    ]
  },

  // ===== DESIGN (ARTISTIC) =====
  "architekt_wnetrz": {
    id: "architekt_wnetrz",
    job: "Architekt wnętrz",
    category: "design",
    description: "Projektowanie i aranżacja wnętrz mieszkalnych, biurowych i komercyjnych",
    salary_min: 5000,
    salary_max: 10000,
    requirements: "Wykształcenie architektoniczne/artystyczne, znajomość programów projektowych, zmysł estetyczny",
    outlook: "Rosnący popyt, szczególnie w segmencie premium i komercyjnym",
    environment: "Biuro projektowe, showroomy, mieszkania i obiekty klientów",
    location_types: ["Biuro projektowe", "Mieszkania klientów", "Showroomy"],
    education_level: "wyższe",
    experience_required: "średnie",
    holland_codes: ["A"],
    competencies: { 
      kreatywność: 10, 
      estetyka: 10, 
      komunikacja: 8, 
      techniczne: 6,
      organizacja: 7
    },
    daily_tasks: [
      "Konsultacje z klientami o potrzebach",
      "Tworzenie koncepcji aranżacyjnych",
      "Projektowanie w programach 3D",
      "Dobór materiałów i kolorów",
      "Nadzór nad realizacją projektów"
    ],
    career_path: [
      "Asystent projektanta",
      "Projektant wnętrz junior",
      "Architekt wnętrz",
      "Senior architekt wnętrz",
      "Własne studio projektowe"
    ],
    pros: [
      "Kreatywna i artystyczna praca",
      "Bezpośredni kontakt z klientami",
      "Różnorodność projektów",
      "Możliwość rozwijania własnego stylu"
    ],
    cons: [
      "Konkurencyjny rynek",
      "Zależność od gustów klientów",
      "Nieregularne zlecenia",
      "Konieczność ciągłego śledzenia trendów"
    ],
    similar_jobs: ["architekt", "designer_produktu", "stylistka_wnetrz"],
    required_skills: [
      "AutoCAD, SketchUp, 3ds Max",
      "Znajomość materiałów wykończeniowych",
      "Teoria kolorów",
      "Historia sztuki i designu"
    ],
    optional_skills: [
      "Renderowanie fotorealistyczne",
      "Projektowanie mebli",
      "Feng shui"
    ]
  }
};

// ===== FUNKCJE POMOCNICZE =====

export function getAllCareers(): Career[] {
  return Object.values(CONSTRUCTION_CAREERS);
}

export function getCareerById(id: string): Career | undefined {
  return CONSTRUCTION_CAREERS[id];
}

export function getCareersByCategory(category: Career['category']): Career[] {
  return getAllCareers().filter(career => career.category === category);
}

export function getCareersByEducationLevel(level: Career['education_level']): Career[] {
  return getAllCareers().filter(career => career.education_level === level);
}

export function getCareersBySalaryRange(minSalary: number, maxSalary: number): Career[] {
  return getAllCareers().filter(career => 
    career.salary_min >= minSalary && career.salary_max <= maxSalary
  );
}

export function searchCareers(query: string): Career[] {
  const searchTerm = query.toLowerCase();
  return getAllCareers().filter(career =>
    career.job.toLowerCase().includes(searchTerm) ||
    career.description.toLowerCase().includes(searchTerm) ||
    career.required_skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
    career.daily_tasks.some(task => task.toLowerCase().includes(searchTerm))
  );
}

export function getCareersByHollandCode(hollandCode: string): Career[] {
  return getAllCareers().filter(career =>
    career.holland_codes.some(code => hollandCode.includes(code))
  );
}

// Kategorie zawodów dla filtrów
export const CAREER_CATEGORIES = [
  { id: 'wykonawstwo', name: 'Wykonawstwo', icon: '🔨' },
  { id: 'instalacje', name: 'Instalacje', icon: '⚡' },
  { id: 'projektowanie', name: 'Projektowanie', icon: '📐' },
  { id: 'zarządzanie', name: 'Zarządzanie', icon: '👥' },
  { id: 'kontrola', name: 'Kontrola jakości', icon: '🔍' },
  { id: 'handel', name: 'Handel i sprzedaż', icon: '🤝' },
  { id: 'design', name: 'Design', icon: '🎨' }
] as const;

// Poziomy wykształcenia
export const EDUCATION_LEVELS = [
  { id: 'zawodowe', name: 'Zawodowe', description: 'Szkoła zawodowa lub technikum' },
  { id: 'średnie', name: 'Średnie', description: 'Liceum lub technikum' },
  { id: 'wyższe', name: 'Wyższe', description: 'Studia licencjackie lub magisterskie' }
] as const;

// Poziomy doświadczenia
export const EXPERIENCE_LEVELS = [
  { id: 'brak', name: 'Bez doświadczenia', description: 'Stanowisko dla absolwentów' },
  { id: 'podstawowe', name: 'Podstawowe', description: '1-3 lata doświadczenia' },
  { id: 'średnie', name: 'Średnie', description: '3-7 lat doświadczenia' },
  { id: 'zaawansowane', name: 'Zaawansowane', description: 'Ponad 7 lat doświadczenia' }
] as const;

// Zakresy wynagrodzeń
export const SALARY_RANGES = [
  { id: 'entry', min: 4000, max: 6000, name: '4 000 - 6 000 PLN' },
  { id: 'mid', min: 6000, max: 8000, name: '6 000 - 8 000 PLN' },
  { id: 'senior', min: 8000, max: 12000, name: '8 000 - 12 000 PLN' },
  { id: 'expert', min: 12000, max: 20000, name: '12 000+ PLN' }
] as const;

// Holland Code opisy
export const HOLLAND_CODES = {
  'R': { 
    name: 'Realistic', 
    description: 'Praktyczny, lubi pracę fizyczną i z narzędziami',
    color: '#10B981' 
  },
  'I': { 
    name: 'Investigative', 
    description: 'Analityczny, lubi badać i rozwiązywać problemy',
    color: '#3B82F6' 
  },
  'A': { 
    name: 'Artistic', 
    description: 'Kreatywny, lubi działalność artystyczną i projektową',
    color: '#8B5CF6' 
  },
  'S': { 
    name: 'Social', 
    description: 'Towarzyski, lubi pomagać i pracować z ludźmi',
    color: '#F59E0B' 
  },
  'E': { 
    name: 'Enterprising', 
    description: 'Przedsiębiorczy, lubi zarządzać i wpływać na innych',
    color: '#EF4444' 
  },
  'C': { 
    name: 'Conventional', 
    description: 'Systematyczny, lubi uporządkowaną pracę i procedury',
    color: '#6B7280' 
  }
} as const;

// Funkcja do formatowania zarobków
export function formatSalary(min: number, max: number): string {
  return `${min.toLocaleString('pl-PL')} - ${max.toLocaleString('pl-PL')} PLN`;
}

// Funkcja do obliczania średnich zarobków
export function getAverageSalary(career: Career): number {
  return Math.round((career.salary_min + career.salary_max) / 2);
}