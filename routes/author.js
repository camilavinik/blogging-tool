const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/index.js');

const { dbRun, dbAll, dbGet } = require('../helpers/promises.js');

/**
 * @desc //TODO WRITE
 */
router.get('/:id', isAuthenticated, async (req, res, next) => {
  let variables = {};

  try {
    // Get author information
    const userQuery = 'SELECT user_name, blog_title FROM users WHERE user_id=?';
    const author = await dbGet(userQuery, [req.params.id]);

    // If no author found return 404
    if (!author) return res.status(404).send('Author not found');

    // Set author variables for EJS template
    variables = {
      authorName: author.user_name,
      authorId: req.params.id,
      blogTitle: author.blog_title
        ? author.blogTitle
        : `The blog of ${author.user_name}`,
    };

    // Define queries for draft and published articles
    const publishedArticlesQuery =
      'SELECT id, name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id=? AND published_at NOT NULL';
    const draftArticlesQuery =
      'SELECT id, name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id=? AND published_at IS NULL';

    // Execute the queries at the same time
    const [publishedArticles, draftArticles] = await Promise.all([
      dbAll(publishedArticlesQuery, [req.params.id]),
      dbAll(draftArticlesQuery, [req.params.id]),
    ]);

    // Add published and draft articles to EJS variables
    variables = { ...variables, publishedArticles, draftArticles };

    // Render the page with the results
    res.render('author/home.ejs', variables);
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

router.get('/:id/settings', async (req, res, next) => {
  let variables = {};

  try {
    // Get author information
    const userQuery = 'SELECT user_name, blog_title FROM users WHERE user_id=?';
    const author = await dbGet(userQuery, [req.params.id]);

    // If no author found return 404
    if (!author) return res.status(404).send('Author not found');

    // Set author variables for EJS template
    variables = {
      authorName: author.user_name,
      authorId: req.params.id,
      blogTitle: author.blog_title,
    };

    // Render page with results
    res.render('author/settings.ejs', variables);
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @desc //TODO WRITE
 */
router.post('/delete', async (req, res, next) => {
  try {
    // Define the query to delete the article
    const deleteQuery = 'DELETE FROM articles WHERE id=?';

    // Execute the query
    await dbRun(deleteQuery, [req.body.id]);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @desc //TODO WRITE
 */
router.post('/publish', async (req, res, next) => {
  try {
    // Define the query to publish the article
    const publishQuery =
      'UPDATE articles SET published_at=CURRENT_TIMESTAMP WHERE id=?';

    // Execute the query
    await dbRun(publishQuery, [req.body.id]);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @desc //TODO WRITE
 */
router.get('/article/:id', async (req, res, next) => {
  try {
    // Get article information
    const articleQuery =
      'SELECT id, name, content, user_id FROM articles WHERE id=?';
    const article = await dbGet(articleQuery, [req.params.id]);

    // If no article found return 404
    if (!article) return res.status(404).send('Article not found');

    // Get author information
    const authorQuery = 'SELECT user_name, user_id FROM users WHERE user_id=?';
    const author = await dbGet(authorQuery, [article.user_id]);

    // Render the page with the article
    res.render('author/article.ejs', {
      ...article,
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
router.post('/edit', async (req, res, next) => {
  try {
    const { id, name, content } = req.body;

    // Define the query to edit the article
    const editQuery =
      'UPDATE articles SET last_modified=CURRENT_TIMESTAMP, name="?", content="?" WHERE id=?';

    // Execute the query
    await dbRun(editQuery, [name, content, id]);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

module.exports = router;
