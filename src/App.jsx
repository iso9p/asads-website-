import { useState, useEffect } from 'react';
import { FaHome, FaGift, FaBell, FaBars, FaUser, FaLock, FaEnvelope, FaUserPlus, FaQrcode, FaStore, FaSignOutAlt } from 'react-icons/fa';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Html5QrcodeScanner } from "html5-qrcode";

const firebaseConfig = {
  apiKey: "AIzaSyAGc398LhymHbUGrIQl7VaCxXFVWeLLrzU",
  authDomain: "asads-mall.firebaseapp.com",
  projectId: "asads-mall",
  storageBucket: "asads-mall.firebasestorage.app",
  messagingSenderId: "343041216354",
  appId: "1:343041216354:web:6113e7695d544897d6663b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  // إعدادات الألوان الجديدة
  const primaryColor = '#C8A97E'; // لون ذهبي/بني فاخر
  const darkColor = '#2C2C2C';

  // مراقبة حالة تسجيل الدخول وجلب النقاط
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserPoints(docSnap.data().points || 0);
        } else {
          await setDoc(docRef, { points: 0, email: currentUser.email });
          setUserPoints(0);
        }
      } else {
        setUserPoints(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setCurrentPage('account');
    } catch (error) {
      setMessage('خطأ: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('تم إنشاء الحساب بنجاح!');
      setCurrentPage('account');
    } catch (error) {
      setMessage('خطأ: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home');
  };

  // دالة إضافة النقاط
  const addPoints = async (amount) => {
    if (!user) return;
    const newPoints = userPoints + amount;
    await updateDoc(doc(db, "users", user.uid), { points: newPoints });
    setUserPoints(newPoints);
  };

  // دالة استبدال الهدية
  const redeemGift = async (cost) => {
    if (!user) return alert("يجب تسجيل الدخول أولاً");
    if (userPoints < cost) return alert("نقاطك غير كافية!");
    
    const newPoints = userPoints - cost;
    await updateDoc(doc(db, "users", user.uid), { points: newPoints });
    setUserPoints(newPoints);
    alert("تم استبدال الهدية بنجاح!");
  };

  // تشغيل الكاميرا
  const startScanner = () => {
    setCurrentPage('scanner');
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((decodedText) => {
        scanner.clear();
        addPoints(10); // إضافة 10 نقاط لكل مسح
        alert(`تم مسح الباركود بنجاح! تم إضافة 10 نقاط.`);
        setCurrentPage('account');
      });
    }, 100);
  };

  const styles = {
    container: { fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f4f6f9', margin: 0, padding: 0, color: '#333' },
    topBar: { backgroundColor: darkColor, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100 },
    icons: { display: 'flex', gap: '15px', fontSize: '20px', cursor: 'pointer' },
    logo: { fontSize: '18px', fontWeight: 'bold', color: primaryColor },
    main: { padding: '20px', paddingBottom: '80px' },
    banner: { background: `linear-gradient(135deg, ${primaryColor}, ${darkColor})`, color: 'white', padding: '30px 20px', borderRadius: '15px', textAlign: 'center', marginBottom: '20px' },
    sectionTitle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', color: darkColor },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
    card: { background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontWeight: 'bold', color: darkColor },
    bottomNav: { position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '10px 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' },
    navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', color: '#666', gap: '5px', cursor: 'pointer' },
    navActive: { color: primaryColor, fontWeight: 'bold' },
    giftCard: { background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    giftTitle: { fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0', color: darkColor },
    giftPoints: { fontSize: '14px', color: primaryColor, fontWeight: 'bold', margin: 0 },
    btnRedeem: { backgroundColor: primaryColor, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    formBox: { background: 'white', padding: '30px 20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '400px', margin: '0 auto' },
    formTitle: { textAlign: 'center', color: darkColor, marginBottom: '20px' },
    inputGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#f4f6f9', borderRadius: '8px', padding: '10px', marginBottom: '15px', border: '1px solid #ddd' },
    input: { border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '10px', fontFamily: 'inherit', color: '#333' },
    btnSubmit: { width: '100%', backgroundColor: darkColor, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    linkText: { textAlign: 'center', marginTop: '15px', fontSize: '14px', color: primaryColor, cursor: 'pointer' },
    messageBox: { textAlign: 'center', marginTop: '15px', color: 'red', fontWeight: 'bold' },
    profileBox: { background: 'white', padding: '30px 20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' },
    pointsBadge: { backgroundColor: '#FFF8E1', color: primaryColor, padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', display: 'inline-block', margin: '20px 0', fontSize: '18px', border: `2px solid ${primaryColor}` },
    btnLogout: { backgroundColor: '#eb445a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' },
    btnScan: { backgroundColor: primaryColor, color: 'white', border: 'none', padding: '15px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginTop: '15px' }
  };

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div style={styles.banner}>
            <h1 style={{fontSize: '22px', margin: '0 0 10px 0'}}>مرحباً بك في مجمع اسعد العزاوي</h1>
            <p style={{margin: 0, fontSize: '14px'}}>اكتشف أفضل العروض والخدمات</p>
          </div>

          {user && (
            <button style={styles.btnScan} onClick={startScanner}>
              <FaQrcode /> مسح الباركود لكسب النقاط
            </button>
          )}

          <div style={{...styles.sectionTitle, marginTop: '30px'}}>
            <h3>الوكلاء</h3>
            <span style={{color: primaryColor, cursor: 'pointer', fontSize: '14px'}} onClick={() => setCurrentPage('agents')}>عرض المزيد</span>
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
          <h2 style={{color: darkColor, marginBottom: '20px'}}>متجر الهدايا</h2>
          <div style={styles.giftCard}>
            <div>
              <p style={styles.giftTitle}>كوب قهوة مجاني</p>
              <p style={styles.giftPoints}>50 نقطة</p>
            </div>
            <button style={styles.btnRedeem} onClick={() => redeemGift(50)}>استبدال</button>
          </div>
          <div style={styles.giftCard}>
            <div>
              <p style={styles.giftTitle}>قسيمة شراء 10 دينار</p>
              <p style={styles.giftPoints}>100 نقطة</p>
            </div>
            <button style={styles.btnRedeem} onClick={() => redeemGift(100)}>استبدال</button>
          </div>
        </>
      );
    } else if (currentPage === 'agents') {
      return (
        <>
          <h2 style={{color: darkColor, marginBottom: '20px'}}>الوكلاء</h2>
          <div style={styles.giftCard}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <FaStore size={30} color={primaryColor} />
              <div>
                <p style={styles.giftTitle}>وكيل المنطقة الشمالية</p>
                <p style={{color: '#888', fontSize: '12px', margin: 0}}>شارع الملك فهد</p>
              </div>
            </div>
          </div>
          <div style={styles.giftCard}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <FaStore size={30} color={primaryColor} />
              <div>
                <p style={styles.giftTitle}>وكيل المنطقة الجنوبية</p>
                <p style={{color: '#888', fontSize: '12px', margin: 0}}>شارع فلسطين</p>
              </div>
            </div>
          </div>
        </>
      );
    } else if (currentPage === 'scanner') {
      return (
        <div style={{textAlign: 'center'}}>
          <h2 style={{color: darkColor, marginBottom: '20px'}}>وجه الكاميرا نحو الباركود</h2>
          <div id="reader" style={{width: '100%', borderRadius: '15px', overflow: 'hidden'}}></div>
          <button onClick={() => setCurrentPage('home')} style={{...styles.btnSubmit, marginTop: '20px', backgroundColor: '#eb445a'}}>إلغاء المسح</button>
        </div>
      );
    } else if (currentPage === 'account') {
      if (user) {
        return (
          <div style={styles.profileBox}>
            <h2 style={{color: darkColor}}>مرحباً بك 👋</h2>
            <p style={{color: '#666', marginTop: '10px'}}>{user.email}</p>
            
            <div style={styles.pointsBadge}>
              رصيدك الحالي: {userPoints} نقطة
            </div>
            
            <p style={{color: '#666', marginBottom: '20px'}}>قم بمسح الباركود لكسب المزيد من النقاط!</p>
            <button style={styles.btnLogout} onClick={handleLogout}><FaSignOutAlt /> تسجيل الخروج</button>
          </div>
        );
      } else {
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
      }
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
        <div style={{...styles.navItem, ...(currentPage === 'agents' ? styles.navActive : {})}} onClick={() => setCurrentPage('agents')}><FaStore /> الوكلاء</div>
      </nav>
    </div>
  );
}

export default App;
