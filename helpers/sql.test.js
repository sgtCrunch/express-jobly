const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("Testing function sqlForPartialUpdate", function () {

  test("works with valid data no variable correction", function () {
    const adj = sqlForPartialUpdate({firstName: 'Aliya', age: 32},{});
    const ans = {"setCols": `"firstName"=$1, "age"=$2`, "values": ["Aliya", 32]}
;

    expect(adj).toEqual(ans);
  });

  test("works with valid data and variable correction", function () {
    const adj = sqlForPartialUpdate({firstName: 'Aliya', age: 32},{firstName : "first_name"});
    const ans = {"setCols": `"first_name"=$1, "age"=$2`, "values": ["Aliya", 32]}

    expect(adj).toEqual(ans);
  });

  test("BadRequest ERROR when no Data is passed", function () {
    try{
      const adj = sqlForPartialUpdate({},{});
    }
    catch (err){
      expect(err instanceof BadRequestError).toBeTruthy();
    }
    
  });

});
