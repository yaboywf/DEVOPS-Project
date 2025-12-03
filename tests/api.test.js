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

  it("should return 200 and rapid rankings by default via HTTP endpoint", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings");

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("rapid");
    expect(res.body.rankings[0].id).toBe("2409876d");
    expect(res.body.rankings[1].id).toBe("2402133i");
  });

  it("should return 200 and rapid rankings via HTTP endpoint", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings?sortBy=rapid");

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("rapid");
    expect(res.body.rankings[0].id).toBe("2409876d");
    expect(res.body.rankings[1].id).toBe("2402133i");
  });

  it("should return 200 and blitz rankings via HTTP endpoint", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings?sortBy=blitz");

    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("blitz");
    expect(res.body.rankings[0].id).toBe("2402133i");
    expect(res.body.rankings[1].id).toBe("2409876d");
  });

  it("should return 200 and bullet rankings via HTTP endpoint", async () => {
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

  it("should return 404 when no students exist", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify({ students: [] }));
    const res = await request(app).get("/api/rankings");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No students found in the database.");
    expect(res.body.rankings).toEqual([]);
  });

  it("should return 422 for corrupted records", async () => {
    const mockData = {
      students: [
        { id: "a", rapid: 1500, blitz: 1400, bullet: 1300 },
        { id: "b", rapid: null, blitz: 1400, bullet: 1300 },
        { id: "c", rapid: 1200, blitz: "invalid", bullet: 1300 }
      ]
    };

    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockData));
    const res = await request(app).get('/api/rankings');

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("should return 500 for missing database file", async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fs.promises.readFile.mockRejectedValue({ code: "ENOENT" });

    const res = await request(app).get('/api/rankings');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Database file not found");
  });

  it("should return 500 for server crash", async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fs.promises.readFile.mockRejectedValue(new Error("Server error"));

    const res = await request(app).get('/api/rankings');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to retrieve rankings");
  });

  it("should include rank numbers in API response", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify(studentData));
    const res = await request(app).get("/api/rankings");

    expect(res.body.rankings[0]).toHaveProperty("rank");
    expect(res.body.rankings[0].rank).toBe(1);
  });

  it("should include all required student fields in API response", async () => {
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
