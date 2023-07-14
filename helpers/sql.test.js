const { sqlForPartialUpdate } = require("sql");


describe("Testing function sqlForPartialUpdate", function () {

  test("works with valid data no variable correction", function () {
    const adj = sqlForPartialUpdate({firstName: 'Aliya', age: 32},{});
    const ans = `"firstName"=$1, "age"=$2`;

    expect(adj).toEqual(ans);
  });

  test("works with valid data and variable correction", function () {
    const adj = sqlForPartialUpdate({firstName: 'Aliya', age: 32},{firstName : "first_name"});
    const ans = `"first_name"=$1, "age"=$2`;

    expect(adj).toEqual(ans);
  });

  test("BadRequest ERROR when no Data is passed", function () {
    const adj = sqlForPartialUpdate({},{});

    expect(adj.statusCode).toEqual(400);
  });

});
