import React from 'react';
import BoxIcon from './BoxIcon';
import BoxForm from './BoxForm';

export default function HomeScreen({
  S, accent, danger, warn, border, text, textMuted, cardBg,
  currentUser, users, boxes, session, visibleBoxes,
  expiredAll, expiringAll, shortageItems, shortageForm, setShortageForm,
  showShortageAdd, setShowShortageAdd, showCode, setShowCode,
  scanning, scanMsg, buyingItem, setBuyingItem, buyBoxId, setBuyBoxId,
  cats, catIcons, catColors, form, setForm,
  setScreen, saveSession, setCurrentBox,
  showToast, addShortage, removeShortage, handleBought, createBox,
  handleShortageBarcode, shortageBarcodeRef, getItemEmoji,
}) {
  const ownerLabel = (uid) => {
    if (!uid || uid === session?.userId) return null;
    return users?.[uid]?.name || null;
  };
  const [showAlertAdd, setShowAlertAdd] = React.useState(false);
  const [alertForm, setAlertForm] = React.useState({ name: '', quantity: '1', unit: '個' });
  const alertBarcodeRef = React.useRef(null);

  return (
    <div style={S.app}>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 20, background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)', borderRadius: 2 }} />
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: text, lineHeight: 1 }}>Home<span style={{ fontWeight: 400, color: textMuted }}>Stock</span></span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', marginTop: 8, color: textMuted }}>{currentUser?.name} <span style={{ fontWeight: 400 }}>さん</span></div>
          </div>
          <button className='pressable' onClick={() => setScreen('settings')} style={{ ...S.iconBtn, padding: '9px 11px' }} aria-label='設定'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'/>
              <circle cx='12' cy='12' r='3'/>
            </svg>
          </button>
        </div>

        {/* 期限アラート */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={S.sectionTitle}><span style={{ fontFamily: 'sans-serif' }}>{'\u26A0\uFE0E'}</span> 期限アラート</div>
            <button onClick={() => setShowAlertAdd(!showAlertAdd)}
              style={{ background: 'none', border: 'none', color: accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
              {showAlertAdd ? '閉じる' : '＋ 追加'}
            </button>
          </div>
          {showAlertAdd && (
            <div style={{ ...S.card, marginBottom: 10, animation: 'fadeUp 0.2s ease' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={{ ...S.input, marginTop: 0, flex: 1 }} placeholder='品名' value={alertForm.name} onChange={e => setAlertForm(p => ({ ...p, name: e.target.value }))} />
                <input style={{ ...S.input, marginTop: 0, width: 60 }} placeholder='数量' value={alertForm.quantity} onChange={e => setAlertForm(p => ({ ...p, quantity: e.target.value }))} />
                <input style={{ ...S.input, marginTop: 0, width: 56 }} placeholder='単位' value={alertForm.unit} onChange={e => setAlertForm(p => ({ ...p, unit: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className='pressable' style={{ ...S.btn(), marginTop: 0, flex: 1 }} onClick={async () => {
                  if (!alertForm.name.trim()) return showToast('品名を入力してください', 'error');
                  await addShortage(alertForm);
                  setAlertForm({ name: '', quantity: '1', unit: '個' });
                  setShowAlertAdd(false);
                }}>在庫切れリストに追加</button>
                <button className='pressable' onClick={() => alertBarcodeRef.current?.click()}
                  style={{ background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: '0 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 0 }}>📷</button>
              </div>
              {scanning && <div style={{ color: accent, fontSize: 12, marginTop: 8, fontWeight: 600 }}>{scanMsg}</div>}
            </div>
          )}
          {expiredAll.length === 0 && expiringAll.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '18px 20px', color: textMuted, fontSize: 14 }}>期限切れ・期限間近の食材はありません</div>
          ) : (
            <>
              {expiredAll.length > 0 && (
                <div style={{ ...S.card, marginBottom: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 700, color: danger, fontSize: 14, marginBottom: 10, letterSpacing: '-0.01em' }}>期限切れ {expiredAll.length}品</div>
                  {expiredAll.slice(0, 3).map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #fecaca', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>{getItemEmoji(i.name) || catIcons[i.category] || '📦'} {i.name}</span>
                      <span style={{ fontSize: 12, color: danger, fontWeight: 500, whiteSpace: 'nowrap' }}>{i.expiry}・{boxes[i.boxId]?.name || '?'}</span>
                    </div>
                  ))}
                  {expiredAll.length > 3 && <div style={{ fontSize: 12, color: danger, marginTop: 8, fontWeight: 500 }}>他 {expiredAll.length - 3}品...</div>}
                </div>
              )}
              {expiringAll.length > 0 && (
                <div style={{ ...S.card, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: 700, color: warn, fontSize: 14, marginBottom: 10, letterSpacing: '-0.01em' }}>もうすぐ期限 {expiringAll.length}品（3日以内）</div>
                  {expiringAll.slice(0, 3).map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #fde68a', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>{getItemEmoji(i.name) || catIcons[i.category] || '📦'} {i.name}</span>
                      <span style={{ fontSize: 12, color: warn, fontWeight: 500, whiteSpace: 'nowrap' }}>{i.expiry}・{boxes[i.boxId]?.name || '?'}</span>
                    </div>
                  ))}
                  {expiringAll.length > 3 && <div style={{ fontSize: 12, color: warn, marginTop: 8, fontWeight: 500 }}>他 {expiringAll.length - 3}品...</div>}
                </div>
              )}
            </>
          )}
        </div>

        {/* 在庫切れリスト */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={S.sectionTitle}>買い物リスト</div>
            <button onClick={() => setShowShortageAdd(!showShortageAdd)}
              style={{ background: 'none', border: 'none', color: accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
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
                  style={{ background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: '0 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 0 }}>📷</button>
              </div>
              {scanning && <div style={{ color: accent, fontSize: 12, marginTop: 8, fontWeight: 600 }}>{scanMsg}</div>}
            </div>
          )}
          {shortageItems.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '18px 20px', color: textMuted, fontSize: 14 }}>在庫切れアイテムはありません</div>
          ) : shortageItems.map(item => {
            const byName = ownerLabel(item._ownerUid);
            return (
            <div key={(item._ownerUid || '') + ':' + item.id} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 26 }}>{getItemEmoji(item.name) || '🛒'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{item.name}</div>
                <div style={{ color: textMuted, fontSize: 13, marginTop: 2 }}>
                  {item.quantity}{item.unit}
                  {byName && <span style={{ marginLeft: 8, fontSize: 11.5, color: '#a3a3a3' }}>by {byName}</span>}
                </div>
              </div>
              <button onClick={() => { setBuyingItem(item); setBuyBoxId(visibleBoxes[0]?.id || ''); }}
                style={{ background: '#dcfce7', border: 'none', color: '#15803d', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '-0.01em' }}>購入した</button>
              <button onClick={() => removeShortage(item.id, item._ownerUid)} aria-label='削除'
                style={{ background: '#fef2f2', border: 'none', color: danger, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 14 }}>🗑</button>
            </div>
          );})}
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
                    <div style={{ background: '#f5f5f4', borderRadius: 12, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BoxIcon k={b.icon} size={40} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>{b.name}</div>
                      <div style={{ color: textMuted, fontSize: 13, marginTop: 2 }}>{isOwn ? '自分のボックス' : owner?.name + 'さんのボックス'}</div>
                    </div>
                  </div>
                  <span style={{ color: '#d1d5db', fontSize: 22, fontWeight: 300 }}>›</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 新しいボックス作成 */}
        <div style={{ ...S.card, marginBottom: 10, border: '1px dashed ' + border }}>
          <div style={{ ...S.sectionTitle, marginBottom: 14 }}>新しい在庫ボックスを作る</div>
          <BoxForm form={form} setForm={setForm} onSubmit={createBox} submitLabel='作成する' existing={null} cats={cats} catIcons={catIcons} catColors={catColors} S={S} accent={accent} textMuted={textMuted} />
        </div>

        {/* 招待コード */}
        <div style={{ ...S.card, marginBottom: 10, border: '1px dashed ' + border }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ ...S.sectionTitle, marginBottom: 0 }}>家族を招待する</div>
            <button onClick={() => setShowCode(!showCode)} style={{ background: 'none', border: 'none', color: accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, letterSpacing: '-0.01em' }}>
              {showCode ? '隠す' : 'コードを表示'}
            </button>
          </div>
          <p style={{ color: textMuted, fontSize: 13, margin: '0 0 12px', lineHeight: 1.55 }}>招待コードを家族に送ると、お互いの全ボックスを共有できます。</p>
          {showCode && (
            <div style={{ background: '#f5f5f4', borderRadius: 10, padding: '14px 16px', fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 20, fontWeight: 700, color: accent, textAlign: 'center', letterSpacing: 3, marginBottom: 8, animation: 'fadeUp 0.2s ease' }}>
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
      <input ref={alertBarcodeRef} type='file' accept='image/*' capture='environment' style={{ display: 'none' }}
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
    </div>
  );
}
