const { BadRequestError } = require("../expressError");

/** Creates SQL string to set all values of an object passed in. 
 * Also returns an array of the updated values.
 * 
 * {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
 * */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
