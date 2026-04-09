import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref as dRef, push, onValue } from 'firebase/database';
import { Upload, ChevronLeft, Loader2, Home } from 'lucide-react';

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

      <nav>
        <div className="logo" onClick={() => setView('landing')}>VIT PORTAL</div>
        <div className="nav-links">
          {/* ADDED HOME BUTTON */}
          <span onClick={() => setView('landing')}>Home</span>
          <span onClick={() => setView('schools')}>Schools</span>
          <span onClick={() => {setCat('Gravitas'); setView('detail')}}>Gravitas</span>
          <span onClick={() => {setCat('Riviera'); setView('detail')}}>Riviera</span>
          <span onClick={() => {setCat('Physical Education'); setView('detail')}}>Sports</span>
          <span onClick={() => {setCat('Internal Events'); setView('detail')}}>Events</span>
          <button className="btn" style={{padding: '5px 15px', fontSize: '0.65rem'}} onClick={() => setShowModal(true)}>
            <Upload size={12} style={{marginRight: 5}} /> Upload
          </button>
        </div>
      </nav>

      <main>
        {view === 'landing' && (
          <div className="hero-wrapper">
            <h1 className="hero-title">VIT VIDEO HUB</h1>
            <p className="hero-subtitle">The Cloud Archive for VITians</p>
            <button className="btn" onClick={() => setView('schools')}>Explore Archives</button>
          </div>
        )}

        {view === 'schools' && (
          <div className="grid">
            {Object.keys(SCHOOL_DATA).slice(0, 12).map(s => (
              <div key={s} className="playcard" onClick={() => {setCat(s); setView('detail')}}>
                <h3>{s}</h3>
              </div>
            ))}
          </div>
        )}

        {view === 'detail' && (
          <div style={{padding: '100px 5% 60px'}}>
            <button className="btn" style={{background:'none', border:'1px solid white', padding:'8px 15px'}} onClick={() => setView('schools')}>
              <ChevronLeft size={14}/> Back
            </button>
            <h1 style={{fontSize: '2rem', margin: '15px 0', textTransform: 'uppercase'}}>{cat}</h1>
            <div className="v-grid">
              {videos.filter(v => v.cat === cat).map(v => (
                <div key={v.id} className="v-card">
                  <video controls className="feed-video" src={v.url} />
                  <div style={{padding: 15}}>
                    <h4 style={{margin:0, fontSize: '1rem'}}>{v.title}</h4>
                    <p style={{fontSize: '0.75rem', opacity: 0.6}}>{v.sub}</p>
                  </div>
                </div>
              ))}
              {videos.filter(v => v.cat === cat).length === 0 && <p style={{opacity: 0.5}}>No uploads yet.</p>}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginTop: 0, fontSize:'1.2rem'}}>{uploading ? 'Uploading...' : 'Upload Video'}</h2>
            {uploading ? (
              <div style={{textAlign: 'center', padding: '20px 0'}}>
                <Loader2 className="spinner" size={30} color="#1e90ff" />
              </div>
            ) : (
              <form onSubmit={handleUpload}>
                <input name="title" placeholder="Video Title" required />
                <select name="cat">
                  {Object.keys(SCHOOL_DATA).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input name="sub" placeholder="Program/Year" required />
                <input type="file" name="vid" accept="video/*" required />
                <button type="submit" className="btn" style={{width:'100%', marginTop: 15}}>Publish</button>
                <button type="button" onClick={() => setShowModal(false)} style={{width:'100%', background:'none', color:'white', border:'none', marginTop: 10}}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}