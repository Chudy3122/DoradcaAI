// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Pobierz profil użytkownika
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        careerProfile: true, // Usunięto include test - już nie ma tej relacji
        competencyTests: {
          where: { completionStatus: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 1,
          include: {
            answers: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Użytkownik nie znaleziony' },
        { status: 404 }
      );
    }

    // Jeśli nie ma profilu ale ma ukończony test, stwórz profil
    if (!user.careerProfile && user.competencyTests.length > 0) {
      const latestTest = user.competencyTests[0];
      
      // Generuj profil na podstawie odpowiedzi z testu
      const profileData = await generateProfileFromTest(latestTest);
      
      const newProfile = await prisma.userCareerProfile.create({
        data: {
          userId: user.id,
          lastTestId: latestTest.id,
          ...profileData
        }
      });

      return NextResponse.json({
        success: true,
        profile: newProfile,
        hasTest: true,
        isNewProfile: true
      });
    }

    // Jeśli ma profil ale jest nowszy test, zaktualizuj tylko dane z testu (zachowaj ręczne dane)
    if (user.careerProfile && user.competencyTests.length > 0) {
      const latestTest = user.competencyTests[0];
      
      // Sprawdź czy test jest nowszy niż ostatni użyty
      if (user.careerProfile.lastTestId !== latestTest.id) {
        console.log(`🔄 Znaleziono nowszy test ${latestTest.id}, aktualizuję profil zachowując ręczne dane`);
        
        // Generuj nowe dane z testu
        const newTestData = await generateProfileFromTest(latestTest);
        
        // Zaktualizuj profil - TYLKO dane z testu, zachowaj ręczne
        const updatedProfile = await prisma.userCareerProfile.update({
          where: { userId: user.id },
          data: {
            // Aktualizuj dane z testu
            lastTestId: latestTest.id,
            hollandCode: newTestData.hollandCode,
            personalityType: newTestData.personalityType,
            competencyScores: newTestData.competencyScores,
            careerSuggestions: newTestData.careerSuggestions,
            developmentAreas: newTestData.developmentAreas,
            aiAnalysis: newTestData.aiAnalysis,
            confidenceScore: newTestData.confidenceScore,
            
            // ZACHOWAJ istniejące ręczne dane (nie nadpisuj)
            // personalInfo, experience, goals, workValues, preferredEnvironment pozostają bez zmian
            
            lastUpdated: new Date()
          }
        });
        
        return NextResponse.json({
          success: true,
          profile: updatedProfile,
          hasTest: true,
          isNewProfile: false,
          updated: true
        });
      }
    }

    return NextResponse.json({
      success: true,
      profile: user.careerProfile,
      hasTest: user.competencyTests.length > 0,
      isNewProfile: false
    });

  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// PUT - Aktualizuj profil użytkownika
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { careerProfile: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Użytkownik nie znaleziony' },
        { status: 404 }
      );
    }

    let updatedProfile;

    if (user.careerProfile) {
      // Aktualizuj istniejący profil
      updatedProfile = await prisma.userCareerProfile.update({
        where: { userId: user.id },
        data: {
          // Dane z testu (nie nadpisujemy jeśli nie ma nowych)
          hollandCode: updateData.hollandCode || user.careerProfile.hollandCode,
          personalityType: updateData.personalityType || user.careerProfile.personalityType,
          competencyScores: updateData.competencyScores || user.careerProfile.competencyScores,
          
          // Dane edytowalne przez użytkownika
          workValues: updateData.workValues || user.careerProfile.workValues,
          preferredEnvironment: updateData.preferredEnvironment || user.careerProfile.preferredEnvironment,
          careerSuggestions: updateData.careerSuggestions || user.careerProfile.careerSuggestions,
          developmentAreas: updateData.developmentAreas || user.careerProfile.developmentAreas,
          
          // Nowe pola edytowalne
          personalInfo: updateData.personalInfo || user.careerProfile.personalInfo,
          experience: updateData.experience || user.careerProfile.experience,
          goals: updateData.goals || user.careerProfile.goals,
          
          // Aktualizuj czas ostatniej modyfikacji
          lastUpdated: new Date()
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Profil nie istnieje. Wykonaj najpierw test kompetencji.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Błąd podczas aktualizacji profilu:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// Funkcja pomocnicza do generowania profilu z testu
async function generateProfileFromTest(test: any) {
  // Analiza odpowiedzi z testu
  const answers = test.answers;
  
  // Oblicz kod Hollanda na podstawie odpowiedzi
  const hollandScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const competencyScores: any = {};
  
  for (const answer of answers) {
    // Pobierz pytanie żeby sprawdzić typ i kategorię
    const question = await prisma.testQuestion.findUnique({
      where: { id: answer.questionId }
    });
    
    if (question) {
      // Jeśli pytanie ma hollandDimension, dodaj punkty
      if (question.hollandDimension && hollandScores.hasOwnProperty(question.hollandDimension)) {
        if (answer.answerValue && typeof answer.answerValue === 'object') {
          const value = (answer.answerValue as any).value;
          if (typeof value === 'string' && hollandScores.hasOwnProperty(value)) {
            hollandScores[value as keyof typeof hollandScores] += 1;
          }
        }
      }
      
      // Kompetencje
      if (question.competencyArea) {
        if (!competencyScores[question.competencyArea]) {
          competencyScores[question.competencyArea] = 0;
        }
        
        if (answer.answerValue && typeof answer.answerValue === 'object') {
          const value = (answer.answerValue as any).value;
          if (typeof value === 'number') {
            competencyScores[question.competencyArea] += value;
          }
        }
      }
    }
  }
  
  // Znajdź dominujące kody Hollanda
  const sortedHolland = Object.entries(hollandScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  const hollandCode = sortedHolland.map(([code]) => code).join('');
  
  // Określ typ osobowości na podstawie wyników
  const personalityType = determinePersonalityType(hollandCode, competencyScores);
  
  // Generuj sugestie zawodów (uproszczone)
  const careerSuggestions = generateCareerSuggestions(hollandCode, competencyScores);
  
  return {
    hollandCode,
    personalityType,
    competencyScores,
    workValues: {},
    preferredEnvironment: {},
    careerSuggestions,
    developmentAreas: identifyDevelopmentAreas(competencyScores),
    aiAnalysis: `Profil wygenerowany automatycznie na podstawie testu z dnia ${new Date().toLocaleDateString('pl-PL')}`,
    confidenceScore: 0.8,
    personalInfo: {},
    experience: {},
    goals: {}
  };
}

function determinePersonalityType(hollandCode: string, competencyScores: any): string {
  // Uproszczona logika określania typu osobowości
  const primary = hollandCode[0];
  
  switch (primary) {
    case 'R': return 'Praktyk-Realizator';
    case 'I': return 'Analityk-Badacz';
    case 'A': return 'Kreatywny-Artysta';
    case 'S': return 'Pomocny-Społecznik';
    case 'E': return 'Przedsiębiorca-Lider';
    case 'C': return 'Konwencjonalny-Organizator';
    default: return 'Wszechstronny';
  }
}

function generateCareerSuggestions(hollandCode: string, competencyScores: any): string[] {
  // Uproszczone sugestie - zawsze zwracamy stringi
  const suggestions: string[] = [];
  
  if (hollandCode.includes('R')) {
    suggestions.push('Technik budowlany', 'Majster budowlany', 'Operator maszyn budowlanych');
  }
  if (hollandCode.includes('I')) {
    suggestions.push('Inżynier konstruktor', 'Projektant budowlany', 'Kontroler jakości');
  }
  if (hollandCode.includes('A')) {
    suggestions.push('Architekt', 'Projektant wnętrz', 'Grafik techniczny');
  }
  if (hollandCode.includes('S')) {
    suggestions.push('Koordynator zespołu', 'Szkoleniowiec BHP', 'Doradca klienta');
  }
  if (hollandCode.includes('E')) {
    suggestions.push('Kierownik budowy', 'Menedżer projektu', 'Przedstawiciel handlowy');
  }
  if (hollandCode.includes('C')) {
    suggestions.push('Kosztorysant', 'Planista', 'Kontroler dokumentacji');
  }
  
  // Jeśli brak wyników, dodaj ogólne
  if (suggestions.length === 0) {
    suggestions.push('Pracownik budowlany', 'Pomocnik budowlany', 'Praktykant');
  }
  
  return suggestions.slice(0, 5); // Maksymalnie 5 sugestii
}

function identifyDevelopmentAreas(competencyScores: any): string[] {
  // Znajdź obszary z najniższymi wynikami - zawsze zwracamy stringi
  if (!competencyScores || Object.keys(competencyScores).length === 0) {
    return ['komunikacja', 'organizacja_pracy', 'umiejetnosci_techniczne'];
  }
  
  const areas = Object.entries(competencyScores)
    .sort(([,a], [,b]) => (a as number) - (b as number))
    .slice(0, 3)
    .map(([area]) => String(area)); // Upewniamy się że to string
    
  return areas.length > 0 ? areas : ['rozwoj_osobisty'];
}