import { isExpired, isExpiringSoon } from './utils';
import BoxIcon from './BoxIcon';

export default function BoxScreen({
  S, accent, danger, warn, border, textMuted, cardBg,
  users, session, box, boxItems, boxEnabledCats, filteredItems,
  filterCat, setFilterCat, filterType, setFilterType, sortBy, setSortBy,
  scanning, scanMsg, confirmDelete, setConfirmDelete, scannedItems, setScannedItems,
  cats, catIcons, catColors, form, setForm,
  setScreen, setEditingBox, openEditItem, deleteItem,
  handleBarcode, handleReceipt, handleEstimateExpiry,
  confirmAndAddScanned, showAddMenu, setShowAddMenu,
  barcodeRef, receiptRef, estimatingExpiry,
}) {
  const expiredItems = boxItems.filter(i => isExpired(i.expiry));
  const expiringItems = boxItems.filter(i => isExpiringSoon(i.expiry));

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

  if (S.screen === 'scanResult') return (
    <div style={S.app}>
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
            <div style={{ fontSize: 26, background: catColors[item.category] || '#f1f5f9', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {getItemEmoji(item.name) || catIcons[item.category] || '📦'}
            </div>
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

  if (S.screen === 'addItem' || S.screen === 'editItem') {
    const isEdit = S.screen === 'editItem';
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
              <label style={S.label}>品名 *</label>
              <input style={S.input} placeholder='例：牛乳' value={form.itemName || ''}
                onChange={e => setForm(p => ({ ...p, itemName: e.target.value }))}
                onBlur={async e => { if (!isEdit) await handleEstimateExpiry(e.target.value, form.category || box?.defaultCat || cats[0]); }}
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
            <button className='pressable' style={S.btn()} onClick={isEdit ? () => {} : () => {}}>{isEdit ? '更新する' : '追加する'}</button>
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
            <button key={v} onClick={() => setFilterType(v)} style={{ flex: 1, padding: '7px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: filterType === v ? cardBg : 'transparent', color: filterType === v ? '#1a1a1a' : textMuted, boxShadow: filterType === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
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
          const itemEmoji = getItemEmoji(item.name);
          return (
            <div key={item.id} className='item-row pressable' style={{ ...S.card, marginBottom: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => openEditItem(item)}>
              <div style={{ fontSize: 26, flexShrink: 0, background: catColor, borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {itemEmoji || catIcons[item.category] || '📦'}
              </div>
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
    </div>
  );
}
