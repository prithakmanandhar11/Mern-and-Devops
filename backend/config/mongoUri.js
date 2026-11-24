/**
 * Helpers for validating, sanitising and converting MongoDB connection strings.
 *
 * Shared by `config/db.js` and `scripts/diagnose-db.js` so the connection logic
 * and the diagnostics always agree.
 */

// Characters that commonly sneak in when a URI is copy-pasted from a browser,
// Atlas dashboard, or another text source.
const ZERO_WIDTH = /[\u200b-\u200d\ufeff]/g;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

const SRV_SCHEME = /^mongodb\+srv:\/\//i;
const DIRECT_SCHEME = /^mongodb:\/\//i;

/**
 * Clean a raw value from `process.env`:
 *  - trim leading/trailing whitespace
 *  - remove BOM and zero-width characters
 *  - remove a matching pair of surrounding quotes
 *  - remove embedded control characters / line breaks
 *
 * Internal spaces are deliberately left in place so we can report them instead
 * of silently changing a password.
 */
function normalizeMongoUri(value) {
  if (typeof value !== 'string') {
    throw new Error('MONGODB_URI must be a string');
  }

  let uri = value.trim();
  uri = uri.replace(ZERO_WIDTH, '');
  uri = uri.replace(CONTROL_CHARS, '').trim();

  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  return uri;
}

function isSrvUri(uri) {
  return SRV_SCHEME.test(uri);
}

function isDirectUri(uri) {
  return DIRECT_SCHEME.test(uri);
}

/**
 * Return a copy of the URI that is safe to print. The password between the
 * first `:` and the following `@` is replaced with `***`.
 */
function sanitizeMongoUri(uri) {
  if (!uri) {
    return '(empty)';
  }

  return uri.replace(/\/\/([^@/]*):([^@/]*)@/, (match, user) => {
    return `//${user}:***@`;
  });
}

/**
 * Split a MongoDB URI into its parts without decoding anything, so credentials
 * are rebuilt byte-for-byte.
 *
 * Returns { scheme, auth, hosts, path, query }.
 */
function splitMongoUri(uri) {
  const match = uri.match(
    /^(mongodb(?:\+srv)?):\/\/(?:([^@/]*)@)?([^/?]+)(\/[^?]*)?(\?.*)?$/i
  );

  if (!match) {
    throw new Error(
      'Invalid MongoDB URI. It must start with "mongodb://" or "mongodb+srv://" and contain at least one host.'
    );
  }

  return {
    scheme: match[1].toLowerCase(),
    auth: match[2] || '',
    hosts: match[3],
    path: match[4] || '',
    query: match[5] ? match[5].slice(1) : '',
  };
}

/**
 * Build a standard (non-SRV) connection string from an SRV URI and the Atlas
 * shard hostnames.
 *
 * The driver cannot read the SRV TXT record when a non-SRV URI is used, so the
 * `authSource` and `replicaSet` options must be present explicitly.
 *
 * @param {string} srvUri   Original `mongodb+srv://...` URI.
 * @param {string[]} shardHosts  Atlas shard hostnames (ports optional).
 * @param {{ database?: string, extraParams?: Record<string, string> }} [options]
 */
function buildDirectMongoUri(srvUri, shardHosts, options = {}) {
  const { database, extraParams = {} } = options;
  const parts = splitMongoUri(srvUri);

  if (parts.scheme !== 'mongodb+srv') {
    throw new Error('buildDirectMongoUri expects a mongodb+srv:// URI');
  }

  if (!Array.isArray(shardHosts) || shardHosts.length === 0) {
    throw new Error('At least one shard host is required');
  }

  const hosts = shardHosts
    .map((host) => host.trim().replace(/:\d+$/, ''))
    .filter(Boolean)
    .map((host) => `${host}:27017`)
    .join(',');

  const dbPath = database ? `/${database}` : parts.path;

  const params = new URLSearchParams(parts.query);
  params.set('ssl', 'true');

  // Atlas defaults to the `admin` authentication database.
  if (!params.has('authSource')) {
    params.set('authSource', 'admin');
  }
  if (!params.has('retryWrites')) {
    params.set('retryWrites', 'true');
  }
  if (!params.has('w')) {
    params.set('w', 'majority');
  }

  for (const [key, value] of Object.entries(extraParams)) {
    params.set(key, value);
  }

  const auth = parts.auth ? `${parts.auth}@` : '';
  return `mongodb://${auth}${hosts}${dbPath}?${params.toString()}`;
}

/**
 * Walk `reason` / `cause` links that drivers attach to wrapped errors.
 */
function errorChain(error) {
  const chain = [];
  let current = error;
  let depth = 0;

  while (current && depth < 6) {
    chain.push(current);
    current = current.reason || current.cause;
    depth += 1;
  }

  return chain;
}

/**
 * True when the error chain mentions `querySrv` or the MongoDB SRV hostname.
 */
function isSrvDnsError(error) {
  return errorChain(error).some((item) => {
    const text = `${item.code || ''} ${item.syscall || ''} ${item.message || ''}`;
    return /querySrv|_mongodb\._tcp/i.test(text);
  });
}

/**
 * Format an error and its wrapped causes into readable lines.
 */
function describeMongoError(error) {
  return errorChain(error)
    .map((item, index) => {
      const label = index === 0 ? 'error' : `cause ${index}`;
      const lines = [`${label}: ${item.name || 'Error'}: ${item.message || '(no message)'}`];

      for (const key of ['code', 'syscall', 'hostname', 'errno']) {
        if (item[key] !== undefined) {
          lines.push(`  ${key}: ${item[key]}`);
        }
      }

      if (item.reason && typeof item.reason === 'object' && !item.reason.message) {
        lines.push('  reason: (topology description available in debug logs)');
      }

      return lines.join('\n');
    })
    .join('\n');
}

/**
 * Return a short, actionable hint for the most common MongoDB failures.
 */
function mongoErrorHint(error) {
  const chain = errorChain(error);
  const codes = chain.map((item) => item.code).filter(Boolean);
  const messages = chain.map((item) => item.message || '').join(' ');

  if (isSrvDnsError(error)) {
    return (
      'The SRV DNS lookup failed inside Node. Use a non-SRV (mongodb://) URI, ' +
      'or set MONGODB_URI_FALLBACK to one. See scripts/diagnose-db.js.'
    );
  }

  if (/Authentication failed|bad auth/i.test(messages)) {
    return 'Check the username/password and the authSource option (Atlas uses admin).';
  }

  if (/Could not connect to any servers|Server selection timed out/i.test(messages)) {
    return 'Check the Atlas IP allow-list, the shard hostnames, and outbound TCP 27017.';
  }

  if (codes.includes('ENOTFOUND')) {
    return 'The hostname could not be resolved. Check the cluster hostname.';
  }

  return '';
}

module.exports = {
  normalizeMongoUri,
  isSrvUri,
  isDirectUri,
  sanitizeMongoUri,
  splitMongoUri,
  buildDirectMongoUri,
  isSrvDnsError,
  describeMongoError,
  mongoErrorHint,
};
