export const DEFAULT_FOOD_CATS = ['野菜・果物','肉・魚','乳製品','飲み物','調味料','冷凍食品','食料品その他'];
export const DEFAULT_SUPPLY_CATS = ['日用品','洗剤・清掃','衛生用品','文房具','電池・電球','備品その他'];
export const DEFAULT_ALL_CATS = [...DEFAULT_FOOD_CATS, ...DEFAULT_SUPPLY_CATS];

export const DEFAULT_CAT_ICONS = {
  '野菜・果物':'🥦','肉・魚':'🥩','乳製品':'🥛','飲み物':'🧃','調味料':'🧂','冷凍食品':'🧊','食料品その他':'🍱',
  '日用品':'🧴','洗剤・清掃':'🧹','衛生用品':'🪥','文房具':'✏️','電池・電球':'🔋','備品その他':'📦',
};

export const DEFAULT_CAT_COLORS = {
  '野菜・果物':'#bbf7d0','肉・魚':'#fecdd3','乳製品':'#fef9c3','飲み物':'#bfdbfe','調味料':'#e9d5ff','冷凍食品':'#cffafe','食料品その他':'#d1fae5',
  '日用品':'#fed7aa','洗剤・清掃':'#d9f99d','衛生用品':'#fce7f3','文房具':'#fef3c7','電池・電球':'#fef9c3','備品その他':'#f1f5f9',
};

export const CAT_COLOR_OPTIONS = ['#bbf7d0','#fecdd3','#fef9c3','#bfdbfe','#e9d5ff','#cffafe','#d1fae5','#fed7aa','#d9f99d','#fce7f3','#fef3c7','#f1f5f9','#ddd6fe','#fde68a'];
export const CAT_ICON_OPTIONS = ['🥦','🥩','🥛','🧃','🧂','🧊','🍱','🧴','🧹','🪥','✏️','🔋','📦','🍜','🥫','🧈','🫙','🧻','💊','🪣','🧽','📎','💡','🔌','🎽','☕','🛒','❄️','🌿','🥤'];

export const BOX_SVG = {
  fridge: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="11" y="4" width="34" height="48" rx="9" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="2"/><rect x="11" y="4" width="34" height="20" rx="9" fill="#b2ebf2" stroke="#4dd0e1" stroke-width="2"/><line x1="11" y1="22" x2="45" y2="22" stroke="#4dd0e1" stroke-width="2"/><rect x="37" y="10" width="4" height="9" rx="2" fill="#00acc1"/><rect x="37" y="30" width="4" height="9" rx="2" fill="#00acc1"/></svg>',
  freezer: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="10" y="4" width="36" height="48" rx="8" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/><rect x="10" y="4" width="36" height="30" rx="8" fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/><line x1="10" y1="32" x2="46" y2="32" stroke="#38bdf8" stroke-width="2"/><rect x="38" y="10" width="4" height="10" rx="2" fill="#0284c7"/><rect x="38" y="36" width="4" height="8" rx="2" fill="#0284c7"/><line x1="21" y1="11" x2="21" y2="27" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="13" y1="19" x2="29" y2="19" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="14.7" y1="13.7" x2="27.3" y2="26.3" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="27.3" y1="13.7" x2="14.7" y2="26.3" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><line x1="21" y1="14" x2="18.5" y2="16.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="21" y1="14" x2="23.5" y2="16.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="21" y1="26" x2="18.5" y2="23.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="21" y1="26" x2="23.5" y2="23.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="15" y1="20" x2="17.5" y2="17.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="15" y1="20" x2="17.5" y2="22.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="27" y1="20" x2="24.5" y2="17.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><line x1="27" y1="20" x2="24.5" y2="22.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  condiment: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="8" y="20" width="18" height="30" rx="5" fill="#fde68a" stroke="#f59e0b" stroke-width="2.5"/><rect x="11" y="14" width="12" height="8" rx="3" fill="#fde68a" stroke="#f59e0b" stroke-width="2.5"/><rect x="14" y="10" width="6" height="6" rx="2" fill="#f59e0b"/><rect x="11" y="28" width="12" height="14" rx="3" fill="#fff" opacity="0.6"/><line x1="13" y1="32" x2="21" y2="32" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><line x1="13" y1="36" x2="21" y2="36" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><rect x="30" y="26" width="16" height="24" rx="5" fill="#bbf7d0" stroke="#4ade80" stroke-width="2.5"/><rect x="33" y="20" width="10" height="8" rx="3" fill="#bbf7d0" stroke="#4ade80" stroke-width="2.5"/><rect x="36" y="16" width="4" height="6" rx="2" fill="#4ade80"/><circle cx="34" cy="34" r="2" fill="#4ade80" opacity="0.5"/><circle cx="39" cy="38" r="2" fill="#4ade80" opacity="0.5"/><circle cx="43" cy="34" r="2" fill="#4ade80" opacity="0.5"/></svg>',
  stock: '<svg width="40" height="40" viewBox="0 0 130 130" fill="none"><rect x="10" y="85" width="74" height="22" fill="#fecdd3"/><line x1="10" y1="85" x2="10" y2="107" stroke="#f87171" stroke-width="3.5"/><line x1="84" y1="85" x2="84" y2="107" stroke="#f87171" stroke-width="3.5"/><ellipse cx="47" cy="107" rx="37" ry="10" fill="#fecdd3" stroke="#f87171" stroke-width="3.5"/><ellipse cx="47" cy="85" rx="37" ry="10" fill="#fca5a5" stroke="#f87171" stroke-width="3.5"/><ellipse cx="47" cy="85" rx="30" ry="7.5" fill="#fca5a5" stroke="#f87171" stroke-width="2"/><g transform="rotate(-40, 101, 71)"><ellipse cx="101" cy="71" rx="22" ry="16" fill="#fca5a5" stroke="#f87171" stroke-width="3"/><ellipse cx="101" cy="71" rx="15" ry="10" fill="#fecdd3" stroke="#f87171" stroke-width="2.5"/><ellipse cx="101" cy="71" rx="8" ry="6" fill="#fca5a5" stroke="#f87171" stroke-width="2"/></g></svg>',
  alcohol: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><path d="M3 18 L3 50 Q3 54 13 54 Q23 54 23 50 L23 18" fill="#fde68a"/><line x1="3" y1="18" x2="3" y2="50" stroke="#f59e0b" stroke-width="2"/><line x1="23" y1="18" x2="23" y2="50" stroke="#f59e0b" stroke-width="2"/><ellipse cx="13" cy="50" rx="10" ry="3" fill="#fde68a" stroke="#f59e0b" stroke-width="2"/><ellipse cx="13" cy="18" rx="10" ry="3" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/><path d="M13 16 Q15 14 17 15 Q19 16 18 18 Q17 19 15 18 Q13 17 14 15" stroke="#d97706" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="13" cy="34" rx="7" ry="9" fill="#fff" opacity="0.55"/><line x1="8" y1="32" x2="18" y2="32" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><line x1="8" y1="36" x2="18" y2="36" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M37 5 Q37 5 37 10 Q37 16 34 20 Q32 24 32 30 L32 51 Q32 54 41 54 Q50 54 50 51 L50 30 Q50 24 47 20 Q44 16 44 10 Q44 5 44 5 Q44 3 41 3 Q37 3 37 5 Z" fill="#e9d5ff" stroke="#a78bfa" stroke-width="2" stroke-linejoin="round"/><rect x="39" y="1" width="4" height="4" rx="1.5" fill="#c4b5fd" stroke="#a78bfa" stroke-width="1.5"/><rect x="33" y="35" width="16" height="13" rx="2" fill="#fff" opacity="0.65"/><line x1="35" y1="40" x2="48" y2="40" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/><line x1="35" y1="44" x2="44" y2="44" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/></svg>',
  coffee: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><path d="M10 26 L14 46 H38 L42 26 Z" fill="#fed7aa" stroke="#fb923c" stroke-width="2" stroke-linejoin="round"/><path d="M42 30 Q52 30 52 36 Q52 42 42 42" stroke="#fb923c" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="26" cy="47" rx="18" ry="4" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><path d="M18 22 Q19 17 18 12" stroke="#fdba74" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M26 20 Q27 15 26 10" stroke="#fdba74" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M34 22 Q35 17 34 12" stroke="#fdba74" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  bath: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><path d="M8 38 L8 46 Q8 50 12 50 L44 50 Q48 50 48 46 L48 38 Z" fill="#dbeafe" stroke="#60a5fa" stroke-width="2.5" stroke-linejoin="round"/><line x1="6" y1="38" x2="50" y2="38" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="50" x2="14" y2="55" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><line x1="42" y1="50" x2="42" y2="55" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/><path d="M36 6 Q46 6 46 18" stroke="#60a5fa" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="36" cy="6" rx="7" ry="4.5" fill="#bfdbfe" stroke="#60a5fa" stroke-width="2"/><circle cx="33" cy="6" r="1" fill="#60a5fa"/><circle cx="36" cy="6" r="1" fill="#60a5fa"/><circle cx="39" cy="6" r="1" fill="#60a5fa"/><line x1="29" y1="13" x2="26" y2="24" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="14" x2="30" y2="26" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="35" y1="14" x2="34" y2="27" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="13" x2="38" y2="26" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><line x1="41" y1="13" x2="42" y2="25" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/><circle cx="26" cy="26" r="1.5" fill="#93c5fd"/><circle cx="30" cy="28" r="1.5" fill="#93c5fd"/><circle cx="34" cy="29" r="1.5" fill="#93c5fd"/><circle cx="38" cy="28" r="1.5" fill="#93c5fd"/><circle cx="42" cy="27" r="1.5" fill="#93c5fd"/></svg>',
  laundry: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="7" y="7" width="42" height="44" rx="10" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/><rect x="7" y="7" width="42" height="14" rx="10" fill="#bae6fd" stroke="#38bdf8" stroke-width="2"/><line x1="7" y1="19" x2="49" y2="19" stroke="#38bdf8" stroke-width="2"/><circle cx="18" cy="13" r="3" fill="#0ea5e9"/><rect x="26" y="10" width="16" height="5" rx="2.5" fill="#93c5fd"/><circle cx="28" cy="35" r="13" fill="#fff" stroke="#38bdf8" stroke-width="2.5"/><circle cx="28" cy="35" r="8" fill="#bae6fd"/><circle cx="28" cy="35" r="4" fill="#fff"/></svg>',
  electronics: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><circle cx="22" cy="22" r="14" fill="#fef9c3" stroke="#facc15" stroke-width="2"/><rect x="17" y="34" width="10" height="4" rx="1" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="17" y="38" width="10" height="4" rx="1" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/><rect x="18" y="42" width="8" height="3" rx="1.5" fill="#f59e0b"/><path d="M19 18 Q22 14 25 18 Q28 22 25 26 Q22 28 19 26" stroke="#f59e0b" stroke-width="1.5" fill="none" stroke-linecap="round"/><rect x="36" y="30" width="14" height="20" rx="3" fill="#bbf7d0" stroke="#4ade80" stroke-width="2"/><rect x="40" y="26" width="6" height="5" rx="1.5" fill="#4ade80" stroke="#22c55e" stroke-width="1.5"/><line x1="39" y1="38" x2="47" y2="38" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/><line x1="43" y1="44" x2="43" y2="48" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/><line x1="40" y1="46" x2="46" y2="46" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/></svg>',
  medicine: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><rect x="6" y="16" width="44" height="34" rx="9" fill="#fee2e2" stroke="#f87171" stroke-width="2"/><rect x="6" y="16" width="44" height="12" rx="9" fill="#fecaca" stroke="#f87171" stroke-width="2"/><rect x="24" y="31" width="8" height="14" rx="2.5" fill="#fff"/><rect x="19" y="36" width="18" height="5" rx="2.5" fill="#fff"/></svg>',
  gym: '<svg width="40" height="40" viewBox="0 0 56 56" fill="none"><line x1="18" y1="28" x2="38" y2="28" stroke="#86efac" stroke-width="4" stroke-linecap="round"/><rect x="11" y="20" width="8" height="16" rx="3" fill="#86efac" stroke="#22c55e" stroke-width="2"/><rect x="3" y="17" width="9" height="22" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="2"/><rect x="37" y="20" width="8" height="16" rx="3" fill="#86efac" stroke="#22c55e" stroke-width="2"/><rect x="44" y="17" width="9" height="22" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="2"/></svg>',
  other: '<svg width="40" height="40" viewBox="0 0 100 100" fill="none"><rect x="14" y="52" width="72" height="40" rx="3" fill="#ffe8dc"/><path d="M50 8 L96 52 H4 Z" fill="#ffb499" stroke="#f4845f" stroke-width="3" stroke-linejoin="round"/><path d="M14 52 L50 18 L86 52 L86 92 Q86 92 83 92 L17 92 Q14 92 14 89 Z" fill="#ffe8dc" stroke="#f4845f" stroke-width="2.5" stroke-linejoin="round"/><rect x="20" y="67" width="18" height="25" rx="2" fill="#ffb499" stroke="#f4845f" stroke-width="2"/><circle cx="35" cy="80" r="2" fill="#f4845f"/><rect x="54" y="59" width="24" height="22" rx="2" fill="#ffb499" stroke="#f4845f" stroke-width="2"/><line x1="66" y1="59" x2="66" y2="81" stroke="#f4845f" stroke-width="2"/><line x1="54" y1="70" x2="78" y2="70" stroke="#f4845f" stroke-width="2"/></svg>',
};

export const BOX_ICON_KEYS = ['fridge','freezer','condiment','stock','alcohol','coffee','bath','laundry','electronics','medicine','gym','other'];
export const BOX_LABELS = { fridge:'冷蔵庫', freezer:'冷凍庫', condiment:'調味料', stock:'ストック食材', alcohol:'お酒', coffee:'コーヒー・お茶', bath:'洗面・お風呂', laundry:'洗濯・掃除', electronics:'家電関連', medicine:'薬・衛生', gym:'ジム用品', other:'その他' };

export const BOX_DEFAULT_CATS = {
  fridge:      ['野菜・果物','肉・魚','乳製品','飲み物','調味料','冷凍食品'],
  freezer:     ['肉・魚','冷凍食品','乳製品'],
  condiment:   ['調味料','食料品その他'],
  stock:       ['食料品その他','調味料','飲み物'],
  alcohol:     ['飲み物','食料品その他'],
  coffee:      ['飲み物','食料品その他'],
  bath:        ['衛生用品','日用品'],
  laundry:     ['洗剤・清掃','日用品'],
  electronics: ['電池・電球','備品その他'],
  medicine:    ['衛生用品','備品その他'],
  gym:         ['備品その他','日用品'],
  other:       ['食料品その他','日用品','備品その他'],
};

export const GUIDE_STEPS = [
  { icon: '📦', title: '在庫ボックスを作ろう', desc: '冷蔵庫・棚・洗面台など、場所ごとにボックスを作って管理できます。アイコンを選ぶと最適なカテゴリが自動で設定されます。' },
  { icon: '🗂️', title: 'カテゴリは後から変更できます', desc: 'ボックスの✏️ボタンから、表示するカテゴリやデフォルトカテゴリをいつでも変更できます。' },
  { icon: '👨‍👩‍👧', title: '家族を招待しよう', desc: 'ホーム画面の招待ボタンから家族に共有。一度で全ボックスを共有できます。' },
  { icon: '📷', title: '3つの方法で追加', desc: 'バーコードスキャン・レシート読み取り・手動入力で簡単に在庫を登録できます。' },
  { icon: '⏰', title: '期限を管理しよう', desc: '賞味期限が近づくと自動でお知らせ。品名を入力するとAIが期限を自動推定します。' },
];

export const STYLES = {
  accent: '#111827',
  accentLight: '#f5f5f4',
  danger: '#dc2626',
  warn: '#b45309',
  text: '#0a0a0a',
  textMuted: '#737373',
  border: '#e7e5e4',
  cardBg: '#ffffff',
};

export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; }
  html, body { margin:0; padding:0; background:#fafaf9; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color:#0a0a0a; letter-spacing:-0.01em; }
  select option { background:#fff; color:#0a0a0a; }
  input[type=date] { color-scheme:light; }
  input:focus, select:focus, textarea:focus { border-color:#111827 !important; box-shadow: 0 0 0 4px rgba(17,24,39,0.06) !important; }
  ::selection { background:#111827; color:#fff; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.22); border: 2px solid transparent; background-clip: padding-box; }
  @keyframes fadeUp { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .pressable { transition: transform 0.18s cubic-bezier(.2,.9,.3,1.2), opacity 0.15s ease, box-shadow 0.18s ease; }
  .pressable:hover { transform: translateY(-1px); }
  .pressable:active { transform:scale(0.98); opacity:0.9; }
  .item-row { transition: background 0.18s ease, transform 0.18s ease; }
  .item-row:hover { background: #fbfaf8; }
  .item-row:active { background:#f5f5f4 !important; }
  @media (hover: none) { .pressable:hover { transform: none; } .item-row:hover { background: inherit; } }
`;
