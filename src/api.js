export async function lookupBarcode(barcode) {
  const res = await fetch('https://world.openfoodfacts.org/api/v0/product/' + barcode + '.json');
  if (!res.ok) throw new Error('network error');
  const data = await res.json();
  if (data.status !== 1) return null;
  const p = data.product;
  const name = p.product_name_ja || p.product_name || p.generic_name || null;
  if (!name) return null;
  const cats = (p.categories_tags || []).join(' ');
  let category = '食料品その他';
  if (cats.includes('beverages') || cats.includes('drinks') || cats.includes('water')) category = '飲み物';
  else if (cats.includes('dairy') || cats.includes('milk') || cats.includes('cheese') || cats.includes('yogurt')) category = '乳製品';
  else if (cats.includes('meat') || cats.includes('fish') || cats.includes('seafood')) category = '肉・魚';
  else if (cats.includes('frozen')) category = '冷凍食品';
  else if (cats.includes('vegetables') || cats.includes('fruits')) category = '野菜・果物';
  else if (cats.includes('sauce') || cats.includes('condiment') || cats.includes('spice')) category = '調味料';
  return { name: name.trim(), category, quantity: '1', unit: '個' };
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent';

function extractJSONArray(text) {
  if (!text) return null;
  try { const v = JSON.parse(text); if (Array.isArray(v)) return v; } catch (_) {}
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  try { const v = JSON.parse(stripped); if (Array.isArray(v)) return v; } catch (_) {}
  const m = stripped.match(/\[[\s\S]*\]/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  return null;
}

export async function analyzeReceipt(apiKey, base64Image, mimeType) {
  const prompt = 'このレシート画像から購入した商品を全て抽出してください。購入日も読み取れる場合はYYYY-MM-DD形式で。以下のJSON配列のみ返してください:\n[{"name":"商品名","quantity":"数量(数字のみ)","unit":"単位(個/本/袋/ml/g等、不明なら個)","purchaseDate":"YYYY-MM-DD または空文字","category":"カテゴリ名"}]\n商品が読み取れない場合は空配列 [] を返してください。';
  const res = await fetch(GEMINI_ENDPOINT + '?key=' + apiKey, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let msg = 'Gemini API error ' + res.status;
    try { const j = JSON.parse(errText); if (j?.error?.message) msg += ': ' + j.error.message; } catch (_) { if (errText) msg += ': ' + errText.slice(0, 160); }
    throw new Error(msg);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const arr = extractJSONArray(text);
  if (!arr) throw new Error('レスポンスを解析できませんでした');
  return arr;
}

export async function estimateExpiry(apiKey, itemName, category) {
  if (!apiKey || !itemName) return null;
  const prompt = `食品・日用品の賞味期限・消費期限の目安を教えてください。\n品名：${itemName}\nカテゴリ：${category || ''}\n購入日から何日後が目安か、数字だけ返してください（例: 3）。期限がない/不明は 0。`;
  try {
    const res = await fetch(GEMINI_ENDPOINT + '?key=' + apiKey, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0 } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '0').trim();
    const days = parseInt(text.match(/\d+/)?.[0] || '0', 10);
    if (!days || days <= 0) return null;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  } catch { return null; }
}
