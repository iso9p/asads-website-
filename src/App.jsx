import { useState } from 'react';
import { FaHome, FaGift, FaBell, FaBars, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // تنسيقات
  const styles = {
    container: { fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f4f6f9', margin: 0, padding: 0 },
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
    
    // تنسيقات الهدايا
    giftCard: { background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    giftTitle: { fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1a237e' },
    giftPoints: { fontSize: '14px', color: '#ffb300', fontWeight: 'bold', margin: 0 },
    btnRedeem: { backgroundColor: '#2dd36f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },

    // تنسيقات تسجيل الدخول
    loginBox: { background: 'white', padding: '30px 20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '400px', margin: '0 auto' },
    loginTitle: { textAlign: 'center', color: '#1a237e', marginBottom: '20px' },
    inputGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#f4f6f9', borderRadius: '8px', padding: '10px', marginBottom: '15px' },
    input: { border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '10px', fontFamily: 'inherit' },
    btnLogin: { width: '100%', backgroundColor: '#1a237e', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
  };

  // دوال الصفحات
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
          <div style={styles.giftCard}>
            <div>
              <p style={styles.giftTitle}>قسيمة شراء 10 دينار</p>
              <p style={styles.giftPoints}>100 نقطة</p>
            </div>
            <button style={styles.btnRedeem}>استبدال</button>
          </div>
        </>
      );
    } else if (currentPage === 'account') {
      return (
        <div style={styles.loginBox}>
          <h2 style={styles.loginTitle}>تسجيل الدخول</h2>
          <div style={styles.inputGroup}>
            <FaEnvelope color="#666" />
            <input type="email" placeholder="البريد الإلكتروني" style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <FaLock color="#666" />
            <input type="password" placeholder="كلمة المرور" style={styles.input} />
          </div>
          <button style={styles.btnLogin}>دخول</button>
          <p style={{textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#007bff', cursor: 'pointer'}}>ليس لديك حساب؟ إنشاء حساب جديد</p>
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

      <main style={styles.main}>
        {renderPage()}
      </main>

      <nav style={styles.bottomNav}>
        <div style={{...styles.navItem, ...(currentPage === 'home' ? styles.navActive : {})}} onClick={() => setCurrentPage('home')}>
          <FaHome /> الرئيسية
        </div>
        <div style={{...styles.navItem, ...(currentPage === 'gifts' ? styles.navActive : {})}} onClick={() => setCurrentPage('gifts')}>
          <FaGift /> الهدايا
        </div>
        <div style={{...styles.navItem, ...(currentPage === 'account' ? styles.navActive : {})}} onClick={() => setCurrentPage('account')}>
          <FaUser /> حسابي
        </div>
        <div style={{...styles.navItem, ...(currentPage === 'menu' ? styles.navActive : {})}} onClick={() => setCurrentPage('menu')}>
          <FaBars /> القائمة
        </div>
      </nav>
    </div>
  );
}

export default App;
