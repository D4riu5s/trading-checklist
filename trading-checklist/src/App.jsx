import React, { useState } from 'react';

export default function TradingChecklistApp() {
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

  const clearAllChecks = () => {
    setChecked({});
  };

  return (
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
        </div>
      </div>
    </div>
  );
}