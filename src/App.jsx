import { FaHome, FaGift, FaBell, FaBars, FaUser } from 'react-icons/fa';

function App() {
  const styles = {
    container: { fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f4f6f9', margin: 0, padding: 0 },
    topBar: { backgroundColor: '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100 },
    icons: { display: 'flex', gap: '15px', fontSize: '20px' },
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
    navActive: { color: '#1a237e', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.topBar}>
        <div style={styles.icons}>
          <FaBars /><FaBell /><FaGift />
        </div>
        <div style={styles.logo}>مجمع اسعد العزاوي</div>
      </header>

      <main style={styles.main}>
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
      </main>

      <nav style={styles.bottomNav}>
        <div style={{...styles.navItem, ...styles.navActive}}><FaHome /> الرئيسية</div>
        <div style={styles.navItem}><FaGift /> الهدايا</div>
        <div style={styles.navItem}><FaUser /> حسابي</div>
        <div style={styles.navItem}><FaBars /> القائمة</div>
      </nav>
    </div>
  );
}

export default App;
