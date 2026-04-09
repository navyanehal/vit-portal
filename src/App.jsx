import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { ref as dRef, push, onValue } from 'firebase/database';
import { Upload, ChevronLeft, Loader2 } from 'lucide-react';

// ==========================================
// 1. YOUR CLOUD KEYS
// ==========================================
const CLOUD_NAME = "dvibaro5c"; 
const UPLOAD_PRESET = "VIT_Portal"; 

// ==========================================
// 2. FULL VIT DATA
// ==========================================
const DATA = {
  "SBST": ["B.Tech. Biotechnology", "PG: Biotechnology", "PG: Biomedical Genetics", "Applied Microbiology", "Ph.D.: Biotechnology"],
  "SCE": ["UG Civil Engineering", "PG M.Tech Civil", "Ph.D. programme"],
  "SCHEME": ["B.Tech. in Chemical Engineering"],
  "SCOPE": ["UG: Computer Science", "PG: Computer Science", "Ph.D.: Image Processing"],
  "SCORE": ["B.Tech IT", "B.Tech CSE-AI", "BCA", "MCA", "M.Tech Software Eng"],
  "SENSE": ["ECE", "Electronics & Computer Eng", "VLSI Design & Tech", "Automotive Electronics"],
  "SELECT": ["B.Tech Electronics & Inst.", "B.Tech Electrical", "Control & Automation", "Power Systems"],
  "SMEC": ["Mechanical", "Mechatronics", "Automotive", "CAD/CAM", "Manufacturing"],
  "SSL": ["Languages", "Ph.D Commerce", "Ph.D Economics", "Ph.D Psychology"],
  "V-SIGN": ["B.Des (Industrial Design)", "M.Des (Industrial Design)", "Ph.D. in Design"],
  "VSMART": ["B.Sc. Multimedia & Animation", "B.Sc. Visual Communication"],
  "V-SPARC": ["5-year Architecture Program"],
  "SHINE": ["Healthcare Science", "Ph.D. programmes"],
  "VAIAL": ["Agriculture (UG/PG)", "Research programmes", "Extension activities"],
  "SAS": ["M.Sc. Chemistry", "M.Sc. Physics", "M.Sc. Mathematics"],
  "VIT BS": ["BBA", "MBA", "Ph.D. Management"],
  "V-GIRL": ["Women empowerment events", "Internal workshops"],
  "Gravitas": ["Workshops", "Hackathons", "Robotics", "Techno-Management"],
  "Riviera": ["Star Night Highlights", "Cultural Performances", "Fashion Show"],
  "Physical Education": ["Workout Tutorials", "Sports Matches", "Yoga", "Fitness Vlogs"],
  "Internal Events": ["School Symposiums", "Club Activities", "Inauguration Ceremonies"]
};

export default function App() {
  const [view, setView] = useState('landing'); 
  const [cat, setCat] = useState(null);
  const [videos, setVideos] = useState([]);
  const [up, setUp] = useState(false); 
  const [showModal, setShowModal] = useState(false); 

  // 3. FETCH GLOBAL FEED FROM FIREBASE
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

  // 4. UPLOAD LOGIC
  const handleUpload = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const file = f.get('vid');
    if(!file) return;

    setUp(true);
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

      setUp(false); 
      setShowModal(false);
      alert("Success! Published to Global VIT Feed.");
    } catch (err) {
      alert("Upload failed. Check your connection.");
      setUp(false);
    }
  };

  return (
    <div className="app">
      {/* BACKGROUND VIDEO */}
      <div className="bg-wrap">
        <video autoPlay muted loop playsInline className="bg-video">
          <source src="https://res.cloudinary.com/dvibaro5c/video/upload/q_auto/f_auto/v1712680000/campus_y8fgok.mp4" type="video/mp4" />
        </video>
        <div className="overlay"></div>
      </div>

      {/* NAVIGATION BAR */}
      <nav>
        <div className="logo" onClick={() => setView('landing')}>VIT PORTAL</div>
        <div className="nav-links">
          <span onClick={() => setView('schools')}>Schools</span>
          <span onClick={() => {setCat('Gravitas'); setView('detail')}}>Gravitas</span>
          <span onClick={() => {setCat('Riviera'); setView('detail')}}>Riviera</span>
          <span onClick={() => {setCat('Physical Education'); setView('detail')}}>Sports</span>
          <span onClick={() => {setCat('Internal Events'); setView('detail')}}>Events</span>
          <button className="btn" style={{padding: '8px 20px', fontSize: '0.7rem'}} onClick={() => setShowModal(true)}>
            <Upload size={14} style={{marginRight: 8}} /> Upload
          </button>
        </div>
      </nav>

      {/* MAIN VIEWPORT */}
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
            {Object.keys(DATA).slice(0, 17).map(s => (
              <div key={s} className="playcard" onClick={() => {setCat(s); setView('detail')}}>
                <h3>{s}</h3>
              </div>
            ))}
          </div>
        )}

        {view === 'detail' && (
          <div style={{padding: '120px 8% 60px'}}>
            <button className="btn" style={{background:'none', border:'1px solid white'}} onClick={() => setView('schools')}>
              <ChevronLeft size={16}/> Back
            </button>
            <h1 style={{fontSize: '3.5rem', margin: '20px 0', textTransform: 'uppercase'}}>{cat}</h1>
            <div className="v-grid">
              {videos.filter(v => v.cat === cat).map(v => (
                <div key={v.id} className="v-card">
                  <video controls className="feed-video" src={v.url} />
                  <div style={{padding: 20}}>
                    <h4 style={{margin:0, fontSize: '1.2rem'}}>{v.title}</h4>
                    <p style={{fontSize: '0.8rem', opacity: 0.6}}>{v.sub}</p>
                  </div>
                </div>
              ))}
              {videos.filter(v => v.cat === cat).length === 0 && <p style={{opacity: 0.5}}>No community uploads here yet.</p>}
            </div>
          </div>
        )}
      </main>

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginTop: 0}}>{up ? 'Publishing to Cloud...' : 'Upload Video'}</h2>
            {up ? (
              <div style={{textAlign: 'center', padding: '30px 0'}}>
                <Loader2 className="spinner" size={40} color="#1e90ff" />
                <p style={{marginTop: 20}}>Processing high-quality video...</p>
              </div>
            ) : (
              <form onSubmit={handleUpload}>
                <input name="title" placeholder="Video Title" required />
                <select name="cat">
                  {Object.keys(DATA).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input name="sub" placeholder="Program Name (e.g. B.Tech 2nd Year)" required />
                <input type="file" name="vid" accept="video/*" required />
                <button type="submit" className="btn" style={{width:'100%', marginTop: 20}}>Publish Globally</button>
                <button type="button" onClick={() => setShowModal(false)} style={{width:'100%', background:'none', color:'white', border:'none', marginTop: 10, cursor:'pointer'}}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}