const { Pool } = require("pg");
const config = require("./config");

function createPool() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is missing. Please set it in your .env file.");
  }

  return new Pool({
    connectionString: config.databaseUrl
  });
}

module.exports = {
  createPool
};
