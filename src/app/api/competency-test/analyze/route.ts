// src/app/api/competency-test/analyze/route.ts - KOMPLETNY Z NOWYM MODELEM
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

interface AnalyzeRequestBody {
  testId: string;
}

interface CareerRecommendation {
  job: string;
  match: number;
  description: string;
  salary_min: number;
  salary_max: number;
  requirements: string;
  outlook: string;
  environment: string;
  holland_codes: string[];
}

interface AnalysisResult {
  personalityType: string;
  careerProfile: string;
  hollandCode: string;
  recommendedCareers: CareerRecommendation[];
  competencyScores: Record<string, number>;
  workValues: Record<string, number>;
  preferredEnvironment: Record<string, number>;
  developmentAreas: string[];
  recommendedTraining: string[];
  confidenceScore: number;
}

// Baza danych zawodów budowlanych z aktualnymi danymi
const CONSTRUCTION_CAREERS = {
  // REALISTIC (R) - Wykonawstwo
  "murarz": {
    job: "Murarz",
    description: "Wznoszenie ścian z cegły, bloczków i innych materiałów murarskich",
    salary_min: 5000,
    salary_max: 6670,
    requirements: "Wykształcenie zawodowe, kursy murarskie, dobra kondycja fizyczna",
    outlook: "Wysokie zapotrzebowanie, deficytowy zawód",
    environment: "Plac budowy, praca fizyczna na zewnątrz",
    holland_codes: ["R"],
    competencies: { techniczne: 8, fizyczne: 9, precyzja: 8, zespołowa: 7 }
  },
  "ciesla": {
    job: "Cieśla",
    description: "Wykonywanie konstrukcji drewnianych, szalunków i elementów wykończeniowych",
    salary_min: 5500,
    salary_max: 7390,
    requirements: "Wykształcenie zawodowe, umiejętność czytania planów, znajomość drewna",
    outlook: "Bardzo wysokie zapotrzebowanie, deficytowy zawód",
    environment: "Plac budowy, warsztat, praca z drewnem",
    holland_codes: ["R"],
    competencies: { techniczne: 9, fizyczne: 8, precyzja: 9, kreatywność: 6 }
  },
  "dekarz": {
    job: "Dekarz",
    description: "Wykonywanie pokryć dachowych, rynien i systemów odwadniających",
    salary_min: 6000,
    salary_max: 7490,
    requirements: "Wykształcenie zawodowe, brak lęku wysokości, znajomość materiałów",
    outlook: "Bardzo wysokie zapotrzebowanie, najlepiej płatny zawód wykonawczy",
    environment: "Dachy, praca na wysokości, warunki atmosferyczne",
    holland_codes: ["R"],
    competencies: { techniczne: 8, fizyczne: 9, odwaga: 10, precyzja: 8 }
  },
  "zbrojarz": {
    job: "Zbrojarz",
    description: "Wykonywanie zbrojenia żelbetowego według dokumentacji technicznej",
    salary_min: 5200,
    salary_max: 6810,
    requirements: "Wykształcenie zawodowe, umiejętność czytania planów zbrojeniowych",
    outlook: "Wysokie zapotrzebowanie, specjalistyczny zawód",
    environment: "Plac budowy, praca z metalem, konstrukcje żelbetowe",
    holland_codes: ["R"],
    competencies: { techniczne: 8, fizyczne: 9, precyzja: 9, matematyczne: 6 }
  },
  "tynkarz": {
    job: "Tynkarz",
    description: "Wykonywanie tynków wewnętrznych i zewnętrznych, wyrównywanie powierzchni",
    salary_min: 5500,
    salary_max: 7160,
    requirements: "Wykształcenie zawodowe, znajomość mieszanek, precyzja wykonania",
    outlook: "Bardzo wysokie zapotrzebowanie, deficytowy zawód",
    environment: "Wnętrza budynków, fasady, praca wykończeniowa",
    holland_codes: ["R"],
    competencies: { techniczne: 7, fizyczne: 8, precyzja: 9, estetyka: 7 }
  },

  // REALISTIC + INVESTIGATIVE (RI) - Instalacje
  "elektryk": {
    job: "Instalator elektryczny",
    description: "Montaż i konserwacja instalacji elektrycznych w budynkach",
    salary_min: 6000,
    salary_max: 7380,
    requirements: "Wykształcenie zawodowe, uprawnienia SEP, znajomość przepisów",
    outlook: "Bardzo wysokie zapotrzebowanie, deficytowy zawód",
    environment: "Budynki mieszkalne i przemysłowe, różnorodne lokalizacje",
    holland_codes: ["R", "I"],
    competencies: { techniczne: 9, bezpieczeństwo: 10, precyzja: 9, analityczne: 7 }
  },
  "hydraulik": {
    job: "Hydraulik/Instalator wodno-kanalizacyjny",
    description: "Montaż i naprawa instalacji wodno-kanalizacyjnych, grzewczych",
    salary_min: 5800,
    salary_max: 7200,
    requirements: "Wykształcenie zawodowe, znajomość systemów instalacyjnych",
    outlook: "Bardzo wysokie zapotrzebowanie, zawsze potrzebny",
    environment: "Budynki, kotłownie, łazienki, różne warunki pracy",
    holland_codes: ["R", "I"],
    competencies: { techniczne: 8, problemowe: 8, fizyczne: 7, komunikacja: 6 }
  },
  "instalator_hvac": {
    job: "Instalator wentylacji i klimatyzacji",
    description: "Montaż systemów wentylacyjnych, klimatyzacyjnych i rekuperacyjnych",
    salary_min: 6500,
    salary_max: 8000,
    requirements: "Wykształcenie techniczne, kursy specjalistyczne, znajomość systemów HVAC",
    outlook: "Rosnące zapotrzebowanie, nowoczesne technologie",
    environment: "Budynki komercyjne, mieszkalne, systemy wentylacyjne",
    holland_codes: ["R", "I"],
    competencies: { techniczne: 9, analityczne: 7, precyzja: 8, nowoczesność: 8 }
  },

  // INVESTIGATIVE + ARTISTIC (IA) - Projektowanie
  "architekt": {
    job: "Architekt",
    description: "Projektowanie budynków i kompleksów architektonicznych",
    salary_min: 8000,
    salary_max: 15000,
    requirements: "Wyższe wykształcenie architektoniczne, wpis do IzAA, umiejętności CAD",
    outlook: "Stabilny popyt, konkurencyjny rynek",
    environment: "Biuro projektowe, spotkania z klientami, plac budowy",
    holland_codes: ["I", "A"],
    competencies: { kreatywność: 10, techniczne: 8, komunikacja: 8, estetyka: 10 }
  },
  "inzynier_konstruktor": {
    job: "Inżynier konstruktor",
    description: "Projektowanie konstrukcji budowlanych, obliczenia statyczne",
    salary_min: 7000,
    salary_max: 12000,
    requirements: "Wyższe wykształcenie budowlane, uprawnienia budowlane, znajomość programów",
    outlook: "Wysokie zapotrzebowanie, specjalistyczna wiedza",
    environment: "Biuro projektowe, analiza konstrukcji, współpraca z architektami",
    holland_codes: ["I", "A"],
    competencies: { analityczne: 10, matematyczne: 10, techniczne: 9, precyzja: 9 }
  },
  "projektant_instalacji": {
    job: "Projektant instalacji",
    description: "Projektowanie instalacji elektrycznych, sanitarnych, HVAC",
    salary_min: 6500,
    salary_max: 10000,
    requirements: "Wyższe wykształcenie techniczne, uprawnienia, znajomość norm",
    outlook: "Wysokie zapotrzebowanie, specjalizacja w instalacjach",
    environment: "Biuro projektowe, współpraca z architektami i wykonawcami",
    holland_codes: ["I", "A"],
    competencies: { techniczne: 9, analityczne: 9, precyzja: 8, innowacyjność: 7 }
  },

  // ENTERPRISING + SOCIAL (ES) - Zarządzanie
  "kierownik_budowy": {
    job: "Kierownik budowy",
    description: "Nadzorowanie realizacji projektów budowlanych, zarządzanie zespołem",
    salary_min: 8000,
    salary_max: 10308,
    requirements: "Wyższe wykształcenie budowlane, uprawnienia budowlane, doświadczenie",
    outlook: "Bardzo wysokie zapotrzebowanie, kluczowe stanowisko",
    environment: "Plac budowy, biuro, zarządzanie zespołami",
    holland_codes: ["E", "S"],
    competencies: { przywództwo: 9, komunikacja: 9, organizacja: 9, techniczne: 8 }
  },
  "dyrektor_kontraktu": {
    job: "Dyrektor kontraktu",
    description: "Zarządzanie dużymi projektami budowlanymi, odpowiedzialność za całość realizacji",
    salary_min: 26000,
    salary_max: 40000,
    requirements: "Wyższe wykształcenie, uprawnienia, wieloletnie doświadczenie kierownicze",
    outlook: "Ograniczona liczba stanowisk, bardzo wysokie wynagrodzenia",
    environment: "Biuro, duże inwestycje, zarządzanie strategiczne",
    holland_codes: ["E", "S"],
    competencies: { przywództwo: 10, strategiczne: 10, komunikacja: 9, biznesowe: 9 }
  },
  "kosztorysant": {
    job: "Kosztorysant budowlany",
    description: "Przygotowywanie kosztorysów, kalkulacja kosztów projektów budowlanych",
    salary_min: 6000,
    salary_max: 9000,
    requirements: "Wykształcenie budowlane, znajomość programów kosztorysowych, doświadczenie",
    outlook: "Stabilny popyt, wymagana specjalistyczna wiedza",
    environment: "Biuro, praca z dokumentacją i programami kosztorysowymi",
    holland_codes: ["E", "C"],
    competencies: { analityczne: 9, matematyczne: 9, dokładność: 10, biznesowe: 7 }
  },

  // CONVENTIONAL + SOCIAL (CS) - Kontrola
  "inspektor_nadzoru": {
    job: "Inspektor nadzoru budowlanego",
    description: "Kontrola jakości wykonywanych robót, odbiory techniczne",
    salary_min: 7000,
    salary_max: 10000,
    requirements: "Wyższe wykształcenie budowlane, uprawnienia, znajomość norm",
    outlook: "Stabilny popyt, wymagana niezależność i obiektywizm",
    environment: "Plac budowy, biuro, kontrola i dokumentacja",
    holland_codes: ["C", "S"],
    competencies: { dokładność: 10, odpowiedzialność: 9, komunikacja: 8, techniczne: 8 }
  },
  "specjalista_bhp": {
    job: "Specjalista BHP na budowie",
    description: "Nadzór nad bezpieczeństwem i higieną pracy na budowie",
    salary_min: 5500,
    salary_max: 8000,
    requirements: "Wykształcenie wyższe/średnie, kursy BHP, znajomość przepisów",
    outlook: "Wysokie zapotrzebowanie, obowiązkowe na budowach",
    environment: "Plac budowy, biuro, szkolenia pracowników",
    holland_codes: ["C", "S"],
    competencies: { odpowiedzialność: 10, komunikacja: 8, organizacja: 8, obserwacja: 9 }
  },

  // ENTERPRISING (E) - Handel i sprzedaż
  "przedstawiciel_handlowy": {
    job: "Przedstawiciel handlowy materiałów budowlanych",
    description: "Sprzedaż materiałów budowlanych, obsługa klientów B2B",
    salary_min: 6000,
    salary_max: 12000,
    requirements: "Wykształcenie średnie/wyższe, znajomość branży, umiejętności sprzedażowe",
    outlook: "Stabilny popyt, prowizyjny system wynahrodzeń",
    environment: "Biuro, hurtownie, wizyty u klientów, targowanie",
    holland_codes: ["E"],
    competencies: { komunikacja: 9, perswazja: 9, biznesowe: 8, techniczne: 6 }
  },

  // ARTISTIC (A) - Design i projektowanie
  "architekt_wnetrz": {
    job: "Architekt wnętrz",
    description: "Projektowanie i aranżacja wnętrz mieszkalnych i komercyjnych",
    salary_min: 5000,
    salary_max: 10000,
    requirements: "Wykształcenie architektoniczne/artystyczne, znajomość programów CAD",
    outlook: "Rosnący popyt, szczególnie w segmencie premium",
    environment: "Biuro projektowe, showroomy, mieszkania klientów",
    holland_codes: ["A"],
    competencies: { kreatywność: 10, estetyka: 10, komunikacja: 8, techniczne: 6 }
  }
};

export async function POST(request: NextRequest) {
  console.log('🧠 === ANALYZE endpoint wywołany (NOWY MODEL) ===');
  
  try {
    console.log('🔐 Sprawdzam sesję...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Brak autoryzacji');
      return NextResponse.json({ 
        error: 'Brak autoryzacji'
      }, { status: 401 });
    }

    const userEmail = session.user.email;
    console.log('📧 User email z sesji:', userEmail);

    // Znajdź użytkownika po email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      console.log('❌ Użytkownik nie znaleziony w bazie');
      return NextResponse.json({ 
        error: 'Użytkownik nie znaleziony'
      }, { status: 404 });
    }

    const userId = user.id;
    const body: AnalyzeRequestBody = await request.json();
    const { testId } = body;

    console.log('🧪 Test ID:', testId);
    console.log('👤 User ID:', userId);

    if (!testId) {
      return NextResponse.json({ 
        error: 'Brakuje testId' 
      }, { status: 400 });
    }

    // Pobierz test i odpowiedzi
    console.log('🔍 Szukam testu...');
    const test = await prisma.competencyTest.findFirst({
      where: {
        id: testId,
        userId: userId,
        completionStatus: 'COMPLETED'
      },
      include: {
        answers: true
      }
    });

    if (!test) {
      console.log('❌ Test nie znaleziony lub niekompletny');
      return NextResponse.json({ 
        error: 'Test nie znaleziony lub nie został ukończony',
        debug: {
          testId: testId,
          userId: userId
        }
      }, { status: 404 });
    }

    console.log(`✅ Test znaleziony z ${test.answers.length} odpowiedziami`);

    // Pobierz pytania dla kontekstu
    console.log('🔍 Pobieram pytania...');
    const questions = await prisma.testQuestion.findMany({
      where: {
        id: { in: test.answers.map(a => a.questionId) }
      }
    });

    const questionsMap = questions.reduce((acc, q) => {
      acc[q.id] = q;
      return acc;
    }, {} as Record<string, any>);

    console.log(`🧠 Rozpoczynam analizę dla ${test.answers.length} odpowiedzi`);

    // ANALIZA ODPOWIEDZI
    const analysisResult = performAdvancedAnalysis(test.answers, questionsMap);

    console.log('🔍 Sprawdzam czy użytkownik ma już profil...');

    // Sprawdź czy użytkownik ma już profil (nowy model - jeden profil na użytkownika)
    const existingProfile = await prisma.userCareerProfile.findUnique({
      where: { userId: userId }
    });

    let profile;
    let isNew = false;
    let operation = '';

    if (existingProfile) {
      console.log('🔄 Użytkownik ma już profil - AKTUALIZUJĘ z nowym testem');
      operation = 'UPDATE';
      
      // Przygotuj historię testów (nowa funkcjonalność)
      const currentHistory = Array.isArray(existingProfile.testHistory) 
        ? existingProfile.testHistory as string[]
        : [];
      
      const newHistory = [...currentHistory];
      
      // Dodaj poprzedni test do historii (jeśli istniał)
      if (existingProfile.lastTestId && !newHistory.includes(existingProfile.lastTestId)) {
        newHistory.push(existingProfile.lastTestId);
        // Zachowaj tylko ostatnie 5 testów w historii
        if (newHistory.length > 5) {
          newHistory.shift();
        }
      }

      // AKTUALIZUJ istniejący profil z nowym testem
      profile = await prisma.userCareerProfile.update({
        where: { userId: userId },
        data: {
          lastTestId: testId, // Nowy aktualny test
          hollandCode: analysisResult.hollandCode,
          personalityType: analysisResult.personalityType,
          competencyScores: analysisResult.competencyScores as any,
          workValues: analysisResult.workValues as any,
          preferredEnvironment: analysisResult.preferredEnvironment as any,
          careerSuggestions: analysisResult.recommendedCareers as any,
          developmentAreas: analysisResult.developmentAreas as any,
          aiAnalysis: JSON.stringify(analysisResult),
          confidenceScore: analysisResult.confidenceScore,
          testHistory: newHistory as any, // Historia poprzednich testów
          lastUpdated: new Date(),
          profileGeneratedAt: new Date() // Nowa data generacji
        }
      });

      console.log(`✅ ZAKTUALIZOWANO profil użytkownika (ID: ${profile.id})`);
      
    } else {
      console.log('✨ Użytkownik nie ma profilu - tworzę NOWY profil');
      operation = 'CREATE';
      isNew = true;

      // Utwórz nowy profil
      profile = await prisma.userCareerProfile.create({
        data: {
          userId: userId,
          lastTestId: testId,
          hollandCode: analysisResult.hollandCode,
          personalityType: analysisResult.personalityType,
          competencyScores: analysisResult.competencyScores as any,
          workValues: analysisResult.workValues as any,
          preferredEnvironment: analysisResult.preferredEnvironment as any,
          careerSuggestions: analysisResult.recommendedCareers as any,
          developmentAreas: analysisResult.developmentAreas as any,
          aiAnalysis: JSON.stringify(analysisResult),
          confidenceScore: analysisResult.confidenceScore,
          testHistory: [] as any // Pusta historia dla nowego profilu
        }
      });

      console.log(`✅ UTWORZONO nowy profil użytkownika (ID: ${profile.id})`);
    }

    // Oznacz test jako przeanalizowany
    await prisma.competencyTest.update({
      where: { id: testId },
      data: { 
        completionStatus: 'ANALYZED',
        completedAt: new Date()
      }
    });

    console.log(`✅ Test ${testId} oznaczony jako przeanalizowany`);

    // Przygotuj wiadomość dla użytkownika
    const message = isNew 
      ? 'Twój pierwszy profil zawodowy został utworzony! 🎉' 
      : 'Twój profil zawodowy został zaktualizowany na podstawie najnowszego testu! 🔄';

    console.log(`✅ Analiza zakończona pomyślnie (${operation})`);

    return NextResponse.json({
      success: true,
      message: message,
      profile: analysisResult,
      profileId: profile.id,
      isNew: isNew,
      operation: operation,
      debug: {
        userId: userId,
        testId: testId,
        answersCount: test.answers.length,
        operation: operation,
        profileExists: !isNew
      }
    }, { status: isNew ? 201 : 200 });

  } catch (error) {
    console.error('❌ === BŁĄD W ANALYZE ENDPOINT ===');
    console.error('❌ Error message:', (error as Error).message);
    console.error('❌ Error stack:', (error as Error).stack);
    
    // Szczegółowe logowanie błędu Prisma
    if ((error as any).code === 'P2002') {
      console.error('❌ BŁĄD UNIKALNOŚCI PRISMA:');
      console.error('❌ Target fields:', (error as any).meta?.target);
      console.error('❌ Model name:', (error as any).meta?.modelName);
    }
    
    return NextResponse.json({ 
      error: 'Błąd serwera podczas analizy testu',
      details: (error as Error).message,
      debug: {
        errorName: (error as Error).name,
        errorMessage: (error as Error).message,
        prismaCode: (error as any).code || null
      }
    }, { status: 500 });
  } finally {
    console.log('🔌 Zamykam połączenie Prisma...');
    await prisma.$disconnect();
    console.log('🧠 === ANALYZE endpoint zakończony ===');
  }
}

// GŁÓWNA FUNKCJA ANALIZY
function performAdvancedAnalysis(answers: any[], questionsMap: Record<string, any>): AnalysisResult {
  console.log('🔍 Rozpoczynam zaawansowaną analizę odpowiedzi...');

  // 1. ANALIZA HOLLAND CODE
  const hollandScores = analyzeHollandCode(answers, questionsMap);
  const hollandCode = generateHollandCode(hollandScores);
  
  // 2. ANALIZA KOMPETENCJI
  const competencyScores = analyzeCompetencies(answers, questionsMap);
  
  // 3. ANALIZA WARTOŚCI
  const workValues = analyzeWorkValues(answers, questionsMap);
  
  // 4. ANALIZA ŚRODOWISKA
  const environment = analyzePreferredEnvironment(answers, questionsMap);
  
  // 5. REKOMENDACJE ZAWODÓW
  const recommendedCareers = recommendCareers(hollandCode, competencyScores, workValues, environment);
  
  // 6. TYP OSOBOWOŚCI
  const personalityType = determinePersonalityType(hollandCode, competencyScores, workValues);
  
  // 7. OPIS PROFILU
  const careerProfile = generateCareerProfile(personalityType, hollandCode, competencyScores);
  
  // 8. OBSZARY ROZWOJU
  const developmentAreas = identifyDevelopmentAreas(competencyScores, recommendedCareers);
  
  // 9. SZKOLENIA
  const recommendedTraining = generateTrainingRecommendations(developmentAreas);
  
  // 10. PEWNOŚĆ ANALIZY
  const confidenceScore = calculateConfidenceScore(answers.length, hollandScores);

  return {
    personalityType,
    careerProfile,
    hollandCode,
    recommendedCareers,
    competencyScores,
    workValues,
    preferredEnvironment: environment,
    developmentAreas,
    recommendedTraining,
    confidenceScore
  };
}

// ANALIZA HOLLAND CODE
function analyzeHollandCode(answers: any[], questionsMap: Record<string, any>): Record<string, number> {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  
  answers.forEach(answer => {
    const question = questionsMap[answer.questionId];
    if (!question) return;

    if (question.questionType === 'SINGLE_CHOICE' && question.options) {
      const selectedOption = question.options.find((opt: any) => opt.value === answer.answerValue);
      if (selectedOption?.hollandCode) {
        scores[selectedOption.hollandCode as keyof typeof scores] += 3;
      }
    }
    
    if (question.questionType === 'RANKING' && Array.isArray(answer.answerValue)) {
      answer.answerValue.forEach((item: any, index: number) => {
        const weight = answer.answerValue.length - index;
        if (item.hollandCode) {
          scores[item.hollandCode as keyof typeof scores] += weight;
        }
      });
    }
    
    // Mapowanie kategorii na Holland Code
    const categoryMapping: Record<string, string> = {
      'technical_skills': 'R',
      'communication': 'S', 
      'leadership': 'E',
      'creativity': 'A',
      'precision': 'C',
      'problem_solving': 'I'
    };
    
    if (question.competencyArea && categoryMapping[question.competencyArea]) {
      const hollandType = categoryMapping[question.competencyArea];
      const value = typeof answer.answerValue === 'number' ? answer.answerValue : 5;
      scores[hollandType as keyof typeof scores] += value;
    }
  });
  
  return scores;
}

// GENEROWANIE KODU HOLLAND
function generateHollandCode(scores: Record<string, number>): string {
  const sortedTypes = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);
  
  return sortedTypes.join('');
}

// ANALIZA KOMPETENCJI
function analyzeCompetencies(answers: any[], questionsMap: Record<string, any>): Record<string, number> {
  const competencies = {
    techniczne: 5,
    komunikacja: 5,
    przywództwo: 5,
    rozwiązywanie_problemów: 5,
    adaptacyjność: 5,
    praca_zespołowa: 5,
    precyzja: 5,
    kreatywność: 5,
    fizyczne: 5,
    bezpieczeństwo: 5,
    matematyczne: 5,
    organizacja: 5
  };

  answers.forEach(answer => {
    const question = questionsMap[answer.questionId];
    if (!question?.competencyArea) return;

    const value = typeof answer.answerValue === 'number' ? answer.answerValue : 5;
    
    switch (question.competencyArea) {
      case 'technical_competence':
      case 'technical_skills':
        competencies.techniczne = Math.max(competencies.techniczne, value);
        break;
      case 'interpersonal_skills':
        competencies.komunikacja = Math.max(competencies.komunikacja, value);
        break;
      case 'management_skills':
        competencies.przywództwo = Math.max(competencies.przywództwo, value);
        break;
      case 'initiative':
      case 'analytical_thinking':
        competencies.rozwiązywanie_problemów = Math.max(competencies.rozwiązywanie_problemów, value);
        break;
      case 'work_style':
        if (typeof answer.answerValue === 'number') {
          competencies.praca_zespołowa = answer.answerValue;
        }
        break;
      case 'quality_focus':
        competencies.precyzja = Math.max(competencies.precyzja, value);
        break;
      case 'innovation':
        competencies.kreatywność = Math.max(competencies.kreatywność, value);
        break;
      case 'physical_capability':
        competencies.fizyczne = Math.max(competencies.fizyczne, value);
        break;
    }
  });

  return competencies;
}

// ANALIZA WARTOŚCI
function analyzeWorkValues(answers: any[], questionsMap: Record<string, any>): Record<string, number> {
  const values = {
    stabilność: 5,
    rozwój: 5,
    zarobki: 6,
    autonomia: 5,
    uznanie: 5,
    równowaga: 5,
    wyzwania: 5,
    zespołowość: 5
  };

  answers.forEach(answer => {
    const question = questionsMap[answer.questionId];
    if (!question) return;

    // Analiza rankingu motywatorów
    if (question.subcategory === 'work_motivators' && Array.isArray(answer.answerValue)) {
      answer.answerValue.forEach((item: any, index: number) => {
        const weight = 10 - index; // Wyższa pozycja = wyższa waga
        
        switch (item.value) {
          case 'money':
            values.zarobki = weight;
            break;
          case 'stability':
            values.stabilność = weight;
            break;
          case 'growth':
            values.rozwój = weight;
            break;
          case 'recognition':
            values.uznanie = weight;
            break;
          case 'autonomy':
            values.autonomia = weight;
            break;
          case 'teamwork':
            values.zespołowość = weight;
            break;
        }
      });
    }

    // Analiza sliderów wartości
    if (typeof answer.answerValue === 'number') {
      switch (question.subcategory) {
        case 'work_life_balance':
          values.równowaga = answer.answerValue;
          break;
        case 'stability_vs_challenge':
          values.wyzwania = answer.answerValue;
          values.stabilność = 10 - answer.answerValue;
          break;
        case 'money_vs_passion':
          values.zarobki = 10 - answer.answerValue;
          break;
      }
    }
  });

  return values;
}

// ANALIZA ŚRODOWISKA
function analyzePreferredEnvironment(answers: any[], questionsMap: Record<string, any>): Record<string, number> {
  const environment = {
    plac_budowy: 5,
    biuro: 5,
    warsztat: 5,
    różne_lokalizacje: 5,
    praca_zespołowa: 5,
    praca_samodzielna: 5,
    podróże: 5
  };

  answers.forEach(answer => {
    const question = questionsMap[answer.questionId];
    if (!question) return;

    if (question.subcategory === 'work_location') {
      switch (answer.answerValue) {
        case 'outdoor':
          environment.plac_budowy = 10;
          break;
        case 'workshop':
          environment.warsztat = 10;
          break;
        case 'office':
          environment.biuro = 10;
          break;
        case 'mixed':
          environment.plac_budowy = 7;
          environment.biuro = 7;
          break;
        case 'client_sites':
          environment.różne_lokalizacje = 10;
          break;
      }
    }

    if (question.subcategory === 'travel_willingness' && typeof answer.answerValue === 'number') {
      environment.podróże = answer.answerValue;
    }

    if (question.subcategory === 'teamwork_vs_independence' && typeof answer.answerValue === 'number') {
      environment.praca_zespołowa = answer.answerValue;
      environment.praca_samodzielna = 10 - answer.answerValue;
    }
  });

  return environment;
}

// REKOMENDACJE ZAWODÓW
function recommendCareers(
  hollandCode: string, 
  competencies: Record<string, number>, 
  values: Record<string, number>,
  environment: Record<string, number>
): CareerRecommendation[] {
  const recommendations: Array<CareerRecommendation & { matchScore: number }> = [];

  Object.entries(CONSTRUCTION_CAREERS).forEach(([key, career]) => {
    let matchScore = 0;

    // 1. DOPASOWANIE HOLLAND CODE (40% wagi)
    const hollandMatch = calculateHollandMatch(hollandCode, career.holland_codes);
    matchScore += hollandMatch * 0.4;

    // 2. DOPASOWANIE KOMPETENCJI (30% wagi)  
    const competencyMatch = calculateCompetencyMatch(competencies, career.competencies);
    matchScore += competencyMatch * 0.3;

    // 3. DOPASOWANIE WARTOŚCI (20% wagi)
    const valueMatch = calculateValueMatch(values, career);
    matchScore += valueMatch * 0.2;

    // 4. DOPASOWANIE ŚRODOWISKA (10% wagi)
    const environmentMatch = calculateEnvironmentMatch(environment, career);
    matchScore += environmentMatch * 0.1;

    // Dodaj do rekomendacji
    recommendations.push({
      ...career,
      match: Math.round(matchScore),
      matchScore
    });
  });

  // Sortuj i zwróć top 8 zawodów
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8)
    .map(({ matchScore, ...career }) => career);
}

// DOPASOWANIE HOLLAND CODE
function calculateHollandMatch(userCode: string, careerCodes: string[]): number {
  if (!userCode || !careerCodes.length) return 50;

  const userTypes = userCode.split('');
  let totalMatch = 0;
  let maxPossible = 0;

  userTypes.forEach((type, index) => {
    const weight = 3 - index; // Pierwszy typ ma wagę 3, drugi 2, trzeci 1
    maxPossible += weight * 100;
    
    if (careerCodes.includes(type)) {
      totalMatch += weight * 100;
    }
  });

  return maxPossible > 0 ? (totalMatch / maxPossible) * 100 : 50;
}

// DOPASOWANIE KOMPETENCJI
function calculateCompetencyMatch(userCompetencies: Record<string, number>, careerCompetencies: Record<string, number>): number {
  if (!careerCompetencies) return 70;

  let totalMatch = 0;
  let count = 0;

  Object.entries(careerCompetencies).forEach(([skill, requiredLevel]) => {
    const userLevel = userCompetencies[skill] || 5;
    const match = Math.max(0, 100 - Math.abs(userLevel - requiredLevel) * 10);
    totalMatch += match;
    count++;
  });

  return count > 0 ? totalMatch / count : 70;
}

// DOPASOWANIE WARTOŚCI
function calculateValueMatch(userValues: Record<string, number>, career: any): number {
  let match = 70; // Bazowa wartość

  // Dopasowanie zarobków
  const avgSalary = (career.salary_min + career.salary_max) / 2;
  if (avgSalary > 8000 && userValues.zarobki > 7) match += 10;
  if (avgSalary < 6000 && userValues.zarobki < 4) match += 5;

  // Stabilność vs wyzwania
  const stableJobs = ['inspektor_nadzoru', 'specjalista_bhp', 'kosztorysant'];
  if (stableJobs.includes(career.job.toLowerCase().replace(/\s/g, '_')) && userValues.stabilność > 7) {
    match += 10;
  }

  // Autonomia
  const autonomousJobs = ['architekt', 'projektant_instalacji', 'przedstawiciel_handlowy'];
  if (autonomousJobs.includes(career.job.toLowerCase().replace(/\s/g, '_')) && userValues.autonomia > 7) {
    match += 10;
  }

  return Math.min(100, match);
}

// DOPASOWANIE ŚRODOWISKA
function calculateEnvironmentMatch(userEnv: Record<string, number>, career: any): number {
  let match = 70;

  // Dopasowanie miejsca pracy
  if (career.environment.includes('budowy') && userEnv.plac_budowy > 7) match += 15;
  if (career.environment.includes('biuro') && userEnv.biuro > 7) match += 15;
  if (career.environment.includes('warsztat') && userEnv.warsztat > 7) match += 15;

  // Podróże
  const travelJobs = ['przedstawiciel_handlowy', 'inspektor_nadzoru', 'kierownik_budowy'];
  if (travelJobs.some(job => career.job.toLowerCase().includes(job.split('_')[0]))) {
    if (userEnv.podróże > 6) match += 10;
    else if (userEnv.podróże < 4) match -= 10;
  }

  return Math.min(100, Math.max(30, match));
}

// TYP OSOBOWOŚCI
function determinePersonalityType(hollandCode: string, competencies: Record<string, number>, values: Record<string, number>): string {
  const primaryType = hollandCode[0];
  const techSkills = competencies.techniczne || 5;
  const leadership = competencies.przywództwo || 5;
  const creativity = competencies.kreatywność || 5;

  switch (primaryType) {
    case 'R':
      if (techSkills > 8) return 'Mistrz Rzemiosła';
      if (competencies.fizyczne > 8) return 'Praktyczny Wykonawca';
      return 'Rzemieślnik Budowlany';
    
    case 'I':
      if (competencies.matematyczne > 8) return 'Analityczny Inżynier';
      if (techSkills > 7) return 'Techniczny Specjalista';
      return 'Badacz Rozwiązań';
    
    case 'A':
      if (creativity > 8) return 'Wizjoner Architekt';
      if (competencies.komunikacja > 7) return 'Kreatywny Projektant';
      return 'Artystyczny Budowniczy';
    
    case 'S':
      if (leadership > 7) return 'Lider Zespołu';
      if (competencies.komunikacja > 8) return 'Mentor Budowlany';
      return 'Pomocny Współpracownik';
    
    case 'E':
      if (leadership > 8 && values.zarobki > 7) return 'Przedsiębiorczy Menedżer';
      if (competencies.organizacja > 7) return 'Organizator Projektów';
      return 'Dynamiczny Lider';
    
    case 'C':
      if (competencies.precyzja > 8) return 'Perfekcjonista Kontroli';
      if (competencies.organizacja > 7) return 'Systematyczny Planista';
      return 'Dokładny Kontroler';
    
    default:
      return 'Wszechstronny Budowlaniec';
  }
}

// PROFIL ZAWODOWY
function generateCareerProfile(personalityType: string, hollandCode: string, competencies: Record<string, number>): string {
  const strengths = [];
  const workStyle = [];

  // Mocne strony
  if (competencies.techniczne > 7) strengths.push('umiejętności techniczne');
  if (competencies.komunikacja > 7) strengths.push('komunikatywność');
  if (competencies.przywództwo > 7) strengths.push('zdolności przywódcze');
  if (competencies.kreatywność > 7) strengths.push('myślenie kreatywne');
  if (competencies.precyzja > 7) strengths.push('dbałość o szczegóły');

  // Styl pracy
  if (competencies.praca_zespołowa > 6) workStyle.push('współpracy w zespole');
  else workStyle.push('samodzielnej pracy');
  
  if (competencies.fizyczne > 7) workStyle.push('aktywności fizycznej');
  if (competencies.rozwiązywanie_problemów > 7) workStyle.push('rozwiązywania problemów');

  const strengthsText = strengths.length > 0 ? strengths.join(', ') : 'różnorodne umiejętności';
  const workStyleText = workStyle.join(' i ');

  return `Jesteś osobą typu "${personalityType}" z kodem Holland'a ${hollandCode}. Twoje mocne strony to ${strengthsText}. Najlepiej funkcjonujesz w środowisku wymagającym ${workStyleText}. Ta kombinacja cech predysponuje Cię do pracy w branży budowlanej, gdzie możesz wykorzystać swoje talenty i rozwijać się zawodowo.`;
}

// OBSZARY ROZWOJU
function identifyDevelopmentAreas(competencies: Record<string, number>, careers: CareerRecommendation[]): string[] {
  const areas = [];
  const topCareers = careers.slice(0, 3);

  // Analiza niedostatków w kompetencjach
  if (competencies.komunikacja < 6) {
    areas.push('Umiejętności komunikacyjne i prezentacyjne - kluczowe dla współpracy z zespołem i klientami');
  }
  
  if (competencies.przywództwo < 6 && topCareers.some(c => c.job.includes('Kierownik') || c.job.includes('Dyrektor'))) {
    areas.push('Rozwój umiejętności przywódczych i zarządczych - potrzebne na stanowiskach kierowniczych');
  }
  
  if (competencies.techniczne < 7) {
    areas.push('Pogłębienie wiedzy technicznej i znajomości nowych technologii budowlanych');
  }
  
  if (competencies.matematyczne < 6 && topCareers.some(c => c.job.includes('Inżynier') || c.job.includes('Projektant'))) {
    areas.push('Umiejętności analityczne i matematyczne - niezbędne w projektowaniu i kalkulacjach');
  }

  // Jeśli nie ma wyraźnych braków, zaproponuj rozwój
  if (areas.length === 0) {
    areas.push('Poznanie nowych technologii i trendów w budownictwie - BIM, zielone technologie');
    areas.push('Rozwój umiejętności miękkich - komunikacja, zarządzanie czasem, negocjacje');
  }

  return areas.slice(0, 4); // Maksymalnie 4 obszary
}

// REKOMENDACJE SZKOLEŃ
function generateTrainingRecommendations(developmentAreas: string[]): string[] {
  const trainings = [];
  
  developmentAreas.forEach(area => {
    if (area.includes('komunikac')) {
      trainings.push('Szkolenie z komunikacji interpersonalnej i prezentacji');
      trainings.push('Kurs negocjacji i rozwiązywania konfliktów');
    }
    if (area.includes('przywódc') || area.includes('zarząd')) {
      trainings.push('Kurs kierowania zespołem i zarządzania projektami');
      trainings.push('Szkolenie z coachingu i motywowania pracowników');
    }
    if (area.includes('technicz') || area.includes('technologi')) {
      trainings.push('Kursy z najnowszych technologii budowlanych');
      trainings.push('Szkolenie z oprogramowania CAD/BIM');
    }
    if (area.includes('matematyczn') || area.includes('analityczn')) {
      trainings.push('Kurs projektowania konstrukcji budowlanych');
      trainings.push('Szkolenie z kosztorysowania i wyceny robót');
    }
  });

  // Uniwersalne szkolenia dla branży budowlanej
  trainings.push('Szkolenie BHP w budownictwie i zarządzanie bezpieczeństwem');
  trainings.push('Kurs prawa budowlanego i procedur administracyjnych');
  trainings.push('Szkolenie z zarządzania jakością w budownictwie');

  // Usuń duplikaty i zwróć maksymalnie 6 szkoleń
  return [...new Set(trainings)].slice(0, 6);
}

// PEWNOŚĆ ANALIZY
function calculateConfidenceScore(answersCount: number, hollandScores: Record<string, number>): number {
  let confidence = 0.6; // Bazowa pewność

  // Więcej odpowiedzi = większa pewność
  if (answersCount >= 30) confidence += 0.2;
  else if (answersCount >= 20) confidence += 0.1;

  // Wyraźne preferencje Holland = większa pewność
  const scores = Object.values(hollandScores);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const spread = maxScore - minScore;
  
  if (spread > 20) confidence += 0.15;
  else if (spread > 10) confidence += 0.05;

  return Math.min(0.95, confidence);
}