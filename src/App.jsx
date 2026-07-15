import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const F = "'Hiragino Maru Gothic Pro','BIZ UDGothic','Noto Sans JP',sans-serif";

// ─── 配色（白カード×淡い水色背景×スカイブルー）───
const BG   = "#EDF5FC";  // ページ背景（ごく淡い水色）
const CARD = "#ffffff";  // カード
const LINE = "#DFEAF5";  // 枠線
const ACC  = "#2AA3F7";  // アクセント（スカイブルー）
const ACCL = "#E4F2FE";  // 淡い青（選択状態・チップ）
const TXT  = "#22313F";  // メイン文字
const SUB  = "#8195A8";  // サブ文字
const GOOD = "#3FB98D";  // ポジティブ
const TITLE = "#4E80AF"; // 見出し（やわらかいブルーグレー）
const DANGER = "#E8788A"; // 削除（やわらかいレッド）

const cardStyle = (r = 20) => ({
  background: CARD, borderRadius: r, border: `1px solid ${LINE}`,
  boxShadow: "0 2px 10px rgba(140,170,200,0.10)",
});
const chipStyle = { background: "#F2F8FD", borderRadius: 999, border: `1px solid ${LINE}` };
const primaryBtn = {
  background: ACC, borderRadius: 999, border: "none", color: "#fff",
  boxShadow: "0 4px 14px rgba(42,163,247,0.35)", cursor: "pointer", fontFamily: F,
};

// 部位カラー（さわやかなパステル・原色なし）
const GROUPS = [
  { id: "chest",    name: "胸",   color: "#F78FB3" },
  { id: "back",     name: "背中", color: "#45C4A8" },
  { id: "shoulder", name: "肩",   color: "#F5B95B" },
  { id: "arms",     name: "腕",   color: "#9F8BEF" },
  { id: "legs",     name: "脚",   color: "#55AFF0" },
  { id: "core",     name: "腹",   color: "#F5967C" },
];

const EX = {
  chest:    ["ベンチプレス","ダンベルフライ","プッシュアップ","インクラインプレス","チェストプレス"],
  back:     ["デッドリフト","懸垂","ラットプルダウン","ベントオーバーロウ","シーテッドロウ"],
  shoulder: ["ショルダープレス","サイドレイズ","フロントレイズ","リアレイズ"],
  arms:     ["バーベルカール","トライセプスPD","ハンマーカール","ダンベルカール"],
  legs:     ["スクワット","レッグプレス","ランジ","レッグカール","カーフレイズ"],
  core:     ["プランク","クランチ","レッグレイズ","ロシアンツイスト"],
};

// 初回起動時のサンプルデータ（一度保存されたら localStorage の内容が優先される）
const INIT_HIST = {
  "2026-04-02": [{ muscle:"chest",    ex:"ベンチプレス",    sets:[{w:40,r:10},{w:42.5,r:8},{w:42.5,r:8}] }],
  "2026-04-04": [{ muscle:"legs",     ex:"スクワット",      sets:[{w:60,r:10},{w:65,r:8},{w:65,r:8}] }],
  "2026-04-07": [{ muscle:"back",     ex:"ラットプルダウン",sets:[{w:45,r:10},{w:50,r:8}] },
                 { muscle:"arms",     ex:"バーベルカール",  sets:[{w:15,r:12},{w:15,r:12}] }],
  "2026-04-09": [{ muscle:"chest",    ex:"ベンチプレス",    sets:[{w:42.5,r:10},{w:45,r:8},{w:45,r:7}] }],
  "2026-04-11": [{ muscle:"shoulder", ex:"ショルダープレス",sets:[{w:20,r:10},{w:22.5,r:8}] }],
  "2026-04-14": [{ muscle:"legs",     ex:"スクワット",      sets:[{w:65,r:10},{w:70,r:8},{w:70,r:8}] }],
  "2026-04-16": [{ muscle:"chest",    ex:"ベンチプレス",    sets:[{w:45,r:10},{w:47.5,r:8}] }],
  "2026-04-18": [{ muscle:"back",     ex:"デッドリフト",    sets:[{w:60,r:8},{w:65,r:6}] }],
  "2026-04-21": [{ muscle:"core",     ex:"プランク",        sets:[{w:0,r:60},{w:0,r:60}] },
                 { muscle:"legs",     ex:"ランジ",          sets:[{w:20,r:12},{w:20,r:12}] }],
  "2026-04-23": [{ muscle:"chest",    ex:"ベンチプレス",    sets:[{w:47.5,r:10},{w:47.5,r:9},{w:47.5,r:8}] }],
  "2026-04-25": [{ muscle:"shoulder", ex:"サイドレイズ",    sets:[{w:8,r:15},{w:10,r:12}] },
                 { muscle:"arms",     ex:"バーベルカール",  sets:[{w:17.5,r:10},{w:17.5,r:10}] }],
  "2026-04-28": [{ muscle:"back",     ex:"ラットプルダウン",sets:[{w:50,r:10},{w:55,r:8}] }],
  "2026-04-30": [{ muscle:"chest",    ex:"ベンチプレス",    sets:[{w:47.5,r:10},{w:50,r:8}] }],
  "2026-05-02": [{ muscle:"legs",     ex:"スクワット",      sets:[{w:70,r:10},{w:75,r:8}] }],
};

const INIT_PROG = {
  "ベンチプレス":    [{date:"4/2",w:42.5},{date:"4/9",w:45},{date:"4/16",w:47.5},{date:"4/23",w:47.5},{date:"4/30",w:50}],
  "スクワット":      [{date:"4/4",w:65},{date:"4/14",w:70},{date:"4/21",w:70},{date:"5/2",w:75}],
  "デッドリフト":    [{date:"4/18",w:65}],
  "ラットプルダウン":[{date:"4/7",w:50},{date:"4/28",w:55}],
  "ショルダープレス":[{date:"4/11",w:22.5}],
  "バーベルカール":  [{date:"4/7",w:15},{date:"4/25",w:17.5}],
};

const MONTHS  = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const DAYS_JP = ["日","月","火","水","木","金","土"];

const g = (id) => GROUPS.find(x => x.id === id) || GROUPS[0];
const dateKey = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const todayKey = () => { const d = new Date(); return dateKey(d.getFullYear(), d.getMonth(), d.getDate()); };
const parseKey = (k) => k.split("-").map(Number); // [y, m(1-12), d]
const shiftDate = (k, n) => {
  const [y, m, d] = parseKey(k);
  const dt = new Date(y, m - 1, d + n);
  return dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
};
const dayDiff = (a, b) => { // b - a（日数）
  const [ya, ma, da] = parseKey(a), [yb, mb, db] = parseKey(b);
  return Math.round((new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da)) / 86400000);
};
const fmtJP = (k) => {
  const [y, m, d] = parseKey(k);
  const dt = new Date(y, m - 1, d);
  return `${y}年${m}月${d}日(${DAYS_JP[dt.getDay()]})`;
};
const fmtShort = (k) => { const [, m, d] = parseKey(k); return `${m}/${d}`; };

// ─── localStorage（ログイン不要でデータ保持）───
const LS = { hist: "kinto_history", prog: "kinto_prog", body: "kinto_body", height: "kinto_height", custom: "kinto_custom_ex", hidden: "kinto_hidden_ex" };
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const persist = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* 容量オーバー等は無視 */ }
};

// 画像を縮小して dataURL に
const shrink = (img, maxPx, q) => {
  const s = Math.min(1, maxPx / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
};

// ─── 数値入力：＋−ボタン＆数字タップで直接入力 ───
function NumField({ value, step, min = 0, onChange, size = 24 }) {
  const [editing, setEditing] = useState(false);
  const [txt, setTxt] = useState("");
  const round = (n) => parseFloat(n.toFixed(1));
  const commit = () => {
    const n = parseFloat(txt);
    if (!isNaN(n)) onChange(Math.max(min, round(n)));
    setEditing(false);
  };
  const btn = { ...cardStyle(999), width: 31, height: 31, cursor: "pointer", fontSize: 15, color: ACC, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => onChange(Math.max(min, round(value - step)))} style={btn}>−</button>
      {editing ? (
        <input
          autoFocus
          type="text"
          inputMode="decimal"
          defaultValue={value}
          onChange={e => setTxt(e.target.value)}
          onFocus={e => { setTxt(String(value)); e.target.select(); }}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          style={{ width: 62, fontSize: size - 3, fontWeight: 800, color: TXT, textAlign: "center", padding: "4px 2px", fontFamily: F, outline: "none", background: "#F2F8FD", border: `1.5px solid ${ACC}`, borderRadius: 10 }}
        />
      ) : (
        <button onClick={() => setEditing(true)}
          style={{ fontSize: size, fontWeight: 800, color: TXT, minWidth: 52, textAlign: "center", background: "none", border: "none", borderBottom: `2px dashed ${LINE}`, cursor: "pointer", fontFamily: F, padding: "0 2px 2px" }}>
          {value}
        </button>
      )}
      <button onClick={() => onChange(round(value + step))} style={btn}>＋</button>
    </div>
  );
}

// ─── アプリアイコン（丸角の四角・にこちゃん＋口がダンベル）───
function AppIcon({ size = 76 }) {
  const LT = "#BFE3FB"; // 薄い水色（ポイント）
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "linear-gradient(145deg,#7CC5F8,#3FA9F5)", boxShadow: "0 8px 22px rgba(63,169,245,0.4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <svg width={size * 0.94} height={size * 0.94} viewBox="0 0 40 40">
        {/* にこちゃんの目（笑った半月目）*/}
        <path d="M9 15.5 Q13 10.5 17 15.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M23 15.5 Q27 10.5 31 15.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* ほっぺ（薄い水色）*/}
        <circle cx="8" cy="23.5" r="2.7" fill={LT} opacity="0.85" />
        <circle cx="32" cy="23.5" r="2.7" fill={LT} opacity="0.85" />
        {/* 口＝ダンベル（まっすぐ・太く）*/}
        <g>
          {/* シャフト */}
          <rect x="12" y="25.2" width="16" height="4" rx="2" fill="#fff" />
          {/* 左プレート（外・内の2枚で立体的に）*/}
          <rect x="4.8" y="20.5" width="5.4" height="13.4" rx="2.4" fill="#fff" />
          <rect x="10.4" y="22.4" width="3.2" height="9.6" rx="1.6" fill="#fff" />
          <rect x="6.2" y="23" width="2.6" height="8.4" rx="1.3" fill={LT} />
          {/* 右プレート */}
          <rect x="29.8" y="20.5" width="5.4" height="13.4" rx="2.4" fill="#fff" />
          <rect x="26.4" y="22.4" width="3.2" height="9.6" rx="1.6" fill="#fff" />
          <rect x="31.2" y="23" width="2.6" height="8.4" rx="1.3" fill={LT} />
        </g>
      </svg>
    </div>
  );
}

// ─── ミニカレンダー（日付タップで表示）───
function MiniCal({ selDate, onPick }) {
  const [y0, m0] = parseKey(selDate);
  const [y, setY] = useState(y0);
  const [m, setM] = useState(m0 - 1);
  const first = new Date(y, m, 1).getDay();
  const dim = new Date(y, m + 1, 0).getDate();
  const prev = () => { if (m === 0) { setM(11); setY(v => v - 1); } else setM(v => v - 1); };
  const next = () => { if (m === 11) { setM(0); setY(v => v + 1); } else setM(v => v + 1); };
  const navBtn = { ...chipStyle, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: ACC, display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ ...cardStyle(18), position: "absolute", top: "100%", left: 0, right: 0, zIndex: 30, padding: 12, marginTop: 8, fontFamily: F, boxShadow: "0 8px 24px rgba(140,170,200,0.28)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={prev} style={navBtn}>‹</button>
        <span style={{ fontSize: 14, fontWeight: 800, color: TXT }}>{y}年 {MONTHS[m]}</span>
        <button onClick={next} style={navBtn}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 2 }}>
        {DAYS_JP.map((d, i) => (
          <div key={d} style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "#D98BA6" : i === 6 ? ACC : SUB, textAlign: "center" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {Array(first).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array(dim).fill(null).map((_, i) => {
          const day = i + 1;
          const dk = dateKey(y, m, day);
          const isSel = dk === selDate;
          const isToday = dk === todayKey();
          return (
            <button key={day} onClick={() => onPick(dk)}
              style={{ padding: "6px 0", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: F, fontWeight: isSel || isToday ? 800 : 600, color: isSel ? "#fff" : isToday ? ACC : TXT, background: isSel ? ACC : isToday ? ACCL : "transparent", border: "none" }}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// モック撮影用URLパラメータ（?mock=1&tab=log など。通常利用には無関係）
const MOCK_PARAMS = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const MOCK = MOCK_PARAMS.get("mock") === "1";
const MOCK_TAB = MOCK_PARAMS.get("tab") || "log";
const MOCK_TITLE = MOCK && MOCK_TAB === "title"; // タイトル画面のモック（ずっと表示）

export default function App() {
  const [tab, setTab]             = useState(MOCK ? MOCK_TAB : "log");
  const [selMuscle, setSelMuscle] = useState(MOCK && MOCK_TAB === "log" ? "back" : null);
  const [selEx, setSelEx]         = useState(null);
  const [kg, setKg]               = useState(30);
  const [reps, setReps]           = useState(10);
  const [curSets, setCurSets]     = useState([]);
  const [history, setHistory]     = useState(() => load(LS.hist, INIT_HIST));
  const [prog, setProg]           = useState(() => load(LS.prog, INIT_PROG));
  const [progEx, setProgEx]       = useState("ベンチプレス");
  const [period, setPeriod]       = useState("all");  // グラフ期間: 1m / 3m / all
  const [graphMode, setGraphMode] = useState("ex");   // グラフ種別: ex（種目）/ body（からだ）
  const [bodyMetric, setBodyMetric] = useState("w");  // からだ指標: w（体重）/ fat（体脂肪率）/ mus（筋肉量）
  const [celebrate, setCelebrate]   = useState(false); // 記録完了の中央ポップイン
  const [justSavedEx, setJustSavedEx] = useState(null); // 「そのまま記録」直後のカード
  const now = new Date();
  const [calY, setCalY]           = useState(MOCK ? 2026 : now.getFullYear());
  const [calM, setCalM]           = useState(MOCK ? 3 : now.getMonth()); // モックは記録のある4月
  const [selDay, setSelDay]       = useState(null);
  const [saved, setSaved]         = useState(false);
  const [selDate, setSelDate]     = useState(todayKey());   // 記録タブの対象日
  const [miniOpen, setMiniOpen]   = useState(false);

  // ─── タイトル画面（起動時に表示 → ふわっと消える）───
  const [splash, setSplash]         = useState(MOCK ? MOCK_TITLE : true);
  const [splashFade, setSplashFade] = useState(false);
  useEffect(() => {
    if (MOCK_TITLE) return; // モック時は表示したまま
    const t1 = setTimeout(() => setSplashFade(true), 1300);
    const t2 = setTimeout(() => setSplash(false), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // 下地色を html / body に反映（上下に引っ張ったときや画面端でも白が見えないように）
  // ※柄やグラデ本体は下の「背景レイヤー」divで描画する
  //   （body への background-attachment: fixed は iOS Safari で効かないため）
  useEffect(() => {
    const base = splash
      ? "#E4F0FB"
      : ({ log: "#EDF5FC", cal: "#F5FAFE", body: "#E3F1FC", prog: "#F2F7FC" }[tab] || "#EDF5FC");
    document.documentElement.style.background = base;
    document.body.style.background = base;
    document.body.style.backgroundAttachment = "";
    document.body.style.backgroundImage = "";
    document.body.style.backgroundSize = "";
  }, [tab, splash]);

  // ─── 自分で追加した種目・削除した種目 ───
  const [customEx, setCustomEx]   = useState(() => load(LS.custom, {}));
  const [hiddenEx, setHiddenEx]   = useState(() => load(LS.hidden, {}));
  const [addingEx, setAddingEx]   = useState(false);
  const [newExName, setNewExName] = useState("");
  const [quickSkip, setQuickSkip] = useState({}); // 前回メニューから外したセット { 種目名: [index,...] }
  useEffect(() => { persist(LS.custom, customEx); }, [customEx]);
  useEffect(() => { persist(LS.hidden, hiddenEx); }, [hiddenEx]);

  const exListOf = (muscle) => [
    ...EX[muscle].filter(x => !(hiddenEx[muscle] || []).includes(x)),
    ...(customEx[muscle] || []),
  ];

  const addCustomEx = () => {
    const name = newExName.trim();
    if (!name || !selMuscle) return;
    // 既にリストにある場合はその種目を選ぶだけ
    if (exListOf(selMuscle).includes(name)) { setNewExName(""); setAddingEx(false); pickExercise(name); return; }
    if ((hiddenEx[selMuscle] || []).includes(name)) {
      // 一度削除した標準種目を復活
      setHiddenEx(h => ({ ...h, [selMuscle]: h[selMuscle].filter(x => x !== name) }));
    } else {
      setCustomEx(c => ({ ...c, [selMuscle]: [...(c[selMuscle] || []), name] }));
    }
    setNewExName("");
    setAddingEx(false);
    // 追加した種目をそのまま選択し、セット入力パネルを開く（タップ数を減らす）
    pickExercise(name);
  };

  // アプリ内製の確認ダイアログ
  // （iOSのホーム画面アプリでは window.confirm が動かないことがあるため自前で表示する）
  const [confirmReq, setConfirmReq] = useState(null); // { msg, onYes, label?, color?, hideCancel? }
  const askConfirm = (msg, onYes, opts = {}) => setConfirmReq({ msg, onYes, ...opts });

  const deleteExercise = (muscle, ex) => {
    askConfirm(`「${ex}」を種目リストから削除しますか?\n（過去の記録は残ります）`, () => {
      if ((customEx[muscle] || []).includes(ex)) {
        setCustomEx(c => ({ ...c, [muscle]: c[muscle].filter(x => x !== ex) }));
      } else {
        setHiddenEx(h => ({ ...h, [muscle]: [...(h[muscle] || []), ex] }));
      }
      if (selEx === ex) { setSelEx(null); setCurSets([]); }
    });
  };

  // トレーニング記録の削除（グラフ用データも同じ日付のぶんを削除）
  const delEntry = (dk, idx) => {
    const entry = history[dk][idx];
    askConfirm(`${fmtShort(dk)}の「${entry.ex}」の記録を削除しますか?`, () => {
      setHistory(h => {
        const arr = h[dk].filter((_, i) => i !== idx);
        const nh = { ...h };
        if (arr.length) nh[dk] = arr; else delete nh[dk];
        return nh;
      });
      setProg(p => {
        const list = (p[entry.ex] || []).filter(pt => pt.date !== fmtShort(dk));
        const np = { ...p };
        if (list.length) np[entry.ex] = list; else delete np[entry.ex];
        return np;
      });
    });
  };

  // からだの記録の削除
  const delBody = (k) => {
    askConfirm(`${fmtShort(k)}のからだの記録を削除しますか?`, () => {
      setBody(b => { const nb = { ...b }; delete nb[k]; return nb; });
    });
  };

  // ─── データの書き出し・読み込み（バックアップ）───
  const exportData = () => {
    const payload = {
      app: "kinto-log",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { history, prog, body, height, customEx, hiddenEx },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kinto-log-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importData = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        const d = json && json.data;
        if (!d || typeof d.history !== "object") throw new Error("invalid");
        askConfirm("バックアップを読み込みますか?\n（今のデータは上書きされます）", () => {
          if (d.history) setHistory(d.history);
          if (d.prog) setProg(d.prog);
          if (d.body) setBody(d.body);
          if (typeof d.height === "number") setHeight(d.height);
          if (d.customEx) setCustomEx(d.customEx);
          if (d.hiddenEx) setHiddenEx(d.hiddenEx);
          setTimeout(() => askConfirm("✓ 読み込みました!", () => {}, { label: "OK", color: GOOD, hideCancel: true }), 100);
        }, { label: "読み込む", color: "#2AA3F7" });
      } catch {
        askConfirm("このファイルは読み込めませんでした。\nKinto-Logで書き出した .json ファイルを選んでね", () => {}, { label: "OK", color: "#2AA3F7", hideCancel: true });
      }
    };
    reader.readAsText(file);
  };

  // ─── からだ（体組成）───
  const [body, setBody]     = useState(() => load(LS.body, {}));
  const [height, setHeight] = useState(() => load(LS.height, 160));
  const bodyKeys = Object.keys(body).sort();
  const lastBody = bodyKeys.length ? body[bodyKeys[bodyKeys.length - 1]] : null;
  const [bw, setBw]     = useState(() => lastBody?.w ?? 50);
  const [fat, setFat]   = useState(() => lastBody?.fat ?? 25);
  const [mus, setMus]   = useState(() => lastBody?.mus ?? 35);
  const [pics, setPics] = useState([]);          // からだの写真（今回分）
  const bmi = height > 0 ? parseFloat((bw / ((height / 100) ** 2)).toFixed(1)) : 0;

  // ─── 自動保存（ログイン不要・リロードしても消えない）───
  useEffect(() => { persist(LS.hist, history); }, [history]);
  useEffect(() => { persist(LS.prog, prog); }, [prog]);
  useEffect(() => { persist(LS.body, body); }, [body]);
  useEffect(() => { persist(LS.height, height); }, [height]);

  // その種目の直近セッション（日付＋全セット）を取得
  const lastSessionOf = (ex) => {
    const keys = Object.keys(history).sort();
    for (let i = keys.length - 1; i >= 0; i--) {
      const entry = history[keys[i]].find(e => e.ex === ex);
      if (entry && entry.sets.length) return { date: keys[i], sets: entry.sets };
    }
    return null;
  };

  // 部位を選んだら出てくる「前回のメニュー」（直近3種目）
  const recentMenus = selMuscle
    ? exListOf(selMuscle)
        .map(ex => ({ ex, last: lastSessionOf(ex) }))
        .filter(m => m.last)
        .sort((a, b) => (a.last.date < b.last.date ? 1 : -1))
        .slice(0, 3)
    : [];

  // 種目を選ぶと前回の全セットを呼び出して編集できる状態に
  const pickExercise = (ex) => {
    setSelEx(ex);
    const last = lastSessionOf(ex);
    if (last) {
      setCurSets(last.sets.map(s => ({ ...s })));
      const ls = last.sets[last.sets.length - 1];
      setKg(ls.w);
      setReps(ls.r);
    } else {
      setCurSets([]);
      setKg(30);
      setReps(10);
    }
  };

  const addSet = () => {
    if (!selEx) return;
    setCurSets(s => [...s, { w: kg, r: reps }]);
  };

  const saveEntry = (muscle, ex, sets) => {
    if (!ex || sets.length === 0) return;
    const dk = selDate;
    setHistory(h => {
      const prev = h[dk] || [];
      const idx = prev.findIndex(e => e.ex === ex);
      if (idx >= 0) {
        const upd = [...prev];
        upd[idx] = { ...upd[idx], sets: [...upd[idx].sets, ...sets] };
        return { ...h, [dk]: upd };
      }
      return { ...h, [dk]: [...prev, { muscle, ex, sets }] };
    });
    const maxW = Math.max(...sets.map(s => s.w));
    if (maxW > 0) {
      setProg(p => ({
        ...p,
        [ex]: [...(p[ex] || []), { date: fmtShort(dk), w: maxW }]
      }));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const save = () => {
    if (!selEx || curSets.length === 0) return;
    saveEntry(selMuscle, selEx, curSets);
    // ボタンが「✓ 保存完了」を見せてからパネルを閉じる
    setTimeout(() => {
      setCurSets([]);
      setSelMuscle(null);
      setSelEx(null);
    }, 900);
  };

  // 前回のメニューをワンタップでそのまま記録（気持ちいい完了演出つき）
  const quickSave = (ex, sets) => {
    if (justSavedEx || sets.length === 0) return; // 連打防止
    saveEntry(selMuscle, ex, sets.map(s => ({ ...s })));
    setJustSavedEx(ex);      // 押したボタンを「✓ 記録完了！」に
    setCelebrate(true);       // 中央に✓をポンッ
    setTimeout(() => setCelebrate(false), 1000);
    setTimeout(() => {        // 演出を見せてから初期状態へ
      setSelMuscle(null);
      setSelEx(null);
      setCurSets([]);
      setJustSavedEx(null);
    }, 950);
  };

  const onBodyPics = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        setPics(p => [...p, shrink(img, 400, 0.6)]);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
    e.target.value = "";
  };

  const saveBody = () => {
    const dk = todayKey();
    setBody(b => {
      const prev = b[dk] || {};
      return {
        ...b,
        [dk]: {
          w: bw, fat, mus, bmi,
          photo: prev.photo || null,
          pics: [...(prev.pics || []), ...pics],
        },
      };
    });
    setPics([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─── AIコーチ：記録データから客観的なコメントを1行生成 ───
  const coachComment = (exName) => {
    const keys = Object.keys(history).filter(k => history[k].length > 0).sort();
    const today = todayKey();
    if (keys.length === 0) return { icon: "🌱", text: "まずは最初の記録をつけてみよう!" };

    const gap = dayDiff(keys[keys.length - 1], today);
    if (gap >= 5) return { icon: "⏰", text: `最後の記録(${fmtShort(keys[keys.length - 1])})から${gap}日経過。軽いメニューから再開しよう` };

    const sessions = keys
      .filter(k => history[k].some(e => e.ex === exName))
      .map(k => ({ k, max: Math.max(...history[k].find(e => e.ex === exName).sets.map(s => s.w)) }));
    if (sessions.length >= 2) {
      const cur = sessions[sessions.length - 1];
      const prev = sessions[sessions.length - 2];
      const d = parseFloat((cur.max - prev.max).toFixed(1));
      const isPB = cur.max >= Math.max(...sessions.map(s => s.max));
      if (d > 0 && isPB) return { icon: "🏆", text: `${exName}は前回より+${d}kgで自己ベスト${cur.max}kgを更新!(累計${keys.length}日記録)` };
      if (d > 0)  return { icon: "📈", text: `${exName}は前回(${fmtShort(prev.k)})より+${d}kg。順調に伸びてるよ` };
      if (d === 0) return { icon: "🔁", text: `${exName}は${cur.max}kgをキープ中。次は+2.5kgに挑戦してみよう` };
      return { icon: "🌿", text: `${exName}は前回より${d}kg。無理せず回数を重ねるのもあり` };
    }
    if (sessions.length === 1) return { icon: "📊", text: `${exName}は${fmtShort(sessions[0].k)}に${sessions[0].max}kgを記録。次の記録で前回比が出せるよ` };

    const w1 = keys.filter(k => k >= shiftDate(today, -6) && k <= today).length;
    if (w1 > 0) return { icon: "🔥", text: `今週${w1}回目の記録。累計${keys.length}日分を記録済み` };
    return { icon: "📅", text: `これまでに${keys.length}日分のトレーニングを記録しています` };
  };

  const prevMonth = () => {
    if (calM === 0) { setCalM(11); setCalY(y => y - 1); } else setCalM(m => m - 1);
    setSelDay(null);
  };
  const nextMonth = () => {
    if (calM === 11) { setCalM(0); setCalY(y => y + 1); } else setCalM(m => m + 1);
    setSelDay(null);
  };

  const firstDay    = new Date(calY, calM, 1).getDay();
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();

  const getDots = (dk) => {
    const entries = history[dk];
    if (!entries) return [];
    return [...new Set(entries.map(e => e.muscle))].map(id => g(id));
  };

  // 選択中の種目が削除されていたら先頭の種目にフォールバック
  const progExSafe = prog[progEx] ? progEx : (Object.keys(prog)[0] || "");
  // 記録（履歴）の実日付から、その種目の最大重量セッションを取得（期間フィルタ用）
  const allSessions = Object.keys(history)
    .filter(k => (history[k] || []).some(e => e.ex === progExSafe))
    .sort()
    .map(k => ({ k, date: fmtShort(k), w: Math.max(...history[k].find(e => e.ex === progExSafe).sets.map(s => s.w)) }));
  const cutoff = period === "1m" ? shiftDate(todayKey(), -30) : period === "3m" ? shiftDate(todayKey(), -90) : null;
  const progData = (cutoff ? allSessions.filter(s => s.k >= cutoff) : allSessions).map(({ date, w }) => ({ date, w }));
  const pb = progData.length > 0 ? Math.max(...progData.map(d => d.w)) : 0;

  const bodyChart = bodyKeys.map(k => ({ date: fmtShort(k), w: body[k].w }));

  // からだのグラフ用データ（選択中の指標を期間フィルタ）
  const METRICS = [
    { id: "w",   label: "体重",     unit: "kg" },
    { id: "fat", label: "体脂肪率", unit: "%"  },
    { id: "mus", label: "筋肉量",   unit: "kg" },
  ];
  const metricInfo = METRICS.find(m => m.id === bodyMetric) || METRICS[0];
  const bodyAll = bodyKeys
    .map(k => ({ k, date: fmtShort(k), v: body[k][bodyMetric] }))
    .filter(s => typeof s.v === "number");
  const bodyData = (cutoff ? bodyAll.filter(s => s.k >= cutoff) : bodyAll).map(({ date, v }) => ({ date, v }));
  const bodyLatest = bodyData.length ? bodyData[bodyData.length - 1].v : 0;

  const card = { ...cardStyle(20), padding: "16px 18px", marginBottom: 12, position: "relative" };
  const delBtn = { position: "absolute", top: 10, right: 12, border: "none", background: "none", color: SUB, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "2px 4px", fontFamily: F };
  const sectionLabel = { fontSize: 11, fontWeight: 700, color: SUB, letterSpacing: 0.8, marginBottom: 6 };

  const MuscleTag = ({ muscle }) => (
    <span style={{ background: ACCL, borderRadius: 999, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: g(muscle).color, display: "inline-block", marginBottom: 6 }}>
      {g(muscle).name}
    </span>
  );

  const LogChips = ({ sets }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {sets.map((s, i) => (
        <span key={i} style={{ ...chipStyle, padding: "4px 12px", fontSize: 12, color: SUB, fontWeight: 600 }}>
          {s.r}回{s.w > 0 ? ` · ${s.w}kg` : ""}
        </span>
      ))}
    </div>
  );

  const isTodaySel = selDate === todayKey();
  const [, selM, selD] = parseKey(selDate);
  const coach = tab === "prog" ? coachComment(progExSafe) : null;

  // ページごとの背景（ルートコンテナに直接適用＝iOSでも確実に表示。柄・グラデも scroll に追従）
  const pageBg = tab === "body"
    ? { background: "linear-gradient(180deg,#E3F1FC 0%,#F2F9FE 55%,#FDFEFF 100%)" }
    : tab === "prog"
      ? { backgroundColor: "#F2F7FC", backgroundImage: "radial-gradient(#D8E5F2 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }
      : { background: tab === "cal" ? "#F5FAFE" : "#EDF5FC" };

  return (
    <div style={{ fontFamily: F, ...pageBg, minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 500, margin: MOCK ? "0" : "0 auto", paddingTop: MOCK ? 0 : "calc(env(safe-area-inset-top) + 16px)" }}>

      {/* ボタンのホバー／クリックアニメーション */}
      <style>{`
        button { -webkit-tap-highlight-color: transparent; transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease; }
        button:hover { filter: brightness(0.95); }
        button:active { transform: scale(0.92) !important; filter: brightness(0.9); }
        @keyframes kintoPop {
          0%   { transform: scale(0.6); opacity: 0; }
          28%  { transform: scale(1.08); opacity: 1; }
          55%  { transform: scale(1); opacity: 1; }
          80%  { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

      {/* 記録完了の中央ポップイン（操作をブロックしない）*/}
      {celebrate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, animation: "kintoPop 1s ease-out forwards" }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: GOOD, boxShadow: "0 10px 30px rgba(63,185,141,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 52, color: "#fff", fontWeight: 900, lineHeight: 1 }}>✓</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: GOOD, fontFamily: F, background: "rgba(255,255,255,0.92)", borderRadius: 999, padding: "5px 18px", boxShadow: "0 4px 14px rgba(120,160,200,0.2)" }}>記録完了！</div>
          </div>
        </div>
      )}

      {/* タイトル画面（アイコン中央＋アプリ名） */}
      {splash && (
        <div style={{ position: "fixed", top: 0, bottom: 0, left: 0, right: 0, margin: MOCK ? "0" : "0 auto", width: "100%", maxWidth: 500, zIndex: 50, background: "linear-gradient(160deg,#DCEEFC 0%,#EAF6FE 55%,#F4FAFE 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: splashFade ? 0 : 1, transition: "opacity 0.6s ease", pointerEvents: splashFade ? "none" : "auto" }}>
          <AppIcon size={124} />
          <div style={{ fontSize: 34, fontWeight: 800, color: TXT, letterSpacing: -0.5, fontFamily: F, marginTop: 22 }}>
            Kinto<span style={{ color: ACC }}>-Log</span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: SUB, marginTop: 10, letterSpacing: 0.5 }}>
            かわいく続ける、筋トレ記録
          </div>
        </div>
      )}

      {/* モック撮影用 iOSステータスバー */}
      {MOCK && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 26px 0", fontFamily: F, position: "relative", zIndex: 60 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: TXT, letterSpacing: 0.3 }}>9:41</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="18" height="12" viewBox="0 0 18 12"><g fill={TXT}><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0.5" width="3" height="11.5" rx="1"/></g></svg>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path d="M8.5 3.2c2.2 0 4.2.85 5.7 2.24l1.5-1.55A10.4 10.4 0 0 0 8.5 1 10.4 10.4 0 0 0 1.3 3.9l1.5 1.55A8.2 8.2 0 0 1 8.5 3.2Z" fill={TXT}/><path d="M8.5 6.4c1.26 0 2.4.5 3.24 1.3l1.5-1.54A7 7 0 0 0 8.5 4.3a7 7 0 0 0-4.74 1.86l1.5 1.54A4.7 4.7 0 0 1 8.5 6.4Z" fill={TXT}/><circle cx="8.5" cy="9.7" r="1.6" fill={TXT}/></svg>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <span style={{ width: 22, height: 12, border: `1.4px solid ${TXT}`, borderRadius: 3, opacity: 0.5, display: "inline-block", position: "relative" }}>
                <span style={{ position: "absolute", inset: 1.5, width: "72%", background: TXT, borderRadius: 1 }} />
              </span>
              <span style={{ width: 2, height: 5, background: TXT, opacity: 0.5, borderRadius: 1, marginLeft: 1 }} />
            </span>
          </span>
        </div>
      )}

      {/* Header（コンパクト・日付行なし）*/}
      <div style={{ padding: "10px 20px 8px", textAlign: "center" }}>
        {tab === "log" && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <AppIcon size={50} />
          </div>
        )}
        {tab === "prog" ? (
          // 見出しタップで「種目のグラフ」⇔「からだのグラフ」を切り替え
          <button onClick={() => { setGraphMode(m => (m === "ex" ? "body" : "ex")); }}
            style={{ border: "none", background: "none", cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px auto 0", width: "100%" }}>
            {/* 左側の透明ダミー（右の切替バッジと同じ幅にして見出しを中央に）*/}
            <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 3, borderRadius: 999, padding: "3px 9px", fontSize: 10.5, fontWeight: 800, visibility: "hidden" }}>
              ⇄ 切替
            </span>
            <span style={{ fontSize: 19, fontWeight: 800, color: TITLE, letterSpacing: 0.5 }}>
              {graphMode === "ex" ? "種目のグラフ" : "からだのグラフ"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: ACCL, color: ACC, borderRadius: 999, padding: "3px 9px", fontSize: 10.5, fontWeight: 800 }}>
              ⇄ 切替
            </span>
          </button>
        ) : (
          <div style={{ fontSize: 19, fontWeight: 800, color: TITLE, marginTop: 2, letterSpacing: 0.5 }}>
            {tab === "log" ? "トレーニング記録" : tab === "cal" ? "履歴" : tab === "body" ? "からだの記録" : "成長グラフ"}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "calc(78px + env(safe-area-inset-bottom))" }}>

        {/* ─── LOG TAB ─── */}
        {tab === "log" && (
          <>
            {/* 日付ナビ（コンパクト）：◀▶で前日/翌日、日付タップでミニカレンダー */}
            <div style={{ padding: "0 16px 10px", position: "relative" }}>
              <div style={{ ...cardStyle(14), display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px" }}>
                <button onClick={() => { setSelDate(shiftDate(selDate, -1)); setMiniOpen(false); }}
                  style={{ ...chipStyle, width: 28, height: 28, cursor: "pointer", fontSize: 11, color: ACC, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  ◀
                </button>
                <button onClick={() => setMiniOpen(o => !o)}
                  style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, color: TXT, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flex: 1, whiteSpace: "nowrap" }}>
                  {/* 左右対称にするための透明ダミー（日付を正確にセンタリング） */}
                  {isTodaySel && <span style={{ borderRadius: 999, padding: "2px 7px", fontSize: 10, fontWeight: 800, visibility: "hidden" }}>今日</span>}
                  {fmtJP(selDate)}
                  {isTodaySel && <span style={{ background: ACCL, color: ACC, borderRadius: 999, padding: "2px 7px", fontSize: 10, fontWeight: 800 }}>今日</span>}
                </button>
                <button onClick={() => { setSelDate(shiftDate(selDate, 1)); setMiniOpen(false); }}
                  style={{ ...chipStyle, width: 28, height: 28, cursor: "pointer", fontSize: 11, color: ACC, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  ▶
                </button>
              </div>
              {miniOpen && <MiniCal selDate={selDate} onPick={(k) => { setSelDate(k); setMiniOpen(false); }} />}
            </div>

            {/* Muscle selector（コンパクト）*/}
            <div style={{ padding: "0 16px 0" }}>
              <div style={sectionLabel}>部位を選ぶ</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {GROUPS.map(gr => {
                  const active = selMuscle === gr.id;
                  return (
                    <button key={gr.id}
                      onClick={() => { setSelMuscle(gr.id); setSelEx(null); setCurSets([]); setAddingEx(false); setQuickSkip({}); }}
                      style={{ ...cardStyle(14), ...(active ? { border: `2px solid ${gr.color}`, padding: "9px 6px" } : { padding: "10px 7px" }), cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", transition: "all 0.15s" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: gr.color }}>{gr.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 前回のメニューからサッと記録（さらにコンパクト。カード右上✕で種目削除・セットの✕で除外）*/}
            {selMuscle && !selEx && recentMenus.length > 0 && (
              <div style={{ padding: "10px 16px 0" }}>
                <div style={sectionLabel}>前回のメニューからサッと記録</div>
                {recentMenus.map(({ ex, last }) => {
                  const skip = quickSkip[ex] || [];
                  const useSets = last.sets.filter((_, i) => !skip.includes(i));
                  return (
                    <div key={ex} style={{ ...card, padding: "7px 10px", marginBottom: 6 }}>
                      <button onClick={() => deleteExercise(selMuscle, ex)} style={{ ...delBtn, top: 6, right: 8, fontSize: 12 }}>✕</button>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingRight: 20 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: TXT }}>{ex}</span>
                        <span style={{ fontSize: 9, color: SUB, fontWeight: 700 }}>前回 {fmtShort(last.date)}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {last.sets.map((s, i) => skip.includes(i) ? null : (
                          <span key={i} style={{ ...chipStyle, padding: "2px 7px", fontSize: 10, color: SUB, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {s.r}回{s.w > 0 ? ` · ${s.w}kg` : ""}
                            <span onClick={() => setQuickSkip(q => ({ ...q, [ex]: [...(q[ex] || []), i] }))}
                              style={{ cursor: "pointer", color: "#B6C6D6", fontWeight: 800 }}>✕</span>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                        <button onClick={() => quickSave(ex, useSets)} disabled={useSets.length === 0 || justSavedEx === ex}
                          style={{ ...(justSavedEx === ex ? { background: GOOD, border: `1px solid ${GOOD}`, color: "#fff" } : { background: ACCL, border: `1px solid #C9E5FB`, color: ACC }), borderRadius: 999, cursor: "pointer", fontFamily: F, flex: 1, padding: "5px", fontSize: 11, fontWeight: 800, opacity: useSets.length === 0 ? 0.4 : 1, transition: "background 0.2s" }}>
                          {justSavedEx === ex ? "✓ 記録完了！" : "そのまま記録 ✓"}
                        </button>
                        <button onClick={() => pickExercise(ex)}
                          style={{ ...cardStyle(999), flex: 1, padding: "5px", fontSize: 11, fontWeight: 800, color: ACC, cursor: "pointer", fontFamily: F }}>
                          編集して記録
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Exercise selector（選んだ種目のすぐ下にセット入力が出る）*/}
            {selMuscle && (
              <div style={{ padding: "12px 16px 0" }}>
                <div style={sectionLabel}>種目を選ぶ</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {exListOf(selMuscle).map(ex => {
                    const active = selEx === ex;
                    return (
                      <div key={ex}>
                        <button onClick={() => pickExercise(ex)}
                          style={{ ...cardStyle(12), ...(active ? { border: `2px solid ${ACC}`, padding: "9px 13px" } : { padding: "10px 14px" }), width: "100%", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: active ? 800 : 700, color: active ? ACC : TXT, transition: "all 0.15s", fontFamily: F, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>{ex}</span>
                          <span onClick={(e) => { e.stopPropagation(); deleteExercise(selMuscle, ex); }}
                            style={{ color: "#B6C6D6", fontSize: 13, fontWeight: 800, padding: "4px 8px", margin: "-4px -8px", cursor: "pointer" }}>
                            ✕
                          </span>
                        </button>

                        {/* この種目のセット入力（選択中のみ・直下に表示）*/}
                        {active && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ ...card, padding: "10px 12px", marginBottom: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: SUB }}>重量 (kg)</span>
                                <NumField value={kg} step={2.5} min={0} onChange={setKg} size={19} />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: SUB }}>回数</span>
                                <NumField value={reps} step={1} min={1} onChange={setReps} size={19} />
                              </div>

                              <button onClick={addSet}
                                style={{ width: "100%", padding: "8px", borderRadius: 11, border: `2px dashed #BBDDF7`, background: "#F5FAFE", cursor: "pointer", fontSize: 12.5, fontWeight: 800, color: ACC, fontFamily: F }}>
                                ＋ セットを追加
                              </button>

                              {curSets.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                                  {curSets.map((s, i) => (
                                    <span key={i} style={{ background: ACCL, borderRadius: 999, padding: "4px 10px", fontSize: 11.5, fontWeight: 700, color: ACC, display: "inline-flex", alignItems: "center", gap: 5 }}>
                                      Set{i + 1}｜{s.w}kg × {s.r}回
                                      <span onClick={() => setCurSets(cs => cs.filter((_, j) => j !== i))}
                                        style={{ cursor: "pointer", color: SUB, fontWeight: 800, fontSize: 11 }}>✕</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {curSets.length > 0 && (
                              <button onClick={save} disabled={saved}
                                style={{ ...primaryBtn, ...(saved ? { background: GOOD, boxShadow: "0 4px 14px rgba(63,185,141,0.4)" } : {}), width: "100%", padding: "11px", fontSize: 14, fontWeight: 800, letterSpacing: 0.5, marginBottom: 4 }}>
                                {saved ? "✓ 保存完了" : "保存する ✓"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 自分で種目を追加 */}
                  {addingEx ? (
                    <div style={{ ...cardStyle(12), display: "flex", gap: 6, padding: "6px 8px", alignItems: "center" }}>
                      <input
                        autoFocus
                        type="text"
                        value={newExName}
                        placeholder="種目名を入力"
                        onChange={e => setNewExName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addCustomEx(); if (e.key === "Escape") { setAddingEx(false); setNewExName(""); } }}
                        style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: F, color: TXT, background: "transparent", padding: "5px 4px", minWidth: 0 }}
                      />
                      <button onClick={addCustomEx}
                        style={{ ...primaryBtn, padding: "7px 14px", fontSize: 12, fontWeight: 800, boxShadow: "none" }}>
                        追加
                      </button>
                      <button onClick={() => { setAddingEx(false); setNewExName(""); }}
                        style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: SUB, fontFamily: F, fontWeight: 700 }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingEx(true)}
                      style={{ width: "100%", padding: "9px", borderRadius: 11, border: `2px dashed #BBDDF7`, background: "#F5FAFE", cursor: "pointer", fontSize: 12.5, fontWeight: 800, color: ACC, fontFamily: F }}>
                      ＋ 種目を追加
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 記録タブでは「今日の記録」一覧は表示しない（履歴タブで確認・削除できる）*/}
          </>
        )}

        {/* ─── CALENDAR TAB ─── */}
        {tab === "cal" && (
          <>
            <div style={{ padding: "4px 16px 0" }}>
              {/* Month nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <button onClick={prevMonth}
                  style={{ ...cardStyle(999), width: 38, height: 38, cursor: "pointer", fontSize: 17, color: ACC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ‹
                </button>
                <span style={{ fontSize: 18, fontWeight: 800, color: TXT }}>{calY}年 {MONTHS[calM]}</span>
                <button onClick={nextMonth}
                  style={{ ...cardStyle(999), width: 38, height: 38, cursor: "pointer", fontSize: 17, color: ACC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
                {DAYS_JP.map((d, i) => (
                  <div key={d} style={{ fontSize: 14, fontWeight: 800, color: i === 0 ? "#D98BA6" : i === 6 ? ACC : SUB, textAlign: "center", padding: "4px 0" }}>{d}</div>
                ))}
              </div>

              {/* Calendar grid（記録がない日もタップできる）*/}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1;
                  const dk = dateKey(calY, calM, day);
                  const dots = getDots(dk);
                  const hasBody = !!body[dk];
                  const isToday = dk === todayKey();
                  const isSel = selDay === day;
                  return (
                    <div key={day}
                      onClick={() => setSelDay(isSel ? null : day)}
                      style={{ ...cardStyle(12), ...(isSel ? { background: ACCL, border: `1.5px solid ${ACC}` } : isToday ? { border: `1.5px solid ${ACC}` } : {}), padding: "6px 2px 5px", minHeight: 58, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: isToday ? ACC : TXT }}>{day}</span>
                      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", alignItems: "center", maxWidth: 40 }}>
                        {dots.map((gr, di) => (
                          <div key={di} style={{ width: 8, height: 8, borderRadius: "50%", background: gr.color }} />
                        ))}
                        {hasBody && <span style={{ fontSize: 8, lineHeight: "8px" }}>📷</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day detail */}
            {selDay && (() => {
              const dk = dateKey(calY, calM, selDay);
              const entries = history[dk] || [];
              const bRec = body[dk];
              const dayPhotos = bRec ? [...(bRec.photo ? [bRec.photo] : []), ...(bRec.pics || [])] : [];
              return (
                <div style={{ padding: "16px 16px 0" }}>
                  <div style={sectionLabel}>
                    {calM + 1}月{selDay}日のトレーニング
                  </div>
                  {entries.length === 0 && (
                    <div style={{ ...card, textAlign: "center", color: SUB, fontSize: 13, fontWeight: 600 }}>
                      記録はまだありません
                    </div>
                  )}
                  {entries.map((entry, i) => (
                    <div key={i} style={card}>
                      <button onClick={() => delEntry(dk, i)} style={delBtn}>✕</button>
                      <MuscleTag muscle={entry.muscle} />
                      <div style={{ fontSize: 15, fontWeight: 700, color: TXT, marginBottom: 8 }}>{entry.ex}</div>
                      <LogChips sets={entry.sets} />
                    </div>
                  ))}

                  {/* その日のからだの記録・写真 */}
                  {bRec && (
                    <>
                      <div style={{ ...sectionLabel, marginTop: 16 }}>この日のからだ</div>
                      <div style={card}>
                        <button onClick={() => delBody(dk)} style={delBtn}>✕</button>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: dayPhotos.length ? 12 : 0 }}>
                          <span style={{ background: ACCL, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: ACC }}>{bRec.w}kg</span>
                          <span style={{ ...chipStyle, padding: "4px 12px", fontSize: 12, color: SUB, fontWeight: 600 }}>BMI {bRec.bmi}</span>
                          <span style={{ ...chipStyle, padding: "4px 12px", fontSize: 12, color: SUB, fontWeight: 600 }}>体脂肪 {bRec.fat}%</span>
                          <span style={{ ...chipStyle, padding: "4px 12px", fontSize: 12, color: SUB, fontWeight: 600 }}>筋肉 {bRec.mus}kg</span>
                        </div>
                        {dayPhotos.length > 0 && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                            {dayPhotos.map((p, i) => (
                              <img key={i} src={p} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 14, border: `1px solid ${LINE}` }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* 一覧の一番下から追加 → 記録タブへ */}
                  <button onClick={() => { setSelDate(dk); setTab("log"); setSelMuscle(null); setSelEx(null); setCurSets([]); setMiniOpen(false); }}
                    style={{ width: "100%", padding: "13px", borderRadius: 16, border: `2px dashed #BBDDF7`, background: "#F5FAFE", cursor: "pointer", fontSize: 14, fontWeight: 800, color: ACC, fontFamily: F }}>
                    ＋ この日のトレーニングを追加
                  </button>
                </div>
              );
            })()}

            {/* Legend */}
            <div style={{ padding: "16px 16px 0" }}>
              <div style={sectionLabel}>部位の凡例</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GROUPS.map(gr => (
                  <div key={gr.id} style={{ ...chipStyle, display: "flex", alignItems: "center", gap: 6, padding: "5px 14px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: gr.color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: gr.color }}>{gr.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── BODY TAB ─── */}
        {tab === "body" && (
          <>
            <div style={{ padding: "4px 16px 0" }}>
              <div style={card}>
                {[
                  { label: "体重 (kg)",     val: bw,     step: 0.1, min: 0,   set: setBw },
                  { label: "体脂肪率 (%)",  val: fat,    step: 0.1, min: 0,   set: setFat },
                  { label: "筋肉量 (kg)",   val: mus,    step: 0.1, min: 0,   set: setMus },
                  { label: "身長 (cm)",     val: height, step: 0.5, min: 50,  set: setHeight },
                ].map(({ label, val, step, min, set }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: SUB }}>{label}</span>
                    <NumField value={val} step={step} min={min} onChange={set} size={21} />
                  </div>
                ))}

                {/* BMI 自動計算 */}
                <div style={{ background: "#F2F8FD", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: SUB }}>BMI（自動計算）</span>
                  <span style={{ fontSize: 21, fontWeight: 800, color: TXT }}>{bmi}</span>
                </div>

                {/* からだの写真（進捗写真）*/}
                <label style={{ display: "block", width: "100%", padding: "12px", borderRadius: 14, border: `2px dashed #BBDDF7`, background: "#F5FAFE", cursor: "pointer", fontSize: 14, fontWeight: 800, color: ACC, textAlign: "center", boxSizing: "border-box" }}>
                  🤳 からだの写真を追加
                  <input type="file" accept="image/*" multiple onChange={onBodyPics} style={{ display: "none" }} />
                </label>
                {pics.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
                    {pics.map((p, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={p} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 14, border: `1px solid ${LINE}` }} />
                        <button onClick={() => setPics(ps => ps.filter((_, j) => j !== i))}
                          style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(34,49,63,0.7)", color: "#fff", fontSize: 11, cursor: "pointer", lineHeight: 1 }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={saveBody} disabled={saved}
                style={{ ...primaryBtn, ...(saved ? { background: GOOD, boxShadow: "0 4px 14px rgba(63,185,141,0.4)" } : {}), width: "100%", marginTop: 4, padding: "16px", fontSize: 17, fontWeight: 800, letterSpacing: 0.5 }}>
                {saved ? "✓ 保存完了" : "からだを記録する ✓"}
              </button>
            </div>

            {/* 体重グラフ */}
            {bodyChart.length > 1 && (
              <div style={{ padding: "22px 16px 0" }}>
                <div style={sectionLabel}>体重のうつりかわり</div>
                <div style={card}>
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bodyChart} margin={{ top: 5, right: 10, left: -24, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={LINE} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: SUB, fontFamily: F }} axisLine={false} tickLine={false} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: SUB, fontFamily: F }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: `1px solid ${LINE}`, fontFamily: F, fontSize: 13, background: CARD }}
                          formatter={v => [`${v} kg`, "体重"]}
                          labelStyle={{ color: SUB, fontWeight: 700 }}
                        />
                        <Line type="monotone" dataKey="w" stroke={ACC} strokeWidth={3} isAnimationActive={!MOCK}
                          dot={{ fill: ACC, r: 5, strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 7, fill: ACC }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* からだの履歴 */}
            {bodyKeys.length > 0 && (
              <div style={{ padding: "18px 16px 0" }}>
                <div style={sectionLabel}>からだの履歴</div>
                {[...bodyKeys].reverse().map(k => {
                  const r = body[k];
                  const thumb = (r.pics && r.pics[0]) || r.photo;
                  return (
                    <div key={k} style={{ ...card, display: "flex", gap: 12, alignItems: "center" }}>
                      <button onClick={() => delBody(k)} style={delBtn}>✕</button>
                      {thumb && <img src={thumb} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 12, border: `1px solid ${LINE}`, flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: SUB, fontWeight: 700, marginBottom: 4 }}>{fmtJP(k)}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <span style={{ background: ACCL, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: ACC }}>{r.w}kg</span>
                          <span style={{ ...chipStyle, padding: "3px 10px", fontSize: 12, color: SUB }}>BMI {r.bmi}</span>
                          <span style={{ ...chipStyle, padding: "3px 10px", fontSize: 12, color: SUB }}>体脂肪 {r.fat}%</span>
                          <span style={{ ...chipStyle, padding: "3px 10px", fontSize: 12, color: SUB }}>筋肉 {r.mus}kg</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── PROGRESS TAB ─── */}
        {tab === "prog" && (
          <>

          {/* ===== 種目のグラフ ===== */}
          {graphMode === "ex" && (
          <>
            <div style={{ padding: "4px 16px 0" }}>
              <div style={sectionLabel}>種目を選ぶ</div>
              <div style={{ position: "relative" }}>
                <select value={progExSafe} onChange={e => setProgEx(e.target.value)}
                  style={{ ...cardStyle(14), width: "100%", padding: "12px 40px 12px 16px", fontSize: 15, fontWeight: 600, color: TXT, appearance: "none", cursor: "pointer", fontFamily: F, outline: "none" }}>
                  {Object.keys(prog).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: ACC, pointerEvents: "none" }}>▼</span>
              </div>
            </div>

            {/* AIコーチ（1行）*/}
            {coach && (
              <div style={{ padding: "12px 16px 0" }}>
                <div style={{ ...cardStyle(16), display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: ACCL, border: `1px solid #C9E5FB` }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{coach.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TXT, lineHeight: 1.5 }}>{coach.text}</span>
                </div>
              </div>
            )}

            {/* PB card */}
            <div style={{ padding: "12px 16px 0" }}>
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ background: ACC, borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                    BEST
                  </span>
                  <span style={{ fontSize: 32, fontWeight: 800, color: TXT }}>{pb}</span>
                  <span style={{ fontSize: 15, color: SUB, fontWeight: 600 }}>kg</span>
                </div>

                {/* 期間切替（スライドするインジケーター）*/}
                <div style={{ position: "relative", background: "#F2F8FD", border: `1px solid ${LINE}`, borderRadius: 999, display: "flex", padding: 3, marginBottom: 14 }}>
                  {/* 動くつまみ */}
                  <div style={{ position: "absolute", top: 3, bottom: 3, left: 3, width: "calc((100% - 6px) / 3)", background: ACC, borderRadius: 999, boxShadow: "0 2px 6px rgba(42,163,247,0.4)", transform: `translateX(${["1m","3m","all"].indexOf(period) * 100}%)`, transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" }} />
                  {[
                    { id: "1m",  label: "1ヶ月" },
                    { id: "3m",  label: "3ヶ月" },
                    { id: "all", label: "全期間" },
                  ].map(p => (
                    <button key={p.id} onClick={() => setPeriod(p.id)}
                      style={{ position: "relative", zIndex: 1, flex: 1, padding: "7px 0", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: F, color: period === p.id ? "#fff" : SUB, background: "transparent", transition: "color 0.2s" }}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {progData.length === 0 ? (
                  <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: SUB, fontSize: 13, fontWeight: 600 }}>
                    この期間の記録はありません
                  </div>
                ) : (() => {
                  const chart = (
                    <LineChart data={progData} margin={{ top: 5, right: 10, left: -24, bottom: 5 }} {...(MOCK ? { width: 322, height: 180 } : {})}>
                      <CartesianGrid strokeDasharray="3 3" stroke={LINE} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: SUB, fontFamily: F }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: SUB, fontFamily: F }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: `1px solid ${LINE}`, fontFamily: F, fontSize: 13, background: CARD }}
                        formatter={v => [`${v} kg`, "最大重量"]}
                        labelStyle={{ color: SUB, fontWeight: 700 }}
                      />
                      <Line type="monotone" dataKey="w" stroke={ACC} strokeWidth={3} isAnimationActive={!MOCK}
                        dot={{ fill: ACC, r: 5, strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 7, fill: ACC }} />
                    </LineChart>
                  );
                  return (
                    <div style={{ height: 180 }}>
                      {MOCK ? chart : <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Session history */}
            <div style={{ padding: "4px 16px 0" }}>
              <div style={sectionLabel}>セッション履歴</div>
              {[...progData].reverse().map((d, i) => {
                const isPB = d.w === pb;
                const origIdx = progData.length - 1 - i;
                const prev = origIdx > 0 ? progData[origIdx - 1].w : null;
                const delta = prev !== null ? parseFloat((d.w - prev).toFixed(1)) : null;
                return (
                  <div key={i} style={{ ...cardStyle(16), ...(isPB ? { background: ACCL } : {}), padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: SUB, fontWeight: 600 }}>{d.date}</span>
                      {isPB && <span style={{ background: ACC, color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>PB</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      {delta !== null && delta > 0 && (
                        <span style={{ fontSize: 12, color: GOOD, fontWeight: 800 }}>+{delta}↑</span>
                      )}
                      <span style={{ fontSize: 20, fontWeight: 800, color: TXT }}>
                        {d.w} <span style={{ fontSize: 13, color: SUB, fontWeight: 600 }}>kg</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
          )}

          {/* ===== からだのグラフ ===== */}
          {graphMode === "body" && (
          <>
            {/* 指標を選ぶ（体重／体脂肪率／筋肉量）*/}
            <div style={{ padding: "4px 16px 0" }}>
              <div style={sectionLabel}>指標を選ぶ</div>
              <div style={{ position: "relative", background: "#F2F8FD", border: `1px solid ${LINE}`, borderRadius: 999, display: "flex", padding: 3 }}>
                <div style={{ position: "absolute", top: 3, bottom: 3, left: 3, width: "calc((100% - 6px) / 3)", background: ACC, borderRadius: 999, boxShadow: "0 2px 6px rgba(42,163,247,0.4)", transform: `translateX(${METRICS.findIndex(m => m.id === bodyMetric) * 100}%)`, transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" }} />
                {METRICS.map(m => (
                  <button key={m.id} onClick={() => setBodyMetric(m.id)}
                    style={{ position: "relative", zIndex: 1, flex: 1, padding: "8px 0", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 800, fontFamily: F, color: bodyMetric === m.id ? "#fff" : SUB, background: "transparent", transition: "color 0.2s" }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 最新値＋期間切替＋折れ線 */}
            <div style={{ padding: "12px 16px 0" }}>
              <div style={card}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                  <span style={{ background: ACC, borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 800, color: "#fff" }}>最新</span>
                  <span style={{ fontSize: 32, fontWeight: 800, color: TXT }}>{bodyLatest}</span>
                  <span style={{ fontSize: 15, color: SUB, fontWeight: 600 }}>{metricInfo.unit}</span>
                </div>

                {/* 期間切替（スライドするインジケーター）*/}
                <div style={{ position: "relative", background: "#F2F8FD", border: `1px solid ${LINE}`, borderRadius: 999, display: "flex", padding: 3, marginBottom: 14 }}>
                  <div style={{ position: "absolute", top: 3, bottom: 3, left: 3, width: "calc((100% - 6px) / 3)", background: ACC, borderRadius: 999, boxShadow: "0 2px 6px rgba(42,163,247,0.4)", transform: `translateX(${["1m","3m","all"].indexOf(period) * 100}%)`, transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" }} />
                  {[
                    { id: "1m",  label: "1ヶ月" },
                    { id: "3m",  label: "3ヶ月" },
                    { id: "all", label: "全期間" },
                  ].map(p => (
                    <button key={p.id} onClick={() => setPeriod(p.id)}
                      style={{ position: "relative", zIndex: 1, flex: 1, padding: "7px 0", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: F, color: period === p.id ? "#fff" : SUB, background: "transparent", transition: "color 0.2s" }}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {bodyData.length === 0 ? (
                  <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: SUB, fontSize: 13, fontWeight: 600, textAlign: "center", lineHeight: 1.6 }}>
                    この期間の記録はありません<br />「からだ」タブで記録するとグラフになります
                  </div>
                ) : (() => {
                  const chart = (
                    <LineChart data={bodyData} margin={{ top: 5, right: 10, left: -24, bottom: 5 }} {...(MOCK ? { width: 322, height: 180 } : {})}>
                      <CartesianGrid strokeDasharray="3 3" stroke={LINE} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: SUB, fontFamily: F }} axisLine={false} tickLine={false} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: SUB, fontFamily: F }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: `1px solid ${LINE}`, fontFamily: F, fontSize: 13, background: CARD }}
                        formatter={v => [`${v} ${metricInfo.unit}`, metricInfo.label]}
                        labelStyle={{ color: SUB, fontWeight: 700 }}
                      />
                      <Line type="monotone" dataKey="v" stroke={ACC} strokeWidth={3} isAnimationActive={!MOCK}
                        dot={{ fill: ACC, r: 5, strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 7, fill: ACC }} />
                    </LineChart>
                  );
                  return (
                    <div style={{ height: 180 }}>
                      {MOCK ? chart : <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* からだの記録履歴（選択中の指標を強調）*/}
            <div style={{ padding: "4px 16px 0" }}>
              <div style={sectionLabel}>記録の履歴</div>
              {bodyKeys.length === 0 && (
                <div style={{ ...cardStyle(16), padding: "14px 16px", textAlign: "center", color: SUB, fontSize: 13, fontWeight: 600 }}>
                  まだ記録がありません
                </div>
              )}
              {[...bodyKeys].reverse().map(k => {
                const r = body[k];
                return (
                  <div key={k} style={{ ...cardStyle(16), padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: SUB, fontWeight: 600 }}>{fmtShort(k)}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: TXT }}>
                      {r[bodyMetric]} <span style={{ fontSize: 13, color: SUB, fontWeight: 600 }}>{metricInfo.unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
          )}

            {/* データのバックアップ（小さく・グラフの一番下）*/}
            <div style={{ padding: "16px 16px 0" }}>
              <div style={{ ...cardStyle(14), padding: "9px 12px", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: SUB, flex: 1 }}>データのバックアップ</span>
                <button onClick={exportData}
                  style={{ ...chipStyle, padding: "5px 12px", fontSize: 11, fontWeight: 800, color: ACC, cursor: "pointer", fontFamily: F }}>
                  書き出し
                </button>
                <label style={{ ...chipStyle, padding: "5px 12px", fontSize: 11, fontWeight: 800, color: ACC, cursor: "pointer", fontFamily: F }}>
                  読み込み
                  <input type="file" accept=".json,application/json" onChange={importData} style={{ display: "none" }} />
                </label>
              </div>
              <div style={{ fontSize: 9.5, color: "#A9BCCD", fontWeight: 600, marginTop: 5, textAlign: "center", lineHeight: 1.5 }}>
                機種変更やブラウザのデータ削除に備えて、ときどき書き出しておくと安心です
              </div>
            </div>
          </>
        )}
      </div>

      {/* 確認ダイアログ（iOSのホーム画面アプリでも動く自前実装）*/}
      {confirmReq && (
        <div onClick={() => setConfirmReq(null)}
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(34,49,63,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ ...cardStyle(18), padding: "18px 18px 14px", width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TXT, lineHeight: 1.7, whiteSpace: "pre-line", textAlign: "center" }}>{confirmReq.msg}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {!confirmReq.hideCancel && (
                <button onClick={() => setConfirmReq(null)}
                  style={{ ...cardStyle(999), flex: 1, padding: "11px", fontSize: 13, fontWeight: 800, color: SUB, cursor: "pointer", fontFamily: F }}>
                  キャンセル
                </button>
              )}
              <button onClick={() => { const fn = confirmReq.onYes; setConfirmReq(null); fn(); }}
                style={{ flex: 1, padding: "11px", fontSize: 13, fontWeight: 800, color: "#fff", background: confirmReq.color || DANGER, border: "none", borderRadius: 999, cursor: "pointer", fontFamily: F, boxShadow: "0 4px 12px rgba(120,160,200,0.3)" }}>
                {confirmReq.label || "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav（ページごとに区切り線入り・スカイブルー）*/}
      <div style={{ position: "fixed", bottom: 0, ...(MOCK ? { left: 0 } : { left: 0, right: 0, margin: "0 auto" }), width: "100%", maxWidth: 500, background: "#6ABAF4", boxShadow: "0 -2px 10px rgba(42,163,247,0.22)", display: "flex", alignItems: "stretch", padding: "5px 6px calc(6px + env(safe-area-inset-bottom))" }}>
        {[
          { id: "log",  label: "記録",       icon: "✦" },
          { id: "cal",  label: "カレンダー", icon: "◫" },
          { id: "body", label: "からだ",     icon: "♡" },
          { id: "prog", label: "グラフ",     icon: "◈" },
        ].map((t, i) => (
          <div key={t.id} style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
            {i > 0 && <div style={{ width: 1, margin: "8px 0", background: "rgba(255,255,255,0.35)" }} />}
            <button onClick={() => setTab(t.id)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: "none", cursor: "pointer", padding: "5px 4px", margin: "0 5px", color: "#fff", opacity: tab === t.id ? 1 : 0.78, fontFamily: F, borderRadius: 14, background: "transparent", transform: tab === t.id ? "scale(1.15)" : "scale(1)", transition: "transform 0.15s, opacity 0.15s" }}>
              <span style={{ fontSize: 19 }}>{t.icon}</span>
              <span style={{ fontSize: 11, fontWeight: tab === t.id ? 800 : 700 }}>{t.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
