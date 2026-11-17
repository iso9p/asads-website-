import { useState, useEffect } from 'react';
import { FaHome, FaGift, FaBell, FaBars, FaUser, FaLock, FaEnvelope, FaUserPlus, FaQrcode, FaStore, FaSignOutAlt, FaPlus, FaCog, FaTrash, FaBarcode, FaArrowRight, FaWhatsapp, FaBookmark } from 'react-icons/fa';
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

  // بيانات الباركودات
  const [barcodes, setBarcodes] = useState([]);
  const [newBarcodeCode, setNewBarcodeCode] = useState('');
  const [newBarcodePoints, setNewBarcodePoints] = useState('');

  // بيانات الوكلاء والمنتجات
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentProducts, setAgentProducts] = useState([]);

  // بيانات إدارة الوكلاء
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentLocation, setNewAgentLocation] = useState('');
  const [newAgentImage, setNewAgentImage] = useState('');
  
  // بيانات إدارة المنتجات (تمت إضافة الصورة)
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState(''); // جديد

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const primaryColor = '#0054e9';
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

  useEffect(() => {
    const fetchData = async () => {
      const giftsSnapshot = await getDocs(collection(db, "gifts"));
      setGifts(giftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const barcodesSnapshot = await getDocs(collection(db, "barcodes"));
      setBarcodes(barcodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const agentsSnapshot = await getDocs(collection(db, "agents"));
      setAgents(agentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      const fetchProducts = async () => {
        const q = query(collection(db, "products"), where("agentId", "==", selectedAgent.id));
        const querySnapshot = await getDocs(q);
        setAgentProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchProducts();
    }
  }, [selectedAgent]);

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

  const addPoints = async (amount) => {
    if (!user) return;
    const newPoints = userPoints + amount;
    await updateDoc(doc(db, "users", user.uid), { points: newPoints });
    setUserPoints(newPoints);
  };

  const redeemGift = async (cost) => {
    if (!user) return alert("يجب تسجيل الدخول أولاً");
    if (userPoints < cost) return alert("نقاطك غير كافية!");
    const newPoints = userPoints - cost;
    await updateDoc(doc(db, "users", user.uid), { points: newPoints });
    setUserPoints(newPoints);
    alert("تم استبدال الهدية بنجاح!");
  };

  const handleBarcodeScan = async (decodedText) => {
    const q = query(collection(db, "barcodes"), where("code", "==", decodedText));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const barcodeData = querySnapshot.docs[0].data();
      await addPoints(barcodeData.points);
      alert(`باركود صحيح! تم إضافة ${barcodeData.points} نقطة.`);
    } else {
      alert("عذراً، هذا الباركود غير مسجل في النظام.");
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

  // دوال الإدارة
  const handleAddGift = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "gifts"), { title: newGiftTitle, cost: parseInt(newGiftCost), image: newGiftImage || 'https://via.placeholder.com/150' });
      alert("تمت إضافة الهدية!");
      const querySnapshot = await getDocs(collection(db, "gifts"));
      setGifts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNewGiftTitle(''); setNewGiftCost(''); setNewGiftImage('');
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleAddBarcode = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "barcodes"), { code: newBarcodeCode, points: parseInt(newBarcodePoints) });
      alert("تمت إضافة الباركود!");
      const querySnapshot = await getDocs(collection(db, "barcodes"));
      setBarcodes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNewBarcodeCode(''); setNewBarcodePoints('');
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "agents"), { name: newAgentName, location: newAgentLocation, image: newAgentImage || 'https://via.placeholder.com/150' });
      alert("تمت إضافة الوكيل!");
      const querySnapshot = await getDocs(collection(db, "agents"));
      setAgents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNewAgentName(''); setNewAgentLocation(''); setNewAgentImage('');
    } catch (error) { alert("حدث خطأ"); }
  };

  // دالة إضافة منتج مع صورة
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      await addDoc(collection(db, "products"), { 
        name: newProductName, 
        price: newProductPrice, 
        image: newProductImage || 'https://via.placeholder.com/150', // حفظ رابط الصورة
        agentId: selectedAgent.id 
      });
      alert("تمت إضافة المنتج!");
      const q = query(collection(db, "products"), where("agentId", "==", selectedAgent.id));
      const querySnapshot = await getDocs(q);
      setAgentProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNewProductName(''); setNewProductPrice(''); setNewProductImage('');
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleDeleteGift = async (id) => { if(window.confirm("متأكد؟")) { await deleteDoc(doc(db, "gifts", id)); setGifts(gifts.filter(g => g.id !== id)); } };
  const handleDeleteBarcode = async (id) => { if(window.confirm("متأكد؟")) { await deleteDoc(doc(db, "barcodes", id)); setBarcodes(barcodes.filter(b => b.id !== id)); } };
  const handleDeleteAgent = async (id) => { if(window.confirm("متأكد؟")) { await deleteDoc(doc(db, "agents", id)); setAgents(agents.filter(a => a.id !== id)); } };

  const styles = {
    container: { fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f4f6f9', margin: 0, padding: 0, color: '#333' },
    topBar: { backgroundColor: '#fff', color: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    icons: { display: 'flex', gap: '15px', fontSize: '20px', cursor: 'pointer', color: '#666' },
    logoArea: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    logoImg: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' },
    logoText: { fontSize: '12px', fontWeight: 'bold', color: '#333', marginTop: '5px' },
    main: { padding: '20px', paddingBottom: '80px' },
    banner: { background: '#f0f0f0', color: '#333', padding: '20px', borderRadius: '15px', textAlign: 'center', marginBottom: '20px' },
    agentsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' },
    agentCard: { background: '#fff', padding: '15px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    agentImg: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'contain', marginBottom: '10px' },
    agentName: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: 0 },
    productHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px' },
    searchBar: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
    productCard: { background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', position: 'relative' },
    productImg: { width: '100%', height: '120px', objectFit: 'contain', marginBottom: '10px' }, // تم تعديلها لتستوعب الصورة
    bookmarkIcon: { position: 'absolute', top: '10px', right: '10px', color: '#ccc', cursor: 'pointer' },
    productName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0', textAlign: 'center' },
    productPrice: { fontSize: '14px', color: '#666', margin: '0 0 15px 0', textAlign: 'center' },
    whatsappBtn: { backgroundColor: '#fff', border: '1px solid #25D366', color: '#25D366', padding: '8px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '14px', fontWeight: 'bold' },
    bottomNav: { position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '10px 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', zIndex: 100 },
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
    btnDelete: { backgroundColor: '#eb445a', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' },
    backBtn: { background: 'none', border: 'none', color: darkColor, fontSize: '20px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }
  };

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div style={styles.banner}>
            <h1 style={{fontSize: '22px', margin: '0 0 10px 0'}}>شركة مجمع اسعد العزاوي ترحب بك 👋</h1>
          </div>
          {user && (
            <button style={styles.btnScan} onClick={startScanner}>
              <FaQrcode /> مسح الباركود لكسب النقاط
            </button>
          )}
          <div style={{...styles.sectionTitle, marginTop: '20px', display: 'flex', justifyContent: 'space-between'}}>
            <h3 style={{color: '#333'}}>الوكلاء</h3>
            <span style={{color: primaryColor, cursor: 'pointer', fontSize: '14px'}} onClick={() => setCurrentPage('agents')}>عرض المزيد</span>
          </div>
          <div style={styles.agentsGrid}>
            {agents.slice(0, 3).map(agent => (
              <div key={agent.id} style={styles.agentCard} onClick={() => { setSelectedAgent(agent); setCurrentPage('agentDetails'); }}>
                <img src={agent.image} alt={agent.name} style={styles.agentImg} />
                <p style={styles.agentName}>{agent.name}</p>
              </div>
            ))}
          </div>
        </>
      );
    } else if (currentPage === 'agents') {
      return (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{color: '#333', margin: 0}}>المجموعات</h2>
            <FaArrowRight onClick={() => setCurrentPage('home')} style={{cursor: 'pointer', fontSize: '20px'}} />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {agents.map(agent => (
              <div key={agent.id} style={{background: '#fff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #eee'}} onClick={() => { setSelectedAgent(agent); setCurrentPage('agentDetails'); }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <img src={agent.image} alt={agent.name} style={{width: '50px', height: '50px', borderRadius: '50%', objectFit: 'contain'}} />
                  <div>
                    <h3 style={{margin: '0 0 5px 0', fontSize: '16px', color: '#333'}}>{agent.name}</h3>
                    <p style={{margin: 0, fontSize: '12px', color: '#888'}}>عرض المنتجات</p>
                  </div>
                </div>
                <FaArrowRight style={{color: '#ccc'}} />
              </div>
            ))}
          </div>
        </>
      );
    } else if (currentPage === 'agentDetails') {
      return (
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{color: '#333', margin: 0}}>المنتجات</h2>
            <FaArrowRight onClick={() => setCurrentPage('agents')} style={{cursor: 'pointer', fontSize: '20px'}} />
          </div>
          <input type="text" placeholder="ابحث عن منتجك هنا" style={styles.searchBar} />
          
          <div style={styles.productGrid}>
            {agentProducts.map(product => (
              <div key={product.id} style={styles.productCard}>
                <FaBookmark style={styles.bookmarkIcon} />
                <img src={product.image} alt={product.name} style={styles.productImg} />
                <p style={styles.productName}>{product.name}</p>
                <p style={styles.productPrice}>{product.price}</p>
                <button style={styles.whatsappBtn}>
                  <FaWhatsapp /> تواصل عبر
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (currentPage === 'gifts') {
      return (
        <>
          <h2 style={{color: darkColor, marginBottom: '20px'}}>متجر الهدايا</h2>
          {gifts.length === 0 ? <p style={{textAlign: 'center', color: '#666'}}>لا توجد هدايا حالياً.</p> : (
            gifts.map(gift => (
              <div key={gift.id} style={styles.giftCard}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <img src={gift.image} alt={gift.title} style={{width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover'}} />
                  <div><p style={styles.giftTitle}>{gift.title}</p><p style={styles.giftPoints}>{gift.cost} نقطة</p></div>
                </div>
                <button style={styles.btnRedeem} onClick={() => redeemGift(gift.cost)}>استبدال</button>
              </div>
            ))
          )}
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
              <button style={{...styles.btnSubmit, marginBottom: '10px', backgroundColor: '#4CAF50'}} onClick={() => setCurrentPage('admin')}><FaCog /> لوحة تحكم الإدارة</button>
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

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><FaBarcode /> إضافة باركود جديد</h3>
            <form onSubmit={handleAddBarcode}>
              <div style={styles.inputGroup}><input type="text" placeholder="رقم الباركود" style={styles.input} value={newBarcodeCode} onChange={(e) => setNewBarcodeCode(e.target.value)} required /></div>
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

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><FaStore /> إضافة وكيل جديد</h3>
            <form onSubmit={handleAddAgent}>
              <div style={styles.inputGroup}><input type="text" placeholder="اسم الوكيل" style={styles.input} value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} required /></div>
              <div style={styles.inputGroup}><input type="text" placeholder="العنوان / الموقع" style={styles.input} value={newAgentLocation} onChange={(e) => setNewAgentLocation(e.target.value)} required /></div>
              <div style={styles.inputGroup}><input type="text" placeholder="رابط صورة الوكيل" style={styles.input} value={newAgentImage} onChange={(e) => setNewAgentImage(e.target.value)} /></div>
              <button type="submit" style={{...styles.btnSubmit, backgroundColor: '#9C27B0'}}><FaPlus /> إضافة الوكيل</button>
            </form>
          </div>

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}>الوكلاء الحاليون</h3>
            {agents.map(agent => (
              <div key={agent.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><img src={agent.image} style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'contain'}} /><span>{agent.name}</span></div>
                <button style={styles.btnDelete} onClick={() => handleDeleteAgent(agent.id)}><FaTrash /></button>
              </div>
            ))}
          </div>

          {/* إدارة المنتجات مع إضافة الصورة */}
          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><FaPlus /> إضافة منتج لوكيل</h3>
            <div style={{marginBottom: '15px'}}>
              <select 
                onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value))}
                style={{...styles.input, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', width: '100%'}}
              >
                <option value="">-- اختر الوكيل --</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {selectedAgent && (
              <form onSubmit={handleAddProduct}>
                <div style={styles.inputGroup}><input type="text" placeholder="اسم المنتج" style={styles.input} value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required /></div>
                <div style={styles.inputGroup}><input type="text" placeholder="السعر" style={styles.input} value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} required /></div>
                <div style={styles.inputGroup}><input type="text" placeholder="رابط صورة المنتج" style={styles.input} value={newProductImage} onChange={(e) => setNewProductImage(e.target.value)} /></div>
                <button type="submit" style={{...styles.btnSubmit, backgroundColor: '#FF9800'}}><FaPlus /> إضافة المنتج</button>
              </form>
            )}
          </div>
        </div>
      );
    }
    return <div style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>هذه الصفحة قيد الإنشاء...</div>;
  };

  return (
    <div style={styles.container}>
      <header style={styles.topBar}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <FaBars onClick={() => setCurrentPage('menu')} style={{fontSize: '24px', cursor: 'pointer', color: '#333'}} />
        </div>
        <div style={styles.logoArea}>
          <img src="https://via.placeholder.com/50/0054e9/FFFFFF?text=LOGO" alt="Logo" style={styles.logoImg} />
          <div style={styles.logoText}>مجمع اسعد العزاوي</div>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
           <FaBell style={{fontSize: '20px', color: '#333'}} />
           <FaGift style={{fontSize: '20px', color: '#333'}} onClick={() => setCurrentPage('gifts')} />
        </div>
      </header>
      <main style={styles.main}>{renderPage()}</main>
      <nav style={styles.bottomNav}>
        <div style={{...styles.navItem, ...(currentPage === 'home' ? styles.navActive : {})}} onClick={() => setCurrentPage('home')}><FaHome size={20} /> الرئيسية</div>
        <div style={{...styles.navItem, ...(currentPage === 'gifts' ? styles.navActive : {})}} onClick={() => setCurrentPage('gifts')}><FaGift size={20} /> الهدايا</div>
        <div style={{...styles.navItem, ...(currentPage === 'account' || currentPage === 'register' ? styles.navActive : {})}} onClick={() => setCurrentPage('account')}><FaUser size={20} /> حسابي</div>
        <div style={{...styles.navItem, ...(currentPage === 'agents' ? styles.navActive : {})}} onClick={() => setCurrentPage('agents')}><FaStore size={20} /> القائمة</div>
      </nav>
    </div>
  );
}

export default App;
