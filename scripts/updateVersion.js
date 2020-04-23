const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const versionJsonPath = path.join(process.cwd(), '/src/version.json');
const versionPrettyJson = JSON.stringify({ version }, null, 2);

fs.writeFileSync(versionJsonPath,versionPrettyJson);
