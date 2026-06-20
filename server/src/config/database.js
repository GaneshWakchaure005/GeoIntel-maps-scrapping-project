import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("MongoDB Connection Failed: MONGO_URI or MONGODB_URI must be set in the server environment.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy unique placeId_1 index if it exists in the collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: "places" }).toArray();
    if (collections.length > 0) {
      const collection = db.collection("places");
      const indexes = await collection.indexes();
      if (indexes.some((idx) => idx.name === "placeId_1")) {
        console.log("Dropping legacy unique placeId_1 index...");
        try {
          await collection.dropIndex("placeId_1");
          console.log("Legacy unique placeId_1 index dropped successfully.");
        } catch (idxError) {
          console.warn("Could not drop legacy unique placeId_1 index:", idxError.message);
        }
      }
    }
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;