const { mergeGraphModules } = require('./common/helpers');
const common = require('./common');
const app = require('./app');

module.exports = mergeGraphModules(common, app);
