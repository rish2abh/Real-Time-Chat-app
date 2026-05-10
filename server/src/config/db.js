const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`[Database] Connected successfully`);
  } catch (error) {
    console.error(`[Database Connection Error] ${error.message}`, error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
