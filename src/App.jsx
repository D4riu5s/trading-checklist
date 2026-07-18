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
  Insight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
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

  // Current streaks — consecutive W/L from the most recent decided trade
  const decidedWL = closed
    .filter(t => t.tradeResult === 'Win' || t.tradeResult === 'Loss')
    .slice()
    .sort((a, b) => new Date(b.tradeDate) - new Date(a.tradeDate));
  let curWinStreak = 0, curLossStreak = 0;
  if (decidedWL.length) {
    const recent = decidedWL[0].tradeResult;
    for (const t of decidedWL) {
      if (t.tradeResult !== recent) break;
      if (recent === 'Win') curWinStreak++; else curLossStreak++;
    }
  }

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
    avgScore, avgRR, curWinStreak, curLossStreak,
  };
}

// ─── STRATEGY INSIGHTS: per-condition win-rate analysis ───────────────────────
// For each checklist condition, compares win rate WHEN checked vs the overall
// win rate, so you can see which conditions actually help vs drag your results.
function analyzeConditions(trades) {
  const decided = trades.filter(t => t.tradeResult === 'Win' || t.tradeResult === 'Loss');
  const totalWins = decided.filter(t => t.tradeResult === 'Win').length;
  const baseWinRate = decided.length ? totalWins / decided.length : 0;

  const rows = [];
  SECTIONS.forEach(section => {
    section.items.forEach(item => {
      if (item.weight === 0 && !item.isBonus) return; // skip pure context items (e.g. "Trend")
      const id = `${section.title}-${item.name}`;
      const withCond = decided.filter(t => t.checked?.[id]);
      const withoutCond = decided.filter(t => !t.checked?.[id]);
      const winsWith = withCond.filter(t => t.tradeResult === 'Win').length;
      const winsWithout = withoutCond.filter(t => t.tradeResult === 'Win').length;

      const wrWith = withCond.length ? winsWith / withCond.length : null;
      const wrWithout = withoutCond.length ? winsWithout / withoutCond.length : null;

      rows.push({
        id, section: section.title, name: item.name, isBonus: item.isBonus,
        countWith: withCond.length,
        winsWith, lossesWith: withCond.length - winsWith,
        wrWith,
        wrWithout,
        // "lift" = how much this condition changes your win rate vs. not having it
        lift: (wrWith !== null && wrWithout !== null) ? wrWith - wrWithout : null,
        vsBase: (wrWith !== null) ? wrWith - baseWinRate : null,
      });
    });
  });

  return { decidedCount: decided.length, baseWinRate, totalWins, totalLosses: decided.length - totalWins, rows };
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
  const stickyanchorRef = useRef(null);

  const score = useMemo(() => calcScore(checked), [checked]);

  useEffect(() => {
    const el = stickyanchorRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
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

      {/* Sentinel — when this scrolls above the viewport, the sticky score appears */}
      <div ref={stickyanchorRef} aria-hidden="true" style={{ height: 1 }} />

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

            <div className="form-group notes-fill">
              <label className="form-label">Notes</label>
              <textarea className="form-input notes-textarea" readOnly={!editing}
                style={{ opacity: editing ? 1 : 0.75, cursor: editing ? 'text' : 'pointer' }}
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

// ─── WIN RATE EVOLUTION CHART (pure SVG, premium) ─────────────────────────────
function WinRateChart({ trades }) {
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);

  const series = useMemo(() => {
    const decided = trades
      .filter(t => t.tradeResult === 'Win' || t.tradeResult === 'Loss')
      .slice()
      .sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
    let wins = 0;
    return decided.map((t, i) => {
      if (t.tradeResult === 'Win') wins++;
      return { i, wr: (wins / (i + 1)) * 100, date: t.tradeDate, result: t.tradeResult };
    });
  }, [trades]);

  const W = 900, H = 200, padL = 40, padR = 14, padT = 16, padB = 22;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = series.length;

  if (n < 2) {
    return (
      <div className="card chart-card">
        <div className="chart-head">
          <div className="card-title" style={{ marginBottom: 0 }}>Win rate evolution</div>
        </div>
        <div className="chart-empty">Need at least 2 decided trades (Win or Loss) to plot your win rate evolution.</div>
      </div>
    );
  }

  const xFor = (i) => padL + (i / (n - 1)) * plotW;
  const yFor = (wr) => padT + (1 - wr / 100) * plotH;
  const linePts = series.map(p => `${xFor(p.i).toFixed(1)},${yFor(p.wr).toFixed(1)}`).join(' ');
  const areaPts = `${xFor(0).toFixed(1)},${(padT + plotH).toFixed(1)} ${linePts} ${xFor(n - 1).toFixed(1)},${(padT + plotH).toFixed(1)}`;
  const currentWR = Math.round(series[n - 1].wr);
  const gridYs = [0, 25, 50, 75, 100];

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    let idx = Math.round(((svgX - padL) / plotW) * (n - 1));
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  };
  const hp = hover !== null ? series[hover] : null;

  return (
    <div className="card chart-card">
      <div className="chart-head">
        <div>
          <div className="card-title" style={{ marginBottom: 4 }}>Win rate evolution</div>
          <div className="chart-sub">Cumulative · {n} decided trades</div>
        </div>
        <div className="chart-current">
          <span className="chart-current-val num" style={{ color: currentWR >= 50 ? 'var(--accent)' : 'var(--red)' }}>{currentWR}%</span>
          <span className="chart-current-label">current</span>
        </div>
      </div>
      <div className="chart-svg-wrap" ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2de2a3" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2de2a3" stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridYs.map(g => (
            <g key={g}>
              <line x1={padL} y1={yFor(g)} x2={W - padR} y2={yFor(g)}
                stroke={g === 50 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)'}
                strokeWidth="1" strokeDasharray={g === 50 ? '4 4' : ''} vectorEffect="non-scaling-stroke" />
              <text x={padL - 8} y={yFor(g) + 4} textAnchor="end" className="chart-axis-label">{g}</text>
            </g>
          ))}
          <polygon points={areaPts} fill="url(#wrGrad)" />
          <polyline points={linePts} fill="none" stroke="#2de2a3" strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {hp && (
            <g>
              <line x1={xFor(hp.i)} y1={padT} x2={xFor(hp.i)} y2={padT + plotH} stroke="rgba(255,255,255,0.22)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <circle cx={xFor(hp.i)} cy={yFor(hp.wr)} r="4.5" fill="#2de2a3" stroke="#08080a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </g>
          )}
        </svg>
        {hp && (
          <div className="chart-tooltip" style={{ left: `${(xFor(hp.i) / W) * 100}%`, top: `${(yFor(hp.wr) / H) * 100}%` }}>
            <div className="chart-tt-wr num">{Math.round(hp.wr)}%</div>
            <div className="chart-tt-meta">Trade {hp.i + 1} · {hp.date}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TRADING CALENDAR (month grid + year heatmap, FTMO-style) ─────────────────
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function buildDayStats(trades) {
  const map = {};
  trades.forEach(t => {
    const k = (t.tradeDate || '').slice(0, 10);
    if (!k) return;
    if (!map[k]) map[k] = { win: 0, loss: 0, be: 0, ongoing: 0, total: 0 };
    const r = t.tradeResult;
    if (r === 'Win') map[k].win++;
    else if (r === 'Loss') map[k].loss++;
    else if (r === 'Breakeven') map[k].be++;
    else map[k].ongoing++;
    map[k].total++;
  });
  return map;
}

function dayClass(d) {
  if (!d || d.total === 0) return null;
  if (d.win > d.loss) return 'win';
  if (d.loss > d.win) return 'loss';
  if (d.win > 0 && d.win === d.loss) return 'mixed';
  return 'neutral';
}

function heatStyle(d) {
  if (!d || d.total === 0) return {};
  const strong = Math.min(1, 0.42 + d.total * 0.16);
  let base;
  if (d.win > d.loss) base = '45,226,163';
  else if (d.loss > d.win) base = '255,94,120';
  else if (d.win > 0) base = '255,206,92';
  else base = '122,126,143';
  return { backgroundColor: `rgba(${base},${strong})` };
}

function TradingCalendar({ trades, setSavedTrades, view = 'month' }) {
  const today = new Date();
  const [vY, setVY] = useState(today.getFullYear());
  const [vM, setVM] = useState(today.getMonth());
  const [hY, setHY] = useState(today.getFullYear());
  const [dayPopup, setDayPopup] = useState(null);
  const [summaryPopup, setSummaryPopup] = useState(null); // 'month' | 'year' | null
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const byDay = useMemo(() => buildDayStats(trades), [trades]);
  const wrOf = (w, l) => (w + l) ? Math.round(w / (w + l) * 100) : null;

  // Rich summary (incl. average setup score) for a date predicate
  const summaryFor = (predicate) => {
    const inRange = trades.filter(t => { const k = (t.tradeDate || '').slice(0, 10); return k && predicate(new Date(k)); });
    const wins = inRange.filter(t => t.tradeResult === 'Win').length;
    const losses = inRange.filter(t => t.tradeResult === 'Loss').length;
    const decided = wins + losses;
    const scored = inRange.filter(t => t.percentage != null && t.percentage !== '');
    const avgScore = scored.length ? Math.round(scored.reduce((s, t) => s + parseFloat(t.percentage || 0), 0) / scored.length) : null;
    return {
      total: inRange.length, wins, losses,
      winRate: decided ? Math.round(wins / decided * 100) : null,
      avgScore,
    };
  };
  const summaryData = summaryPopup === 'month'
    ? summaryFor(dt => dt.getFullYear() === vY && dt.getMonth() === vM)
    : summaryPopup === 'year'
      ? summaryFor(dt => dt.getFullYear() === hY)
      : null;
  const summaryTitle = summaryPopup === 'month' ? `${MONTHS[vM]} ${vY}` : summaryPopup === 'year' ? `${hY}` : '';

  // Trades within the summarized period (for the list shown in the summary popup)
  const summaryTrades = useMemo(() => {
    if (!summaryPopup) return [];
    const pred = summaryPopup === 'month'
      ? (dt) => dt.getFullYear() === vY && dt.getMonth() === vM
      : (dt) => dt.getFullYear() === hY;
    return trades
      .filter(t => { const k = (t.tradeDate || '').slice(0, 10); if (!k) return false; return pred(new Date(k)); })
      .slice()
      .sort((a, b) => new Date(b.tradeDate) - new Date(a.tradeDate));
  }, [summaryPopup, trades, vY, vM, hY]);

  const dayTrades = useMemo(
    () => dayPopup ? trades.filter(t => (t.tradeDate || '').slice(0, 10) === dayPopup) : [],
    [dayPopup, trades]
  );
  const prettyDate = (k) => {
    try { return new Date(k).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return k; }
  };

  const agg = (predicate) => {
    let win = 0, loss = 0, total = 0;
    Object.entries(byDay).forEach(([k, d]) => {
      if (predicate(new Date(k))) { win += d.win; loss += d.loss; total += d.total; }
    });
    return { win, loss, total };
  };
  const monthAgg = useMemo(() => agg(dt => dt.getFullYear() === vY && dt.getMonth() === vM), [byDay, vY, vM]);
  const yearAgg = useMemo(() => agg(dt => dt.getFullYear() === hY), [byDay, hY]);
  const allAgg = useMemo(() => agg(() => true), [byDay]);

  const firstWeekday = ((new Date(vY, vM, 1).getDay()) + 6) % 7;
  const daysInMonth = new Date(vY, vM + 1, 0).getDate();
  const prevMonth = () => { if (vM === 0) { setVM(11); setVY(vY - 1); } else setVM(vM - 1); };
  const nextMonth = () => { if (vM === 11) { setVM(0); setVY(vY + 1); } else setVM(vM + 1); };

  const yearCells = useMemo(() => {
    const arr = [];
    const start = new Date(hY, 0, 1);
    const offset = ((start.getDay()) + 6) % 7;
    for (let i = 0; i < offset; i++) arr.push(null);
    const end = new Date(hY, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      arr.push({ k, stats: byDay[k] });
    }
    return arr;
  }, [hY, byDay]);

  const StatPill = ({ label, a }) => {
    const w = wrOf(a.win, a.loss);
    return (
      <div className="cal-stat">
        <div className="cal-stat-label">{label}</div>
        <div className="cal-stat-val num" style={{ color: w === null ? 'var(--text-muted)' : w >= 50 ? 'var(--accent)' : 'var(--red)' }}>
          {w === null ? '—' : `${w}%`}
        </div>
        <div className="cal-stat-sub">{a.win}W · {a.loss}L</div>
      </div>
    );
  };

  return (
    <div className={`cal-bare ${view === 'month' ? 'cal-page-fill' : ''}`}>
      <div className="cal-stats">
        <StatPill label={`${MONTHS[vM].slice(0, 3)} ${vY}`} a={monthAgg} />
        <StatPill label={`Year ${hY}`} a={yearAgg} />
        <StatPill label="All time" a={allAgg} />
      </div>

      {view === 'month' ? (
        <>
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <span className="cal-month-label">{MONTHS[vM]} {vY}</span>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="cal-weekdays">
            {WEEKDAYS.map(w => <div key={w} className="cal-weekday">{w}</div>)}
          </div>
          <div className="cal-grid">
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e${i}`} className="cal-day cal-day-empty" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const k = `${vY}-${String(vM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const d = byDay[k];
              const cls = dayClass(d);
              const w = d ? wrOf(d.win, d.loss) : null;
              const isToday = today.getFullYear() === vY && today.getMonth() === vM && today.getDate() === day;
              const hasTrades = d && d.total > 0;
              return (
                <div key={k} className={`cal-day cal-day-tappable ${cls ? 'cal-' + cls : ''} ${isToday ? 'cal-today' : ''} ${hasTrades ? 'cal-day-clickable' : ''}`}
                  title={d ? `${d.win}W · ${d.loss}L${w !== null ? ` · ${w}%` : ''}` : ''}
                  onClick={() => { if (hasTrades) setDayPopup(k); else showToast('No trades on this day'); }}>
                  <span className="cal-day-num">{day}</span>
                  {hasTrades && <span className="cal-day-count">{d.total} {d.total === 1 ? 'trade' : 'trades'}</span>}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => setHY(hY - 1)}>‹</button>
            <span className="cal-month-label">{hY}</span>
            <button className="cal-nav-btn" onClick={() => setHY(hY + 1)}>›</button>
          </div>
          <div className="heat-scroll">
            <div className="heat-grid">
              {yearCells.map((cell, i) => cell === null
                ? <div key={`h${i}`} className="heat-cell heat-empty" style={{ visibility: 'hidden' }} />
                : <div key={cell.k} className={`heat-cell ${cell.stats ? 'heat-clickable' : 'heat-empty'}`} style={heatStyle(cell.stats)}
                    title={cell.stats ? `${cell.k}: ${cell.stats.win}W · ${cell.stats.loss}L` : cell.k}
                    onClick={() => { if (cell.stats) setDayPopup(cell.k); }} />
              )}
            </div>
          </div>
          <div className="heat-legend">
            <span>Less</span>
            <span className="heat-cell heat-empty" />
            <span className="heat-cell" style={{ backgroundColor: 'rgba(45,226,163,0.4)' }} />
            <span className="heat-cell" style={{ backgroundColor: 'rgba(45,226,163,0.7)' }} />
            <span className="heat-cell" style={{ backgroundColor: 'rgba(45,226,163,1)' }} />
            <span>More</span>
            <span className="heat-legend-sep" />
            <span className="heat-cell" style={{ backgroundColor: 'rgba(255,94,120,0.7)' }} /> <span>Loss day</span>
          </div>
        </>
      )}

      {/* Summary buttons — below the calendar */}
      <div className="cal-summary-btns">
        <button className="btn btn-secondary btn-lg" onClick={() => setSummaryPopup('month')}>
          <Icon.Calendar /> Month summary
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => setSummaryPopup('year')}>
          <Icon.Insight /> Year summary
        </button>
      </div>

      {summaryPopup && summaryData && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSummaryPopup(null); }}>
          <div className="modal summary-modal">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{summaryPopup === 'month' ? 'Month summary' : 'Year summary'}</h2>
                <p className="day-modal-sub">{summaryTitle}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSummaryPopup(null)} title="Close"><Icon.Close /></button>
            </div>
            {summaryData.total === 0 ? (
              <div className="summary-empty">No trades in this period.</div>
            ) : (
              <div className="summary-grid">
                <div className="summary-stat">
                  <div className="summary-stat-label">Total trades</div>
                  <div className="summary-stat-value num">{summaryData.total}</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat-label">Total wins</div>
                  <div className="summary-stat-value num" style={{ color: 'var(--accent)' }}>{summaryData.wins}</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat-label">Total losses</div>
                  <div className="summary-stat-value num" style={{ color: 'var(--red)' }}>{summaryData.losses}</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat-label">Win rate</div>
                  <div className="summary-stat-value num" style={{ color: summaryData.winRate === null ? 'var(--text-muted)' : summaryData.winRate >= 50 ? 'var(--accent)' : 'var(--red)' }}>
                    {summaryData.winRate === null ? '—' : `${summaryData.winRate}%`}
                  </div>
                </div>
                <div className="summary-stat summary-stat-wide">
                  <div className="summary-stat-label">Average setup score</div>
                  <div className="summary-stat-value num" style={{ color: summaryData.avgScore === null ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {summaryData.avgScore === null ? '—' : `${summaryData.avgScore}%`}
                  </div>
                </div>
              </div>
            )}

            {summaryTrades.length > 0 && (
              <div className="summary-trades">
                <div className="summary-trades-title">
                  {summaryPopup === 'month' ? 'Trades this month' : 'Trades this year'}
                  <span className="summary-trades-count">{summaryTrades.length}</span>
                </div>
                <TradeList trades={summaryTrades} setSavedTrades={setSavedTrades} />
              </div>
            )}
          </div>
        </div>
      )}

      {dayPopup && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDayPopup(null); }}>
          <div className="modal day-modal">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{prettyDate(dayPopup)}</h2>
                <p className="day-modal-sub">{dayTrades.length} {dayTrades.length === 1 ? 'trade' : 'trades'} on this day</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDayPopup(null)} title="Close"><Icon.Close /></button>
            </div>
            <TradeList trades={dayTrades} setSavedTrades={setSavedTrades} />
          </div>
        </div>
      )}

      {toast && (
        <div className="ghost-toast">
          <Icon.Calendar />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR PAGE (standalone, own mode toggle) ──────────────────────────────
function CalendarPage({ trades, setSavedTrades }) {
  const [mode, setMode] = useState('live');
  const [view, setView] = useState('month');
  const modeTrades = useMemo(() => trades.filter(t => t.tradeMode === mode), [trades, mode]);
  return (
    <div className="fade-in cal-page">
      <div className="cal-page-toolbar">
        <div className="mode-toggle">
          <button className={`mode-toggle-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
          <button className={`mode-toggle-btn ${view === 'year' ? 'active' : ''}`} onClick={() => setView('year')}>Year</button>
        </div>
        <div className="mode-toggle">
          <button className={`mode-toggle-btn ${mode === 'live' ? 'active' : ''}`} onClick={() => setMode('live')}>Live</button>
          <button className={`mode-toggle-btn ${mode === 'backtest' ? 'active' : ''}`} onClick={() => setMode('backtest')}>Backtest</button>
        </div>
      </div>
      <TradingCalendar trades={modeTrades} setSavedTrades={setSavedTrades} view={view} />
    </div>
  );
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
    { label: 'Winning streak', value: s.curWinStreak, sub: 'current', color: s.curWinStreak > 0 ? 'var(--accent)' : 'var(--text-muted)' },
    { label: 'Losing streak', value: s.curLossStreak, sub: 'current', color: s.curLossStreak > 0 ? 'var(--red)' : 'var(--text-muted)' },
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
            <div className="kpi-value" style={k.color ? { color: k.color } : undefined}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Win rate evolution chart */}
      <div className="mb-4">
        <WinRateChart trades={filtered} />
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

// ─── STRATEGY INSIGHTS PAGE ───────────────────────────────────────────────────
const MIN_SAMPLE = 4; // below this, a condition doesn't have enough trades to trust

function ConditionRow({ row, baseWinRate }) {
  const wr = Math.round(row.wrWith * 100);
  const vs = Math.round(row.vsBase * 100);
  const vsClass = vs > 0 ? 'up' : vs < 0 ? 'down' : 'flat';
  const barColor = wr >= 60 ? 'var(--accent)' : wr >= 45 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="cond-row">
      <div className="cond-info">
        <div className="cond-name">
          {row.name}
          {row.isBonus && <span className="cond-bonus-tag">Bonus</span>}
        </div>
        <div className="cond-section">{row.section}</div>
      </div>
      <div className="cond-bar-area">
        <div className="cond-bar-track">
          <div className="cond-bar-fill" style={{ width: `${wr}%`, background: barColor }} />
        </div>
        <div className="cond-bar-meta">
          <span className="cond-wr num">{wr}%</span>
          <span className="cond-count">{row.winsWith}W · {row.lossesWith}L · n={row.countWith}</span>
        </div>
      </div>
      <div className={`cond-vs ${vsClass}`}>
        {vs > 0 ? '↑' : vs < 0 ? '↓' : '='} {vs > 0 ? '+' : ''}{vs}%
      </div>
    </div>
  );
}

function InsightsPage({ trades }) {
  const [mode, setMode] = useState('live');
  const modeTrades = useMemo(() => trades.filter(t => t.tradeMode === mode), [trades, mode]);
  const analysis = useMemo(() => analyzeConditions(modeTrades), [modeTrades]);

  const { decidedCount, baseWinRate, totalWins, totalLosses, rows } = analysis;

  // Split conditions into working / dragging / not-enough-data
  const enough = rows.filter(r => r.countWith >= MIN_SAMPLE);
  const notEnough = rows.filter(r => r.countWith > 0 && r.countWith < MIN_SAMPLE);
  const working = enough.filter(r => r.vsBase >= 0.001).sort((a, b) => b.vsBase - a.vsBase);
  const dragging = enough.filter(r => r.vsBase < -0.001).sort((a, b) => a.vsBase - b.vsBase);
  const neutral = enough.filter(r => Math.abs(r.vsBase) < 0.001);

  const baseWR = Math.round(baseWinRate * 100);

  return (
    <div className="fade-in">
      <div className="insights-toolbar">
        <div className="mode-toggle">
          <button className={`mode-toggle-btn ${mode === 'live' ? 'active' : ''}`} onClick={() => setMode('live')}>Live</button>
          <button className={`mode-toggle-btn ${mode === 'backtest' ? 'active' : ''}`} onClick={() => setMode('backtest')}>Backtest</button>
        </div>
      </div>

      {decidedCount < 5 ? (
        <div className="card empty-state">
          <Icon.Insight />
          <p>Not enough trades yet</p>
          <p className="sub">Log at least 5 decided trades (Win or Loss) in {mode} mode to unlock condition analysis. You have {decidedCount}.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="insights-summary">
            <div className="insights-sum-item">
              <div className="insights-sum-label">Decided trades</div>
              <div className="insights-sum-value num">{decidedCount}</div>
              <div className="insights-sum-sub">{totalWins}W · {totalLosses}L</div>
            </div>
            <div className="insights-sum-item">
              <div className="insights-sum-label">Base win rate</div>
              <div className="insights-sum-value num" style={{ color: baseWR >= 50 ? 'var(--accent)' : 'var(--red)' }}>{baseWR}%</div>
              <div className="insights-sum-sub">your average across all setups</div>
            </div>
            <div className="insights-sum-item">
              <div className="insights-sum-label">Conditions tracked</div>
              <div className="insights-sum-value num">{enough.length}</div>
              <div className="insights-sum-sub">{notEnough.length} need more data</div>
            </div>
          </div>

          <p className="insights-hint">
            Each bar shows your win rate <strong>when that condition was checked</strong>. The badge on the right compares it to your base win rate ({baseWR}%) — green means the condition lifts your results, red means it drags them down.
          </p>

          {/* Working conditions */}
          {working.length > 0 && (
            <div className="insights-group">
              <div className="insights-group-header working">
                <Icon.Check /> <span>Working — these lift your win rate</span>
              </div>
              <div className="cond-list">
                {working.map(r => <ConditionRow key={r.id} row={r} baseWinRate={baseWinRate} />)}
              </div>
            </div>
          )}

          {/* Dragging conditions */}
          {dragging.length > 0 && (
            <div className="insights-group">
              <div className="insights-group-header dragging">
                <Icon.Close /> <span>Dragging — these lower your win rate</span>
              </div>
              <div className="cond-list">
                {dragging.map(r => <ConditionRow key={r.id} row={r} baseWinRate={baseWinRate} />)}
              </div>
            </div>
          )}

          {/* Neutral */}
          {neutral.length > 0 && (
            <div className="insights-group">
              <div className="insights-group-header neutral">
                <span>≈ Neutral — little effect either way</span>
              </div>
              <div className="cond-list">
                {neutral.map(r => <ConditionRow key={r.id} row={r} baseWinRate={baseWinRate} />)}
              </div>
            </div>
          )}

          {/* Not enough data */}
          {notEnough.length > 0 && (
            <div className="insights-group">
              <div className="insights-group-header neutral">
                <span>Not enough data ({MIN_SAMPLE}+ trades needed)</span>
              </div>
              <div className="cond-list-muted">
                {notEnough.map(r => (
                  <div key={r.id} className="cond-muted-item">
                    <span>{r.section} · {r.name}</span>
                    <span className="num">n={r.countWith}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
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
    { group: 'Analysis', items: [
      { id: 'calendar', label: 'Calendar', icon: <Icon.Calendar /> },
      { id: 'insights', label: 'Strategy Insights', icon: <Icon.Insight /> },
    ]},
    { group: 'Backtest', items: [
      { id: 'checklist-backtest', label: 'Checklist', icon: <Icon.Checklist /> },
      { id: 'history-backtest', label: 'History', icon: <Icon.History /> },
      { id: 'dashboard-backtest', label: 'Dashboard', icon: <Icon.Dashboard /> },
    ]},
  ];

  const pageTitles = {
    'checklist-live': { title: 'Checklist', sub: 'Live' },
    'history-live': { title: 'History', sub: 'Live' },
    'dashboard-live': { title: 'Dashboard', sub: 'Live' },
    'checklist-backtest': { title: 'Checklist', sub: 'Backtest' },
    'history-backtest': { title: 'History', sub: 'Backtest' },
    'dashboard-backtest': { title: 'Dashboard', sub: 'Backtest' },
    'calendar': { title: 'Trading Calendar', sub: 'Your trades day by day' },
    'insights': { title: 'Strategy Insights', sub: 'What works in your checklist' },
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
          <div className="topbar-titlewrap">
            <span className="topbar-title">{title}</span>
            {sub && <><span className="topbar-divider" /><span className="topbar-sub">{sub}</span></>}
          </div>
        </div>

        <div className="page-body">
          {activePage === 'checklist-live' && <ChecklistPage checked={liveChecked} setChecked={setLiveChecked} savedTrades={savedTrades} setSavedTrades={setSavedTrades} user={user} mode="live" />}
          {activePage === 'checklist-backtest' && <ChecklistPage checked={backtestChecked} setChecked={setBacktestChecked} savedTrades={savedTrades} setSavedTrades={setSavedTrades} user={user} mode="backtest" />}
          {activePage === 'history-live' && <HistoryPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="live" />}
          {activePage === 'history-backtest' && <HistoryPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="backtest" />}
          {activePage === 'dashboard-live' && <DashboardPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="live" />}
          {activePage === 'dashboard-backtest' && <DashboardPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="backtest" />}
          {activePage === 'calendar' && <CalendarPage trades={savedTrades} setSavedTrades={setSavedTrades} />}
          {activePage === 'insights' && <InsightsPage trades={savedTrades} />}
        </div>
      </main>
    </div>
  );
}