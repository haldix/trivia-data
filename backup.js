const fs = require('fs');

// not used in app currently
// eslint-disable-next-line
function read(path) {
  const json = fs.readFileSync(path, 'utf8');
  return JSON.parse(json);
}

module.exports = (path, content) => {
  return fs.writeFileSync(path, JSON.stringify(content));
};
