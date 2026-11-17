import { useState, useEffect } from 'react';
import { FaHome, FaGift, FaBell, FaBars, FaUser, FaLock, FaEnvelope, FaUserPlus, FaQrcode, FaStore, FaSignOutAlt, FaPlus, FaCog, FaTrash, FaBarcode } from 'react-icons/fa';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, query, where } from "firebase/firestore";
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

const ADMIN_EMAIL = "swnyszny0@gmail.com"; 

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  
  // بيانات الهدايا
  const [gifts, setGifts] = useState([]);
  const [newGiftTitle, setNewGiftTitle] = useState('');
  const [newGiftCost, setNewGiftCost] = useState('');
  const [newGiftImage, setNewGiftImage] = useState('');

  // بيانات الباركودات (للإدارة)
  const [barcodes, setBarcodes] = useState([]);
  const [newBarcodeCode, setNewBarcodeCode] = useState('');
  const [newBarcodePoints, setNewBarcodePoints] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const primaryColor = '#C8A97E';
  const darkColor = '#2C2C2C';

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

  // جلب الهدايا والباركودات
  useEffect(() => {
    const fetchData = async () => {
      const giftsSnapshot = await getDocs(collection(db, "gifts"));
      setGifts(giftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const barcodesSnapshot = await getDocs(collection(db, "barcodes"));
      setBarcodes(barcodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
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

  // دالة معالجة الباركود الذكي
  const handleBarcodeScan = async (decodedText) => {
    // البحث عن الباركود في قاعدة البيانات
    const q = query(collection(db, "barcodes"), where("code", "==", decodedText));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const barcodeData = querySnapshot.docs[0].data();
      const pointsToAdd = barcodeData.points;
      
      await addPoints(pointsToAdd);
      alert(`باركود صحيح! تم إضافة ${pointsToAdd} نقطة.`);
    } else {
      alert("عذراً، هذا الباركود غير مسجل في النظام أو تم استخدامه مسبقاً.");
    }
    setCurrentPage('account');
  };

  const startScanner = () => {
    setCurrentPage('scanner');
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((decodedText) => {
        scanner.clear();
        handleBarcodeScan(decodedText);
      });
    }, 100);
  };

  // دالة إضافة هدية
  const handleAddGift = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "gifts"), {
        title: newGiftTitle,
        cost: parseInt(newGiftCost),
        image: newGiftImage || 'https://via.placeholder.com/150'
      });
      alert("تمت إضافة الهدية بنجاح!");
      const querySnapshot = await getDocs(collection(db, "gifts"));
      setGifts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNewGiftTitle(''); setNewGiftCost(''); setNewGiftImage('');
    } catch (error) { alert("حدث خطأ"); }
  };

  // دالة إضافة باركود جديد
  const handleAddBarcode = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "barcodes"), {
        code: newBarcodeCode,
        points: parseInt(newBarcodePoints)
      });
      alert("تمت إضافة الباركود بنجاح!");
      const querySnapshot = await getDocs(collection(db, "barcodes"));
      setBarcodes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNewBarcodeCode(''); setNewBarcodePoints('');
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleDeleteGift = async (id) => {
    if(window.confirm("هل أنت متأكد؟")) {
      await deleteDoc(doc(db, "gifts", id));
      setGifts(gifts.filter(g => g.id !== id));
    }
  };

  const handleDeleteBarcode = async (id) => {
    if(window.confirm("هل أنت متأكد؟")) {
      await deleteDoc(doc(db, "barcodes", id));
      setBarcodes(barcodes.filter(b => b.id !== id));
    }
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
    btnScan: { backgroundColor: primaryColor, color: 'white', border: 'none', padding: '15px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginTop: '15px' },
    adminBox: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' },
    adminTitle: { color: darkColor, borderBottom: `2px solid ${primaryColor}`, paddingBottom: '10px', marginBottom: '15px' },
    btnDelete: { backgroundColor: '#eb445a', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' }
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
          {gifts.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666'}}>لا توجد هدايا حالياً.</p>
          ) : (
            gifts.map(gift => (
              <div key={gift.id} style={styles.giftCard}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <img src={gift.image} alt={gift.title} style={{width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover'}} />
                  <div>
                    <p style={styles.giftTitle}>{gift.title}</p>
                    <p style={styles.giftPoints}>{gift.cost} نقطة</p>
                  </div>
                </div>
                <button style={styles.btnRedeem} onClick={() => redeemGift(gift.cost)}>استبدال</button>
              </div>
            ))
          )}
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
            <div style={styles.pointsBadge}>رصيدك الحالي: {userPoints} نقطة</div>
            <p style={{color: '#666', marginBottom: '20px'}}>قم بمسح الباركود لكسب المزيد من النقاط!</p>
            
            {user.email === ADMIN_EMAIL && (
              <button style={{...styles.btnSubmit, marginBottom: '10px', backgroundColor: '#4CAF50'}} onClick={() => setCurrentPage('admin')}>
                <FaCog /> لوحة تحكم الإدارة
              </button>
            )}
            <button style={styles.btnLogout} onClick={handleLogout}><FaSignOutAlt /> تسجيل الخروج</button>
          </div>
        );
      } else {
        return (
          <div style={styles.formBox}>
            <h2 style={styles.formTitle}>تسجيل الدخول</h2>
            <form onSubmit={handleLogin}>
              <div style={styles.inputGroup}><FaEnvelope color="#666" /><input type="email" placeholder="البريد الإلكتروني" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div style={styles.inputGroup}><FaLock color="#666" /><input type="password" placeholder="كلمة المرور" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
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
            <div style={styles.inputGroup}><FaUserPlus color="#666" /><input type="text" placeholder="الاسم الكامل" style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div style={styles.inputGroup}><FaEnvelope color="#666" /><input type="email" placeholder="البريد الإلكتروني" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div style={styles.inputGroup}><FaLock color="#666" /><input type="password" placeholder="كلمة المرور" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <button type="submit" style={styles.btnSubmit}>تسجيل</button>
          </form>
          {message && <p style={styles.messageBox}>{message}</p>}
          <p style={styles.linkText} onClick={() => setCurrentPage('account')}>لديك حساب بالفعل؟ تسجيل الدخول</p>
        </div>
      );
    } else if (currentPage === 'admin') {
      return (
        <div>
          <h2 style={{color: darkColor, marginBottom: '20px'}}>لوحة تحكم الإدارة</h2>
          
          {/* إدارة الهدايا */}
          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><FaGift /> إضافة هدية جديدة</h3>
            <form onSubmit={handleAddGift}>
              <div style={styles.inputGroup}><input type="text" placeholder="اسم الهدية" style={styles.input} value={newGiftTitle} onChange={(e) => setNewGiftTitle(e.target.value)} required /></div>
              <div style={styles.inputGroup}><input type="number" placeholder="تكلفة النقاط" style={styles.input} value={newGiftCost} onChange={(e) => setNewGiftCost(e.target.value)} required /></div>
              <div style={styles.inputGroup}><input type="text" placeholder="رابط الصورة" style={styles.input} value={newGiftImage} onChange={(e) => setNewGiftImage(e.target.value)} /></div>
              <button type="submit" style={{...styles.btnSubmit, backgroundColor: '#4CAF50'}}><FaPlus /> إضافة الهدية</button>
            </form>
          </div>

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}>الهدايا الحالية</h3>
            {gifts.map(gift => (
              <div key={gift.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><img src={gift.image} style={{width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover'}} /><span>{gift.title} - {gift.cost} نقطة</span></div>
                <button style={styles.btnDelete} onClick={() => handleDeleteGift(gift.id)}><FaTrash /></button>
              </div>
            ))}
          </div>

          {/* إدارة الباركودات */}
          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><FaBarcode /> إضافة باركود جديد</h3>
            <form onSubmit={handleAddBarcode}>
              <div style={styles.inputGroup}><input type="text" placeholder="رقم الباركود (مثال: 123456)" style={styles.input} value={newBarcodeCode} onChange={(e) => setNewBarcodeCode(e.target.value)} required /></div>
              <div style={styles.inputGroup}><input type="number" placeholder="النقاط المضافة" style={styles.input} value={newBarcodePoints} onChange={(e) => setNewBarcodePoints(e.target.value)} required /></div>
              <button type="submit" style={{...styles.btnSubmit, backgroundColor: '#2196F3'}}><FaPlus /> إضافة الباركود</button>
            </form>
          </div>

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}>الباركودات المسجلة</h3>
            {barcodes.map(barcode => (
              <div key={barcode.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                <span>{barcode.code} - {barcode.points} نقطة</span>
                <button style={styles.btnDelete} onClick={() => handleDeleteBarcode(barcode.id)}><FaTrash /></button>
              </div>
            ))}
          </div>
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
