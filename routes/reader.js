const express = require('express');
const router = express.Router();
const util = require('util');

const dbAll = util.promisify(global.db.all).bind(global.db);
const dbGet = util.promisify(global.db.get).bind(global.db);
const dbRun = util.promisify(global.db.run).bind(global.db);

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

/**
 * @desc //TODO WRITE
 */
router.get('/article/:id', async (req, res, next) => {
  try {
    // Define the query to get selected article
    const articleQuery = `SELECT id, name, content, user_id, number_of_likes, number_of_reads FROM articles WHERE id=${req.params.id}`;
    // Execute the query
    const article = await dbGet(articleQuery);

    if (!article) return res.status(404).send('Article not found');

    // Get author information
    const authorQuery = `SELECT user_name, user_id FROM users WHERE user_id=${article.user_id}`;
    const author = await dbGet(authorQuery);

    // Get article comments
    const commentsQuery =
      'SELECT content, created_at FROM comments WHERE article_id=? ORDER BY created_at DESC';
    const comments = await dbAll(commentsQuery, [req.params.id]);

    // Update read count by 1
    const addRead =
      'UPDATE articles SET number_of_reads=number_of_reads + 1 WHERE id=?';
    await dbAll(addRead, [req.params.id]);

    // Render the page with the article
    res.render('reader/article.ejs', {
      ...article,
      number_of_reads: article.number_of_reads + 1,
      comments,
      authorName: author.user_name,
      authorId: author.user_id,
    });
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @desc //TODO WRITE
 */
router.post('/:id/comment', async (req, res, next) => {
  try {
    // Create comment for the selected article
    const createComment =
      "INSERT INTO comments ('article_id', 'content') VALUES (?, ?)";
    await dbRun(createComment, [req.params.id, req.body.content]);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @desc //TODO WRITE
 */
router.post('/:id/like', async (req, res, next) => {
  try {
    // Update read count by 1
    const addRead =
      'UPDATE articles SET number_of_likes=number_of_likes + 1 WHERE id=?';
    await dbAll(addRead, [req.params.id]);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

// Export the router object so index.js can access it
module.exports = router;
