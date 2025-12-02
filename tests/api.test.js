const request = require("supertest");
const app = require("../index");
const fs = require("fs");

const studentData = {
  students: [
    { id: "2409876d", rapid: 2000, blitz: 1500, bullet: 1300, createdAt: "2025" },
    { id: "2402133b", rapid: 1500, blitz: 1300, bullet: 1200, createdAt: "2025" },
    { id: "2402133i", rapid: 1600, blitz: 1800, bullet: 1400, createdAt: "2025" },
  ]
};

describe("Dylan API - GET /api/rankings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs.promises, "readFile").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return rankings sorted by rapid by default", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings");

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("rapid");
    expect(res.body.rankings[0].id).toBe("2409876d");
    expect(res.body.rankings[1].id).toBe("2402133i");
  });

  it("should return rankings sorted by rapid", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings?sortBy=rapid");

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("rapid");
    expect(res.body.rankings[0].id).toBe("2409876d");
    expect(res.body.rankings[1].id).toBe("2402133i");
  });

  it("should return rankings sorted by blitz", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings?sortBy=blitz");

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("blitz");
    expect(res.body.rankings[0].id).toBe("2402133i");
    expect(res.body.rankings[1].id).toBe("2409876d");
  });

  it("should return rankings sorted by bullet", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData))
    const res = await request(app).get("/api/rankings?sortBy=bullet");

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("bullet");
    expect(res.body.rankings[0].id).toBe("2402133i");
    expect(res.body.rankings[1].id).toBe("2409876d");
  });

  it("should return 400 for invalid sort field", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify({ students: [] }));
    const res = await request(app).get("/api/rankings?sortBy=wrong");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid sort field");
  });

  // 6️⃣ Empty database
  it("should return 404 when no students", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify({ students: [] }));
    const res = await request(app).get("/api/rankings");
    console.log(res.body);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No students found in the database.");
    expect(res.body.rankings).toEqual([]);
  });

  it("should include rank numbers", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings");

    expect(res.body.rankings[0]).toHaveProperty("rank");
    expect(res.body.rankings[0].rank).toBe(1);
  });

  it("should return all required student fields", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings");
    const student = res.body.rankings[0];

    expect(student).toHaveProperty("id");
    expect(student).toHaveProperty("rapid");
    expect(student).toHaveProperty("blitz");
    expect(student).toHaveProperty("bullet");
    expect(student).toHaveProperty("createdAt");
    expect(student).toHaveProperty("rank");
  });
});
