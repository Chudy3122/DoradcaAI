// scripts/auto-complete-test.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function autoCompleteTestForAdmin() {
  console.log(`🎯 Rozpoczynam automatyczne ukończenie testu dla admina`);
  
  try {
    // 1. Znajdź admina
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!admin) {
      console.error(`❌ Nie znaleziono użytkownika z rolą admin`);
      return;
    }
    
    console.log(`✅ Znaleziono admina: ${admin.name || admin.email}`);
    
    // 2. Sprawdź czy już ma ukończony test
    const existingTest = await prisma.competencyTest.findFirst({
      where: {
        userId: admin.id,
        completionStatus: 'COMPLETED'
      }
    });
    
    if (existingTest) {
      console.log(`⚠️ Admin już ma ukończony test (ID: ${existingTest.id})`);
      console.log(`🔄 Tworzę nowy test (stary profil zostanie zaktualizowany automatycznie)`);
      
      // Usuń tylko stare testy (ZACHOWAJ profil)
      await prisma.competencyTest.deleteMany({
        where: { userId: admin.id }
      });
      
      console.log(`✅ Stare testy usunięte, profil zachowany`);
    }
    
    // 3. Pobierz wszystkie aktywne pytania
    const questions = await prisma.testQuestion.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' }
    });
    
    console.log(`📝 Znaleziono ${questions.length} pytań`);
    
    if (questions.length === 0) {
      console.error('❌ Brak pytań w bazie danych. Uruchom najpierw: npm run db:seed-tests');
      return;
    }
    
    // 4. Utwórz nowy test
    const newTest = await prisma.competencyTest.create({
      data: {
        userId: admin.id,
        completionStatus: 'IN_PROGRESS',
        totalQuestions: questions.length,
        answeredQuestions: 0
      }
    });
    
    console.log(`✅ Utworzono test ID: ${newTest.id}`);
    
    // 5. Generuj losowe odpowiedzi dla każdego pytania
    const answers = [];
    
    for (const question of questions) {
      const answerValue = generateRandomAnswer(question);
      
      const answer = await prisma.testAnswer.create({
        data: {
          testId: newTest.id,
          questionId: question.id,
          questionType: question.questionType,
          answerValue: answerValue
        }
      });
      
      answers.push(answer);
      console.log(`✅ Odpowiedź ${answers.length}/${questions.length}: ${question.questionText.substring(0, 50)}...`);
    }
    
    // 6. Oznacz test jako ukończony
    const completedTest = await prisma.competencyTest.update({
      where: { id: newTest.id },
      data: {
        completionStatus: 'COMPLETED',
        answeredQuestions: questions.length,
        completedAt: new Date(),
        testDuration: Math.floor(Math.random() * 30) + 10 // 10-40 minut
      }
    });
    
    console.log(`🎉 Test ukończony pomyślnie!`);
    console.log(`📊 Statystyki:`);
    console.log(`   - ID testu: ${completedTest.id}`);
    console.log(`   - Pytania: ${completedTest.answeredQuestions}/${completedTest.totalQuestions}`);
    console.log(`   - Czas: ${completedTest.testDuration} minut`);
    console.log(`   - Status: ${completedTest.completionStatus}`);
    
    console.log(`\n💡 Profil zostanie automatycznie zaktualizowany przy pierwszym wejściu na /profile`);
    console.log(`🔒 Ręcznie wprowadzone dane (osobiste, doświadczenie, cele) zostaną zachowane`);
    console.log(`🔄 Zaktualizowane zostaną tylko wyniki testów (kod Hollanda, kompetencje, sugestie)`);
    
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia testu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateRandomAnswer(question) {
  switch (question.questionType) {
    case 'SINGLE_CHOICE':
      if (question.options && Array.isArray(question.options)) {
        const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
        return { value: randomOption.value };
      }
      return { value: 'A' };
      
    case 'MULTIPLE_CHOICE':
      if (question.options && Array.isArray(question.options)) {
        const numSelections = Math.floor(Math.random() * 3) + 1; // 1-3 selekcje
        const selectedOptions = [];
        for (let i = 0; i < numSelections; i++) {
          const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
          if (!selectedOptions.includes(randomOption.value)) {
            selectedOptions.push(randomOption.value);
          }
        }
        return { values: selectedOptions };
      }
      return { values: ['A'] };
      
    case 'SLIDER':
      // Losowa wartość między 1 a 10
      return { value: Math.floor(Math.random() * 10) + 1 };
      
    case 'RANKING':
      if (question.options && Array.isArray(question.options)) {
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);
        return { ranking: shuffled.map(opt => opt.value) };
      }
      return { ranking: ['A', 'B', 'C'] };
      
    case 'TEXT_SHORT':
      const sampleAnswers = [
        'Tak, to mnie interesuje',
        'Nie, nie jest to dla mnie',
        'Być może w przyszłości',
        'Zależy od okoliczności',
        'Średnio mnie to pociąga'
      ];
      return { text: sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)] };
      
    default:
      return { value: 'default' };
  }
}

// Uruchom automatycznie
if (require.main === module) {
  autoCompleteTestForAdmin()
    .then(() => {
      console.log('\n🚀 Gotowe! Możesz się teraz zalogować jako admin i sprawdzić profil.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Błąd:', error);
      process.exit(1);
    });
}

module.exports = { autoCompleteTestForAdmin };