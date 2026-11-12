const mongoose = require('mongoose');

const DB_NAME = 'kotoba';
const DB_HOST = process.env.MONGO_HOST || '127.0.0.1:27017';
const DB_CONNECTION_STRING = `mongodb://${DB_HOST}/${DB_NAME}`;
const connection = mongoose.createConnection(DB_CONNECTION_STRING);

connection.on('error', (err) => {
  console.error(`\n[ERROR] Failed to connect to MongoDB at ${DB_HOST}. Please ensure MongoDB is running.`);
});

module.exports = {
  connection,
  DB_CONNECTION_STRING,
};
