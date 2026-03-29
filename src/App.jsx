import { useState, useEffect, useRef } from 'react';

const KEYS = {
  USERS: 'fs-users',
  BOXES: 'fs-boxes',
  ITEMS: 'fs-items',
  SESSION: 'fs-session',
  APIKEY: 'fs-gemini-key',
};
const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'inv-salt-v1'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
const genId = () => crypto.getRandomValues(new Uint32Array(2)).reduce((a, b) => a + b.toString(36), '');
const genCode = () => Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(36).toUpperCase().padStart(2, '0')).join('-');
const today = () => new Date().toISOString().split('T')[0];

const FOOD_CATS = ['野菜・果物', '肉・魚', '乳製品', '飲み物', '調味料', '冷凍食品', '食料品その他'];
const SUPPLY_CATS = ['日用品', '洗剤・清掃', '衛生用品', '文房具', '電池・電球', '備品その他'];
const ALL_CATS = [...FOOD_CATS, ...SUPPLY_CATS];
const CAT_ICONS = {
  '野菜・果物':'🥦','肉・魚':'🥩','乳製品':'🥛','飲み物':'🧃','調味料':'🧂','冷凍食品':'🧊','食料品その他':'🍱',
  '日用品':'🧴','洗剤・清掃':'🧹','衛生用品':'🪥','文房具':'✏️','電池・電球':'🔋','備品その他':'📦',
};
const CAT_COLORS = {
  '野菜・果物':'#86efac','肉・魚':'#fca5a5','乳製品':'#fde68a','飲み物':'#93c5fd','調味料':'#d8b4fe','冷凍食品':'#a5f3fc','食料品その他':'#bbf7d0',
  '日用品':'#fdba74','洗剤・清掃':'#bef264','衛生用品':'#f9a8d4','文房具':'#fef08a','電池・電球':'#fde68a','備品その他':'#e2e8f0',
};

const BOX_SVG = {
  fridge: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><rect x="11" y="4" width="34" height="48" rx="9" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="2"/><rect x="11" y="4" width="34" height="20" rx="9" fill="#b2ebf2" stroke="#4dd0e1" stroke-width="2"/><line x1="11" y1="22" x2="45" y2="22" stroke="#4dd0e1" stroke-width="2"/><rect x="37" y="10" width="4" height="9" rx="2" fill="#00acc1"/><rect x="37" y="30" width="4" height="9" rx="2" fill="#00acc1"/></svg>',
  home: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><path d="M28 6L52 26H4L28 6Z" fill="#ffd8c8" stroke="#f4845f" stroke-width="2" stroke-linejoin="round"/><rect x="8" y="24" width="40" height="28" rx="6" fill="#ffe8dc" stroke="#f4845f" stroke-width="2"/><rect x="21" y="34" width="14" height="18" rx="5" fill="#ffb499" stroke="#f4845f" stroke-width="2"/><rect x="10" y="28" width="10" height="8" rx="3" fill="#fff" stroke="#f4845f" stroke-width="1.5"/><rect x="36" y="28" width="10" height="8" rx="3" fill="#fff" stroke="#f4845f" stroke-width="1.5"/></svg>',
  cart: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><path d="M6 22L13 44H43L50 22H6Z" fill="#dcfce7" stroke="#4ade80" stroke-width="2" stroke-linejoin="round"/><path d="M18 22C18 22 18 10 28 10C38 10 38 22 38 22" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="21" y1="29" x2="20" y2="42" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="29" x2="28" y2="42" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/><line x1="35" y1="29" x2="36" y2="42" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/></svg>',
  shelf: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><rect x="5" y="8" width="46" height="5" rx="2.5" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="5" y="25" width="46" height="5" rx="2.5" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="5" y="42" width="46" height="5" rx="2.5" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="5" y="8" width="5" height="39" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/><rect x="46" y="8" width="5" height="39" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/><rect x="13" y="50" width="5" height="7" rx="2" fill="#fde68a"/><rect x="38" y="50" width="5" height="7" rx="2" fill="#fde68a"/><circle cx="20" cy="19" r="4" fill="#fca5a5"/><rect x="29" y="15" width="9" height="9" rx="3" fill="#86efac"/><circle cx="20" cy="36" r="4" fill="#93c5fd"/><rect x="29" y="32" width="9" height="9" rx="3" fill="#d8b4fe"/></svg>',
  bath: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><path d="M8 38 L8 46 Q8 50 12 50 L44 50 Q48 50 48 46 L48 38 Z" fill="#dbeafe" stroke="#60a5fa" stroke-width="2.5" stroke-linejoin="round"/><line x1="6" y1="38" x2="50" y2="38" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="50" x2="14" y2="55" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><line x1="42" y1="50" x2="42" y2="55" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><path d="M36 6 Q46 6 46 18" stroke="#60a5fa" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="36" cy="6" rx="7" ry="4.5" fill="#bfdbfe" stroke="#60a5fa" stroke-width="2"/><circle cx="33" cy="6" r="1" fill="#60a5fa"/><circle cx="36" cy="6" r="1" fill="#60a5fa"/><circle cx="39" cy="6" r="1" fill="#60a5fa"/><line x1="29" y1="13" x2="26" y2="24" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="14" x2="30" y2="26" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="35" y1="14" x2="34" y2="27" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="13" x2="38" y2="26" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="41" y1="13" x2="42" y2="25" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><circle cx="26" cy="26" r="1.5" fill="#93c5fd"/><circle cx="30" cy="28" r="1.5" fill="#93c5fd"/><circle cx="34" cy="29" r="1.5" fill="#93c5fd"/><circle cx="38" cy="28" r="1.5" fill="#93c5fd"/><circle cx="42" cy="27" r="1.5" fill="#93c5fd"/></svg>',
  medicine: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><rect x="8" y="14" width="40" height="34" rx="9" fill="#fee2e2" stroke="#f87171" stroke-width="2"/><rect x="8" y="14" width="40" height="11" rx="9" fill="#fecaca" stroke="#f87171" stroke-width="2"/><line x1="8" y1="22" x2="48" y2="22" stroke="#f87171" stroke-width="2"/><rect x="24" y="25" width="8" height="18" rx="3" fill="#fff"/><rect x="17" y="32" width="22" height="8" rx="3" fill="#fff"/></svg>',
  condiment: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><rect x="8" y="20" width="18" height="30" rx="5" fill="#fde68a" stroke="#f59e0b" stroke-width="2.5"/><rect x="11" y="14" width="12" height="8" rx="3" fill="#fde68a" stroke="#f59e0b" stroke-width="2.5"/><rect x="14" y="10" width="6" height="6" rx="2" fill="#f59e0b"/><rect x="11" y="28" width="12" height="14" rx="3" fill="#fff" opacity="0.6"/><line x1="13" y1="32" x2="21" y2="32" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><line x1="13" y1="36" x2="21" y2="36" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><rect x="30" y="26" width="16" height="24" rx="5" fill="#bbf7d0" stroke="#4ade80" stroke-width="2.5"/><rect x="33" y="20" width="10" height="8" rx="3" fill="#bbf7d0" stroke="#4ade80" stroke-width="2.5"/><rect x="36" y="16" width="4" height="6" rx="2" fill="#4ade80"/><circle cx="34" cy="34" r="2" fill="#4ade80" opacity="0.5"/><circle cx="39" cy="38" r="2" fill="#4ade80" opacity="0.5"/><circle cx="43" cy="34" r="2" fill="#4ade80" opacity="0.5"/></svg>',
  stationery: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><rect x="6" y="10" width="30" height="38" rx="4" fill="#ddd6fe" stroke="#a78bfa" stroke-width="2.5"/><rect x="6" y="10" width="7" height="38" rx="4" fill="#c4b5fd" stroke="#a78bfa" stroke-width="2.5"/><line x1="17" y1="20" x2="32" y2="20" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="27" x2="32" y2="27" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="34" x2="32" y2="34" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="41" x2="26" y2="41" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><rect x="36" y="12" width="10" height="34" rx="4" fill="#fef9c3" stroke="#facc15" stroke-width="2.5"/><rect x="36" y="12" width="10" height="8" rx="4" fill="#fca5a5" stroke="#facc15" stroke-width="2.5"/><polygon points="36,46 46,46 41,54" fill="#facc15" stroke="#facc15" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  laundry: '<svg width="44" height="44" viewBox="0 0 56 56" fill="none"><rect x="7" y="7" width="42" height="44" rx="10" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/><rect x="7" y="7" width="42" height="14" rx="10" fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/><line x1="7" y1="19" x2="49" y2="19" stroke="#38bdf8" stroke-width="2"/><circle cx="18" cy="13" r="3" fill="#0ea5e9"/><rect x="26" y="10" width="16" height="5" rx="2.5" fill="#93c5fd"/><circle cx="28" cy="35" r="13" fill="#fff" stroke="#38bdf8" stroke-width="2.5"/><circle cx="28" cy="35" r="8" fill="#bae6fd"/><circle cx="28" cy="35" r="4" fill="#fff" opacity="0.8"/></svg>',
};
const BOX_ICON_KEYS = ['fridge','home','cart','shelf','bath','medicine','condiment','stationery','laundry'];
const BOX_LABELS = { fridge:'冷蔵庫', home:'家全体', cart:'買い置き', shelf:'棚・パントリー', bath:'洗面・お風呂', medicine:'薬・衛生', condiment:'調味料', stationery:'文具・雑貨', laundry:'洗濯・掃除' };

async function lookupBarcode(barcode) {
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

async function analyzeReceipt(apiKey, base64Image, mimeType) {
  const prompt = 'このレシート画像から購入した商品を全て抽出してください。購入日も読み取れる場合はYYYY-MM-DD形式で。JSON配列のみ返してください。余計なテキスト不要。[{"name":"商品名","quantity":"数量(数字のみ)","unit":"単位(個/本/袋/ml/g等、不明なら個)","purchaseDate":"YYYY-MM-DD または空文字","category":"野菜・果物/肉・魚/乳製品/飲み物/調味料/冷凍食品/食料品その他/日用品/洗剤・清掃/衛生用品/文房具/電池・電球/備品その他 から1つ"}]。読み取れない場合は[]。';
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }] })
  });
  if (!res.ok) throw new Error('API error: ' + res.status);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean);
}

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [users, setUsers] = useState({});
  const [boxes, setBoxes] = useState({});
  const [items, setItems] = useState({});
  const [session, setSession] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({});
  const [filterCat, setFilterCat] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const receiptRef = useRef(null);
  const barcodeRef = useRef(null);

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const u = load(KEYS.USERS, {}); const b = load(KEYS.BOXES, {}); const it = load(KEYS.ITEMS, {});
    const s = load(KEYS.SESSION, null); const k = load(KEYS.APIKEY, '');
    setUsers(u); setBoxes(b); setItems(it); setGeminiKey(k);
    if (s && u[s.userId]) {
      setSession(s);
      if (s.boxId && b[s.boxId]) { setCurrentBox(s.boxId); setScreen('box'); }
      else setScreen('home');
    } else setScreen('auth');
  }, []);

  const persist = (u, b, it) => {
    if (u) { setUsers(u); save(KEYS.USERS, u); }
    if (b) { setBoxes(b); save(KEYS.BOXES, b); }
    if (it) { setItems(it); save(KEYS.ITEMS, it); }
  };

  const handleRegister = async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.password?.trim()) return showToast('全項目を入力してください', 'error');
    if (form.password.length < 6) return showToast('パスワードは6文字以上', 'error');
    if (Object.values(users).find(u => u.email === form.email.toLowerCase())) return showToast('このメールは登録済みです', 'error');
    setLoading(true);
    const id = genId(); const hash = await hashPassword(form.password);
    const nu = { ...users, [id]: { id, name: form.name.trim(), email: form.email.toLowerCase(), hash, createdAt: Date.now() } };
    persist(nu, null, null);
    const s = { userId: id, boxId: null }; setSession(s); save(KEYS.SESSION, s);
    setLoading(false); setForm({});
    showToast('ようこそ、' + form.name + 'さん！🎉', 'success'); setScreen('home');
  };

  const handleLogin = async () => {
    if (!form.email?.trim() || !form.password?.trim()) return showToast('メールとパスワードを入力してください', 'error');
    const user = Object.values(users).find(u => u.email === form.email.toLowerCase());
    if (!user) return showToast('メールまたはパスワードが違います', 'error');
    setLoading(true);
    const hash = await hashPassword(form.password);
    if (hash !== user.hash) { setLoading(false); return showToast('メールまたはパスワードが違います', 'error'); }
    const s = { userId: user.id, boxId: null }; setSession(s); save(KEYS.SESSION, s);
    setLoading(false); setForm({});
    showToast('おかえり！' + user.name + 'さん 🏡', 'success'); setScreen('home');
  };

  const handleLogout = () => { setSession(null); setCurrentBox(null); save(KEYS.SESSION, null); setScreen('auth'); };

  const createBox = () => {
    if (!form.boxName?.trim()) return showToast('名前を入力してください', 'error');
    const id = genId();
    const nb = { ...boxes, [id]: { id, name: form.boxName.trim(), icon: form.boxIcon || 'fridge', ownerId: session.userId, members: [session.userId], inviteCode: genCode(), createdAt: Date.now() } };
    persist(null, nb, null);
    const s = { ...session, boxId: id }; setSession(s); save(KEYS.SESSION, s);
    setCurrentBox(id); setForm({});
    showToast('ボックスを作成しました！✨', 'success'); setScreen('box');
  };

  const joinBox = () => {
    const code = inviteInput.trim().toUpperCase();
    if (!code) return showToast('招待コードを入力してください', 'error');
    const box = Object.values(boxes).find(b => b.inviteCode === code);
    if (!box) return showToast('招待コードが正しくありません', 'error');
    if (box.members.includes(session.userId)) return showToast('既にメンバーです', 'error');
    const nb = { ...boxes, [box.id]: { ...box, members: [...box.members, session.userId] } };
    persist(null, nb, null);
    const s = { ...session, boxId: box.id }; setSession(s); save(KEYS.SESSION, s);
    setCurrentBox(box.id); setInviteInput('');
    showToast('「' + box.name + '」に参加しました！🎊', 'success'); setScreen('box');
  };

  const refreshCode = () => {
    const box = boxes[currentBox];
    if (!box || box.ownerId !== session.userId) return showToast('オーナーのみ変更できます', 'error');
    persist(null, { ...boxes, [box.id]: { ...box, inviteCode: genCode() } }, null);
    showToast('招待コードを更新しました', 'success');
  };

  const addItem = () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    const id = genId();
    persist(null, null, { ...items, [id]: { id, boxId: currentBox, name: form.itemName.trim(), category: form.category || '食料品その他', quantity: form.quantity || '1', unit: form.unit || '', expiry: form.expiry || '', purchaseDate: form.purchaseDate || '', note: form.note || '', addedBy: session.userId, addedAt: Date.now(), updatedAt: Date.now() } });
    setForm({}); showToast('追加しました！🎉', 'success'); setScreen('box');
  };

  const updateItem = () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    persist(null, null, { ...items, [editingItem.id]: { ...items[editingItem.id], name: form.itemName.trim(), category: form.category || '食料品その他', quantity: form.quantity || '1', unit: form.unit || '', expiry: form.expiry || '', purchaseDate: form.purchaseDate || '', note: form.note || '', updatedAt: Date.now() } });
    setEditingItem(null); setForm({}); showToast('更新しました！✅', 'success'); setScreen('box');
  };

  const deleteItem = (id) => { const ni = { ...items }; delete ni[id]; persist(null, null, ni); setConfirmDelete(null); showToast('削除しました', 'info'); };

  const openEditItem = (item) => {
    setEditingItem(item);
    setForm({ itemName: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiry: item.expiry, purchaseDate: item.purchaseDate || '', note: item.note });
    setScreen('editItem');
  };

  const handleBarcode = async (file) => {
    setShowAddMenu(false); setScanning(true); setScanMsg('バーコードを読み取り中... 🔍');
    try {
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
        const bitmap = await createImageBitmap(file);
        const codes = await detector.detect(bitmap);
        if (!codes.length) { showToast('バーコードが読み取れませんでした', 'error'); setScanning(false); return; }
        setScanMsg('商品情報を検索中... 🔎');
        const product = await lookupBarcode(codes[0].rawValue);
        setScanning(false);
        if (!product) { showToast('DBに商品が見つかりませんでした。手動入力してください', 'error'); setForm({ purchaseDate: today() }); setScreen('addItem'); return; }
        setForm({ itemName: product.name, category: product.category, quantity: product.quantity, unit: product.unit, purchaseDate: today() });
        setScreen('addItem'); showToast('商品情報を取得しました！✨', 'success');
      } else {
        setScanning(false); showToast('このブラウザはバーコード非対応です', 'error');
        setForm({ purchaseDate: today() }); setScreen('addItem');
      }
    } catch (e) { setScanning(false); showToast('読み取りに失敗しました', 'error'); }
  };

  const handleReceipt = async (file) => {
    setShowAddMenu(false);
    if (!geminiKey) { showToast('設定からGemini APIキーを入力してください', 'error'); setScreen('settings'); return; }
    setScanning(true); setScanMsg('AIがレシートを解析中... 🤖');
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(file); });
      const results = await analyzeReceipt(geminiKey, base64, file.type);
      if (!results.length) { showToast('商品を読み取れませんでした', 'error'); setScanning(false); return; }
      const hasAmbiguous = results.some(item => !ALL_CATS.includes(item.category));
      if (hasAmbiguous) { setPendingItems(results); setScanning(false); setScreen('scanConfirm'); }
      else { setScannedItems(results); setScanning(false); setScreen('scanResult'); }
    } catch (e) { showToast('読み取りに失敗しました', 'error'); setScanning(false); }
  };

  const confirmAndAddScanned = () => {
    const now = Date.now(); const newItems = { ...items };
    scannedItems.forEach(item => { const id = genId(); newItems[id] = { id, boxId: currentBox, name: item.name, category: item.category || '食料品その他', quantity: item.quantity || '1', unit: item.unit || '', expiry: '', purchaseDate: item.purchaseDate || today(), note: '', addedBy: session.userId, addedAt: now, updatedAt: now }; });
    persist(null, null, newItems);
    showToast(scannedItems.length + '品を追加しました！🎉', 'success');
    setScannedItems([]); setScreen('box');
  };

  const isExpiringSoon = (e) => { if (!e) return false; const d = (new Date(e) - new Date()) / 86400000; return d >= 0 && d <= 3; };
  const isExpired = (e) => e && new Date(e) < new Date();

  const box = currentBox ? boxes[currentBox] : null;
  const user = session ? users[session.userId] : null;
  const boxItems = currentBox ? Object.values(items).filter(i => i.boxId === currentBox) : [];
  const filteredItems = boxItems
    .filter(i => filterCat === 'all' || i.category === filterCat)
    .filter(i => filterType === 'all' || (filterType === 'food' ? FOOD_CATS.includes(i.category) : SUPPLY_CATS.includes(i.category)))
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name, 'ja') : sortBy === 'expiry' ? (a.expiry || '9999') < (b.expiry || '9999') ? -1 : 1 : b.addedAt - a.addedAt);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    * { box-sizing:border-box; }
    body { margin:0; background:#fef9f0; }
    select option { background:#fff; color:#333; }
    input[type=date] { color-scheme:light; }
    @keyframes pop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .card-hover:active { transform:scale(0.97); }
    .btn-press:active { transform:scale(0.95); }
    .tag { display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700; }
  `;

  const S = {
    app: { minHeight:'100dvh', background:'linear-gradient(160deg,#fff0f9 0%,#f0f4ff 50%,#f0fff9 100%)', fontFamily:"'Nunito',sans-serif", color:'#2d2d2d', position:'relative' },
    wrap: { maxWidth:440, margin:'0 auto', padding:'0 16px', minHeight:'100dvh' },
    card: { background:'#fff', borderRadius:24, padding:20, boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'2px solid rgba(255,255,255,0.8)' },
    cardColor: (bg) => ({ background:bg, borderRadius:24, padding:20, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }),
    btn: (c='#ff6b9d') => ({ background:c, color:'#fff', border:'none', borderRadius:16, padding:'14px 24px', fontSize:15, fontWeight:800, cursor:'pointer', width:'100%', marginTop:10, boxShadow:'0 4px 12px ' + c + '55', letterSpacing:'0.02em' }),
    btnOutline: (c='#ff6b9d') => ({ background:'#fff', color:c, border:'2.5px solid ' + c, borderRadius:16, padding:'12px 24px', fontSize:14, fontWeight:800, cursor:'pointer', width:'100%', marginTop:8 }),
    input: { width:'100%', background:'#fafafa', border:'2.5px solid #f0f0f0', borderRadius:14, padding:'12px 14px', fontSize:15, color:'#2d2d2d', outline:'none', marginTop:6, fontFamily:'inherit', fontWeight:600 },
    label: { fontSize:11, fontWeight:800, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.1em' },
    hdr: { display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:20, paddingBottom:12 },
    iconBtn: (bg) => ({ background:bg, border:'none', borderRadius:14, padding:'10px 12px', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', gap:4, fontWeight:800, fontFamily:'inherit' }),
    toastEl: (t) => ({ position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)', background:t==='error'?'#ff5b79':t==='success'?'#4ade80':'#60a5fa', color:'#fff', padding:'12px 22px', borderRadius:50, fontSize:14, fontWeight:800, zIndex:1000, whiteSpace:'nowrap', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', animation:'pop 0.3s ease' }),
  };

  const BoxIcon = ({k, size=44}) => <div dangerouslySetInnerHTML={{__html: BOX_SVG[k] || BOX_SVG['fridge']}} style={{width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center'}} />;

  if (screen === 'loading') return (
    <div style={{...S.app,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{CSS}</style>
      <div style={{textAlign:'center',animation:'pop 0.5s ease'}}>
        <BoxIcon k='fridge' size={72} />
        <div style={{fontWeight:800,color:'#ff6b9d',fontSize:18,marginTop:8}}>ホームストック</div>
        <div style={{color:'#bbb',marginTop:4,fontSize:13}}>読み込み中...</div>
      </div>
    </div>
  );

  if (screen === 'auth') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={{paddingTop:56,paddingBottom:32,textAlign:'center'}}>
          <div style={{animation:'pop 0.5s ease',display:'inline-block'}}><BoxIcon k='fridge' size={72} /></div>
          <h1 style={{fontSize:30,fontWeight:900,margin:'8px 0 4px',background:'linear-gradient(135deg,#ff6b9d,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ホームストック</h1>
          <p style={{color:'#aaa',fontSize:13,fontWeight:600,margin:0}}>家族みんなで在庫を管理しよう🌸</p>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:20,background:'#f5f5f5',borderRadius:16,padding:4}}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => {setAuthMode(m);setForm({});}} style={{flex:1,padding:'10px',borderRadius:12,border:'none',cursor:'pointer',fontWeight:800,fontSize:14,fontFamily:'inherit',transition:'all 0.2s',background:authMode===m?'#fff':'transparent',color:authMode===m?'#ff6b9d':'#aaa',boxShadow:authMode===m?'0 2px 8px rgba(0,0,0,0.1)':'none'}}>
              {m==='login'?'🔑 ログイン':'✨ 新規登録'}
            </button>
          ))}
        </div>
        <div style={{...S.card,animation:'slideUp 0.3s ease'}}>
          {authMode==='register' && <div style={{marginBottom:14}}><label style={S.label}>ニックネーム</label><input style={S.input} placeholder='例：田中 花子' value={form.name||''} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>}
          <div style={{marginBottom:14}}><label style={S.label}>メールアドレス</label><input style={S.input} type='email' placeholder='you@example.com' value={form.email||''} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
          <div style={{marginBottom:8}}><label style={S.label}>パスワード</label><input style={S.input} type='password' placeholder='6文字以上' value={form.password||''} onChange={e=>setForm(p=>({...p,password:e.target.value}))} /></div>
          <button className='btn-press' style={S.btn()} onClick={authMode==='login'?handleLogin:handleRegister} disabled={loading}>
            {loading?'処理中...✨':authMode==='login'?'🔑 ログイン':'🎉 アカウント作成'}
          </button>
        </div>
        <div style={{height:40}} />
      </div>
      {toast && <div style={S.toastEl(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'settings') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={()=>setScreen(currentBox?'box':'home')} style={S.iconBtn('#f0f0f0')}>← 戻る</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:900}}>設定 ⚙️</h2>
          <div style={{width:72}} />
        </div>
        <div style={{...S.card,marginBottom:12}}>
          <div style={{fontWeight:800,marginBottom:8,fontSize:15}}>🤖 Gemini APIキー</div>
          <p style={{color:'#999',fontSize:13,marginBottom:12,lineHeight:1.5}}>レシート読み取りに使用。バーコード読み取りには不要です。<br/>aistudio.google.comで無料取得できます。</p>
          <label style={S.label}>APIキー</label>
          <input style={S.input} type='password' placeholder='AIza...' value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} />
          <button className='btn-press' style={S.btn('#a78bfa')} onClick={()=>{save(KEYS.APIKEY,geminiKey);showToast('保存しました！✅','success');}}>💾 保存する</button>
        </div>
        <div style={S.card}>
          <div style={{fontWeight:800,marginBottom:8,fontSize:15}}>👤 アカウント</div>
          <div style={{color:'#888',fontSize:14,marginBottom:12,fontWeight:600}}>{user?.name} さん<br/><span style={{fontSize:12}}>{user?.email}</span></div>
          <button className='btn-press' style={S.btnOutline('#ff5b79')} onClick={handleLogout}>🚪 ログアウト</button>
        </div>
        <div style={{height:40}} />
      </div>
      {toast && <div style={S.toastEl(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'home') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div>
            <div style={{fontSize:13,color:'#bbb',fontWeight:700}}>こんにちは👋</div>
            <h2 style={{margin:'2px 0 0',fontSize:20,fontWeight:900}}>{user?.name}さん！</h2>
          </div>
          <button onClick={()=>setScreen('settings')} style={S.iconBtn('#f5f0ff')}>⚙️</button>
        </div>
        {Object.values(boxes).filter(b=>b.members.includes(session.userId)).length > 0 && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:800,color:'#bbb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>📋 在庫ボックス</div>
            {Object.values(boxes).filter(b=>b.members.includes(session.userId)).map(b => {
              const count = Object.values(items).filter(i=>i.boxId===b.id).length;
              const foodCount = Object.values(items).filter(i=>i.boxId===b.id&&FOOD_CATS.includes(i.category)).length;
              return (
                <div key={b.id} className='card-hover' onClick={()=>{const s={...session,boxId:b.id};setSession(s);save(KEYS.SESSION,s);setCurrentBox(b.id);setScreen('box');}}
                  style={{...S.card,marginBottom:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'transform 0.15s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{background:'linear-gradient(135deg,#fdf0ff,#f0f9ff)',borderRadius:16,width:60,height:60,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <BoxIcon k={b.icon} size={44} />
                    </div>
                    <div>
                      <div style={{fontWeight:900,fontSize:16}}>{b.name}</div>
                      <div style={{color:'#bbb',fontSize:12,fontWeight:600,marginTop:2}}>👥{b.members.length}人 · 🍱{foodCount} 📦{count-foodCount}</div>
                    </div>
                  </div>
                  <div style={{fontSize:22,color:'#ddd'}}>›</div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{...S.cardColor('#fff5fc'),marginBottom:12,border:'2px dashed #ffd6ed'}}>
          <div style={{fontWeight:800,marginBottom:12,fontSize:15}}>✨ 新しい在庫ボックスを作る</div>
          <label style={S.label}>アイコンを選ぼう</label>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8,marginBottom:14}}>
            {BOX_ICON_KEYS.map(k=>(
              <button key={k} onClick={()=>setForm(p=>({...p,boxIcon:k}))} title={BOX_LABELS[k]}
                style={{background:form.boxIcon===k?'#fff0f9':'#fafafa',border:form.boxIcon===k?'2.5px solid #ff6b9d':'2.5px solid #f0f0f0',borderRadius:14,padding:'8px',cursor:'pointer',transition:'all 0.15s',transform:form.boxIcon===k?'scale(1.1)':'scale(1)'}}>
                <BoxIcon k={k} size={44} />
              </button>
            ))}
          </div>
          <label style={S.label}>ボックス名</label>
          <input style={S.input} placeholder='例：冷蔵庫・洗面台備品' value={form.boxName||''} onChange={e=>setForm(p=>({...p,boxName:e.target.value}))} />
          <button className='btn-press' style={S.btn('#ff6b9d')} onClick={createBox}>🌸 作成する</button>
        </div>
        <div style={{...S.cardColor('#f0f4ff'),border:'2px dashed #c7d2fe'}}>
          <div style={{fontWeight:800,marginBottom:12,fontSize:15}}>🔗 招待コードで参加</div>
          <input style={S.input} placeholder='XX-XX-XX-XX' value={inviteInput} onChange={e=>setInviteInput(e.target.value)} />
          <button className='btn-press' style={S.btn('#818cf8')} onClick={joinBox}>🎊 参加する</button>
        </div>
        <div style={{height:40}} />
      </div>
      {toast && <div style={S.toastEl(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'box') {
    const expiredItems = boxItems.filter(i=>isExpired(i.expiry));
    const expiringItems = boxItems.filter(i=>isExpiringSoon(i.expiry));
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <div>
              <button onClick={()=>setScreen('home')} style={{background:'none',border:'none',color:'#bbb',cursor:'pointer',fontSize:13,padding:0,fontFamily:'inherit',fontWeight:700}}>← 戻る</button>
              <h2 style={{margin:'2px 0 0',fontSize:18,fontWeight:900,display:'flex',alignItems:'center',gap:6}}>
                <span style={{display:'inline-flex'}}><BoxIcon k={box?.icon} size={28} /></span>
                {box?.name}
              </h2>
              <div style={{color:'#bbb',fontSize:12,fontWeight:600}}>👥{box?.members.length}人 · {boxItems.length}品</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowInvite(!showInvite)} style={S.iconBtn('#fff0fa')}>🔗</button>
              <button onClick={()=>setScreen('settings')} style={S.iconBtn('#f5f0ff')}>⚙️</button>
            </div>
          </div>
          {showInvite && (
            <div style={{...S.cardColor('#fff0fa'),marginBottom:14,border:'2px solid #ffd6ed',animation:'slideUp 0.2s ease'}}>
              <div style={{fontSize:12,color:'#ff6b9d',marginBottom:8,fontWeight:800}}>🔗 招待コード</div>
              <div style={{background:'#fff',borderRadius:14,padding:'14px',fontFamily:'monospace',fontSize:20,fontWeight:900,color:'#ff6b9d',textAlign:'center',letterSpacing:3,border:'2px dashed #ffd6ed'}}>{box?.inviteCode}</div>
              <div style={{fontSize:12,color:'#ccc',marginTop:8,textAlign:'center',fontWeight:600}}>このコードを家族に送ってね 💌</div>
              {box?.ownerId===session.userId && <button className='btn-press' style={S.btnOutline('#ff6b9d')} onClick={refreshCode}>🔄 コードを再発行</button>}
            </div>
          )}
          {expiredItems.length > 0 && <div style={{background:'#fff0f2',border:'2px solid #fecdd3',borderRadius:16,padding:'10px 14px',marginBottom:10,fontSize:13,fontWeight:700,color:'#f43f5e'}}>⚠️ 期限切れ {expiredItems.length}品！確認してね</div>}
          {expiringItems.length > 0 && <div style={{background:'#fffbeb',border:'2px solid #fde68a',borderRadius:16,padding:'10px 14px',marginBottom:10,fontSize:13,fontWeight:700,color:'#d97706'}}>⏳ もうすぐ期限！{expiringItems.length}品（3日以内）</div>}
          {scanning && <div style={{background:'#f5f0ff',border:'2px solid #ddd6fe',borderRadius:16,padding:'14px',marginBottom:12,textAlign:'center',fontSize:14,fontWeight:700,color:'#7c3aed',animation:'slideUp 0.2s ease'}}>✨ {scanMsg}</div>}
          <div style={{display:'flex',gap:6,marginBottom:12,background:'#f5f5f5',borderRadius:14,padding:4}}>
            {[['all','🌈 すべて'],['food','🍱 食料品'],['supply','📦 備品']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilterType(v)} style={{flex:1,padding:'8px 4px',borderRadius:10,border:'none',cursor:'pointer',fontSize:12,fontWeight:800,fontFamily:'inherit',background:filterType===v?'#fff':'transparent',color:filterType===v?'#ff6b9d':'#bbb',boxShadow:filterType===v?'0 2px 8px rgba(0,0,0,0.08)':'none',transition:'all 0.2s'}}>{l}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:6,marginBottom:12,overflowX:'auto',paddingBottom:4}}>
            <button onClick={()=>setFilterCat('all')} style={{whiteSpace:'nowrap',padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',background:filterCat==='all'?'#ff6b9d':'#f0f0f0',color:filterCat==='all'?'#fff':'#aaa',flexShrink:0}}>すべて</button>
            {ALL_CATS.map(cat=>(
              <button key={cat} onClick={()=>setFilterCat(cat)} style={{whiteSpace:'nowrap',padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',background:filterCat===cat?CAT_COLORS[cat]:'#f0f0f0',color:filterCat===cat?'#333':'#aaa',flexShrink:0}}>{CAT_ICONS[cat]} {cat}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
            <span style={{fontSize:12,color:'#bbb',fontWeight:700,whiteSpace:'nowrap'}}>並び替え:</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{...S.input,marginTop:0,padding:'8px 12px',fontSize:12,width:'auto',fontWeight:700}}>
              <option value='name'>名前順</option><option value='expiry'>賞味期限順</option><option value='added'>追加日順</option>
            </select>
          </div>
          {filteredItems.length===0 ? (
            <div style={{textAlign:'center',padding:'48px 0',color:'#ddd'}}>
              <div style={{fontSize:56,marginBottom:12}}>📭</div>
              <div style={{fontWeight:700,fontSize:15}}>在庫がありません</div>
              <div style={{fontSize:12,marginTop:4}}>下の ＋ ボタンから追加してね！</div>
            </div>
          ) : filteredItems.map(item => {
            const exp=isExpired(item.expiry),expi=isExpiringSoon(item.expiry),byUser=users[item.addedBy];
            const isSupply = SUPPLY_CATS.includes(item.category);
            const catColor = CAT_COLORS[item.category] || '#f0f0f0';
            return (
              <div key={item.id} className='card-hover' style={{...S.card,marginBottom:8,cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'transform 0.15s',borderLeft:'4px solid ' + catColor}} onClick={()=>openEditItem(item)}>
                <div style={{fontSize:30,flexShrink:0,background:catColor+'44',borderRadius:14,width:52,height:52,display:'flex',alignItems:'center',justifyContent:'center'}}>{CAT_ICONS[item.category]||'📦'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontWeight:800,fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
                    {exp && <span className='tag' style={{background:'#fff0f2',color:'#f43f5e'}}>⚠️期限切れ</span>}
                    {!exp&&expi && <span className='tag' style={{background:'#fffbeb',color:'#d97706'}}>⏳期限間近</span>}
                    {isSupply && <span className='tag' style={{background:'#fff7ed',color:'#ea580c'}}>備品</span>}
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                    <span className='tag' style={{background:catColor+'33',color:'#555'}}>{item.category}</span>
                    <span style={{color:'#999',fontSize:12,fontWeight:700}}>{item.quantity}{item.unit}</span>
                    {item.expiry && <span style={{color:exp?'#f43f5e':expi?'#d97706':'#bbb',fontSize:11,fontWeight:700}}>📅{item.expiry}</span>}
                    {item.purchaseDate && <span style={{color:'#bbb',fontSize:11,fontWeight:700}}>🛒{item.purchaseDate}</span>}
                    <span style={{color:'#ddd',fontSize:11,fontWeight:600}}>by {byUser?.name||'?'}</span>
                  </div>
                  {item.note && <div style={{color:'#bbb',fontSize:12,marginTop:4,fontWeight:600}}>📝 {item.note}</div>}
                </div>
                <button onClick={e=>{e.stopPropagation();setConfirmDelete(item);}} style={{background:'#fff0f2',border:'none',color:'#f43f5e',borderRadius:12,padding:'8px 10px',cursor:'pointer',fontSize:16,flexShrink:0}}>🗑</button>
              </div>
            );
          })}
          <div style={{height:110}} />
        </div>
        <input ref={barcodeRef} type='file' accept='image/*' capture='environment' style={{display:'none'}} onChange={e=>{if(e.target.files[0])handleBarcode(e.target.files[0]);e.target.value='';}} />
        <input ref={receiptRef} type='file' accept='image/*' style={{display:'none'}} onChange={e=>{if(e.target.files[0])handleReceipt(e.target.files[0]);e.target.value='';}} />
        {showAddMenu && (
          <div style={{position:'fixed',inset:0,zIndex:150,background:'rgba(0,0,0,0.2)'}} onClick={()=>setShowAddMenu(false)}>
            <div style={{position:'fixed',bottom:96,right:16,display:'flex',flexDirection:'column',gap:12,alignItems:'flex-end'}} onClick={e=>e.stopPropagation()}>
              {[
                {label:'✏️ 手動で入力', bg:'#64748b', action:()=>{setShowAddMenu(false);setForm({purchaseDate:today()});setScreen('addItem');}},
                {label:'🧾 レシートを読み取り', bg:'#0891b2', action:()=>receiptRef.current?.click()},
                {label:'📷 バーコードをスキャン', bg:'#7c3aed', action:()=>barcodeRef.current?.click()},
              ].map(({label,bg,action}) => (
                <button key={label} className='btn-press' onClick={action}
                  style={{background:bg,color:'#fff',border:'none',borderRadius:20,padding:'12px 20px',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px ' + bg + '55',animation:'slideUp 0.2s ease',whiteSpace:'nowrap'}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className='btn-press' onClick={()=>setShowAddMenu(!showAddMenu)}
          style={{position:'fixed',bottom:24,right:24,width:64,height:64,borderRadius:'50%',background:showAddMenu?'#f43f5e':'linear-gradient(135deg,#ff6b9d,#a78bfa)',border:'none',color:'#fff',fontSize:30,cursor:'pointer',zIndex:160,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 24px rgba(255,107,157,0.5)',transition:'all 0.2s',transform:showAddMenu?'rotate(45deg)':'rotate(0deg)'}}>+</button>
        {confirmDelete && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 20px'}}>
            <div style={{...S.card,maxWidth:340,width:'100%',animation:'pop 0.3s ease',textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:8}}>🗑️</div>
              <div style={{fontWeight:900,fontSize:16,marginBottom:6}}>「{confirmDelete.name}」を削除する？</div>
              <div style={{color:'#bbb',fontSize:13,marginBottom:16}}>この操作は元に戻せません</div>
              <button className='btn-press' style={S.btn('#f43f5e')} onClick={()=>deleteItem(confirmDelete.id)}>削除する</button>
              <button className='btn-press' style={S.btnOutline('#bbb')} onClick={()=>setConfirmDelete(null)}>キャンセル</button>
            </div>
          </div>
        )}
        {toast && <div style={S.toastEl(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  if (screen === 'scanResult') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={()=>{setScannedItems([]);setScreen('box');}} style={S.iconBtn('#f0f0f0')}>← キャンセル</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:900}}>📋 読み取り結果</h2>
          <div style={{width:90}} />
        </div>
        <div style={{...S.cardColor('#f0fff4'),marginBottom:14,border:'2px solid #86efac',textAlign:'center'}}>
          <div style={{fontSize:24,marginBottom:4}}>🎉</div>
          <div style={{fontWeight:800,color:'#16a34a'}}>{scannedItems.length}品を検出しました！</div>
          <div style={{color:'#999',fontSize:12,marginTop:2}}>確認して登録してください</div>
        </div>
        {scannedItems.map((item,i) => (
          <div key={i} style={{...S.card,marginBottom:8,display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontSize:28,background:CAT_COLORS[item.category]+'44',borderRadius:12,width:48,height:48,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{CAT_ICONS[item.category]||'📦'}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800}}>{item.name}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
                <span className='tag' style={{background:CAT_COLORS[item.category]+'33',color:'#555'}}>{item.category}</span>
                <span style={{color:'#999',fontSize:12,fontWeight:700}}>{item.quantity}{item.unit}</span>
                {item.purchaseDate && <span style={{color:'#bbb',fontSize:12,fontWeight:700}}>🛒{item.purchaseDate}</span>}
              </div>
            </div>
            <button onClick={()=>setScannedItems(scannedItems.filter((_,j)=>j!==i))} style={{background:'#fff0f2',border:'none',color:'#f43f5e',borderRadius:10,padding:'6px 10px',cursor:'pointer',fontSize:14,flexShrink:0}}>✕</button>
          </div>
        ))}
        <button className='btn-press' style={S.btn('#4ade80')} onClick={confirmAndAddScanned}>✅ {scannedItems.length}品をまとめて登録</button>
        <button className='btn-press' style={S.btnOutline('#bbb')} onClick={()=>{setScannedItems([]);setScreen('box');}}>キャンセル</button>
        <div style={{height:40}} />
      </div>
    </div>
  );

  if (screen === 'scanConfirm') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={()=>{setPendingItems([]);setScreen('box');}} style={S.iconBtn('#f0f0f0')}>← キャンセル</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:900}}>🤔 カテゴリ確認</h2>
          <div style={{width:90}} />
        </div>
        <div style={{...S.cardColor('#fffbeb'),marginBottom:14,border:'2px solid #fde68a'}}>
          <div style={{fontWeight:700,color:'#d97706',fontSize:13}}>⚠️ 一部の商品のカテゴリを確認してください</div>
        </div>
        {pendingItems.map((item,i) => (
          <div key={i} style={{...S.card,marginBottom:10}}>
            <div style={{fontWeight:800,marginBottom:10,fontSize:15}}>{item.name}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {ALL_CATS.map(cat=>(
                <button key={cat} onClick={()=>{const ni=[...pendingItems];ni[i]={...ni[i],category:cat};setPendingItems(ni);}}
                  style={{padding:'5px 10px',borderRadius:12,border:'none',cursor:'pointer',fontSize:11,fontWeight:800,fontFamily:'inherit',background:item.category===cat?CAT_COLORS[cat]:'#f5f5f5',color:item.category===cat?'#333':'#aaa',transition:'all 0.15s'}}>
                  {CAT_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className='btn-press' style={S.btn()} onClick={()=>{setScannedItems(pendingItems);setPendingItems([]);setScreen('scanResult');}}>確認完了 →</button>
        <div style={{height:40}} />
      </div>
    </div>
  );

  if (screen === 'addItem' || screen === 'editItem') {
    const isEdit = screen === 'editItem';
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <button onClick={()=>{setScreen('box');setForm({});setEditingItem(null);}} style={S.iconBtn('#f0f0f0')}>← キャンセル</button>
            <h2 style={{margin:0,fontSize:18,fontWeight:900}}>{isEdit?'✏️ 在庫を編集':'🌸 在庫を追加'}</h2>
            <div style={{width:90}} />
          </div>
          <div style={S.card}>
            <div style={{marginBottom:14}}><label style={S.label}>品名 *</label><input style={S.input} placeholder='例：牛乳' value={form.itemName||''} onChange={e=>setForm(p=>({...p,itemName:e.target.value}))} /></div>
            <div style={{marginBottom:14}}><label style={S.label}>カテゴリ</label>
              <select style={S.input} value={form.category||'食料品その他'} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                <optgroup label='🍱 食料品'>{FOOD_CATS.map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</optgroup>
                <optgroup label='📦 備品・日用品'>{SUPPLY_CATS.map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</optgroup>
              </select>
            </div>
            <div style={{display:'flex',gap:12,marginBottom:14}}>
              <div style={{flex:1}}><label style={S.label}>数量</label><input style={S.input} type='number' min='0' step='0.1' placeholder='1' value={form.quantity||''} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} /></div>
              <div style={{flex:1}}><label style={S.label}>単位</label><input style={S.input} placeholder='個/本/袋' value={form.unit||''} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} /></div>
            </div>
            <div style={{marginBottom:14}}><label style={S.label}>賞味期限</label><input style={S.input} type='date' value={form.expiry||''} onChange={e=>setForm(p=>({...p,expiry:e.target.value}))} /></div>
            <div style={{marginBottom:14}}><label style={S.label}>購入日</label><input style={S.input} type='date' value={form.purchaseDate||''} onChange={e=>setForm(p=>({...p,purchaseDate:e.target.value}))} /></div>
            <div style={{marginBottom:8}}><label style={S.label}>メモ</label><input style={S.input} placeholder='例：残り少ない・開封済み' value={form.note||''} onChange={e=>setForm(p=>({...p,note:e.target.value}))} /></div>
            <button className='btn-press' style={S.btn(isEdit?'#a78bfa':'#ff6b9d')} onClick={isEdit?updateItem:addItem}>{isEdit?'✅ 更新する':'🎉 追加する'}</button>
          </div>
          <div style={{height:40}} />
        </div>
        {toast && <div style={S.toastEl(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  return null;
}
