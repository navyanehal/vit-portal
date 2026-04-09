import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref as dRef, push, onValue } from 'firebase/database';
import { Upload, ChevronLeft, Loader2, Home, Menu, X } from 'lucide-react';

const CLOUD_NAME = "dvibaro5c"; 
const UPLOAD_PRESET = "VIT_Portal"; 

const SCHOOL_DATA = {
  "SBST": ["B.Tech Biotechnology", "Ph.D Bio Sciences"],
  "SCE": ["UG Civil Engineering", "PG M.Tech Civil"],
  "SCHEME": ["B.Tech Chemical Engineering"],
  "SCOPE": ["UG Computer Science", "AI/ML"],
  "SCORE": ["B.Tech IT", "MCA"],
  "SENSE": ["ECE", "VLSI Design"],
  "SELECT": ["Electrical Eng", "Power Systems"],
  "SMEC": ["Mechanical", "Mechatronics"],
  "SSL": ["Languages", "Economics"],
  "V-SIGN": ["Industrial Design"],
  "VSMART": ["Multimedia", "Visual Communication"],
  "V-SPARC": ["Architecture"],
  "Gravitas": ["Workshops", "Hackathons"],
  "Riviera": ["Star Night", "Fashion Show"],
  "Physical Education": ["Workout", "Sports Matches"],
  "Internal Events": ["Symposiums", "Clubs"]
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

  const goTo = (v, c = null) => {
    setView(v);
    setCat(c);
    setSidebarOpen(false);
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
      alert("Success! Published to VIT Portal.");
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

      <nav>
        <div className="nav-container">
          <div className="logo" onClick={() => goTo('landing')}>VIT PORTAL</div>
          <div className="nav-desktop">
            <span onClick={() => goTo('landing')}>Home</span>
            <span onClick={() => goTo('schools')}>Schools</span>
            <span onClick={() => goTo('detail', 'Gravitas')}>Gravitas</span>
            <span onClick={() => goTo('detail', 'Riviera')}>Riviera</span>
            <span onClick={() => goTo('detail', 'Physical Education')}>Sports</span>
            <span onClick={() => goTo('detail', 'Internal Events')}>Events</span>
            <button className="btn" style={{padding:'6px 15px', fontSize:'0.7rem'}} onClick={() => setShowModal(true)}>Upload</button>
          </div>
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* MOBILE SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>MENU</span>
          <button onClick={() => setSidebarOpen(false)}><X size={28} /></button>
        </div>
        <div className="sidebar-content">
          <div className="side-link" onClick={() => goTo('landing')}><Home size={18}/> Home</div>
          <div className="side-link" onClick={() => goTo('schools')}>Schools</div>
          <div className="side-link" onClick={() => goTo('detail', 'Gravitas')}>Gravitas</div>
          <div className="side-link" onClick={() => goTo('detail', 'Riviera')}>Riviera</div>
          <div className="side-link" onClick={() => goTo('detail', 'Physical Education')}>Sports</div>
          <div className="side-link" onClick={() => goTo('detail', 'Internal Events')}>Events</div>
          <button className="btn side-upload-btn" onClick={() => {setShowModal(true); setSidebarOpen(false);}}>Upload Video</button>
        </div>
      </div>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>}

      <main>
        {view === 'landing' && (
          <div className="hero-wrapper">
            <h1 className="hero-title">VIT VIDEO HUB</h1>
            <p className="hero-subtitle">The Cloud Archive for VITians</p>
            <button className="btn" style={{padding:'15px 40px'}} onClick={() => goTo('schools')}>Get Started</button>
          </div>
        )}

        {view === 'schools' && (
          <div className="grid">
            {Object.keys(SCHOOL_DATA).slice(0, 12).map(s => (
              <div key={s} className="playcard" onClick={() => goTo('detail', s)}>
                <h3>{s}</h3>
              </div>
            ))}
          </div>
        )}

        {view === 'detail' && (
          <div className="detail-view">
            <button className="btn" style={{background:'none', border:'1px solid white', padding:'8px 15px'}} onClick={() => goTo('schools')}>
              <ChevronLeft size={16}/> Back
            </button>
            <h1 className="cat-header">{cat}</h1>
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
              {videos.filter(v => v.cat === cat).length === 0 && <p style={{opacity:0.5}}>No videos yet.</p>}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{marginTop:0}}>{uploading ? 'Publishing...' : 'Upload Video'}</h2>
            {uploading ? (
              <div style={{textAlign:'center', padding:'30px 0'}}><Loader2 className="spinner" size={40} color="#1e90ff" /></div>
            ) : (
              <form onSubmit={handleUpload} className="upload-form">
                <input name="title" placeholder="Video Title" required />
                <select name="cat">
                  {Object.keys(SCHOOL_DATA).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input name="sub" placeholder="Program/Year" required />
                <input type="file" name="vid" accept="video/*" required />
                <button type="submit" className="btn">Publish Globally</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}