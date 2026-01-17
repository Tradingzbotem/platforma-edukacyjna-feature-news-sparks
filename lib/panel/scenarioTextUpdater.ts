// lib/panel/scenarioTextUpdater.ts — funkcja do aktualizacji wartości cenowych w tekstach scenariuszy

/**
 * Znajduje i zamienia wartości cenowe w tekście scenariusza na zaktualizowane wartości
 * na podstawie aktualnej ceny i znormalizowanych poziomów
 */
export function updatePriceValuesInText(
  text: string,
  originalLevels: Array<string | number>,
  normalizedLevels: string[],
  decimals: number
): string {
  if (!text || originalLevels.length === 0 || normalizedLevels.length === 0) {
    return text;
  }

  // Mapuj oryginalne poziomy do znormalizowanych
  const replacements: Array<{ original: string; normalized: string; originalNum: number }> = [];
  
  for (let i = 0; i < originalLevels.length && i < normalizedLevels.length; i++) {
    const orig = String(originalLevels[i]).trim();
    const norm = normalizedLevels[i];
    
    // Parsuj oryginalną wartość liczbową
    const origNum = parseFloat(orig.replace(/[\s,\u00A0]/g, ''));
    if (!isFinite(origNum)) continue;
    
    // Format znormalizowanego poziomu (z przecinkami jako separatorami tysięcy)
    const normFormatted = formatLevelForText(norm, decimals);
    
    // Różne formaty oryginalnego poziomu do wyszukania w tekście
    const origVariants = [
      orig, // oryginalny format
      orig.replace(/\s+/g, ','), // spacje -> przecinki
      orig.replace(/,/g, ' '), // przecinki -> spacje
      orig.replace(/[\s,]/g, ''), // bez separatorów
      origNum.toString(), // jako liczba bez formatowania
      origNum.toLocaleString('pl-PL'), // format polski
      origNum.toLocaleString('en-US'), // format angielski
    ];
    
    // Usuń duplikaty
    const uniqueVariants = Array.from(new Set(origVariants));
    
    for (const variant of uniqueVariants) {
      if (variant) {
        replacements.push({
          original: variant,
          normalized: normFormatted,
          originalNum: origNum,
        });
      }
    }
  }

  // Sortuj od najdłuższych do najkrótszych, żeby najpierw zamieniać dłuższe dopasowania
  replacements.sort((a, b) => b.original.length - a.original.length);

  let updatedText = text;
  const usedReplacements = new Set<number>();
  
  // Najpierw stwórz mapę wartości numerycznych do znormalizowanych wartości
  const numToNormalized = new Map<number, string>();
  for (let i = 0; i < originalLevels.length && i < normalizedLevels.length; i++) {
    const orig = String(originalLevels[i]).trim();
    const norm = String(normalizedLevels[i]).trim();
    
    // Parsuj oryginalną wartość (usuń separatory tysięcy, zamień przecinek na kropkę)
    // Dla wartości całkowitych jak 2285, 2300 - parsuj bez separatorów
    const origCleaned = orig.replace(/[\s,\u00A0]/g, '').replace(',', '.');
    const origNum = parseFloat(origCleaned);
    
    if (isFinite(origNum)) {
      // Parsuj znormalizowaną wartość (może być w formacie "4545.00" lub "4,545.00" z en-US locale)
      // normalizeLevelsForPrice zwraca wartości w formacie en-US: "4545.00" (kropka jako separator dziesiętny)
      // lub "4,545.00" (przecinek jako separator tysięcy, kropka jako dziesiętny)
      let normCleaned = norm;
      
      // Jeśli zawiera kropkę jako separator dziesiętny (FX format lub en-US)
      if (norm.includes('.')) {
        // Format "4545.00" lub "4,545.00"
        // Usuń separatory tysięcy (przecinki/spacje przed kropką)
        normCleaned = norm.replace(/[\s,\u00A0](?=\d{3}\b)/g, '');
      } else if (norm.includes(',')) {
        // Format "4545,00" - przecinek to separator dziesiętny (polski format)
        normCleaned = norm.replace(/[\s,\u00A0](?=\d{3}\b)/g, '').replace(',', '.');
      } else {
        // Tylko liczby całkowite - usuń separatory tysięcy
        normCleaned = norm.replace(/[\s,\u00A0]/g, '');
      }
      
      const normNum = parseFloat(normCleaned);
      
      if (isFinite(normNum)) {
        // Formatuj znormalizowaną wartość dla tekstu
        const normFormatted = formatLevelForText(String(normNum), decimals);
        numToNormalized.set(origNum, normFormatted);
      }
    }
  }
  
  // Jeśli mapa jest pusta, nie ma co zamieniać
  if (numToNormalized.size === 0) {
    return text;
  }
  
  // Znajdź wszystkie liczby w tekście i zamień te, które pasują do poziomów
  // Używamy prostszego podejścia: najpierw znajdź wszystkie liczby, potem sprawdź czy pasują do poziomów
  // Regex znajdzie liczby całkowite (np. "2285") oraz liczby z miejscami po przecinku (np. "1.1050")
  const numberPattern = /\d+(?:[.,]\d+)?/g;
  
  // Przechowuj wszystkie dopasowania z ich pozycjami i zamianami
  const matches: Array<{ match: string; start: number; end: number; replacement: string }> = [];
  
  // Najpierw znajdź wszystkie dopasowania i określ ich zamiany
  let matchResult;
  const regex = new RegExp(numberPattern.source, numberPattern.flags);
  
  while ((matchResult = regex.exec(text)) !== null) {
    const match = matchResult[0];
    const offset = matchResult.index;
    
    // Parsuj znalezioną liczbę
    // Dla wartości całkowitych jak "2285" - parsuj bezpośrednio
    // Dla wartości z kropką/przecinkiem - usuń separatory tysięcy i zamień przecinek dziesiętny na kropkę
    let cleaned = match;
    
    // Jeśli liczba ma kropkę i nie ma przecinka, to kropka jest separatorem dziesiętnym (FX format)
    if (match.includes('.') && !match.includes(',')) {
      // Format "4545.00" - usuń tylko separatory tysięcy przed kropką (jeśli są)
      cleaned = match.replace(/[\s,\u00A0](?=\d{3}\b)/g, '');
    } else if (match.includes(',')) {
      // Format "4,545.00" lub "4545,00"
      const commaIndex = match.indexOf(',');
      const dotIndex = match.indexOf('.');
      
      if (dotIndex > commaIndex && dotIndex > 0) {
        // Format "4,545.00" - przecinek to separator tysięcy
        cleaned = match.replace(/[\s,\u00A0](?=\d{3}\b)/g, '');
      } else {
        // Format "4545,00" - przecinek to separator dziesiętny
        cleaned = match.replace(/[\s,\u00A0](?=\d{3}\b)/g, '').replace(',', '.');
      }
    } else {
      // Tylko liczby całkowite - usuń separatory tysięcy
      cleaned = match.replace(/[\s,\u00A0]/g, '');
    }
    
    const num = parseFloat(cleaned);
    
    if (!isFinite(num)) continue;
    
    // Sprawdź czy ta liczba odpowiada jednemu z poziomów
    let replacement: string | undefined = numToNormalized.get(num);
    
    if (!replacement) {
      // Jeśli nie znaleziono dokładnego dopasowania, sprawdź czy jest blisko (dla przypadków zaokrągleń)
      const isFX = decimals >= 3; // FX ma zwykle 3-5 miejsc po przecinku
      
      for (const [origNum, normVal] of numToNormalized.entries()) {
        const diff = Math.abs(num - origNum);
        // Dla wartości całkowitych (bez miejsc po przecinku) użyj większej tolerancji
        const tolerance = isFX 
          ? Math.max(origNum * 0.0001, 0.0001) // Dla FX: bardzo mała tolerancja
          : Math.max(origNum * 0.001, 1); // Dla innych: 0.1% lub 1 jednostka
        
        if (diff < tolerance) {
          replacement = normVal;
          break;
        }
      }
    }
    
    if (replacement) {
      matches.push({ match, start: offset, end: offset + match.length, replacement });
    }
  }
  
  // Sortuj od końca do początku, żeby zamieniać od tyłu (zachowuje pozycje)
  matches.sort((a, b) => b.start - a.start);
  
  // Zamień wszystkie dopasowania od końca do początku
  for (const { match, start, end, replacement } of matches) {
    // Sprawdź czy na tej pozycji nadal jest ta sama wartość (może być już zamieniona)
    if (updatedText.substring(start, end) === match) {
      updatedText = updatedText.substring(0, start) + replacement + updatedText.substring(end);
    }
  }

  return updatedText;
}

/**
 * Formatuje poziom dla tekstu (z przecinkami jako separatorami tysięcy)
 */
function formatLevelForText(level: string, decimals: number): string {
  const num = parseFloat(level.replace(/[\s,\u00A0]/g, '').replace(',', '.'));
  if (!isFinite(num)) return level;
  
  // Dla indeksów (decimals = 0) używamy przecinków jako separatorów tysięcy (np. 18,100)
  if (decimals === 0) {
    return num.toLocaleString('pl-PL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } 
  
  // Dla wartości z miejscami po przecinku (FX, towary)
  // W tekście scenariuszy często używane są wartości bez separatorów tysięcy dla wartości < 10000
  // (np. "2285" zamiast "2,285.00" dla złota)
  if (num < 10000) {
    // Formatuj bez separatorów tysięcy, tylko z odpowiednią liczbą miejsc po przecinku
    // Używamy przecinka jako separatora dziesiętnego (polski format)
    return num.toFixed(decimals).replace('.', ',');
  }
  
  // Dla większych wartości używamy separatorów tysięcy
  const parts = num.toFixed(decimals).split('.');
  const integerPart = parseInt(parts[0], 10).toLocaleString('pl-PL');
  return parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart;
}

/**
 * Escapuje specjalne znaki regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
