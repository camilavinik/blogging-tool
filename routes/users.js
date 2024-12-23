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
 * @route GET users/signup
 * @desc Display the signup form
 * @access Public
 * @returns {HTML} The signup form
 */
router.get('/signup', (req, res) => {
  res.render('add-user.ejs');
});

/**
 * @route POST users/signup
 * @desc Create a new user record and log the user in
 * @access Public
 * @param {string} req.body.user_name - The user's name
 * @param {string} req.body.email - The user's email
 * @param {string} req.body.password - The user's password
 * @returns {HTML} Redirect to the main home page
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { user_name, email, password } = req.body;

    // Check if the user already exists
    const checkUserQuery =
      'SELECT email_address FROM email_accounts WHERE email_address = ?';
    const existingEmail = await dbGet(checkUserQuery, [email]);

    if (existingEmail) return res.status(400).send('Email already in use');

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
