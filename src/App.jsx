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
    confirmAndAddScanned, getItemEmoji,
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
          <button onClick={() => setScreen('home')} style={{ background​​​​​​​​​​​​​​​​
