#!/usr/bin/env node
/**
 * Diagnose a MongoDB / Atlas connection without exposing the password.
 *
 * Usage (from the backend directory):
 *   node scripts/diagnose-db.js
 *   node scripts/diagnose-db.js --connect
 *
 * Checks:
 *   - dotenv loads backend/.env
 *   - MONGODB_URI exists and is normalised
 *   - whitespace, quotes, zero-width and control characters
 *   - SRV and TXT DNS records (c-ares, the resolver Node itself uses)
 *   - optionally an actual mongoose connection
 */

require('dotenv').config();

const dns = require('dns');
const mongoose = require('mongoose');

const {
  normalizeMongoUri,
  sanitizeMongoUri,
  splitMongoUri,
  isSrvUri,
  buildDirectMongoUri,
  describeMongoError,
  mongoErrorHint,
} = require('../config/mongoUri');

const shouldConnect = process.argv.includes('--connect');

// The shard hostnames for cluster0.ppwsiab.mongodb.net. Override with
// MONGODB_SHARD_HOSTS for a different Atlas cluster.
const shardHosts = (
  process.env.MONGODB_SHARD_HOSTS ||
  [
    'ac-pawuwwf-shard-00-00.ppwsiab.mongodb.net',
    'ac-pawuwwf-shard-00-01.ppwsiab.mongodb.net',
    'ac-pawuwwf-shard-00-02.ppwsiab.mongodb.net',
  ].join(',')
)
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

function section(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  section('dotenv / environment');
  const raw = process.env.MONGODB_URI;

  if (!raw) {
    console.error('MONGODB_URI is not defined. Create backend/.env from .env.example.');
    process.exitCode = 1;
    return;
  }

  console.log('MONGODB_URI defined : yes');
  console.log('raw length          :', raw.length);
  console.log('leading/trailing ws :', raw !== raw.trim());
  console.log('surrounding quotes  :', /^["'].*["']$/.test(raw.trim()));
  console.log('contains quotes     :', /["']/.test(raw));
  console.log('control characters  :', /[\u0000-\u001f\u007f]/.test(raw));
  console.log('zero-width / BOM    :', /[\u200b-\u200d\ufeff]/.test(raw));
  console.log('internal whitespace :', /\S\s+\S/.test(raw));

  const uri = normalizeMongoUri(raw);
  console.log('normalised length   :', uri.length);
  console.log('sanitised URI       :', sanitizeMongoUri(uri));

  let parts;
  try {
    parts = splitMongoUri(uri);
  } catch (error) {
    console.error('\nURI parse error:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log('scheme              :', parts.scheme);
  console.log('host                :', parts.hosts);
  console.log('database path       :', parts.path || '(default)');

  section('Node DNS resolver (c-ares)');
  console.log('dns.getServers()    :', dns.getServers());
  console.log('default result order:', dns.getDefaultResultOrder());

  if (isSrvUri(uri)) {
    const srvName = `_mongodb._tcp.${parts.hosts}`;
    try {
      const records = await dns.promises.resolveSrv(srvName);
      console.log(`\nSRV ${srvName}: OK`);
      for (const record of records) {
        console.log(`  ${record.name}:${record.port} (priority ${record.priority}, weight ${record.weight})`);
      }
    } catch (error) {
      console.log(`\nSRV ${srvName}: FAILED`);
      console.log(`  code: ${error.code}  syscall: ${error.syscall || '-'}  message: ${error.message}`);
      console.log('  -> Node cannot reach its configured DNS server for SRV queries.');
      console.log('  -> This is the cause of "querySrv ECONNREFUSED".');
    }

    try {
      const txt = await dns.promises.resolveTxt(parts.hosts);
      console.log(`\nTXT ${parts.hosts}: OK`);
      console.log(' ', txt.flat().join(' '));
    } catch (error) {
      console.log(`\nTXT ${parts.hosts}: FAILED (${error.code || error.message})`);
    }

    section('Generated non-SRV URI (password masked)');
    try {
      const direct = buildDirectMongoUri(uri, shardHosts, {
        database: 'studentdb',
        extraParams: { replicaSet: process.env.MONGODB_REPLICA_SET || 'atlas-vtwvip-shard-0' },
      });
      console.log(sanitizeMongoUri(direct));
    } catch (error) {
      console.log('Could not build non-SRV URI:', error.message);
    }
  } else {
    console.log('\nURI is already non-SRV (no DNS SRV dependency).');
  }

  section('mongoose connection');
  if (!shouldConnect) {
    console.log('Skipped. Run with --connect to attempt a real connection.');
    return;
  }

  mongoose.set('strictQuery', true);

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Connected: ${connection.connection.host}/${connection.connection.name}`);
  } catch (error) {
    console.error(describeMongoError(error));
    const hint = mongoErrorHint(error);
    if (hint) {
      console.error(`Hint: ${hint}`);
    }

    // If the SRV URI failed, prove whether the generated non-SRV URI works.
    if (isSrvUri(uri)) {
      section('Retry with generated non-SRV URI');
      const direct = buildDirectMongoUri(uri, shardHosts, {
        database: 'studentdb',
        extraParams: {
          replicaSet: process.env.MONGODB_REPLICA_SET || 'atlas-vtwvip-shard-0',
        },
      });
      console.log('URI:', sanitizeMongoUri(direct));

      try {
        await mongoose.disconnect().catch(() => {});
        const connection = await mongoose.connect(direct, {
          serverSelectionTimeoutMS: 10000,
        });
        console.log(
          `Connected with non-SRV URI: ${connection.connection.host}/${connection.connection.name}`
        );
        console.log('Use this URI as MONGODB_URI in backend/.env.');
      } catch (directError) {
        console.error('Non-SRV connection also failed:');
        console.error(describeMongoError(directError));
        process.exitCode = 1;
      }
    } else {
      process.exitCode = 1;
    }
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error('Diagnostic script failed:', error);
  process.exitCode = 1;
});
