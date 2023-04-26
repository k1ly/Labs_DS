const fs = require('fs');

writeFileLines = (resource, count) => {
    for (let i = 0; i < count; i++) {
        fs.appendFileSync(resource, `${new Date().toLocaleString()}\n`);
    }
}

readFileLines = (resource, count) => {
    let lines = fs.readFileSync(resource).toString().split('\n');
    for (let i = 0; i < count; i++) {
        console.log(lines[i]);
    }
}

module.exports = {writeFileLines, readFileLines};