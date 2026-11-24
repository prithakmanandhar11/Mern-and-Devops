const dns = require('dns');
const mongoose = require('mongoose');

const {
  normalizeMongoUri,
  sanitizeMongoUri,
  isSrvUri,
  isSrvDnsError,
  describeMongoError,
  mongoErrorHint,
} = require('./mongoUri');

// Give Atlas a little longer than the default when the network is slow.
const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
};

/**
 * Optional workaround for machines where Node's c-ares resolver can reach the
 * OS DNS servers but not the SRV record (the "querySrv ECONNREFUSED" case).
 * Only used when MONGODB_DNS_SERVERS is set, e.g. "1.1.1.1,1.0.0.1".
 */
function applyDnsOverride() {
  const servers = (process.env.MONGODB_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    return;
  }

  try {
    dns.setServers(servers);
    console.log(`[db] Using custom DNS servers for SRV lookups: ${servers.join(', ')}`);
  } catch (error) {
    console.warn(`[db] Could not apply MONGODB_DNS_SERVERS: ${error.message}`);
  }
}

async function connectWith(uri, label) {
  console.log(`[db] Connecting (${label}): ${sanitizeMongoUri(uri)}`);

  const connection = await mongoose.connect(uri, CONNECT_OPTIONS);
  const { host, name } = connection.connection;

  console.log(`[db] MongoDB connected (${label}): ${host}/${name}`);
  return connection;
}

/**
 * Connect to MongoDB using the URI from the environment variables.
 *
 * Supports two URIs:
 *   - MONGODB_URI           primary connection string (SRV or non-SRV)
 *   - MONGODB_URI_FALLBACK  optional non-SRV string used automatically when the
 *                           primary is an SRV URI and the SRV lookup fails
 *
 * The function throws on failure so the caller can decide how to handle it.
 */
const connectDB = async () => {
  const raw = process.env.MONGODB_URI;

  if (!raw) {
    throw new Error('MONGODB_URI is not defined. Add it to backend/.env');
  }

  const uri = normalizeMongoUri(raw);
  const fallbackRaw = process.env.MONGODB_URI_FALLBACK;
  const fallback = fallbackRaw ? normalizeMongoUri(fallbackRaw) : null;

  // Fail fast instead of buffering queries for 10 seconds when Atlas is unreachable.
  mongoose.set('strictQuery', true);

  console.log(`[db] MONGODB_URI: ${sanitizeMongoUri(uri)}`);
  console.log(`[db] MONGODB_URI length: ${uri.length}`);

  applyDnsOverride();

  try {
    return await connectWith(uri, isSrvUri(uri) ? 'SRV' : 'direct');
  } catch (error) {
    console.error('[db] Initial MongoDB connection failed.');
    console.error(describeMongoError(error));

    const hint = mongoErrorHint(error);
    if (hint) {
      console.error(`[db] Hint: ${hint}`);
    }

    const canFallback =
      fallback && isSrvUri(uri) && isSrvDnsError(error);

    if (canFallback) {
      console.warn('[db] SRV/DNS failure detected. Retrying with MONGODB_URI_FALLBACK (non-SRV)...');

      // Clear the failed connection attempt before opening a new one.
      await mongoose.disconnect().catch(() => {});

      try {
        return await connectWith(fallback, 'fallback non-SRV');
      } catch (fallbackError) {
        console.error('[db] Fallback MongoDB connection failed.');
        console.error(describeMongoError(fallbackError));
        throw fallbackError;
      }
    }

    throw error;
  }
};

module.exports = connectDB;
