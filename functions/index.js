const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

const ANTHROPIC_KEY = defineSecret('ANTHROPIC_KEY');

// ─── AI CHAT (antrenare strategie) ───────────────────────────────────────────
exports.aiChat = onCall(
  { secrets: [ANTHROPIC_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required');

    const { messages, systemPrompt } = request.data;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY.value(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt || 'Esti un trading coach expert in Forex. Inveti strategia utilizatorului si o memorezi.',
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new HttpsError('internal', `Anthropic error: ${err}`);
    }

    const data = await response.json();
    return { reply: data.content[0].text };
  }
);

// ─── GENERARE SEMNAL ─────────────────────────────────────────────────────────
exports.generateSignal = onCall(
  { secrets: [ANTHROPIC_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required');

    const { pair, timeframe, strategyContext, checklistItems } = request.data;

    const checklistText = checklistItems
      .map((item) => `- ${item.section} | ${item.name} | Weight: ${item.weight}% | Bonus: ${item.isBonus}`)
      .join('\n');

    const systemPrompt = `Esti un trading coach expert in Forex care analizeaza setup-uri folosind strict strategia invatata de la utilizator.
Strategia utilizatorului:
${strategyContext}

Checklist-ul aplicatiei (sectiuni si conditii):
${checklistText}

Raspunde DOAR in format JSON valid, fara text inainte sau dupa, exact asa:
{
  "isValidSetup": true/false,
  "setupStrength": "Strong" / "Good" / "Weak" / "Invalid",
  "score": <numar 0-100>,
  "entry": "<pret sau descriere nivel>",
  "stopLoss": "<pret sau descriere nivel>",
  "takeProfit": "<pret sau descriere nivel>",
  "riskReward": "<ex: 1:2.5>",
  "checkedItems": ["Weekly-Exhaustion", "Daily-At S/R", ...],
  "reasoning": "<explicatie scurta de 2-3 fraze de ce e valid sau nu>",
  "confluences": ["confluenta 1", "confluenta 2", ...]
}`;

    const userMessage = `Analizeaza urmatorul setup:
Pair: ${pair}
Timeframe principal: ${timeframe}

Pe baza strategiei mele, este acesta un setup valid? Completeaza checklist-ul, da-mi entry, SL, TP si explica-mi.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY.value(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new HttpsError('internal', `Anthropic error: ${err}`);
    }

    const data = await response.json();
    const raw = data.content[0].text;

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return parsed;
    } catch (e) {
      throw new HttpsError('internal', 'AI response parse error: ' + raw);
    }
  }
);