const express = require('express');
const router = express.Router();
const bycript = require('bcrypt');

const { dbGet } = require('../helpers/promises');

/**
 * @route GET /login
 * @desc Display the login form
 * @access Public
 * @returns {HTML} The login form
 */
router.get('/', (req, res) => {
  res.render('login.ejs');
});

/**
 * @route POST /login
 * @desc Log the user in
 * @access Public
 * @param {string} req.body.email - The user's email
 * @param {string} req.body.password - The user's password
 * @returns {Redirect} Redirect to the home page or the original URL
 */
router.post('/', async (req, res, next) => {
  try {
    const { email, password } = req.body;
  
    // Get user from the email
    const emailQuery =
      'SELECT user_id FROM email_accounts WHERE email_address = ?';
    const user = await dbGet(emailQuery, [email]);

    // If user does not exist, return invalid password for security reasons
    if (!user) return res.status(401).send('Invalid password');

    // Get the password from the users table
    const userQuery =
      'SELECT hashed_password, user_name FROM users WHERE user_id = ?';
    const { hashed_password: userPassword, user_name } = await dbGet(
      userQuery,
      [user.user_id]
    );

    // Compare the password to the stored hashed password
    bycript.compare(password, userPassword, (err, result) => {
      // If there is an error, send the error on to the error handler
      if (err) return next(err);
      // If the password is incorrect, return invalid password
      if (!result) return res.status(401).send('Invalid password');

      // Save the user_id and user_name in the session
      req.session.user_id = user.user_id;
      req.session.user_name = user_name;

      // Save the original URL in the session and delete it
      const redirectUrl = req.session.originalUrl;
      req.session.originalUrl = null;

      // Redirect to the original URL or the home page
      res.redirect(redirectUrl ?? '/');
    });
  } catch (err) {
    next(err); // send the error on to the error handler
  }
});

module.exports = router;
