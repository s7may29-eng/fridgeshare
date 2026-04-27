import BoxIcon from './BoxIcon';
import BoxForm from './BoxForm';
import { GUIDE_STEPS, CAT_COLOR_OPTIONS, CAT_ICON_OPTIONS } from './constants';

export default function SubScreens({
  screen, S, accent, accentLight, danger, textMuted, border, cardBg,
  users, session, currentBox, currentUser, editingBox, setEditingBox,
  authMode, setAuthMode, form, setForm,
  inviteInput, setInviteInput, loading,
  geminiKey, setGeminiKey,
  newCatName, setNewCatName, newCatIcon, setNewCatIcon, newCatColor, setNewCatColor,
  cats, catIcons, catColors, friendIds, boxes, visibleBoxes,
  setScreen, showToast, lsSet,
  handleRegister, handleLogin, handleLogout, addFriend,
  updateBox, addCat, deleteCat,
}) {
  if (screen === 'auth') return (
    <div style={S.app}>
      <div style={S.wrap}>
        <div style={{ paddingTop: 64, paddingBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: accentLight, borderRadius: 16, padding: 16, marginBottom: 18, border: '1px solid #e7e5e4' }}>
            <BoxIcon k='fridge' size={44} />
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.045em', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
            <span>Home</span>
            <span style={{ fontWeight: 400, color: textMuted }}>Stock</span>
          </h1>
          <p style={{ color: textMuted, fontSize: 13.5, margin: 0, letterSpacing: '0.02em', fontWeight: 500 }}>家族みんなで在庫を管理</p>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f0efed', borderRadius: 10, padding: 3 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setForm({}); }}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', background: authMode === m ? cardBg : 'transparent', color: authMode === m ? '#0a0a0a' : textMuted, boxShadow: authMode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', letterSpacing: '-0.01em' }}>
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
    </div>
  );

  if (screen === 'editBox') return (
    <div style={S.app}>
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
    <div style={S.app}>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={() => setScreen('settings')} style={S.iconBtn}>← 戻る</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>カテゴリ管理</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16, letterSpacing: '-0.02em' }}>カテゴリを追加</div>
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
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16, letterSpacing: '-0.02em' }}>現在のカテゴリ</div>
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
    </div>
  );

  if (screen === 'settings') return (
    <div style={S.app}>
      <div style={S.wrap}>
        <div style={S.hdr}>
          <button onClick={() => setScreen(currentBox ? 'box' : 'home')} style={S.iconBtn}>← 戻る</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>設定</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 16, letterSpacing: '-0.02em' }}>カテゴリ管理</div>
          <p style={{ color: textMuted, fontSize: 13, marginTop: 4, marginBottom: 12, lineHeight: 1.5 }}>カテゴリの追加・削除ができます。</p>
          <button className='pressable' style={S.btn()} onClick={() => setScreen('catSettings')}>カテゴリを管理する</button>
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 16, letterSpacing: '-0.02em' }}>家族を追加</div>
          <p style={{ color: textMuted, fontSize: 13, marginTop: 4, marginBottom: 12, lineHeight: 1.5 }}>家族の招待コードを入力するとお互いのボックスを共有できます。</p>
          {(friendIds && friendIds.length > 0) ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, marginBottom: 6 }}>共有メンバー（{friendIds.length}名）</div>
              {friendIds.map(fid => {
                const f = users[fid];
                return (
                  <div key={fid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid ' + border }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: accent }}>{f?.name?.[0] || '?'}</div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{f?.name || '(読み込み中)'}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: '#fafaf9', borderRadius: 8, fontSize: 12.5, color: textMuted, lineHeight: 1.5 }}>
              共有メンバーはまだいません。下に相手の招待コードを入力してください。
            </div>
          )}
          <label style={S.label}>招待コードを入力</label>
          <input style={S.input} placeholder='XX-XX-XX-XX' value={inviteInput} onChange={e => setInviteInput(e.target.value)} />
          <button className='pressable' style={S.btn()} onClick={addFriend}>追加する</button>
          <details style={{ marginTop: 12, fontSize: 12, color: textMuted }}>
            <summary style={{ cursor: 'pointer', userSelect: 'none' }}>共有状態の詳細</summary>
            <div style={{ padding: '8px 4px 0', lineHeight: 1.7, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11.5, wordBreak: 'break-all' }}>
              {(() => {
                const myId = session?.userId;
                const owners = {};
                Object.values(boxes || {}).forEach(b => {
                  const oid = b.ownerId || '(なし)';
                  owners[oid] = (owners[oid] || 0) + 1;
                });
                const fSet = new Set(friendIds || []);
                const lines = [];
                lines.push(`自分のID: …${(myId || '').slice(-8)}`);
                lines.push(`共有メンバー数: ${(friendIds || []).length}`);
                lines.push(`全ボックス: ${Object.keys(boxes || {}).length} / 表示中: ${(visibleBoxes || []).length}`);
                lines.push('--- ボックスのオーナー別件数 ---');
                Object.entries(owners).forEach(([oid, n]) => {
                  const tag = oid === myId ? '自分' : fSet.has(oid) ? '共有メンバー' : '★非共有';
                  const name = users?.[oid]?.name || '(unknown)';
                  lines.push(`[${tag}] …${oid.slice(-8)} ${name}: ${n}件`);
                });
                return lines.map((l, i) => <div key={i}>{l}</div>);
              })()}
            </div>
          </details>
        </div>
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 16, letterSpacing: '-0.02em' }}>Gemini APIキー</div>
          <p style={{ color: textMuted, fontSize: 13, marginBottom: 14, marginTop: 4, lineHeight: 1.5 }}>レシート読み取り・期限自動推定に使用。<br />aistudio.google.comで無料取得できます。</p>
          <label style={S.label}>APIキー</label>
          <input style={S.input} type='password' placeholder='AIza...' value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
          <button className='pressable' style={S.btn()} onClick={() => { lsSet('hs-gemini', geminiKey); showToast('保存しました！', 'success'); }}>保存する</button>
        </div>
        <div style={S.card}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 16, letterSpacing: '-0.02em' }}>アカウント</div>
          <div style={{ color: textMuted, fontSize: 14, margin: '8px 0 16px' }}>{currentUser?.name} · {currentUser?.email}</div>
          <button className='pressable' style={S.btnGhost} onClick={handleLogout}>ログアウト</button>
        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );

  return null;
}
