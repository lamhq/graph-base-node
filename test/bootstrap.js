require('dotenv').config();
const path = require('path');
const config = require('../config');
const log = require('../modules/common/log');
const { connect, importCollection } = require('../modules/common/mongodb');

function getDataFile(colName) {
  return path.resolve(__dirname, '..', 'data', `${colName}.json`);
}

async function initDatabase() {
  log.info('init test database');
  this.timeout(10000);

  const { con, db } = await connect(config.db.uri);
  const p1 = importCollection(db, getDataFile('blog.posts'));
  const p2 = importCollection(db, getDataFile('common.users'));
  await Promise.all([p1, p2]);
  con.close();
}

before('init database', initDatabase);
