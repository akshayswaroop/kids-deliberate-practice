import type { Word } from './state';

// Raw Kannada word data with rich linguistic information and complexity levels
export const RAW_KANNADA_CARDS = [
  // Level 1: Simple 2-3 letter words without complex matras or conjuncts
  { id: "rama", wordKannada: "ರಾಮ", transliteration: "Rāma", transliterationHi: "राम", complexityLevel: 1 },
  { id: "nala", wordKannada: "ನಲ", transliteration: "Nala", transliterationHi: "नल", complexityLevel: 1 },
  { id: "nila", wordKannada: "ನೀಲ", transliteration: "Nīla", transliterationHi: "नील", complexityLevel: 1 },
  { id: "lava", wordKannada: "ಲವ", transliteration: "Lava", transliterationHi: "लव", complexityLevel: 1 },
  { id: "kusha", wordKannada: "ಕುಶ", transliteration: "Kusha", transliterationHi: "कुश", complexityLevel: 1 },
  { id: "tara", wordKannada: "ತಾರಾ", transliteration: "Tara", transliterationHi: "तारा", complexityLevel: 1 },
  { id: "din", wordKannada: "ದಿನ", transliteration: "Din", transliterationHi: "दिन", complexityLevel: 1 },
  { id: "kal", wordKannada: "ಕಲ", transliteration: "Kal", transliterationHi: "कल", complexityLevel: 1 },
  { id: "aaj", wordKannada: "ಆಜ", transliteration: "Āj", transliterationHi: "आज", complexityLevel: 1 },
  { id: "am", wordKannada: "ಆಮ", transliteration: "Ām", transliterationHi: "आम", complexityLevel: 1 },
  { id: "sebab", wordKannada: "ಸೇಬ", transliteration: "Seb", transliterationHi: "सेब", complexityLevel: 1 },
  { id: "lal", wordKannada: "ಲಾಲ", transliteration: "Lāl", transliterationHi: "लाल", complexityLevel: 1 },
  
  // Level 2: Simple words with basic matras
  { id: "seeta", wordKannada: "ಸೀತಾ", transliteration: "Sītā", transliterationHi: "सीता", complexityLevel: 2 },
  { id: "bharata", wordKannada: "ಭರತ", transliteration: "Bharata", transliterationHi: "भरत", complexityLevel: 2 },
  { id: "janaka", wordKannada: "ಜನಕ", transliteration: "Janaka", transliterationHi: "जनक", complexityLevel: 2 },
  { id: "hanuman", wordKannada: "ಹನುಮಾನ", transliteration: "Hanumān", transliterationHi: "हनुमान", complexityLevel: 2 },
  { id: "sugreeva", wordKannada: "ಸುಗ್ರೀವ", transliteration: "Sugrīva", transliterationHi: "सुग्रीव", complexityLevel: 2 },
  { id: "vali", wordKannada: "ವಾಲೀ", transliteration: "Vālī", transliterationHi: "वाली", complexityLevel: 2 },
  { id: "angada", wordKannada: "ಅಂಗದ", transliteration: "Aṅgada", transliterationHi: "अंगद", complexityLevel: 2 },
  { id: "ravana", wordKannada: "ರಾವಣ", transliteration: "Rāvaṇa", transliterationHi: "रावण", complexityLevel: 2 },
  { id: "narada", wordKannada: "ನಾರದ", transliteration: "Narada", transliterationHi: "नारद", complexityLevel: 2 },
  { id: "garuda", wordKannada: "ಗರುಡ", transliteration: "Garuda", transliterationHi: "गरुड़", complexityLevel: 2 },
  { id: "pani", wordKannada: "ಪಾನೀ", transliteration: "Pānī", transliterationHi: "पानी", complexityLevel: 2 },
  { id: "khana", wordKannada: "ಖಾನಾ", transliteration: "Khānā", transliterationHi: "खाना", complexityLevel: 2 },
  { id: "skool", wordKannada: "ಸ್ಕೂಲ", transliteration: "Skūl", transliterationHi: "स्कूल", complexityLevel: 2 },
  { id: "kitaab", wordKannada: "ಕಿತಾಬ", transliteration: "Kitāb", transliterationHi: "किताब", complexityLevel: 2 },
  { id: "dost", wordKannada: "ದೋಸ್ತ", transliteration: "Dost", transliterationHi: "दोस्त", complexityLevel: 2 },
  { id: "ghar", wordKannada: "ಘರ", transliteration: "Ghar", transliterationHi: "घर", complexityLevel: 2 },
  { id: "chai", wordKannada: "ಚಾಯ", transliteration: "Chāy", transliterationHi: "चाय", complexityLevel: 2 },
  { id: "aankh", wordKannada: "ಆಁಖ", transliteration: "Ā̃kh", transliterationHi: "आँख", complexityLevel: 2 },
  { id: "haath", wordKannada: "ಹಾಥ", transliteration: "Hāth", transliterationHi: "हाथ", complexityLevel: 2 },
  { id: "pair", wordKannada: "ಪೈರ", transliteration: "Pair", transliterationHi: "पैर", complexityLevel: 2 },
  { id: "kela", wordKannada: "ಕೇಲಾ", transliteration: "Kelā", transliterationHi: "केला", complexityLevel: 2 },
  { id: "angoor", wordKannada: "ಅಂಗೂರ", transliteration: "Angoor", transliterationHi: "अंगूर", complexityLevel: 2 },
  { id: "anar", wordKannada: "ಅನಾರ", transliteration: "Anār", transliterationHi: "अनार", complexityLevel: 2 },
  { id: "khara", wordKannada: "ಖರ", transliteration: "Khara", transliterationHi: "खर", complexityLevel: 2 },
  { id: "dilli", wordKannada: "ದಿಲ್ಲೀ", transliteration: "Dillī", transliterationHi: "दिल्ली", complexityLevel: 2 },
  { id: "mumbai", wordKannada: "ಮುಂಬಈ", transliteration: "Mumbaī", transliterationHi: "मुंबई", complexityLevel: 2 },
  { id: "kerala", wordKannada: "ಕೇರಲ", transliteration: "Kerala", transliterationHi: "केरल", complexityLevel: 2 },
  { id: "karnataka", wordKannada: "ಕರ್ನಾಟಕ", transliteration: "Karṇāṭaka", transliterationHi: "कर्नाटक", complexityLevel: 2 },
  { id: "gujarat", wordKannada: "ಗುಜರಾತ", transliteration: "Gujarāt", transliterationHi: "गुजरात", complexityLevel: 2 },
  { id: "punjab", wordKannada: "ಪಂಜಾಬ", transliteration: "Panjāb", transliterationHi: "पंजाब", complexityLevel: 2 },
  
  // Level 3: Words with conjuncts and complex matras  
  { id: "lakshmana", wordKannada: "ಲಕ್ಷ್ಮಣ", transliteration: "Lakṣmaṇa", transliterationHi: "लक्ष्मण", complexityLevel: 3 },
  { id: "shatrughna", wordKannada: "ಶತ್ರುಘ್ನ", transliteration: "Śatrughna", transliterationHi: "शत्रुघ्न", complexityLevel: 3 },
  { id: "dasharatha", wordKannada: "ದಶರಥ", transliteration: "Daśaratha", transliterationHi: "दशरथ", complexityLevel: 3 },
  { id: "kausalyaa", wordKannada: "ಕೌಸಲ್ಯಾ", transliteration: "Kausalyā", transliterationHi: "कौसल्या", complexityLevel: 3 },
  { id: "kaikeyii", wordKannada: "ಕೈಕೇಯೀ", transliteration: "Kaikeyī", transliterationHi: "कैकेयी", complexityLevel: 3 },
  { id: "sumitra", wordKannada: "ಸುಮಿತ್ರ", transliteration: "Sumitrā", transliterationHi: "सुमित्रा", complexityLevel: 3 },
  { id: "vishvamitra", wordKannada: "ವಿಶ್ವಾಮಿತ್ರ", transliteration: "Viśvāmitra", transliterationHi: "विश्वामित्र", complexityLevel: 3 },
  { id: "agastya", wordKannada: "ಅಗಸ್ತ್ಯ", transliteration: "Agastya", transliterationHi: "अगस्त्य", complexityLevel: 3 },
  { id: "jambavan", wordKannada: "ಜಾಂಬವಾನ್", transliteration: "Jāmbavān", transliterationHi: "जाम्भवान", complexityLevel: 3 },
  { id: "vibhishana", wordKannada: "ವಿಭೀಷಣ", transliteration: "Vibhīṣaṇa", transliterationHi: "विभीषण", complexityLevel: 3 },
  { id: "parivar", wordKannada: "ಪರಿವಾರ", transliteration: "Parivār", transliterationHi: "परिवार", complexityLevel: 3 },
  { id: "sarak", wordKannada: "ಸಡ಼ಕ", transliteration: "Saṛak", transliterationHi: "सड़क", complexityLevel: 3 },
  { id: "bazar", wordKannada: "ಬಾಜ಼ಾರ", transliteration: "Bāzār", transliterationHi: "बाज़ार", complexityLevel: 3 },
  { id: "aspatal", wordKannada: "ಅಸ್ಪತಾಲ", transliteration: "Aspatāl", transliterationHi: "अस्पताल", complexityLevel: 3 },
  { id: "mandir", wordKannada: "ಮಂದಿರ", transliteration: "Mandir", transliterationHi: "मंदिर", complexityLevel: 3 },
  { id: "naukri", wordKannada: "ನೌಕರೀ", transliteration: "Nauk­rī", transliterationHi: "नौकरी", complexityLevel: 3 },
  { id: "samay", wordKannada: "ಸಮಯ", transliteration: "Samay", transliterationHi: "समय", complexityLevel: 3 },
  { id: "raat", wordKannada: "ರಾತ", transliteration: "Rāt", transliterationHi: "रात", complexityLevel: 3 },
  { id: "nariyal", wordKannada: "ನಾರಿಯಲ", transliteration: "Nāriyal", transliterationHi: "नारियल", complexityLevel: 3 },
  { id: "ananas", wordKannada: "ಅನಾನಾಸ", transliteration: "Anānās", transliterationHi: "अनानास", complexityLevel: 3 },
  { id: "angutha", wordKannada: "ಅಂಗೂಠಾ", transliteration: "Angūṭhā", transliterationHi: "अंगूठा", complexityLevel: 3 },
  
  // Level 4: Complex words with multiple conjuncts and longer forms
  { id: "mandodari", wordKannada: "ಮಂದೋದರೀ", transliteration: "Mandodarī", transliterationHi: "मंदोदरी", complexityLevel: 4 },
  { id: "meghanada", wordKannada: "ಮೇಘನಾದ", transliteration: "Meghanāda", transliterationHi: "मेघनाद", complexityLevel: 4 },
  { id: "indrajit", wordKannada: "ಇಂದ್ರಜಿತ್", transliteration: "Indrajit", transliterationHi: "इंद्रजित", complexityLevel: 4 },
  { id: "kumbhakarna", wordKannada: "ಕುಂಭಕರ್ಣ", transliteration: "Kumbhakarṇa", transliterationHi: "कुंभकर्ण", complexityLevel: 4 },
  { id: "shurpanakha", wordKannada: "ಶೂರ್ಪಣಖಾ", transliteration: "Śūrpaṇakhā", transliterationHi: "शूर्पणखा", complexityLevel: 4 },
  { id: "maricha", wordKannada: "ಮಾರೀಚ", transliteration: "Mārīca", transliterationHi: "मारिच", complexityLevel: 4 },
  { id: "tadaka", wordKannada: "ತಾಡಕಾ", transliteration: "Tāḍakā", transliterationHi: "ताड़का", complexityLevel: 4 },
  { id: "ahilya", wordKannada: "ಅಹಿಲ್ಯಾ", transliteration: "Ahalyā", transliterationHi: "अहल्या", complexityLevel: 4 },
  { id: "gautama", wordKannada: "ಗೌತಮ", transliteration: "Gautama", transliterationHi: "गौतम", complexityLevel: 4 },
  { id: "jatayu", wordKannada: "ಜಟಾಯು", transliteration: "Jaṭāyu", transliterationHi: "जटायु", complexityLevel: 4 },
  { id: "sampati", wordKannada: "ಸಂಪಾತೀ", transliteration: "Sampātī", transliterationHi: "संपाती", complexityLevel: 4 },
  { id: "shrutakirti", wordKannada: "ಶ್ರುತಕೀರ್ತಿ", transliteration: "Shrutakirti", transliterationHi: "श्रुतकीर्ति", complexityLevel: 4 },
  { id: "vashistha", wordKannada: "ವಶಿಷ್ಠ", transliteration: "Vashistha", transliterationHi: "वशिष्ठ", complexityLevel: 4 },
  { id: "trishira", wordKannada: "ತ್ರಿಶಿರಾ", transliteration: "Trishira", transliterationHi: "त्रिशिरा", complexityLevel: 4 },
  { id: "chamakdar", wordKannada: "ಚಮಕದಾರ", transliteration: "Chamakdār", transliterationHi: "चमकदार", complexityLevel: 4 }
];

// Convert raw Kannada cards to Word objects
export function createKannadaWords(): Record<string, Word> {
  const words: Record<string, Word> = {};
  
  RAW_KANNADA_CARDS.forEach(card => {
    words[card.id] = {
      id: card.id,
      text: card.wordKannada, // Store actual Kannada script as primary text
      language: 'kannada',
      complexityLevel: card.complexityLevel,
      wordKannada: card.wordKannada,
      transliteration: card.transliteration,
      transliterationHi: card.transliterationHi,
      attempts: [],
      step: 0, // Start at step 0
      cooldownSessionsLeft: 0, // Start with no cooldown
    };
  });
  
  return words;
}