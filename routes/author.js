const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/index.js');

const { dbRun, dbAll, dbGet } = require('../helpers/promises.js');

/**
 * @desc //TODO WRITE
 */
router.get('/:user_id', isAuthenticated, async (req, res, next) => {
  let variables = {};

  try {
    // Get author information
    const userQuery =
      'SELECT user_name, blog_title FROM users WHERE user_id = ?';
    const author = await dbGet(userQuery, [req.params.user_id]);

    // If no author found return 404
    if (!author) return res.status(404).send('Author not found');

    // Set author variables for EJS template
    variables = {
      authorName: author.user_name,
      authorId: req.params.user_id,
      blogTitle: author.blog_title
        ? author.blog_title
        : `The blog of ${author.user_name}`,
    };

    // Define queries for draft and published articles
    const publishedArticlesQuery =
      'SELECT id, name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id = ? AND published_at NOT NULL';
    const draftArticlesQuery =
      'SELECT id, name, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id = ? AND published_at IS NULL';

    // Execute the queries at the same time
    const [publishedArticles, draftArticles] = await Promise.all([
      dbAll(publishedArticlesQuery, [req.params.user_id]),
      dbAll(draftArticlesQuery, [req.params.user_id]),
    ]);

    // Add published and draft articles to EJS variables
    variables = { ...variables, publishedArticles, draftArticles };

    // Render the page with the results
    res.render('author/home.ejs', variables);
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

router.get('/:user_id/settings', isAuthenticated, async (req, res, next) => {
  let variables = {};

  try {
    // Get author information
    const userQuery =
      'SELECT user_name, blog_title FROM users WHERE user_id = ?';
    const author = await dbGet(userQuery, [req.params.user_id]);

    // If no author found return 404
    if (!author) return res.status(404).send('Author not found');

    // Set author variables for EJS template
    variables = {
      authorName: author.user_name,
      authorId: req.params.user_id,
      blogTitle: author.blog_title,
    };

    // Render page with results
    res.render('author/settings.ejs', variables);
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

router.post(
  '/:user_id/settings/edit',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { authorName, blogTitle } = req.body;

      // Define the query to edit the users settings
      const editQuery =
        'UPDATE users SET user_name = ?, blog_title = ? WHERE user_id = ?';

      // Execute the query
      await dbRun(editQuery, [authorName, blogTitle, req.params.user_id]);

      // Redirect to the page we were at
      res.redirect('back');
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

/**
 * @desc //TODO WRITE
 */
router.post(
  '/:user_id/article/:article_id/delete',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id, article_id } = req.params;

      // Define the query to delete the article
      const deleteQuery = 'DELETE FROM articles WHERE id = ? AND user_id = ?';

      // Execute the query
      await dbRun(deleteQuery, [article_id, user_id]);

      // Redirect to the page we were at
      res.redirect('back');
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

/**
 * @desc //TODO WRITE
 */
router.post(
  '/:user_id/article/:article_id/publish',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id, article_id } = req.params;

      // Define the query to publish the article
      const publishQuery =
        'UPDATE articles SET published_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';

      // Execute the query
      await dbRun(publishQuery, [article_id, user_id]);

      // Redirect to the page we were at
      res.redirect('back');
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

/**
 * @desc //TODO WRITE
 */
router.get('/:user_id/article/new', isAuthenticated, async (req, res, next) => {
  try {
    // Render the page with an empty article
    res.render('author/article.ejs', {
      isNewArticle: true,
      name: '',
      content: '',
      authorName: req.session.user_name,
      authorId: req.session.user_id,
    });
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @desc //TODO WRITE
 */
router.post(
  '/:user_id/article/new',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const { name, content } = req.body;

      // Create the article
      const createArticleQuery = `INSERT INTO articles (name, content, user_id) VALUES (?, ?, ?)`;
      const { id } = await dbRun(createArticleQuery, [name, content, user_id]);

      res.redirect(`/author/${user_id}/article/${id}`);
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

/**
 * @desc //TODO WRITE
 */
router.get(
  '/:user_id/article/:article_id',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id, article_id } = req.params;

      // Get article information
      const articleQuery =
        'SELECT id, name, content, user_id FROM articles WHERE id = ? AND user_id = ?';
      const article = await dbGet(articleQuery, [article_id, user_id]);

      // If no article found return 404
      if (!article) return res.status(404).send('Article not found');

      // Render the page with the article
      res.render('author/article.ejs', {
        isNewArticle: false,
        ...article,
        // Author is the user of the session
        authorName: req.session.user_name,
        authorId: req.session.user_id,
      });
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

/**
 * @desc //TODO WRITE
 */
router.post(
  '/:user_id/article/:article_id/edit',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { article_id, user_id } = req.params;
      const { name, content } = req.body;

      // Define the query to edit the article
      const editQuery =
        'UPDATE articles SET last_modified = CURRENT_TIMESTAMP, name = ?, content = ? WHERE id = ? AND user_id = ?';

      // Execute the query
      await dbRun(editQuery, [name, content, article_id, user_id]);

      // Redirect to the page we were at
      res.redirect('back');
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

module.exports = router;
