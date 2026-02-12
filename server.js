import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Students table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    parent_name TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    class_id INTEGER,
    enrollment_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Classes table
  db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age_group TEXT,
    description TEXT,
    capacity INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    teacher_name TEXT,
    schedule TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Announcements table
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Contact submissions table
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    student_id INTEGER,
    role TEXT DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
  )`);

  // OTP table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample data if tables are empty
  db.get("SELECT COUNT(*) as count FROM classes", (err, row) => {
    if (!err && row.count === 0) {
      const sampleClasses = [
        ['Toddler Class', '2-3 years', 'Fun learning activities for toddlers', 15, 0, 'Ms. Sarah', 'Mon-Fri, 9:00 AM - 12:00 PM'],
        ['Pre-K Class', '4-5 years', 'Preparing for kindergarten', 20, 0, 'Ms. Emily', 'Mon-Fri, 9:00 AM - 2:00 PM'],
        ['Kindergarten', '5-6 years', 'Full day kindergarten program', 22, 0, 'Ms. Jessica', 'Mon-Fri, 8:30 AM - 3:00 PM']
      ];
      const stmt = db.prepare("INSERT INTO classes (name, age_group, description, capacity, current_enrollment, teacher_name, schedule) VALUES (?, ?, ?, ?, ?, ?, ?)");
      sampleClasses.forEach(classData => stmt.run(classData));
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as count FROM announcements", (err, row) => {
    if (!err && row.count === 0) {
      const sampleAnnouncements = [
        ['Welcome Back!', 'Welcome to the new school year! We are excited to have everyone back.', new Date().toISOString().split('T')[0]],
        ['Parent-Teacher Meeting', 'Parent-teacher meetings will be held next week. Please check your email for scheduling.', new Date().toISOString().split('T')[0]],
        ['School Event', 'Join us for our annual school festival this Saturday at 10 AM!', new Date().toISOString().split('T')[0]]
      ];
      const stmt = db.prepare("INSERT INTO announcements (title, content, date) VALUES (?, ?, ?)");
      sampleAnnouncements.forEach(announcement => stmt.run(announcement));
      stmt.finalize();
    }
  });
});

// Helper function to promisify database queries
const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Routes

// Get all classes
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await dbAll('SELECT * FROM classes ORDER BY id');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single class
app.get('/api/classes/:id', async (req, res) => {
  try {
    const classData = await dbGet('SELECT * FROM classes WHERE id = ?', [req.params.id]);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await dbAll(`
      SELECT s.*, c.name as class_name 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id 
      ORDER BY s.created_at DESC
    `);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, age, parent_name, parent_email, parent_phone, class_id } = req.body;
    const enrollment_date = new Date().toISOString().split('T')[0];
    
    const result = await dbRun(
      'INSERT INTO students (name, age, parent_name, parent_email, parent_phone, class_id, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, age, parent_name, parent_email, parent_phone, class_id, enrollment_date]
    );

    // Update class enrollment
    if (class_id) {
      await dbRun('UPDATE classes SET current_enrollment = current_enrollment + 1 WHERE id = ?', [class_id]);
    }

    res.status(201).json({ id: result.id, message: 'Student registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await dbAll('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new announcement
app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const announcementDate = date || new Date().toISOString().split('T')[0];
    
    const result = await dbRun(
      'INSERT INTO announcements (title, content, date) VALUES (?, ?, ?)',
      [title, content, announcementDate]
    );

    res.status(201).json({ id: result.id, message: 'Announcement created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit contact form
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    const result = await dbRun(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone, message]
    );

    res.status(201).json({ id: result.id, message: 'Contact form submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts (admin)
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await dbAll('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await dbGet('SELECT class_id FROM students WHERE id = ?', [req.params.id]);
    
    await dbRun('DELETE FROM students WHERE id = ?', [req.params.id]);
    
    // Update class enrollment
    if (student && student.class_id) {
      await dbRun('UPDATE classes SET current_enrollment = current_enrollment - 1 WHERE id = ?', [student.class_id]);
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
    Server running on http://localhost:${PORT}`);
});

