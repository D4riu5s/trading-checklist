import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, auth, storage } from './firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  ref as storageRef, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  browserLocalPersistence, browserSessionPersistence, setPersistence,
} from 'firebase/auth';
import './App.css';

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = {
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  Checklist: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><polyline points="7 9 10 12 17 8"/><line x1="7" y1="15" x2="17" y2="15"/></svg>,
  AI: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M12 12v4m-4 4h8"/><circle cx="12" cy="12" r="9"/></svg>,
  History: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Backtest: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Bolt: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Inbox: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Chevron: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Image: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Zoom: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  ZoomIn: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ZoomOut: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// ─── BRAND LOGO (the "MyEdge" upward blade) ──────────────────────────────────
function BladeLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M26 74 L60 26 L72 26 L38 74 Z" fill="var(--blade-main, #2de2a3)" />
      <path d="M52 74 L74 43 L74 74 Z" fill="var(--blade-deep, #14b88a)" />
    </svg>
  );
}

// ─── CHECKLIST SECTIONS ───────────────────────────────────────────────────────
const SECTIONS = [
  {
    title: 'Weekly',
    items: [
      { name: 'Trend', weight: 0, isBonus: false, isRequired: false },
      { name: 'Exhaustion', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'At S/R - rejected', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'Candlestick formation', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'Break & retest pattern', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'At LH/HL', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'Rejection from previous structure', weight: 20, isBonus: true, isRequired: false },
      { name: 'Trendline', weight: 20, isBonus: true, isRequired: false },
    ],
  },
  {
    title: 'Daily',
    items: [
      { name: 'Trend', weight: 0, isBonus: false, isRequired: false },
      { name: 'Exhaustion', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'At S/R', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'Candlestick formation', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'Break & retest pattern', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'At LH/HL', weight: 7.1428571429, isBonus: false, isRequired: true },
      { name: 'EMA retest', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'Rejection from previous structure', weight: 20, isBonus: true, isRequired: false },
      { name: 'Trendline', weight: 20, isBonus: true, isRequired: false },
    ],
  },
  {
    title: 'H4',
    items: [
      { name: 'Break & retest pattern + S/R', weight: 7.1428571429, isBonus: false, isRequired: true },
      { name: 'Trend', weight: 7.1428571429, isBonus: false, isRequired: false },
      { name: 'Trendline', weight: 20, isBonus: true, isRequired: false },
    ],
  },
  {
    title: 'H4 / H2 / H1',
    items: [
      { name: 'Candlestick formation (confirmation)', weight: 7.1428571429, isBonus: false, isRequired: true },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap(s =>
  s.items.map(item => ({
    id: `${s.title}-${item.name}`,
    label: item.name,
    section: s.title,
    weight: item.weight,
    isBonus: item.isBonus,
    isRequired: item.isRequired,
  }))
);

// ─── SCORE CALCULATOR ─────────────────────────────────────────────────────────
function calcScore(checkedMap) {
  const normalItems = ALL_ITEMS.filter(i => !i.isBonus);
  const bonusItems = ALL_ITEMS.filter(i => i.isBonus);
  const totalNormal = normalItems.reduce((s, i) => s + i.weight, 0);
  const checkedNormal = normalItems.reduce((s, i) => checkedMap[i.id] ? s + i.weight : s, 0);
  const totalBonus = bonusItems.reduce((s, i) => s + i.weight, 0);
  const checkedBonus = bonusItems.reduce((s, i) => checkedMap[i.id] ? s + i.weight : s, 0);

  const percentage = totalNormal > 0 ? Math.round((checkedNormal / totalNormal) * 100) : 0;
  const bonusPercentage = totalBonus > 0 ? Math.round((checkedBonus / totalBonus) * 100) : 0;

  const requiredItems = ALL_ITEMS.filter(i => i.isRequired);
  const hasMissingRequired = requiredItems.some(i => !checkedMap[i.id]);
  const checkedCount = Object.values(checkedMap).filter(Boolean).length;

  let setupLabel = 'Weak setup';
  let setupColor = 'var(--red)';
  let glowColor = 'rgba(255,84,112,0.18)';
  if (checkedCount > 0 && hasMissingRequired) { setupLabel = 'Invalid setup'; setupColor = 'var(--red)'; glowColor = 'rgba(255,84,112,0.18)'; }
  else if (percentage >= 80) { setupLabel = 'Strong setup'; setupColor = 'var(--accent)'; glowColor = 'rgba(45,226,163,0.22)'; }
  else if (percentage >= 60) { setupLabel = 'Good setup'; setupColor = 'var(--yellow)'; glowColor = 'rgba(255,194,75,0.18)'; }

  return { percentage, bonusPercentage, setupLabel, setupColor, glowColor, hasMissingRequired, checkedCount };
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
function calcStats(trades) {
  const closed = trades.filter(t => t.tradeResult !== 'On going');
  const wins = closed.filter(t => t.tradeResult === 'Win');
  const losses = closed.filter(t => t.tradeResult === 'Loss');
  const be = closed.filter(t => t.tradeResult === 'Breakeven');
  const ongoing = trades.filter(t => t.tradeResult === 'On going');
  const longs = trades.filter(t => t.tradeDirection === 'Long');
  const shorts = trades.filter(t => t.tradeDirection === 'Short');
  const longClosed = longs.filter(t => t.tradeResult !== 'On going');
  const shortClosed = shorts.filter(t => t.tradeResult !== 'On going');
  const avgScore = trades.length ? Math.round(trades.reduce((s, t) => s + parseFloat(t.percentage || 0), 0) / trades.length) : 0;
  const pct = (n, d) => d ? Math.round(n / d * 100) : 0;

  const weak = closed.filter(t => parseInt(t.percentage) < 60);
  const good = closed.filter(t => parseInt(t.percentage) >= 60 && parseInt(t.percentage) < 80);
  const strong = closed.filter(t => parseInt(t.percentage) >= 80);

  const rrs = closed.filter(t => t.riskReward).map(t => parseFloat(t.riskReward) || 0);
  const avgRR = rrs.length ? (rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2) : 'N/A';

  return {
    total: closed.length, totalAll: trades.length,
    wins: wins.length, losses: losses.length, be: be.length, ongoing: ongoing.length,
    winRate: pct(wins.length, closed.length),
    longCount: longs.length, shortCount: shorts.length,
    longPct: pct(longs.length, trades.length),
    shortPct: pct(shorts.length, trades.length),
    wrLong: pct(longClosed.filter(t => t.tradeResult === 'Win').length, longClosed.length),
    wrShort: pct(shortClosed.filter(t => t.tradeResult === 'Win').length, shortClosed.length),
    wrWeak: pct(weak.filter(t => t.tradeResult === 'Win').length, weak.length),
    wrGood: pct(good.filter(t => t.tradeResult === 'Win').length, good.length),
    wrStrong: pct(strong.filter(t => t.tradeResult === 'Win').length, strong.length),
    weakCount: weak.length, goodCount: good.length, strongCount: strong.length,
    avgScore, avgRR,
  };
}

// ─── PERIOD FILTER (7d, 1mo, 6mo, 1y, 2y, 5y) ─────────────────────────────────
function filterByPeriod(trades, period) {
  if (period === 'all') return trades;
  const days = { '7': 7, '1m': 30, '6m': 182, '1y': 365, '2y': 730, '5y': 1825 }[period];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return trades.filter(t => new Date(t.tradeDate) >= cutoff);
}

const PERIOD_OPTIONS = [
  ['7', '7 days'], ['1m', '1 month'], ['6m', '6 months'],
  ['1y', '1 year'], ['2y', '2 years'], ['5y', '5 years'], ['all', 'All time'],
];

// ─── FX PAIRS (in user's preferred order) ─────────────────────────────────────
const FX_PAIRS = [
  'EURUSD', 'AUDUSD', 'GBPUSD', 'NZDUSD', 'USDCAD', 'AUDCAD', 'NZDCAD',
  'GBPCAD', 'EURCAD', 'EURAUD', 'GBPAUD', 'EURGBP', 'EURNZD', 'GBPNZD',
  'AUDNZD', 'USDJPY', 'AUDJPY', 'CADJPY', 'NZDJPY', 'EURJPY', 'GBPJPY',
  'CHFJPY', 'USDCHF', 'AUDCHF', 'GBPCHF',
];

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function StatBar({ label, value, color, sub }) {
  return (
    <div className="stat-bar-row">
      <div className="stat-bar-header">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}% {sub && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({sub})</span>}</span>
      </div>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function ResultBadge({ result }) {
  const map = { Win: 'result-win', Loss: 'result-loss', Breakeven: 'result-be', 'On going': 'result-ongoing' };
  return <span className={`result-badge ${map[result] || 'result-ongoing'}`}>{result}</span>;
}

// ─── GENERIC DROPDOWN (closes on outside click) ───────────────────────────────
function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

// Filter dropdown: a trigger button + a panel of options
function FilterDropdown({ label, value, options, onChange, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  const current = options.find(o => o[0] === value);
  const currentLabel = current ? current[1] : label;

  return (
    <div className="dropdown" ref={ref}>
      <button className={`dropdown-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {icon}
        <span>{currentLabel}</span>
        <span className="dropdown-chevron"><Icon.Chevron /></span>
      </button>
      {open && (
        <div className="dropdown-panel">
          {options.map(([val, lbl]) => (
            <button key={val} className={`dropdown-option ${value === val ? 'selected' : ''}`}
              onClick={() => { onChange(val); setOpen(false); }}>
              {lbl}
              {value === val && <Icon.Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Searchable pair selector (like MyFxbook)
function PairSelect({ value, onChange, pairs = FX_PAIRS, placeholder = 'Select pair', allOption = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  useOutsideClose(ref, () => { setOpen(false); setSearch(''); });

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const filtered = pairs.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const displayValue = value === 'all' ? 'All pairs' : (value || placeholder);

  return (
    <div className="dropdown" ref={ref}>
      <button className={`dropdown-trigger ${open ? 'open' : ''} ${!value || value === 'all' ? 'placeholder' : ''}`}
        onClick={() => setOpen(!open)}>
        <span>{displayValue}</span>
        <span className="dropdown-chevron"><Icon.Chevron /></span>
      </button>
      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-search">
            <Icon.Search />
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search pair..." onClick={e => e.stopPropagation()} />
          </div>
          <div className="dropdown-options-scroll">
            {allOption && (
              <button className={`dropdown-option ${value === 'all' ? 'selected' : ''}`}
                onClick={() => { onChange('all'); setOpen(false); setSearch(''); }}>
                All pairs
                {value === 'all' && <Icon.Check />}
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="dropdown-empty">No pairs found</div>
            ) : (
              filtered.map(p => (
                <button key={p} className={`dropdown-option ${value === p ? 'selected' : ''}`}
                  onClick={() => { onChange(p); setOpen(false); setSearch(''); }}>
                  {p}
                  {value === p && <Icon.Check />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Result selector dropdown for history rows
function ResultDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  const options = ['On going', 'Win', 'Loss', 'Breakeven'];
  const map = { Win: 'result-win', Loss: 'result-loss', Breakeven: 'result-be', 'On going': 'result-ongoing' };

  return (
    <div className="dropdown" ref={ref}>
      <button className={`result-badge result-trigger ${map[value]}`} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        {value}
        <span className="result-chevron"><Icon.Chevron /></span>
      </button>
      {open && (
        <div className="dropdown-panel dropdown-panel-sm" onClick={e => e.stopPropagation()}>
          {options.map(opt => (
            <button key={opt} className={`dropdown-option ${value === opt ? 'selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}>
              <span className={`result-dot ${map[opt]}`} />
              {opt}
              {value === opt && <Icon.Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <h3 style={{ marginBottom: 10 }}>{title}</h3>
        <p className="text-secondary text-sm" style={{ marginBottom: 24, lineHeight: 1.7 }}>{message}</p>
        <div className="flex gap-3" style={{ justifyContent: 'center' }}>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKLIST PAGE ───────────────────────────────────────────────────────────
function ChecklistPage({ checked, setChecked, savedTrades, setSavedTrades, user, mode }) {
  const [pair, setPair] = useState('');
  const [tradeDirection, setTradeDirection] = useState('Long');
  const [tradeDate, setTradeDate] = useState('');
  const [riskReward, setRiskReward] = useState('');
  const [showSticky, setShowSticky] = useState(false);

  const score = useMemo(() => calcScore(checked), [checked]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 260);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const sectionProgress = (section) => {
    const ids = section.items.map(i => `${section.title}-${i.name}`);
    const done = ids.filter(id => checked[id]).length;
    return `${done}/${ids.length}`;
  };

  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const saveTrade = async () => {
    if (!pair || !tradeDate) { alert('Please select a pair and date.'); return; }
    const trade = {
      userId: user.uid,
      pair: pair,
      tradeDate,
      tradeResult: 'On going',
      percentage: score.percentage,
      bonusPercentage: score.bonusPercentage,
      checked,
      tradeDirection,
      riskReward: riskReward || null,
      tradeMode: mode,
      createdAt: Date.now(),
    };
    const ref = await addDoc(collection(db, 'trades'), trade);
    setSavedTrades(prev => [{ id: ref.id, ...trade }, ...prev]);
    setPair(''); setTradeDate(''); setChecked({}); setRiskReward('');
  };

  const scoreColor = score.setupColor;

  return (
    <>
      {/* Sticky score — appears when scrolling */}
      {showSticky && score.checkedCount > 0 && (
        <div className="sticky-score" style={{ borderColor: scoreColor }}>
          <div className="sticky-score-top">
            <span className="sticky-score-pct">Score: <span style={{ color: scoreColor }}>{score.percentage}%</span></span>
            <span className="sticky-score-label" style={{ color: scoreColor }}>{score.setupLabel}</span>
          </div>
          <div className="sticky-score-bar">
            <div className="sticky-score-fill" style={{ width: `${score.percentage}%`, background: scoreColor }} />
          </div>
        </div>
      )}

      {/* Score Hero */}
      <div className="card score-hero" style={{ '--score-glow': score.glowColor }}>
        <div className="score-number" style={{ color: scoreColor }}>{score.percentage}%</div>
        {score.checkedCount > 0 && <div className="score-label" style={{ color: scoreColor }}>{score.setupLabel}</div>}
        {score.checkedCount > 0 && score.hasMissingRequired && (
          <div><div className="missing-required">⚠ Missing required conditions</div></div>
        )}
        <div className="score-bar-wrap">
          <div className="score-bar-fill" style={{ width: `${score.percentage}%`, background: scoreColor, '--score-glow': score.glowColor }} />
        </div>
        <div className="bonus-row">
          <span className="bonus-label">Bonus</span>
          <div className="bonus-track"><div className="bonus-fill" style={{ width: `${score.bonusPercentage}%` }} /></div>
          <span className="bonus-pct">{score.bonusPercentage}%</span>
        </div>
        <p className="score-meta">{score.checkedCount} conditions checked</p>
        <button className="btn btn-secondary btn-sm mt-3" onClick={() => setChecked({})}>Clear all</button>
      </div>

      {/* Checklist Grid */}
      <div className="checklist-grid">
        {SECTIONS.map(section => (
          <div className="section-card" key={section.title}>
            <div className="section-header">
              <span className="section-name">{section.title}</span>
              <span className="section-progress">{sectionProgress(section)}</span>
            </div>
            <div className="section-items">
              {section.items.map(item => {
                const id = `${section.title}-${item.name}`;
                const isChecked = checked[id] || false;
                const cls = isChecked ? (item.isBonus ? 'check-item checked-bonus' : 'check-item checked') : 'check-item';
                return (
                  <label key={id} className={cls} onClick={() => toggleCheck(id)}>
                    <div className={`check-box ${isChecked ? (item.isBonus ? 'checked-bonus' : 'checked') : ''}`}>
                      <Icon.Check />
                    </div>
                    <span className="check-name">{item.name}</span>
                    {item.isRequired && <span className="tag tag-required">Required</span>}
                    {item.isBonus && !item.isRequired && <span className="tag tag-bonus">Bonus</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Save Trade */}
        <div className="card">
          <div className="card-title">{mode === 'backtest' ? 'Save backtest' : 'Save trade'}</div>
          <div className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label">Pair</label>
              <PairSelect value={pair} onChange={setPair} placeholder="Select pair" />
            </div>
            <div className="form-group">
              <label className="form-label">Direction</label>
              <div className="dir-btns">
                <button className={`dir-btn ${tradeDirection === 'Long' ? 'active-long' : ''}`} onClick={() => setTradeDirection('Long')}>📈 Long</button>
                <button className={`dir-btn ${tradeDirection === 'Short' ? 'active-short' : ''}`} onClick={() => setTradeDirection('Short')}>📉 Short</button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)} />
              </div>
              {mode === 'backtest' && (
                <div className="form-group">
                  <label className="form-label">Risk : Reward</label>
                  <input className="form-input" placeholder="e.g. 2.5" value={riskReward} onChange={e => setRiskReward(e.target.value)} />
                </div>
              )}
            </div>
            <button className="btn btn-primary btn-lg btn-full mt-2" onClick={saveTrade}>
              {mode === 'backtest' ? 'Save backtest' : 'Save trade'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── TRADE DETAIL MODAL ───────────────────────────────────────────────────────
const CHART_SLOTS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'daily', label: 'Daily' },
  { key: 'h4', label: 'H4' },
  { key: 'lt', label: 'LT' },
];

// Compress + resize an image file client-side before upload (keeps storage light, loads fast)
function compressImage(file, maxDim = 1800, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
          'image/jpeg', quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Single chart slot — dropzone when empty, framed image with delete when filled
function ChartUploader({ slot, url, uploading, editing, onPick, onDelete, onView, onLocked }) {
  const inputRef = useRef(null);

  return (
    <div className="chart-slot">
      <div className="chart-slot-label">
        <span>{slot.label}</span>
        {url && !uploading && editing && (
          <button className="chart-replace" onClick={() => inputRef.current?.click()}>Replace</button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }} />

      {uploading ? (
        <div className="chart-uploading">
          <div className="loading-dots" style={{ color: 'var(--accent)' }}><span /><span /><span /></div>
          <span>Uploading…</span>
        </div>
      ) : url ? (
        <div className="chart-image-wrap">
          <img src={url} alt={`${slot.label} chart`} className="chart-img" onClick={() => onView(url)} />
          {editing && (
            <button className="chart-delete-btn" onClick={() => onDelete()} title="Delete image"><Icon.Trash /></button>
          )}
          <div className="chart-view-hint"><Icon.Zoom /> Click to zoom</div>
        </div>
      ) : editing ? (
        <button className="chart-dropzone" onClick={() => inputRef.current?.click()}>
          <Icon.Image />
          <span className="chart-dropzone-title">Upload {slot.label} chart</span>
          <span className="chart-dropzone-sub">PNG or JPG · click to browse</span>
        </button>
      ) : (
        <button className="chart-dropzone chart-dropzone-locked" onClick={() => onLocked()}>
          <Icon.Image />
          <span className="chart-dropzone-title">No {slot.label} chart</span>
          <span className="chart-dropzone-sub">Enter edit mode to add</span>
        </button>
      )}
    </div>
  );
}

// Zoomable lightbox — scroll/buttons to zoom, drag to pan
function Lightbox({ url, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  const clampZoom = (z) => Math.min(5, Math.max(1, z));
  const changeZoom = (delta) => {
    setZoom(prev => {
      const next = clampZoom(prev + delta);
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  };

  const onWheel = (e) => { e.preventDefault(); changeZoom(e.deltaY < 0 ? 0.3 : -0.3); };

  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    dragRef.current = { startX: e.clientX - pos.x, startY: e.clientY - pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    setPos({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
  };
  const onMouseUp = () => { dragRef.current = null; };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') changeZoom(0.3);
      if (e.key === '-') changeZoom(-0.3);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div className="lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-btn" onClick={() => changeZoom(-0.3)} title="Zoom out"><Icon.ZoomOut /></button>
        <span className="lightbox-zoom-val">{Math.round(zoom * 100)}%</span>
        <button className="lightbox-btn" onClick={() => changeZoom(0.3)} title="Zoom in"><Icon.ZoomIn /></button>
        <span className="lightbox-tb-sep" />
        <button className="lightbox-btn" onClick={onClose} title="Close"><Icon.Close /></button>
      </div>
      <img
        src={url}
        alt="Chart"
        className="lightbox-img"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
          cursor: zoom > 1 ? (dragRef.current ? 'grabbing' : 'grab') : 'default',
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        draggable={false}
      />
      <div className="lightbox-hint">Scroll to zoom · drag to pan · Esc to close</div>
    </div>
  );
}

function TradeDetailModal({ trade, onClose, onDelete, onSave, startInEdit = false }) {
  const [editing, setEditing] = useState(startInEdit);
  const [localTrade, setLocalTrade] = useState({ ...trade });
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const score = useMemo(() => calcScore(localTrade.checked || {}), [localTrade.checked]);

  const charts = localTrade.charts || {};

  // Ghost toast — tells the user to enter edit mode
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // Upload a chart image → compress → Firebase Storage → save URL to Firestore
  const handleChartUpload = async (key, file) => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    setUploadingKey(key);
    try {
      const blob = await compressImage(file);
      const path = `charts/${localTrade.userId}/${localTrade.id}/${key}_${Date.now()}.jpg`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, blob);
      const url = await getDownloadURL(sRef);

      // remove previous file for this slot (best effort)
      const prev = charts[key];
      if (prev?.path) { try { await deleteObject(storageRef(storage, prev.path)); } catch (_) {} }

      const updatedCharts = { ...charts, [key]: { url, path } };
      const updatedTrade = { ...localTrade, charts: updatedCharts };
      setLocalTrade(updatedTrade);
      await onSave(updatedTrade);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
    setUploadingKey(null);
  };

  const handleChartDelete = async (key) => {
    const entry = charts[key];
    if (entry?.path) { try { await deleteObject(storageRef(storage, entry.path)); } catch (_) {} }
    const updatedCharts = { ...charts };
    delete updatedCharts[key];
    const updatedTrade = { ...localTrade, charts: updatedCharts };
    setLocalTrade(updatedTrade);
    await onSave(updatedTrade);
  };

  const handleClose = () => {
    if (editing) { setShowUnsaved(true); return; }
    onClose();
  };

  const toggleItem = (id, val) => {
    const updatedChecked = { ...localTrade.checked, [id]: val };
    const s = calcScore(updatedChecked);
    setLocalTrade(prev => ({ ...prev, checked: updatedChecked, percentage: s.percentage, bonusPercentage: s.bonusPercentage }));
  };

  const handleSave = async () => {
    await onSave(localTrade);
    setEditing(false);
  };

  const scoreColor = score.setupColor;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2 className="modal-title">Trade details</h2>
          <div className="flex gap-2">
            <button className="btn btn-danger btn-icon" onClick={() => onDelete(trade.id)} title="Delete"><Icon.Trash /></button>
            <button className="btn btn-secondary btn-icon" onClick={() => setEditing(!editing)} title="Edit"
              style={editing ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}><Icon.Edit /></button>
            <button className="btn btn-ghost btn-icon" onClick={handleClose} title="Close"><Icon.Close /></button>
          </div>
        </div>

        <div className="trade-meta-bar">
          <span className="trade-meta-pair">{localTrade.pair}</span>
          <span className="trade-meta-sep" />
          <span style={{ color: localTrade.tradeDirection === 'Long' ? 'var(--accent)' : 'var(--red)', fontWeight: 600, fontSize: 14 }}>
            {localTrade.tradeDirection === 'Long' ? '📈 Long' : '📉 Short'}
          </span>
          <span className="trade-meta-sep" />
          {editing ? (
            <select value={localTrade.tradeResult} onChange={e => setLocalTrade(p => ({ ...p, tradeResult: e.target.value }))}
              className="form-input" style={{ padding: '7px 12px', width: 'auto' }}>
              {['On going', 'Win', 'Loss', 'Breakeven'].map(r => <option key={r}>{r}</option>)}
            </select>
          ) : (
            <ResultBadge result={localTrade.tradeResult} />
          )}
          <span className="trade-meta-spacer" />
          <span className="trade-meta-item"><span className="trade-meta-key">Date</span>{localTrade.tradeDate}</span>
          {localTrade.riskReward && <span className="trade-meta-item"><span className="trade-meta-key">R:R</span>{localTrade.riskReward}</span>}
        </div>

        <div className="modal-split">
          {/* LEFT — score, checklist, notes */}
          <div className="modal-split-left">
            <div style={{ marginBottom: 22 }}>
              <StatBar label="Setup score" value={score.percentage} color={scoreColor} />
              <StatBar label="Bonus" value={score.bonusPercentage} color="var(--purple)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {SECTIONS.map(section => (
                <div key={section.title}>
                  <div className="card-title">{section.title}</div>
                  <div className="flex flex-col gap-2">
                    {section.items.map(item => {
                      const id = `${section.title}-${item.name}`;
                      const isChecked = localTrade.checked?.[id] || false;
                      return (
                        <label key={id}
                          className={`check-item modal-check ${isChecked ? (item.isBonus ? 'checked-bonus' : 'checked') : ''}`}
                          style={{ cursor: 'pointer', opacity: editing ? 1 : 0.9 }}
                          onClick={() => editing ? toggleItem(id, !isChecked) : showToast('Enter edit mode to change the checklist')}>
                          <div className={`check-box ${isChecked ? (item.isBonus ? 'checked-bonus' : 'checked') : ''}`}>
                            <Icon.Check />
                          </div>
                          <span className="check-name">{item.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="form-group mb-4">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={5} readOnly={!editing}
                style={{ resize: 'vertical', opacity: editing ? 1 : 0.75, cursor: editing ? 'text' : 'pointer' }}
                value={localTrade.note || ''}
                onChange={e => setLocalTrade(p => ({ ...p, note: e.target.value }))}
                onClick={() => { if (!editing) showToast('Enter edit mode to add notes'); }}
                placeholder="Add notes about this trade..." />
            </div>
          </div>

          <div className="modal-split-rule" />
          <div className="modal-split-divider" />

          {/* RIGHT — multi-timeframe charts */}
          <div className="modal-split-right">
            <div className="charts-header">
              <div className="charts-header-title">
                <Icon.Image />
                <span>Charts</span>
              </div>
              <span className="charts-header-sub">W → D → H4 → LT</span>
            </div>
            <div className="charts-stack">
              {CHART_SLOTS.map(slot => (
                <ChartUploader
                  key={slot.key}
                  slot={slot}
                  url={charts[slot.key]?.url}
                  uploading={uploadingKey === slot.key}
                  editing={editing}
                  onPick={(file) => handleChartUpload(slot.key, file)}
                  onDelete={() => handleChartDelete(slot.key)}
                  onView={(url) => setLightboxUrl(url)}
                  onLocked={() => showToast('Enter edit mode to manage charts')}
                />
              ))}
            </div>
          </div>
        </div>

        {editing && (
          <div className="modal-save-bar">
            <button className="btn btn-primary btn-lg btn-full" onClick={handleSave}>Save changes</button>
          </div>
        )}
      </div>

      {/* Zoomable lightbox for full-size chart viewing */}
      {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

      {/* Ghost toast — edit mode hint */}
      {toast && (
        <div className="ghost-toast">
          <Icon.Edit />
          <span>{toast}</span>
        </div>
      )}

      {showUnsaved && (
        <div className="modal-overlay" style={{ zIndex: 300 }}>
          <div className="modal modal-sm">
            <h3 style={{ marginBottom: 10 }}>Unsaved changes</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>Do you want to save before closing?</p>
            <div className="flex gap-3" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={async () => { await handleSave(); setShowUnsaved(false); onClose(); }}>Save</button>
              <button className="btn btn-danger" onClick={() => { setShowUnsaved(false); onClose(); }}>Discard</button>
              <button className="btn btn-secondary" onClick={() => setShowUnsaved(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────
// ─── REUSABLE TRADE LIST (used in History + Dashboard) ────────────────────────
function TradeList({ trades, setSavedTrades, emptyTitle = 'No trades saved yet', emptySub = 'Complete the checklist and save your first trade.' }) {
  const [openedId, setOpenedId] = useState(null);
  const [openInEdit, setOpenInEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'trades', id));
    setSavedTrades(prev => prev.filter(t => t.id !== id));
    setDeleteId(null); setOpenedId(null);
  };

  const handleSave = async (updated) => {
    await updateDoc(doc(db, 'trades', updated.id), updated);
    setSavedTrades(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const openView = (id) => { setOpenInEdit(false); setOpenedId(id); };
  const openEdit = (id) => { setOpenInEdit(true); setOpenedId(id); };

  const openedTrade = trades.find(t => t.id === openedId);

  if (trades.length === 0) {
    return (
      <div className="card empty-state">
        <Icon.Inbox />
        <p>{emptyTitle}</p>
        <p className="sub">{emptySub}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {trades.map(trade => (
          <div key={trade.id} className="trade-row">
            <div>
              <div className="trade-pair">{trade.pair}</div>
              <div className="trade-date">{trade.tradeDate}</div>
            </div>
            <span className="trade-dir" style={{ color: trade.tradeDirection === 'Long' ? 'var(--accent)' : 'var(--red)' }}>
              {trade.tradeDirection === 'Long' ? '📈' : '📉'} {trade.tradeDirection}
            </span>
            <ResultBadge result={trade.tradeResult} />
            <span className="num" style={{ fontSize: 14, fontWeight: 600, color: parseInt(trade.percentage) >= 80 ? 'var(--accent)' : parseInt(trade.percentage) >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
              {trade.percentage}%
            </span>
            <div className="flex gap-2">
              <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(trade.id)} title="Delete"><Icon.Trash /></button>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(trade.id)} title="Edit"><Icon.Edit /></button>
              <button className="btn btn-secondary btn-sm" onClick={() => openView(trade.id)}><Icon.Eye /> View</button>
            </div>
          </div>
        ))}
      </div>

      {openedTrade && (
        <TradeDetailModal trade={openedTrade} startInEdit={openInEdit} onClose={() => setOpenedId(null)}
          onDelete={(id) => { setDeleteId(id); setOpenedId(null); }}
          onSave={handleSave} />
      )}

      {deleteId && (
        <ConfirmModal title="Delete trade" message="Are you sure you want to delete this trade? This action cannot be undone."
          onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />
      )}
    </>
  );
}

// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────
function HistoryPage({ trades, setSavedTrades, mode }) {
  const filtered = trades.filter(t => t.tradeMode === mode);
  return <TradeList trades={filtered} setSavedTrades={setSavedTrades} />;
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ trades, setSavedTrades, mode }) {
  const [period, setPeriod] = useState('all');
  const [pairFilter, setPairFilter] = useState('all');

  const modeTrades = trades.filter(t => t.tradeMode === mode);

  const filtered = useMemo(() => {
    let t = filterByPeriod(modeTrades, period);
    if (pairFilter !== 'all') t = t.filter(tr => tr.pair === pairFilter);
    return t;
  }, [modeTrades, period, pairFilter]);

  const s = useMemo(() => calcStats(filtered), [filtered]);

  // KPI cards — NO loss rate, NO breakeven (per request)
  const kpis = [
    { label: 'Total trades', value: s.total, sub: 'closed' },
    { label: 'Win rate', value: `${s.winRate}%`, sub: `${s.wins} wins · ${s.losses} losses` },
    { label: 'On going', value: s.ongoing, sub: 'open trades' },
    { label: 'Avg score', value: `${s.avgScore}%`, sub: 'setup quality' },
    ...(mode === 'backtest' ? [{ label: 'Avg R:R', value: s.avgRR, sub: 'risk : reward' }] : []),
  ];

  return (
    <>
      {/* Filters */}
      <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <FilterDropdown label="Period" value={period} options={PERIOD_OPTIONS} onChange={setPeriod} icon={<Icon.Filter />} />
        <PairSelect value={pairFilter} onChange={setPairFilter} pairs={FX_PAIRS} allOption={true} />
      </div>

      {/* KPI Row */}
      <div className="kpi-grid mb-4">
        {kpis.map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Win rate per setup score — MOVED UP, right under KPIs */}
      <div className="card mb-4">
        <div className="card-title">Win rate per setup score</div>
        <StatBar label="Weak (<60%)" value={s.wrWeak} color="var(--red)" sub={`${s.weakCount} trades`} />
        <StatBar label="Good (60–79%)" value={s.wrGood} color="var(--yellow)" sub={`${s.goodCount} trades`} />
        <StatBar label="Strong (≥80%)" value={s.wrStrong} color="var(--accent)" sub={`${s.strongCount} trades`} />
      </div>

      {/* Other charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-title">Direction — Long vs Short</div>
          <StatBar label="📈 Long" value={s.longPct} color="var(--accent)" sub={`${s.longCount} trades`} />
          <StatBar label="📉 Short" value={s.shortPct} color="var(--red)" sub={`${s.shortCount} trades`} />
        </div>

        <div className="card">
          <div className="card-title">Win rate — Long vs Short</div>
          <StatBar label="📈 Long win rate" value={s.wrLong} color="var(--accent)" />
          <StatBar label="📉 Short win rate" value={s.wrShort} color="var(--red)" />
        </div>
      </div>

      {/* Trade history — follows the same period + pair filter */}
      <div className="dashboard-history-header">
        <h3 className="dashboard-history-title">
          Trade history
          {pairFilter !== 'all' && <span className="dashboard-history-pair">{pairFilter}</span>}
        </h3>
        <span className="dashboard-history-count">{filtered.length} {filtered.length === 1 ? 'trade' : 'trades'}</span>
      </div>
      <TradeList
        trades={filtered}
        setSavedTrades={setSavedTrades}
        emptyTitle={pairFilter !== 'all' ? `No ${pairFilter} trades in this period` : 'No trades in this period'}
        emptySub="Try adjusting the period or pair filter."
      />
    </>
  );
}

// ─── AI COACH PAGE ────────────────────────────────────────────────────────────
function AICoachPage({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI trading coach. Tell me about your Forex strategy — how you identify trend, support/resistance, and entries. The more you explain, the more accurate my signals will be.",
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [signalPair, setSignalPair] = useState('');
  const [signalTF, setSignalTF] = useState('H4');
  const [signalLoading, setSignalLoading] = useState(false);
  const [signal, setSignal] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const functions = getFunctions();

  const getStrategyContext = () => {
    const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
    return userMsgs || 'Strategy not defined yet.';
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim(), time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const aiChat = httpsCallable(functions, 'aiChat');
      const apiMessages = [...messages, userMsg]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const systemPrompt = `You are an expert Forex trading coach. You listen to the user's strategy, ask relevant questions to understand their approach better, and memorize everything so you can generate precise signals. Be concise and professional.`;
      const result = await aiChat({ messages: apiMessages, systemPrompt });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.data.reply,
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Error: ' + err.message, time: '' }]);
    }
    setLoading(false);
  };

  const generateSignal = async () => {
    if (!signalPair) { alert('Enter a pair.'); return; }
    setSignalLoading(true); setSignal(null);
    try {
      const gen = httpsCallable(functions, 'generateSignal');
      const result = await gen({
        pair: signalPair.toUpperCase(),
        timeframe: signalTF,
        strategyContext: getStrategyContext(),
        checklistItems: ALL_ITEMS,
      });
      setSignal(result.data);
    } catch (err) {
      alert('Signal generation error: ' + err.message);
    }
    setSignalLoading(false);
  };

  const signalScoreColor = signal ? (signal.score >= 80 ? 'var(--accent)' : signal.score >= 60 ? 'var(--yellow)' : 'var(--red)') : 'var(--text-muted)';

  return (
    <div className="chat-layout">
      <div className="chat-area">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role === 'user' ? 'user' : 'ai'}`}>
              <div className="msg-avatar">{msg.role === 'user' ? 'You' : 'AI'}</div>
              <div>
                <div className="msg-bubble">{msg.content}</div>
                {msg.time && <div className="msg-time">{msg.time}</div>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg msg-ai">
              <div className="msg-avatar">AI</div>
              <div className="msg-bubble" style={{ color: 'var(--accent)' }}>
                <div className="loading-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <textarea className="chat-input" rows={2}
            placeholder="Explain your strategy... (e.g. I look for exhaustion on weekly at S/R, confirm on daily with LH/HL...)"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading}><Icon.Send /></button>
        </div>
      </div>

      <div className="signal-panel">
        <div className="signal-panel-header"><Icon.Bolt /> Generate signal</div>
        <div className="signal-panel-body">
          <div className="signal-form">
            <div className="form-group">
              <label className="form-label">Pair</label>
              <input className="form-input" placeholder="e.g. EURUSD" value={signalPair} onChange={e => setSignalPair(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Main timeframe</label>
              <select className="form-input" value={signalTF} onChange={e => setSignalTF(e.target.value)}>
                {['W1', 'D1', 'H4', 'H2', 'H1', 'M30', 'M15'].map(tf => <option key={tf}>{tf}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={generateSignal} disabled={signalLoading}>
              {signalLoading ? <span style={{ color: '#060b16' }}><div className="loading-dots"><span /><span /><span /></div></span> : <><Icon.Bolt /> Analyze setup</>}
            </button>
          </div>

          {signal && (
            <div className="signal-result mt-4">
              <div className="signal-header">
                <span className="signal-pair">{signalPair.toUpperCase()}</span>
                <span className="result-badge" style={{ background: signal.isValidSetup ? 'var(--accent-dim)' : 'var(--red-dim)', color: signal.isValidSetup ? 'var(--accent)' : 'var(--red)' }}>
                  {signal.setupStrength}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="stat-track" style={{ flex: 1 }}>
                  <div className="stat-fill" style={{ width: `${signal.score}%`, background: signalScoreColor }} />
                </div>
                <span style={{ color: signalScoreColor, fontWeight: 600, fontSize: 14 }}>{signal.score}%</span>
              </div>

              <div className="signal-levels">
                <div className="level-row"><span className="level-label">Entry</span><span className="level-value" style={{ color: 'var(--accent)' }}>{signal.entry}</span></div>
                <div className="level-row"><span className="level-label">Stop loss</span><span className="level-value" style={{ color: 'var(--red)' }}>{signal.stopLoss}</span></div>
                <div className="level-row"><span className="level-label">Take profit</span><span className="level-value" style={{ color: 'var(--blue)' }}>{signal.takeProfit}</span></div>
                <div className="level-row"><span className="level-label">R : R</span><span className="level-value" style={{ color: 'var(--purple)' }}>{signal.riskReward}</span></div>
              </div>

              {signal.confluences?.length > 0 && (
                <div>
                  <div className="form-label mb-2">Confluences</div>
                  <div className="signal-confluences">
                    {signal.confluences.map((c, i) => <span key={i} className="confluence-tag">{c}</span>)}
                  </div>
                </div>
              )}

              <div>
                <div className="form-label mb-2">AI analysis</div>
                <p className="signal-reasoning">{signal.reasoning}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const register = async () => {
    if (password !== confirmPassword) { alert('Passwords do not match.'); return; }
    try { await createUserWithEmailAndPassword(auth, email, password); }
    catch (e) { alert(e.message); }
  };

  const login = async () => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) { alert(e.code); }
  };

  const loginGoogle = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><BladeLogo size={30} /></div>
          <div className="auth-logo-text">My<span>Edge</span></div>
          <div className="auth-logo-sub">Trading Intelligence Platform</div>
        </div>

        <div className="auth-field">
          <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="auth-field">
          <input className="auth-input" type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
          <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
            {showPw ? <Icon.EyeOff /> : <Icon.Eye />}
          </button>
        </div>

        {isRegister && (
          <div className="auth-field">
            <input className="auth-input" type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              style={{ borderColor: confirmPassword ? (confirmPassword === password ? 'var(--accent)' : 'var(--red)') : undefined }} />
          </div>
        )}

        {!isRegister && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
            Remember me
          </label>
        )}

        <button className="btn btn-primary btn-lg btn-full" onClick={isRegister ? register : login}>
          {isRegister ? 'Create account' : 'Log in'}
        </button>

        <div className="auth-divider">or</div>

        <button className="btn-google" onClick={loginGoogle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
          Continue with Google
        </button>

        <div className="auth-switch">
          {isRegister ? (<>Already have an account? <a onClick={() => setIsRegister(false)}>Log in</a></>)
            : (<>Don't have an account? <a onClick={() => setIsRegister(true)}>Create one</a></>)}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('checklist-live');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedTrades, setSavedTrades] = useState([]);
  const [liveChecked, setLiveChecked] = useState({});
  const [backtestChecked, setBacktestChecked] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  useEffect(() => { if (user) loadTrades(); }, [user]);

  const loadTrades = async () => {
    const q = query(collection(db, 'trades'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const trades = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    trades.sort((a, b) => new Date(b.tradeDate) - new Date(a.tradeDate));
    setSavedTrades(trades);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <div className="logo-icon" style={{ width: 48, height: 48, borderRadius: 14, animation: 'logoPulse 1.6s ease-in-out infinite' }}><BladeLogo size={28} /></div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' }}>Loading your edge…</div>
    </div>
  );

  if (!user) return <AuthPage />;

  const nav = [
    { group: 'Live Trading', items: [
      { id: 'checklist-live', label: 'Checklist', icon: <Icon.Checklist /> },
      { id: 'history-live', label: 'History', icon: <Icon.History /> },
      { id: 'dashboard-live', label: 'Dashboard', icon: <Icon.Dashboard /> },
    ]},
    { group: 'Backtest', items: [
      { id: 'checklist-backtest', label: 'Checklist', icon: <Icon.Checklist /> },
      { id: 'history-backtest', label: 'History', icon: <Icon.History /> },
      { id: 'dashboard-backtest', label: 'Dashboard', icon: <Icon.Dashboard /> },
    ]},
    { group: 'AI', items: [
      { id: 'ai', label: 'AI Coach', icon: <Icon.AI /> },
    ]},
  ];

  const pageTitles = {
    'checklist-live': { title: 'Checklist', sub: 'Live' },
    'history-live': { title: 'History', sub: 'Live' },
    'dashboard-live': { title: 'Dashboard', sub: 'Live' },
    'checklist-backtest': { title: 'Checklist', sub: 'Backtest' },
    'history-backtest': { title: 'History', sub: 'Backtest' },
    'dashboard-backtest': { title: 'Dashboard', sub: 'Backtest' },
    'ai': { title: 'AI Coach', sub: 'Training & Signals' },
  };

  const { title, sub } = pageTitles[activePage] || {};
  const initials = (user.displayName || user.email || 'T').charAt(0).toUpperCase();

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><BladeLogo size={20} /></div>
          <div className="logo-text">My<span>Edge</span></div>
        </div>

        <div className="sidebar-user">
          {user.photoURL ? <img src={user.photoURL} alt="" className="user-avatar" /> : <div className="user-avatar-placeholder">{initials}</div>}
          <div>
            <div className="user-name">{user.displayName || 'Trader'}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(group => (
            <div key={group.group}>
              <div className="nav-section-label">{group.group}</div>
              {group.items.map(item => (
                <button key={item.id} className={`nav-btn ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}>
                  {item.icon}{item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => signOut(auth)}><Icon.Logout /> Log out</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}><Icon.Menu /></button>
          <div>
            <div className="topbar-title">{title}</div>
            {sub && <div className="topbar-sub">{sub}</div>}
          </div>
        </div>

        <div className="page-body">
          {activePage === 'checklist-live' && <ChecklistPage checked={liveChecked} setChecked={setLiveChecked} savedTrades={savedTrades} setSavedTrades={setSavedTrades} user={user} mode="live" />}
          {activePage === 'checklist-backtest' && <ChecklistPage checked={backtestChecked} setChecked={setBacktestChecked} savedTrades={savedTrades} setSavedTrades={setSavedTrades} user={user} mode="backtest" />}
          {activePage === 'history-live' && <HistoryPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="live" />}
          {activePage === 'history-backtest' && <HistoryPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="backtest" />}
          {activePage === 'dashboard-live' && <DashboardPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="live" />}
          {activePage === 'dashboard-backtest' && <DashboardPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="backtest" />}
          {activePage === 'ai' && <AICoachPage user={user} />}
        </div>
      </main>
    </div>
  );
}