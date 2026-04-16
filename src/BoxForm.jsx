import BoxIcon from './BoxIcon';
import { BOX_ICON_KEYS, BOX_LABELS } from './constants';

export default function BoxForm({ form, setForm, onSubmit, submitLabel, existing, cats, catIcons, catColors, S, accent, textMuted }) {
  const ec = form.enabledCats || existing?.enabledCats || cats;
  return (
    <div style={S.card}>
      <div style={{ marginBottom: 14 }}>
        <label style={S.label}>アイコンを選ぼう</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {BOX_ICON_KEYS.map(k => (
            <button key={k} onClick={() => setForm(p => ({ ...p, boxIcon: k }))}
              style={{ background: (form.boxIcon || existing?.icon || 'fridge') === k ? '#f5f5f4' : '#fafaf9', border: (form.boxIcon || existing?.icon || 'fridge') === k ? '1.5px solid ' + accent : '1px solid #e7e5e4', borderRadius: 10, padding: '10px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
              <BoxIcon k={k} size={36} />
              <span style={{ fontSize: 11, fontWeight: 600, color: (form.boxIcon || existing?.icon || 'fridge') === k ? accent : '#525252', textAlign: 'center', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{BOX_LABELS[k]}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={S.label}>ボックス名</label>
        <input style={S.input} placeholder='例：キッチン' value={form.boxName ?? (existing?.name || '')} onChange={e => setForm(p => ({ ...p, boxName: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={S.label}>デフォルトカテゴリ</label>
        <select style={S.input} value={form.defaultCat ?? (existing?.defaultCat || cats[0] || '')} onChange={e => setForm(p => ({ ...p, defaultCat: e.target.value }))}>
          {cats.map(c => <option key={c} value={c}>{catIcons[c] || '📦'} {c}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={S.label}>表示するカテゴリ</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {cats.map(c => {
            const enabled = ec.includes(c);
            return (
              <button key={c} onClick={() => setForm(p => ({ ...p, enabledCats: enabled ? ec.filter(x => x !== c) : [...ec, c] }))}
                style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', background: enabled ? (catColors[c] || '#f0efed') : '#f0efed', color: enabled ? '#1f2937' : textMuted, letterSpacing: '-0.01em' }}>
                {catIcons[c] || '📦'} {c}
              </button>
            );
          })}
        </div>
      </div>
      <button className='pressable' style={S.btn()} onClick={onSubmit}>{submitLabel}</button>
    </div>
  );
}
