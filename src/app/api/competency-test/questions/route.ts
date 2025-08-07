// src/app/api/competency-test/questions/route.ts - POPRAWIONA WERSJA
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('📋 === QUESTIONS endpoint wywołany ===');
  
  try {
    console.log('🔐 Sprawdzam sesję...');
    const session = await getServerSession(authOptions);
    console.log('📊 Session:', session ? 'ISTNIEJE' : 'BRAK');
    
    if (!session?.user?.email) {
      console.log('❌ Brak autoryzacji - brak email w sesji');
      return NextResponse.json({ 
        error: 'Brak autoryzacji',
        debug: {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasEmail: !!session?.user?.email
        }
      }, { status: 401 });
    }

    const userEmail = session.user.email;
    console.log('📧 User email z sesji:', userEmail);

    // Znajdź użytkownika po email
    console.log('🔍 Szukam użytkownika po email w bazie...');
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    if (!user) {
      console.log('❌ Użytkownik nie znaleziony w bazie');
      return NextResponse.json({ 
        error: 'Użytkownik nie znaleziony',
        debug: {
          email: userEmail
        }
      }, { status: 404 });
    }

    const userId = user.id;
    console.log('🆔 User ID:', userId);

    // Pobierz testId z parametrów URL
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    console.log('🧪 Test ID z parametrów:', testId);

    if (testId) {
      // Sprawdź czy test należy do użytkownika
      console.log('🔍 Sprawdzam czy test należy do użytkownika...');
      const test = await prisma.competencyTest.findFirst({
        where: {
          id: testId,
          userId: userId
        }
      });

      if (!test) {
        console.log('❌ Test nie znaleziony lub nie należy do użytkownika');
        return NextResponse.json({ 
          error: 'Test nie znaleziony lub nie należy do użytkownika',
          debug: {
            testId: testId,
            userId: userId
          }
        }, { status: 404 });
      }
      
      console.log('✅ Test znaleziony:', test);
    }

    // Pobierz pytania testowe
    console.log('📋 Pobieram pytania z bazy...');
    const questions = await prisma.testQuestion.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        orderIndex: 'asc'
      },
      select: {
        id: true,
        questionText: true,
        questionType: true,
        category: true,
        subcategory: true,
        options: true,
        orderIndex: true
      }
    });

    console.log(`📊 Znaleziono ${questions.length} pytań`);

    // Jeśli mamy testId, sprawdź które pytania już zostały odpowiedziane
    let answeredQuestions: Record<string, any> = {};
    if (testId) {
      console.log('🔍 Sprawdzam odpowiedzi...');
      const answers = await prisma.testAnswer.findMany({
        where: {
          testId: testId
        },
        select: {
          questionId: true,
          answerValue: true
        }
      });
      
      answeredQuestions = answers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.answerValue;
        return acc;
      }, {} as Record<string, any>);
      
      console.log(`📝 Znaleziono ${Object.keys(answeredQuestions).length} odpowiedzi`);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    console.log('🌍 Environment:', process.env.NODE_ENV);

    return NextResponse.json({
      success: true,
      questions: questions,
      totalQuestions: questions.length,
      answeredQuestions: answeredQuestions,
      testId: testId,
      debug: {
        userId: userId,
        userEmail: user.email,
        questionsCount: questions.length,
        answersCount: Object.keys(answeredQuestions).length,
        environment: process.env.NODE_ENV,
        isProduction: isProduction
      }
    });

  } catch (error) {
    console.error('❌ === BŁĄD W QUESTIONS ENDPOINT ===');
    console.error('❌ Error message:', (error as Error).message);
    console.error('❌ Error stack:', (error as Error).stack);
    
    return NextResponse.json({ 
      error: 'Błąd serwera podczas pobierania pytań',
      details: (error as Error).message,
      debug: {
        errorName: (error as Error).name,
        errorMessage: (error as Error).message
      }
    }, { status: 500 });
  } finally {
    console.log('🔌 Zamykam połączenie Prisma...');
    await prisma.$disconnect();
    console.log('📋 === QUESTIONS endpoint zakończony ===');
  }
}