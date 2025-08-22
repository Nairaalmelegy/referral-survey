const request = require("supertest");
const app = require("../src/app"); // Import Express app

describe("API Health Check", () => {
  it("should return 200 for /health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("API is running");
  });
});
