import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { ref, set, get, onValue, update, remove } from 'firebase/database';
import { genId, genCode, today, hashPassword, lsGet, lsSet } from './utils';
import { lookupBarcode, analyzeReceipt, estimateExpiry } from './api';
import { DEFAULT_ALL_CATS, DEFAULT_CAT_ICONS, DEFAULT_CAT_COLORS } from './constants';

export function useAppState() {
  const [screen, setScreen] = useState('loading');
  const [users, setUsers] = useState({});
  const [boxes, setBoxes] = useState({});
  const [allItems, setAllItems] = useState({});
  const [items, setItems] = useState({});
  const [session, setSession] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingBox, setEditingBox] = useState(null);
  const [toast, setToast] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({});
  const [filterCat, setFilterCat] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [inviteInput, setInviteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [guideStep, setGuideStep] = useState(null);
  const [friends, setFriends] = useState({});
  const [showCode, setShowCode] = useState(false);
  const [userCats, setUserCats] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#f1f5f9');
  const [shortageList, setShortageList] = useState({});
  const [shortageForm, setShortageForm] = useState({ name: '', quantity: '1', unit: '個' });
  const [showShortageAdd, setShowShortageAdd] = useState(false);
  const [buyingItem, setBuyingItem] = useState(null);
  const [buyBoxId, setBuyBoxId] = useState('');
  const [estimatingExpiry, setEstimatingExpiry] = useState(false);
  const receiptRef = useRef(null);
  const barcodeRef = useRef(null);
  const shortageBarcodeRef = useRef(null);

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };
  const saveSession = (s) => { setSession(s); lsSet('hs-session', s); };

  const cats = userCats ? userCats.map(c => c.name) : DEFAULT_ALL_CATS;
  const catIcons = userCats ? Object.fromEntries(userCats.map(c => [c.name, c.icon])) : DEFAULT_CAT_ICONS;
  const catColors = userCats ? Object.fromEntries(userCats.map(c => [c.name, c.color])) : DEFAULT_CAT_COLORS;

  useEffect(() => {
    const s = lsGet('hs-session', null);
    const k = lsGet('hs-gemini', '') || lsGet('fs-gemini-key', '');
    setGeminiKey(k);
    if (s?.userId) {
      setSession(s);
      setCurrentBox(null);
      onValue(ref(db, 'users/' + s.userId), snap => { if (snap.val()) setCurrentUser(snap.val()); });
      onValue(ref(db, 'users'), snap => { if (snap.val()) setUsers(snap.val()); });
      onValue(ref(db, 'boxes'), snap => { setBoxes(snap.val() || {}); });
      onValue(ref(db, 'friends/' + s.userId), snap => { setFriends(snap.val() || {}); });
      onValue(ref(db, 'userCats/' + s.userId), snap => { setUserCats(snap.val() || null); });
      onValue(ref(db, 'shortageList/' + s.userId), snap => { setShortageList(snap.val() || {}); });
      onValue(ref(db, 'items'), snap => { setAllItems(snap.val() || {}); });
      setScreen('home');
    } else setScreen('auth');
  }, []);

  useEffect(() => {
    if (currentBox) onValue(ref(db, 'items/' + currentBox), snap => { setItems(snap.val() || {}); });
  }, [currentBox]);

  const saveCats = async (newCats) => {
    setUserCats(newCats);
    await set(ref(db, 'userCats/' + session.userId), newCats);
  };

  const addCat = async () => {
    if (!newCatName.trim()) return showToast('カテゴリ名を入力してください', 'error');
    if (cats.includes(newCatName.trim())) return showToast('同じ名前のカテゴリが既にあります', 'error');
    const base = userCats || DEFAULT_ALL_CATS.map(n => ({ name: n, icon: DEFAULT_CAT_ICONS[n] || '📦', color: DEFAULT_CAT_COLORS[n] || '#f1f5f9' }));
    await saveCats([...base, { name: newCatName.trim(), icon: newCatIcon, color: newCatColor }]);
    setNewCatName(''); showToast('カテゴリを追加しました！', 'success');
  };

  const deleteCat = async (name) => {
    const base = userCats || DEFAULT_ALL_CATS.map(n => ({ name: n, icon: DEFAULT_CAT_ICONS[n] || '📦', color: DEFAULT_CAT_COLORS[n] || '#f1f5f9' }));
    await saveCats(base.filter(c => c.name !== name));
    showToast('削除しました', 'info');
  };

  const addShortage = async (item) => {
    const id = genId();
    await set(ref(db, 'shortageList/' + session.userId + '/' + id), { id, name: item.name, quantity: item.quantity || '1', unit: item.unit || '個', addedAt: Date.now() });
    showToast(item.name + 'を在庫切れリストに追加しました', 'success');
  };

  const removeShortage = async (id) => {
    await remove(ref(db, 'shortageList/' + session.userId + '/' + id));
  };

  const handleBought = async (shortage) => {
    const id = genId();
    await set(ref(db, 'items/' + buyBoxId + '/' + id), {
      id, boxId: buyBoxId, name: shortage.name,
      category: cats[0] || '食料品その他',
      quantity: shortage.quantity || '1', unit: shortage.unit || '個',
      expiry: '', purchaseDate: today(), note: '',
      addedBy: session.userId, addedAt: Date.now(), updatedAt: Date.now()
    });
    await removeShortage(shortage.id);
    setBuyingItem(null); setBuyBoxId('');
    showToast(shortage.name + 'を在庫に追加しました！', 'success');
  };

  const handleRegister = async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.password?.trim()) return showToast('全項目を入力してください', 'error');
    if (form.password.length < 6) return showToast('パスワードは6文字以上', 'error');
    setLoading(true);
    const snap = await get(ref(db, 'users'));
    const allUsers = snap.val() || {};
    if (Object.values(allUsers).find(u => u.email === form.email.toLowerCase())) {
      setLoading(false); return showToast('このメールは登録済みです', 'error');
    }
    const id = genId();
    const hash = await hashPassword(form.password);
    const newUser = { id, name: form.name.trim(), email: form.email.toLowerCase(), hash, inviteCode: genCode(), createdAt: Date.now() };
    await set(ref(db, 'users/' + id), newUser);
    setCurrentUser(newUser);
    saveSession({ userId: id, boxId: null });
    setLoading(false); setForm({});
    showToast('ようこそ、' + form.name + 'さん！', 'success');
    setGuideStep(0); setScreen('guide');
  };

  const handleLogin = async () => {
    if (!form.email?.trim() || !form.password?.trim()) return showToast('メールとパスワードを入力してください', 'error');
    setLoading(true);
    const snap = await get(ref(db, 'users'));
    const allUsers = snap.val() || {};
    const user = Object.values(allUsers).find(u => u.email === form.email.toLowerCase());
    if (!user) { setLoading(false); return showToast('メールまたはパスワードが違います', 'error'); }
    const hash = await hashPassword(form.password);
    if (hash !== user.hash) { setLoading(false); return showToast('メールまたはパスワードが違います', 'error'); }
    if (!user.inviteCode) {
      const code = genCode();
      await update(ref(db, 'users/' + user.id), { inviteCode: code });
      user.inviteCode = code;
    }
    setCurrentUser(user);
    setUsers(allUsers);
    saveSession({ userId: user.id, boxId: null });
    const boxSnap = await get(ref(db, 'boxes'));
    if (boxSnap.val()) setBoxes(boxSnap.val());
    const friendSnap = await get(ref(db, 'friends/' + user.id));
    setFriends(friendSnap.val() || {});
    setLoading(false); setForm({});
    showToast('おかえりなさい、' + user.name + 'さん！', 'success');
    setScreen('home');
  };

  const handleLogout = () => { saveSession(null); setCurrentBox(null); setCurrentUser(null); setScreen('auth'); };

  const addFriend = async () => {
    const code = inviteInput.trim().toUpperCase();
    if (!code) return showToast('招待コードを入力してください', 'error');
    const snap = await get(ref(db, 'users'));
    const allUsers = snap.val() || {};
    const target = Object.values(allUsers).find(u => u.inviteCode === code);
    if (!target) return showToast('招待コードが正しくありません', 'error');
    if (target.id === session.userId) return showToast('自分のコードは使えません', 'error');
    if (friends[target.id]) return showToast('既に追加済みです', 'error');
    await update(ref(db, 'friends/' + session.userId), { [target.id]: true });
    await update(ref(db, 'friends/' + target.id), { [session.userId]: true });
    setFriends(prev => ({ ...prev, [target.id]: true }));
    setInviteInput('');
    showToast(target.name + 'さんと繋がりました！', 'success');
  };

  const createBox = async () => {
    if (!form.boxName?.trim()) return showToast('名前を入力してください', 'error');
    const id = genId();
    await set(ref(db, 'boxes/' + id), {
      id, name: form.boxName.trim(), icon: form.boxIcon || 'fridge',
      ownerId: session.userId, createdAt: Date.now(),
      defaultCat: form.defaultCat || cats[0] || '食料品その他',
      enabledCats: form.enabledCats || cats,
    });
    saveSession({ ...session, boxId: id });
    setCurrentBox(id); setForm({});
    showToast('在庫ボックスを作成しました！', 'success'); setScreen('box');
  };

  const updateBox = async () => {
    if (!editingBox) return;
    await update(ref(db, 'boxes/' + editingBox.id), {
      name: form.boxName || editingBox.name,
      icon: form.boxIcon || editingBox.icon,
      defaultCat: form.defaultCat || editingBox.defaultCat,
      enabledCats: form.enabledCats || editingBox.enabledCats || cats,
    });
    setEditingBox(null); setForm({});
    showToast('ボックスを更新しました！', 'success'); setScreen('box');
  };

  const addItem = async () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    const id = genId();
    const box = currentBox ? boxes[currentBox] : null;
    await set(ref(db, 'items/' + currentBox + '/' + id), {
      id, boxId: currentBox, name: form.itemName.trim(),
      category: form.category || box?.defaultCat || cats[0] || '食料品その他',
      quantity: form.quantity || '1', unit: form.unit || '',
      expiry: form.expiry || '', purchaseDate: form.purchaseDate || '',
      note: form.note || '', addedBy: session.userId,
      addedAt: Date.now(), updatedAt: Date.now()
    });
    setForm({}); showToast('追加しました！', 'success'); setScreen('box');
  };

  const updateItem = async () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    const box = currentBox ? boxes[currentBox] : null;
    await update(ref(db, 'items/' + currentBox + '/' + editingItem.id), {
      name: form.itemName.trim(),
      category: form.category || box?.defaultCat || cats[0] || '食料品その他',
      quantity: form.quantity || '1', unit: form.unit || '',
      expiry: form.expiry || '', purchaseDate: form.purchaseDate || '',
      note: form.note || '', updatedAt: Date.now()
    });
    setEditingItem(null); setForm({});
    showToast('更新しました！', 'success'); setScreen('box');
  };

  const deleteItem = async (id) => {
    await remove(ref(db, 'items/' + currentBox + '/' + id));
    setConfirmDelete(null); showToast('削除しました', 'info');
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setForm({ itemName: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiry: item.expiry, purchaseDate: item.purchaseDate || '', note: item.note });
    setScreen('editItem');
  };

  const handleEstimateExpiry = async (itemName, category) => {
    if (!geminiKey || !itemName || form.expiry) return;
    setEstimatingExpiry(true);
    const estimated = await estimateExpiry(geminiKey, itemName, category);
    setEstimatingExpiry(false);
    if (estimated) {
      setForm(p => ({ ...p, expiry: estimated }));
      showToast('賞味期限の目安を自動入力しました', 'info');
    }
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
        const box = currentBox ? boxes[currentBox] : null;
        if (!product) { showToast('DBに商品が見つかりませんでした', 'error'); setForm({ purchaseDate: today(), category: box?.defaultCat || cats[0] }); setScreen('addItem'); return; }
        setForm({ itemName: product.name, category: product.category, quantity: product.quantity, unit: product.unit, purchaseDate: today() });
        setScreen('addItem'); showToast('商品情報を取得しました！', 'success');
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
      const box = currentBox ? boxes[currentBox] : null;
      setScannedItems(results.map(i => ({ ...i, category: cats.includes(i.category) ? i.category : (box?.defaultCat || cats[0]) })));
      setScanning(false); setScreen('scanResult');
    } catch { showToast('読み取りに失敗しました', 'error'); setScanning(false); }
  };

  const handleShortageBarcode = async (file) => {
    setScanning(true); setScanMsg('バーコードを読み取り中...');
    try {
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e'] });
        const codes = await detector.detect(await createImageBitmap(file));
        if (!codes.length) { showToast('バーコードが読み取れませんでした', 'error'); setScanning(false); return; }
        setScanMsg('商品情報を検索中...');
        const product = await lookupBarcode(codes[0].rawValue);
        setScanning(false);
        if (!product) { showToast('DBに商品が見つかりませんでした', 'error'); return; }
        await addShortage(product);
      } else { setScanning(false); showToast('このブラウザはバーコード非対応です', 'error'); }
    } catch { setScanning(false); showToast('読み取りに失敗しました', 'error'); }
  };

  const confirmAndAddScanned = async () => {
    const now = Date.now();
    const box = currentBox ? boxes[currentBox] : null;
    for (const item of scannedItems) {
      const id = genId();
      await set(ref(db, 'items/' + currentBox + '/' + id), {
        id, boxId: currentBox, name: item.name,
        category: item.category || box?.defaultCat || cats[0],
        quantity: item.quantity || '1', unit: item.unit || '',
        expiry: '', purchaseDate: item.purchaseDate || today(),
        note: '', addedBy: session.userId, addedAt: now, updatedAt: now
      });
    }
    showToast(scannedItems.length + '品を追加しました！', 'success');
    setScannedItems([]); setScreen('box');
  };

  const friendIds = Object.keys(friends);
  const visibleBoxes = Object.values(boxes).filter(b => b.ownerId === session?.userId || friendIds.includes(b.ownerId));
  const box = currentBox ? boxes[currentBox] : null;
  const boxEnabledCats = box?.enabledCats || cats;
  const boxItems = Object.values(items);
  const shortageItems = Object.values(shortageList);

  const visibleBoxIds = visibleBoxes.map(b => b.id);
  const allVisibleItems = visibleBoxIds.flatMap(bid => Object.values(allItems[bid] || {}));
  const expiredAll = allVisibleItems.filter(i => i.expiry && new Date(i.expiry) < new Date());
  const expiringAll = allVisibleItems.filter(i => {
    if (!i.expiry) return false;
    const d = (new Date(i.expiry) - new Date()) / 86400000;
    return d >= 0 && d <= 3;
  });

  const filteredItems = boxItems
    .filter(i => filterCat === 'all' || i.category === filterCat)
    .filter(i => filterType === 'all' || (filterType === 'food' ? ['野菜・果物','肉・魚','乳製品','飲み物','調味料','冷凍食品','食料品その他'].includes(i.category) : ['日用品','洗剤・清掃','衛生用品','文房具','電池・電球','備品その他'].includes(i.category)))
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name, 'ja') : sortBy === 'expiry' ? (a.expiry || '9999') < (b.expiry || '9999') ? -1 : 1 : b.addedAt - a.addedAt);

  return {
    screen, setScreen, users, boxes, items, session, currentBox, setCurrentBox,
    currentUser, editingItem, editingBox, setEditingBox, toast, authMode, setAuthMode,
    form, setForm, filterCat, setFilterCat, filterType, setFilterType, sortBy, setSortBy,
    inviteInput, setInviteInput, loading, confirmDelete, setConfirmDelete,
    geminiKey, setGeminiKey, scanning, scanMsg, scannedItems, setScannedItems,
    showAddMenu, setShowAddMenu, guideStep, setGuideStep, friends, showCode, setShowCode,
    userCats, newCatName, setNewCatName, newCatIcon, setNewCatIcon, newCatColor, setNewCatColor,
    shortageList, shortageForm, setShortageForm, showShortageAdd, setShowShortageAdd,
    buyingItem, setBuyingItem, buyBoxId, setBuyBoxId, estimatingExpiry,
    receiptRef, barcodeRef, shortageBarcodeRef,
    cats, catIcons, catColors, box, boxEnabledCats, boxItems, shortageItems,
    visibleBoxes, filteredItems, expiredAll, expiringAll,
    showToast, saveSession, addCat, deleteCat, addShortage, removeShortage,
    handleBought, handleRegister, handleLogin, handleLogout, addFriend,
    createBox, updateBox, addItem, updateItem, deleteItem, openEditItem,
    handleEstimateExpiry, handleBarcode, handleReceipt, handleShortageBarcode,
    confirmAndAddScanned,
  };
}
