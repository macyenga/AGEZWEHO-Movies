import { GoogleGenAI, Type } from '@google/genai';
import { mergeTranslatedCues } from '../subtitles.js';

const TRANSLATOR_MODEL = 'gemini-4-hydrogen';

function getGeminiClient() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    const err = new Error(
      'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to enable AI Kinyarwanda subtitle translation.'
    );
    err.statusCode = 503;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function translateCuesToKinyarwanda({
  cues,
  movieTitle = '',
  sourceLanguage = 'English',
} = {}) {
  if (!Array.isArray(cues) || cues.length === 0) {
    const err = new Error('At least one subtitle cue is required to translate.');
    err.statusCode = 400;
    throw err;
  }

  if (cues.length > 100) {
    const err = new Error('Translation batch size cannot exceed 100 cues per request.');
    err.statusCode = 400;
    throw err;
  }

  const ai = getGeminiClient();

  const compactInput = cues.map((cue) => ({
    index: Number(cue.index),
    text: String(cue.text || '').trim(),
  }));

  const contextLabel = movieTitle ? ` for the film/series "${movieTitle}"` : '';

  const prompt = [
    `Translate these ${sourceLanguage} movie subtitle lines${contextLabel} into natural, idiomatic Kinyarwanda used by Rwandan cinema audiences.`,
    'Rules:',
    '- Return one object per cue matching its exact integer index.',
    '- Keep proper names, numbers, and line breaks concise so subtitles fit cleanly on screen.',
    '- Do not include timestamps or commentary in translatedText.',
    '',
    JSON.stringify(compactInput),
  ].join('\n');

  try {
    const response = await ai.models.generateContent({
      model: TRANSLATOR_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert Kinyarwanda audiovisual subtitle translator for Rwandan cinema (Agasobanuye). Output strictly valid JSON matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: {
                type: Type.INTEGER,
                description: 'The exact cue index from the input array.',
              },
              translatedText: {
                type: Type.STRING,
                description: 'The natural Kinyarwanda translation of the cue dialogue.',
              },
            },
            required: ['index', 'translatedText'],
          },
        },
      },
    });

    const jsonStr = (response.text ?? '[]').trim();
    const parsed = JSON.parse(jsonStr);
    const merged = mergeTranslatedCues(cues, parsed);

    return {
      cues: merged,
      model: TRANSLATOR_MODEL,
      translatedCount: merged.length,
    };
  } catch (error) {
    const status = error?.status || error?.statusCode;
    let message = error?.message || 'Gemini translation failed';

    if (typeof message === 'string' && message.trim().startsWith('{')) {
      try {
        const parsedErr = JSON.parse(message);
        if (parsedErr?.error?.message) {
          message = parsedErr.error.message;
        }
      } catch {
        // keep original message
      }
    }

    if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(message)) {
      message = 'Gemini API key is invalid or not yet configured. Check GEMINI_API_KEY in Settings > Secrets to enable AI Kinyarwanda translation.';
    } else if (status === 403 || /PERMISSION_DENIED/i.test(message)) {
      message = 'Gemini API access denied. Verify GEMINI_API_KEY permissions in Settings > Secrets.';
    } else if (status === 429 || /RESOURCE_EXHAUSTED/i.test(message)) {
      message = 'Gemini API rate limit reached. Wait a moment or check your quota in Settings > Secrets.';
    }

    const wrapped = new Error(message);
    if (status === 403 || /PERMISSION_DENIED/i.test(error?.message || '')) {
      wrapped.statusCode = 403;
    } else if (status === 429 || /RESOURCE_EXHAUSTED/i.test(error?.message || '')) {
      wrapped.statusCode = 429;
    } else if (status === 400 || /API_KEY_INVALID/i.test(error?.message || '')) {
      wrapped.statusCode = 400;
    } else if (status === 404 || /NOT_FOUND/i.test(error?.message || '')) {
      wrapped.statusCode = 404;
    } else {
      wrapped.statusCode = Number.isInteger(status) ? status : 502;
    }
    throw wrapped;
  }
}
