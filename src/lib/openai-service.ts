// src/lib/openai-service.ts - DORADCA ZAWODOWY AI
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';

// Konfiguracja OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Funkcja do sprawdzania, czy zapytanie może wymagać wyszukiwania w sieci
 */
function shouldSearchWeb(query: string): boolean {
  console.log(`🔍 Sprawdzanie czy zapytanie wymaga wyszukiwania: "${query}"`);
  
  // Wzorce dla zapytań dotyczących doradztwa zawodowego, które mogą wymagać aktualnych informacji
  const searchPatterns = [
    // Aktualne informacje rynkowe
    /\b(aktualne|najnowsze|ostatnie|bieżące|teraz|dziś|wczoraj|2024|2025)\b/i,
    /\b(trendy|prognozy|perspektywy|rozwój)\b.*\b(zawodowe|kariery|rynku pracy|branży)\b/i,
    
    // Wyszukiwanie ofert i możliwości
    /\b(oferty|ogłoszenia|praca|zatrudnienie|staż|praktyki)\b/i,
    /\b(wyszukaj|znajdź|szukaj|poszukaj|sprawdź|zobacz|dowiedz się)\b/i,
    
    // Informacje o uczelniach i szkołach
    /\b(uczelnia|uniwersytet|politechnika|szkoła|studia|kierunki)\b/i,
    /\b(rekrutacja|nabór|egzaminy|terminy)\b/i,
    
    // Kursy i szkolenia
    /\b(kurs|szkolenie|certyfikat|kwalifikacje|uprawnienia)\b/i,
    
    // Zarobki i wynagrodzenia
    /\b(zarobki|wynagrodzenie|pensja|płaca|średnie|stawki)\b/i,
    
    // Firmy i pracodawcy
    /\b(pracodawca|firma|spółka|koncern|przedsiębiorstwo)\b/i,
    /\b(strona|witryna|www|http|link|url|kontakt|adres|telefon|email)\b/i,
    
    // Przepisy i regulacje zawodowe
    /\b(regulacje|przepisy|prawo|kodeks|ustawa|rozporządzenie)\b.*\b(zawodowe|pracy)\b/i,
    
    // Wydarzenia branżowe
    /\b(targi|konferencja|spotkanie|wydarzenia|networking)\b/i
  ];
  
  // Sprawdź, czy zapytanie zawiera URL
  const urlPattern = /https?:\/\/[^\s]+/i;
  if (urlPattern.test(query)) {
    console.log("✅ Znaleziono URL w zapytaniu - wymaga wyszukiwania");
    return true;
  }
  
  // Sprawdź wzorce
  const matchesPattern = searchPatterns.some(pattern => {
    const matches = pattern.test(query);
    if (matches) {
      console.log(`✅ Zapytanie pasuje do wzorca: ${pattern.source}`);
    }
    return matches;
  });
  
  // Specjalne frazy dla doradztwa zawodowego
  const careerAdvisoryPhrases = [
    'ile zarabia',
    'jakie są zarobki',
    'perspektywy zawodowe',
    'jak zostać',
    'gdzie pracować',
    'jakie kursy',
    'które studia wybrać',
    'najlepsze uczelnie',
    'aktualny rynek pracy',
    'poszukiwane zawody',
    'deficytowe zawody'
  ];
  
  const matchesCareerPhrase = careerAdvisoryPhrases.some(phrase => {
    const matches = query.toLowerCase().includes(phrase);
    if (matches) {
      console.log(`✅ Zapytanie zawiera frazę doradczą: "${phrase}"`);
    }
    return matches;
  });
  
  const shouldSearch = matchesPattern || matchesCareerPhrase;
  console.log(`${shouldSearch ? '✅' : '❌'} Wynik analizy: ${shouldSearch ? 'WYMAGA' : 'NIE WYMAGA'} wyszukiwania`);
  
  return shouldSearch;
}

/**
 * Funkcja pomocnicza do poprawy formatowania Markdown
 */
function improveMarkdownFormatting(markdown: string): string {
  let improved = markdown;

  // Zapewniamy prawidłowe formatowanie list
  improved = improved.replace(/(\d+\. [^\n]+)(?=\d+\.)/g, '$1\n');
  improved = improved.replace(/(- [^\n]+)(?=- )/g, '$1\n');
  
  // Prawidłowe nagłówki
  improved = improved.replace(/([^\n])(\n#{1,3} )/g, '$1\n$2');
  improved = improved.replace(/(#{1,3} [^\n]+)(\n[^#\n])/g, '$1\n$2');
  
  // Popraw numerowanie list
  improved = improved.replace(/^(\d+)([^\.\s])/gm, '$1. $2');
  
  // Popraw punktowanie list
  improved = improved.replace(/^(\*|\+)(?!\*)\s*/gm, '- ');
  
  return improved;
}

/**
 * ✅ GŁÓWNA funkcja do pobierania odpowiedzi od OpenAI dla Doradcy Zawodowego
 */
export async function getOpenAIResponseWithWebSearch(
  prompt: string, 
  documentIds: string[] = [],
  enableWebSearch: boolean = true
): Promise<string> {
  try {
    console.log("🤖 === START Doradca Zawodowy AI Response ===");
    console.log(`📝 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    console.log(`🌐 WebSearch enabled: ${enableWebSearch}`);
    
    // Sprawdź potrzebę wyszukiwania dla tematyki zawodowej
    const shouldUseWebSearch = enableWebSearch && shouldSearchWeb(prompt);
    console.log(`🔍 Czy użyć wyszukiwania: ${shouldUseWebSearch}`);

    // ✅ ZAKTUALIZOWANY system prompt dla Doradcy Zawodowego AI
    const systemPrompt = `Jesteś profesjonalnym doradcą zawodowym AI o nazwie "Doradca Zawodowy AI". Twoja specjalizacja to pomoc w planowaniu kariery i rozwoju zawodowym.

TWOJE GŁÓWNE KOMPETENCJE:
- 🎯 Analiza predyspozycji i talentów zawodowych
- 📊 Rekomendacje zawodów i ścieżek kariery
- 🎓 Doradztwo edukacyjne (studia, kursy, szkolenia)
- 💼 Przygotowanie do rozmów kwalifikacyjnych
- 📋 Pomoc w tworzeniu CV i listów motywacyjnych
- 💰 Informacje o rynku pracy i zarobkach
- 🏢 Analiza branż i sektorów gospodarki
- 📈 Planowanie rozwoju kariery

OBSZARY WIEDZY:
- Klasyfikacje zawodów i kompetencji
- System edukacji i kształcenia zawodowego
- Trendy na rynku pracy
- Wymagania różnych zawodów
- Ścieżki kariery w różnych branżach
- Metody rozwoju kompetencji

${enableWebSearch 
  ? `🌐 DOSTĘP DO INTERNETU: WŁĄCZONY
Masz dostęp do aktualnych danych o rynku pracy, ofertach, trendach zawodowych i informacji edukacyjnych.`
  : `🌐 DOSTĘP DO INTERNETU: WYŁĄCZONY
Korzystasz z własnej wiedzy o zawodach i rynku pracy.`}

ZASADY ODPOWIADANIA:
- Zawsze myśl z perspektywy rozwoju kariery użytkownika
- Dostarczaj konkretne, praktyczne porady
- Uwzględniaj aktualne trendy rynkowe
- Proponuj konkretne kroki do podjęcia
- Bądź pozytywny i motywujący
- Jeśli nie znasz konkretnych danych, powiedz to szczerze

FORMATOWANIE (Markdown):
1. Używaj nagłówków: ## dla głównych sekcji, ### dla podsekcji
2. Listy punktowane: - nowe linie
3. Listy numerowane: 1., 2., itd.
4. **Pogrubienia** dla kluczowych terminów
5. Wydzielaj sekcje pustymi liniami
${enableWebSearch ? '6. Zawsze podawaj źródła aktualnych informacji' : ''}

STRUKTURA ODPOWIEDZI (gdy to możliwe):
1. **Krótka ocena sytuacji**
2. **Konkretne rekomendacje**
3. **Następne kroki do podjęcia**
4. **Dodatkowe zasoby/informacje**`;
    
    // ✅ Wykonaj wyszukiwanie jeśli potrzebne
    let searchResults = "";
    if (shouldUseWebSearch) {
      console.log("🔍 Wykonuję wyszukiwanie zawodowe...");
      
      try {
        const searchData = await performSearch(prompt);
        
        if (searchData.results && searchData.results.length > 0) {
          searchResults = `\n\n🌐 AKTUALNE INFORMACJE Z INTERNETU dla "${searchData.query}":\n\n`;
          
          searchData.results.forEach((result: any, index: number) => {
            searchResults += `${index + 1}. **${result.title}**\n`;
            searchResults += `   URL: ${result.url}\n`;
            searchResults += `   Opis: ${result.snippet}\n`;
            if (result.published) {
              searchResults += `   Data: ${result.published}\n`;
            }
            searchResults += `\n`;
          });
          
          console.log(`✅ Dodano ${searchData.results.length} wyników wyszukiwania`);
        } else if (searchData.error) {
          searchResults = `\n\n⚠️ Błąd wyszukiwania: ${searchData.error}\n`;
          console.log(`❌ Błąd wyszukiwania: ${searchData.error}`);
        }
      } catch (searchError) {
        console.error(`❌ Błąd wyszukiwania:`, searchError);
        searchResults = `\n\n⚠️ Nie udało się uzyskać aktualnych danych z internetu.\n`;
      }
    }

    // ✅ Stwórz finalny prompt z kontekstem zawodowym
    let finalPrompt = `💼 PYTANIE DOTYCZĄCE KARIERY I ROZWOJU ZAWODOWEGO:
${prompt}`;

    if (searchResults) {
      finalPrompt += searchResults;
    }

    finalPrompt += `\n\n📋 INSTRUKCJA:
Odpowiedz jako profesjonalny doradca zawodowy, skupiając się na praktycznych poradach dotyczących kariery i rozwoju zawodowego. Użyj swojej wiedzy o zawodach, rynku pracy i trendach branżowych.`;

    console.log(`📝 Wysyłam zapytanie do OpenAI (${finalPrompt.length} znaków)`);

    // ✅ Wywołanie OpenAI z odpowiednimi parametrami
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: finalPrompt }
      ],
      temperature: 0.7, // Nieco niższa temperatura dla bardziej konsekwentnych porad
      max_tokens: 4096
    });

    const rawResponse = response.choices[0]?.message?.content || "Przepraszam, nie udało się wygenerować odpowiedzi.";
    
    console.log(`✅ Otrzymano odpowiedź od Doradcy Zawodowego AI (${rawResponse.length} znaków)`);
    console.log("🤖 === END Doradca Zawodowy AI Response ===");
    
    return improveMarkdownFormatting(rawResponse);
    
  } catch (error) {
    console.error('❌ === BŁĄD Doradca Zawodowy AI ===');
    console.error('❌ Szczegóły:', error);
    
    return "Przepraszam, wystąpił błąd podczas analizowania Twojego pytania. Jako doradca zawodowy, polecam spróbować ponownie z bardziej szczegółowym opisem Twojej sytuacji zawodowej.";
  }
}

/**
 * Funkcja do pobierania odpowiedzi od OpenAI (backward compatibility)
 */
export async function getOpenAIResponseWithManualSearch(
  prompt: string,
  documentIds: string[] = [],
  enableWebSearch: boolean = true,
  forceManualSearch: boolean = false
): Promise<string> {
  // Przekieruj do głównej funkcji dla spójności
  return getOpenAIResponseWithWebSearch(prompt, documentIds, enableWebSearch);
}

/**
 * Funkcja do wykonania wyszukiwania w sieci
 */
async function performSearch(query: string): Promise<any> {
  try {
    console.log(`🔍 Wyszukiwanie zawodowe dla: "${query}"`);
    
    const response = await fetch('/api/web-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Błąd wyszukiwania: ${response.status} - ${errorData.error || 'Nieznany błąd'}`);
    }

    const searchData = await response.json();
    
    console.log(`✅ Znaleziono ${searchData.totalResults} wyników zawodowych`);
    
    return {
      query: searchData.query,
      results: searchData.results || [],
      totalResults: searchData.totalResults || 0,
      source: searchData.source || 'unknown'
    };
    
  } catch (error) {
    console.error("❌ Błąd wyszukiwania zawodowego:", error);
    
    return {
      query,
      results: [],
      totalResults: 0,
      error: error instanceof Error ? error.message : "Nie udało się wykonać wyszukiwania",
      source: 'error'
    };
  }
}

/**
 * Funkcja do analizy tekstu wyekstrahowanego z PDF (CV, certyfikaty itp.)
 */
export async function analyzePdfWithOpenAI(
  pdfText: string, 
  pdfMetadata: any, 
  query: string, 
  documentIds: string[] = [],
  enableWebSearch: boolean = true
): Promise<string> {
  try {
    const context = `
## 📄 Analizowany dokument:
**Tytuł:** ${pdfMetadata.title || 'Dokument PDF'}
**Strony:** ${pdfMetadata.pages || 'Nieznana'}

### Zawartość dokumentu:
${pdfText.substring(0, 3000)}${pdfText.length > 3000 ? '...' : ''}

---

## 💼 Pytanie doradcze:
${query}

## 📋 Zadanie:
Jako doradca zawodowy, przeanalizuj powyższy dokument w kontekście zadanego pytania. Skup się na aspektach związanych z rozwojem kariery, kompetencjami zawodowymi i możliwościami rozwoju.`;
    
    return await getOpenAIResponseWithWebSearch(context, documentIds, enableWebSearch);
    
  } catch (error) {
    console.error('Błąd podczas analizy PDF przez doradcę zawodowego:', error);
    return "Przepraszam, wystąpił błąd podczas analizy dokumentu. Jako doradca zawodowy polecam przesłać dokument ponownie lub zadać pytanie w inny sposób.";
  }
}

/**
 * Funkcja do analizy danych Excel (np. dane o zarobkach, statystyki branżowe)
 */
export async function analyzeExcelWithOpenAI(
  excelText: string, 
  excelMetadata: any, 
  query: string,
  documentIds: string[] = [],
  enableWebSearch: boolean = true
): Promise<string> {
  try {
    const context = `
## 📊 Analizowany arkusz danych:
**Nazwa:** ${excelMetadata.title || 'Arkusz Excel'}
**Arkusze:** ${excelMetadata.sheetCount || 'Nieznana'}
**Wiersze:** ${excelMetadata.totalRows || 'Nieznana'}
**Kolumny:** ${excelMetadata.totalColumns || 'Nieznana'}

### Dane do analizy:
\`\`\`
${excelText.substring(0, 3000)}${excelText.length > 3000 ? '...' : ''}
\`\`\`

---

## 💼 Pytanie doradcze:
${query}

## 📋 Zadanie:
Jako doradca zawodowy, przeanalizuj powyższe dane w kontekście kariery i rynku pracy. Skup się na:
- Trendach zawodowych widocznych w danych
- Możliwościach rozwoju kariery
- Perspektywach zarobkowych
- Rekomendacjach dla planowania kariery`;
    
    return await getOpenAIResponseWithWebSearch(context, documentIds, enableWebSearch);
    
  } catch (error) {
    console.error('Błąd podczas analizy Excel przez doradcę zawodowego:', error);
    return "Przepraszam, wystąpił błąd podczas analizy danych. Jako doradca zawodowy polecam sprawdzić format danych i spróbować ponownie.";
  }
}

/**
 * Funkcja do generowania dokumentów związanych z karierą (CV, listy motywacyjne, plany rozwoju)
 */
export async function generateCareerDocument(
  prompt: string,
  chatId: string,
  documentType: 'cv' | 'cover-letter' | 'career-plan' | 'general',
  documentTitle?: string
): Promise<{ message: string; pdfUrl: string; documentId?: string }> {
  try {
    // Dostosuj prompt do typu dokumentu zawodowego
    let enhancedPrompt = prompt;
    
    switch (documentType) {
      case 'cv':
        enhancedPrompt = `Jako doradca zawodowy, wygeneruj profesjonalne CV na podstawie: ${prompt}. 
        Użyj standardowej struktury CV z sekcjami: dane osobowe, cel zawodowy, doświadczenie, wykształcenie, umiejętności, certyfikaty.`;
        break;
      case 'cover-letter':
        enhancedPrompt = `Jako doradca zawodowy, napisz profesjonalny list motywacyjny na podstawie: ${prompt}. 
        Skup się na motywacji, dopasowaniu kompetencji i wartości dodanej dla pracodawcy.`;
        break;
      case 'career-plan':
        enhancedPrompt = `Jako doradca zawodowy, przygotuj szczegółowy plan rozwoju kariery na podstawie: ${prompt}. 
        Uwzględnij krótko-, średnio- i długoterminowe cele, potrzebne kompetencje i kroki rozwojowe.`;
        break;
      default:
        enhancedPrompt = `Jako doradca zawodowy, przygotuj dokument związany z rozwojem kariery na podstawie: ${prompt}`;
    }
    
    // Wygeneruj zawartość dokumentu
    const documentContent = await getOpenAIResponseWithWebSearch(enhancedPrompt, [], true);
    
    // Określ tytuł dokumentu
    const title = documentTitle || `${getDocumentTypeName(documentType)}: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
    
    // Wyślij do generowania PDF
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content: documentContent,
        chatId,
        addToChat: true
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Problem z generowaniem dokumentu. Status: ${response.status}`);
    }
    
    const documentId = response.headers.get('Document-Id') || undefined;
    const blob = await response.blob();
    const pdfUrl = URL.createObjectURL(blob);
    
    return {
      message: `✅ Wygenerowałem dla Ciebie dokument "${title}". Możesz go pobrać lub przeglądać bezpośrednio.`,
      pdfUrl,
      documentId
    };
    
  } catch (error) {
    console.error('Błąd podczas generowania dokumentu zawodowego:', error);
    return {
      message: "Przepraszam, wystąpił problem podczas tworzenia dokumentu. Jako doradca zawodowy polecam spróbować z bardziej szczegółowym opisem.",
      pdfUrl: ""
    };
  }
}

/**
 * Funkcja pomocnicza do określenia nazwy typu dokumentu
 */
function getDocumentTypeName(type: string): string {
  switch (type) {
    case 'cv': return 'CV';
    case 'cover-letter': return 'List motywacyjny';
    case 'career-plan': return 'Plan rozwoju kariery';
    default: return 'Dokument zawodowy';
  }
}

/**
 * Funkcja do obsługi żądań generowania dokumentów zawodowych
 */
export async function handleDocumentGeneration(
  prompt: string,
  chatId: string
): Promise<{ text: string; pdfUrl?: string; documentId?: string }> {
  
  // Wzorce dla dokumentów związanych z karierą
  const careerDocumentPatterns = [
    // CV i życiorys
    /(?:wygeneruj|stwórz|przygotuj|napisz)\s+(?:dla\s+mnie\s+)?(?:cv|życiorys|curriculum vitae)/i,
    /(?:potrzebuję|chciałbym|poproszę o)\s+(?:cv|życiorys)/i,
    
    // List motywacyjny
    /(?:napisz|stwórz|przygotuj)\s+(?:dla\s+mnie\s+)?(?:list motywacyjny|list przewodni|cover letter)/i,
    /(?:potrzebuję|chciałbym)\s+(?:list motywacyjny|list przewodni)/i,
    
    // Plan rozwoju kariery
    /(?:stwórz|przygotuj|wygeneruj)\s+(?:dla\s+mnie\s+)?(?:plan rozwoju|plan kariery|ścieżkę rozwoju)/i,
    /(?:pomóż mi zaplanować|zaplanuj)\s+(?:karierę|rozwój zawodowy)/i,
    
    // Ogólne dokumenty zawodowe
    /(?:wygeneruj|stwórz|przygotuj)\s+(?:dokument|raport|analizę)\s+(?:zawodowy|kariery|rozwoju)/i,
    /(?:analiza|ocena)\s+(?:kompetencji|predyspozycji|kariery)/i,
    
    // Portfolio zawodowe
    /(?:stwórz|przygotuj)\s+(?:portfolio|prezentację)\s+zawodowe/i
  ];
  
  // Sprawdź, czy to żądanie dokumentu zawodowego
  const isCareerDocumentRequest = careerDocumentPatterns.some(pattern => pattern.test(prompt));
  
  if (!isCareerDocumentRequest) {
    return { text: "" };
  }
  
  console.log("Wykryto żądanie dokumentu zawodowego:", prompt);
  
  // Określ typ dokumentu
  let documentType: 'cv' | 'cover-letter' | 'career-plan' | 'general' = 'general';
  
  if (/\b(cv|życiorys|curriculum vitae)\b/i.test(prompt)) {
    documentType = 'cv';
  } else if (/\b(list motywacyjny|list przewodni|cover letter)\b/i.test(prompt)) {
    documentType = 'cover-letter';
  } else if (/\b(plan rozwoju|plan kariery|ścieżkę rozwoju)\b/i.test(prompt)) {
    documentType = 'career-plan';
  }
  
  // Ekstrahuj tytuł jeśli podany
  const titleMatch = prompt.match(/z tytułem [\"\'](.*?)[\"\']/i) || 
                    prompt.match(/zatytułowany [\"\'](.*?)[\"\']/i);
  const documentTitle = titleMatch ? titleMatch[1] : undefined;
  
  // Oczyść prompt z instrukcji generowania
  const cleanPrompt = prompt
    .replace(/(?:wygeneruj|stwórz|przygotuj|napisz|poproszę o|potrzebuję|chciałbym).*?(?:cv|życiorys|list motywacyjny|plan rozwoju|dokument)/gi, '')
    .replace(/z tytułem [\"\'](.*?)[\"\']|zatytułowany [\"\'](.*?)[\"\']/gi, '')
    .trim();
  
  // Wygeneruj dokument zawodowy
  const result = await generateCareerDocument(
    cleanPrompt || prompt, 
    chatId, 
    documentType, 
    documentTitle
  );
  
  return {
    text: result.message,
    pdfUrl: result.pdfUrl,
    documentId: result.documentId
  };
}

// Eksporty
export { 
  openai,
  shouldSearchWeb,
  improveMarkdownFormatting
};