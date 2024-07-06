const express = require('express');
const router = express.Router();
const util = require('util');

const dbAll = util.promisify(global.db.all).bind(global.db);
const dbGet = util.promisify(global.db.get).bind(global.db);

/**
 * @desc Display reader's home page
 */
router.get('/:id', async (req, res, next) => {
  let variables = {};

  try {
    // Define the query to users table
    const authorQuery = `SELECT user_name, blog_title FROM users WHERE user_id=${req.params.id} `;
    // Execute the query
    const author = await dbGet(authorQuery);

    if (!author) {
      return res.status(404).send('Author not found');
    }

    variables = {
      authorName: author.user_name,
      authorId: req.params.id,
      blogTitle: author.blog_title
        ? author.blogTitle
        : `The blog of ${author.user_name}`,
    };

    // Define the query to articles table ordered
    const articlesQuery = `SELECT id, name, published_at, number_of_reads, number_of_likes FROM articles WHERE user_id=${req.params.id} AND published_at NOT NULL ORDER BY published_at DESC`;
    // Execute the query
    const articles = await dbAll(articlesQuery);

    variables = { ...variables, articles };

    // Render the page with the results
    res.render('reader/home.ejs', variables);
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

// Export the router object so index.js can access it
module.exports = router;
