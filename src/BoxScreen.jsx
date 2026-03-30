import { isExpired, isExpiringSoon } from './utils';
import BoxIcon from './BoxIcon';

export default function BoxScreen({
  screen, S, accent, danger, warn, border, textMuted, cardBg,
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
        <div style={{ ...S.card, margin​​​​​​​​​​​​​​​​
