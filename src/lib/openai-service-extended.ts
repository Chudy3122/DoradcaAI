// src/lib/openai-service-extended.ts
import OpenAI from 'openai';
import { 
  openai, 
  improveMarkdownFormatting 
} from './openai-service';

// Typy dla procesu myślowego
export interface ReasoningStep {
  id: string;
  title: string;
  content: string;
  type: 'analysis' | 'planning' | 'execution' | 'verification';
}

export interface ExtendedResponse {
  response: string;
  reasoning?: {
    steps: ReasoningStep[];
    finalAnswer: string;
  };
}

/**
 * System prompt dla rozszerzonego myślenia w kontekście doradztwa zawodowego
 */
const getExtendedReasoningSystemPrompt = (enableWebSearch: boolean): string => {
  return `Jesteś zaawansowanym Doradcą Zawodowym AI z możliwością głębokiego myślenia analitycznego.

TRYB ROZSZERZONEGO MYŚLENIA:
Gdy użytkownik zadaje pytanie dotyczące kariery, najpierw przedstaw szczegółowy proces myślowy w strukturze JSON, a następnie podaj finalną poradę.

STRUKTURA PROCESU MYŚLOWEGO DLA DORADZTWA ZAWODOWEGO:
\`\`\`json
{
  "reasoning_process": {
    "steps": [
      {
        "id": "1",
        "title": "Analiza sytuacji zawodowej",
        "content": "Zrozumienie pytania użytkownika, identyfikacja kluczowych aspektów kariery",
        "type": "analysis"
      },
      {
        "id": "2", 
        "title": "Ocena możliwości i ścieżek",
        "content": "Określenie dostępnych opcji kariery, analizy mocnych stron i obszarów rozwoju",
        "type": "planning"
      },
      {
        "id": "3",
        "title": "Analiza rynku i trendów",
        "content": "Ocena aktualnej sytuacji na rynku pracy, perspektyw branżowych",
        "type": "execution"
      },
      {
        "id": "4",
        "title": "Synteza rekomendacji",
        "content": "Połączenie analizy w konkretne, praktyczne kroki rozwoju kariery",
        "type": "verification"
      }
    ]
  }
}
\`\`\`

TYPY KROKÓW MYŚLOWYCH:
- "analysis": Analiza sytuacji zawodowej, kompetencji, predyspozycji
- "planning": Planowanie ścieżek kariery, identyfikacja możliwości
- "execution": Analiza rynku pracy, trendów, wymagań zawodowych
- "verification": Weryfikacja i synteza w praktyczne rekomendacje

ZASADY PROCESU MYŚLOWEGO W DORADZTWIE:
1. Każdy krok powinien dotyczyć aspektów zawodowych
2. Używaj 3-6 kroków w zależności od złożoności sytuacji zawodowej
3. Analizuj kompetencje, możliwości, bariery i szanse
4. Uwzględniaj trendy rynkowe i wymagania pracodawców
5. Pokazuj logikę dochodzenia do rekomendacji zawodowych

OBSZARY ANALIZY:
🎯 Predyspozycje i talenty
📊 Kompetencje obecne vs wymagane
🎓 Potrzeby edukacyjne i rozwojowe
💼 Możliwości na rynku pracy
📈 Perspektywy rozwoju kariery
💰 Aspekty finansowe i benefity

${enableWebSearch 
  ? `🌐 DOSTĘP DO INTERNETU: Używaj aktualnych danych o rynku pracy, trendach, ofertach.`
  : `🌐 BRAK INTERNETU: Bazuj na swojej wiedzy o zawodach i rynku pracy.`}

FORMATOWANIE KOŃCOWEJ PORADY:
Po przedstawieniu procesu myślowego podaj praktyczne rekomendacje:
- **## Rekomendacje zawodowe**
- **### Następne kroki**
- **### Zasoby i możliwości**
- Używaj list punktowych (-) dla konkretnych działań
- **Pogrubienia** dla kluczowych pojęć zawodowych
- Tabele dla porównań opcji kariery

Twoja specjalizacja to profesjonalne doradztwo zawodowe i planowanie kariery.`;
};

/**
 * Parsowanie odpowiedzi z procesem myślowym
 */
function parseReasoningResponse(response: string): ExtendedResponse {
  try {
    // Szukaj bloku JSON z procesem myślowym
    const jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    
    if (!jsonMatch) {
      // Brak struktury JSON - zwróć standardową odpowiedź
      return {
        response: improveMarkdownFormatting(response)
      };
    }

    const jsonStr = jsonMatch[1];
    const reasoningData = JSON.parse(jsonStr);
    
    // Pobierz część odpowiedzi po bloku JSON
    const afterJsonIndex = response.indexOf('```', response.indexOf(jsonStr) + jsonStr.length) + 3;
    let finalAnswer = response.substring(afterJsonIndex).trim();
    
    // Jeśli brak finalnej odpowiedzi po JSON, użyj całej odpowiedzi
    if (!finalAnswer) {
      finalAnswer = response.replace(/```json[\s\S]*?```/g, '').trim();
    }

    // Walidacja struktury procesu myślowego
    if (!reasoningData.reasoning_process?.steps || !Array.isArray(reasoningData.reasoning_process.steps)) {
      console.warn("Nieprawidłowa struktura procesu myślowego, używam standardowej odpowiedzi");
      return {
        response: improveMarkdownFormatting(response)
      };
    }

    // Konwersja kroków do wymaganego formatu
    const steps: ReasoningStep[] = reasoningData.reasoning_process.steps.map((step: any, index: number) => ({
      id: step.id || String(index + 1),
      title: step.title || `Krok ${index + 1}`,
      content: step.content || "Brak treści",
      type: ['analysis', 'planning', 'execution', 'verification'].includes(step.type) 
        ? step.type 
        : 'analysis'
    }));

    return {
      response: improveMarkdownFormatting(finalAnswer),
      reasoning: {
        steps,
        finalAnswer: improveMarkdownFormatting(finalAnswer)
      }
    };

  } catch (error) {
    console.error("Błąd parsowania procesu myślowego:", error);
    // W przypadku błędu zwróć standardową odpowiedź
    return {
      response: improveMarkdownFormatting(response)
    };
  }
}

/**
 * Główna funkcja z rozszerzonym myśleniem dla doradztwa zawodowego
 */
export async function getOpenAIResponseWithExtendedReasoning(
  prompt: string,
  documentIds: string[] = [],
  enableWebSearch: boolean = true,
  enableExtendedReasoning: boolean = false
): Promise<ExtendedResponse> {
  try {
    console.log("🧠 === START Doradca Zawodowy - Rozszerzone Myślenie ===");
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    console.log(`🌐 WebSearch: ${enableWebSearch}`);
    console.log(`🧠 ExtendedReasoning: ${enableExtendedReasoning}`);

    // Przygotuj system prompt
    const systemPrompt = enableExtendedReasoning 
      ? getExtendedReasoningSystemPrompt(enableWebSearch)
      : getStandardCareerAdvisorPrompt(enableWebSearch);

    // Przygotuj prompt użytkownika z kontekstem zawodowym
    let userPromptWithContext = `💼 PYTANIE DOTYCZĄCE KARIERY I ROZWOJU ZAWODOWEGO:
${prompt}`;
    
    if (enableExtendedReasoning) {
      userPromptWithContext += `

📋 INSTRUKCJA:
Najpierw przedstaw szczegółowy proces myślowy w formacie JSON, analizując tę sytuację zawodową krok po kroku. Następnie podaj finalną poradę z konkretnymi rekomendacjami dla rozwoju kariery.`;
    } else {
      userPromptWithContext += `

📋 INSTRUKCJA:
Odpowiedz jako profesjonalny doradca zawodowy, skupiając się na praktycznych poradach dotyczących kariery i rozwoju zawodowego.`;
    }

    console.log(`📝 Wysyłam zapytanie do Doradcy Zawodowego AI (Extended: ${enableExtendedReasoning})`);

    // Wywołanie OpenAI z parametrami dostosowanymi do doradztwa
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptWithContext }
      ],
      temperature: enableExtendedReasoning ? 0.3 : 0.7, // Niższa temperatura dla analizy
      max_tokens: enableExtendedReasoning ? 6000 : 4096
    });

    const rawResponse = response.choices[0]?.message?.content || "Przepraszam, nie udało się przeanalizować Twojej sytuacji zawodowej.";
    
    console.log(`✅ Otrzymano odpowiedź od Doradcy Zawodowego AI (${rawResponse.length} znaków)`);

    // Parsuj odpowiedź w zależności od trybu
    if (enableExtendedReasoning) {
      const parsedResponse = parseReasoningResponse(rawResponse);
      console.log(`🧠 Proces myślowy zawodowy: ${parsedResponse.reasoning ? 'ZNALEZIONY' : 'BRAK'}`);
      if (parsedResponse.reasoning) {
        console.log(`🧠 Liczba kroków analizy: ${parsedResponse.reasoning.steps.length}`);
      }
      return parsedResponse;
    } else {
      return {
        response: improveMarkdownFormatting(rawResponse)
      };
    }

  } catch (error) {
    console.error('❌ === BŁĄD Doradca Zawodowy - Rozszerzone Myślenie ===');
    console.error('❌ Szczegóły:', error);
    
    return {
      response: "Przepraszam, wystąpił błąd podczas analizowania Twojej sytuacji zawodowej. Jako doradca zawodowy polecam spróbować ponownie z bardziej szczegółowym opisem."
    };
  }
}

/**
 * Standardowy system prompt dla doradcy zawodowego
 */
function getStandardCareerAdvisorPrompt(enableWebSearch: boolean): string {
  return `Jesteś profesjonalnym Doradcą Zawodowym AI specjalizującym się w planowaniu kariery i rozwoju zawodowym.

TWOJE GŁÓWNE KOMPETENCJE:
- 🎯 Analiza predyspozycji i talentów zawodowych
- 📊 Rekomendacje zawodów i ścieżek kariery  
- 🎓 Doradztwo edukacyjne (studia, kursy, szkolenia)
- 💼 Przygotowanie do rozmów kwalifikacyjnych
- 📋 Pomoc w tworzeniu CV i listów motywacyjnych
- 💰 Informacje o rynku pracy i zarobkach
- 🏢 Analiza branż i sektorów gospodarki
- 📈 Planowanie rozwoju kariery

${enableWebSearch 
  ? `🌐 DOSTĘP DO INTERNETU: Masz dostęp do aktualnych danych o rynku pracy i trendach zawodowych.`
  : `🌐 BRAK INTERNETU: Korzystasz z własnej wiedzy o zawodach i rynku pracy.`}

FORMATOWANIE ODPOWIEDZI (Markdown):
1. **## Nagłówki** dla głównych sekcji
2. **### Podsekcje** dla szczegółów
3. **- Listy punktowane** dla konkretnych działań
4. **1. Listy numerowane** dla kroków
5. **Pogrubienia** dla kluczowych terminów zawodowych

STRUKTURA PORAD (gdy możliwe):
1. **Ocena sytuacji**
2. **Rekomendacje zawodowe**  
3. **Następne kroki**
4. **Zasoby i możliwości**

ZASADY:
- Zawsze myśl z perspektywy rozwoju kariery
- Dostarczaj konkretne, praktyczne porady
- Uwzględniaj aktualne trendy rynkowe
- Bądź pozytywny i motywujący
- Jeśli nie znasz danych, powiedz szczerze`;
}

/**
 * Analiza PDF z rozszerzonym myśleniem zawodowym
 */
export async function analyzePdfWithExtendedReasoning(
  pdfText: string, 
  pdfMetadata: any, 
  query: string, 
  documentIds: string[] = [],
  enableWebSearch: boolean = true,
  enableExtendedReasoning: boolean = false
): Promise<ExtendedResponse> {
  try {
    const context = `📄 ANALIZA DOKUMENTU ZAWODOWEGO:

**Dokument:** ${pdfMetadata.title || 'Dokument PDF'}
**Strony:** ${pdfMetadata.pages || 'Nieznana liczba'}

**Zawartość do analizy:**
${pdfText.substring(0, 3000)}${pdfText.length > 3000 ? '...' : ''}

---

💼 **PYTANIE DORADCZE:**
${query}

📋 **ZADANIE:**
${enableExtendedReasoning 
  ? 'Przeanalizuj ten dokument pod kątem zawodowym używając głębokiego procesu myślowego. Najpierw przedstaw analizę w formacie JSON, następnie podaj praktyczne rekomendacje.'
  : 'Przeanalizuj dokument z perspektywy doradcy zawodowego i podaj praktyczne rekomendacje dla rozwoju kariery.'}`;
    
    return await getOpenAIResponseWithExtendedReasoning(
      context, 
      [], 
      enableWebSearch, 
      enableExtendedReasoning
    );
    
  } catch (error) {
    console.error('Błąd podczas analizy PDF przez doradcę zawodowego:', error);
    return {
      response: "Przepraszam, wystąpił błąd podczas analizy dokumentu. Jako doradca zawodowy polecam przesłać dokument ponownie lub zadać pytanie w inny sposób."
    };
  }
}

/**
 * Analiza Excel z rozszerzonym myśleniem zawodowym
 */
export async function analyzeExcelWithExtendedReasoning(
  excelText: string, 
  excelMetadata: any, 
  query: string,
  documentIds: string[] = [],
  enableWebSearch: boolean = true,
  enableExtendedReasoning: boolean = false
): Promise<ExtendedResponse> {
  try {
    const context = `📊 ANALIZA DANYCH ZAWODOWYCH:

**Arkusz:** ${excelMetadata.title || 'Arkusz Excel'}
**Arkusze:** ${excelMetadata.sheetCount || 'Nieznana liczba'}
**Wiersze:** ${excelMetadata.totalRows || 'Nieznana liczba'}
**Kolumny:** ${excelMetadata.totalColumns || 'Nieznana liczba'}

**Dane do analizy:**
\`\`\`
${excelText.substring(0, 3000)}${excelText.length > 3000 ? '...' : ''}
\`\`\`

---

💼 **PYTANIE DORADCZE:**
${query}

📋 **ZADANIE:**
${enableExtendedReasoning 
  ? 'Przeanalizuj te dane pod kątem trendów zawodowych i możliwości kariery używając głębokiego procesu myślowego. Przedstaw analizę w formacie JSON, następnie podaj praktyczne wnioski.'
  : 'Przeanalizuj dane z perspektywy rynku pracy i podaj praktyczne wnioski dla planowania kariery.'}

**Skup się na:**
- Trendach zawodowych widocznych w danych
- Możliwościach rozwoju kariery
- Perspektywach zarobkowych  
- Rekomendacjach dla planowania kariery`;
    
    return await getOpenAIResponseWithExtendedReasoning(
      context, 
      [], 
      enableWebSearch, 
      enableExtendedReasoning
    );
    
  } catch (error) {
    console.error('Błąd podczas analizy Excel przez doradcę zawodowego:', error);
    return {
      response: "Przepraszam, wystąpił błąd podczas analizy danych. Jako doradca zawodowy polecam sprawdzić format danych i spróbować ponownie."
    };
  }
}