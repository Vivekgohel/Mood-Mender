const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const secretKey = require('crypto').randomBytes(32).toString('hex');

const app = express();
const PORT = process.env.PORT || 3000;

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
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initialize express-session middleware
app.use(session({
  secret: secretKey, // Set your own secret key
  resave: false,
  saveUninitialized: true
}));

// Serve the HTML file without login and signup forms
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

// Serve the HTML file with the signup form
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/loginValidate.html');
});

// After login, redirect to the dashboard
app.post('/login', (req, res) => {
  // Fetch user data from the request body
  const { email, password } = req.body;

  console.log('Received login request:', { email, password });

  // Check if user exists in the database
  const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal server error');
      return;
    }

    console.log('Database query results:', results);

    // If user exists, redirect to dashboard
    if (results.length > 0) {
      res.redirect('/dashboard');
    } else {
      res.send('<script>alert("Invalid email and password."); window.location.href = "/";</script>');
    }
  });
});

// Route to handle signup
app.post('/signup', (req, res) => {
  // Fetch user data from the request body
  const { username, email, password } = req.body;

  // Check if user already exists in the database
  db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal server error');
      return;
    }

    // If user already exists, send error message
    if (results.length > 0) {
      res.status(400).send('User already signed up. Please login.');
    } else {
      // Insert new user data into the database
      db.query('INSERT INTO user (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, result) => {
        if (err) {
          console.error('Error inserting into database:', err);
          res.status(500).send('Internal server error');
          return;
        }
        // Send a popup message
        res.send('<script>alert("Signup successful! You can now login."); window.location.href = "/";</script>');
      });
    }
  });
});


// Route to handle dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// Route to handle logout
app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).send('Internal server error');
      return;
    }
    // Redirect to the home page after logout
    res.redirect('/');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
