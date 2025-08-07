const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedTestQuestions() {
  console.log('🌱 === Rozpoczynam seedowanie rozszerzonych pytań testowych (32 pytania) ===');

  try {
    // Sprawdź różne możliwe ścieżki do pliku
    const possiblePaths = [
      path.join(process.cwd(), 'test-questions.json'),
      path.join(process.cwd(), 'data', 'test-questions.json'),
      path.join(process.cwd(), 'src', 'data', 'test-questions.json'),
      path.join(__dirname, '..', 'test-questions.json'),
      path.join(__dirname, '..', 'data', 'test-questions.json')
    ];

    let dataPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        dataPath = testPath;
        console.log(`✅ Znaleziono plik: ${testPath}`);
        break;
      } else {
        console.log(`❌ Nie znaleziono: ${testPath}`);
      }
    }

    if (!dataPath) {
      console.log(`
🚨 BŁĄD: Nie znaleziono pliku test-questions.json!

💡 ROZWIĄZANIE:
1. Skopiuj zawartość pliku "paste-6.txt" z dokumentów
2. Zapisz jako "test-questions.json" w głównym katalogu projektu
3. Uruchom ponownie: npm run db:seed-tests
      `);
      
      // Fallback - użyj podstawowych pytań
      return await createBasicQuestions();
    }

    console.log(`📂 Czytam plik: ${dataPath}`);
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Sprawdź strukturę danych
    if (!data.testQuestions || !Array.isArray(data.testQuestions)) {
      console.log(`
🚨 BŁĄD STRUKTURY: Plik JSON ma nieprawidłową strukturę!
Znalezione klucze: ${Object.keys(data).join(', ')}
      `);
      return await createBasicQuestions();
    }

    const { testQuestions } = data;
    console.log(`📊 Znaleziono ${testQuestions.length} pytań do załadowania`);

    // Sprawdź obecną liczbę pytań w bazie
    const existingCount = await prisma.testQuestion.count();
    console.log(`📋 Obecnie w bazie: ${existingCount} pytań`);

    if (existingCount > 0) {
      console.log('🗑️ Usuwam stare pytania...');
      const deleted = await prisma.testQuestion.deleteMany({});
      console.log(`✅ Usunięto ${deleted.count} starych pytań`);
    }

    // Dodaj nowe pytania do bazy
    console.log('💾 Dodaję nowe pytania do bazy...');
    let createdCount = 0;
    let errorCount = 0;

    for (const [index, question] of testQuestions.entries()) {
      try {
        // Sprawdź czy questionType jest prawidłowy
        const validTypes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SLIDER', 'RANKING', 'TEXT_SHORT'];
        if (!validTypes.includes(question.questionType)) {
          throw new Error(`Nieprawidłowy questionType: ${question.questionType}`);
        }

        // Sprawdź czy category jest prawidłowa
        const validCategories = ['INTERESTS', 'COMPETENCIES', 'VALUES', 'ENVIRONMENT', 'ASPIRATIONS'];
        if (!validCategories.includes(question.category)) {
          throw new Error(`Nieprawidłowa category: ${question.category}`);
        }

        await prisma.testQuestion.create({
          data: {
            id: question.id,
            questionText: question.questionText,
            questionType: question.questionType,
            category: question.category,
            subcategory: question.subcategory || null,
            options: question.options || null,
            hollandDimension: question.hollandDimension || null,
            competencyArea: question.competencyArea || null,
            orderIndex: question.orderIndex,
            isActive: true
          }
        });
        
        createdCount++;
        console.log(`✅ [${index + 1}/${testQuestions.length}] Dodano: ${question.id}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ [${index + 1}/${testQuestions.length}] Błąd przy ${question.id}: ${error.message}`);
      }
    }

    console.log('\n🎉 === SEEDOWANIE ZAKOŃCZONE ===');
    console.log(`✅ Pomyślnie utworzono: ${createdCount} pytań`);
    console.log(`❌ Błędy: ${errorCount}`);
    
    return { success: true, created: createdCount, errors: errorCount };

  } catch (error) {
    console.error('\n💥 === KRYTYCZNY BŁĄD SEEDOWANIA ===');
    console.error('❌ Szczegóły:', error.message);
    
    // Fallback - utwórz podstawowe pytania
    console.log('🔄 Próbuję utworzyć podstawowe pytania...');
    return await createBasicQuestions();
  }
}

// Funkcja fallback z podstawowymi pytaniami
async function createBasicQuestions() {
  console.log('📝 Tworzę podstawowe pytania testowe...');
  
  const basicQuestions = [
    {
      id: "q001",
      questionText: "Która z tych czynności sprawiałaby Ci największą satysfakcję w pracy?",
      questionType: "SINGLE_CHOICE",
      category: "INTERESTS",
      subcategory: "holland_primary",
      hollandDimension: "mixed",
      competencyArea: "career_interests",
      orderIndex: 1,
      options: [
        {"value": "R", "text": "Budowanie i montaż konstrukcji własnymi rękami", "hollandCode": "R"},
        {"value": "I", "text": "Analizowanie planów budowlanych i rozwiązywanie problemów technicznych", "hollandCode": "I"},
        {"value": "A", "text": "Projektowanie wyglądu i estetyki budynków", "hollandCode": "A"},
        {"value": "S", "text": "Szkolenie nowych pracowników na budowie", "hollandCode": "S"},
        {"value": "E", "text": "Zarządzanie całym projektem budowlanym", "hollandCode": "E"},
        {"value": "C", "text": "Prowadzenie dokumentacji i kontroli jakości", "hollandCode": "C"}
      ]
    },
    {
      id: "q002",
      questionText: "W jakim środowisku pracy czułbyś się najlepiej?",
      questionType: "SINGLE_CHOICE",
      category: "ENVIRONMENT",
      subcategory: "work_location",
      competencyArea: "environmental_preference",
      orderIndex: 2,
      options: [
        {"value": "outdoor", "text": "Na placu budowy, na świeżym powietrzu"},
        {"value": "workshop", "text": "W warsztacie lub hali produkcyjnej"},
        {"value": "office", "text": "W biurze projektowym z komputerem"},
        {"value": "mixed", "text": "Połączenie biura i terenu"},
        {"value": "client_sites", "text": "U klientów, w różnych lokalizacjach"}
      ]
    },
    {
      id: "q003",
      questionText: "Jak oceniasz swoje umiejętności techniczne?",
      questionType: "SLIDER",
      category: "COMPETENCIES",
      subcategory: "technical_skills",
      competencyArea: "technical_competence",
      orderIndex: 3,
      options: {
        "min": 1,
        "max": 10,
        "labels": {
          "1": "Początkujący",
          "5": "Średni poziom", 
          "10": "Ekspert"
        },
        "description": "Oceń swoje ogólne umiejętności techniczne w pracy z narzędziami i maszynami"
      }
    },
    {
      id: "q004",
      questionText: "Co motywuje Cię najbardziej w pracy?",
      questionType: "RANKING",
      category: "VALUES",
      subcategory: "work_motivators",
      competencyArea: "motivation",
      orderIndex: 4,
      options: [
        {"value": "money", "text": "Wysokie zarobki"},
        {"value": "stability", "text": "Stabilność zatrudnienia"},
        {"value": "growth", "text": "Możliwości rozwoju"},
        {"value": "recognition", "text": "Uznanie i szacunek"},
        {"value": "autonomy", "text": "Niezależność w działaniu"},
        {"value": "teamwork", "text": "Praca w zespole"}
      ]
    },
    {
      id: "q005",
      questionText: "Jakie są Twoje główne cele zawodowe?",
      questionType: "SINGLE_CHOICE",
      category: "ASPIRATIONS",
      subcategory: "career_goals",
      competencyArea: "ambition",
      orderIndex: 5,
      options: [
        {"value": "specialist", "text": "Zostać ekspertem w swojej dziedzinie"},
        {"value": "manager", "text": "Awansować na stanowisko kierownicze"},
        {"value": "entrepreneur", "text": "Założyć własną firmę budowlaną"},
        {"value": "stable", "text": "Znaleźć stabilną, dobrze płatną pracę"},
        {"value": "education", "text": "Podnieść kwalifikacje i wykształcenie"}
      ]
    }
  ];

  // Usuń istniejące pytania
  await prisma.testQuestion.deleteMany({});
  
  let createdCount = 0;
  for (const question of basicQuestions) {
    try {
      await prisma.testQuestion.create({
        data: {
          id: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          category: question.category,
          subcategory: question.subcategory || null,
          options: question.options || null,
          hollandDimension: question.hollandDimension || null,
          competencyArea: question.competencyArea || null,
          orderIndex: question.orderIndex,
          isActive: true
        }
      });
      createdCount++;
      console.log(`✅ Utworzono podstawowe pytanie: ${question.id}`);
    } catch (error) {
      console.error(`❌ Błąd przy tworzeniu pytania ${question.id}:`, error.message);
    }
  }
  
  console.log(`✅ Utworzono ${createdCount} podstawowych pytań`);
  return { success: true, created: createdCount, errors: 0, fallback: true };
}

async function main() {
  try {
    const result = await seedTestQuestions();
    
    if (result.success) {
      console.log('\n🚀 SUCCESS: Baza danych została zaktualizowana!');
      console.log(`📊 Utworzono: ${result.created} pytań`);
      
      if (result.fallback) {
        console.log('\n⚠️ UWAGA: Użyto podstawowych pytań (fallback)');
        console.log('💡 Aby uzyskać pełny zestaw 32 pytań:');
        console.log('   1. Skopiuj zawartość "paste-6.txt" jako "test-questions.json"');
        console.log('   2. Uruchom ponownie: npm run db:seed-tests');
      } else {
        console.log('\n🔥 Nowe funkcje dostępne:');
        console.log('   • Rozszerzone pytania testowe');
        console.log('   • Szczegółowa analiza kompetencji');
        console.log('   • Realistyczne rekomendacje zawodów');
      }
    } else {
      console.log('\n❌ SEEDOWANIE NIEUDANE');
    }
    
  } catch (error) {
    console.error('\n💀 SEEDOWANIE NIEUDANE:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Uruchom tylko jeśli skrypt jest wywołany bezpośrednio
if (require.main === module) {
  main();
}

module.exports = { seedTestQuestions };