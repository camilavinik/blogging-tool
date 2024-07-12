const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/index.js');

const { dbRun, dbAll, dbGet } = require('../helpers/promises.js');

/**
 * @route GET /author/:user_id
 * @desc Get author information and render the author's home page.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @returns {HTML} The author's home page
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
      'SELECT article_id, title, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id = ? AND published_at NOT NULL';
    const draftArticlesQuery =
      'SELECT article_id, title, content, created_at, published_at, last_modified, number_of_reads, number_of_likes FROM articles WHERE user_id = ? AND published_at IS NULL';

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

/**
 * @route GET /author/:user_id/settings
 * @desc Get author settings information and render the author's settings page.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @returns {HTML} The author's settings page
 */
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

/**
 * @route POST /author/:user_id/settings/edit
 * @desc Edit author settings information.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @param {string} req.body.authorName - The new author name
 * @param {string} req.body.blogTitle - The new blog title
 * @returns {Redirect} Redirects to the author's home page
 */
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
      res.redirect(`/author/${req.params.user_id}`);
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

/**
 * @route POST /author/:user_id/article/:article_id/delete
 * @desc Deletes an article.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @param {string} req.params.article_id - The article id to delete
 * @returns {Redirect} Redirects to the current page
 */
router.post(
  '/:user_id/article/:article_id/delete',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id, article_id } = req.params;

      // Define the query to delete the article
      const deleteQuery =
        'DELETE FROM articles WHERE article_id = ? AND user_id = ?';

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
 * @route POST /author/:user_id/article/:article_id/publish
 * @desc Publishes an article.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @param {string} req.params.article_id - The article id to publish
 * @returns {Redirect} Redirects to the current page
 */
router.post(
  '/:user_id/article/:article_id/publish',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id, article_id } = req.params;

      // Define the query to publish the article
      const publishQuery =
        'UPDATE articles SET published_at = CURRENT_TIMESTAMP WHERE article_id = ? AND user_id = ?';

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
 * @route GET /author/:user_id/article/new
 * @desc Renders the new article page.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @returns {HTML} The new article page
 */
router.get('/:user_id/article/new', isAuthenticated, async (req, res, next) => {
  try {
    // Render the page with an empty article
    res.render('author/article.ejs', {
      isNewArticle: true,
      title: '',
      content: '',
      authorName: req.session.user_name,
      authorId: req.session.user_id,
    });
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @route POST /author/:user_id/article/new
 * @desc Creates a new article.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @param {string} req.body.title - The title of the new article
 * @param {string} req.body.content - The content of the new article
 * @returns {Redirect} Redirects to the created article edit page
 */
router.post(
  '/:user_id/article/new',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const { title, content } = req.body;

      // Create the article
      const createArticleQuery = `INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)`;
      const { id: article_id } = await dbRun(createArticleQuery, [
        title,
        content,
        user_id,
      ]);

      res.redirect(`/author/${user_id}/article/${article_id}`);
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

/**
 * @route GET /author/:user_id/article/:article_id
 * @desc Get article information and render the article edit page.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @param {string} req.params.article_id - The article id
 * @returns {HTML} The article edit page
 */
router.get(
  '/:user_id/article/:article_id',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { user_id, article_id } = req.params;

      // Get article information
      const articleQuery =
        'SELECT article_id, title, content, user_id FROM articles WHERE article_id = ? AND user_id = ?';
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
 * @route POST /author/:user_id/article/:article_id/edit
 * @desc Edits an article.
 * @access Private (requires authentication and authorisation)
 * @param {string} req.params.user_id - The user id of the author (user)
 * @param {string} req.params.article_id - The article id to edit
 * @param {string} req.body.title - The new title of the article
 * @param {string} req.body.content - The new content of the article
 * @returns {Redirect} Redirects to the current page
 */
router.post(
  '/:user_id/article/:article_id/edit',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { article_id, user_id } = req.params;
      const { title, content } = req.body;

      // Define the query to edit the article
      const editQuery =
        'UPDATE articles SET last_modified = CURRENT_TIMESTAMP, title = ?, content = ? WHERE article_id = ? AND user_id = ?';

      // Execute the query
      await dbRun(editQuery, [title, content, article_id, user_id]);

      // Redirect to the page we were at
      res.redirect('back');
    } catch (err) {
      next(err); //send the error on to the error handler
    }
  }
);

module.exports = router;
