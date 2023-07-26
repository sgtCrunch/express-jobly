"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 4,
    equity: "0.1",
    companyHandle: "c1"
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new",
            salary: 4,
            equity: .1,
            companyHandle: "c1"
          })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("bad request for non-admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          salary: 10
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new",
            salary: "4",
            equity: .1,
            companyHandle: "c1"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
                title: "J1",
                salary: 1,
                equity: "0.3",
                companyHandle: "c1"
              },
              {
                title: "J2",
                salary: 2,
                equity: "0.2",
                companyHandle: "c2"
              },
              {
                title: "J3",
                salary: 3,
                equity: "0.1",
                companyHandle: "c2"
              }
          ],
    });
  });

  test("fails: test next() handler", async function () {
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app).get(`/jobs/${id}`);
    expect(resp.body).toEqual({
      job: {
        title: "J1",
        salary: 1,
        equity: "0.3",
        companyHandle: "c1"
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin users", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "J1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        title: "J1-new",
        salary: 1,
        equity: "0.3",
        companyHandle: "c1"
      },
    });
  });

  test("Unauth for non-admin users", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "J1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });


  test("unauth for anon", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "J1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          id: 4
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          salary: "not-a-salary",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: id });
  });

  test("unauth for non-admin users", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const data = await db.query(`SELECT id FROM jobs;`);
    const id = data.rows[0].id;
    const resp = await request(app)
        .delete(`/jobs/${id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
