const { dbRun } = require('./promises.js');

/** Update read count by 1 for the selected articleId */
const addRead = async articleId => {
  const addRead =
    'UPDATE articles SET number_of_reads = number_of_reads + 1 WHERE article_id = ?';
  await dbRun(addRead, [articleId]);
};

/** Decrease read count by 1 for the selected articleId */
const removeRead = async articleId => {
  const addRead =
    'UPDATE articles SET number_of_reads = number_of_reads - 1 WHERE article_id = ?';
  await dbRun(addRead, [articleId]);
};

module.exports = {
  addRead,
  removeRead,
};
