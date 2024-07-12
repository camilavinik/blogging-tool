const express = require('express');
const router = express.Router();
const bycript = require('bcrypt');

const { dbGet } = require('../helpers/promises');

router.get('/', (req, res) => {
  res.render('login.ejs');
});

router.post('/', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Get user from the email
    const userQuery =
      'SELECT user_id FROM email_accounts WHERE email_address = ?';
    const user = await dbGet(userQuery, [email]);

    // If user does not exist, return invalid password for security reasons
    if (!user) return res.status(401).send('Invalid password');

    // Get the password from the users table
    const passwordQuery = 'SELECT hashed_password FROM users WHERE user_id = ?';
    const { hashed_password: userPassword } = await dbGet(passwordQuery, [
      user.user_id,
    ]);

    // Compare the password to the stored hashed password
    bycript.compare(password, userPassword, (err, result) => {
      // If there is an error, send the error on to the error handler
      if (err) return next(err);
      // If the password is incorrect, return invalid password
      if (!result) return res.status(401).send('Invalid password');

      // Save the user_id in the session
      req.session.user_id = user.user_id;

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
