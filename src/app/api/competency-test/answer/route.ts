// src/app/api/competency-test/answer/route.ts - POPRAWIONA WERSJA
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

interface AnswerRequestBody {
  testId: string;
  questionId: string;
  answerValue: any;
  questionType: string;
}

export async function POST(request: NextRequest) {
  console.log('📝 === ANSWER endpoint wywołany ===');
  
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

    const body: AnswerRequestBody = await request.json();
    const { testId, questionId, answerValue, questionType } = body;
    
    console.log('📋 Dane odpowiedzi:', {
      testId,
      questionId,
      questionType,
      answerValueType: typeof answerValue
    });

    // Walidacja danych wejściowych
    if (!testId || !questionId || answerValue === undefined || !questionType) {
      console.log('❌ Brakujące dane wejściowe');
      return NextResponse.json({ 
        error: 'Brakujące dane: testId, questionId, answerValue, questionType',
        received: {
          testId: !!testId,
          questionId: !!questionId,
          answerValue: answerValue !== undefined,
          questionType: !!questionType
        }
      }, { status: 400 });
    }

    // Sprawdź czy test należy do użytkownika i czy można jeszcze na niego odpowiadać
    console.log('🔍 Sprawdzam test...');
    const test = await prisma.competencyTest.findFirst({
      where: {
        id: testId,
        userId: userId,
        completionStatus: {
          in: ['STARTED', 'IN_PROGRESS']
        }
      }
    });

    if (!test) {
      console.log('❌ Test nie znaleziony lub już ukończony');
      return NextResponse.json({ 
        error: 'Test nie znaleziony lub już ukończony',
        debug: {
          testId: testId,
          userId: userId
        }
      }, { status: 404 });
    }

    console.log('✅ Test znaleziony:', test);

    // Sprawdź czy pytanie istnieje
    console.log('🔍 Sprawdzam pytanie...');
    const question = await prisma.testQuestion.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      console.log('❌ Pytanie nie znalezione');
      return NextResponse.json({ 
        error: 'Pytanie nie znalezione',
        debug: {
          questionId: questionId
        }
      }, { status: 404 });
    }

    console.log('✅ Pytanie znalezione:', question);

    // Zapisz lub zaktualizuj odpowiedź
    console.log('💾 Zapisuję odpowiedź...');
    const answer = await prisma.testAnswer.upsert({
      where: {
        testId_questionId: {
          testId: testId,
          questionId: questionId
        }
      },
      update: {
        answerValue: answerValue,
        answeredAt: new Date()
      },
      create: {
        testId: testId,
        questionId: questionId,
        questionType: questionType as any, // Prisma enum
        answerValue: answerValue
      }
    });

    console.log('✅ Odpowiedź zapisana:', answer);

    // Zaktualizuj postęp testu
    console.log('📊 Aktualizuję postęp testu...');
    const answeredCount = await prisma.testAnswer.count({
      where: {
        testId: testId
      }
    });

    const isCompleted = answeredCount >= test.totalQuestions;
    const newStatus = isCompleted ? 'COMPLETED' : 'IN_PROGRESS';

    const updatedTest = await prisma.competencyTest.update({
      where: {
        id: testId
      },
      data: {
        answeredQuestions: answeredCount,
        completionStatus: newStatus as any, // Prisma enum
        completedAt: isCompleted ? new Date() : null
      }
    });

    console.log(`📈 Postęp zaktualizowany: ${answeredCount}/${test.totalQuestions} (${isCompleted ? 'UKOŃCZONY' : 'W TOKU'})`);

    const isProduction = process.env.NODE_ENV === 'production';

    return NextResponse.json({
      success: true,
      progress: {
        answered: answeredCount,
        total: test.totalQuestions,
        percentage: Math.round((answeredCount / test.totalQuestions) * 100)
      },
      isCompleted: isCompleted,
      message: isCompleted ? 'Test ukończony! 🎉' : 'Odpowiedź zapisana',
      canProceedToAnalysis: isCompleted,
      debug: {
        userId: userId,
        userEmail: user.email,
        answeredCount: answeredCount,
        totalQuestions: test.totalQuestions,
        newStatus: newStatus,
        environment: process.env.NODE_ENV,
        isProduction: isProduction
      }
    });

  } catch (error) {
    console.error('❌ === BŁĄD W ANSWER ENDPOINT ===');
    console.error('❌ Error message:', (error as Error).message);
    console.error('❌ Error stack:', (error as Error).stack);
    
    return NextResponse.json({ 
      error: 'Błąd serwera podczas zapisywania odpowiedzi',
      details: (error as Error).message,
      debug: {
        errorName: (error as Error).name,
        errorMessage: (error as Error).message
      }
    }, { status: 500 });
  } finally {
    console.log('🔌 Zamykam połączenie Prisma...');
    await prisma.$disconnect();
    console.log('📝 === ANSWER endpoint zakończony ===');
  }
}