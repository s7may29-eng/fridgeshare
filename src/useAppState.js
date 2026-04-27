import { useState, useEffect, useRef } from 'react';
import { db, authReady } from './firebase';
import { ref, set, get, onValue, update, remove } from 'firebase/database';
import { genId, genCode, today, hashPassword, lsGet, lsSet } from './utils';
import { lookupBarcode, analyzeReceipt, estimateExpiry, saveBarcodeEntry, readBarcodeWithGemini } from './api';

async function detectBarcode(file) {
  // 1) ネイティブ BarcodeDetector (Chrome / Android) — 高速、API キー不要
  if ('BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf'] });
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      if (codes.length) return codes[0].rawValue;
    } catch (e) { console.warn('native BarcodeDetector failed:', e); }
  }
  // 2) ネイティブ非対応 or 読取失敗 → null を返し、呼び出し側で Gemini フォールバック
  return null;
}
import { DEFAULT_ALL_CATS, DEFAULT_CAT_ICONS, DEFAULT_CAT_COLORS, BOX_DEFAULT_CATS } from './constants';

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
  const [allFriends, setAllFriends] = useState({});
  const [showCode, setShowCode] = useState(false);
  const [userCats, setUserCats] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#f1f5f9');
  const [shortageMap, setShortageMap] = useState({});
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

  // 品名から絵文字を返す
  const getItemEmoji = (name) => {
    if (!name) return null;
    const n = name.toLowerCase();
    const map = [
      ['りんご','🍎'],['みかん','🍊'],['バナナ','🍌'],['ぶどう','🍇'],['いちご','🍓'],
      ['もも','🍑'],['すいか','🍉'],['メロン','🍈'],['なし','🍐'],['さくらんぼ','🍒'],
      ['レモン','🍋'],['パイナップル','🍍'],['マンゴー','🥭'],['ブルーベリー','🫐'],
      ['トマト','🍅'],['にんじん','🥕'],['ブロッコリー','🥦'],['たまねぎ','🧅'],
      ['にんにく','🧄'],['じゃがいも','🥔'],['さつまいも','🍠'],['とうもろこし','🌽'],
      ['きゅうり','🥒'],['なす','🍆'],['アボカド','🥑'],['ほうれん草','🥬'],
      ['レタス','🥬'],['キャベツ','🥬'],['きのこ','🍄'],['しいたけ','🍄'],
      ['ピーマン','🫑'],['とうがらし','🌶️'],['しょうが','🫚'],
      ['たまご','🥚'],['卵','🥚'],['牛乳','🥛'],['ミルク','🥛'],['チーズ','🧀'],
      ['バター','🧈'],['ヨーグルト','🥛'],
      ['鶏肉','🍗'],['とりにく','🍗'],['牛肉','🥩'],['ぎゅうにく','🥩'],
      ['豚肉','🥩'],['ぶたにく','🥩'],['ひき肉','🥩'],['サーモン','🐟'],
      ['まぐろ','🐟'],['さけ','🐟'],['えび','🦐'],['いか','🦑'],['たこ','🐙'],
      ['あさり','🦪'],['しじみ','🦪'],
      ['パン','🍞'],['食パン','🍞'],['米','🍚'],['ごはん','🍚'],['麺','🍜'],
      ['パスタ','🍝'],['うどん','🍜'],['そば','🍜'],['ラーメン','🍜'],
      ['豆腐','🫘'],['納豆','🫘'],['みそ','🫙'],['しょうゆ','🫙'],
      ['ケチャップ','🫙'],['マヨネーズ','🫙'],['ソース','🫙'],['酢','🫙'],
      ['砂糖','🫙'],['塩','🧂'],['こしょう','🧂'],['油','🫙'],
      ['コーヒー','☕'],['お茶','🍵'],['紅茶','🍵'],['緑茶','🍵'],
      ['ジュース','🧃'],['水','💧'],['炭酸','🥤'],['コーラ','🥤'],
      ['ビール','🍺'],['ワイン','🍷'],['日本酒','🍶'],['ウイスキー','🥃'],
      ['アイス','🍦'],['チョコ','🍫'],['クッキー','🍪'],['ケーキ','🎂'],
      ['シャンプー','🧴'],['リンス','🧴'],['洗剤','🧼'],['石けん','🧼'],
      ['歯ブラシ','🪥'],['歯磨き','🪥'],['ティッシュ','🧻'],['トイレットペーパー','🧻'],
      ['電池','🔋'],['電球','💡'],['薬','💊'],['マスク','😷'],
    ];
    for (const [kw, emoji] of map) {
      if (n.includes(kw)) return emoji;
    }
    return null;
  };

  // 自動マイグレーション：enabledCatsが未設定のボックスにデフォルトを設定
  const migrateBoxes = async (boxesData) => {
    const updates = {};
    for (const box of Object.values(boxesData)) {
      if (!box.enabledCats) {
        const defaultCats = BOX_DEFAULT_CATS[box.icon] || DEFAULT_ALL_CATS;
        const defaultCat = defaultCats[0];
        updates['boxes/' + box.id + '/enabledCats'] = defaultCats;
        updates['boxes/' + box.id + '/defaultCat'] = defaultCat;
      }
    }
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
  };

  // 初回マウント: 匿名認証→localStorageからセッション復元→画面決定のみ
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await authReady;
      if (cancelled) return;
      const s = lsGet('hs-session', null);
      const k = lsGet('hs-gemini', '') || lsGet('fs-gemini-key', '');
      setGeminiKey(k);
      if (s?.userId) {
        setSession(s);
        setCurrentBox(null);
        setScreen('home');
      } else setScreen('auth');
    })();
    return () => { cancelled = true; };
  }, []);

  // セッション依存のリアルタイム購読。ログイン/新規登録直後や別アカウント切り替え時にも
  // 必ず張り直されるよう session.userId を依存に含める。これが無いと家族のボックス・在庫が
  // realtime で反映されず、再読み込みするまで共有が見えない不具合になる。
  useEffect(() => {
    const uid = session?.userId;
    if (!uid) return;
    // 片方向だけになっている friends 関係を双方向に修復する。過去の招待処理で
    // どちらか一方の書き込みだけ成功して終わっていると、その方向からしかボックスが
    // 見えず家族の在庫が反映されない。読み取った friends/ 全体を見て欠けている
    // 方向を一括で書き戻す。realtime listener はこの後の更新で再度 fire する。
    (async () => {
      try {
        const snap = await get(ref(db, 'friends'));
        const all = snap.val() || {};
        const mine = all[uid] || {};
        const updates = {};
        for (const [otherUid, theirFriends] of Object.entries(all)) {
          if (otherUid === uid || !theirFriends || typeof theirFriends !== 'object') continue;
          if (theirFriends[uid] && !mine[otherUid]) updates['friends/' + uid + '/' + otherUid] = true;
          if (mine[otherUid] && !theirFriends[uid]) updates['friends/' + otherUid + '/' + uid] = true;
        }
        if (Object.keys(updates).length > 0) await update(ref(db), updates);
      } catch (e) { console.warn('friends self-heal failed:', e); }
    })();
    const unsubs = [
      onValue(ref(db, 'users/' + uid), snap => { if (snap.val()) setCurrentUser(snap.val()); }),
      onValue(ref(db, 'users'), snap => { if (snap.val()) setUsers(snap.val()); }),
      onValue(ref(db, 'boxes'), snap => {
        const data = snap.val() || {};
        setBoxes(data);
        migrateBoxes(data);
      }),
      onValue(ref(db, 'friends/' + uid), snap => { setFriends(snap.val() || {}); }),
      // 全 friends ツリーも監視。これにより片方向しか書かれていない場合や
      // self-heal がまだ完了していないタイミングでも、相手側に自分が登録されていれば
      // ボックスを共有可能にする（visibleBoxes 算出時にユニオンで判定）。
      onValue(ref(db, 'friends'), snap => { setAllFriends(snap.val() || {}); }),
      onValue(ref(db, 'userCats/' + uid), snap => { setUserCats(snap.val() || null); }),
      onValue(ref(db, 'items'), snap => { setAllItems(snap.val() || {}); }),
    ];
    return () => { unsubs.forEach(u => { try { u(); } catch (_) {} }); };
  }, [session?.userId]);

  useEffect(() => {
    if (!currentBox) return;
    const unsub = onValue(ref(db, 'items/' + currentBox), snap => { setItems(snap.val() || {}); });
    return () => { try { unsub(); } catch (_) {} };
  }, [currentBox]);

  // 期限アラート＋追加・買い物リスト＋追加で書き込む shortageList を、
  // 自分と全共有メンバーから購読してユニオンで表示する。これによりどの家族が
  // 追加した買い物メモも全員のホーム画面に出る。
  useEffect(() => {
    const uid = session?.userId;
    if (!uid) return;
    const friendUids = new Set(Object.keys(friends || {}));
    for (const [otherUid, theirFriends] of Object.entries(allFriends || {})) {
      if (otherUid !== uid && theirFriends && typeof theirFriends === 'object' && theirFriends[uid]) {
        friendUids.add(otherUid);
      }
    }
    const targets = [uid, ...Array.from(friendUids)];
    const unsubs = [];
    for (const t of targets) {
      const off = onValue(ref(db, 'shortageList/' + t), snap => {
        const data = snap.val() || {};
        setShortageMap(prev => ({ ...prev, [t]: data }));
      });
      unsubs.push(off);
    }
    // メンバーから外れた user のエントリは破棄（解除直後にゴミが残らないように）
    setShortageMap(prev => {
      const next = {};
      for (const t of targets) if (prev[t]) next[t] = prev[t];
      return next;
    });
    return () => { unsubs.forEach(u => { try { u(); } catch (_) {} }); };
  }, [session?.userId, friends, allFriends]);

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
    await set(ref(db, 'shortageList/' + session.userId + '/' + id), { id, name: item.name, quantity: item.quantity || '1', unit: item.unit || '個', addedBy: session.userId, addedAt: Date.now() });
    showToast(item.name + 'を在庫切れリストに追加しました', 'success');
  };

  // ownerUid を明示的に受け取る。共有メンバーが追加した買い物メモを削除する場合は
  // そのメンバーの shortageList サブツリーから消す必要がある。
  const removeShortage = async (id, ownerUid) => {
    await remove(ref(db, 'shortageList/' + (ownerUid || session.userId) + '/' + id));
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
    await removeShortage(shortage.id, shortage._ownerUid);
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

  // 不要な共有メンバーを解除（相手の同名別アカウント等を間違えて追加した場合）。
  // 双方向の friends エントリを削除する。realtime listener が更新を反映する。
  const removeFriend = async (friendId) => {
    if (!session?.userId || !friendId) return;
    try {
      await remove(ref(db, 'friends/' + session.userId + '/' + friendId));
      await remove(ref(db, 'friends/' + friendId + '/' + session.userId));
      showToast('共有メンバーを解除しました', 'info');
    } catch (e) {
      console.error('removeFriend failed:', e);
      showToast('解除に失敗しました', 'error');
    }
  };

  const createBox = async () => {
    if (!form.boxName?.trim()) return showToast('名前を入力してください', 'error');
    const id = genId();
    const icon = form.boxIcon || 'fridge';
    const defaultEnabledCats = BOX_DEFAULT_CATS[icon] || cats;
    const defaultCat = form.defaultCat || defaultEnabledCats[0] || cats[0] || '食料品その他';
    await set(ref(db, 'boxes/' + id), {
      id, name: form.boxName.trim(), icon,
      ownerId: session.userId, createdAt: Date.now(),
      defaultCat,
      enabledCats: form.enabledCats || defaultEnabledCats,
    });
    saveSession({ ...session, boxId: id });
    setCurrentBox(id); setForm({});
    showToast('在庫ボックスを作成しました！', 'success'); setScreen('box');
  };

  const updateBox = async () => {
    if (!editingBox) return;
    const icon = form.boxIcon || editingBox.icon;
    const defaultEnabledCats = BOX_DEFAULT_CATS[icon] || cats;
    await update(ref(db, 'boxes/' + editingBox.id), {
      name: form.boxName || editingBox.name,
      icon,
      defaultCat: form.defaultCat || editingBox.defaultCat || defaultEnabledCats[0],
      enabledCats: form.enabledCats || editingBox.enabledCats || defaultEnabledCats,
    });
    setEditingBox(null); setForm({});
    showToast('ボックスを更新しました！', 'success'); setScreen('box');
  };

  const addItem = async () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    const id = genId();
    const box = currentBox ? boxes[currentBox] : null;
    const category = form.category || box?.defaultCat || cats[0] || '食料品その他';
    const name = form.itemName.trim();
    const quantity = form.quantity || '1';
    const unit = form.unit || '';
    await set(ref(db, 'items/' + currentBox + '/' + id), {
      id, boxId: currentBox, name, category, quantity, unit,
      expiry: form.expiry || '', purchaseDate: form.purchaseDate || '',
      note: form.note || '', addedBy: session.userId,
      addedAt: Date.now(), updatedAt: Date.now()
    });
    if (form._jan) saveBarcodeEntry(form._jan, { name, category, quantity, unit }, session.userId);
    setForm({}); showToast('追加しました！', 'success'); setScreen('box');
  };

  const updateItem = async () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    const box = currentBox ? boxes[currentBox] : null;
    const category = form.category || box?.defaultCat || cats[0] || '食料品その他';
    const name = form.itemName.trim();
    const quantity = form.quantity || '1';
    const unit = form.unit || '';
    await update(ref(db, 'items/' + currentBox + '/' + editingItem.id), {
      name, category, quantity, unit,
      expiry: form.expiry || '', purchaseDate: form.purchaseDate || '',
      note: form.note || '', updatedAt: Date.now()
    });
    if (form._jan) saveBarcodeEntry(form._jan, { name, category, quantity, unit }, session.userId);
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
      let jan = await detectBarcode(file);
      if (!jan && geminiKey) {
        setScanMsg('AIでバーコードを解析中...');
        jan = await readBarcodeWithGemini(geminiKey, file);
      }
      if (!jan) {
        setScanning(false);
        showToast(geminiKey ? 'バーコードを認識できませんでした' : '設定からGemini APIキーを入力するとAI読取が使えます', 'error');
        const box = currentBox ? boxes[currentBox] : null;
        setForm({ purchaseDate: today(), category: box?.defaultCat || cats[0] });
        setScreen('addItem'); return;
      }
      setScanMsg('商品情報を検索中...');
      const product = await lookupBarcode(jan);
      setScanning(false);
      const box = currentBox ? boxes[currentBox] : null;
      if (!product) {
        showToast('商品が見つかりませんでした。手動入力すると次回以降候補に出ます', 'info');
        setForm({ purchaseDate: today(), category: box?.defaultCat || cats[0], _jan: jan });
        setScreen('addItem'); return;
      }
      setForm({ itemName: product.name, category: product.category, quantity: product.quantity, unit: product.unit, purchaseDate: today(), _jan: jan });
      setScreen('addItem');
      showToast(product.fromSharedDb ? '共有DBから取得しました' : '商品情報を取得しました！', 'success');
    } catch (err) {
      console.error('barcode error:', err);
      setScanning(false);
      showToast('読み取りに失敗: ' + (err?.message || '不明なエラー'), 'error');
    }
  };

  const handleReceipt = async (file) => {
    setShowAddMenu(false);
    if (!geminiKey) { showToast('設定からGemini APIキーを入力してください', 'error'); setScreen('settings'); return; }
    setScanning(true); setScanMsg('AIがレシートを解析中...');
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(file); });
      const results = await analyzeReceipt(geminiKey, base64, file.type);
      if (!Array.isArray(results) || !results.length) { showToast('商品を読み取れませんでした', 'error'); setScanning(false); return; }
      const box = currentBox ? boxes[currentBox] : null;
      setScannedItems(results.map(i => ({ ...i, category: cats.includes(i.category) ? i.category : (box?.defaultCat || cats[0]) })));
      setScanning(false); setScreen('scanResult');
    } catch (err) {
      console.error('receipt error:', err);
      setScanning(false);
      showToast('読み取りに失敗: ' + (err?.message || '不明なエラー'), 'error');
    }
  };

  const handleShortageBarcode = async (file) => {
    setScanning(true); setScanMsg('バーコードを読み取り中...');
    try {
      let jan = await detectBarcode(file);
      if (!jan && geminiKey) {
        setScanMsg('AIでバーコードを解析中...');
        jan = await readBarcodeWithGemini(geminiKey, file);
      }
      if (!jan) { showToast(geminiKey ? 'バーコードを認識できませんでした' : 'Gemini APIキーを設定するとAI読取が使えます', 'error'); setScanning(false); return; }
      setScanMsg('商品情報を検索中...');
      const product = await lookupBarcode(jan);
      setScanning(false);
      if (!product) { showToast('商品が見つかりませんでした。一度在庫登録すると次回候補に出ます', 'info'); return; }
      await addShortage(product);
    } catch (err) {
      console.error('barcode error:', err);
      setScanning(false);
      showToast('読み取りに失敗: ' + (err?.message || '不明なエラー'), 'error');
    }
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

  // friends 関係の双方向ユニオン: 自分の friends に相手が居る場合と、
  // 相手の friends に自分が居る場合の両方を採用する。これにより片方向の
  // 関係でも家族間でボックス・在庫が共有される。
  const friendIdSet = (() => {
    const set = new Set(Object.keys(friends || {}));
    const me = session?.userId;
    if (me && allFriends) {
      for (const [otherUid, theirFriends] of Object.entries(allFriends)) {
        if (otherUid !== me && theirFriends && typeof theirFriends === 'object' && theirFriends[me]) {
          set.add(otherUid);
        }
      }
    }
    return set;
  })();
  const friendIds = Array.from(friendIdSet);
  const visibleBoxes = Object.values(boxes).filter(b => b.ownerId === session?.userId || friendIdSet.has(b.ownerId));
  const box = currentBox ? boxes[currentBox] : null;
  const boxEnabledCats = box?.enabledCats || cats;
  const boxItems = Object.values(items);
  // shortageList: 自分＋共有メンバー全員の shortageList をユニオンで表示。
  // 各 item に _ownerUid を付与し、削除/購入完了時に正しいユーザーの subtree から消せるようにする。
  const shortageList = (() => {
    const out = {};
    for (const [ownerUid, m] of Object.entries(shortageMap || {})) {
      for (const [iid, item] of Object.entries(m || {})) {
        out[ownerUid + ':' + iid] = { ...item, _ownerUid: ownerUid };
      }
    }
    return out;
  })();
  const shortageItems = Object.values(shortageList).sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

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
    showAddMenu, setShowAddMenu, guideStep, setGuideStep, friends, friendIds, showCode, setShowCode,
    userCats, newCatName, setNewCatName, newCatIcon, setNewCatIcon, newCatColor, setNewCatColor,
    shortageList, shortageForm, setShortageForm, showShortageAdd, setShowShortageAdd,
    buyingItem, setBuyingItem, buyBoxId, setBuyBoxId, estimatingExpiry,
    receiptRef, barcodeRef, shortageBarcodeRef,
    cats, catIcons, catColors, box, boxEnabledCats, boxItems, shortageItems,
    visibleBoxes, filteredItems, expiredAll, expiringAll,
    showToast, saveSession, addCat, deleteCat, addShortage, removeShortage,
    handleBought, handleRegister, handleLogin, handleLogout, addFriend, removeFriend,
    createBox, updateBox, addItem, updateItem, deleteItem, openEditItem,
    handleEstimateExpiry, handleBarcode, handleReceipt, handleShortageBarcode,
    confirmAndAddScanned, getItemEmoji,
  };
}
