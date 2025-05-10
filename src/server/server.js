// server.js
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const saltRounds = 10;

// Middleware
app.use(cors());
app.use(express.json()); // bodyParser.json() is built into express now

// Database Configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Love@2338',
  database: process.env.DB_NAME || 'vigilentaidsdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper Functions
const handleDatabaseError = (err, res) => {
  console.error('Database error:', err);
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      error: 'Username or phone number already exists.' 
    });
  }
  
  res.status(500).json({ error: 'Internal server error.' });
};

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password, cell_number, country } = req.body;

  if (!username || !password || !cell_number || !country) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await pool.execute(
      'INSERT INTO user (username, password, cell_number, country) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, cell_number, country]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully!' 
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT * FROM user WHERE username = ?', 
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Remove password before sending user data
    const { password: _, ...userData } = user;
    
    res.status(200).json({ 
      success: true, 
      message: 'Login successful!',
      user: userData
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

app.put('/api/update', async (req, res) => {
  const { username, country, phone, password } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const updates = [];
    const values = [];

    if (country?.trim()) {
      updates.push('country = ?');
      values.push(country.trim());
    }

    if (phone?.trim()) {
      updates.push('cell_number = ?');
      values.push(phone.trim());
    }

    if (password?.trim()) {
      const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    values.push(username);
    
    const [result] = await pool.execute(
      `UPDATE user SET ${updates.join(', ')} WHERE username = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User updated successfully!' 
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

app.delete('/api/delete', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM user WHERE username = ?',
      [username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Account deleted successfully.' 
    });
  } catch (err) {
    handleDatabaseError(err, res);
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});