import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref as dRef, push, onValue } from 'firebase/database';
import { Upload, ChevronLeft, Loader2, Home, Menu, X } from 'lucide-react';

// ==========================================
// CONFIGURATION
// ==========================================
const CLOUD_NAME = "dvibaro5c"; 
const UPLOAD_PRESET = "VIT_Portal"; 

const SCHOOL_DATA = {
  "SBST": ["B.Tech Biotechnology", "PG: Biotechnology", "PG: Applied Microbiology", "Ph.D: Bio Sciences"],
  "SCE": ["UG Civil Engineering", "PG M.Tech Civil", "Ph.D Civil"],
  "SCHEME": ["B.Tech Chemical Engineering"],
  "SCOPE": ["UG Computer Science", "PG Computer Science", "Ph.D CS Research"],
  "SCORE": ["B.Tech IT", "B.Tech CSE-AI", "BCA", "MCA", "M.Tech Software Eng"],
  "SENSE": ["ECE", "Electronics & Computer Eng", "VLSI Design", "Embedded Systems"],
  "SELECT": ["Electrical Eng", "Control & Automation", "Power Systems"],
  "SMEC": ["Mechanical", "Mechatronics", "Automotive", "CAD/CAM"],
  "SSL": ["Languages", "Ph.D Commerce", "Ph.D Economics", "Ph.D Psychology"],
  "V-SIGN": ["B.Des Industrial Design", "M.Des Industrial Design"],
  "VSMART": ["B.Sc Multimedia & Animation", "Visual Communication"],
  "V-SPARC": ["5-year Architecture Program"],
  "Gravitas": ["Workshops", "Hackathons", "Robotics"],
  "Riviera": ["Star Night", "Cultural Highlights", "Fashion Show"],
  "Physical Education": ["Workout", "Sports Matches", "Yoga"],
  "Internal Events": ["Symposiums", "Clubs", "Inaugurations"]
};

export default function App() {
  const [view, setView] = useState('landing'); 
  const [cat, setCat] = useState(null);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const vRef = dRef(db, 'videos');
    return onValue(vRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setVideos(list.reverse());
      }
    });
  }, []);

  const navigate = (newView, category = null) => {
    setView(newView);
    setCat(category);
    setSidebarOpen(false); // Close sidebar whenever we navigate
    window.scrollTo(0,0);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const file = f.get('vid');
    if(!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("resource_type", "video");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
        method: "POST",
        body: data
      });
      const fileData = await res.json();
      await push(dRef(db, 'videos'), {
        title: f.get('title'),
        cat: f.get('cat'),
        sub: f.get('sub'),
        url: fileData.secure_url,
        createdAt: Date.now()
      });
      setUploading(false); setShowModal(false);
      alert("Success! Video is now public.");
    } catch (err) {
      alert("Upload failed.");
      setUploading(false);
    }
  };

  return (
    <div className="app">
      <div className="bg-wrap">
        <video autoPlay muted loop playsInline className="bg-video">
          <source src="https://res.cloudinary.com/dvibaro5c/video/upload/q_auto/f_auto/v1712680000/campus_y8fgok.mp4" type="video/mp4" />
        </video>
        <div className="overlay"></div>
      </div>

      {/* DESKTOP NAV & MOBILE HEADER */}
      <nav>
        <div className="nav-container">
          <div className="logo" onClick={() => navigate('landing')}>VIT PORTAL</div>
          
          {/* Desktop Only Links */}
          <div className="desktop-links">
            <span onClick={() => navigate('landing')}>Home</span>
            <span onClick={() => navigate('schools')}>Schools</span>
            <span onClick={() => navigate('detail', 'Gravitas')}>Gravitas</span>
            <span onClick={() => navigate('detail', 'Riviera')}>Riviera</span>
            <span onClick={() => navigate('detail', 'Physical Education')}>Sports</span>
            <span onClick={() => navigate('detail', 'Internal Events')}>Events</span>
            <button className="btn upload-btn-small" onClick={() => setShowModal(true)}>Upload</button>
          </div>

          {/* Mobile Only Hamburger */}
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* MOBILE SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">MENU</div>
          <button onClick={() => setSidebarOpen(false)}><X size={28} /></button>
        </div>
        <div className="sidebar-links">
          <span onClick={() => navigate('landing')}><Home size={18}/> Home</span>
          <span onClick={() => navigate('schools')}>Schools</span>
          <span onClick={() => navigate('detail', 'Gravitas')}>Gravitas</span>
          <span onClick={() => navigate('detail', 'Riviera')}>Riviera</span>
          <span onClick={() => navigate('detail', 'Physical Education')}>Sports</span>
          <span onClick={() => navigate('detail', 'Internal Events')}>Events</span>
          <button className="btn" onClick={() => {setShowModal(true); setSidebarOpen(false);}}>Upload Video</button>
        </div>
      </div>

      {/* BACKDROP FOR SIDEBAR */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main>
        {view === 'landing' && (
          <div className="hero-wrapper">
            <h1 className="hero-title">VIT VIDEO HUB</h1>
            <p className="hero-subtitle">The Cloud Archive for VITians</p>
            <button className="btn" onClick={() => navigate('schools')}>Get Started</button>
          </div>
        )}

        {view === 'schools' && (
          <div className="grid">
            {Object.keys(SCHOOL_DATA).slice(0, 12).map(s => (
              <div key={s} className="playcard" onClick={() => navigate('detail', s)}>
                <h3>{s}</h3>
              </div>
            ))}
          </div>
        )}

        {view === 'detail' && (
          <div className="detail-container">
            <button className="btn btn-outline" onClick={() => navigate('schools')}>
              <ChevronLeft size={16}/> Back
            </button>
            <h1 className="category-title">{cat}</h1>
            <div className="v-grid">
              {videos.filter(v => v.cat === cat).map(v => (
                <div key={v.id} className="v-card">
                  <video controls className="feed-video" src={v.url} />
                  <div className="v-info">
                    <h4>{v.title}</h4>
                    <p>{v.sub}</p>
                  </div>
                </div>
              ))}
              {videos.filter(v => v.cat === cat).length === 0 && <p className="empty-msg">No uploads yet.</p>}
            </div>
          </div>
        )}
      </main>

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginTop: 0}}>{uploading ? 'Processing...' : 'Upload Video'}</h2>
            {uploading ? (
              <div className="loader-box"><Loader2 className="spinner" size={40} /></div>
            ) : (
              <form onSubmit={handleUpload}>
                <input name="title" placeholder="Video Title" required />
                <select name="cat">
                  {Object.keys(SCHOOL_DATA).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input name="sub" placeholder="Program/Branch" required />
                <input type="file" name="vid" accept="video/*" required />
                <button type="submit" className="btn btn-block">Publish Globally</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-text">Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}