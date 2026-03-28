import { useState, useEffect } from 'react';

const KEYS = {
  USERS: 'fs-users',
  FRIDGES: 'fs-fridges',
  ITEMS: 'fs-items',
  SESSION: 'fs-session',
};
const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'fridge-salt-v1'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
const genId = () => crypto.getRandomValues(new Uint32Array(2)).reduce((a, b) => a + b.toString(36), '');
const genCode = () => Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(36).toUpperCase().padStart(2, '0')).join('-');

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [users, setUsers] = useState({});
  const [fridges, setFridges] = useState({});
  const [items, setItems] = useState({});
  const [session, setSession] = useState(null);
  const [currentFridge, setCurrentFridge] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({});
  const [filterCat, setFilterCat] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const u = load(KEYS.USERS, {});
    const f = load(KEYS.FRIDGES, {});
    const it = load(KEYS.ITEMS, {});
    const s = load(KEYS.SESSION, null);
    setUsers(u); setFridges(f); setItems(it);
    if (s && u[s.userId]) {
      setSession(s);
      if (s.fridgeId && f[s.fridgeId]) { setCurrentFridge(s.fridgeId); setScreen('fridge'); }
      else setScreen('home');
    } else setScreen('auth');
  }, []);

  const persist = (u, f, it) => {
    if (u) { setUsers(u); save(KEYS.USERS, u); }
    if (f) { setFridges(f); save(KEYS.FRIDGES, f); }
    if (it) { setItems(it); save(KEYS.ITEMS, it); }
  };

  const handleRegister = async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.password?.trim()) return showToast('全項目を入力してください', 'error');
    if (form.password.length < 6) return showToast('パスワードは6文字以上', 'error');
    if (Object.values(users).find(u => u.email === form.email.toLowerCase())) return showToast('このメールアドレスは登録済みです', 'error');
    setLoading(true);
    const id = genId();
    const hash = await hashPassword(form.password);
    const nu = { ...users, [id]: { id, name: form.name.trim(), email: form.email.toLowerCase(), hash, createdAt: Date.now() } };
    persist(nu, null, null);
    const s = { userId: id, fridgeId: null };
    setSession(s); save(KEYS.SESSION, s);
    setLoading(false); setForm({});
    showToast(`ようこそ、${form.name}さん！`, 'success'); setScreen('home');
  };

  const handleLogin = async () => {
    if (!form.email?.trim() || !form.password?.trim()) return showToast('メールとパスワードを入力してください', 'error');
    const user = Object.values(users).find(u => u.email === form.email.toLowerCase());
    if (!user) return showToast('メールアドレスまたはパスワードが違います', 'error');
    setLoading(true);
    const hash = await hashPassword(form.password);
    if (hash !== user.hash) { setLoading(false); return showToast('メールアドレスまたはパスワードが違います', 'error'); }
    const s = { userId: user.id, fridgeId: null };
    setSession(s); save(KEYS.SESSION, s);
    setLoading(false); setForm({});
    showToast(`おかえりなさい、${user.name}さん！`, 'success'); setScreen('home');
  };

  const handleLogout = () => { setSession(null); setCurrentFridge(null); save(KEYS.SESSION, null); setScreen('auth'); };

  const createFridge = () => {
    if (!form.fridgeName?.trim()) return showToast('冷蔵庫名を入力してください', 'error');
    const id = genId();
    const nf = { ...fridges, [id]: { id, name: form.fridgeName.trim(), ownerId: session.userId, members: [session.userId], inviteCode: genCode(), createdAt: Date.now() } };
    persist(null, nf, null);
    const s = { ...session, fridgeId: id };
    setSession(s); save(KEYS.SESSION, s);
    setCurrentFridge(id); setForm({});
    showToast('冷蔵庫を作成しました！', 'success'); setScreen('fridge');
  };

  const joinFridge = () => {
    const code = inviteInput.trim().toUpperCase();
    if (!code) return showToast('招待コードを入力してください', 'error');
    const fridge = Object.values(fridges).find(f => f.inviteCode === code);
    if (!fridge) return showToast('招待コードが正しくありません', 'error');
    if (fridge.members.includes(session.userId)) return showToast('既にこの冷蔵庫のメンバーです', 'error');
    const nf = { ...fridges, [fridge.id]: { ...fridge, members: [...fridge.members, session.userId] } };
    persist(null, nf, null);
    const s = { ...session, fridgeId: fridge.id };
    setSession(s); save(KEYS.SESSION, s);
    setCurrentFridge(fridge.id); setInviteInput('');
    showToast(`「${fridge.name}」に参加しました！`, 'success'); setScreen('fridge');
  };

  const refreshInviteCode = () => {
    const fridge = fridges[currentFridge];
    if (!fridge || fridge.ownerId !== session.userId) return showToast('オーナーのみ変更できます', 'error');
    persist(null, { ...fridges, [fridge.id]: { ...fridge, inviteCode: genCode() } }, null);
    showToast('招待コードを更新しました', 'success');
  };

  const CATEGORIES = ['野菜・果物', '肉・魚', '乳製品', '飲み物', '調味料', '冷凍食品', 'その他'];
  const CAT_ICONS = {'野菜・果物':'🥦','肉・魚':'🥩','乳製品':'🥛','飲み物':'🧃','調味料':'🧂','冷凍食品':'🧊','その他':'📦'};
  const CAT_COLORS = {'野菜・果物':'#4ade80','肉・魚':'#f87171','乳製品':'#fbbf24','飲み物':'#60a5fa','調味料':'#c084fc','冷凍食品':'#67e8f9','その他':'#d1d5db'};

  const addItem = () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    const id = genId();
    persist(null, null, { ...items, [id]: { id, fridgeId: currentFridge, name: form.itemName.trim(), category: form.category || 'その他', quantity: form.quantity || '1', unit: form.unit || '', expiry: form.expiry || '', purchaseDate: form.purchaseDate || '', note: form.note || '', addedBy: session.userId, addedAt: Date.now(), updatedAt: Date.now() } });
    setForm({}); showToast('追加しました！', 'success'); setScreen('fridge');
  };

  const updateItem = () => {
    if (!form.itemName?.trim()) return showToast('品名を入力してください', 'error');
    persist(null, null, { ...items, [editingItem.id]: { ...items[editingItem.id], name: form.itemName.trim(), category: form.category || 'その他', quantity: form.quantity || '1', unit: form.unit || '', expiry: form.expiry || '', purchaseDate: form.purchaseDate || '', note: form.note || '', updatedAt: Date.now() } });
    setEditingItem(null); setForm({}); showToast('更新しました！', 'success'); setScreen('fridge');
  };

  const deleteItem = (id) => { const ni = { ...items }; delete ni[id]; persist(null, null, ni); setConfirmDelete(null); showToast('削除しました', 'info'); };

  const openEditItem = (item) => {
    setEditingItem(item);
    setForm({ itemName: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiry: item.expiry, purchaseDate: item.purchaseDate || '', note: item.note });
    setScreen('editItem');
  };

  const isExpiringSoon = (e) => { if (!e) return false; const d = (new Date(e) - new Date()) / 86400000; return d >= 0 && d <= 3; };
  const isExpired = (e) => e && new Date(e) < new Date();
  const fridgeItems = currentFridge ? Object.values(items).filter(i => i.fridgeId === currentFridge) : [];
  const filteredItems = fridgeItems.filter(i => filterCat === 'all' || i.category === filterCat).sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name, 'ja') : sortBy === 'expiry' ? (a.expiry || '9999') < (b.expiry || '9999') ? -1 : 1 : b.addedAt - a.addedAt);
  const user = session ? users[session.userId] : null;
  const fridge = currentFridge ? fridges[currentFridge] : null;

  const S = {
    app: { minHeight: '100dvh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2a1e 100%)', fontFamily: 'sans-serif', color: '#e2e8f0', position: 'relative', overflow: 'hidden' },
    grain: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
    wrap: { maxWidth: 440, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 1, minHeight: '100dvh' },
    card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24 },
    btn: (c = '#22c55e') => ({ background: c, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 8 }),
    ghost: { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '13px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 8 },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 14px', fontSize: 15, color: '#e2e8f0', outline: 'none', marginTop: 6, fontFamily: 'inherit' },
    label: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' },
    hdr: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 16 },
    badge: (c) => ({ background: c + '22', color: c, borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700, border: '1px solid ' + c + '44' }),
    toastEl: (t) => ({ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: t === 'error' ? '#ef4444' : t === 'success' ? '#22c55e' : '#3b82f6', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 1000, whiteSpace: 'nowrap' }),
  };

  const CSS = '@keyframes su{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}} *{box-sizing:border-box} select option{background:#1e293b}';

  if (screen === 'loading') return <div style={{...S.app,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:64}}>🧊</div><div style={{color:'#64748b',marginTop:12}}>読み込み中...</div></div></div>;

  if (screen === 'auth') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={{paddingTop:60,paddingBottom:40,textAlign:'center'}}>
          <div style={{fontSize:64,marginBottom:12}}>🧊</div>
          <h1 style={{fontSize:28,fontWeight:900,margin:0,color:'#22c55e'}}>FridgeShare</h1>
          <p style={{color:'#64748b',marginTop:8,fontSize:14}}>冷蔵庫をみんなで管理</p>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:24,background:'rgba(255,255,255,.05)',borderRadius:14,padding:4}}>
          {['login','register'].map(m => <button key={m} onClick={() => {setAuthMode(m);setForm({});}} style={{flex:1,padding:10,borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:14,background:authMode===m?'rgba(34,197,94,.2)':'transparent',color:authMode===m?'#22c55e':'#64748b'}}>{m==='login'?'ログイン':'新規登録'}</button>)}
        </div>
        <div style={S.card}>
          {authMode==='register' && <div style={{marginBottom:16}}><label style={S.label}>ニックネーム</label><input style={S.input} placeholder='田中 太郎' value={form.name||''} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>}
          <div style={{marginBottom:16}}><label style={S.label}>メールアドレス</label><input style={S.input} type='email' placeholder='you@example.com' value={form.email||''} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
          <div style={{marginBottom:20}}><label style={S.label}>パスワード</label><input style={S.input} type='password' placeholder='••••••••' value={form.password||''} onChange={e=>setForm(p=>({...p,password:e.target.value}))} /></div>
          <button style={S.btn()} onClick={authMode==='login'?handleLogin:handleRegister} disabled={loading}>{loading?'処理中...':authMode==='login'?'ログイン':'アカウント作成'}</button>
        </div>
      </div>
      {toast && <div style={{...S.toastEl(toast.type)}}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'home') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div><h2 style={{margin:0,fontSize:20,fontWeight:900}}>こんにちは、{user?.name}さん 👋</h2><p style={{margin:0,color:'#64748b',fontSize:13,marginTop:2}}>冷蔵庫を選択または追加</p></div>
          <button onClick={handleLogout} style={{background:'rgba(255,255,255,.06)',border:'none',color:'#64748b',padding:'8px 12px',borderRadius:10,cursor:'pointer',fontSize:13}}>ログアウト</button>
        </div>
        {Object.values(fridges).filter(f=>f.members.includes(session.userId)).map(f => {
          const count = Object.values(items).filter(i=>i.fridgeId===f.id).length;
          return <div key={f.id} onClick={()=>{const s={...session,fridgeId:f.id};setSession(s);save(KEYS.SESSION,s);setCurrentFridge(f.id);setScreen('fridge');}} style={{...S.card,marginBottom:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{fontSize:32}}>🧊</div><div><div style={{fontWeight:700,fontSize:16}}>{f.name}</div><div style={{color:'#64748b',fontSize:12}}>メンバー {f.members.length}人 · {count}品</div></div></div><div style={{color:'#64748b',fontSize:20}}>›</div></div>;
        })}
        <div style={{...S.card,marginBottom:12,marginTop:16}}>
          <div style={{fontWeight:700,marginBottom:12,fontSize:15}}>➕ 新しい冷蔵庫を作る</div>
          <input style={S.input} placeholder='冷蔵庫の名前' value={form.fridgeName||''} onChange={e=>setForm(p=>({...p,fridgeName:e.target.value}))} />
          <button style={S.btn()} onClick={createFridge}>作成する</button>
        </div>
        <div style={S.card}>
          <div style={{fontWeight:700,marginBottom:12,fontSize:15}}>🔗 招待コードで参加</div>
          <input style={S.input} placeholder='XX-XX-XX-XX' value={inviteInput} onChange={e=>setInviteInput(e.target.value)} />
          <button style={S.btn('#3b82f6')} onClick={joinFridge}>参加する</button>
        </div>
      </div>
      {toast && <div style={{...S.toastEl(toast.type)}}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'fridge') {
    const expiredItems = fridgeItems.filter(i=>isExpired(i.expiry));
    const expiringItems = fridgeItems.filter(i=>isExpiringSoon(i.expiry));
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <div>
              <button onClick={()=>setScreen('home')} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:13,padding:0,marginBottom:4}}>← 戻る</button>
              <h2 style={{margin:0,fontSize:18,fontWeight:900}}>{fridge?.name} 🧊</h2>
              <div style={{color:'#64748b',fontSize:12}}>メンバー {fridge?.members.length}人 · {fridgeItems.length}品</div>
            </div>
            <button onClick={()=>setShowInvite(!showInvite)} style={{background:'rgba(34,197,94,.15)',border:'1px solid rgba(34,197,94,.3)',color:'#22c55e',padding:'8px 12px',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:600}}>招待 🔗</button>
          </div>
          {showInvite && <div style={{...S.card,marginBottom:16}}><div style={{fontSize:12,color:'#64748b',marginBottom:8,fontWeight:600}}>招待コード</div><div style={{background:'rgba(34,197,94,.1)',borderRadius:10,padding:'12px 16px',fontFamily:'monospace',fontSize:18,fontWeight:900,color:'#22c55e',textAlign:'center'}}>{fridge?.inviteCode}</div>{fridge?.ownerId===session.userId && <button style={S.ghost} onClick={refreshInviteCode}>コードを再発行</button>}</div>}
          {expiredItems.length > 0 && <div style={{background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.3)',borderRadius:12,padding:'10px 14px',marginBottom:10,fontSize:13}}>⚠️ 期限切れ {expiredItems.length}品</div>}
          {expiringItems.length > 0 && <div style={{background:'rgba(251,191,36,.15)',border:'1px solid rgba(251,191,36,.3)',borderRadius:12,padding:'10px 14px',marginBottom:10,fontSize:13}}>⏳ 期限間近 {expiringItems.length}品（3日以内）</div>}
          <div style={{display:'flex',gap:8,marginBottom:12,overflowX:'auto',paddingBottom:4}}>
            {['all',...CATEGORIES].map(cat=><button key={cat} onClick={()=>setFilterCat(cat)} style={{whiteSpace:'nowrap',padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:filterCat===cat?'rgba(34,197,94,.25)':'rgba(255,255,255,.06)',color:filterCat===cat?'#22c55e':'#64748b'}}>{cat==='all'?'すべて':`${CAT_ICONS[cat]} ${cat}`}</button>)}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center'}}>
            <span style={{fontSize:12,color:'#64748b'}}>並び替え:</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{...S.input,marginTop:0,padding:'6px 10px',fontSize:12,width:'auto'}}>
              <option value='name'>名前順</option><option value='expiry'>賞味期限順</option><option value='added'>追加日順</option>
            </select>
          </div>
          {filteredItems.length===0 ? <div style={{textAlign:'center',padding:'40px 0',color:'#64748b'}}><div style={{fontSize:48,marginBottom:12}}>📭</div><div>食材がありません</div></div>
          : filteredItems.map(item => {
            const exp=isExpired(item.expiry),expi=isExpiringSoon(item.expiry),byUser=users[item.addedBy];
            return <div key={item.id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,padding:'14px 16px',marginBottom:8,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>openEditItem(item)}>
              <div style={{fontSize:28,flexShrink:0}}>{CAT_ICONS[item.category]||'📦'}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
                  {exp && <span style={S.badge('#ef4444')}>期限切れ</span>}
                  {!exp&&expi && <span style={S.badge('#fbbf24')}>期限間近</span>}
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                  <span style={S.badge(CAT_COLORS[item.category]||'#888')}>{item.category}</span>
                  <span style={{color:'#94a3b8',fontSize:12}}>{item.quantity}{item.unit}</span>
                  {item.expiry && <span style={{color:exp?'#ef4444':expi?'#fbbf24':'#64748b',fontSize:11}}>📅 {item.expiry}</span>}
                  {item.purchaseDate && <span style={{color:'#64748b',fontSize:11}}>🛒 {item.purchaseDate}</span>}
                  <span style={{color:'#475569',fontSize:11}}>by {byUser?.name||'?'}</span>
                </div>
                {item.note && <div style={{color:'#64748b',fontSize:12,marginTop:4}}>📝 {item.note}</div>}
              </div>
              <button onClick={e=>{e.stopPropagation();setConfirmDelete(item);}} style={{background:'rgba(239,68,68,.15)',border:'none',color:'#f87171',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:14,flexShrink:0}}>🗑</button>
            </div>;
          })}
          <div style={{height:90}} />
        </div>
        <button onClick={()=>{setForm({});setScreen('addItem');}} style={{position:'fixed',bottom:24,right:24,width:60,height:60,borderRadius:'50%',background:'#22c55e',border:'none',color:'#fff',fontSize:28,cursor:'pointer',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
        {confirmDelete && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 20px'}}><div style={{...S.card,maxWidth:340,width:'100%'}}><div style={{fontSize:36,textAlign:'center',marginBottom:12}}>🗑️</div><div style={{fontWeight:700,textAlign:'center',marginBottom:8}}>「{confirmDelete.name}」を削除しますか？</div><button style={S.btn('#ef4444')} onClick={()=>deleteItem(confirmDelete.id)}>削除する</button><button style={S.ghost} onClick={()=>setConfirmDelete(null)}>キャンセル</button></div></div>}
        {toast && <div style={{...S.toastEl(toast.type)}}>{toast.msg}</div>}
      </div>
    );
  }

  if (screen === 'addItem' || screen === 'editItem') {
    const isEdit = screen === 'editItem';
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <button onClick={()=>{setScreen('fridge');setForm({});setEditingItem(null);}} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:16}}>← キャンセル</button>
            <h2 style={{margin:0,fontSize:18,fontWeight:900}}>{isEdit?'食材を編集':'食材を追加'}</h2>
            <div style={{width:60}} />
          </div>
          <div style={S.card}>
            <div style={{marginBottom:16}}><label style={S.label}>品名 *</label><input style={S.input} placeholder='例：牛乳' value={form.itemName||''} onChange={e=>setForm(p=>({...p,itemName:e.target.value}))} /></div>
            <div style={{marginBottom:16}}><label style={S.label}>カテゴリ</label><select style={S.input} value={form.category||'その他'} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</select></div>
            <div style={{display:'flex',gap:12,marginBottom:16}}>
              <div style={{flex:1}}><label style={S.label}>数量</label><input style={S.input} type='number' min='0' step='0.1' placeholder='1' value={form.quantity||''} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} /></div>
              <div style={{flex:1}}><label style={S.label}>単位</label><input style={S.input} placeholder='個 / ml / g' value={form.unit||''} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} /></div>
            </div>
            <div style={{marginBottom:16}}><label style={S.label}>賞味期限</label><input style={S.input} type='date' value={form.expiry||''} onChange={e=>setForm(p=>({...p,expiry:e.target.value}))} /></div>
            <div style={{marginBottom:16}}><label style={S.label}>購入日</label><input style={S.input} type='date' value={form.purchaseDate||''} onChange={e=>setForm(p=>({...p,purchaseDate:e.target.value}))} /></div>
            <div style={{marginBottom:20}}><label style={S.label}>メモ</label><input style={S.input} placeholder='例：開封済み、2段目' value={form.note||''} onChange={e=>setForm(p=>({...p,note:e.target.value}))} /></div>
            <button style={S.btn()} onClick={isEdit?updateItem:addItem}>{isEdit?'更新する':'追加する'}</button>
          </div>
          <div style={{height:40}} />
        </div>
        {toast && <div style={{...S.toastEl(toast.type)}}>{toast.msg}</div>}
      </div>
    );
  }

  return null;
}
