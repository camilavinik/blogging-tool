const express = require('express');
const router = express.Router();
const util = require('util');

// Promisify the db methods
const dbRun = util.promisify(global.db.run).bind(global.db);
const dbAll = util.promisify(global.db.all).bind(global.db);
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
      authorId: req.params.id,
      blogTitle: author.blog_title
        ? author.blogTitle
        : `The blog of ${author.user_name}`,
    };

    // Define the query to articles table
    const publishedArticlesQuery = `SELECT id, name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id=${req.params.id} AND published_at NOT NULL`;
    const draftArticlesQuery = `SELECT id, name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id=${req.params.id} AND published_at IS NULL`;
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

router.get('/:id/settings', async (req, res, next) => {
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
      authorId: req.params.id,
      blogTitle: author.blog_title,
    };

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
    const deleteQuery = `DELETE FROM articles WHERE id=${req.body.id}`;
    // Execute the query
    await dbRun(deleteQuery);

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
    const publishQuery = `UPDATE articles SET published_at=CURRENT_TIMESTAMP WHERE id=${req.body.id}`;
    // Execute the query
    await dbRun(publishQuery);

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
    // Define the query to get selected article
    const articleQuery = `SELECT id, name, content, user_id FROM articles WHERE id=${req.params.id}`;
    // Execute the query
    const article = await dbGet(articleQuery);

    if (!article) return res.status(404).send('Article not found');

    // Get author information
    const authorQuery = `SELECT user_name, user_id FROM users WHERE user_id=${article.user_id}`;
    const author = await dbGet(authorQuery);

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
    const editQuery = `UPDATE articles SET last_modified=CURRENT_TIMESTAMP, name="${name}", content="${content}" WHERE id=${id}`;
    // Execute the query
    await dbRun(editQuery);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

module.exports = router;
