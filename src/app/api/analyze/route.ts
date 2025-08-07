// src/app/api/openai/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicjalizacja klienta OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Pobierz parametry z zapytania
    const { documentContent, metadata, prompt, type } = await request.json();

    if (!documentContent || !prompt) {
      return NextResponse.json(
        { error: 'Brak wymaganych parametrów' },
        { status: 400 }
      );
    }

    // Przygotuj zapytanie z odpowiednim kontekstem dla Doradcy Zawodowego AI
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'pdf':
        systemPrompt = `Jesteś profesjonalnym Doradcą Zawodowym AI, który specjalizuje się w analizie dokumentów związanych z karierą i rozwojem zawodowym.

TWOJE KOMPETENCJE:
- 📄 Analiza CV, certyfikatów, dyplomów
- 🎯 Ocena kompetencji i kwalifikacji
- 💼 Doradztwo w zakresie rozwoju kariery
- 📊 Interpretacja dokumentów HR i rekrutacyjnych
- 🎓 Analiza dokumentów edukacyjnych

ZASADY ANALIZY:
- Skupiaj się na aspektach zawodowych dokumentu
- Identyfikuj kompetencje, doświadczenie, kwalifikacje
- Wskazuj możliwości rozwoju kariery
- Podawaj praktyczne rekomendacje
- Odpowiadaj zawsze po polsku, profesjonalnie ale przystępnie`;
        
        userPrompt = `📄 DOKUMENT PDF DO ANALIZY:
**Tytuł:** "${metadata.title}"
**Strony:** ${metadata.pages}

**Zawartość dokumentu:**
${documentContent.substring(0, 15000)}

**Metadata:**
${JSON.stringify(metadata, null, 2)}

---

💼 **PYTANIE DOTYCZĄCE KARIERY:**
${prompt}

**ZADANIE:** Przeanalizuj powyższy dokument z perspektywy doradcy zawodowego i odpowiedz na pytanie, skupiając się na aspektach związanych z rozwojem kariery, kompetencjami i możliwościami zawodowymi.`;
        break;

      case 'excel':
        systemPrompt = `Jesteś profesjonalnym Doradcą Zawodowym AI, który specjalizuje się w analizie danych zawodowych i rynku pracy.

TWOJE KOMPETENCJE:
- 📊 Analiza danych o zarobkach i trendach zawodowych
- 📈 Interpretacja statystyk rynku pracy
- 💰 Ocena perspektyw finansowych zawodów
- 🏢 Analiza danych branżowych i sektorowych
- 📋 Przetwarzanie danych HR i rekrutacyjnych

ZASADY ANALIZY:
- Szukaj trendów i wzorców w danych zawodowych
- Identyfikuj możliwości rozwoju kariery
- Interpretuj dane finansowe (zarobki, benefity)
- Wskazuj perspektywne branże i zawody
- Dostarczaj praktyczne wnioski dla planowania kariery`;
        
        userPrompt = `📊 ARKUSZ DANYCH DO ANALIZY:
**Nazwa:** "${metadata.title}"
**Arkusze:** ${metadata.sheetCount}
**Wiersze:** ${metadata.totalRows}
**Kolumny:** ${metadata.totalColumns}

**Zawartość danych:**
\`\`\`
${documentContent.substring(0, 15000)}
\`\`\`

**Metadata:**
${JSON.stringify(metadata, null, 2)}

---

💼 **PYTANIE DOTYCZĄCE DANYCH ZAWODOWYCH:**
${prompt}

**ZADANIE:** Jako doradca zawodowy, przeanalizuj powyższe dane i odpowiedz na pytanie. Skup się na trendach rynkowych, możliwościach kariery i praktycznych wnioskach dla rozwoju zawodowego.`;
        break;

      default:
        systemPrompt = `Jesteś profesjonalnym Doradcą Zawodowym AI, który analizuje różnorodne dokumenty związane z karierą i rozwojem zawodowym.

TWOJE KOMPETENCJE:
- 📄 Analiza dokumentów zawodowych
- 💼 Doradztwo w zakresie kariery
- 🎯 Ocena kompetencji i możliwości rozwoju
- 📋 Interpretacja materiałów edukacyjnych i szkoleniowych
- 🏢 Analiza dokumentów biznesowych w kontekście kariery

ZASADY:
- Zawsze myśl z perspektywy rozwoju zawodowego
- Identyfikuj możliwości i szanse kariery
- Podawaj konkretne, praktyczne rekomendacje
- Odpowiadaj profesjonalnie ale przystępnie po polsku`;
        
        userPrompt = `📄 DOKUMENT DO ANALIZY ZAWODOWEJ:
**Nazwa:** "${metadata.title}"

**Zawartość:**
${documentContent.substring(0, 15000)}

**Metadata:**
${JSON.stringify(metadata, null, 2)}

---

💼 **PYTANIE DORADCZE:**
${prompt}

**ZADANIE:** Przeanalizuj dokument z perspektywy doradcy zawodowego i udziel odpowiedzi skupiającej się na aspektach kariery i rozwoju zawodowego.`;
    }

    // Wywołanie API OpenAI z lepszym modelem dla doradztwa zawodowego
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06", // Lepszy model dla bardziej dokładnego doradztwa
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7, // Optymalna temperatura dla doradztwa zawodowego
      max_tokens: 1200, // Więcej tokenów dla szczegółowych porad
    });

    // Zwróć odpowiedź z lepszym formatowaniem
    const aiResponse = response.choices[0]?.message?.content || 
                       'Przepraszam, nie udało się przeanalizować dokumentu. Jako doradca zawodowy polecam spróbować ponownie z bardziej szczegółowym pytaniem.';

    console.log(`✅ Doradca Zawodowy AI przeanalizował dokument typu: ${type}`);
    console.log(`📄 Dokument: ${metadata.title}`);
    console.log(`💬 Pytanie: ${prompt.substring(0, 100)}...`);
    console.log(`📝 Odpowiedź: ${aiResponse.length} znaków`);

    return NextResponse.json({ 
      response: aiResponse,
      analyzedDocument: {
        title: metadata.title,
        type: type,
        pages: metadata.pages,
        size: documentContent.length
      }
    });

  } catch (error) {
    console.error('❌ Błąd analizy dokumentu przez Doradcę Zawodowego AI:', error);
    
    // Bardziej szczegółowa obsługa błędów
    let errorMessage = 'Wystąpił problem podczas analizy dokumentu';
    
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        errorMessage = 'Przekroczono limit zapytań do AI. Spróbuj ponownie za chwilę.';
      } else if (error.message.includes('model')) {
        errorMessage = 'Problem z modelem AI. Spróbuj ponownie później.';
      } else if (error.message.includes('token')) {
        errorMessage = 'Dokument jest zbyt duży do analizy. Spróbuj z mniejszym fragmentem.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}