// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SECRET = 'dev-secret-please-change';
const dbFile = path.join(__dirname, 'data.db');
const db = new Database(dbFile);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: uploadDir });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadDir));

// Initialize DB (fresh schema includes donor_name and message and stories table)
function init() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'donor',
      extra TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS causes (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      goal_amount REAL,
      raised_amount REAL DEFAULT 0,
      photo TEXT,
      end_date TEXT,
      creator_id INTEGER,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();

  // donations now include donor_name and message (for anonymous donors)
  db.prepare(`CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
    donor_name TEXT,
    cause_id INTEGER,
    amount REAL,
    message TEXT,
    place TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      cause_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id,cause_id)
  )`).run();

  // stories created when goals are reached (or ad-hoc)
  db.prepare(`CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY,
      title TEXT,
      name TEXT,
      story TEXT,
    image TEXT,
    video TEXT,
      approved INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();

  // seed admin qwe / 123 (admin email admin@donatenow.local)
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@donatenow.local');
  if(!admin){
    const pw = bcrypt.hashSync('123', 8);
    db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)')
      .run('Admin','admin@donatenow.local', pw, 'admin');
    console.log('Seeded admin (admin@donatenow.local / 123)');
  }
}
init();

// Backwards-compatible schema migrations (add columns if missing)
try{
  db.prepare("ALTER TABLE donations ADD COLUMN place TEXT").run();
}catch(e){}
try{
  db.prepare("ALTER TABLE stories ADD COLUMN video TEXT").run();
}catch(e){}

// helpers
function generateToken(user){ return jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: '7d' }); }
function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'No token'});
  const token = auth.split(' ')[1];
  try{
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; next();
  }catch(e){ return res.status(401).json({error:'Invalid token'}); }
}
// optionalAuth - if Authorization header present decode, otherwise continue with no user
function optionalAuth(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) { req.user = null; return next(); }
  const token = auth.split(' ')[1];
  try{
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
  }catch(e){
    req.user = null;
  }
  next();
}

// routes (register/login - unchanged)
app.post('/api/register', (req,res)=>{
  const {name,email,password} = req.body;
  if(!email||!password||!name) return res.status(400).json({error:'Missing fields'});
  const exists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(exists) return res.status(400).json({error:'User exists'});
  const pw = bcrypt.hashSync(password, 8);
  const info = db.prepare('INSERT INTO users (name,email,password) VALUES (?,?,?)').run(name,email,pw);
  const user = db.prepare('SELECT id,name,email,role FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = generateToken(user);
  res.json({user,token});
});

app.post('/api/login', (req,res)=>{
  const {email,password} = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(!user) return res.status(400).json({error:'Invalid'});
  const ok = bcrypt.compareSync(password, user.password);
  if(!ok) return res.status(400).json({error:'Invalid'});
  const safe = {id:user.id,name:user.name,email:user.email,role:user.role};
  const token = generateToken(safe);
  res.json({user:safe,token});
});

// list causes
app.get('/api/causes', (req,res)=>{
  const rows = db.prepare('SELECT c.*, u.name as creator_name FROM causes c LEFT JOIN users u ON c.creator_id=u.id WHERE active=1 ORDER BY c.created_at DESC').all();
  res.json(rows);
});

// get single cause (including donations list)
app.get('/api/causes/:id', (req,res)=>{
  const id = req.params.id;
  const cause = db.prepare('SELECT c.*, u.name as creator_name FROM causes c LEFT JOIN users u ON c.creator_id=u.id WHERE c.id = ?').get(id);
  if(!cause) return res.status(404).json({error:'Not found'});
  const donations = db.prepare('SELECT donor_name, amount, message, place, timestamp FROM donations WHERE cause_id = ? ORDER BY timestamp DESC').all(id);
  res.json({ cause, donations });
});

// create cause (auth)
app.post('/api/causes', authMiddleware, upload.single('photo'), (req,res)=>{
  const {title,description,goal_amount,end_date} = req.body;
  if(!title||!goal_amount) return res.status(400).json({error:'Missing fields'});
  const photo = req.file ? '/uploads/' + req.file.filename : null;
  const info = db.prepare('INSERT INTO causes (title,description,goal_amount,end_date,photo,creator_id) VALUES (?,?,?,?,?,?)')
    .run(title,description,parseFloat(goal_amount), end_date, photo, req.user.id);
  const cause = db.prepare('SELECT * FROM causes WHERE id = ?').get(info.lastInsertRowid);
  res.json(cause);
});

// edit cause
app.put('/api/causes/:id', authMiddleware, upload.single('photo'), (req,res)=>{
  const id = req.params.id;
  const cause = db.prepare('SELECT * FROM causes WHERE id = ?').get(id);
  if(!cause) return res.status(404).json({error:'Not found'});
  if(req.user.role!=='admin' && req.user.id!==cause.creator_id) return res.status(403).json({error:'Forbidden'});
  const {title,description,goal_amount,end_date,active} = req.body;
  const photo = req.file ? '/uploads/' + req.file.filename : cause.photo;
  db.prepare('UPDATE causes SET title=?,description=?,goal_amount=?,end_date=?,photo=?,active=? WHERE id=?')
    .run(title||cause.title, description||cause.description, goal_amount?parseFloat(goal_amount):cause.goal_amount, end_date||cause.end_date, photo, active!==undefined?active: cause.active, id);
  const updated = db.prepare('SELECT * FROM causes WHERE id = ?').get(id);
  res.json(updated);
});

// delete cause
app.delete('/api/causes/:id', authMiddleware, (req,res)=>{
  const id = req.params.id;
  const cause = db.prepare('SELECT * FROM causes WHERE id = ?').get(id);
  if(!cause) return res.status(404).json({error:'Not found'});
  if(req.user.role!=='admin' && req.user.id!==cause.creator_id) return res.status(403).json({error:'Forbidden'});
  db.prepare('DELETE FROM causes WHERE id = ?').run(id);
  res.json({ok:true});
});

// like toggle
app.post('/api/causes/:id/like', authMiddleware, (req,res)=>{
  const id = req.params.id;
  const like = db.prepare('SELECT * FROM likes WHERE user_id = ? AND cause_id = ?').get(req.user.id, id);
  if(like){
    db.prepare('DELETE FROM likes WHERE id = ?').run(like.id);
    return res.json({liked:false});
  } else {
    try{
      db.prepare('INSERT INTO likes (user_id,cause_id) VALUES (?,?)').run(req.user.id, id);
      return res.json({liked:true});
    }catch(e){
      return res.json({liked:false, error: String(e)});
    }
  }
});

/*
  Donate endpoint:
  - optionalAuth allows anonymous donations (no token required)
  - accepts { name, message, amount }
  - creates donation row with donor_name and message; user_id is set if authenticated
  - updates causes.raised_amount, and if goal reached => mark active=0 and create a Success Story
*/
app.post('/api/causes/:id/donate', optionalAuth, (req,res)=>{
  const id = req.params.id;
  const { amount, name, message, place } = req.body;
  if(!amount || isNaN(parseFloat(amount))) return res.status(400).json({error:'Invalid amount'});

  const cause = db.prepare('SELECT * FROM causes WHERE id = ?').get(id);
  if(!cause) return res.status(404).json({error:'Cause not found'});
  if(cause.active === 0) return res.status(400).json({error:'Cause is closed'});

  const donorName = name && name.trim().length ? name.trim() : (req.user ? req.user.name : 'Anonymous');
  const userId = req.user ? req.user.id : null;

  // insert donation
  const info = db.prepare('INSERT INTO donations (user_id, donor_name, cause_id, amount, message, place) VALUES (?,?,?,?,?,?)')
    .run(userId, donorName, id, parseFloat(amount), message || null, place || null);

  // update raised amount
  db.prepare('UPDATE causes SET raised_amount = raised_amount + ? WHERE id = ?').run(parseFloat(amount), id);
  const updatedCause = db.prepare('SELECT * FROM causes WHERE id = ?').get(id);

  // check if goal reached now
  const goal = updatedCause.goal_amount || 0;
  const raised = updatedCause.raised_amount || 0;
  let goalReached = false;
  if (goal > 0 && raised >= goal && updatedCause.active == 1) {
    // mark inactive (closed)
    db.prepare('UPDATE causes SET active = 0 WHERE id = ?').run(id);
    goalReached = true;
    // create a success story for the cause creator (if exists)
    const creator = db.prepare('SELECT id, name FROM users WHERE id = ?').get(updatedCause.creator_id);
    const storyTitle = `${updatedCause.title} — Goal Reached`;
    const storyAuthor = creator ? creator.name : 'Organizer';
    const storyText = `This cause "${updatedCause.title}" has reached its goal of ₹${goal.toLocaleString()} thanks to generous donors. Created by ${storyAuthor}.`;
    db.prepare('INSERT INTO stories (title, name, story, approved) VALUES (?,?,?,1)').run(storyTitle, storyAuthor, storyText);
  }

  return res.json({ ok:true, donationId: info.lastInsertRowid, goalReached });
});

// profile endpoints (unchanged)
app.get('/api/me', authMiddleware, (req,res)=>{
  const user = db.prepare('SELECT id,name,email,role,extra FROM users WHERE id = ?').get(req.user.id);
  const donations = db.prepare('SELECT d.*, c.title as cause_title FROM donations d LEFT JOIN causes c ON d.cause_id=c.id WHERE d.user_id = ? ORDER BY d.timestamp DESC').all(req.user.id);
  const created = db.prepare('SELECT * FROM causes WHERE creator_id = ?').all(req.user.id);
  const likes = db.prepare('SELECT l.*, c.title FROM likes l LEFT JOIN causes c ON l.cause_id=c.id WHERE l.user_id = ?').all(req.user.id);
  res.json({user,donations,created,likes});
});

// analytics
app.get('/api/analytics/summary', (req,res)=>{
  const rows = db.prepare('SELECT c.id, c.title, SUM(d.amount) as total FROM causes c LEFT JOIN donations d ON d.cause_id = c.id GROUP BY c.id').all();
  res.json(rows);
});

app.get('/api/causes/:id/transactions', (req,res)=>{
  const id = req.params.id;
  const rows = db.prepare('SELECT d.*, u.name as donor_user FROM donations d LEFT JOIN users u ON d.user_id = u.id WHERE d.cause_id = ? ORDER BY d.timestamp DESC').all(id);
  res.json(rows);
});

// stories list
app.get('/api/stories', (req,res)=>{
  const rows = db.prepare('SELECT * FROM stories WHERE approved = 1 ORDER BY created_at DESC').all();
  res.json(rows);
});

// create a story (requires auth and must be cause creator or admin)
app.post('/api/stories', authMiddleware, upload.single('media'), (req,res)=>{
  const { cause_id, title, story } = req.body;
  if(!cause_id || !title || !story) return res.status(400).json({ error: 'Missing fields' });
  const cause = db.prepare('SELECT * FROM causes WHERE id = ?').get(cause_id);
  if(!cause) return res.status(404).json({ error: 'Cause not found' });
  // only creator or admin allowed
  if(req.user.role !== 'admin' && req.user.id !== cause.creator_id) return res.status(403).json({ error: 'Forbidden' });

  let imagePath = null;
  let videoPath = null;
  if(req.file){
    const saved = '/uploads/' + req.file.filename;
    if(req.file.mimetype && req.file.mimetype.startsWith('image/')) imagePath = saved;
    else videoPath = saved;
  }

  const authorName = req.user.name || 'Organizer';
  const info = db.prepare('INSERT INTO stories (title, name, story, image, video, approved) VALUES (?,?,?,?,?,1)').run(title, authorName, story, imagePath, videoPath);
  const newStory = db.prepare('SELECT * FROM stories WHERE id = ?').get(info.lastInsertRowid);
  res.json({ ok:true, story: newStory });
});

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Server started on', PORT));
