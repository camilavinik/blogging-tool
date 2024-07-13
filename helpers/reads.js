const { dbRun } = require('./promises.js');

/**
 * @desc Increaes read count by 1 for the selected article
 * @param {number} articleId - The id of the article to increase the read count
 * @returns {Promise}
 */
const addRead = articleId => {
  const addRead =
    'UPDATE articles SET number_of_reads = number_of_reads + 1 WHERE article_id = ?';

  return dbRun(addRead, [articleId]);
};

/**
 * @desc Decreases read count by 1 for the selected article
 * @param {number} articleId - The id of the article to decrease the read count
 * @returns {Promise}
 */
const removeRead = async articleId => {
  const addRead =
    'UPDATE articles SET number_of_reads = number_of_reads - 1 WHERE article_id = ?';

  return dbRun(addRead, [articleId]);
};

module.exports = {
  addRead,
  removeRead,
};
