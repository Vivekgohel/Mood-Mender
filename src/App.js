const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create connection to MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mood-mender'
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

// Serve the HTML file with the login and signup forms
app.get('/', (req, res) => {
  res.sendFile(path.resolve('../public/loginValidate.html'));
});


// Route to handle login
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
      res.send('Invalid email or password');
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
        res.status(200).sendFile(path.resolve('../public/home.html'));
      });
    }
  });
});

// Route to handle dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
