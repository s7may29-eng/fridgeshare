import { useAppState } from './useAppState';
import BoxIcon from './BoxIcon';
import BoxForm from './BoxForm';
import { GUIDE_STEPS, CAT_COLOR_OPTIONS, CAT_ICON_OPTIONS, CSS } from './constants';
import { lsSet, isExpired, isExpiringSoon } from './utils';

const accent = '#6366f1';
const accentLight = '#eef2ff';
const danger = '#ef4444';
const warn = '#d97706';
const text = '#1a1a1a';
const textMuted = '#9ca3af';
const border = '#e5e5e3';
const cardBg = '#ffffff';

const S = {
  app: { minHeight: '100dvh', background: '#f8f7f5', fontFamily: "'DM Sans', sans-serif", color: text },
  wrap: { maxWidth: 430, margin: '0 auto', padding: '0 20px', minHeight: '100dvh' },
  card: { background: cardBg, borderRadius: 18, padding: '18px 20px', border: '1px solid ' + border },
  btn: (c = accent) => ({ background: c, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 10, letterSpacing: '-0.01em', fontFamily: 'inherit' }),
  btnGhost: { background: 'transparent', color: textMuted, border: '1.5px solid ' + border, borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 8, fontFamily: 'inherit' },
  input: { width: '100%', background: '#fafaf9', border: '1.5px solid ' + border, borderRadius: 12, padding: '12px 14px', fontSize: 15, color: text, outline: 'none', marginTop: 6, fontFamily: 'inherit', fontWeight: 400 },
  label: { fontSize: 11, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' },
  hdr: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 16 },
  iconBtn: { background: cardBg, border: '1.5px solid ' + border, borderRadius: 12, padding: '9px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'inherit', color: textMuted, display: 'flex', alignItems: 'center', gap: 4 },
  tag: (bg, fg) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color: fg || text, whiteSpace: 'nowrap' }),
  toast: (t) => ({ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', background: t === 'error' ? danger : t === 'success' ? '#22c55e' : accent, color: '#fff', padding: '10px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600, zIndex: 1000, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', animation: 'fadeUp 0.25s ease' }),
  sectionTitle: { fontSize: 11, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 },
};

export default function App() {
  const state = useAppState();
  const {
    screen, setScreen, users, boxes, session, currentBox, setCurrentBox,
    currentUser, editingItem, editingBox, setEditingBox, toast, authMode, setAuthMode,
    form, setForm, filterCat, setFilterCat, filterType, setFilterType, sortBy, setSortBy,
    inviteInput, setInviteInput, loading, confirmDelete, setConfirmDelete,
    geminiKey, setGeminiKey, scanning, scanMsg, scannedItems, setScannedItems,
    showAddMenu, setShowAddMenu, guideStep, setGuideStep, showCode, setShowCode,
    newCatName, setNewCatName, newCatIcon, setNewCatIcon, newCatColor, setNewCatColor,
    shortageForm, setShortageForm, showShortageAdd, setShowShortageAdd,
    buyingItem, setBuyingItem, buyBoxId, setBuyBoxId, estimatingExpiry,
    receiptRef, barcodeRef, shortageBarcodeRef,
    cats, catIcons, catColors, box, boxEnabledCats, boxItems, shortageItems,
    visibleBoxes, filteredItems, expiredAll, expiringAll,
    showToast, saveSession, addCat, deleteCat, addShortage, removeShortage,
    handleBought, handleRegister, handleLogin, handleLogout, addFriend,
    createBox, updateBox, addItem, updateItem, deleteItem, openEditItem,
    handleEstimateExpiry, handleBarcode, handleReceipt, handleShortageBarcode,
    confirmAndAddScanned,
  } = state;

  if (screen === 'loading') return (
    <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <div style={{ textAlign: 'center' }}>
        <BoxIcon k='fridge' size={56} />
        <div style={{ fontWeight: 700, fontSize: 20, marginTop: 12 }}>HomeStock</div>
        <div style={{ color: textMuted, marginTop: 4, fontSize: 13 }}>読み込み中...</div>
      </div>
    </div>
  );

  if (screen === 'guide') return (
    <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <div style={{ ...S.wrap, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ ...S.card, textAlign: 'center', animation: 'scaleIn 0.3s ease', padding: '40px 28px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, letterSpacing: '0.1em', marginBottom: 24 }}>{guideStep + 1} / {GUIDE_STEPS.length}</div>
          <div style={{ fontSize: 64, marginBottom: 20 }}>{GUIDE_STEPS[guideStep].icon}</div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{GUIDE_STEPS[guideStep].title}</div>
          <div style={{ color: textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>{GUIDE_STEPS[guideStep].desc}</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
            {GUIDE_STEPS.map((_, i) => <div key={i} style={{ width: i === guideStep ? 20 : 6, height: 6, borderRadius: 3, background: i === guideStep ? accent : border, transition: 'all 0.3s' }} />)}
          </div>
          {guideStep < GUIDE_STEPS.length - 1
            ? <button className='pressable' style={S.btn()} onClick={() => setGuideStep(guideStep + 1)}>次へ →</button>
            : <button className='pressable' style={S.btn()} onClick={() => setScreen('home')}>はじめる！</button>
          }
          {guideStep > 0 && <button className='pressable' style={S.btnGhost} onClick={() => setGuideStep(guideStep - 1)}>← 戻る</button>}
          <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: textMuted, fontSize: 13, cursor: 'pointer', marginTop: 12, fontFamily: 'inherit' }}>スキップ</button>
        </div>
      </div>
    </div>
  );

  if (screen === 'auth') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={{ paddingTop: 64, paddingBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: accentLight, borderRadius: 20, padding: 14, marginBottom: 16 }}>
            <BoxIcon k='fridge' size={44} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.04em' }}>HomeStock</h1>
          <p style={{ color: textMuted, fontSize: 14, margin: 0 }}>家族みんなで在庫を管理</p>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f0f0ef', borderRadius: 14, padding: 3 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setForm({}); }}
              style={{ flex: 1, padding: '10px', borderRadius: 11, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', background: authMode === m ? cardBg : 'transparent', color: authMode === m ? text : textMuted, boxShadow: authMode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {m === 'login' ? 'ログイン' : '新規登録'}
            </button>
          ))}
        </div>
        <div style={{ ...S.card, animation: 'scaleIn 0.25s ease' }}>
          {authMode === 'register' && <div style={{ marginBottom: 14 }}><label style={S.label}>ニックネーム</label><input style={S.input} placeholder='例：田中 花子' value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>}
          <div style={{ marginBottom: 14 }}><label style={S.label}>メールアドレス</label><input style={S.input} type='email' placeholder='you@example.com' value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div style={{ marginBottom: 4 }}><label style={S.label}>パスワード</label><input style={S.input} type='password' placeholder='6文字以上' value={form.password || ''} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
          <button className='pressable' style={S.btn()} onClick={authMode === 'login' ? handleLogin : handleRegister} disabled={loading}>
            {loading ? '処理中...' : authMode === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>
        </div>
        <div style={{ height: 40 }} />
      </div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'editBox') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={() => { setEditingBox(null); setForm({}); setScreen('box'); }} style={S.iconBtn}>← キャンセル</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>ボックスを編集</span>
          <div style={{ width: 72 }} />
        </div>
        <BoxForm form={form} setForm={setForm} onSubmit={updateBox} submitLabel='更新する' existing={editingBox} cats={cats} catIcons={catIcons} catColors={catColors} S={S} accent={accent} textMuted={textMuted} />
        <div style={{ height: 40 }} />
      </div>
    </div>
  );

  if (screen === 'catSettings') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={() => setScreen('settings')} style={S.iconBtn}>← 戻る</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>カテゴリ管理</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>カテゴリを追加</div>
          <label style={S.label}>カテゴリ名</label>
          <input style={S.input} placeholder='例：お菓子' value={newCatName} onChange={e => setNewCatName(e.target.value)} />
          <label style={{ ...S.label, marginTop: 12 }}>アイコン</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {CAT_ICON_OPTIONS.map(ic => (
              <button key={ic} onClick={() => setNewCatIcon(ic)}
                style={{ fontSize: 20, padding: '4px 6px', borderRadius: 8, border: newCatIcon === ic ? '2px solid ' + accent : '2px solid transparent', background: newCatIcon === ic ? accentLight : '#f5f5f3', cursor: 'pointer' }}>
                {ic}
              </button>
            ))}
          </div>
          <label style={{ ...S.label, marginTop: 12 }}>カラー</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {CAT_COLOR_OPTIONS.map(c => (
              <button key={c} onClick={() => setNewCatColor(c)}
                style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: newCatColor === c ? '3px solid ' + accent : '3px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
          <button className='pressable' style={S.btn()} onClick={addCat}>追加する</button>
        </div>
        <div style={S.card}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>現在のカテゴリ</div>
          {cats.map(name => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid ' + border }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{catIcons[name] || '📦'}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: catColors[name] || '#f1f5f9', display: 'inline-block' }} />
              </div>
              <button onClick={() => deleteCat(name)}
                style={{ background: '#fef2f2', border: 'none', color: danger, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>削除</button>
            </div>
          ))}
        </div>
        <div style={{ height: 40 }} />
      </div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'settings') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={() => setScreen(currentBox ? 'box' : 'home')} style={S.iconBtn}>← 戻る</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>設定</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>カテゴリ管理</div>
          <p style={{ color: textMuted, fontSize: 13, marginTop: 4, marginBottom: 12, lineHeight: 1.5 }}>カテゴリの追加・削除ができます。</p>
          <button className='pressable' style={S.btn()} onClick={() => setScreen('catSettings')}>カテゴリを管理する</button>
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>家族を追加</div>
          <p style={{ color: textMuted, fontSize: 13, marginTop: 4, marginBottom: 12, lineHeight: 1.5 }}>家族の招待コードを入力するとお互いのボックスを共有できます。</p>
          {Object.keys(state.friends).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {Object.keys(state.friends).map(fid => {
                const f = users[fid];
                return f ? (
                  <div key={fid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid ' + border }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: accent }}>{f.name?.[0]}</div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{f.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
          <label style={S.label}>招待コードを入力</label>
          <input style={S.input} placeholder='XX-XX-XX-XX' value={inviteInput} onChange={e => setInviteInput(e.target.value)} />
          <button className='pressable' style={S.btn()} onClick={addFriend}>追加する</button>
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>Gemini APIキー</div>
          <p style={{ color: textMuted, fontSize: 13, marginBottom: 14, marginTop: 4, lineHeight: 1.5 }}>レシート読み取り・期限自動推定に使用。<br />aistudio.google.comで無料取得できます。</p>
          <label style={S.label}>APIキー</label>
          <input style={S.input} type='password' placeholder='AIza...' value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
          <button className='pressable' style={S.btn()} onClick={() => { lsSet('hs-gemini', geminiKey); showToast('保存しました！', 'success'); }}>保存する</button>
        </div>
        <div style={S.card}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>アカウント</div>
          <div style={{ color: textMuted, fontSize: 14, margin: '8px 0 16px' }}>{currentUser?.name} · {currentUser?.email}</div>
          <button className='pressable' style={S.btnGhost} onClick={handleLogout}>ログアウト</button>
        </div>
        <div style={{ height: 40 }} />
      </div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'home') return (
    <div style={S.app}><style>{CSS}</style>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize: 13, color: textMuted, fontWeight: 500 }}>こんにちは</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 1 }}>{currentUser?.name}さん</div>
          </div>
          <button onClick={() => setScreen('settings')} style={S.iconBtn}>⚙️</button>
        </div>

        {/* 期限アラート：常に表示 */}
        <div style={{ marginBottom: 20 }}>
          <div style={S.sectionTitle}>⚠️ 期限アラート</div>
          {expiredAll.length === 0 && expiringAll.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '16px 20px', color: textMuted, fontSize: 13 }}>期限切れ・期限間近の食材はありません</div>
          ) : (
            <>
              {expiredAll.length > 0 && (
                <div style={{ ...S.card, marginBottom: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 700, color: danger, fontSize: 13, marginBottom: 8 }}>期限切れ {expiredAll.length}品</div>
                  {expiredAll.slice(0, 3).map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #fecaca' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{i.name}</span>
                      <span style={{ fontSize: 11, color: danger }}>📅 {i.expiry}・{boxes[i.boxId]?.name || '?'}</span>
                    </div>
                  ))}
                  {expiredAll.length > 3 && <div style={{ fontSize: 11, color: danger, marginTop: 6 }}>他 {expiredAll.length - 3}品...</div>}
                </div>
              )}
              {expiringAll.length > 0 && (
                <div style={{ ...S.card, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: 700, color: warn, fontSize: 13, marginBottom: 8 }}>もうすぐ期限 {expiringAll.length}品（3日以内）</div>
                  {expiringAll.slice(0, 3).map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #fde68a' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{i.name}</span>
                      <span style={{ fontSize: 11, color: warn }}>📅 {i.expiry}・{boxes[i.boxId]?.name || '?'}</span>
                    </div>
                  ))}
                  {expiringAll.length > 3 && <div style={{ fontSize: 11, color: warn, marginTop: 6 }}>他 {expiringAll.length - 3}品...</div>}
                </div>
              )}
            </>
          )}
        </div>

        {/* 在庫切れリスト：常に表示 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={S.sectionTitle}>🛒 在庫切れリスト</div>
            <button onClick={() => setShowShortageAdd(!showShortageAdd)}
              style={{ background: 'none', border: 'none', color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {showShortageAdd ? '閉じる' : '＋ 追加'}
            </button>
          </div>
          {showShortageAdd && (
            <div style={{ ...S.card, marginBottom: 10, animation: 'fadeUp 0.2s ease' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={{ ...S.input, marginTop: 0, flex: 1 }} placeholder='品名' value={shortageForm.name} onChange={e => setShortageForm(p => ({ ...p, name: e.target.value }))} />
                <input style={{ ...S.input, marginTop: 0, width: 60 }} placeholder='数量' value={shortageForm.quantity} onChange={e => setShortageForm(p => ({ ...p, quantity: e.target.value }))} />
                <input style={{ ...S.input, marginTop: 0, width: 56 }} placeholder='単位' value={shortageForm.unit} onChange={e => setShortageForm(p => ({ ...p, unit: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className='pressable' style={{ ...S.btn(), marginTop: 0, flex: 1 }} onClick={async () => {
                  if (!shortageForm.name.trim()) return showToast('品名を入力してください', 'error');
                  await addShortage(shortageForm);
                  setShortageForm({ name: '', quantity: '1', unit: '個' });
                  setShowShortageAdd(false);
                }}>追加</button>
                <button className='pressable' onClick={() => shortageBarcodeRef.current?.click()}
                  style={{ background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: '0 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 0 }}>
                  📷
                </button>
              </div>
              {scanning && <div style={{ color: accent, fontSize: 12, marginTop: 8, fontWeight: 600 }}>{scanMsg}</div>}
            </div>
          )}
          {shortageItems.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '16px 20px', color: textMuted, fontSize: 13 }}>在庫切れアイテムはありません</div>
          ) : shortageItems.map(item => (
            <div key={item.id} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                <div style={{ color: textMuted, fontSize: 12 }}>{item.quantity}{item.unit}</div>
              </div>
              <button onClick={() => { setBuyingItem(item); setBuyBoxId(visibleBoxes[0]?.id || ''); }}
                style={{ background: '#dcfce7', border: 'none', color: '#16a34a', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                購入した
              </button>
              <button onClick={() => removeShortage(item.id)}
                style={{ background: '#fef2f2', border: 'none', color: danger, borderRadius: 10, padding: '7px 10px', cursor: 'pointer', fontSize: 14 }}>🗑</button>
            </div>
          ))}
        </div>

        {/* 在庫ボックス */}
        {visibleBoxes.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={S.sectionTitle}>在庫ボックス</div>
            {visibleBoxes.map(b => {
              const owner = users[b.ownerId];
              const isOwn = b.ownerId === session.userId;
              return (
                <div key={b.id} className='pressable' onClick={() => { saveSession({ ...session, boxId: b.id }); setCurrentBox(b.id); setScreen('box'); }}
                  style={{ ...S.card, marginBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ background: '#f5f5f3', borderRadius: 14, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BoxIcon k={b.icon} size={40} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{b.name}</div>
                      <div style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>{isOwn ? '自分のボックス' : owner?.name + 'さんのボックス'}</div>
                    </div>
                  </div>
                  <span style={{ color: border, fontSize: 20 }}>›</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 新しいボックス作成 */}
        <div style={{ ...S.card, marginBottom: 10, border: '1.5px dashed ' + border }}>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>新しい在庫ボックスを作る</div>
          <BoxForm form={form} setForm={setForm} onSubmit={createBox} submitLabel='作成する' existing={null} cats={cats} catIcons={catIcons} catColors={catColors} S={S} accent={accent} textMuted={textMuted} />
        </div>

        {/* 招待コード */}
        <div style={{ ...S.card, marginBottom: 10, border: '1.5px dashed ' + border }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>家族を招待する</div>
            <button onClick={() => setShowCode(!showCode)} style={{ background: 'none', border: 'none', color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              {showCode ? '隠す' : 'コードを表示'}
            </button>
          </div>
          <p style={{ color: textMuted, fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>招待コードを家族に送ると、お互いの全ボックスを共有できます。</p>
          {showCode && (
            <div style={{ background: '#f5f5f3', borderRadius: 12, padding: '12px 16px', fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: accent, textAlign: 'center', letterSpacing: 4, marginBottom: 8, animation: 'fadeUp 0.2s ease' }}>
              {currentUser?.inviteCode || '読み込み中...'}
            </div>
          )}
          <button className='pressable' style={S.btn()} onClick={() => {
            if (currentUser?.inviteCode) { navigator.clipboard.writeText(currentUser.inviteCode); showToast('招待コードをコピーしました！', 'success'); }
          }}>招待コードをコピー</button>
        </div>

        <div style={{ height: 40 }} />
      </div>

      <input ref={shortageBarcodeRef} type='file' accept='image/*' capture='environment' style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) handleShortageBarcode(e.target.files[0]); e.target.value = ''; }} />

      {buyingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', backdropFilter: 'blur(2px)' }}>
          <div style={{ ...S.card, maxWidth: 340, width: '100%', animation: 'scaleIn 0.2s ease', padding: '28px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>「{buyingItem.name}」を購入しました！</div>
            <div style={{ color: textMuted, fontSize: 13, marginBottom: 16 }}>どのボックスに追加しますか？</div>
            <label style={S.label}>追加先のボックス</label>
            <select style={S.input} value={buyBoxId} onChange={e => setBuyBoxId(e.target.value)}>
              {visibleBoxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button className='pressable' style={S.btn('#22c55e')} onClick={() => handleBought(buyingItem)}>在庫に追加する</button>
            <button className='pressable' style={S.btnGhost} onClick={() => { setBuyingItem(null); setBuyBoxId(''); }}>キャンセル</button>
          </div>
        </div>
      )}
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  if (screen === 'box') {
    const expiredItems = boxItems.filter(i => isExpired(i.expiry));
    const expiringItems = boxItems.filter(i => isExpiringSoon(i.expiry));
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <div>
              <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit', fontWeight: 500 }}>← 戻る</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <BoxIcon k={box?.icon} size={24} />
                <span style={{ fontWeight: 700, fontSize: 17 }}>{box?.name}</span>
              </div>
              <div style={{ color: textMuted, fontSize: 12, marginTop: 1 }}>{boxItems.length}品</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {box?.ownerId === session?.userId && (
                <button onClick={() => { setEditingBox(box); setForm({}); setScreen('editBox'); }} style={S.iconBtn}>✏️</button>
              )}
              <button onClick={() => setScreen('settings')} style={S.iconBtn}>⚙️</button>
            </div>
          </div>

          {expiredItems.length > 0 && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', marginBottom: 10, fontSize: 13, fontWeight: 600, color: danger }}>⚠ 期限切れ {expiredItems.length}品</div>}
          {expiringItems.length > 0 && <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px', marginBottom: 10, fontSize: 13, fontWeight: 600, color: warn }}>⏳ もうすぐ期限 {expiringItems.length}品（3日以内）</div>}
          {scanning && <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '12px 14px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: accent }}>{scanMsg}</div>}

          <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: '#f0f0ef', borderRadius: 12, padding: 3 }}>
            {[['all', 'すべて'], ['food', '食料品'], ['supply', '備品']].map(([v, l]) => (
              <button key={v} onClick={() => setFilterType(v)} style={{ flex: 1, padding: '7px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: filterType === v ? cardBg : 'transparent', color: filterType === v ? text : textMuted, boxShadow: filterType === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
            <button onClick={() => setFilterCat('all')} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', background: filterCat === 'all' ? accent : '#f0f0ef', color: filterCat === 'all' ? '#fff' : textMuted, flexShrink: 0 }}>すべて</button>
            {boxEnabledCats.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', background: filterCat === cat ? (catColors[cat] || '#f0f0ef') : '#f0f0ef', color: filterCat === cat ? '#333' : textMuted, flexShrink: 0 }}>
                {catIcons[cat] || '📦'} {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: textMuted, fontWeight: 500, whiteSpace: 'nowrap' }}>並び替え:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.input, marginTop: 0, padding: '7px 12px', fontSize: 12, width: 'auto' }}>
              <option value='name'>名前順</option>
              <option value='expiry'>賞味期限順</option>
              <option value='added'>追加日順</option>
            </select>
          </div>

          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: textMuted }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>在庫がありません</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>＋ボタンから追加してください</div>
            </div>
          ) : filteredItems.map(item => {
            const exp = isExpired(item.expiry), expi = isExpiringSoon(item.expiry), byUser = users[item.addedBy];
            const catColor = catColors[item.category] || '#f1f5f9';
            return (
              <div key={item.id} className='item-row pressable' style={{ ...S.card, marginBottom: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => openEditItem(item)}>
                <div style={{ fontSize: 26, flexShrink: 0, background: catColor, borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{catIcons[item.category] || '📦'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    {exp && <span style={S.tag('#fef2f2', '#ef4444')}>期限切れ</span>}
                    {!exp && expi && <span style={S.tag('#fffbeb', '#d97706')}>期限間近</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={S.tag(catColor, '#555')}>{item.category}</span>
                    <span style={{ color: textMuted, fontSize: 12 }}>{item.quantity}{item.unit}</span>
                    {item.expiry && <span style={{ color: exp ? danger : expi ? warn : textMuted, fontSize: 11 }}>📅 {item.expiry}</span>}
                    {item.purchaseDate && <span style={{ color: textMuted, fontSize: 11 }}>🛒 {item.purchaseDate}</span>}
                    <span style={{ color: '#d1d5db', fontSize: 11 }}>by {byUser?.name || '?'}</span>
                  </div>
                  {item.note && <div style={{ color: textMuted, fontSize: 12, marginTop: 3 }}>📝 {item.note}</div>}
                </div>
                <button onClick={e => { e.stopPropagation(); setConfirmDelete(item); }} style={{ background: '#fef2f2', border: 'none', color: danger, borderRadius: 10, padding: '8px 10px', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>🗑</button>
              </div>
            );
          })}
          <div style={{ height: 100 }} />
        </div>

        <input ref={barcodeRef} type='file' accept='image/*' capture='environment' style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleBarcode(e.target.files[0]); e.target.value = ''; }} />
        <input ref={receiptRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleReceipt(e.target.files[0]); e.target.value = ''; }} />

        {showAddMenu && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }} onClick={() => setShowAddMenu(false)}>
            <div style={{ position: 'fixed', bottom: 96, right: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }} onClick={e => e.stopPropagation()}>
              {[
                { label: '手動で入力', bg: '#374151', action: () => { setShowAddMenu(false); setForm({ purchaseDate: new Date().toISOString().split('T')[0], category: box?.defaultCat || cats[0] }); setScreen('addItem'); } },
                { label: 'レシートを読み取り', bg: '#0891b2', action: () => receiptRef.current?.click() },
                { label: 'バーコードをスキャン', bg: accent, action: () => barcodeRef.current?.click() },
              ].map(({ label, bg, action }) => (
                <button key={label} className='pressable' onClick={action}
                  style={{ background: bg, color: '#fff', border: 'none', borderRadius: 50, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', animation: 'fadeUp 0.2s ease', whiteSpace: 'nowrap' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className='pressable' onClick={() => setShowAddMenu(!showAddMenu)}
          style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: showAddMenu ? danger : accent, border: 'none', color: '#fff', fontSize: 26, cursor: 'pointer', zIndex: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'all 0.2s', transform: showAddMenu ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</button>

        {confirmDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', backdropFilter: 'blur(2px)' }}>
            <div style={{ ...S.card, maxWidth: 340, width: '100%', animation: 'scaleIn 0.2s ease', textAlign: 'center', padding: '28px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🗑</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>「{confirmDelete.name}」を削除しますか？</div>
              <div style={{ color: textMuted, fontSize: 13, marginBottom: 20 }}>この操作は元に戻せません</div>
              <button className='pressable' style={S.btn(danger)} onClick={() => deleteItem(confirmDelete.id)}>削除する</button>
              <button className='pressable' style={S.btnGhost} onClick={() => setConfirmDelete(null)}>キャンセル</button>
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
          <button onClick={() => { setScannedItems([]); setScreen('box'); }} style={S.iconBtn}>← キャンセル</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>読み取り結果</span>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ ...S.card, marginBottom: 14, background: '#eef2ff', border: '1px solid #c7d2fe', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: accent, fontSize: 15 }}>{scannedItems.length}品を検出しました</div>
          <div style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>確認して登録してください</div>
        </div>
        {scannedItems.map((item, i) => (
          <div key={i} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26, background: catColors[item.category] || '#f1f5f9', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{catIcons[item.category] || '📦'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                <select value={item.category} onChange={e => { const n = [...scannedItems]; n[i] = { ...n[i], category: e.target.value }; setScannedItems(n); }}
                  style={{ ...S.input, marginTop: 0, padding: '4px 8px', fontSize: 11, width: 'auto' }}>
                  {cats.map(c => <option key={c} value={c}>{catIcons[c] || '📦'} {c}</option>)}
                </select>
                <span style={{ color: textMuted, fontSize: 12, alignSelf: 'center' }}>{item.quantity}{item.unit}</span>
              </div>
            </div>
            <button onClick={() => setScannedItems(scannedItems.filter((_, j) => j !== i))} style={{ background: '#fef2f2', border: 'none', color: danger, borderRadius: 10, padding: '6px 10px', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button className='pressable' style={S.btn()} onClick={confirmAndAddScanned}>{scannedItems.length}品をまとめて登録</button>
        <button className='pressable' style={S.btnGhost} onClick={() => { setScannedItems([]); setScreen('box'); }}>キャンセル</button>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );

  if (screen === 'addItem' || screen === 'editItem') {
    const isEdit = screen === 'editItem';
    return (
      <div style={S.app}><style>{CSS}</style>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <button onClick={() => { setScreen('box'); setForm({}); setEditingBox(null); }} style={S.iconBtn}>← キャンセル</button>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{isEdit ? '在庫を編集' : '在庫を追加'}</span>
            <div style={{ width: 72 }} />
          </div>
          <div style={S.card}>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>品名 *</label>
              <input style={S.input} placeholder='例：牛乳' value={form.itemName || ''}
                onChange={e => setForm(p => ({ ...p, itemName: e.target.value }))}
                onBlur={async e => {
                  if (!isEdit) await handleEstimateExpiry(e.target.value, form.category || box?.defaultCat || cats[0]);
                }}
              />
              {estimatingExpiry && <div style={{ color: accent, fontSize: 11, marginTop: 4 }}>⏳ 賞味期限を推定中...</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>カテゴリ</label>
              <select style={S.input} value={form.category || (box?.defaultCat || cats[0] || '')} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {boxEnabledCats.map(c => <option key={c} value={c}>{catIcons[c] || '📦'} {c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><label style={S.label}>数量</label><input style={S.input} type='number' min='0' step='0.1' placeholder='1' value={form.quantity || ''} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} /></div>
              <div style={{ flex: 1 }}><label style={S.label}>単位</label><input style={S.input} placeholder='個・本・袋' value={form.unit || ''} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={S.label}>賞味期限</label><input style={S.input} type='date' value={form.expiry || ''} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))} /></div>
            <div style={{ marginBottom: 14 }}><label style={S.label}>購入日</label><input style={S.input} type='date' value={form.purchaseDate || ''} onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))} /></div>
            <div style={{ marginBottom: 8 }}><label style={S.label}>メモ</label><input style={S.input} placeholder='例：開封済み・残り少ない' value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></div>
            <button className='pressable' style={S.btn()} onClick={isEdit ? updateItem : addItem}>{isEdit ? '更新する' : '追加する'}</button>
          </div>
          <div style={{ height: 40 }} />
        </div>
        {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  return null;
}
