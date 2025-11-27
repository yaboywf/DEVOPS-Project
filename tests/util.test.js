const fs = require('fs');
const { getRankings } = require('../utils/DylanUtil');

const res = {
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
};

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('DylanUtil - getRankings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return sorted rankings by default (rapid)', async () => {
    const mockData = {
      students: [
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z" },
        { id: "2402133i", rapid: 1600, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
      ],
    };

    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockData));
    const req = { query: {} };
    await getRankings(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: `Rankings sorted by rapid`,
      sortBy: "rapid",
      count: 3,
      rankings: [
        { id: "2402133i", rapid: 1600, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z", rank: 1 },
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z", rank: 2 },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z", rank: 3 },
      ]
    });
  });

  it('should return sorted rankings by rapid', async () => {
    const mockData = {
      students: [
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z" },
        { id: "2402133i", rapid: 1600, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
      ],
    };

    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockData));
    const req = { query: { sortBy: 'rapid' } };
    await getRankings(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: `Rankings sorted by rapid`,
      sortBy: "rapid",
      count: 3,
      rankings: [
        { id: "2402133i", rapid: 1600, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z", rank: 1 },
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z", rank: 2 },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z", rank: 3 },
      ]
    });
  });

  it('should return sorted rankings by blitz', async () => {
    const mockData = {
      students: [
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z" },
        { id: "2402133i", rapid: 1600, blitz: 1550, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
      ],
    };

    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockData));
    const req = { query: { sortBy: 'blitz' } };
    await getRankings(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: `Rankings sorted by blitz`,
      sortBy: "blitz",
      count: 3,
      rankings: [
        { id: "2402133i", rapid: 1600, blitz: 1550, bullet: 1400, createdAt: "2025-02-05T09:30:00Z", rank: 1 },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z", rank: 2 },
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z", rank: 3 },
      ]
    });
  });

  it('should return sorted rankings by bullet', async () => {
    const mockData = {
      students: [
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z" },
        { id: "2402133i", rapid: 1600, blitz: 1500, bullet: 1450, createdAt: "2025-02-05T09:30:00Z" },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
      ],
    };

    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockData));
    const req = { query: { sortBy: 'bullet' } };
    await getRankings(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: `Rankings sorted by bullet`,
      sortBy: "bullet",
      count: 3,
      rankings: [
        { id: "2402133i", rapid: 1600, blitz: 1500, bullet: 1450, createdAt: "2025-02-05T09:30:00Z", rank: 1 },
        { id: "2402133b", rapid: 1100, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z", rank: 2 },
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z", rank: 3 },
      ]
    });
  });

  it("should return 400 for invalid sort field", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify({ students: [] }));
    const req = { query: { sortBy: "invalid" } };
    await getRankings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Invalid sort field. Must be one of: rapid, blitz, bullet"
    }));
  });

  it("should return 404 when no students", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify({ students: [] }));
    const req = { query: {} };
    await getRankings(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "No students found in the database.",
      rankings: [],
    }));
  });

  it("should return 422 for corrupted records", async () => {
    const mockData = {
      students: [
        { id: "2403800d", rapid: 1500, blitz: 1400, bullet: 1300, createdAt: "2025-01-04T09:30:00Z" },
        { id: "corrupted1", rapid: null, blitz: 1500, bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
        { id: "corrupted2", rapid: 1100, blitz: "invalid", bullet: 1400, createdAt: "2025-02-05T09:30:00Z" },
      ],
    };

    fs.promises.readFile.mockResolvedValue(JSON.stringify(mockData));
    const req = { query: {} };
    await getRankings(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Found 2 corrupted records in the database",
      rankings: [],
    });
  });

  it("should return 500 for file read error", async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fs.promises.readFile.mockRejectedValue({ code: "ENOENT" });
    const req = { query: {} };
    await getRankings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Database file not found",
      rankings: []
    });
  });

  it("should return 500 for server error", async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fs.promises.readFile.mockRejectedValue(new Error("Server error"));
    const req = { query: {} };
    await getRankings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Failed to retrieve rankings",
      rankings: [],
      error: expect.any(String)
    }));
  });
});
