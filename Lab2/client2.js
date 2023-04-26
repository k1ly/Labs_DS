const udp = require('dgram');

const socket = udp.createSocket('udp4');

const {initCA, enterCA, leaveCA, closeCA} = require('./api.js')(socket);

const {writeFileLines, readFileLines} = require('./api_dfs.js');

let ca = {status: 'NO_INIT'};

socket.on('message', msg => {
    ca.status = JSON.parse(msg.toString()).status;
})

let resource = 'Z:\\file2.txt';

ca = initCA('127.0.0.1', resource);

enterCA(ca).then(() => {
    writeFileLines(resource, 10);
    readFileLines(resource, 10);
}).then(() => leaveCA(ca))
    .then(() => closeCA(ca))