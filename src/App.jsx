import { useAppState } from './useAppState';
import BoxIcon from './BoxIcon';
import BoxForm from './BoxForm';
import HomeScreen from './HomeScreen';
import BoxScreen from './BoxScreen';
import SubScreens from './SubScreens';
import { GUIDE_STEPS, CAT_COLOR_OPTIONS, CAT_ICON_OPTIONS, CSS } from './constants';
import { lsSet } from './utils';

const accent = '#111827';
const accentLight = '#f5f5f4';
const danger = '#dc2626';
const warn = '#b45309';
const text = '#0a0a0a';
const textMuted = '#737373';
const border = '#e7e5e4';
const cardBg = '#ffffff';

const S = {
  app: { minHeight: '100dvh', background: 'linear-gradient(180deg, #fafaf9 0%, #f5f4f1 100%)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: text, letterSpacing: '-0.01em' },
  wrap: { maxWidth: 430, margin: '0 auto', padding: '0 20px', minHeight: '100dvh' },
  card: { background: cardBg, borderRadius: 14, padding: '18px 20px', border: 'none', boxShadow: '0 0 0 1px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.025)' },
  btn: (c = accent) => ({ background: c === accent ? 'linear-gradient(180deg, #1f2937 0%, #111827 100%)' : c, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 10, letterSpacing: '-0.01em', fontFamily: 'inherit', boxShadow: c === accent ? '0 1px 2px rgba(15,23,42,0.18), 0 4px 12px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' : 'none', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }),
  btnGhost: { background: 'transparent', color: textMuted, border: '1px solid ' + border, borderRadius: 10, padding: '13px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 8, fontFamily: 'inherit', transition: 'background 0.15s ease, border-color 0.15s ease' },
  input: { width: '100%', background: '#ffffff', border: '1px solid ' + border, borderRadius: 10, padding: '13px 14px', fontSize: 15, color: text, outline: 'none', marginTop: 6, fontFamily: 'inherit', fontWeight: 400, letterSpacing: '-0.01em', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' },
  label: { fontSize: 13, fontWeight: 600, color: text, letterSpacing: '-0.01em', display: 'block' },
  hdr: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 22, paddingBottom: 18 },
  iconBtn: { background: cardBg, border: 'none', borderRadius: 10, padding: '9px 13px', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit', color: text, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 0 0 1px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' },
  tag: (bg, fg) => ({ display: 'inline-flex', alignItems: 'center', padding: '3.5px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: bg, color: fg || text, whiteSpace: 'nowrap', letterSpacing: '0.005em' }),
  toast: (t) => ({ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', background: t === 'error' ? 'rgba(220,38,38,0.92)' : t === 'success' ? 'rgba(22,163,74,0.92)' : 'rgba(17,24,39,0.92)', backdropFilter: 'blur(12px) saturate(180%)', WebkitBackdropFilter: 'blur(12px) saturate(180%)', color: '#fff', padding: '12px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 1000, whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(15,23,42,0.24), 0 0 0 1px rgba(255,255,255,0.06) inset', animation: 'fadeUp 0.25s cubic-bezier(.2,.9,.3,1.4)' }),
  sectionTitle: { fontSize: 15, fontWeight: 700, color: text, letterSpacing: '-0.02em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 },
};

export default function App() {
  const state = useAppState();
  const {
    screen, setScreen, users, boxes, session, currentBox, setCurrentBox,
    currentUser, editingItem, setEditingItem, editingBox, setEditingBox, toast,
    authMode, setAuthMode, form, setForm,
    filterCat, setFilterCat, filterType, setFilterType, sortBy, setSortBy,
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

  const commonProps = {
    S, accent, accentLight, danger, warn, text, textMuted, border, cardBg,
    users, boxes, session, currentBox, setCurrentBox,
    currentUser, editingItem, setEditingItem, editingBox, setEditingBox,
    authMode, setAuthMode, form, setForm,
    filterCat, setFilterCat, filterType, setFilterType, sortBy, setSortBy,
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
    setScreen, lsSet,
  };

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
            ? <button className='pressable' style={S.btn()} onClick={() => setGuideStep(guideStep + 1)}>次へ</button>
            : <button className='pressable' style={S.btn()} onClick={() => setScreen('home')}>はじめる！</button>
          }
          {guideStep > 0 && <button className='pressable' style={S.btnGhost} onClick={() => setGuideStep(guideStep - 1)}>戻る</button>}
          <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: textMuted, fontSize: 13, cursor: 'pointer', marginTop: 12, fontFamily: 'inherit' }}>スキップ</button>
        </div>
      </div>
    </div>
  );

  if (screen === 'home') return (
    <>
      <style>{CSS}</style>
      <HomeScreen {...commonProps} />
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </>
  );

  if (['box', 'addItem', 'editItem', 'scanResult'].includes(screen)) return (
    <>
      <style>{CSS}</style>
      <BoxScreen {...commonProps} screen={screen} />
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </>
  );

  if (['auth', 'settings', 'catSettings', 'editBox'].includes(screen)) return (
    <>
      <style>{CSS}</style>
      <SubScreens {...commonProps} screen={screen} />
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </>
  );

  return null;
}
