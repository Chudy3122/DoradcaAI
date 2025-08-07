// src/app/api/competency-test/start/route.ts - ZAKTUALIZOWANY
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST() {
  console.log('🚀 === START endpoint wywołany ===');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Brak autoryzacji');
      return NextResponse.json({ 
        error: 'Brak autoryzacji'
      }, { status: 401 });
    }

    const userEmail = session.user.email;
    console.log('📧 User email z sesji:', userEmail);

    // Znajdź użytkownika
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      console.log('❌ Użytkownik nie znaleziony');
      return NextResponse.json({ 
        error: 'Użytkownik nie znaleziony'
      }, { status: 404 });
    }

    const userId = user.id;
    console.log('👤 User ID:', userId);

    // Sprawdź czy użytkownik ma już profil zawodowy
    const existingProfile = await prisma.userCareerProfile.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        lastTestId: true,
        personalityType: true,
        hollandCode: true,
        profileGeneratedAt: true,
        lastUpdated: true
      }
    });

    // Sprawdź czy ma aktywny test
    const activeTest = await prisma.competencyTest.findFirst({
      where: {
        userId: userId,
        completionStatus: {
          in: ['STARTED', 'IN_PROGRESS']
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (activeTest) {
      console.log(`♻️ Kontynuacja istniejącego testu: ${activeTest.id}`);
      
      // Oblicz postęp
      const progress = {
        answered: activeTest.answeredQuestions,
        total: activeTest.totalQuestions,
        percentage: Math.round((activeTest.answeredQuestions / activeTest.totalQuestions) * 100)
      };

      return NextResponse.json({
        success: true,
        testId: activeTest.id,
        existingTest: true,
        progress: progress,
        hasExistingProfile: !!existingProfile,
        profileInfo: existingProfile ? {
          personalityType: existingProfile.personalityType,
          hollandCode: existingProfile.hollandCode,
          lastUpdated: existingProfile.lastUpdated
        } : null,
        message: existingProfile 
          ? '🔄 Kontynuujesz test. UWAGA: Ukończenie nadpisze Twój obecny profil zawodowy!'
          : '♻️ Kontynuujesz rozpoczęty test kompetencji.'
      });
    }

    // Utwórz nowy test
    console.log('✨ Tworzę nowy test...');
    const newTest = await prisma.competencyTest.create({
      data: {
        userId: userId,
        totalQuestions: 32, // Zwiększone z 30 na 32
        completionStatus: 'STARTED'
      }
    });

    console.log(`✅ Utworzono nowy test: ${newTest.id}`);

    const initialProgress = {
      answered: 0,
      total: newTest.totalQuestions,
      percentage: 0
    };

    return NextResponse.json({
      success: true,
      testId: newTest.id,
      existingTest: false,
      progress: initialProgress,
      hasExistingProfile: !!existingProfile,
      profileInfo: existingProfile ? {
        personalityType: existingProfile.personalityType,
        hollandCode: existingProfile.hollandCode,
        lastUpdated: existingProfile.lastUpdated
      } : null,
      message: existingProfile 
        ? '🔄 Rozpoczynasz nowy test. UWAGA: Ukończenie nadpisze Twój obecny profil zawodowy!'
        : '✨ Rozpoczynasz swój pierwszy test kompetencji!',
      warning: existingProfile 
        ? 'Już masz profil zawodowy. Nowy test zaktualizuje wszystkie Twoje wyniki.'
        : null
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Błąd w START endpoint:', error);
    return NextResponse.json({ 
      error: 'Błąd serwera podczas rozpoczynania testu',
      details: (error as Error).message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log('🚀 === START endpoint zakończony ===');
  }
}