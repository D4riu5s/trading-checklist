import { db } from './firebase';

import './App.css';

import { FaTrash, FaEdit, FaSignOutAlt, FaClipboardCheck, FaHistory, FaGoogle, FaEye, FaEyeSlash, FaBars } from 'react-icons/fa';

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'

import React, { useState } from 'react';

import { auth } from './firebase';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
signInWithPopup,
browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth';

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

const updateTrade = async () => {
  if (!editingTrade) return;

  try {
    const updatedTrade = {
  ...editingTrade,
  note: tradeNote,
  checked: editingChecked,
  percentage:
    editingTrade.percentage,
  bonusPercentage:
    editingTrade.bonusPercentage,
  tradeResult,
};

    await updateDoc(
      doc(db, 'trades', editingTrade.id),
      updatedTrade
    );

    setSavedTrades((prev) =>
      prev.map((trade) =>
        trade.id === editingTrade.id
          ? updatedTrade
          : trade
      )
    );

    setEditPopupOpen(false);
    setEditingTrade(null);
  } catch (error) {
    console.error('Error updating trade:', error);
  }
};

  const sections = [
    {
      title: 'Weekly',
      items: [
        { name: 'Trend', weight: 0, isBonus: false, isRequired: false, },
        { name: 'Exhaustion', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'At S/R - rejected', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'Candlestick formation', weight:  7.1428571429, isBonus: false, isRequired: false, },
        { name: 'Break & retest pattern', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'At LH/HL', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'Rejection from previous structure', weight: 20, isBonus: true, isRequired: false, },
        { name: 'Trendline', weight: 20, isBonus: true, isRequired: false, },
      ],
    },
    {
      title: 'Daily',
      items: [
        { name: 'Trend', weight: 0, isBonus: false, isRequired: false, },
        { name: 'Exhaustion', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'At S/R', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'Candlestick formation', weight:  7.1428571429, isBonus: false, isRequired: false, },
        { name: 'Break & retest pattern', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'At LH/HL', weight: 7.1428571429, isBonus: false, isRequired: true, },
        { name: 'EMA retest', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'Rejection from previous structure', weight: 20, isBonus: true, isRequired: false, },
        { name: 'Trendline', weight: 20, isBonus: true, isRequired: false, },
      ],
    },
    {
      title: 'H4',
      items: [
        { name: 'Break & retest pattern + S/R', weight: 7.1428571429, isBonus: false, isRequired: true, },
        { name: 'Trend', weight: 7.1428571429, isBonus: false, isRequired: false, },
        { name: 'Trendline', weight: 20, isBonus: true, isRequired: false, },
      ],
    },
    {
      title: 'H4 / H2 / H1',
      items: [
        { name: 'Candlestick formation (confirmation)', weight: 7.1428571429, isBonus: false, isRequired: true, },
      ],
    },
  ];

  const allItems = sections.flatMap(
  (section) =>
    section.items.map((item) => ({
      id: `${section.title}-${item.name}`,
      label: item.name,
      weight: item.weight,
      isBonus: item.isBonus,
    }))
);

  const [checked, setChecked] = useState({});
  const [editingChecked, setEditingChecked] = useState({});

  const [pair, setPair] = useState('');
const [tradeDate, setTradeDate] = useState('');
const [tradeResult, setTradeResult] = useState('Win');
const [savedTrades, setSavedTrades] = useState([]);
const [openedTrade, setOpenedTrade] = useState(null);
const [historyOpen, setHistoryOpen] = useState(false);
const [deletePopupOpen, setDeletePopupOpen] = useState(false);
const [tradeToDelete, setTradeToDelete] = useState(null);
const [showStickyScore, setShowStickyScore] = useState(false);
const [isEditingTrade, setIsEditingTrade] = useState(false);
const [activePage, setActivePage] = useState('checklist');
const [showPassword, setShowPassword] =
  useState(false);
const [password, setPassword] =
  useState('');

const [
  confirmPassword,
  setConfirmPassword
] = useState('');

const passwordsMatch =
  password === confirmPassword;

const isMobile = window.innerWidth < 768;

const [user, setUser] = useState(null);

const [sidebarOpen, setSidebarOpen] =
  useState(false);

const [email, setEmail] = useState('');

const [isRegisterMode, setIsRegisterMode] =
  useState(false);

const [originalTrade, setOriginalTrade] =
  useState(null);

const [
  unsavedChangesPopup,
  setUnsavedChangesPopup,
] = useState(false);

const [rememberMe, setRememberMe] =
  useState(true);


React.useEffect(() => {
  if (user) {
    loadTrades();
  }
}, [user]);

React.useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

  return unsubscribe;
}, []);

  React.useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 250) {
      setShowStickyScore(true);
    } else {
      setShowStickyScore(false);
    }
  };

  window.addEventListener(
    'scroll',
    handleScroll
  );

  return () => {
    window.removeEventListener(
      'scroll',
      handleScroll
    );
  };
}, []);

const loadTrades = async () => {
  if (!user) return;

  const q = query(
    collection(db, 'trades'),
    where('userId', '==', user.uid)
  );

  const querySnapshot =
    await getDocs(q);

  const trades =
    querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  trades.sort(
  (a, b) =>
    new Date(b.tradeDate) -
    new Date(a.tradeDate)
);

setSavedTrades(trades);
};

  const checkedItems = Object.values(checked).filter(Boolean).length;

  const normalItems =
  allItems.filter(
    (item) => !item.isBonus
  );

const totalNormalWeight =
  normalItems.reduce(
    (sum, item) =>
      sum + item.weight,
    0
  );

const checkedNormalWeight =
  normalItems.reduce(
    (sum, item) =>
      checked[item.id]
        ? sum + item.weight
        : sum,
    0
  );

const percentage =
  totalNormalWeight > 0
    ? (
        (checkedNormalWeight /
          totalNormalWeight) *
        100
      ).toFixed(0)
    : 0;

const requiredItems =
  sections.flatMap((section) =>
    section.items
      .filter((item) => item.isRequired)
      .map((item) => ({
        id: `${section.title}-${item.name}`,
      }))
  );

const hasMissingRequired =
  requiredItems.some(
    (item) => !checked[item.id]
  );

let setupLabel = 'Weak setup';
let setupColor = '#ff4d4d';

if (
  checkedItems > 0 &&
  hasMissingRequired
) {
  setupLabel = 'Invalid setup';
  setupColor = '#ff4d4d';
}
else if (percentage >= 80) {
  setupLabel = 'Strong setup';
  setupColor = '#00ff99';
}
else if (percentage >= 60) {
  setupLabel = 'Good setup';
  setupColor = '#ffd633';
}

  const bonusItems =
  allItems.filter(
    (item) => item.isBonus
  );

const totalBonusWeight =
  bonusItems.reduce(
    (sum, item) =>
      sum + item.weight,
    0
  );

const checkedBonusWeight =
  bonusItems.reduce(
    (sum, item) =>
      checked[item.id]
        ? sum + item.weight
        : sum,
    0
  );

const bonusPercentage =
  totalBonusWeight > 0
    ? (
        (checkedBonusWeight /
          totalBonusWeight) *
        100
      ).toFixed(0)
    : 0;

const toggleCheck = (id) => {
  setChecked((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};

  const saveTrade = async () => {

  const trade = {
  userId: user.uid,
  pair,
  tradeDate,
  tradeResult: 'On going',
  percentage,
  bonusPercentage,
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
  setChecked({});
  setTradeResult('On going');
};

  const clearAllChecks = () => {
    setChecked({});
  };

const registerUser = async () => {
  if (password !== confirmPassword) {
    alert(
      'Passwords do not match'
    );
    return;
  }

  try {
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    setConfirmPassword('');
  } catch (error) {
    alert(error.message);
  }
};

const loginUser = async () => {
  try {
    await setPersistence(
      auth,
      rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence
    );

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  } catch (error) {
  console.error(error);
  alert(error.code);
}
};

const logoutUser = async () => {
  await signOut(auth);
};

const loginWithGoogle = async () => {
  try {
    const provider =
      new GoogleAuthProvider();

    await signInWithPopup(
      auth,
      provider
    );
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

if (!user) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b1020',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#121a2b',
          padding: '40px',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#00ff99',
            marginBottom: '40px',
          }}
        >
          MyEdge
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '12px',
            border: 'none',
            background: '#1e293b',
            color: 'white',
            boxSizing: 'border-box',
          }}
        />

        <div
  style={{
    position: 'relative',
    marginBottom: '20px',
  }}
>
  <input
    type={
      showPassword
        ? 'text'
        : 'password'
    }
    placeholder="Password"
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
    style={{
      width: '100%',
      padding: '15px',
      paddingRight: '50px',
      borderRadius: '12px',
      border: 'none',
      background: '#1e293b',
      color: 'white',
      boxSizing: 'border-box',
    }}
  />

  <button
    type="button"
    onClick={() =>
      setShowPassword(
        !showPassword
      )
    }
    style={{
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform:
        'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {showPassword ? (
      <FaEyeSlash />
    ) : (
      <FaEye />
    )}
  </button>
</div>

{isRegisterMode && (
  <>
    <input
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e) =>
        setConfirmPassword(
          e.target.value
        )
      }
      style={{
        width: '100%',
        padding: '15px',
        marginBottom: '8px',
        borderRadius: '12px',
        border:
          confirmPassword.length > 0
            ? passwordsMatch
              ? '2px solid #00ff99'
              : '2px solid #ff3b30'
            : 'none',
        background: '#1e293b',
        color: 'white',
        boxSizing: 'border-box',
      }}
    />

    {confirmPassword.length > 0 && (
      <p
        style={{
          marginTop: '0',
          marginBottom: '20px',
          color: passwordsMatch
            ? '#00ff99'
            : '#ff3b30',
          fontSize: '14px',
        }}
      >
        {passwordsMatch
          ? 'Passwords match'
          : 'Passwords do not match'}
      </p>
    )}
  </>
)}

        <label
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    color: 'white',
  }}
>
  <input
    type="checkbox"
    checked={rememberMe}
    onChange={(e) =>
      setRememberMe(e.target.checked)
    }
  />

  Remember Me
</label>

        <button
          onClick={
            isRegisterMode
              ? registerUser
              : loginUser
          }
          style={{
            width: '100%',
            padding: '15px',
            border: 'none',
            borderRadius: '12px',
            background: '#00ff99',
            color: '#0b1020',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isRegisterMode
            ? 'Create account'
            : 'Login'}
        </button>

        <button
  onClick={loginWithGoogle}
  style={{
    width: '100%',
    padding: '15px',
    marginTop: '12px',
    border: 'none',
    borderRadius: '12px',
    background: '#ffffff',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  }}
>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
    style={{
      width: '20px',
      height: '20px',
    }}
  />

  Continue with Google
</button>

        <p
  style={{
    marginTop: '20px',
    textAlign: 'center',
    color: '#9ca3af',
  }}
>
  {isRegisterMode ? (
    <>
      Already have an account?{' '}
      <span
        onClick={() => {
  setIsRegisterMode(false);
  setConfirmPassword('');
}}
        style={{
          color: '#3b82f6',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        Login
      </span>
    </>
  ) : (
    <>
      Don't have an account?{' '}
      <span
        onClick={() => {
  setIsRegisterMode(true);
  setConfirmPassword('');
}}
        style={{
          color: '#3b82f6',
          textDecoration: 'underline',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        Create one
      </span>
    </>
  )}
</p>
      </div>
    </div>
  );
}

  return (
    <>
    {showStickyScore &&
 activePage === 'checklist' &&
 !openedTrade &&
 !deletePopupOpen && (
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
  }}
>
  
  <div
  style={{
    background: '#121a2b',
    padding: '15px 25px',
    borderBottom: '1px solid #2d3748',
    marginBottom: '25px',
  }}
>
  <div
    style={{
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'flex-start',
      gap: '25px',
      alignItems: 'center',
    }}
  >
    <button
      onClick={() =>
        setSidebarOpen(!sidebarOpen)
      }
      style={{
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
      }}
    >
      <FaBars />
    </button>

    <h2
      style={{
        margin: 0,
        color: '#00ff99',
      }}
    >
      MyEdge
    </h2>

    <div
      style={{
        display: 'flex',
        gap: '10px',
        marginLeft: '20px',
      }}
    >
    </div>

    <button
      onClick={logoutUser}
      style={{
        marginLeft: 'auto',
        background: '#ff3b30',
        color: 'white',
        border: 'none',
        padding: '10px 18px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 'bold',
        gap: '10px',
      }}
    >
      <FaSignOutAlt />
      Logout
    </button>
  </div>
</div>

  <>
  {sidebarOpen && (
    <div
      onClick={() =>
        setSidebarOpen(false)
      }
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background:
          'rgba(0,0,0,0.5)',
        zIndex: 9998,
      }}
    />
  )}

  <div
    style={{
      position: 'fixed',
      top: 0,
      left: sidebarOpen
        ? '0'
        : '-300px',
      width: '280px',
      height: '100vh',
      background: '#121a2b',
      borderRight:
        '1px solid #2d3748',
      padding: '25px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,

      transition:
        'left 0.3s ease',
    }}
    >
      <h2
        style={{
          color: '#00ff99',
          marginTop: 0,
          marginBottom: '30px',
        }}
      >
        MyEdge
      </h2>

      <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '30px',
    padding: '12px',
    background: '#1e293b',
    borderRadius: '14px',
  }}
>
  <img
    src={
      user?.photoURL ||
      'https://via.placeholder.com/50'
    }
    alt="Profile"
    style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #00ff99',
    }}
  />

  <div>
    <div
      style={{
        fontWeight: 'bold',
        color: 'white',
      }}
    >
      {user?.displayName || 'Trader'}
    </div>

    <div
      style={{
        fontSize: '12px',
        color: '#9ca3af',
      }}
    >
      {user?.email}
    </div>
  </div>
</div>

      <button
        onClick={() => {
          setActivePage(
            'checklist'
          );
          setSidebarOpen(false);
        }}
        style={{
          background:
            activePage ===
            'checklist'
              ? '#00ff99'
              : '#1e293b',
          color:
            activePage ===
            'checklist'
              ? '#0b1020'
              : 'white',
          border: 'none',
          padding: '12px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <FaClipboardCheck />
        Checklist
      </button>

      <button
        onClick={() => {
          setActivePage(
            'history'
          );
          setSidebarOpen(false);
        }}
        style={{
          background:
            activePage ===
            'history'
              ? '#00ff99'
              : '#1e293b',
          color:
            activePage ===
            'history'
              ? '#0b1020'
              : 'white',
          border: 'none',
          padding: '12px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <FaHistory />
        Trade History
      </button>

      <button
        onClick={() => {
          logoutUser();
          setSidebarOpen(false);
        }}
        style={{
          marginTop: 'auto',
          background: '#ff3b30',
          color: 'white',
          border: 'none',
          padding: '12px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  </>

{activePage === 'checklist' && (

      <div
        style={{
          width: '100%',
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
            Checklist
          </h1>

          <h2 style={{ fontSize: '70px', margin: 0 }}>
            {percentage}%
          </h2>

          {checkedItems > 0 && (
  <h3
    style={{
      color: setupColor,
      fontSize: '32px',
      marginTop: '10px',
    }}
  >
    {setupLabel}
  </h3>
)}

          {checkedItems > 0 &&
 hasMissingRequired && (
  <p
    style={{
      color: '#ff4d4d',
      fontSize: '14px',
      marginTop: '10px',
      animation:
        'pulseWarning 1.5s infinite',
    }}
  >
    Missing mandatory conditions
  </p>
)}

<div
  style={{
    marginTop: '20px',
  }}
>
  <div
    style={{
      display: 'flex',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    }}
  >
    <span
      style={{
        color: '#a855f7',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
    >
      Bonus
    </span>

    <span
      style={{
        color: '#a855f7',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
    >
      {bonusPercentage}%
    </span>
  </div>

  <div
    style={{
      width: '100%',
      height: '8px',
      background: '#1f2937',
      borderRadius: '999px',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: `${bonusPercentage}%`,
        height: '100%',
        background: '#a855f7',
        borderRadius: '999px',
        transition: '0.3s',
        boxShadow:
          '0 0 10px #a855f7',
      }}
    />
  </div>
</div>
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
            Clear all checks
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
  'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '25px',
          }}
        >
          {sections.map((section) => (
            <div
              key={section.title}
              style={{
                background: '#121a2b',
                padding: '18px',
                borderRadius: '20px',
                boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              }}
            >
              <h2
                style={{
                  marginBottom: '20px',
                  fontSize: '28px',
                  borderBottom: '1px solid #2d3748',
                  paddingBottom: '15px',
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

                  const isPurple = item.isBonus;

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
                        border: isPurple && isChecked
                              ? '2px solid #a855f7'
                              : isChecked
                              ? `1px solid ${setupColor}`
                              : '1px solid transparent',
                        boxShadow: isPurple && isChecked
                              ? '0 0 10px rgba(168,85,247,0.35)'
                              : 'none',
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

                      <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  }}
>
  <span>{item.name}</span>

  {item.isRequired && (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '999px',
        background: '#ff4d4d20',
        color: '#ff4d4d',
        fontSize: '10px',
        fontWeight: 'bold',
      }}
    >
      REQUIRED
    </span>
  )}
</div>
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
    Save trade
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
</div>
</div>

)}

{activePage === 'history' && (
    <div
  style={{
    background: '#121a2b',
    width: '100%',
    borderRadius: '20px',
    padding: '25px',
    boxSizing: 'border-box',
overflowX: 'hidden',
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
              display: 'grid',
gridTemplateColumns:
  'repeat(auto-fit, minmax(140px, 1fr))',
gap: '15px',
alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                {trade.pair}
              </h3>

              <p
  style={{
    color:
      trade.tradeResult === 'Win'
        ? '#00ff99'
        : trade.tradeResult === 'Loss'
        ? '#ff4d4d'
        : trade.tradeResult === 'Breakeven'
        ? '#ffd633'
        : '#3b82f6',
    fontWeight: 'bold',
  }}
>
  {trade.tradeResult}
</p>
            </div>

            <div>
              <p>Date:</p>
              <strong>{trade.tradeDate}</strong>
            </div>

            <div>
              <p>Setup score:</p>
              <strong>{trade.percentage}%</strong>
            </div>

            <div
  style={{
    display: 'flex',
    gap: '10px',
    marginLeft: 'auto',
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
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
  }}
>
  <FaTrash />
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
    View details
  </button>
</div>
          </div>
        ))}
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

<div
  style={{
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  }}
>
  <button
    onClick={() => {
      setTradeToDelete(openedTrade);
      setDeletePopupOpen(true);
    }}
    style={{
      background: '#ff3b30',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      fontSize: '16px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <FaTrash />
  </button>

  <button
onClick={() => {
  const currentTrade =
    savedTrades.find(
      (t) => t.id === openedTrade
    );

  setOriginalTrade(
    JSON.parse(
      JSON.stringify(currentTrade)
    )
  );

  setIsEditingTrade(true);
}}
    style={{
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }}
  >
    <FaEdit />
  </button>

  <button
onClick={() => {
  if (isEditingTrade) {
    setUnsavedChangesPopup(true);
    return;
  }

  setOpenedTrade(null);
  setIsEditingTrade(false);
}}

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


      </div>

      {savedTrades
        .filter((trade) => trade.id === openedTrade)
        .map((trade) => (
          <div key={trade.id}>
<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  }}
>
  <h2 style={{ margin: 0 }}>
    {trade.pair}
  </h2>

  {isEditingTrade ? (
    <select
      value={trade.tradeResult}
      onChange={(e) => {
        const updatedTrades =
          savedTrades.map((t) => {
            if (t.id !== trade.id)
              return t;

            return {
              ...t,
              tradeResult:
                e.target.value,
            };
          });

        setSavedTrades(updatedTrades);
      }}
      style={{
        background: '#1e293b',
        color: 'white',
        border: '1px solid #334155',
        padding: '10px 15px',
        borderRadius: '10px',
      }}
    >
      <option value="On going">
        On Going
      </option>

      <option value="Win">
        Win
      </option>

      <option value="Loss">
        Loss
      </option>

      <option value="Breakeven">
        Breakeven
      </option>
    </select>
  ) : (
    <span
      style={{
        color:
  trade.tradeResult === 'Win'
    ? '#00ff99'
    : trade.tradeResult === 'Loss'
    ? '#ff4d4d'
    : trade.tradeResult === 'Breakeven'
    ? '#ffd633'
    : '#3b82f6',
        fontWeight: 'bold',
        fontSize: '24px',
      }}
    >
      • {trade.tradeResult}
    </span>
  )}
</div>


            <p>Date: {trade.tradeDate}</p>

            <p>Setup score: {trade.percentage}%</p>

            <div
  style={{
    marginTop: '15px',
    marginBottom: '20px',
  }}
>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
    }}
  >
    <span
      style={{
        color: '#a855f7',
        fontWeight: 'bold',
      }}
    >
      Bonus
    </span>

    <span
      style={{
        color: '#a855f7',
        fontWeight: 'bold',
      }}
    >
      {trade.bonusPercentage || 0}%
    </span>
  </div>

  <div
    style={{
      width: '100%',
      height: '8px',
      background: '#1f2937',
      borderRadius: '999px',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: `${trade.bonusPercentage || 0}%`,
        height: '100%',
        background: '#a855f7',
        borderRadius: '999px',
        boxShadow:
          '0 0 10px #a855f7',
      }}
    />
  </div>
</div>

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
          <label
            key={itemId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '12px',
              background: wasChecked
                ? '#1e293b'
                : '#172033',
              border: wasChecked
                ? '1px solid #00ff99'
                : '1px solid #2d3748',
              color: wasChecked
                ? '#00ff99'
                : '#9ca3af',
              cursor: isEditingTrade
                ? 'pointer'
                : 'default',
              transition: '0.2s',
            }}
          >
            <input
              type="checkbox"
              checked={wasChecked || false}
              disabled={!isEditingTrade}
              onChange={(e) => {
                const updatedTrades =
                  savedTrades.map((t) => {
                    if (
                      t.id !== trade.id
                    )
                      return t;

                    const updatedChecked =
                      {
                        ...t.checked,
                        [itemId]:
                          e.target.checked,
                      };

                    const normalItems =
  allItems.filter(
    (item) => !item.isBonus
  );

const totalNormalWeight =
  normalItems.reduce(
    (sum, item) =>
      sum + item.weight,
    0
  );

const checkedNormalWeight =
  normalItems.reduce(
    (sum, item) =>
      updatedChecked[item.id]
        ? sum + item.weight
        : sum,
    0
  );

const updatedPercentage =
  totalNormalWeight > 0
    ? (
        (checkedNormalWeight /
          totalNormalWeight) *
        100
      ).toFixed(0)
    : 0;

const bonusItems =
  allItems.filter(
    (item) => item.isBonus
  );

const totalBonusWeight =
  bonusItems.reduce(
    (sum, item) =>
      sum + item.weight,
    0
  );

const checkedBonusWeight =
  bonusItems.reduce(
    (sum, item) =>
      updatedChecked[item.id]
        ? sum + item.weight
        : sum,
    0
  );

const updatedBonusPercentage =
  totalBonusWeight > 0
    ? (
        (checkedBonusWeight /
          totalBonusWeight) *
        100
      ).toFixed(0)
    : 0;

                    return {
  ...t,
  checked:
    updatedChecked,
  percentage:
    updatedPercentage,
  bonusPercentage:
    updatedBonusPercentage,
};
                  });

                setSavedTrades(
                  updatedTrades
                );
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

<div
  style={{
    height: '1px',
    background: '#2d3748',
    marginTop: '35px',
    marginBottom: '35px',
    width: '100%',
  }}
/>

<div
  style={{
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
  }}
>

  <h3
    style={{
      marginBottom: '12px',
    }}
  >
    Note
  </h3>

  <textarea
    value={trade.note || ''}
    disabled={!isEditingTrade}
    onChange={(e) => {
      const updatedTrades =
        savedTrades.map((t) => {
          if (t.id !== trade.id)
            return t;

          return {
            ...t,
            note: e.target.value,
          };
        });

      setSavedTrades(updatedTrades);
    }}
    placeholder="Add notes about this trade..."
    style={{
      width: '100%',
      minHeight: '200px',
      padding: '15px',
      borderRadius: '15px',
      background: '#1e293b',
      color: 'white',
      border: 'none',
      resize: 'vertical',
      boxSizing: 'border-box',
      opacity: !isEditingTrade
        ? 0.7
        : 1,
    }}
  />

  {isEditingTrade && (
    <button
      onClick={async () => {
        const currentTrade =
          savedTrades.find(
            (t) => t.id === trade.id
          );

        await updateDoc(
          doc(
            db,
            'trades',
            trade.id
          ),
          currentTrade
        );

        setIsEditingTrade(false);
      }}
      style={{
        marginTop: '25px',
        background: '#00ff99',
        color: '#0b1020',
        border: 'none',
        padding: '15px',
        borderRadius: '14px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        width: '100%',
      }}
    >
      Save Changes
    </button>
  )}
</div>
                        </div>
        ))}
    </div>
  </div>
)}

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
  setOpenedTrade(null);
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

{unsavedChangesPopup && (
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
        maxWidth: '420px',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          marginBottom: '15px',
        }}
      >
        Unsaved Changes
      </h2>

      <p
        style={{
          color: '#9ca3af',
          marginBottom: '25px',
        }}
      >
        Do you want to save your
        changes before closing?
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={async () => {
            const currentTrade =
              savedTrades.find(
                (t) =>
                  t.id === openedTrade
              );

            await updateDoc(
              doc(
                db,
                'trades',
                openedTrade
              ),
              currentTrade
            );

            setUnsavedChangesPopup(
              false
            );

            setOpenedTrade(null);
            setIsEditingTrade(false);
          }}
          style={{
            background: '#00ff99',
            color: '#0b1020',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Save
        </button>

        <button
          onClick={() => {
            const revertedTrades =
              savedTrades.map((t) => {
                if (
                  t.id !== openedTrade
                )
                  return t;

                return originalTrade;
              });

            setSavedTrades(
              revertedTrades
            );

            setUnsavedChangesPopup(
              false
            );

            setOpenedTrade(null);
            setIsEditingTrade(false);
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
          Discard
        </button>

        <button
          onClick={() =>
            setUnsavedChangesPopup(
              false
            )
          }
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
          Cancel
                </button>
      </div>
    </div>
  </div>
)}

      </div>
    </>
  );
}