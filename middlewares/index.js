/**
 * @desc Middleware to check if the user is authenticated and has access to the requested route
 * */
const isAuthenticated = (req, res, next) => {
  // Get the user_id from the request parameters
  const user_id = parseInt(req.params.user_id, 10);

  // If the user_id is in the session and matches the id in the request parameters, the user is authenticated and has access
  if (req.session.user_id && req.session.user_id === user_id) {
    next();
  } else {
    // Save the original URL in the session to redirect after logging in
    req.session.originalUrl = req.originalUrl ?? '/';
    // Redirect to the login page
    res.redirect('/login');
  }
};

module.exports = { isAuthenticated };
