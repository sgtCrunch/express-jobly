"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 4,
    equity: .1,
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 4,
        equity: .1,
        companyHandle: "c1"
      }
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let job = await Job.findAll();
    expect(job).toEqual([
      {
        title: "J1",
        salary: 1,
        equity: .3,
        companyHandle: "c1"
      },
      {
        title: "J2",
        salary: 2,
        equity: .2,
        companyHandle: "c2"
      },
      {
        title: "J3",
        salary: 3,
        equity: .1,
        companyHandle: "c2"
      }
    ]);
  });

  test("works: titleLike filter", async function () {
    let jobs = await Job.findAll({titleLike : "j"});
    expect(jobs).toEqual([
      {
        title: "J1",
        salary: 1,
        equity: .3,
        companyHandle: "c1"
      },
      {
        title: "J2",
        salary: 2,
        equity: .2,
        companyHandle: "c2"
      },
      {
        title: "J3",
        salary: 3,
        equity: .1,
        companyHandle: "c2"
      }
    ]);
  });

  test("works: minSalary", async function () {
    let jobs = await Job.findAll({minSalary : 2});
    expect(jobs).toEqual([
      {
        title: "J2",
        salary: 2,
        equity: .2,
        companyHandle: "c2"
      },
      {
        title: "J3",
        salary: 3,
        equity: .1,
        companyHandle: "c2"
      }
    ]);
  });

  test("works: hasEquity", async function () {
    let jobs = await Job.findAll({hasEquity : true});
    expect(jobs).toEqual([
      {
        title: "J1",
        salary: 1,
        equity: .3,
        companyHandle: "c1"
      },
      {
        title: "J2",
        salary: 2,
        equity: .2,
        companyHandle: "c2"
      },
      {
        title: "J3",
        salary: 3,
        equity: .1,
        companyHandle: "c2"
      }
    ]);
  });

  test("Works all three filters", async function () {
    let jobs = await Job.findAll({titleLike : "3", minSalary : 3, hasEquity : false});
    expect(jobs).toEqual([
      {
        title: "J3",
        salary: 3,
        equity: .1,
        companyHandle: "c2"
      }
    ]);
  });
  
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      title: "J1",
      salary: 1,
      equity: .3,
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Company.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "newJ1",
    salary: 2,
    equity: .4,
    companyHandle: "c2"
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      ...updateData
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      title: "newJ1",
      salary: 2,
      equity: .4,
      companyHandle: "c2"
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "newJ1",
      salary: null,
      equity: null,
      companyHandle: "c2"
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      ...updateDataSetNulls
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      title: "newJ1",
      salary: null,
      equity: null,
      companyHandle: "c2"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs");
    expect(res.rows.length).toEqual(2);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
