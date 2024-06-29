const express = require('express');
const router = express.Router();

/**
 * @desc //TODO WRITE
 */
router.get('/:id', (req, res, next) => {
  // Define the query
  query = `SELECT * FROM users WHERE user_id=${req.params.id}`;

  // Execute the query and render the page with the results
  global.db.all(query, function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      const author = rows[0];
      res.render('author/home.ejs', { authorName: author.user_name });
    }
  });
});

module.exports = router;
