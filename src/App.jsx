import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, auth } from './firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
  Backtest: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Signal: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 6s2-2 5-2 5 2 5 2"/><path d="M1 10s3-3 5-3 5 3 5 3"/><circle cx="6" cy="14" r="1" fill="currentColor"/><path d="M16 6s2-2 5-2 5 2 5 2" opacity=".4"/><path d="M16 10s3-3 5-3 5 3 5 3" opacity=".4"/></svg>,
  Long: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Short: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Star: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

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
  if (checkedCount > 0 && hasMissingRequired) { setupLabel = 'Invalid setup'; setupColor = 'var(--red)'; }
  else if (percentage >= 80) { setupLabel = 'Strong setup'; setupColor = 'var(--accent)'; }
  else if (percentage >= 60) { setupLabel = 'Good setup'; setupColor = 'var(--yellow)'; }

  return { percentage, bonusPercentage, setupLabel, setupColor, hasMissingRequired, checkedCount };
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
  const shortClosed = shorts.filter(t => t.tradeDirection === 'Short' && t.tradeResult !== 'On going');
  const avgScore = trades.length ? Math.round(trades.reduce((s, t) => s + parseFloat(t.percentage || 0), 0) / trades.length) : 0;
  const pct = (n, d) => d ? Math.round(n / d * 100) : 0;

  const weak = closed.filter(t => parseInt(t.percentage) < 60);
  const good = closed.filter(t => parseInt(t.percentage) >= 60 && parseInt(t.percentage) < 80);
  const strong = closed.filter(t => parseInt(t.percentage) >= 80);

  // Profit factor & expectancy (if RR available)
  const rrs = closed.filter(t => t.riskReward).map(t => parseFloat(t.riskReward) || 0);
  const avgRR = rrs.length ? (rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2) : 'N/A';

  return {
    total: closed.length, totalAll: trades.length,
    wins: wins.length, losses: losses.length, be: be.length, ongoing: ongoing.length,
    winRate: pct(wins.length, closed.length),
    lossRate: pct(losses.length, closed.length),
    beRate: pct(be.length, closed.length),
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

function filterByPeriod(trades, period) {
  if (period === 'all') return trades;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(period));
  return trades.filter(t => new Date(t.tradeDate) >= cutoff);
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function StatBar({ label, value, color, sub }) {
  return (
    <div className="stat-bar-row">
      <div className="stat-bar-header">
        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontSize: 12 }}>{value}% {sub && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({sub})</span>}</span>
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

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <h3 style={{ marginBottom: 10 }}>{title}</h3>
        <p className="text-secondary text-sm" style={{ marginBottom: 24, lineHeight: 1.7 }}>{message}</p>
        <div className="flex gap-3" style={{ justifyContent: 'center' }}>
          <button className="btn btn-danger" onClick={onConfirm}>Confirma</button>
          <button className="btn btn-secondary" onClick={onCancel}>Anuleaza</button>
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
  const [showStickyScore, setShowStickyScore] = useState(false);

  const score = useMemo(() => calcScore(checked), [checked]);

  useEffect(() => {
    const onScroll = () => setShowStickyScore(window.scrollY > 280);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const saveTrade = async () => {
    if (!pair || !tradeDate) { alert('Completeaza pair-ul si data.'); return; }
    const trade = {
      userId: user.uid,
      pair: pair.toUpperCase(),
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
      {showStickyScore && (
        <div className="sticky-score" style={{ borderColor: scoreColor }}>
          <div className="sticky-score-inner">
            <span style={{ fontWeight: 700, fontSize: 15 }}>Score: <span style={{ color: scoreColor }}>{score.percentage}%</span></span>
            <span style={{ color: scoreColor, fontWeight: 700, fontSize: 13 }}>{score.setupLabel}</span>
          </div>
          <div className="score-bar-wrap">
            <div className="score-bar-fill" style={{ width: `${score.percentage}%`, background: scoreColor }} />
          </div>
        </div>
      )}

      {/* Score Hero */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="score-number" style={{ background: `linear-gradient(135deg, ${score.setupColor} 0%, #00ccff 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {score.percentage}%
        </div>
        {score.checkedCount > 0 && (
          <div className="score-label mt-2" style={{ color: scoreColor }}>{score.setupLabel}</div>
        )}
        {score.checkedCount > 0 && score.hasMissingRequired && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <div className="missing-required">⚠ Conditii obligatorii lipsa</div>
          </div>
        )}
        <div className="score-bar-wrap" style={{ marginTop: 20 }}>
          <div className="score-bar-fill" style={{ width: `${score.percentage}%`, background: scoreColor }} />
        </div>
        <div className="bonus-bar-wrap" style={{ marginTop: 12 }}>
          <span className="bonus-label">Bonus</span>
          <div className="bonus-track"><div className="bonus-fill" style={{ width: `${score.bonusPercentage}%` }} /></div>
          <span className="bonus-pct">{score.bonusPercentage}%</span>
        </div>
        <p className="text-muted text-sm mt-3">{score.checkedCount} conditii bifate</p>
        <button className="btn btn-secondary btn-sm mt-3" onClick={() => setChecked({})}>Clear all</button>
      </div>

      {/* Checklist Grid */}
      <div className="checklist-grid">
        {SECTIONS.map(section => (
          <div className="section-card" key={section.title}>
            <div className="section-header">{section.title}</div>
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
                    {item.isRequired && <span className="required-badge">Required</span>}
                    {item.isBonus && !item.isRequired && <span className="bonus-badge">Bonus</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Save Trade */}
        <div className="card">
          <div className="card-title">Salveaza trade</div>
          <div className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label">Pair</label>
              <input className="form-input" placeholder="ex: EURUSD" value={pair} onChange={e => setPair(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Directie</label>
              <div className="dir-btns">
                <button className={`dir-btn ${tradeDirection === 'Long' ? 'active-long' : ''}`} onClick={() => setTradeDirection('Long')}>📈 Long</button>
                <button className={`dir-btn ${tradeDirection === 'Short' ? 'active-short' : ''}`} onClick={() => setTradeDirection('Short')}>📉 Short</button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data</label>
                <input className="form-input" type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)} />
              </div>
              {mode === 'backtest' && (
                <div className="form-group">
                  <label className="form-label">Risk:Reward</label>
                  <input className="form-input" placeholder="ex: 2.5" value={riskReward} onChange={e => setRiskReward(e.target.value)} />
                </div>
              )}
            </div>
            <button className="btn btn-primary btn-lg btn-full mt-2" onClick={saveTrade}>
              {mode === 'backtest' ? '🔬 Salveaza Backtest' : '💾 Salveaza Trade'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── TRADE DETAIL MODAL ───────────────────────────────────────────────────────
function TradeDetailModal({ trade, onClose, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [localTrade, setLocalTrade] = useState({ ...trade });
  const [showUnsaved, setShowUnsaved] = useState(false);
  const score = useMemo(() => calcScore(localTrade.checked || {}), [localTrade.checked]);

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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Trade Details — {trade.pair}</h2>
          <div className="flex gap-2">
            <button className="btn btn-danger btn-icon" onClick={() => onDelete(trade.id)}><Icon.Trash /></button>
            <button className="btn btn-secondary btn-icon" onClick={() => setEditing(!editing)} style={editing ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}><Icon.Edit /></button>
            <button className="btn btn-ghost btn-icon" onClick={handleClose}><Icon.Close /></button>
          </div>
        </div>

        <div className="flex gap-3 items-center mb-4" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{localTrade.pair}</span>
          <span style={{ color: localTrade.tradeDirection === 'Long' ? 'var(--accent)' : 'var(--red)', fontWeight: 700 }}>
            {localTrade.tradeDirection === 'Long' ? '📈 Long' : '📉 Short'}
          </span>
          {editing ? (
            <select value={localTrade.tradeResult} onChange={e => setLocalTrade(p => ({ ...p, tradeResult: e.target.value }))}
              className="form-input" style={{ padding: '6px 12px', width: 'auto' }}>
              {['On going', 'Win', 'Loss', 'Breakeven'].map(r => <option key={r}>{r}</option>)}
            </select>
          ) : (
            <ResultBadge result={localTrade.tradeResult} />
          )}
          <span className="text-muted text-sm">{localTrade.tradeDate}</span>
        </div>

        {/* Score bars */}
        <div style={{ marginBottom: 20 }}>
          <StatBar label="Setup Score" value={score.percentage} color={scoreColor} />
          <div className="bonus-bar-wrap">
            <span className="bonus-label">Bonus</span>
            <div className="bonus-track"><div className="bonus-fill" style={{ width: `${score.bonusPercentage}%` }} /></div>
            <span className="bonus-pct">{score.bonusPercentage}%</span>
          </div>
        </div>

        {/* Checklist items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {SECTIONS.map(section => (
            <div key={section.title}>
              <div className="card-title">{section.title}</div>
              <div className="flex flex-col gap-2">
                {section.items.map(item => {
                  const id = `${section.title}-${item.name}`;
                  const isChecked = localTrade.checked?.[id] || false;
                  return (
                    <label key={id}
                      className={`check-item ${isChecked ? (item.isBonus ? 'checked-bonus' : 'checked') : ''}`}
                      style={{ cursor: editing ? 'pointer' : 'default', opacity: editing ? 1 : 0.8 }}
                      onClick={() => editing && toggleItem(id, !isChecked)}>
                      <div className={`check-box ${isChecked ? (item.isBonus ? 'checked-bonus' : 'checked') : ''}`}>
                        <Icon.Check />
                      </div>
                      <span className="check-name" style={{ fontSize: 12 }}>{item.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="form-group mb-4">
          <label className="form-label">Note</label>
          <textarea className="form-input" rows={4} disabled={!editing}
            style={{ resize: 'vertical', opacity: editing ? 1 : 0.7 }}
            value={localTrade.note || ''}
            onChange={e => setLocalTrade(p => ({ ...p, note: e.target.value }))}
            placeholder="Note despre acest trade..." />
        </div>

        {editing && (
          <button className="btn btn-primary btn-lg btn-full" onClick={handleSave}>Salveaza modificarile</button>
        )}
      </div>

      {showUnsaved && (
        <div className="modal-overlay" style={{ zIndex: 300 }}>
          <div className="modal modal-sm">
            <h3 style={{ marginBottom: 10 }}>Modificari nesalvate</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>Vrei sa salvezi inainte de a inchide?</p>
            <div className="flex gap-3" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={async () => { await handleSave(); setShowUnsaved(false); onClose(); }}>Salveaza</button>
              <button className="btn btn-danger" onClick={() => { setShowUnsaved(false); onClose(); }}>Renunta</button>
              <button className="btn btn-secondary" onClick={() => setShowUnsaved(false)}>Anuleaza</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────
function HistoryPage({ trades, setSavedTrades, mode }) {
  const [openedId, setOpenedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const filtered = trades.filter(t => t.tradeMode === mode);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'trades', id));
    setSavedTrades(prev => prev.filter(t => t.id !== id));
    setDeleteId(null); setOpenedId(null);
  };

  const handleSave = async (updated) => {
    await updateDoc(doc(db, 'trades', updated.id), updated);
    setSavedTrades(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const openedTrade = filtered.find(t => t.id === openedId);

  return (
    <>
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p className="text-muted" style={{ fontSize: 14 }}>Niciun trade salvat inca.</p>
          <p className="text-muted text-sm mt-2">Completeaza checklist-ul si salveaza primul trade.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(trade => (
            <div key={trade.id} className="trade-row">
              <div>
                <div className="trade-pair">{trade.pair}</div>
                <div className="trade-date">{trade.tradeDate}</div>
              </div>
              <span style={{ color: trade.tradeDirection === 'Long' ? 'var(--accent)' : 'var(--red)', fontWeight: 700, fontSize: 12 }}>
                {trade.tradeDirection === 'Long' ? '📈' : '📉'} {trade.tradeDirection}
              </span>
              <ResultBadge result={trade.tradeResult} />
              <span style={{ fontSize: 13, fontWeight: 700, color: parseInt(trade.percentage) >= 80 ? 'var(--accent)' : parseInt(trade.percentage) >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
                {trade.percentage}%
              </span>
              {mode === 'backtest' && trade.riskReward && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>RR: {trade.riskReward}</span>
              )}
              <div className="flex gap-2">
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(trade.id)}><Icon.Trash /></button>
                <button className="btn btn-secondary btn-sm" onClick={() => setOpenedId(trade.id)}><Icon.Eye /> View</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openedTrade && (
        <TradeDetailModal trade={openedTrade} onClose={() => setOpenedId(null)}
          onDelete={(id) => { setDeleteId(id); setOpenedId(null); }}
          onSave={async (u) => { await handleSave(u); setSavedTrades(prev => prev.map(t => t.id === u.id ? u : t)); }} />
      )}

      {deleteId && (
        <ConfirmModal title="Sterge trade" message="Esti sigur ca vrei sa stergi acest trade? Actiunea este ireversibila."
          onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />
      )}
    </>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ trades, mode }) {
  const [period, setPeriod] = useState('all');
  const [pairFilter, setPairFilter] = useState('all');

  const modeTrades = trades.filter(t => t.tradeMode === mode);
  const pairs = [...new Set(modeTrades.map(t => t.pair))];

  const filtered = useMemo(() => {
    let t = filterByPeriod(modeTrades, period);
    if (pairFilter !== 'all') t = t.filter(tr => tr.pair === pairFilter);
    return t;
  }, [modeTrades, period, pairFilter]);

  const s = useMemo(() => calcStats(filtered), [filtered]);

  const accent = mode === 'backtest' ? 'var(--purple)' : 'var(--accent)';

  return (
    <>
      {/* Filters */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {[['all', 'Tot timpul'], ['30', '30 zile'], ['7', '7 zile']].map(([v, l]) => (
            <button key={v} className={`filter-chip ${period === v ? 'active' : ''}`} onClick={() => setPeriod(v)}>{l}</button>
          ))}
        </div>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <button className={`filter-chip ${pairFilter === 'all' ? 'active' : ''}`} onClick={() => setPairFilter('all')}>Toate pair-urile</button>
          {pairs.map(p => (
            <button key={p} className={`filter-chip ${pairFilter === p ? 'active' : ''}`} onClick={() => setPairFilter(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid mb-4">
        {[
          { label: 'Total trades', value: s.total, color: 'var(--text-primary)', sub: 'closed' },
          { label: 'Win Rate', value: `${s.winRate}%`, color: 'var(--accent)', sub: `${s.wins} wins` },
          { label: 'Loss Rate', value: `${s.lossRate}%`, color: 'var(--red)', sub: `${s.losses} losses` },
          { label: 'Breakeven', value: s.be, color: 'var(--yellow)', sub: `${s.beRate}%` },
          { label: 'On Going', value: s.ongoing, color: 'var(--blue)', sub: 'in desfasurare' },
          { label: 'Avg Score', value: `${s.avgScore}%`, color: s.avgScore >= 80 ? 'var(--accent)' : s.avgScore >= 60 ? 'var(--yellow)' : 'var(--red)', sub: 'setup quality' },
          ...(mode === 'backtest' ? [{ label: 'Avg R:R', value: s.avgRR, color: 'var(--purple)', sub: 'risk:reward' }] : []),
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Direction */}
        <div className="card">
          <div className="card-title">Directie — Long vs Short</div>
          <StatBar label="📈 Long" value={s.longPct} color="var(--accent)" sub={`${filtered.filter(t=>t.tradeDirection==='Long').length} trades`} />
          <StatBar label="📉 Short" value={s.shortPct} color="var(--red)" sub={`${filtered.filter(t=>t.tradeDirection==='Short').length} trades`} />
        </div>

        {/* Win rate direction */}
        <div className="card">
          <div className="card-title">Win Rate: Long vs Short</div>
          <StatBar label="📈 Long win rate" value={s.wrLong} color="var(--accent)" />
          <StatBar label="📉 Short win rate" value={s.wrShort} color="var(--red)" />
        </div>

        {/* Win rate per score */}
        <div className="card">
          <div className="card-title">Win Rate per Setup Score</div>
          <StatBar label={`Weak <60%`} value={s.wrWeak} color="var(--red)" sub={`${s.weakCount} trades`} />
          <StatBar label={`Good 60–79%`} value={s.wrGood} color="var(--yellow)" sub={`${s.goodCount} trades`} />
          <StatBar label={`Strong ≥80%`} value={s.wrStrong} color="var(--accent)" sub={`${s.strongCount} trades`} />
        </div>

        {/* Results distribution */}
        <div className="card">
          <div className="card-title">Distributie rezultate</div>
          {[
            ['Win', s.winRate, 'var(--accent)', s.wins],
            ['Loss', s.lossRate, 'var(--red)', s.losses],
            ['Breakeven', s.beRate, 'var(--yellow)', s.be],
          ].map(([l, v, c, n]) => (
            <StatBar key={l} label={l} value={v} color={c} sub={`${n} trades`} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── AI COACH PAGE ────────────────────────────────────────────────────────────
function AICoachPage({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salut! Sunt AI-ul tau de trading. Poți sa îmi explici strategia ta de Forex — cum identifici trend-ul, S/R, entry-urile. Cu cat imi explici mai mult, cu atat voi fi mai precis in semnale.',
      time: new Date().toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' }),
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
    return userMsgs || 'Strategia nu a fost definita inca.';
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim(), time: new Date().toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const aiChat = httpsCallable(functions, 'aiChat');
      const apiMessages = [...messages, userMsg]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const systemPrompt = `Esti un trading coach expert in Forex. Asculti strategia utilizatorului, pui intrebari pertinente pentru a intelege mai bine abordarea sa, si memorezi totul pentru a putea genera semnale precise. Esti concis, profesionist si vorbesti in romana.`;
      const result = await aiChat({ messages: apiMessages, systemPrompt });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.data.reply,
        time: new Date().toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Eroare: ' + err.message, time: '' }]);
    }
    setLoading(false);
  };

  const generateSignal = async () => {
    if (!signalPair) { alert('Introdu pair-ul.'); return; }
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
      alert('Eroare la generarea semnalului: ' + err.message);
    }
    setSignalLoading(false);
  };

  const signalScoreColor = signal ? (signal.score >= 80 ? 'var(--accent)' : signal.score >= 60 ? 'var(--yellow)' : 'var(--red)') : 'var(--text-muted)';

  return (
    <div className="chat-layout">
      {/* Chat area */}
      <div className="chat-area">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg msg-${msg.role === 'user' ? 'user' : 'ai'}`}>
              <div className="msg-avatar">{msg.role === 'user' ? 'TU' : 'AI'}</div>
              <div>
                <div className="msg-bubble">{msg.content}</div>
                {msg.time && <div className="msg-time">{msg.time}</div>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg msg-ai">
              <div className="msg-avatar">AI</div>
              <div className="msg-bubble">
                <div className="loading-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <textarea className="chat-input" rows={2}
            placeholder="Explica-mi strategia ta... (ex: caut exhaustion pe weekly la S/R, confirm pe daily cu LH/HL...)"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>
            <Icon.Send />
          </button>
        </div>
      </div>

      {/* Signal panel */}
      <div className="signal-panel">
        <div className="signal-panel-header">⚡ Genereaza semnal</div>
        <div className="signal-panel-body">
          <div className="signal-form">
            <div className="form-group">
              <label className="form-label">Pair</label>
              <input className="form-input" placeholder="ex: EURUSD" value={signalPair} onChange={e => setSignalPair(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Timeframe principal</label>
              <select className="form-input" value={signalTF} onChange={e => setSignalTF(e.target.value)}>
                {['W1', 'D1', 'H4', 'H2', 'H1', 'M30', 'M15'].map(tf => <option key={tf}>{tf}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={generateSignal} disabled={signalLoading}>
              {signalLoading ? <><div className="loading-dots"><span /><span /><span /></div></> : '⚡ Analizeaza setup'}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <div className="score-bar-wrap" style={{ flex: 1, marginTop: 0 }}>
                  <div className="score-bar-fill" style={{ width: `${signal.score}%`, background: signalScoreColor }} />
                </div>
                <span style={{ color: signalScoreColor, fontWeight: 700, fontSize: 13 }}>{signal.score}%</span>
              </div>

              <div className="signal-levels mt-3">
                <div className="level-row">
                  <span className="level-label">Entry</span>
                  <span className="level-value" style={{ color: 'var(--accent)' }}>{signal.entry}</span>
                </div>
                <div className="level-row">
                  <span className="level-label">Stop Loss</span>
                  <span className="level-value" style={{ color: 'var(--red)' }}>{signal.stopLoss}</span>
                </div>
                <div className="level-row">
                  <span className="level-label">Take Profit</span>
                  <span className="level-value" style={{ color: 'var(--blue)' }}>{signal.takeProfit}</span>
                </div>
                <div className="level-row">
                  <span className="level-label">R:R</span>
                  <span className="level-value" style={{ color: 'var(--purple)' }}>{signal.riskReward}</span>
                </div>
              </div>

              {signal.confluences?.length > 0 && (
                <div className="mt-3">
                  <div className="form-label mb-2">Confluente</div>
                  <div className="signal-confluences">
                    {signal.confluences.map((c, i) => <span key={i} className="confluence-tag">{c}</span>)}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <div className="form-label mb-2">Analiza AI</div>
                <p className="signal-reasoning">{signal.reasoning}</p>
              </div>

              {signal.checkedItems?.length > 0 && (
                <div className="mt-3">
                  <div className="form-label mb-2">Checklist completat automat</div>
                  <div className="flex flex-col gap-2">
                    {ALL_ITEMS.slice(0, 6).map(item => {
                      const isChecked = signal.checkedItems.includes(item.id);
                      return (
                        <div key={item.id} className={`check-item ${isChecked ? 'checked' : ''}`} style={{ cursor: 'default', padding: '8px 12px' }}>
                          <div className={`check-box ${isChecked ? 'checked' : ''}`}><Icon.Check /></div>
                          <span className="check-name" style={{ fontSize: 11 }}>{item.section} — {item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
    if (password !== confirmPassword) { alert('Parolele nu coincid.'); return; }
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
          <div className="auth-logo-text">MyEdge</div>
          <div className="auth-logo-sub">Trading Intelligence Platform</div>
        </div>

        <div className="auth-field">
          <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="auth-field" style={{ position: 'relative' }}>
          <input className="auth-input" type={showPw ? 'text' : 'password'} placeholder="Parola" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            {showPw ? <Icon.EyeOff /> : <Icon.Eye />}
          </button>
        </div>

        {isRegister && (
          <div className="auth-field">
            <input className="auth-input"
              type="password" placeholder="Confirma parola" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
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
          {isRegister ? 'Creeaza cont' : 'Login'}
        </button>

        <div className="auth-divider">sau</div>

        <button className="btn-google" onClick={loginGoogle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
          Continua cu Google
        </button>

        <div className="auth-switch">
          {isRegister ? (
            <>Ai deja cont? <a onClick={() => setIsRegister(false)}>Login</a></>
          ) : (
            <>Nu ai cont? <a onClick={() => setIsRegister(true)}>Creeaza unul</a></>
          )}
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

  useEffect(() => {
    if (user) loadTrades();
  }, [user]);

  const loadTrades = async () => {
    const q = query(collection(db, 'trades'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const trades = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    trades.sort((a, b) => new Date(b.tradeDate) - new Date(a.tradeDate));
    setSavedTrades(trades);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: 18 }}>
      MyEdge
    </div>
  );

  if (!user) return <AuthPage />;

  const nav = [
    { group: 'Trading Live', items: [
      { id: 'checklist-live', label: 'Checklist', icon: <Icon.Checklist /> },
      { id: 'history-live', label: 'History', icon: <Icon.History /> },
      { id: 'dashboard-live', label: 'Dashboard', icon: <Icon.Dashboard /> },
    ]},
    { group: 'Backtest', items: [
      { id: 'checklist-backtest', label: 'Checklist', icon: <Icon.Checklist /> },
      { id: 'history-backtest', label: 'History', icon: <Icon.History /> },
      { id: 'dashboard-backtest', label: 'Dashboard', icon: <Icon.Dashboard /> },
    ]},
    { group: 'AI Coach', items: [
      { id: 'ai', label: 'AI Coach', icon: <Icon.AI /> },
    ]},
  ];

  const pageTitles = {
    'checklist-live': { title: 'Checklist', sub: 'Live Trading' },
    'history-live': { title: 'Trade History', sub: 'Live Trading' },
    'dashboard-live': { title: 'Dashboard', sub: 'Live Trading' },
    'checklist-backtest': { title: 'Checklist', sub: 'Backtest' },
    'history-backtest': { title: 'Trade History', sub: 'Backtest' },
    'dashboard-backtest': { title: 'Dashboard', sub: 'Backtest' },
    'ai': { title: 'AI Coach', sub: 'Antrenament & Semnale' },
  };

  const { title, sub } = pageTitles[activePage] || {};
  const initials = (user.displayName || user.email || 'T').charAt(0).toUpperCase();

  return (
    <div className="app-layout">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">MyEdge</div>
          <div className="logo-sub">Trading Intelligence</div>
        </div>

        <div className="sidebar-user">
          {user.photoURL
            ? <img src={user.photoURL} alt="" className="user-avatar" />
            : <div className="user-avatar-placeholder">{initials}</div>
          }
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
          <button className="btn-logout" onClick={() => signOut(auth)}>
            <Icon.Logout /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}><Icon.Menu /></button>
          <div>
            <div className="topbar-title">{title}</div>
            {sub && <div className="topbar-sub">{sub}</div>}
          </div>
        </div>

        <div className="page-body">
          {activePage === 'checklist-live' && (
            <ChecklistPage checked={liveChecked} setChecked={setLiveChecked}
              savedTrades={savedTrades} setSavedTrades={setSavedTrades} user={user} mode="live" />
          )}
          {activePage === 'checklist-backtest' && (
            <ChecklistPage checked={backtestChecked} setChecked={setBacktestChecked}
              savedTrades={savedTrades} setSavedTrades={setSavedTrades} user={user} mode="backtest" />
          )}
          {activePage === 'history-live' && (
            <HistoryPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="live" />
          )}
          {activePage === 'history-backtest' && (
            <HistoryPage trades={savedTrades} setSavedTrades={setSavedTrades} mode="backtest" />
          )}
          {activePage === 'dashboard-live' && (
            <DashboardPage trades={savedTrades} mode="live" />
          )}
          {activePage === 'dashboard-backtest' && (
            <DashboardPage trades={savedTrades} mode="backtest" />
          )}
          {activePage === 'ai' && <AICoachPage user={user} />}
        </div>
      </main>
    </div>
  );
}