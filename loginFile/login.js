// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Create connection to MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mood_mender_user'
});

// Connect to database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});

// Initialize Express app
const app = express();

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle signup
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
    if (err) {
      throw err;
    }

    if (results.length > 0) {
      res.status(400).send('User already signed up. Please login.');
    } else {
      // Insert new user data into the database
      db.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, result) => {
        if (err) {
          throw err;
        }
        res.status(200).send('Signup successful. Please login.');
      });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
