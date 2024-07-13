const express = require('express');
const router = express.Router();

const { dbRun, dbAll, dbGet } = require('../helpers/promises.js');
const { addRead, removeRead } = require('../helpers/reads.js');

/**
 * @route GET /reader/:user_id
 * @desc Get author information and render the author's home page.
 * @access Public
 * @param {string} req.params.user_id - The user id of the author
 * @returns {HTML} The author's home page
 */
router.get('/:user_id', async (req, res, next) => {
  let variables = {};

  try {
    // Get author information
    const authorQuery =
      'SELECT user_name, blog_title FROM users WHERE user_id = ?';
    const author = await dbGet(authorQuery, [req.params.user_id]);

    // If no author found return 404
    if (!author) return res.status(404).send('Author not found');

    // Set author variables for EJS template
    variables = {
      currentUser: req.session.user_name, // pass the current user to the template
      authorName: author.user_name,
      authorId: req.params.user_id,
      blogTitle: author.blog_title
        ? author.blog_title
        : `The blog of ${author.user_name}`,
    };

    // Get author's articles
    const articlesQuery =
      'SELECT article_id, title, published_at, number_of_reads, number_of_likes FROM articles WHERE user_id = ? AND published_at NOT NULL ORDER BY published_at DESC';
    const articles = await dbAll(articlesQuery, [req.params.user_id]);

    // Add articles to EJS template variables
    variables = { ...variables, articles };

    // Render the page with the results
    res.render('reader/home.ejs', variables);
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @route GET /reader/article/:article_id
 * @desc Get article information and render the article read page.
 * @access Public
 * @param {string} req.params.article_id - The article id
 * @returns {HTML} The article read page
 */
router.get('/article/:article_id', async (req, res, next) => {
  try {
    const { article_id } = req.params;

    // Get article information
    const articleQuery =
      'SELECT article_id, title, content, user_id, number_of_likes, number_of_reads, published_at FROM articles WHERE article_id = ?';
    const article = await dbGet(articleQuery, [article_id]);

    // If no article found return 404
    if (!article) return res.status(404).send('Article not found');

    // Get article's author information
    const authorQuery = 'SELECT user_name, user_id FROM users WHERE user_id=?';
    const author = await dbGet(authorQuery, [article.user_id]);

    // Get article comments
    const commentsQuery =
      'SELECT content, created_at, commented_by FROM comments WHERE article_id = ? ORDER BY created_at DESC';
    const comments = await dbAll(commentsQuery, [article_id]);

    // Update read count by 1
    await addRead(article_id);

    // Render the page with the article and author information
    res.render('reader/article.ejs', {
      currentUser: req.session.user_name, // pass the current user to the template
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
 * @route POST /reader/article/:article_id/comment
 * @desc Add a comment to an article
 * @access Public
 * @param {string} req.params.article_id - The article id
 * @param {string} req.body.content - The comment content
 * @param {string} req.body.commented_by - The name of the commenter
 * @returns {Redirect} Redirects to the current page
 */
router.post('/article/:article_id/comment', async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { content, commented_by } = req.body;

    // Create comment for the selected article
    const createComment =
      "INSERT INTO comments ('article_id', 'content', 'commented_by') VALUES (?, ?, ?)";
    await dbRun(createComment, [
      article_id,
      content,
      commented_by || req.session.user_name, // If no commenter name is provided, then its a logged in user
    ]);

    // Avoid counting read at reload
    await removeRead(article_id);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

/**
 * @route POST /reader/article/:article_id/like
 * @desc Like an article
 * @access Public
 * @param {string} req.params.article_id - The article id
 * @returns {Redirect} Redirects to the current page
 */
router.post('/article/:article_id/like', async (req, res, next) => {
  try {
    const { article_id } = req.params;

    // Update like count by 1
    const addRead =
      'UPDATE articles SET number_of_likes = number_of_likes + 1 WHERE article_id = ?';
    await dbRun(addRead, [article_id]);

    // Avoid counting read at reload
    await removeRead(article_id);

    // Redirect to the page we were at
    res.redirect('back');
  } catch (err) {
    next(err); //send the error on to the error handler
  }
});

// Export the router object so index.js can access it
module.exports = router;
