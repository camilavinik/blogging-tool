const express = require('express');
const router = express.Router();

const { dbRun, dbAll, dbGet } = require('../helpers/promises.js');
const { addRead, removeRead } = require('../helpers/reads.js');

/**
 * @desc Display reader's home page
 */
router.get('/:id', async (req, res, next) => {
  let variables = {};

  try {
    // Get author information
    const authorQuery =
      'SELECT user_name, blog_title FROM users WHERE user_id=?';
    const author = await dbGet(authorQuery, [req.params.id]);

    // If no author found return 404
    if (!author) return res.status(404).send('Author not found');

    // Set author variables for EJS template
    variables = {
      currentUser: req.session.user_name, // pass the current user to the template
      authorName: author.user_name,
      authorId: req.params.id,
      blogTitle: author.blog_title
        ? author.blog_title
        : `The blog of ${author.user_name}`,
    };

    // Get author's articles
    const articlesQuery =
      'SELECT id, name, published_at, number_of_reads, number_of_likes FROM articles WHERE user_id=? AND published_at NOT NULL ORDER BY published_at DESC';
    const articles = await dbAll(articlesQuery, [req.params.id]);

    // Add articles to EJS template variables
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
router.get('/article/:article_id', async (req, res, next) => {
  try {
    const { article_id } = req.params;

    // Get article information
    const articleQuery =
      'SELECT id, name, content, user_id, number_of_likes, number_of_reads, published_at FROM articles WHERE id = ?';
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
 * @desc //TODO WRITE
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
      commented_by || req.session.user_name, // If no name is provided, then its a logged in user
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
 * @desc //TODO WRITE
 */
router.post('/article/:article_id/like', async (req, res, next) => {
  try {
    const { article_id } = req.params;

    // Update like count by 1
    const addRead =
      'UPDATE articles SET number_of_likes = number_of_likes + 1 WHERE id = ?';
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
