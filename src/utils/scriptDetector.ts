/**
 * Utility functions for detecting script types and applying appropriate font classes
 */

export type ScriptType = 'devanagari' | 'kannada' | 'multilingual' | 'latin';

/**
 * Detects the script type of the given text
 */
export function detectScriptType(text: string): ScriptType {
  if (!text) return 'latin';

  // Count characters in different scripts
  let devanagariCount = 0;
  let kannadaCount = 0;
  let latinCount = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);
    
    // Devanagari Unicode range: U+0900-U+097F
    if (code >= 0x0900 && code <= 0x097F) {
      devanagariCount++;
    }
    // Kannada Unicode range: U+0C80-U+0CFF
    else if (code >= 0x0C80 && code <= 0x0CFF) {
      kannadaCount++;
    }
    // Latin Unicode ranges: Basic Latin (U+0000-U+007F) and Latin-1 Supplement (U+0080-U+00FF)
    else if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) {
      latinCount++;
    }
  }

  const totalScriptChars = devanagariCount + kannadaCount + latinCount;
  
  // If no script characters found, default to latin
  if (totalScriptChars === 0) return 'latin';

  // Determine primary script based on character count
  if (devanagariCount > 0 && kannadaCount > 0) {
    // Mixed scripts
    return 'multilingual';
  } else if (devanagariCount > latinCount && devanagariCount > kannadaCount) {
    return 'devanagari';
  } else if (kannadaCount > latinCount && kannadaCount > devanagariCount) {
    return 'kannada';
  } else if (devanagariCount > 0 || kannadaCount > 0) {
    // Has some Indian script characters mixed with latin
    return 'multilingual';
  } else {
    return 'latin';
  }
}

/**
 * Gets the appropriate CSS class for the detected script type
 */
export function getScriptFontClass(text: string): string {
  const scriptType = detectScriptType(text);
  
  switch (scriptType) {
    case 'devanagari':
      return 'text-devanagari';
    case 'kannada':
      return 'text-kannada';
    case 'multilingual':
      return 'text-multilingual';
    default:
      return ''; // Use default font for latin text
  }
}

/**
 * Gets the appropriate line height for the detected script type
 */
export function getScriptLineHeight(text: string): number {
  const scriptType = detectScriptType(text);
  
  switch (scriptType) {
    case 'devanagari':
      return 1.8; // Devanagari needs more vertical space
    case 'kannada':
      return 1.7; // Kannada also needs extra space
    case 'multilingual':
      return 1.7; // Mixed scripts need extra space
    default:
      return 1.15; // Default for Latin text
  }
}

/**
 * Applies the appropriate font class to a text element based on its content
 */
export function applyScriptFont(element: HTMLElement, text: string): void {
  // Remove any existing script font classes
  element.classList.remove('text-devanagari', 'text-kannada', 'text-multilingual');
  
  // Add the appropriate class for the current text
  const fontClass = getScriptFontClass(text);
  if (fontClass) {
    element.classList.add(fontClass);
  }
}