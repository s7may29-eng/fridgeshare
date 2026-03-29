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
    persist​​​​​​​​​​​​​​​​
