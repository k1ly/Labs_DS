const fs = require('fs');
const {socket, until, initCA, enterCA, leaveCA, closeCA} = require('./api.js');

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

let ca = {status: 'NO_INIT'};

socket.on('message', (msg, rinfo) => {
    ca.status = JSON.parse(msg.toString()).status;
})

let resource = 'file2.txt';

ca = initCA('127.0.0.1', resource);

enterCA(ca).then(() => {
    writeFileLines(resource, 10);
    readFileLines(resource, 10);
}).then(() => leaveCA(ca))
    .then(() => closeCA(ca))