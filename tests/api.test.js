const request = require("supertest");
const app = require("../index");

describe("Dylan API - GET /api/rankings", () => {
  it("should respond with rankings", async () => {
    const res = await request(app).get("/api/rankings");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("rankings");
    expect(Array.isArray(res.body.rankings)).toBe(true);
  });
});
