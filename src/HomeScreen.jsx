import BoxIcon from './BoxIcon';
import BoxForm from './BoxForm';

export default function HomeScreen({
  S, accent, danger, warn, border, textMuted, cardBg,
  currentUser, users, boxes, session, visibleBoxes,
  expiredAll, expiringAll, shortageItems, shortageForm, setShortageForm,
  showShortageAdd, setShowShortageAdd, showCode, setShowCode,
  scanning, scanMsg, buyingItem, setBuyingItem, buyBoxId, setBuyBoxId,
  cats, catIcons, catColors, form, setForm,
  setScreen, saveSession, setCurrentBox,
  showToast, addShortage, removeShortage, handleBought, createBox,
  handleShortageBarcode, shortageBarcodeRef, getItemEmoji,
}) {
  const [showAlertAdd, setShowAlertAdd] = React.useState(false);
  const [alertForm, setAlertForm] = React.useState({ name: '', quantity: '1', unit: '個' });
  const alertBarcodeRef = React.useRef(null);

  return (
    <div style={S.app}>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize: 13, color: textMuted, fontWeight: 500 }}>こんにちは</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 1 }}>{currentUser?.name}さん</div>
          </div>
          <button onClick={() => setScreen('settings')} style={S.iconBtn}>⚙️</button>
        </div>

        {/* 期限アラート */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={S.sectionTitle}>⚠️ 期限アラート</div>
            <button onClick={() => setShowAlertAdd(!showAlertAdd)}
              style={{ background: 'none', border: 'none', color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
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
            <div style={{ ...S.card, textAlign: 'center', padding: '16px 20px', color: textMuted, fontSize: 13 }}>期限切れ・期限間近の食材はありません</div>
          ) : (
            <>
              {expiredAll.length > 0 && (
                <div style={{ ...S.card, marginBottom: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 700, color: danger, fontSize: 13, marginBottom: 8 }}>期限切れ {expiredAll.length}品</div>
                  {expiredAll.slice(0, 3).map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #fecaca' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{getItemEmoji(i.name) || catIcons[i.category] || '📦'} {i.name}</span>
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
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{getItemEmoji(i.name) || catIcons[i.category] || '📦'} {i.name}</span>
                      <span style={{ fontSize: 11, color: warn }}>📅 {i.expiry}・{boxes[i.boxId]?.name || '?'}</span>
                    </div>
                  ))}
                  {expiringAll.length > 3 && <div style={{ fontSize: 11, color: warn, marginTop: 6 }}>他 {expiringAll.length - 3}品...</div>}
                </div>
              )}
            </>
          )}
        </div>

        {/* 在庫切れリスト */}
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
                  style={{ background: accent, color: '#fff', border: 'none', borderRadius: 12, padding: '0 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 0 }}>📷</button>
              </div>
              {scanning && <div style={{ color: accent, fontSize: 12, marginTop: 8, fontWeight: 600 }}>{scanMsg}</div>}
            </div>
          )}
          {shortageItems.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '16px 20px', color: textMuted, fontSize: 13 }}>在庫切れアイテムはありません</div>
          ) : shortageItems.map(item => (
            <div key={item.id} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24 }}>{getItemEmoji(item.name) || '🛒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                <div style={{ color: textMuted, fontSize: 12 }}>{item.quantity}{item.unit}</div>
              </div>
              <button onClick={() => { setBuyingItem(item); setBuyBoxId(visibleBoxes[0]?.id || ''); }}
                style={{ background: '#dcfce7', border: 'none', color: '#16a34a', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>購入した</button>
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
