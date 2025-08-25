const mongoose = require("mongoose");

let cached = global.__mongoose_conn__;
if (!cached) cached = global.__mongoose_conn__ = { conn: null, promise: null };

async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI is not set");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
