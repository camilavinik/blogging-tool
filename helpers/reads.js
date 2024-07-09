const util = require('util');

const dbAll = util.promisify(global.db.all).bind(global.db);

/** Update read count by 1 for the selected articleId */
const addRead = async articleId => {
  const addRead =
    'UPDATE articles SET number_of_reads=number_of_reads + 1 WHERE id=?';
  await dbAll(addRead, [articleId]);
};

/** Decrease read count by 1 for the selected articleId */
const removeRead = async articleId => {
  const addRead =
    'UPDATE articles SET number_of_reads=number_of_reads - 1 WHERE id=?';
  await dbAll(addRead, [articleId]);
};

module.exports = {
  addRead,
  removeRead,
};
