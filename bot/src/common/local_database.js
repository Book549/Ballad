const net = require('net');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

let localMongoInstance = null;

function isPortListening(port, host = '127.0.0.1', timeoutMs = 400) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function startLocalDatabaseIfNeeded() {
  const host = process.env.MONGO_HOST || '127.0.0.1:27017';
  const [hostname, portStr] = host.split(':');
  const port = parseInt(portStr || '27017', 10);

  // If already listening on that port, use the existing server
  const isListening = await isPortListening(port, hostname);
  if (isListening) {
    return null;
  }

  // Only auto-start embedded database if targeting localhost / 127.0.0.1
  if (hostname !== '127.0.0.1' && hostname !== 'localhost') {
    return null;
  }

  const dbPath = path.join(__dirname, '..', '..', 'data', 'mongo_data');
  fs.mkdirSync(dbPath, { recursive: true });

  console.log(`[Database] No MongoDB server found at ${host}. Starting embedded local database...`);
  localMongoInstance = await MongoMemoryServer.create({
    instance: {
      port,
      dbPath,
      storageEngine: 'wiredTiger',
    },
  });

  console.log(`[Database] Embedded local MongoDB is running on port ${port} (saving to bot/data/mongo_data/).`);

  const cleanup = async () => {
    if (localMongoInstance) {
      const instance = localMongoInstance;
      localMongoInstance = null;
      try {
        await instance.stop();
      } catch (err) {
        // ignore on exit
      }
    }
  };

  process.once('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });

  return localMongoInstance;
}

async function stopLocalDatabase() {
  if (localMongoInstance) {
    const instance = localMongoInstance;
    localMongoInstance = null;
    await instance.stop();
  }
}

module.exports = {
  startLocalDatabaseIfNeeded,
  stopLocalDatabase,
};
