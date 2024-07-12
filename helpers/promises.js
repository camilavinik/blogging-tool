const util = require('util');

/**
 * Promisified version of global.db.run for executing SQL queries that modify data.
 * Used for INSERT, UPDATE, DELETE statements.
 *
 * @param {string} sql - The SQL query to execute.
 * @param {Array} [params] - Optional array of parameters for the SQL query.
 * @returns {Promise<Object>} - A promise that resolves with the modified object id
 */
function dbRun(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
}

/**
 * Promisified version of global.db.all for executing SQL queries that return multiple rows.
 * Used for SELECT statements returning multiple rows.
 *
 * @param {string} sql - The SQL query to execute.
 * @param {Array} [params] - Optional array of parameters for the SQL query.
 * @returns {Promise<Array>}
 */
const dbAll = util.promisify(global.db.all).bind(global.db);

/**
 * Promisified version of global.db.get for executing SQL queries that return a single row.
 * Used for SELECT statements returning only one row.
 *
 * @param {string} sql - The SQL query to execute.
 * @param {Array} [params] - Optional array of parameters for the SQL query.
 * @returns {Promise<Object>}
 */
const dbGet = util.promisify(global.db.get).bind(global.db);

module.exports = {
  dbRun,
  dbAll,
  dbGet,
};
