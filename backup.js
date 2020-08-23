const fs = require('fs');

function read(path) {
  let json = fs.readFileSync(path, 'utf8');
  return JSON.parse(json);
}

module.exports = (path, content) => {
  return fs.writeFileSync(path, JSON.stringify(content));
};
