import { FaHome, FaGift, FaBell, FaBars, FaUser } from 'react-icons/fa';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="top-bar">
        <div className="top-icons">
          <FaBars className="icon" />
          <FaBell className="icon" />
          <FaGift className="icon" />
        </div>
        <div className="logo-area">
          <h2>مجمع اسعد العزاوي</h2>
        </div>
      </header>

      <main className="main-content">
        <div className="welcome-banner">
          <h1>مرحباً بك في مجمع اسعد العزاوي</h1>
          <p>اكتشف أفضل العروض والخدمات</p>
        </div>

        <div className="section-title">
          <h3>الوكلاء</h3>
          <span>عرض المزيد</span>
        </div>
        <div className="grid-container">
          <div className="card">وكيل 1</div>
          <div className="card">وكيل 2</div>
          <div className="card">وكيل 3</div>
        </div>
      </main>

      <nav className="bottom-nav">
        <div className="nav-item active"><FaHome /> الرئيسية</div>
        <div className="nav-item"><FaGift /> الهدايا</div>
        <div className="nav-item"><FaUser /> حسابي</div>
        <div className="nav-item"><FaBars /> القائمة</div>
      </nav>
    </div>
  );
}

export default App;
