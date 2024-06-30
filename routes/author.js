const express = require('express');
const router = express.Router();
const util = require('util');

// Promisify the db.all method
const dbAll = util.promisify(global.db.all).bind(global.db);

// Promisify the db.get method
const dbGet = util.promisify(global.db.get).bind(global.db);

/**
 * @desc //TODO WRITE
 */
router.get('/:id', async (req, res, next) => {
  let variables = {};

  try {
    // Define the query to users table
    const userQuery = `SELECT user_name, blog_title FROM users WHERE user_id=${req.params.id}`;
    // Execute the query
    const author = await dbGet(userQuery);

    if (!author) {
      return res.status(404).send('User not found');
    }

    variables = {
      authorName: author.user_name,
      blogTitle: author.blog_title
        ? author.blogTitle
        : `The blog of ${author.user_name}`,
    };

    // Define the query to articles table
    const publishedArticlesQuery = `SELECT name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id=${req.params.id} AND published_at NOT NULL`;
    const draftArticlesQuery = `SELECT name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id=${req.params.id} AND published_at IS NULL`;
    // Execute the query
    const [publishedArticles, draftArticles] = await Promise.all([
      dbAll(publishedArticlesQuery),
      dbAll(draftArticlesQuery),
    ]);

    variables = { ...variables, publishedArticles, draftArticles };

    // Render the page with the results
    res.render('author/home.ejs', variables);
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

module.exports = router;
