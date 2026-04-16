import { isExpired, isExpiringSoon } from './utils';
import BoxIcon from './BoxIcon';

export default function BoxScreen({
  screen, S, accent, danger, warn, border, text, textMuted, cardBg,
  users, session, box, boxItems, boxEnabledCats, filteredItems,
  filterCat, setFilterCat, filterType, setFilterType, sortBy, setSortBy,
  scanning, scanMsg, confirmDelete, setConfirmDelete, scannedItems, setScannedItems,
  cats, catIcons, catColors, form, setForm,
  setScreen, setEditingBox, openEditItem, deleteItem, addItem, updateItem,
  handleBarcode, handleReceipt, handleEstimateExpiry,
  confirmAndAddScanned, showAddMenu, setShowAddMenu,
  barcodeRef, receiptRef, estimatingExpiry, getItemEmoji,
}) {
  const expiredItems = boxItems.filter(i => isExpired(i.expiry));
  const expiringItems = boxItems.filter(i => isExpiringSoon(i.expiry));

  const getEmoji = (name) => {
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

  if (screen === 'scanResult') return (
    <div style={S.app}>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={() => { setScannedItems([]); setScreen('box'); }} style={S.iconBtn}>← キャンセル</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>読み取り結果</span>
          <div style={{ width: 80 }} />
        </div>
        <div style={{ ...S.card, marginBottom: 14, background: '#f5f5f4', border: '1px solid ' + border, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: accent, fontSize: 16, letterSpacing: '-0.02em' }}>{scannedItems.length} 品を検出しました</div>
          <div style={{ color: textMuted, fontSize: 13, marginTop: 4 }}>確認して登録してください</div>
        </div>
        {scannedItems.map((item, i) => (
          <div key={i} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26, background: catColors[item.category] || '#f1f5f9', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {getEmoji(item.name) || catIcons[item.category] || '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>{item.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
                <select value={item.category} onChange={e => { const n = [...scannedItems]; n[i] = { ...n[i], category: e.target.value }; setScannedItems(n); }} style={{ ...S.input, marginTop: 0, padding: '6px 10px', fontSize: 12.5, width: 'auto', fontWeight: 500 }}>
                  {cats.map(c => <option key={c} value={c}>{catIcons[c] || '📦'} {c}</option>)}
                </select>
                <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{item.quantity}{item.unit}</span>
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
      <div style={S.app}>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <button onClick={() => { setScreen('box'); setForm({}); }} style={S.iconBtn}>← キャンセル</button>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{isEdit ? '在庫を編集' : '在庫を追加'}</span>
            <div style={{ width: 72 }} />
          </div>
          <div style={S.card}>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>品名</label>
              <input style={S.input} placeholder='例：牛乳' value={form.itemName || ''}
                onChange={e => setForm(p => ({ ...p, itemName: e.target.value }))}
                onBlur={async e => { if (!isEdit) await handleEstimateExpiry(e.target.value, form.category || box?.defaultCat || cats[0]); }}
              />
              {estimatingExpiry && <div style={{ color: accent, fontSize: 11, marginTop: 4 }}>賞味期限を推定中...</div>}
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
            <div style={{ marginBottom: 8 }}><label style={S.label}>メモ</label><input style={S.input} placeholder='例：開封済み' value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></div>
            <button className='pressable' style={S.btn()} onClick={isEdit ? updateItem : addItem}>{isEdit ? '更新する' : '追加する'}</button>
          </div>
          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={S.app}>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <div>
            <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit', fontWeight: 500, letterSpacing: '-0.01em' }}>← 戻る</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <BoxIcon k={box?.icon} size={26} />
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em' }}>{box?.name}</span>
            </div>
            <div style={{ color: textMuted, fontSize: 13, marginTop: 2, fontWeight: 500 }}>{boxItems.length} 品</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {box?.ownerId === session?.userId && (
              <button onClick={() => { setEditingBox(box); setForm({}); setScreen('editBox'); }} style={{ ...S.iconBtn, gap: 5 }} title='このボックス（名前・アイコン・カテゴリ）を編集'>
                <span style={{ fontSize: 14 }}>✏️</span>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>ボックス編集</span>
              </button>
            )}
            <button className='pressable' onClick={() => setScreen('settings')} style={{ ...S.iconBtn, padding: '9px 11px' }} title='設定' aria-label='設定'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'/>
                <circle cx='12' cy='12' r='3'/>
              </svg>
            </button>
          </div>
        </div>

        {expiredItems.length > 0 && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 14px', marginBottom: 10, fontSize: 14, fontWeight: 600, color: danger, letterSpacing: '-0.01em' }}>期限切れ {expiredItems.length} 品</div>}
        {expiringItems.length > 0 && <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '11px 14px', marginBottom: 10, fontSize: 14, fontWeight: 600, color: warn, letterSpacing: '-0.01em' }}>もうすぐ期限 {expiringItems.length} 品</div>}
        {scanning && <div style={{ background: '#f5f5f4', border: '1px solid ' + border, borderRadius: 10, padding: '12px 14px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: accent }}>{scanMsg}</div>}

        <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: '#f0efed', borderRadius: 10, padding: 3 }}>
          {[['all', 'すべて'], ['food', '食料品'], ['supply', '備品']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterType(v)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', background: filterType === v ? cardBg : 'transparent', color: filterType === v ? text : textMuted, boxShadow: filterType === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', letterSpacing: '-0.01em' }}>{l}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
          <button onClick={() => setFilterCat('all')} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', background: filterCat === 'all' ? accent : '#f0efed', color: filterCat === 'all' ? '#fff' : text, flexShrink: 0, letterSpacing: '-0.01em' }}>すべて</button>
          {boxEnabledCats.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{ whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', background: filterCat === cat ? (catColors[cat] || '#f0efed') : '#f0efed', color: filterCat === cat ? '#1f2937' : text, flexShrink: 0, letterSpacing: '-0.01em' }}>
              {catIcons[cat] || '📦'} {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: textMuted, fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>並び替え</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.input, marginTop: 0, padding: '8px 12px', fontSize: 13, width: 'auto', fontWeight: 500 }}>
            <option value='name'>名前順</option>
            <option value='expiry'>賞味期限順</option>
            <option value='added'>追加日順</option>
          </select>
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: text, letterSpacing: '-0.01em' }}>在庫がありません</div>
            <div style={{ fontSize: 13.5, marginTop: 6 }}>右下の「＋ 在庫追加」から登録してください</div>
          </div>
        ) : filteredItems.map(item => {
          const exp = isExpired(item.expiry), expi = isExpiringSoon(item.expiry), byUser = users[item.addedBy];
          const catColor = catColors[item.category] || '#f1f5f9';
          const itemEmoji = getEmoji(item.name);
          return (
            <div key={item.id} className='item-row pressable' style={{ ...S.card, marginBottom: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => openEditItem(item)}>
              <div style={{ fontSize: 26, flexShrink: 0, background: catColor, borderRadius: 10, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {itemEmoji || catIcons[item.category] || '📦'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{item.name}</span>
                  {exp && <span style={S.tag('#fef2f2', danger)}>期限切れ</span>}
                  {!exp && expi && <span style={S.tag('#fffbeb', warn)}>期限間近</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={S.tag(catColor, '#374151')}>{item.category}</span>
                  <span style={{ color: text, fontSize: 13, fontWeight: 500 }}>{item.quantity}{item.unit}</span>
                  {item.expiry && <span style={{ color: exp ? danger : expi ? warn : textMuted, fontSize: 12.5, fontWeight: 500 }}>{item.expiry}</span>}
                  {item.purchaseDate && <span style={{ color: textMuted, fontSize: 12 }}>購入 {item.purchaseDate}</span>}
                  <span style={{ color: '#a3a3a3', fontSize: 11.5 }}>by {byUser?.name || '?'}</span>
                </div>
                {item.note && <div style={{ color: textMuted, fontSize: 12.5, marginTop: 4 }}>{item.note}</div>}
              </div>
              <button onClick={e => { e.stopPropagation(); setConfirmDelete(item); }} aria-label='削除' style={{ background: '#fef2f2', border: 'none', color: danger, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>🗑</button>
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
              { label: '手動で入力', action: () => { setShowAddMenu(false); setForm({ purchaseDate: new Date().toISOString().split('T')[0], category: box?.defaultCat || cats[0] }); setScreen('addItem'); } },
              { label: 'レシートを読み取り', action: () => receiptRef.current?.click() },
              { label: 'バーコードをスキャン', action: () => barcodeRef.current?.click() },
            ].map(({ label, action }) => (
              <button key={label} className='pressable' onClick={action} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 20px rgba(17,24,39,0.22)', animation: 'fadeUp 0.2s ease', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className='pressable' onClick={() => setShowAddMenu(!showAddMenu)} aria-label='在庫を追加' style={{ position: 'fixed', bottom: 24, right: 24, height: 52, borderRadius: 26, background: showAddMenu ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(180deg, #1f2937 0%, #0a0f1c 100%)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', zIndex: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: showAddMenu ? '0' : '0 20px 0 14px', width: showAddMenu ? 52 : 'auto', boxShadow: showAddMenu ? '0 12px 32px rgba(220,38,38,0.36), 0 2px 6px rgba(220,38,38,0.18), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 12px 32px rgba(15,23,42,0.32), 0 2px 6px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.08)', transition: 'all 0.22s cubic-bezier(.2,.9,.3,1.2)', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
        <span style={{ fontSize: 26, lineHeight: 1, transform: showAddMenu ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>+</span>
        {!showAddMenu && <span>在庫追加</span>}
      </button>

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
    </div>
  );
}
