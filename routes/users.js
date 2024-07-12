/**
 * users.js
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 * and the suggested pattern for retrieving data by executing queries
 *
 * NB. it's better NOT to use arrow functions for callbacks with the SQLite library
 *
 */

const express = require('express');
const { dbRun, dbGet } = require('../helpers/promises');
const router = express.Router();
const bcrypt = require('bcrypt');

/**
 * @desc Display all the users
 */
router.get('/list-users', (req, res, next) => {
  // Define the query
  query = 'SELECT * FROM users';

  // Execute the query and render the page with the results
  global.db.all(query, function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.json(rows); // render page as simple json
    }
  });
});

/**
 * @desc Displays a page with a form for creating a user record
 */
router.get('/signup', (req, res) => {
  res.render('add-user.ejs');
});

/**
 * @desc Add a new user to the database based on data from the submitted form
 */
router.post('/signup', async (req, res, next) => {
  const { user_name, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to users table
    const signupQuery =
      'INSERT INTO users (user_name, hashed_password) VALUES (?, ?)';
    const { id: user_id } = await dbRun(signupQuery, [
      user_name,
      hashedPassword,
    ]);

    // Add email to email table
    const emailQuery =
      'INSERT INTO email_accounts (email_address, user_id) VALUES (?, ?)';
    await dbRun(emailQuery, [email, user_id]);

    // Log the user in
    req.session.user_id = user_id;
    req.session.user_name = user_name;

    // Redirect to home page
    res.redirect('/');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

// Export the router object so index.js can access it
module.exports = router;
