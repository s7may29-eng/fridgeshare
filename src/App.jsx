import { useState, useEffect, useRef } from 'react';

const KEYS = {
  USERS: 'fs-users', BOXES: 'fs-boxes', ITEMS: 'fs-items',
  SESSION: 'fs-session', APIKEY: 'fs-gemini-key',
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

const FOOD_CATS = ['野菜・果物','肉・魚','乳製品','飲み物','調味料','冷凍食品','食料品その他'];
const SUPPLY_CATS = ['日用品','洗剤・清掃','衛生用品','文房具','電池・電球','備品その他'];
const ALL_CATS = [...FOOD_CATS, ...SUPPLY_CATS];
const CAT_ICONS = {
  '野菜・果物':'🥦','肉・魚':'🥩','乳製品':'🥛','飲み物':'🧃','調味料':'🧂','冷凍食品':'🧊','食料品その他':'🍱',
  '日用品':'🧴','洗剤・清掃':'🧹','衛生用品':'🪥','文房具':'✏️','電池・電球':'🔋','備品その他':'📦',
};
const CAT_COLORS = {
  '野菜・果物':'#bbf7d0','肉・魚':'#fecdd3','乳製品':'#fef9c3','飲み物':'#bfdbfe','調味料':'#e9d5ff','冷凍食品':'#cffafe','食料品その他':'#d1fae5',
  '日用品':'#fed7aa','洗剤・清掃':'#d9f99d','衛生用品':'#fce7f3','文房具':'#fef3c7','電池・電球':'#fef9c3','備品その他':'#f1f5f9',
};

const BOX_SVG = {
  fridge: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="11" y="4" width="34" height="48" rx="9" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="2"/><rect x="11" y="4" width="34" height="20" rx="9" fill="#b2ebf2" stroke="#4dd0e1" stroke-width="2"/><line x1="11" y1="22" x2="45" y2="22" stroke="#4dd0e1" stroke-width="2"/><rect x="37" y="10" width="4" height="9" rx="2" fill="#00acc1"/><rect x="37" y="30" width="4" height="9" rx="2" fill="#00acc1"/></svg>',
  home: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><path d="M28 6L52 26H4L28 6Z" fill="#ffd8c8" stroke="#f4845f" stroke-width="2" stroke-linejoin="round"/><rect x="8" y="24" width="40" height="28" rx="6" fill="#ffe8dc" stroke="#f4845f" stroke-width="2"/><rect x="21" y="34" width="14" height="18" rx="5" fill="#ffb499" stroke="#f4845f" stroke-width="2"/><rect x="10" y="28" width="10" height="8" rx="3" fill="#fff" stroke="#f4845f" stroke-width="1.5"/><rect x="36" y="28" width="10" height="8" rx="3" fill="#fff" stroke="#f4845f" stroke-width="1.5"/></svg>',
  cart: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><path d="M6 22L13 44H43L50 22H6Z" fill="#dcfce7" stroke="#4ade80" stroke-width="2" stroke-linejoin="round"/><path d="M18 22C18 22 18 10 28 10C38 10 38 22 38 22" stroke="#22c55e" stroke-width="2.5" fill="none" stroke-linecap="round"/><line x1="21" y1="29" x2="20" y2="42" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="29" x2="28" y2="42" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/><line x1="35" y1="29" x2="36" y2="42" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/></svg>',
  shelf: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="5" y="8" width="46" height="5" rx="2.5" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="5" y="25" width="46" height="5" rx="2.5" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="5" y="42" width="46" height="5" rx="2.5" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="5" y="8" width="5" height="39" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/><rect x="46" y="8" width="5" height="39" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/><rect x="13" y="50" width="5" height="7" rx="2" fill="#fde68a"/><rect x="38" y="50" width="5" height="7" rx="2" fill="#fde68a"/><circle cx="20" cy="19" r="4" fill="#fca5a5"/><rect x="29" y="15" width="9" height="9" rx="3" fill="#86efac"/><circle cx="20" cy="36" r="4" fill="#93c5fd"/><rect x="29" y="32" width="9" height="9" rx="3" fill="#d8b4fe"/></svg>',
  bath: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><path d="M8 38 L8 46 Q8 50 12 50 L44 50 Q48 50 48 46 L48 38 Z" fill="#dbeafe" stroke="#60a5fa" stroke-width="2.5" stroke-linejoin="round"/><line x1="6" y1="38" x2="50" y2="38" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="50" x2="14" y2="55" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><line x1="42" y1="50" x2="42" y2="55" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><path d="M36 6 Q46 6 46 18" stroke="#60a5fa" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="36" cy="6" rx="7" ry="4.5" fill="#bfdbfe" stroke="#60a5fa" stroke-width="2"/><circle cx="33" cy="6" r="1" fill="#60a5fa"/><circle cx="36" cy="6" r="1" fill="#60a5fa"/><circle cx="39" cy="6" r="1" fill="#60a5fa"/><line x1="29" y1="13" x2="26" y2="24" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="14" x2="30" y2="26" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="35" y1="14" x2="34" y2="27" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="13" x2="38" y2="26" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="41" y1="13" x2="42" y2="25" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><circle cx="26" cy="26" r="1.5" fill="#93c5fd"/><circle cx="30" cy="28" r="1.5" fill="#93c5fd"/><circle cx="34" cy="29" r="1.5" fill="#93c5fd"/><circle cx="38" cy="28" r="1.5" fill="#93c5fd"/><circle cx="42" cy="27" r="1.5" fill="#93c5fd"/></svg>',
  medicine: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="8" y="14" width="40" height="34" rx="9" fill="#fee2e2" stroke="#f87171" stroke-width="2"/><rect x="8" y="14" width="40" height="11" rx="9" fill="#fecaca" stroke="#f87171" stroke-width="2"/><line x1="8" y1="22" x2="48" y2="22" stroke="#f87171" stroke-width="2"/><rect x="24" y="25" width="8" height="18" rx="3" fill="#fff"/><rect x="17" y="32" width="22" height="8" rx="3" fill="#fff"/></svg>',
  condiment: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="8" y="20" width="18" height="30" rx="5" fill="#fde68a" stroke="#f59e0b" stroke-width="2.5"/><rect x="11" y="14" width="12" height="8" rx="3" fill="#fde68a" stroke="#f59e0b" stroke-width="2.5"/><rect x="14" y="10" width="6" height="6" rx="2" fill="#f59e0b"/><rect x="11" y="28" width="12" height="14" rx="3" fill="#fff" opacity="0.6"/><line x1="13" y1="32" x2="21" y2="32" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><line x1="13" y1="36" x2="21" y2="36" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><rect x="30" y="26" width="16" height="24" rx="5" fill="#bbf7d0" stroke="#4ade80" stroke-width="2.5"/><rect x="33" y="20" width="10" height="8" rx="3" fill="#bbf7d0" stroke="#4ade80" stroke-width="2.5"/><rect x="36" y="16" width="4" height="6" rx="2" fill="#4ade80"/><circle cx="34" cy="34" r="2" fill="#4ade80" opacity="0.5"/><circle cx="39" cy="38" r="2" fill="#4ade80" opacity="0.5"/><circle cx="43" cy="34" r="2" fill="#4ade80" opacity="0.5"/></svg>',
  stationery: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="6" y="10" width="30" height="38" rx="4" fill="#ddd6fe" stroke="#a78bfa" stroke-width="2.5"/><rect x="6" y="10" width="7" height="38" rx="4" fill="#c4b5fd" stroke="#a78bfa" stroke-width="2.5"/><line x1="17" y1="20" x2="32" y2="20" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="27" x2="32" y2="27" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="34" x2="32" y2="34" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="41" x2="26" y2="41" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><rect x="36" y="12" width="10" height="34" rx="4" fill="#fef9c3" stroke="#facc15" stroke-width="2.5"/><rect x="36" y="12" width="10" height="8" rx="4" fill="#fca5a5" stroke="#facc15" stroke-width="2.5"/><polygon points="36,46 46,46 41,54" fill="#facc15" stroke="#facc15" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  laundry: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="7" y="7" width="42" height="44" rx="10" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/><rect x="7" y="7" width="42" height="14" rx="10" fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/><line x1="7" y1="19" x2="49" y2="19" stroke="#38bdf8" stroke-width="2"/><circle cx="18" cy="13" r="3" fill="#0ea5e9"/><rect x="26" y="10" width="16" height="5" rx="2.5" fill="#93c5fd"/><circle cx="28" cy="35" r="13" fill="#fff" stroke="#38bdf8" stroke-width="2.5"/><circle cx="28" cy="35" r="8" fill="#bae6fd"/><circle cx="28" cy="35" r="4" fill="#fff" opacity="0.8"/></svg>',
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
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }] })
  });
  if (!res.ok) throw new Error('API error: ' + res.status);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
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

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

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
    showToast('Welcome, ' + form.name + '!', 'success'); setScreen('home');
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
    showToast('Welcome back, ' + user.name + '!', 'success'); setScreen('home');
  };

  const handleLogout = () => { setSession(null); setCurrentBox(null); save(KEYS.SESSION, null); setScreen('auth'); };

  const createBox = () => {
    if (!form.boxName?.trim()) return showToast('名前を入力してください', 'error');
    const id = genId();
    const nb = { ...boxes, [id]: { id, name: form.boxName.trim(), icon: form.boxIcon || 'fridge', ownerId: session.userId, members: [session.userId], inviteCode: genCode(), createdAt: Date.now() } };
    persist(null, nb, null);
    const s = { ...session, boxId: id }; setSession(s); save(KEYS.SESSION, s);
    setCurrentBox(id); setForm({});
    showToast('Box created!', 'success'); setScreen('box');
  };

  const joinBox = () => {
    const code = inviteInput.trim().toUpperCase();
    if (!code) return showToast('招待コードを入力してください', 'error');
    const box = Object.values(boxes).find(b => b.inviteCode === code);
    if (!box) return showToast('招待コードが正しくありません', 'error');
    if (box.members.includes(session.userId)) return showToast('既にメンバーです', 'error');
    persist(null, { ...boxes, [box.id]: { ...box, members: [...box.members, session.userId] } }, null);
    const s = { ...session, boxId: box.id }; setSession(s); save(KEYS.SESSION, s);
    setCurrentBox(box.id); setInviteInput('');
    showToast('Joined ' + box.name + '!', 'success'); setScreen('box');
  };

  const refreshCode = () => {
    const box = boxes[currentBox];
    if (!box || box.ownerId !== session.userId) return showToast('オーナーのみ変更できます', 'error');
    persist(null, { ...boxes, [box.id]: { ...box, inviteCode: genCode() } }, null);
    showToast('Code refreshed!', 'success');
  };

  const addItem = () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    const id = genId();
    persist(null, null, { ...items, [id]: { id, boxId: currentBox, name: form.itemName.trim(), category: form.category || '食料品その他', quantity: form.quantity || '1', unit: form.unit || '', expiry: form.expiry || '', purchaseDate: form.purchaseDate || '', note: form.note || '', addedBy: session.userId, addedAt: Date.now(), updatedAt: Date.now() } });
    setForm({}); showToast('Added!', 'success'); setScreen('box');
  };

  const updateItem = () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    persist(null, null, { ...items, [editingItem.id]: { ...items[editingItem.id], name: form.itemName.trim(), category: form.category || '食料品その他', quantity: form.quantity || '1', unit: form.unit || '', expiry: form.expiry || '', purchaseDate: form.purchaseDate || '', note: form.note || '', updatedAt: Date.now() } });
    setEditingItem(null); setForm({}); showToast('Updated!', 'success'); setScreen('box');
  };

  const deleteItem = (id) => { const ni = { ...items }; delete ni[id]; persist(null, null, ni); setConfirmDelete(null); showToast('Deleted', 'info'); };

  const openEditItem = (item) => {
    setEditingItem(item);
    setForm({ itemName: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiry: item.expiry, purchaseDate: item.purchaseDate || '', note: item.note });
    setScreen('editItem');
  };

  const handleBarcode = async (file) => {
    setShowAddMenu(false); setScanning(true); setScanMsg('バーコードを読み取り中...');
    try {
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e'] });
        const codes = await detector.detect(await createImageBitmap(file));
        if (!codes.length) { showToast('バーコードが読み取れませんでした', 'error'); setScanning(false); return; }
        setScanMsg('商品情報を検索中...');
        const product = await lookupBarcode(codes[0].rawValue);
        setScanning(false);
        if (!product) { showToast('DBに商品が見つかりませんでした', 'error'); setForm({ purchaseDate: today() }); setScreen('addItem'); return; }
        setForm({ itemName: product.name, category: product.category, quantity: product.quantity, unit: product.unit, purchaseDate: today() });
        setScreen('addItem'); showToast('商品情報を取得しました!', 'success');
      } else { setScanning(false); showToast('このブラウザはバーコード非対応です', 'error'); setForm({ purchaseDate: today() }); setScreen('addItem'); }
    } catch { setScanning(false); showToast('読み取りに失敗しました', 'error'); }
  };

  const handleReceipt = async (file) => {
    setShowAddMenu(false);
    if (!geminiKey) { showToast('設定からGemini APIキーを入力してください', 'error'); setScreen('settings'); return; }
    setScanning(true); setScanMsg('AIがレシートを解析中...');
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(file); });
      const results = await analyzeReceipt(geminiKey, base64, file.type);
      if (!results.length) { showToast('商品を読み取れませんでした', 'error'); setScanning(false); return; }
      if (results.some(i => !ALL_CATS.includes(i.category))) { setPendingItems(results); setScanning(false); setScreen('scanConfirm'); }
      else { setScannedItems(results); setScanning(false); setScreen('scanResult'); }
    } catch { showToast('読み取りに失敗しました', 'error'); setScanning(false); }
  };

  const confirmAndAddScanned = () => {
    const now = Date.now(); const newItems = { ...items };
    scannedItems.forEach(item => { const id = genId(); newItems[id] = { id, boxId: currentBox, name: item.name, category: item.category || '食料品その他', quantity: item.quantity || '1', unit: item.unit || '', expiry: '', purchaseDate: item.purchaseDate || today(), note: '', addedBy: session.userId, addedAt: now, updatedAt: now }; });
    persist(null, null, newItems);
    showToast(scannedItems.length + ' items added!', 'success'); setScannedItems([]); setScreen('box');
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
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    * { box-sizing:border-box; }
    body { margin:0; background:#f8f7f5; }
    select option { background:#fff; color:#1a1a1a; }
    input[type=date] { color-scheme:light; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    .pressable:active { transform:scale(0.97); opacity:0.9; }
    .item-row:active { background:#f0f0ef !important; }
  `;

  const accent = '#6366f1';
  const accentLight = '#eef2ff';
  const danger = '#ef4444';
  const text = '#1a1a1a';
  const textMuted = '#9ca3af';
  const border = '#e5e5e3';
  const cardBg = '#ffffff';

  const S = {
    app: { minHeight:'100dvh', background:'#f8f7f5', fontFamily:"'DM Sans', sans-serif", color:text },
    wrap: { maxWidth:430, margin:'0 auto', padding:'0 20px', minHeight:'100dvh' },
    card: { background:cardBg, borderRadius:18, padding:'18px 20px', border:'1px solid ' + border },
    btn: (c=accent) => ({ background:c, color:'#fff', border:'none', borderRadius:12, padding:'13px 20px', fontSize:15, fontWeight:600, cursor:'pointer', width:'100%', marginTop:10, letterSpacing:'-0.01em', fontFamily:'inherit' }),
    btnGhost: { background:'transparent', color:textMuted, border:'1.5px solid ' + border, borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:500, cursor:'pointer', width:'100%', marginTop:8, fontFamily:'inherit' },
    input: { width:'100%', background:'#fafaf9', border:'1.5px solid ' + border, borderRadius:12, padding:'12px 14px', fontSize:15, color:text, outline:'none', marginTop:6, fontFamily:'inherit', fontWeight:400 },
    label: { fontSize:11, fontWeight:600, color:textMuted, textTransform:'uppercase', letterSpacing:'0.08em', display:'block' },
    hdr: { display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:20, paddingBottom:16 },
    iconBtn: { background:cardBg, border:'1.5px solid ' + border, borderRadius:12, padding:'9px 14px', cursor:'pointer', fontSize:14, fontWeight:500, fontFamily:'inherit', color:textMuted, display:'flex', alignItems:'center', gap:4 },
    tag: (bg, fg) => ({ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600, background:bg, color:fg||text, whiteSpace:'nowrap' }),
    toast: (t) => ({ position:'fixed', bottom:88, left:'50%', transform:'translateX(-50%)', background:t==='error'?danger:t==='success'?'#22c55e':accent, color:'#fff', padding:'10px 20px', borderRadius:50, fontSize:13, fontWeight:600, zIndex:1000, whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,0.15)', animation:'fadeUp 0.25s ease' }),
  };

  const BoxIcon = ({k, size=40}) => (
    <div dangerouslySetInnerHTML={{__html: BOX_SVG[k] || BOX_SVG['fridge']}}
      style={{width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}} />
  );

  if (screen === 'loading') return (
    <div style={{...S.app, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <style>{CSS}</style>
      <div style={{textAlign:'center'}}>
        <BoxIcon k='fridge' size={56} />
        <div style={{fontWeight:700, fontSize:20, marginTop:12, letterSpacing:'-0.03em'}}>HomeStock</div>
        <div style={{color:textMuted, marginTop:4, fontSize:13}}>Loading...</div>
      </div>
    </div>
  );

  if (screen === 'auth') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={{paddingTop:64, paddingBottom:40, textAlign:'center'}}>
          <div style={{display:'inline-flex', background:accentLight, borderRadius:20, padding:14, marginBottom:16}}>
            <BoxIcon k='fridge' size={44} />
          </div>
          <h1 style={{fontSize:28, fontWeight:700, margin:'0 0 6px', letterSpacing:'-0.04em'}}>HomeStock</h1>
          <p style={{color:textMuted, fontSize:14, margin:0}}>家族みんなで在庫を管理</p>
        </div>
        <div style={{display:'flex', gap:4, marginBottom:24, background:'#f0f0ef', borderRadius:14, padding:3}}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => {setAuthMode(m);setForm({});}}
              style={{flex:1, padding:'10px', borderRadius:11, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, fontFamily:'inherit', transition:'all 0.18s', background:authMode===m?cardBg:'transparent', color:authMode===m?text:textMuted, boxShadow:authMode===m?'0 1px 4px rgba(0,0,0,0.1)':'none'}}>
              {m==='login'?'Log in':'Sign up'}
            </button>
          ))}
        </div>
        <div style={{...S.card, animation:'scaleIn 0.25s ease'}}>
          {authMode==='register' && <div style={{marginBottom:14}}><label style={S.label}>Name</label><input style={S.input} placeholder='Your name' value={form.name||''} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>}
          <div style={{marginBottom:14}}><label style={S.label}>Email</label><input style={S.input} type='email' placeholder='you@example.com' value={form.email||''} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
          <div style={{marginBottom:4}}><label style={S.label}>Password</label><input style={S.input} type='password' placeholder='6+ characters' value={form.password||''} onChange={e=>setForm(p=>({...p,password:e.target.value}))} /></div>
          <button className='pressable' style={S.btn()} onClick={authMode==='login'?handleLogin:handleRegister} disabled={loading}>
            {loading?'...' : authMode==='login'?'Log in':'Create account'}
          </button>
        </div>
        <div style={{height:40}} />
      </div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'settings') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={()=>setScreen(currentBox?'box':'home')} style={S.iconBtn}>← Back</button>
          <span style={{fontWeight:700, fontSize:16}}>Settings</span>
          <div style={{width:72}} />
        </div>
        <div style={{...S.card, marginBottom:12}}>
          <div style={{fontWeight:700, marginBottom:4, fontSize:15}}>Gemini API Key</div>
          <p style={{color:textMuted, fontSize:13, marginBottom:14, marginTop:4, lineHeight:1.5}}>レシート読み取りに使用。バーコードには不要。<br/>aistudio.google.comで無料取得できます。</p>
          <label style={S.label}>API Key</label>
          <input style={S.input} type='password' placeholder='AIza...' value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} />
          <button className='pressable' style={S.btn()} onClick={()=>{save(KEYS.APIKEY,geminiKey);showToast('Saved!','success');}}>Save</button>
        </div>
        <div style={S.card}>
          <div style={{fontWeight:700, marginBottom:4, fontSize:15}}>Account</div>
          <div style={{color:textMuted, fontSize:14, margin:'8px 0 16px'}}>{user?.name} · {user?.email}</div>
          <button className='pressable' style={S.btnGhost} onClick={handleLogout}>Log out</button>
        </div>
        <div style={{height:40}} />
      </div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'home') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div>
            <div style={{fontSize:13, color:textMuted, fontWeight:500}}>Good day,</div>
            <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em', marginTop:1}}>{user?.name}</div>
          </div>
          <button onClick={()=>setScreen('settings')} style={S.iconBtn}>⚙️</button>
        </div>
        {Object.values(boxes).filter(b=>b.members.includes(session.userId)).length > 0 && (
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11, fontWeight:600, color:textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>My Boxes</div>
            {Object.values(boxes).filter(b=>b.members.includes(session.userId)).map(b => {
              const count = Object.values(items).filter(i=>i.boxId===b.id).length;
              const foodCount = Object.values(items).filter(i=>i.boxId===b.id&&FOOD_CATS.includes(i.category)).length;
              return (
                <div key={b.id} className='pressable' onClick={()=>{const s={...session,boxId:b.id};setSession(s);save(KEYS.SESSION,s);setCurrentBox(b.id);setScreen('box');}}
                  style={{...S.card, marginBottom:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:14}}>
                    <div style={{background:'#f5f5f3', borderRadius:14, width:52, height:52, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <BoxIcon k={b.icon} size={40} />
                    </div>
                    <div>
                      <div style={{fontWeight:600, fontSize:15, letterSpacing:'-0.01em'}}>{b.name}</div>
                      <div style={{color:textMuted, fontSize:12, marginTop:2}}>{b.members.length} members · {foodCount} food · {count-foodCount} supplies</div>
                    </div>
                  </div>
                  <span style={{color:border, fontSize:20}}>›</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{...S.card, marginBottom:10, border:'1.5px dashed ' + border}}>
          <div style={{fontWeight:700, marginBottom:16, fontSize:15, letterSpacing:'-0.01em'}}>New Box</div>
          <label style={S.label}>Icon</label>
          <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:8, marginBottom:16}}>
            {BOX_ICON_KEYS.map(k=>(
              <button key={k} onClick={()=>setForm(p=>({...p,boxIcon:k}))} title={BOX_LABELS[k]}
                style={{background:form.boxIcon===k?accentLight:'#f5f5f3', border:form.boxIcon===k?'1.5px solid '+accent:'1.5px solid transparent', borderRadius:12, padding:'8px', cursor:'pointer', transition:'all 0.15s'}}>
                <BoxIcon k={k} size={40} />
              </button>
            ))}
          </div>
          <label style={S.label}>Box name</label>
          <input style={S.input} placeholder='e.g. Kitchen, Bathroom' value={form.boxName||''} onChange={e=>setForm(p=>({...p,boxName:e.target.value}))} />
          <button className='pressable' style={S.btn()} onClick={createBox}>Create box</button>
        </div>
        <div style={{...S.card, border:'1.5px dashed ' + border}}>
          <div style={{fontWeight:700, marginBottom:12, fontSize:15, letterSpacing:'-0.01em'}}>Join with invite code</div>
          <input style={S.input} placeholder='XX-XX-XX-XX' value={inviteInput} onChange={e=>setInviteInput(e.target.value)} />
          <button className='pressable' style={S.btn('#374151')} onClick={joinBox}>Join</button>
        </div>
        <div style={{height:40}} />
      </div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
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
              <button onClick={()=>setScreen('home')} style={{background:'none',border:'none',color:textMuted,cursor:'pointer',fontSize:13,padding:0,fontFamily:'inherit',fontWeight:500}}>← Back</button>
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:2}}>
                <BoxIcon k={box?.icon} size={24} />
                <span style={{fontWeight:700, fontSize:17, letterSpacing:'-0.02em'}}>{box?.name}</span>
              </div>
              <div style={{color:textMuted, fontSize:12, marginTop:1}}>{box?.members.length} members · {boxItems.length} items</div>
            </div>
            <div style={{display:'flex', gap:6}}>
              <button onClick={()=>setShowInvite(!showInvite)} style={S.iconBtn}>🔗</button>
              <button onClick={()=>setScreen('settings')} style={S.iconBtn}>⚙️</button>
            </div>
          </div>
          {showInvite && (
            <div style={{...S.card, marginBottom:14, animation:'fadeUp 0.2s ease'}}>
              <div style={{fontSize:11, fontWeight:600, color:textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8}}>Invite Code</div>
              <div style={{background:'#f5f5f3', borderRadius:12, padding:'14px', fontFamily:'monospace', fontSize:20, fontWeight:700, color:accent, textAlign:'center', letterSpacing:4}}>{box?.inviteCode}</div>
              <div style={{color:textMuted, fontSize:12, marginTop:8, textAlign:'center'}}>Share this code to invite family members</div>
              {box?.ownerId===session.userId && <button className='pressable' style={S.btnGhost} onClick={refreshCode}>Refresh code</button>}
            </div>
          )}
          {expiredItems.length > 0 && <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'10px 14px', marginBottom:10, fontSize:13, fontWeight:600, color:danger}}>⚠ {expiredItems.length} item{expiredItems.length>1?'s':''} expired</div>}
          {expiringItems.length > 0 && <div style={{background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'10px 14px', marginBottom:10, fontSize:13, fontWeight:600, color:'#d97706'}}>⏳ {expiringItems.length} item{expiringItems.length>1?'s':''} expiring soon</div>}
          {scanning && <div style={{background:accentLight, border:'1px solid #c7d2fe', borderRadius:12, padding:'12px 14px', marginBottom:12, fontSize:13, fontWeight:600, color:accent, animation:'fadeUp 0.2s ease'}}>{scanMsg}</div>}
          <div style={{display:'flex', gap:4, marginBottom:12, background:'#f0f0ef', borderRadius:12, padding:3}}>
            {[['all','All'],['food','Food'],['supply','Supplies']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilterType(v)} style={{flex:1, padding:'7px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', background:filterType===v?cardBg:'transparent', color:filterType===v?text:textMuted, boxShadow:filterType===v?'0 1px 3px rgba(0,0,0,0.08)':'none', transition:'all 0.15s'}}>{l}</button>
            ))}
          </div>
          <div style={{display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4}}>
            <button onClick={()=>setFilterCat('all')} style={{padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'inherit', background:filterCat==='all'?accent:'#f0f0ef', color:filterCat==='all'?'#fff':textMuted, flexShrink:0}}>All</button>
            {ALL_CATS.map(cat=>(
              <button key={cat} onClick={()=>setFilterCat(cat)} style={{whiteSpace:'nowrap', padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'inherit', background:filterCat===cat?CAT_COLORS[cat]:'#f0f0ef', color:filterCat===cat?'#333':textMuted, flexShrink:0}}>
                {CAT_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
          <div style={{display:'flex', gap:8, marginBottom:16, alignItems:'center'}}>
            <span style={{fontSize:12, color:textMuted, fontWeight:500, whiteSpace:'nowrap'}}>Sort:</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{...S.input, marginTop:0, padding:'7px 12px', fontSize:12, width:'auto'}}>
              <option value='name'>Name</option>
              <option value='expiry'>Expiry</option>
              <option value='added'>Added</option>
            </select>
          </div>
          {filteredItems.length===0 ? (
            <div style={{textAlign:'center', padding:'56px 0', color:textMuted}}>
              <div style={{fontSize:44, marginBottom:12}}>📭</div>
              <div style={{fontWeight:600, fontSize:15}}>Nothing here yet</div>
              <div style={{fontSize:13, marginTop:4}}>Tap + to add items</div>
            </div>
          ) : filteredItems.map(item => {
            const exp=isExpired(item.expiry), expi=isExpiringSoon(item.expiry), byUser=users[item.addedBy];
            const isSupply = SUPPLY_CATS.includes(item.category);
            const catColor = CAT_COLORS[item.category] || '#f1f5f9';
            return (
              <div key={item.id} className='item-row pressable' style={{...S.card, marginBottom:6, cursor:'pointer', display:'flex', alignItems:'center', gap:12}} onClick={()=>openEditItem(item)}>
                <div style={{fontSize:26, flexShrink:0, background:catColor, borderRadius:12, width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center'}}>{CAT_ICONS[item.category]||'📦'}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap'}}>
                    <span style={{fontWeight:600, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em'}}>{item.name}</span>
                    {exp && <span style={{...S.tag('#fef2f2','#ef4444')}}>Expired</span>}
                    {!exp&&expi && <span style={{...S.tag('#fffbeb','#d97706')}}>Soon</span>}
                    {isSupply && <span style={{...S.tag('#f5f5f3',textMuted)}}>Supply</span>}
                  </div>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap', alignItems:'center'}}>
                    <span style={{...S.tag(catColor,'#555')}}>{item.category}</span>
                    <span style={{color:textMuted, fontSize:12, fontWeight:500}}>{item.quantity}{item.unit}</span>
                    {item.expiry && <span style={{color:exp?danger:expi?'#d97706':textMuted, fontSize:11}}>📅 {item.expiry}</span>}
                    {item.purchaseDate && <span style={{color:textMuted, fontSize:11}}>🛒 {item.purchaseDate}</span>}
                    <span style={{color:'#d1d5db', fontSize:11}}>by {byUser?.name||'?'}</span>
                  </div>
                  {item.note && <div style={{color:textMuted, fontSize:12, marginTop:3}}>📝 {item.note}</div>}
                </div>
                <button onClick={e=>{e.stopPropagation();setConfirmDelete(item);}} style={{background:'#fef2f2', border:'none', color:danger, borderRadius:10, padding:'8px 10px', cursor:'pointer', fontSize:15, flexShrink:0}}>🗑</button>
              </div>
            );
          })}
          <div style={{height:100}} />
        </div>
        <input ref={barcodeRef} type='file' accept='image/*' capture='environment' style={{display:'none'}} onChange={e=>{if(e.target.files[0])handleBarcode(e.target.files[0]);e.target.value='';}} />
        <input ref={receiptRef} type='file' accept='image/*' style={{display:'none'}} onChange={e=>{if(e.target.files[0])handleReceipt(e.target.files[0]);e.target.value='';}} />
        {showAddMenu && (
          <div style={{position:'fixed', inset:0, zIndex:150, background:'rgba(0,0,0,0.2)', backdropFilter:'blur(2px)'}} onClick={()=>setShowAddMenu(false)}>
            <div style={{position:'fixed', bottom:96, right:20, display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}} onClick={e=>e.stopPropagation()}>
              {[
                {label:'Type manually', bg:'#374151', action:()=>{setShowAddMenu(false);setForm({purchaseDate:today()});setScreen('addItem');}},
                {label:'Scan receipt', bg:'#0891b2', action:()=>receiptRef.current?.click()},
                {label:'Scan barcode', bg:accent, action:()=>barcodeRef.current?.click()},
              ].map(({label,bg,action}) => (
                <button key={label} className='pressable' onClick={action}
                  style={{background:bg, color:'#fff', border:'none', borderRadius:50, padding:'11px 20px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', animation:'fadeUp 0.2s ease', whiteSpace:'nowrap'}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className='pressable' onClick={()=>setShowAddMenu(!showAddMenu)}
          style={{position:'fixed', bottom:24, right:24, width:56, height:56, borderRadius:'50%', background:showAddMenu?danger:accent, border:'none', color:'#fff', fontSize:26, cursor:'pointer', zIndex:160, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(99,102,241,0.4)', transition:'all 0.2s', transform:showAddMenu?'rotate(45deg)':'rotate(0deg)'}}>+</button>
        {confirmDelete && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 20px', backdropFilter:'blur(2px)'}}>
            <div style={{...S.card, maxWidth:340, width:'100%', animation:'scaleIn 0.2s ease', textAlign:'center', padding:'28px 24px'}}>
              <div style={{fontSize:40, marginBottom:10}}>🗑</div>
              <div style={{fontWeight:700, fontSize:16, marginBottom:6, letterSpacing:'-0.02em'}}>Delete "{confirmDelete.name}"?</div>
              <div style={{color:textMuted, fontSize:13, marginBottom:20}}>This cannot be undone.</div>
              <button className='pressable' style={S.btn(danger)} onClick={()=>deleteItem(confirmDelete.id)}>Delete</button>
              <button className='pressable' style={S.btnGhost} onClick={()=>setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        )}
        {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  if (screen === 'scanResult') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={()=>{setScannedItems([]);setScreen('box');}} style={S.iconBtn}>← Cancel</button>
          <span style={{fontWeight:700, fontSize:16}}>Scan result</span>
          <div style={{width:80}} />
        </div>
        <div style={{...S.card, marginBottom:14, background:accentLight, border:'1px solid #c7d2fe', textAlign:'center'}}>
          <div style={{fontWeight:700, color:accent, fontSize:15}}>{scannedItems.length} items detected</div>
          <div style={{color:textMuted, fontSize:12, marginTop:2}}>Review and confirm below</div>
        </div>
        {scannedItems.map((item,i) => (
          <div key={i} style={{...S.card, marginBottom:8, display:'flex', alignItems:'center', gap:12}}>
            <div style={{fontSize:26, background:CAT_COLORS[item.category]||'#f1f5f9', borderRadius:12, width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{CAT_ICONS[item.category]||'📦'}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600, fontSize:15}}>{item.name}</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:4}}>
                <span style={{...S.tag(CAT_COLORS[item.category]||'#f1f5f9','#555')}}>{item.category}</span>
                <span style={{color:textMuted, fontSize:12}}>{item.quantity}{item.unit}</span>
                {item.purchaseDate && <span style={{color:textMuted, fontSize:12}}>🛒 {item.purchaseDate}</span>}
              </div>
            </div>
            <button onClick={()=>setScannedItems(scannedItems.filter((_,j)=>j!==i))} style={{background:'#fef2f2', border:'none', color:danger, borderRadius:10, padding:'6px 10px', cursor:'pointer', fontSize:14, flexShrink:0}}>✕</button>
          </div>
        ))}
        <button className='pressable' style={S.btn()} onClick={confirmAndAddScanned}>Add {scannedItems.length} items</button>
        <button className='pressable' style={S.btnGhost} onClick={()=>{setScannedItems([]);setScreen('box');}}>Cancel</button>
        <div style={{height:40}} />
      </div>
    </div>
  );

  if (screen === 'scanConfirm') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={()=>{setPendingItems([]);setScreen('box');}} style={S.iconBtn}>← Cancel</button>
          <span style={{fontWeight:700, fontSize:16}}>Confirm categories</span>
          <div style={{width:80}} />
        </div>
        <div style={{...S.card, marginBottom:14, background:'#fffbeb', border:'1px solid #fde68a'}}>
          <div style={{fontWeight:600, color:'#d97706', fontSize:13}}>Some items need category confirmation</div>
        </div>
        {pendingItems.map((item,i) => (
          <div key={i} style={{...S.card, marginBottom:10}}>
            <div style={{fontWeight:600, marginBottom:10, fontSize:15}}>{item.name}</div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {ALL_CATS.map(cat=>(
                <button key={cat} onClick={()=>{const ni=[...pendingItems];ni[i]={...ni[i],category:cat};setPendingItems(ni);}}
                  style={{padding:'5px 10px', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'inherit', background:item.category===cat?CAT_COLORS[cat]:'#f5f5f3', color:item.category===cat?'#333':textMuted, transition:'all 0.12s'}}>
                  {CAT_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className='pressable' style={S.btn()} onClick={()=>{setScannedItems(pendingItems);setPendingItems([]);setScreen('scanResult');}}>Confirm →</button>
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
            <button onClick={()=>{setScreen('box');setForm({});setEditingItem(null);}} style={S.iconBtn}>← Cancel</button>
            <span style={{fontWeight:700, fontSize:16}}>{isEdit?'Edit item':'Add item'}</span>
            <div style={{width:72}} />
          </div>
          <div style={S.card}>
            <div style={{marginBottom:14}}><label style={S.label}>Item name *</label><input style={S.input} placeholder='e.g. Milk' value={form.itemName||''} onChange={e=>setForm(p=>({...p,itemName:e.target.value}))} /></div>
            <div style={{marginBottom:14}}><label style={S.label}>Category</label>
              <select style={S.input} value={form.category||'食料品その他'} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                <optgroup label='Food'>{FOOD_CATS.map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</optgroup>
                <optgroup label='Supplies'>{SUPPLY_CATS.map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</optgroup>
              </select>
            </div>
            <div style={{display:'flex', gap:12, marginBottom:14}}>
              <div style={{flex:1}}><label style={S.label}>Quantity</label><input style={S.input} type='number' min='0' step='0.1' placeholder='1' value={form.quantity||''} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} /></div>
              <div style={{flex:1}}><label style={S.label}>Unit</label><input style={S.input} placeholder='pcs / ml / g' value={form.unit||''} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} /></div>
            </div>
            <div style={{marginBottom:14}}><label style={S.label}>Expiry date</label><input style={S.input} type='date' value={form.expiry||''} onChange={e=>setForm(p=>({...p,expiry:e.target.value}))} /></div>
            <div style={{marginBottom:14}}><label style={S.label}>Purchase date</label><input style={S.input} type='date' value={form.purchaseDate||''} onChange={e=>setForm(p=>({...p,purchaseDate:e.target.value}))} /></div>
            <div style={{marginBottom:8}}><label style={S.label}>Note</label><input style={S.input} placeholder='e.g. Opened, Low stock' value={form.note||''} onChange={e=>setForm(p=>({...p,note:e.target.value}))} /></div>
            <button className='pressable' style={S.btn()} onClick={isEdit?updateItem:addItem}>{isEdit?'Update':'Add item'}</button>
          </div>
          <div style={{height:40}} />
        </div>
        {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  return null;
}
