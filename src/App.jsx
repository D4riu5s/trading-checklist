import { db } from './firebase';

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'

import React, { useState } from 'react';

export default function TradingChecklistApp() {
  const deleteTrade = async (tradeId) => {
  try {
    await deleteDoc(doc(db, 'trades', tradeId));

    setSavedTrades((prev) =>
      prev.filter((trade) => trade.id !== tradeId)
    );

    console.log('Trade deleted:', tradeId);
  } catch (error) {
    console.error('Error deleting trade:', error);
  }
};
  const sections = [
    {
      title: 'Weekly',
      items: [
        { name: 'Trend', weight: 5.5 },
        { name: 'Exhaustion', weight: 5.5 },
        { name: 'At S/R - rejected', weight: 5.5 },
        { name: 'Rejection from previous structure', weight: 5.5 },
        { name: 'Candlestick formation', weight: 5.5 },
        { name: 'Break & retest pattern', weight: 5.5 },
        { name: 'At LH/HL', weight: 5.5 },
        { name: 'Trendline', weight: 2.75 },
      ],
    },
    {
      title: 'Daily',
      items: [
        { name: 'Trend', weight: 5.5 },
        { name: 'Exhaustion', weight: 5.5 },
        { name: 'At S/R - rejected', weight: 5.5 },
        { name: 'Rejection from previous structure', weight: 5.5 },
        { name: 'Candlestick formation', weight: 5.5 },
        { name: 'Break & retest pattern', weight: 5.5 },
        { name: 'At LH/HL', weight: 5.5 },
        { name: 'EMA retest', weight: 5.5 },
        { name: 'Trendline', weight: 2.75 },
      ],
    },
    {
      title: 'H4',
      items: [
        { name: 'Break & retest pattern + S/R', weight: 5.5 },
        { name: 'Trendline', weight: 2.75 },
        { name: 'Trend', weight: 2.75 },
      ],
    },
    {
      title: 'H4 / H2 / H1',
      items: [
        { name: 'Candlestick formation (confirmation)', weight: 5.5 },
      ],
    },
  ];

  const allItems = sections.flatMap((section) =>
    section.items.map((item) => ({
      id: `${section.title}-${item.name}`,
      label: item.name,
      weight: item.weight,
    }))
  );

  const [checked, setChecked] = useState({});

  const [pair, setPair] = useState('');
const [tradeDate, setTradeDate] = useState('');
const [tradeResult, setTradeResult] = useState('Win');
const [savedTrades, setSavedTrades] = useState([]);
const [openedTrade, setOpenedTrade] = useState(null);
const [historyOpen, setHistoryOpen] = useState(false);
const [deletePopupOpen, setDeletePopupOpen] = useState(false);
const [tradeToDelete, setTradeToDelete] = useState(null);
const [showStickyScore, setShowStickyScore] = useState(false);


React.useEffect(() => {
  loadTrades();
}, []);

React.useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 250) {
      setShowStickyScore(true);
    } else {
      setShowStickyScore(false);
    }
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

const loadTrades = async () => {
  const querySnapshot = await getDocs(
    collection(db, 'trades')
  );

  const trades = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setSavedTrades(trades.reverse());
};
  

  const percentage = allItems.reduce((acc, item) => {
  if (checked[item.id]) {
    return acc + item.weight;
  }

  return acc;
}, 0).toFixed(0);
  const checkedItems = Object.values(checked).filter(Boolean).length;

  let setupLabel = 'Weak Setup';
  let setupColor = '#ff4d4d';

  if (percentage >= 80) {
    setupLabel = 'Strong Setup';
    setupColor = '#00ff99';
  } else if (percentage >= 60) {
    setupLabel = 'Good Setup';
    setupColor = '#ffd633';
  }

  const toggleCheck = (id) => {
    setChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const saveTrade = async () => {
  const trade = {
    pair,
    tradeDate,
    tradeResult,
    percentage,
    checked,
    createdAt: Date.now(),
  };


  const docRef = await addDoc(
  collection(db, 'trades'),
  trade
);

setSavedTrades((prev) => [
  {
    id: docRef.id,
    ...trade,
  },
  ...prev,
]);

  setPair('');
  setTradeDate('');
  setTradeResult('Win');
};

  const clearAllChecks = () => {
    setChecked({});
  };

  return (
    <>
    {showStickyScore && (
  <div
    style={{
      position: 'fixed',
      top: '15px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '500px',
      background: 'rgba(18, 26, 43, 0.92)',
      backdropFilter: 'blur(12px)',
      padding: '16px',
      borderRadius: '20px',
      zIndex: 9999,
      border: `2px solid ${setupColor}`,
      boxShadow: `0 0 25px ${setupColor}40`,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}
    >
      <span
        style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '17px',
        }}
      >
        Score: {percentage}%
      </span>

      <span
        style={{
          color: setupColor,
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        {setupLabel}
      </span>
    </div>

    <div
      style={{
        width: '100%',
        height: '12px',
        background: '#1e293b',
        borderRadius: '999px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          background: setupColor,
          borderRadius: '999px',
          transition: '0.3s ease',
          boxShadow: `0 0 12px ${setupColor}`,
        }}
      />
    </div>
  </div>
)}

<div
      style={{
        minHeight: '100vh',
        background: '#0b1020',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        padding: '30px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: '#121a2b',
            padding: '30px',
            borderRadius: '20px',
            marginBottom: '30px',
            boxShadow: '0 0 25px rgba(0,0,0,0.4)',
            border: `2px solid ${setupColor}`,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              marginBottom: '20px',
              lineHeight: '1.3',
            }}
          >
            Trading Checklist
          </h1>

          <h2 style={{ fontSize: '70px', margin: 0 }}>
            {percentage}%
          </h2>

          <h3
            style={{
              color: setupColor,
              fontSize: '32px',
              marginTop: '10px',
            }}
          >
            {setupLabel}
          </h3>

          <div
            style={{
              width: '100%',
              height: '18px',
              background: '#1f2937',
              borderRadius: '20px',
              overflow: 'hidden',
              marginTop: '25px',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                background: setupColor,
                transition: '0.3s',
              }}
            />
          </div>

          <p style={{ marginTop: '15px', color: '#9ca3af' }}>
            {checkedItems} conditions checked
          </p>

          <button
            onClick={clearAllChecks}
            style={{
              background: '#1f2937',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            Clear All Checks
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '25px',
          }}
        >
          {sections.map((section) => (
            <div
              key={section.title}
              style={{
                background: '#121a2b',
                padding: '25px',
                borderRadius: '20px',
                boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              }}
            >
              <h2
                style={{
                  marginBottom: '20px',
                  fontSize: '28px',
                  borderBottom: '1px solid #2d3748',
                  paddingBottom: '10px',
                }}
              >
                {section.title}
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}
              >
                {section.items.map((item) => {
                  const id = `${section.title}-${item.name}`;
                  const isChecked = checked[id] || false;

                  return (
                    <label
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: isChecked
                          ? '#1e293b'
                          : '#172033',
                        padding: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: '0.2s',
                        border: isChecked
                          ? `1px solid ${setupColor}`
                          : '1px solid transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                        }}
                      />

                      <span>{item.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <div
  style={{
    marginTop: '40px',
    background: '#121a2b',
    padding: '25px',
    borderRadius: '20px',
  }}
>
  <h2 style={{ marginBottom: '20px' }}>
    Save Trade
  </h2>

  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    }}
  >
    <input
      type="text"
      placeholder="Pair (ex: EURUSD)"
      value={pair}
      onChange={(e) => setPair(e.target.value)}
      style={{
        padding: '14px',
        borderRadius: '12px',
        border: 'none',
        background: '#1e293b',
        color: 'white',
      }}
    />

    <input
      type="date"
      value={tradeDate}
      onChange={(e) => setTradeDate(e.target.value)}
      style={{
        padding: '14px',
        borderRadius: '12px',
        border: 'none',
        background: '#1e293b',
        color: 'white',
      }}
    />

    <select
      value={tradeResult}
      onChange={(e) => setTradeResult(e.target.value)}
      style={{
        padding: '14px',
        borderRadius: '12px',
        border: 'none',
        background: '#1e293b',
        color: 'white',
      }}
    >
      <option>Win</option>
      <option>Lose</option>
      <option>Breakeven</option>
    </select>

    <button
      onClick={saveTrade}
      style={{
        background: '#00ff99',
        color: '#0b1020',
        border: 'none',
        padding: '15px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '18px',
      }}
    >
      Save Trade
    </button>
  </div>
</div>

<div
  style={{
    marginTop: '40px',
  }}
>
  <div
  style={{
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
  }}
>
  <button
    onClick={() => setHistoryOpen(true)}
    style={{
      background: '#1e293b',
      color: 'white',
      border: 'none',
      padding: '16px 30px',
      borderRadius: '14px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 0 20px rgba(0,0,0,0.3)',
    }}
  >
    Trade History
  </button>
</div>

{historyOpen && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 998,
      padding: '20px',
    }}
  >
    <div
      style={{
        background: '#121a2b',
        width: '100%',
        maxWidth: '950px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '20px',
        padding: '25px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
        }}
      >
        <h2>Trade History</h2>

        <button
          onClick={() => setHistoryOpen(false)}
          style={{
            background: '#1e293b',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        {savedTrades.map((trade) => (
          <div
            key={trade.id}
            style={{
              background: '#172033',
              padding: '18px',
              borderRadius: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                {trade.pair}
              </h3>

              <p style={{ color: '#9ca3af' }}>
                {trade.tradeResult}
              </p>
            </div>

            <div>
              <p>Date:</p>
              <strong>{trade.tradeDate}</strong>
            </div>

            <div>
              <p>Setup Score:</p>
              <strong>{trade.percentage}%</strong>
            </div>

            <div
  style={{
    display: 'flex',
    gap: '10px',
  }}
>
  <button
  onClick={() => {
  setTradeToDelete(trade.id);
  setDeletePopupOpen(true);
}}
    style={{
      background: '#ff3b30',
      color: 'white',
      border: 'none',
      padding: '12px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }}
  >
    Delete
  </button>

  <button
    onClick={() => setOpenedTrade(trade.id)}
    style={{
      background: '#00ff99',
      color: '#0b1020',
      border: 'none',
      padding: '12px 18px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }}
  >
    View Details
  </button>
</div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    {openedTrade && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
      padding: '20px',
    }}
  >
    <div
      style={{
        background: '#121a2b',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '20px',
        padding: '25px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
        }}
      >
        <h2>Trade Details</h2>

        <button
          onClick={() => setOpenedTrade(null)}
          style={{
            background: '#1e293b',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {savedTrades
        .filter((trade) => trade.id === openedTrade)
        .map((trade) => (
          <div key={trade.id}>
            <h3>
              {trade.pair} • {trade.tradeResult}
            </h3>

            <p>Date: {trade.tradeDate}</p>

            <p>Setup Score: {trade.percentage}%</p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginTop: '25px',
              }}
            >
              {sections.map((section) => (
                <div key={section.title}>
                  <h4
                    style={{
                      color: '#9ca3af',
                      marginBottom: '12px',
                    }}
                  >
                    {section.title}
                  </h4>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {section.items.map((item) => {
                      const itemId = `${section.title}-${item.name}`;
                      const wasChecked =
                        trade.checked[itemId];

                      return (
                        <div
                          key={itemId}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: wasChecked
                              ? '#1e293b'
                              : '#172033',
                            border: wasChecked
                              ? '1px solid #00ff99'
                              : '1px solid #2d3748',
                            color: wasChecked
                              ? '#00ff99'
                              : '#9ca3af',
                            fontSize: '14px',
                          }}
                        >
                          {item.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  </div>
)}
  </div>
</div>
        </div>
        {deletePopupOpen && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: '#121a2b',
        padding: '30px',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ marginBottom: '15px' }}>
        Delete Trade
      </h2>

      <p
        style={{
          color: '#9ca3af',
          marginBottom: '25px',
        }}
      >
        Are you sure you want to delete this trade?
      </p>

      <div
        style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
        }}
      >
        <button
  onClick={async () => {
  await deleteTrade(tradeToDelete);

  setDeletePopupOpen(false);
  setTradeToDelete(null);
}}
          style={{
            background: '#ff3b30',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Yes
        </button>

        <button
  onClick={() => {
    setDeletePopupOpen(false);
    setTradeToDelete('');
  }}
          style={{
            background: '#1e293b',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}
      </div>
  </>
  ):