import { useState, useEffect } from 'react';
import {
  IoHome, IoHomeOutline, IoGift, IoGiftOutline, IoPerson, IoPersonOutline,
  IoGrid, IoGridOutline, IoNotificationsOutline, IoMenuOutline, IoQrCodeOutline,
  IoStorefrontOutline, IoLogoWhatsapp, IoMailOutline, IoLockClosedOutline,
  IoPersonAddOutline, IoTrashOutline, IoAdd, IoSettingsOutline, IoLogOutOutline,
  IoCheckmarkCircle, IoTimeOutline, IoScanOutline, IoIdCardOutline, IoSparkles
} from 'react-icons/io5';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, query, where, increment, orderBy } from "firebase/firestore";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QRCodeSVG } from 'qrcode.react';

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
const WHATSAPP_NUMBER = "9647714983580";

// ألوان التصميم
const primaryColor = '#0054e9';
const darkColor = '#0f1b33';
const mutedColor = '#6b7691';
const successColor = '#16a34a';
const dangerColor = '#e5484d';
const warnColor = '#f59e0b';

// تنسيقات عامة (خط، تأثيرات اللمس، حركة الدخول)
const globalCss = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
.am-app, .am-app * { box-sizing: border-box; font-family: 'Cairo', system-ui, sans-serif; }
.am-app button { font-family: inherit; transition: transform .15s ease, opacity .15s ease; }
.am-app button:active:not(:disabled) { transform: scale(0.97); }
.am-app .am-tap { transition: transform .15s ease, box-shadow .15s ease; }
.am-app .am-tap:active { transform: scale(0.97); }
.am-app input:focus, .am-app select:focus { outline: none; }
.am-app .am-field:focus-within { border-color: ${primaryColor}; box-shadow: 0 0 0 4px rgba(0,84,233,0.12); background: #fff; }
.am-app a:focus-visible, .am-app button:focus-visible { outline: 3px solid rgba(0,84,233,0.4); outline-offset: 2px; }
@keyframes am-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.am-app .am-page { animation: am-rise .35s ease both; }
@media (prefers-reduced-motion: reduce) { .am-app .am-page { animation: none; } .am-app * { transition: none !important; } }
`;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  const [isRedeeming, setIsRedeeming] = useState(false);

  const [gifts, setGifts] = useState([]);
  const [newGiftTitle, setNewGiftTitle] = useState('');
  const [newGiftCost, setNewGiftCost] = useState('');
  const [newGiftImage, setNewGiftImage] = useState('');

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentProducts, setAgentProducts] = useState([]);

  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentLocation, setNewAgentLocation] = useState('');
  const [newAgentImage, setNewAgentImage] = useState('');

  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState('');

  const [redeemRequests, setRedeemRequests] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  const [adminPointsToAdd, setAdminPointsToAdd] = useState('');
  const [scannedUserId, setScannedUserId] = useState(null);
  const [scannedUserName, setScannedUserName] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [message, setMessage] = useState('');

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
        fetchMyTransactions(currentUser.uid);
      } else {
        setUserPoints(0);
        setMyTransactions([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMyTransactions = async (uid) => {
    const q = query(collection(db, "transactions"), where("userId", "==", uid), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    setMyTransactions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchAllData = async () => {
    const giftsSnapshot = await getDocs(collection(db, "gifts"));
    setGifts(giftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const agentsSnapshot = await getDocs(collection(db, "agents"));
    setAgents(agentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const q = query(collection(db, "redeem_requests"), orderBy("createdAt", "desc"));
    const reqSnapshot = await getDocs(q);
    setRedeemRequests(reqSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const tq = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const tSnapshot = await getDocs(tq);
    setAllTransactions(tSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAllData();
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد (أو البريد المزعج).");
      setCurrentPage('account');
    } catch (error) {
      alert("خطأ: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home');
  };

  const redeemGift = async (gift) => {
    if (!user) return alert("يجب تسجيل الدخول أولاً");
    if (isRedeeming) return;
    if (userPoints < gift.cost) return alert("نقاطك غير كافية!");

    setIsRedeeming(true);

    try {
      await updateDoc(doc(db, "users", user.uid), { points: increment(-gift.cost) });
      setUserPoints(prev => prev - gift.cost);

      await addDoc(collection(db, "redeem_requests"), {
        userEmail: user.email,
        userId: user.uid,
        giftName: gift.title,
        giftCost: gift.cost,
        status: "معلق",
        createdAt: new Date()
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        userEmail: user.email,
        amount: -gift.cost,
        type: "استبدال هدية",
        details: `تم استبدال ${gift.cost} نقطة بـ ${gift.title}`,
        createdAt: new Date()
      });

      alert("تم استبدال الهدية بنجاح! طلبك قيد المعالجة من قبل الإدارة.");
      fetchMyTransactions(user.uid);
      fetchAllData();
    } catch(e) {
      console.error(e);
      alert("حدث خطأ في الاستبدال");
    } finally {
      setIsRedeeming(false);
    }
  };

  const startAdminScanner = () => {
    setCurrentPage('adminScanner');
    setScannedUserId(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("admin-reader", { fps: 10, qrbox: 250 });
      scanner.render((decodedText) => {
        scanner.clear();
        const uid = decodedText.split('/user/')[1];
        if (uid) {
          setScannedUserId(uid);
          fetchClientName(uid);
          setCurrentPage('adminGivePoints');
        } else {
          alert("هذا الباركود غير صالح.");
          setCurrentPage('admin');
        }
      });
    }, 100);
  };

  const fetchClientName = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setScannedUserName(docSnap.data().email || 'مستخدم');
    }
  };

  const handleGivePointsToClient = async (e) => {
    e.preventDefault();
    if (!scannedUserId || !adminPointsToAdd) return;
    try {
      await updateDoc(doc(db, "users", scannedUserId), {
        points: increment(parseInt(adminPointsToAdd))
      });

      await addDoc(collection(db, "transactions"), {
        userId: scannedUserId,
        userEmail: scannedUserName,
        amount: parseInt(adminPointsToAdd),
        type: "إضافة نقاط",
        details: `تم إضافة ${adminPointsToAdd} نقطة بواسطة الإدارة`,
        createdAt: new Date()
      });

      alert(`تم إضافة ${adminPointsToAdd} نقطة للعميل بنجاح!`);
      setAdminPointsToAdd('');
      setScannedUserId(null);
      setCurrentPage('admin');
      fetchAllData();
    } catch (error) {
      alert("حدث خطأ أثناء إضافة النقاط.");
    }
  };

  const handleAddGift = async (e) => { e.preventDefault(); await addDoc(collection(db, "gifts"), { title: newGiftTitle, cost: parseInt(newGiftCost), image: newGiftImage }); fetchAllData(); setNewGiftTitle(''); setNewGiftCost(''); setNewGiftImage(''); };
  const handleDeleteGift = async (id) => { if(window.confirm("متأكد؟")) { await deleteDoc(doc(db, "gifts", id)); fetchAllData(); } };
  const handleAddAgent = async (e) => { e.preventDefault(); await addDoc(collection(db, "agents"), { name: newAgentName, location: newAgentLocation, image: newAgentImage }); fetchAllData(); setNewAgentName(''); setNewAgentLocation(''); setNewAgentImage(''); };
  const handleDeleteAgent = async (id) => { if(window.confirm("متأكد؟")) { await deleteDoc(doc(db, "agents", id)); fetchAllData(); } };

  // دالة إضافة منتج
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    await addDoc(collection(db, "products"), { name: newProductName, price: newProductPrice, image: newProductImage, agentId: selectedAgent.id });
    alert("تمت الإضافة");
    setNewProductName('');
    setNewProductPrice('');
    setNewProductImage('');
    // تحديث قائمة المنتجات المعروضة
    const q = query(collection(db, "products"), where("agentId", "==", selectedAgent.id));
    const querySnapshot = await getDocs(q);
    setAgentProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // دالة حذف منتج
  const handleDeleteProduct = async (id) => {
    if(window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await deleteDoc(doc(db, "products", id));
      // تحديث القائمة
      const q = query(collection(db, "products"), where("agentId", "==", selectedAgent.id));
      const querySnapshot = await getDocs(q);
      setAgentProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  const handleCompleteRequest = async (id) => {
    if(window.confirm("هل تم تسليم الهدية للعميل؟")) {
      await deleteDoc(doc(db, "redeem_requests", id));
      fetchAllData();
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ================== التصميم ==================
  const card = { background: '#fff', borderRadius: '20px', boxShadow: '0 1px 2px rgba(15,27,51,0.04), 0 8px 24px rgba(15,27,51,0.06)' };
  const btnBase = { width: '100%', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };

  const styles = {
    container: { direction: 'rtl', minHeight: '100vh', background: '#f2f5fb', margin: 0, padding: 0, color: darkColor, maxWidth: '520px', marginInline: 'auto', position: 'relative' },
    topBar: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(15,27,51,0.06)' },
    iconBtn: { width: '42px', height: '42px', borderRadius: '14px', background: '#f2f5fb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: darkColor, fontSize: '22px', position: 'relative', border: 'none', padding: 0 },
    logoArea: { display: 'flex', alignItems: 'center', gap: '10px' },
    logoImg: { width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,84,233,0.25)' },
    logoText: { fontSize: '15px', fontWeight: 800, color: darkColor },
    main: { padding: '18px 16px', paddingBottom: '110px' },
    banner: { background: `linear-gradient(135deg, ${primaryColor} 0%, #2d7bff 60%, #6aa5ff 100%)`, color: '#fff', padding: '24px 20px', borderRadius: '24px', marginBottom: '22px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 28px rgba(0,84,233,0.28)' },
    sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 14px 0' },
    sectionTitle: { margin: 0, fontSize: '18px', fontWeight: 800, color: darkColor },
    agentsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' },
    agentCard: { ...card, padding: '14px 8px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '18px' },
    agentImg: { width: '58px', height: '58px', borderRadius: '16px', objectFit: 'contain', marginBottom: '8px', background: '#f2f5fb', padding: '4px' },
    agentName: { fontSize: '13px', fontWeight: 700, color: darkColor, margin: 0 },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' },
    productCard: { ...card, padding: '12px', display: 'flex', flexDirection: 'column', position: 'relative' },
    productImg: { width: '100%', height: '120px', objectFit: 'contain', marginBottom: '10px', background: '#f2f5fb', borderRadius: '14px' },
    productName: { fontSize: '15px', fontWeight: 700, color: darkColor, margin: '0 0 4px 0', textAlign: 'center' },
    productPrice: { fontSize: '14px', color: primaryColor, fontWeight: 700, margin: '0 0 12px 0', textAlign: 'center' },
    whatsappBtn: { background: '#25D366', border: 'none', color: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, width: '100%' },
    bottomNav: { position: 'fixed', bottom: '14px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 28px)', maxWidth: '492px', background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', justifyContent: 'space-around', padding: '8px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(15,27,51,0.18)', zIndex: 100 },
    navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: mutedColor, gap: '3px', cursor: 'pointer', padding: '8px 14px', borderRadius: '16px', flex: 1, transition: 'background .2s, color .2s' },
    navActive: { color: primaryColor, background: 'rgba(0,84,233,0.10)', fontWeight: 800 },
    giftCard: { ...card, padding: '14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
    giftTitle: { fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: darkColor },
    giftPoints: { fontSize: '13px', color: primaryColor, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' },
    btnRedeem: { background: primaryColor, color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', opacity: 1 },
    formBox: { ...card, padding: '28px 20px', maxWidth: '420px', margin: '10px auto', borderRadius: '24px' },
    formTitle: { textAlign: 'center', color: darkColor, marginTop: 0, marginBottom: '20px', fontWeight: 800 },
    inputGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#f2f5fb', borderRadius: '14px', padding: '12px 14px', marginBottom: '12px', border: '1.5px solid transparent', transition: 'border-color .2s, box-shadow .2s' },
    input: { border: 'none', background: 'transparent', outline: 'none', width: '100%', marginInlineStart: '10px', fontFamily: 'inherit', fontSize: '15px', color: darkColor },
    btnSubmit: { ...btnBase, background: darkColor },
    linkText: { textAlign: 'center', marginTop: '14px', fontSize: '14px', fontWeight: 600, color: primaryColor, cursor: 'pointer' },
    messageBox: { textAlign: 'center', marginTop: '14px', color: dangerColor, fontWeight: 700, fontSize: '14px' },
    profileBox: { ...card, padding: '28px 20px', textAlign: 'center', borderRadius: '24px' },
    pointsBadge: { background: `linear-gradient(135deg, ${primaryColor}, #2d7bff)`, color: '#fff', padding: '16px 24px', borderRadius: '20px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '18px 0 22px', fontSize: '18px', boxShadow: '0 10px 22px rgba(0,84,233,0.28)' },
    btnLogout: { background: 'rgba(229,72,77,0.1)', color: dangerColor, border: 'none', padding: '12px 20px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto', fontSize: '14px' },
    adminBox: { ...card, padding: '18px', marginBottom: '16px' },
    adminTitle: { color: darkColor, margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' },
    btnDelete: { background: 'rgba(229,72,77,0.1)', color: dangerColor, border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' },
    btnComplete: { background: successColor, color: 'white', border: 'none', padding: '9px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' },
    qrContainer: { ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '26px 20px', borderRadius: '24px' },
    requestCard: { background: '#fff8ec', padding: '14px', borderRadius: '16px', marginBottom: '10px', borderRight: `4px solid ${warnColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
    transactionCard: { background: '#fff', padding: '14px', borderRadius: '16px', marginBottom: '10px', borderRight: `4px solid ${primaryColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(15,27,51,0.04), 0 4px 14px rgba(15,27,51,0.05)' }
  };

  const listRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eef1f7', padding: '8px 0', gap: '10px' };
  const pageTitle = { color: darkColor, margin: '0 0 18px 0', fontSize: '22px', fontWeight: 800 };

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div style={styles.banner}>
            <div style={{position: 'absolute', top: '-40px', left: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)'}} />
            <div style={{position: 'absolute', bottom: '-50px', right: '30%', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)'}} />
            <h1 style={{fontSize: '21px', margin: '0 0 6px 0', fontWeight: 800, position: 'relative'}}>شركة مجمع اسعد العزاوي ترحب بك 👋</h1>
            {user ? (
              <div style={{display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, position: 'relative', marginTop: '6px'}}>
                <IoSparkles /> رصيدك: {userPoints} نقطة
              </div>
            ) : (
              <p style={{margin: '6px 0 0 0', fontSize: '13px', opacity: 0.9, position: 'relative'}}>سجّل دخولك لجمع النقاط واستبدالها بهدايا.</p>
            )}
          </div>
          <div style={styles.sectionHead}>
            <h3 style={styles.sectionTitle}>الوكلاء</h3>
            <span style={{color: primaryColor, cursor: 'pointer', fontSize: '14px', fontWeight: 700}} onClick={() => setCurrentPage('agents')}>عرض المزيد</span>
          </div>
          <div style={styles.agentsGrid}>
            {agents.map(agent => (
              <div key={agent.id} className="am-tap" style={styles.agentCard} onClick={() => { setSelectedAgent(agent); setCurrentPage('agentDetails'); }}>
                <img src={agent.image} alt={agent.name} style={styles.agentImg} /><p style={styles.agentName}>{agent.name}</p>
              </div>
            ))}
          </div>
        </>
      );
    } else if (currentPage === 'agents') {
      return (
        <>
          <h2 style={{...pageTitle, textAlign: 'center'}}>المجموعات</h2>
          <div style={styles.agentsGrid}>
            {agents.map(agent => (
              <div key={agent.id} className="am-tap" style={styles.agentCard} onClick={() => { setSelectedAgent(agent); setCurrentPage('agentDetails'); }}>
                <img src={agent.image} alt={agent.name} style={styles.agentImg} /><p style={styles.agentName}>{agent.name}</p>
              </div>
            ))}
          </div>
        </>
      );
    } else if (currentPage === 'agentDetails') {
      return (
        <div>
          <h2 style={pageTitle}>المنتجات</h2>
          <div style={styles.productGrid}>
            {agentProducts.map(product => (
              <div key={product.id} style={styles.productCard}>
                <img src={product.image} alt={product.name} style={styles.productImg} />
                <p style={styles.productName}>{product.name}</p>
                <p style={styles.productPrice}>{product.price}</p>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=مرحباً، أنا مهتم بمنتج: ${product.name}`} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
                  <button style={styles.whatsappBtn}>
                    <IoLogoWhatsapp size={18} /> تواصل عبر واتساب
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (currentPage === 'gifts') {
      return (
        <>
          <h2 style={pageTitle}>متجر الهدايا</h2>
          {gifts.map(gift => (
            <div key={gift.id} style={styles.giftCard}>
              <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                <img src={gift.image} alt={gift.title} style={{width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', background: '#f2f5fb'}} />
                <div><p style={styles.giftTitle}>{gift.title}</p><p style={styles.giftPoints}><IoSparkles /> {gift.cost} نقطة</p></div>
              </div>
              <button
                style={{...styles.btnRedeem, opacity: isRedeeming ? 0.5 : 1}}
                onClick={() => redeemGift(gift)}
                disabled={isRedeeming}
              >
                {isRedeeming ? 'جاري المعالجة...' : 'استبدال'}
              </button>
            </div>
          ))}
        </>
      );
    } else if (currentPage === 'notifications') {
      return (
        <>
          <h2 style={pageTitle}>سجل إشعاراتي</h2>
          {myTransactions.length === 0 ? <p style={{textAlign: 'center', color: mutedColor}}>لا توجد إشعارات حتى الآن.</p> : (
            myTransactions.map(t => (
              <div key={t.id} style={{...styles.transactionCard, borderRightColor: t.amount > 0 ? successColor : dangerColor}}>
                <div>
                  <p style={{margin: '0 0 4px 0', fontWeight: 800, fontSize: '14px', color: t.amount > 0 ? successColor : dangerColor}}>
                    {t.type} ({t.amount > 0 ? `+${t.amount}` : t.amount})
                  </p>
                  <p style={{margin: 0, fontSize: '12px', color: mutedColor}}>{t.details}</p>
                  <p style={{margin: '5px 0 0 0', fontSize: '11px', color: '#a0a8bd'}}>{formatDate(t.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </>
      );
    } else if (currentPage === 'account') {
      if (user) {
        return (
          <div style={styles.profileBox}>
            <div style={{width: '72px', height: '72px', borderRadius: '24px', background: 'rgba(0,84,233,0.1)', color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', margin: '0 auto 12px'}}><IoPerson /></div>
            <h2 style={{color: darkColor, margin: 0, fontWeight: 800}}>مرحباً بك 👋</h2>
            <p style={{color: mutedColor, marginTop: '6px', fontSize: '14px', wordBreak: 'break-all'}}>{user.email}</p>
            <div style={styles.pointsBadge}><IoSparkles /> رصيدك الحالي: {userPoints} نقطة</div>

            <button style={{...styles.btnSubmit, backgroundColor: primaryColor, background: primaryColor, marginBottom: '10px'}} onClick={() => setCurrentPage('showMyQR')}>
              <IoIdCardOutline size={20} /> عرض رمز العميل (QR)
            </button>

            {user.email === ADMIN_EMAIL && (
              <button style={{...styles.btnSubmit, marginBottom: '14px', background: successColor}} onClick={() => setCurrentPage('admin')}><IoSettingsOutline size={20} /> لوحة تحكم الإدارة</button>
            )}
            <button style={styles.btnLogout} onClick={handleLogout}><IoLogOutOutline size={18} /> تسجيل الخروج</button>
          </div>
        );
      } else {
        return (
          <div style={styles.formBox}>
            <h2 style={styles.formTitle}>تسجيل الدخول</h2>
            <form onSubmit={handleLogin}>
              <div className="am-field" style={styles.inputGroup}><IoMailOutline size={20} color={mutedColor} /><input type="email" placeholder="البريد الإلكتروني" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="am-field" style={styles.inputGroup}><IoLockClosedOutline size={20} color={mutedColor} /><input type="password" placeholder="كلمة المرور" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <button type="submit" style={styles.btnSubmit}>دخول</button>
            </form>
            {message && <p style={styles.messageBox}>{message}</p>}
            <p style={styles.linkText} onClick={() => setCurrentPage('forgotPassword')}>نسيت كلمة المرور؟</p>
            <p style={styles.linkText} onClick={() => setCurrentPage('register')}>ليس لديك حساب؟ إنشاء حساب جديد</p>
          </div>
        );
      }
    } else if (currentPage === 'register') {
      return (
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>إنشاء حساب جديد</h2>
          <form onSubmit={handleRegister}>
            <div className="am-field" style={styles.inputGroup}><IoPersonAddOutline size={20} color={mutedColor} /><input type="text" placeholder="الاسم الكامل" style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="am-field" style={styles.inputGroup}><IoMailOutline size={20} color={mutedColor} /><input type="email" placeholder="البريد الإلكتروني" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="am-field" style={styles.inputGroup}><IoLockClosedOutline size={20} color={mutedColor} /><input type="password" placeholder="كلمة المرور" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <button type="submit" style={styles.btnSubmit}>تسجيل</button>
          </form>
          {message && <p style={styles.messageBox}>{message}</p>}
          <p style={styles.linkText} onClick={() => setCurrentPage('account')}>لديك حساب بالفعل؟ تسجيل الدخول</p>
        </div>
      );
    } else if (currentPage === 'forgotPassword') {
      return (
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>استعادة كلمة المرور</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', color: mutedColor, fontSize: '14px'}}>أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
          <form onSubmit={handleResetPassword}>
            <div className="am-field" style={styles.inputGroup}><IoMailOutline size={20} color={mutedColor} /><input type="email" placeholder="البريد الإلكتروني" style={styles.input} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required /></div>
            <button type="submit" style={styles.btnSubmit}>إرسال الرابط</button>
          </form>
          <p style={styles.linkText} onClick={() => setCurrentPage('account')}>العودة لتسجيل الدخول</p>
        </div>
      );
    } else if (currentPage === 'showMyQR') {
      return (
        <div style={styles.qrContainer}>
          <h2 style={{color: darkColor, marginTop: 0, marginBottom: '8px', fontWeight: 800}}>رمز العميل الخاص بك</h2>
          <p style={{color: mutedColor, marginBottom: '20px', textAlign: 'center', fontSize: '14px'}}>اعرض هذا الرمز للمسؤول لإضافة النقاط إلى حسابك.</p>
          <div style={{padding: '14px', background: '#fff', borderRadius: '20px', border: `2px solid ${primaryColor}`}}>
            <QRCodeSVG value={`https://asads-mall.com/user/${user.uid}`} size={240} />
          </div>
          <button style={{...styles.btnSubmit, marginTop: '26px', background: 'rgba(229,72,77,0.1)', color: dangerColor}} onClick={() => setCurrentPage('account')}>رجوع</button>
        </div>
      );
    } else if (currentPage === 'adminScanner') {
      return (
        <div style={{textAlign: 'center'}}>
          <h2 style={{...pageTitle, marginBottom: '20px'}}>امسح رمز العميل</h2>
          <div id="admin-reader" style={{width: '100%', borderRadius: '20px', overflow: 'hidden', background: '#fff'}}></div>
          <button onClick={() => setCurrentPage('admin')} style={{...styles.btnSubmit, marginTop: '20px', background: 'rgba(229,72,77,0.1)', color: dangerColor}}>إلغاء</button>
        </div>
      );
    } else if (currentPage === 'adminGivePoints') {
      return (
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>إضافة نقاط للعميل</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', color: mutedColor, wordBreak: 'break-all'}}>العميل: {scannedUserName}</p>
          <form onSubmit={handleGivePointsToClient}>
            <div className="am-field" style={styles.inputGroup}>
              <input type="number" placeholder="عدد النقاط المراد إضافتها" style={{...styles.input, marginInlineStart: 0}} value={adminPointsToAdd} onChange={(e) => setAdminPointsToAdd(e.target.value)} required />
            </div>
            <button type="submit" style={styles.btnSubmit}>تأكيد الإضافة</button>
          </form>
          <button style={{...styles.btnSubmit, marginTop: '10px', background: 'rgba(229,72,77,0.1)', color: dangerColor}} onClick={() => setCurrentPage('admin')}>إلغاء</button>
        </div>
      );
    } else if (currentPage === 'admin') {
      return (
        <div>
          <h2 style={pageTitle}>لوحة تحكم الإدارة</h2>

          <div style={{...styles.adminBox, border: `1.5px solid ${warnColor}`}}>
            <h3 style={{...styles.adminTitle, color: '#b45309'}}>طلبات استبدال الهدايا ({redeemRequests.length})</h3>
            {redeemRequests.length === 0 ? <p style={{color: mutedColor, margin: 0}}>لا توجد طلبات حالياً.</p> : (
              redeemRequests.map(req => (
                <div key={req.id} style={styles.requestCard}>
                  <div>
                    <p style={{margin: '0 0 4px 0', fontWeight: 700, fontSize: '14px', wordBreak: 'break-all'}}>{req.userEmail}</p>
                    <p style={{margin: 0, fontSize: '13px', color: mutedColor}}>طلب: {req.giftName} ({req.giftCost} نقطة)</p>
                  </div>
                  <button style={styles.btnComplete} onClick={() => handleCompleteRequest(req.id)}>
                    <IoCheckmarkCircle size={18} /> تم التسليم
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{...styles.adminBox, background: `linear-gradient(135deg, ${primaryColor}, #2d7bff)`}}>
            <h3 style={{...styles.adminTitle, color: '#fff'}}><IoScanOutline size={22} /> شاشة المسح للمسؤول</h3>
            <button style={{...styles.btnSubmit, background: '#fff', color: primaryColor}} onClick={startAdminScanner}><IoQrCodeOutline size={20} /> فتح الماسح</button>
          </div>

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><IoGiftOutline size={20} color={primaryColor} /> إضافة هدية جديدة</h3>
            <form onSubmit={handleAddGift}>
              <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="اسم الهدية" style={{...styles.input, marginInlineStart: 0}} value={newGiftTitle} onChange={(e) => setNewGiftTitle(e.target.value)} required /></div>
              <div className="am-field" style={styles.inputGroup}><input type="number" placeholder="تكلفة النقاط" style={{...styles.input, marginInlineStart: 0}} value={newGiftCost} onChange={(e) => setNewGiftCost(e.target.value)} required /></div>
              <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="رابط الصورة" style={{...styles.input, marginInlineStart: 0}} value={newGiftImage} onChange={(e) => setNewGiftImage(e.target.value)} /></div>
              <button type="submit" style={{...styles.btnSubmit, background: successColor}}><IoAdd size={20} /> إضافة الهدية</button>
            </form>
            <div style={{marginTop: '14px'}}>
              {gifts.map(g => (
                <div key={g.id} style={listRow}>
                  <span style={{fontSize: '14px', fontWeight: 600}}>{g.title} ({g.cost} نقطة)</span>
                  <button style={styles.btnDelete} onClick={() => handleDeleteGift(g.id)}><IoTrashOutline /></button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><IoStorefrontOutline size={20} color="#9333ea" /> إضافة وكيل جديد</h3>
            <form onSubmit={handleAddAgent}>
              <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="اسم الوكيل" style={{...styles.input, marginInlineStart: 0}} value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} required /></div>
              <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="العنوان / الموقع" style={{...styles.input, marginInlineStart: 0}} value={newAgentLocation} onChange={(e) => setNewAgentLocation(e.target.value)} required /></div>
              <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="رابط صورة الوكيل" style={{...styles.input, marginInlineStart: 0}} value={newAgentImage} onChange={(e) => setNewAgentImage(e.target.value)} /></div>
              <button type="submit" style={{...styles.btnSubmit, background: '#9333ea'}}><IoAdd size={20} /> إضافة الوكيل</button>
            </form>
            <div style={{marginTop: '14px'}}>
              {agents.map(a => (
                <div key={a.id} style={listRow}>
                  <span style={{fontSize: '14px', fontWeight: 600}}>{a.name}</span>
                  <button style={styles.btnDelete} onClick={() => handleDeleteAgent(a.id)}><IoTrashOutline /></button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><IoAdd size={22} color={warnColor} /> إضافة منتج لوكيل</h3>
            <div style={{marginBottom: '14px'}}>
              <select onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value))} style={{...styles.input, marginInlineStart: 0, padding: '12px', background: '#f2f5fb', borderRadius: '14px', width: '100%'}}>
                <option value="">-- اختر الوكيل --</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {selectedAgent && (
              <form onSubmit={handleAddProduct}>
                <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="اسم المنتج" style={{...styles.input, marginInlineStart: 0}} value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required /></div>
                <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="السعر" style={{...styles.input, marginInlineStart: 0}} value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} required /></div>
                <div className="am-field" style={styles.inputGroup}><input type="text" placeholder="رابط صورة المنتج" style={{...styles.input, marginInlineStart: 0}} value={newProductImage} onChange={(e) => setNewProductImage(e.target.value)} /></div>
                <button type="submit" style={{...styles.btnSubmit, background: warnColor}}><IoAdd size={20} /> إضافة المنتج</button>
              </form>
            )}
            {/* قائمة منتجات الوكيل مع الحذف */}
            {selectedAgent && (
              <div style={{marginTop: '20px'}}>
                <h4 style={{margin: '0 0 8px 0', fontWeight: 800}}>منتجات {selectedAgent.name}</h4>
                {agentProducts.length === 0 ? <p style={{fontSize: '12px', color: mutedColor}}>لا توجد منتجات لهذا الوكيل.</p> : (
                  agentProducts.map(p => (
                    <div key={p.id} style={listRow}>
                      <span style={{fontSize: '14px', fontWeight: 600}}>{p.name} ({p.price})</span>
                      <button style={styles.btnDelete} onClick={() => handleDeleteProduct(p.id)}><IoTrashOutline /></button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={styles.adminBox}>
            <h3 style={styles.adminTitle}><IoTimeOutline size={20} color={primaryColor} /> سجل العمليات (للإدارة)</h3>
            {allTransactions.length === 0 ? <p style={{color: mutedColor, margin: 0}}>لا توجد عمليات حتى الآن.</p> : (
              allTransactions.map(t => (
                <div key={t.id} style={{...styles.transactionCard, background: '#f7f9fd', boxShadow: 'none', borderRightColor: t.amount > 0 ? successColor : dangerColor}}>
                  <div>
                    <p style={{margin: '0 0 4px 0', fontWeight: 700, fontSize: '13px', wordBreak: 'break-all'}}>{t.userEmail}</p>
                    <p style={{margin: 0, fontSize: '12px', fontWeight: 700, color: t.amount > 0 ? successColor : dangerColor}}>{t.type} ({t.amount > 0 ? `+${t.amount}` : t.amount})</p>
                    <p style={{margin: '5px 0 0 0', fontSize: '11px', color: '#a0a8bd'}}>{formatDate(t.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }
    return <div style={{textAlign: 'center', marginTop: '50px', color: mutedColor}}>هذه الصفحة قيد الإنشاء...</div>;
  };

  const isAccountTab = currentPage === 'account' || currentPage === 'register';
  const isAgentsTab = currentPage === 'agents';

  return (
    <div className="am-app" style={styles.container}>
      <style>{globalCss}</style>
      <header style={styles.topBar}>
        <button style={styles.iconBtn} onClick={() => setCurrentPage('menu')} aria-label="القائمة"><IoMenuOutline /></button>
        <div style={styles.logoArea}>
          <img src="https://static.iimg.live/uploads/fantastic-picture-5667.jpg" alt="Logo" style={styles.logoImg} />
          <div style={styles.logoText}>مجمع اسعد العزاوي</div>
        </div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <button style={styles.iconBtn} onClick={() => setCurrentPage('notifications')} aria-label="الإشعارات">
            <IoNotificationsOutline />
            {myTransactions.length > 0 && <span style={{position: 'absolute', top: '-4px', left: '-4px', background: dangerColor, color: 'white', borderRadius: '10px', minWidth: '18px', height: '18px', padding: '0 5px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff'}}>{myTransactions.length}</span>}
          </button>
          <button style={styles.iconBtn} onClick={() => setCurrentPage('gifts')} aria-label="الهدايا"><IoGiftOutline /></button>
        </div>
      </header>
      <main key={currentPage} className="am-page" style={styles.main}>{renderPage()}</main>
      <nav style={styles.bottomNav}>
        <div style={{...styles.navItem, ...(currentPage === 'home' ? styles.navActive : {})}} onClick={() => setCurrentPage('home')}>{currentPage === 'home' ? <IoHome size={22} /> : <IoHomeOutline size={22} />} الرئيسية</div>
        <div style={{...styles.navItem, ...(currentPage === 'gifts' ? styles.navActive : {})}} onClick={() => setCurrentPage('gifts')}>{currentPage === 'gifts' ? <IoGift size={22} /> : <IoGiftOutline size={22} />} الهدايا</div>
        <div style={{...styles.navItem, ...(isAccountTab ? styles.navActive : {})}} onClick={() => setCurrentPage('account')}>{isAccountTab ? <IoPerson size={22} /> : <IoPersonOutline size={22} />} حسابي</div>
        <div style={{...styles.navItem, ...(isAgentsTab ? styles.navActive : {})}} onClick={() => setCurrentPage('agents')}>{isAgentsTab ? <IoGrid size={22} /> : <IoGridOutline size={22} />} القائمة</div>
      </nav>
    </div>
  );
}

export default App;
