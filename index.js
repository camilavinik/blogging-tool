/**
 * index.js
 * This is your main app entry point
 */

// Set up express, bodyparser and EJS
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')); // set location of static files

app.set('trust proxy', 1); // trust first proxy
app.use(
  session({
    secret: 'secret key for the project', // Ideally, it should be an environment var, it is not for this project purpose
    resave: false,
    saveUninitialized: true,
  })
);

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db', function (err) {
  if (err) {
    console.error(err);
    process.exit(1); // bail out we can't connect to the DB
  } else {
    console.log('Database connected');
    global.db.run('PRAGMA foreign_keys=ON'); // tell SQLite to pay attention to foreign key constraints
  }
});

/**
 * @route GET /
 * @desc Display the main home page
 * @access Public
 * @returns {HTML} The main home page
 */
app.get('/', (req, res) => {
  // Define the query
  query = 'SELECT user_name, user_id FROM users';

  // Execute the query and render the page with the results
  global.db.all(query, function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.render('home.ejs', {
        authors: rows,
        currentUser: req.session.user_name, // pass the current user to the template
      });
    }
  });
});

/**
 * @route POST /logout
 * @desc Log the user out
 * @access Public
 * @returns {Redirect} Redirect to the main home page
 */
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Login routes
const loginRoutes = require('./routes/login');
app.use('/login', loginRoutes);

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Add all the route handlers in authorRoutes to the app under the path /author
const authorRoutes = require('./routes/author');
app.use('/author', authorRoutes);

// Add all the route handlers in readerRoutes to the app under the path /reader
const readerRoutes = require('./routes/reader');
app.use('/reader', readerRoutes);

// Make the web application listen for HTTP requests
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
