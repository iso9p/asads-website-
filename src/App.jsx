import { useState } from 'react';
import { FaHome, FaGift, FaBell, FaBars, FaUser, FaLock, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAGc398LhymHbUGrIQl7VaCxXFVWeLLrzU",
  authDomain: "asads-mall.firebaseapp.com",
  projectId: "asads-mall",
  storageBucket: "asads-mall.firebasestorage.app",
  messagingSenderId: "343041216354",
  appId: "1:343041216354:web:6113e7695d544897d6663b"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // متغيرات لحفظ المدخلات
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  // دالة تسجيل الدخول
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('تم تسجيل الدخول بنجاح!');
      setCurrentPage('home'); // العودة للرئيسية
    } catch (error) {
      setMessage('خطأ: ' + error.message);
    }
  };

  // دالة إنشاء حساب
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
      setCurrentPage('account');
    } catch (error) {
      setMessage('خطأ: ' + error.message);
    }
  };

  const styles = {
    container: { fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f4f6f9', margin: 0, padding: 0, color: '#333' },
    topBar: { backgroundColor: '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100 },
    icons: { display: 'flex', gap: '15px', fontSize: '20px', cursor: 'pointer' },
    logo: { fontSize: '18px', fontWeight: 'bold' },
    main: { padding: '20px', paddingBottom: '80px' },
    banner: { background: 'linear-gradient(135deg, #3949ab, #1a237e)', color: 'white', padding: '30px 20px', borderRadius: '15px', textAlign: 'center', marginBottom: '20px' },
    bannerH1: { fontSize: '22px', margin: '0 0 10px 0' },
    bannerP: { margin: 0, fontSize: '14px' },
    sectionTitle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', color: '#1a237e' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
    card: { background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#333' },
    bottomNav: { position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '10px 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' },
    navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', color: '#666', gap: '5px', cursor: 'pointer' },
    navActive: { color: '#1a237e', fontWeight: 'bold' },
    giftCard: { background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    giftTitle: { fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1a237e' },
    giftPoints: { fontSize: '14px', color: '#ffb300', fontWeight: 'bold', margin: 0 },
    btnRedeem: { backgroundColor: '#2dd36f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    formBox: { background: 'white', padding: '30px 20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '400px', margin: '0 auto' },
    formTitle: { textAlign: 'center', color: '#1a237e', marginBottom: '20px' },
    inputGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#f4f6f9', borderRadius: '8px', padding: '10px', marginBottom: '15px', border: '1px solid #ddd' },
    input: { border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '10px', fontFamily: 'inherit', color: '#333' },
    btnSubmit: { width: '100%', backgroundColor: '#1a237e', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    linkText: { textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#007bff', cursor: 'pointer' },
    messageBox: { textAlign: 'center', marginTop: '15px', color: 'red', fontWeight: 'bold' }
  };

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div style={styles.banner}>
            <h1 style={styles.bannerH1}>مرحباً بك في مجمع اسعد العزاوي</h1>
            <p style={styles.bannerP}>اكتشف أفضل العروض والخدمات</p>
          </div>
          <div style={styles.sectionTitle}>
            <h3>الوكلاء</h3>
            <span style={{color: '#007bff', cursor: 'pointer', fontSize: '14px'}}>عرض المزيد</span>
          </div>
          <div style={styles.grid}>
            <div style={styles.card}>وكيل 1</div>
            <div style={styles.card}>وكيل 2</div>
            <div style={styles.card}>وكيل 3</div>
          </div>
        </>
      );
    } else if (currentPage === 'gifts') {
      return (
        <>
          <h2 style={{color: '#1a237e', marginBottom: '20px'}}>متجر الهدايا</h2>
          <div style={styles.giftCard}>
            <div>
              <p style={styles.giftTitle}>كوب قهوة مجاني</p>
              <p style={styles.giftPoints}>50 نقطة</p>
            </div>
            <button style={styles.btnRedeem}>استبدال</button>
          </div>
        </>
      );
    } else if (currentPage === 'account') {
      return (
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>تسجيل الدخول</h2>
          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <FaEnvelope color="#666" />
              <input type="email" placeholder="البريد الإلكتروني" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={styles.inputGroup}>
              <FaLock color="#666" />
              <input type="password" placeholder="كلمة المرور" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={styles.btnSubmit}>دخول</button>
          </form>
          {message && <p style={styles.messageBox}>{message}</p>}
          <p style={styles.linkText} onClick={() => setCurrentPage('register')}>ليس لديك حساب؟ إنشاء حساب جديد</p>
        </div>
      );
    } else if (currentPage === 'register') {
      return (
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>إنشاء حساب جديد</h2>
          <form onSubmit={handleRegister}>
            <div style={styles.inputGroup}>
              <FaUserPlus color="#666" />
              <input type="text" placeholder="الاسم الكامل" style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div style={styles.inputGroup}>
              <FaEnvelope color="#666" />
              <input type="email" placeholder="البريد الإلكتروني" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={styles.inputGroup}>
              <FaLock color="#666" />
              <input type="password" placeholder="كلمة المرور" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={styles.btnSubmit}>تسجيل</button>
          </form>
          {message && <p style={styles.messageBox}>{message}</p>}
          <p style={styles.linkText} onClick={() => setCurrentPage('account')}>لديك حساب بالفعل؟ تسجيل الدخول</p>
        </div>
      );
    }
    return <div style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>هذه الصفحة قيد الإنشاء...</div>;
  };

  return (
    <div style={styles.container}>
      <header style={styles.topBar}>
        <div style={styles.icons}>
          <FaBars onClick={() => setCurrentPage('menu')} />
          <FaBell />
          <FaGift onClick={() => setCurrentPage('gifts')} />
        </div>
        <div style={styles.logo}>مجمع اسعد العزاوي</div>
      </header>
      <main style={styles.main}>{renderPage()}</main>
      <nav style={styles.bottomNav}>
        <div style={{...styles.navItem, ...(currentPage === 'home' ? styles.navActive : {})}} onClick={() => setCurrentPage('home')}><FaHome /> الرئيسية</div>
        <div style={{...styles.navItem, ...(currentPage === 'gifts' ? styles.navActive : {})}} onClick={() => setCurrentPage('gifts')}><FaGift /> الهدايا</div>
        <div style={{...styles.navItem, ...(currentPage === 'account' || currentPage === 'register' ? styles.navActive : {})}} onClick={() => setCurrentPage('account')}><FaUser /> حسابي</div>
        <div style={{...styles.navItem, ...(currentPage === 'menu' ? styles.navActive : {})}} onClick={() => setCurrentPage('menu')}><FaBars /> القائمة</div>
      </nav>
    </div>
  );
}

export default App;
