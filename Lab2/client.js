const fs = require('fs');
const {socket, until, initCA, enterCA, leaveCA, closeCA} = require('./api.js');

let ca = {status: 'NO_INIT'};

socket.on('message', (msg, rinfo) => {
    ca.status = JSON.parse(msg.toString()).status;
})

let resource = 'file.txt';

ca = initCA('127.0.0.1', resource);

let i = 0;
let interval = setInterval(() => {
    enterCA(ca).then(() => {
        fs.appendFileSync(resource, `${process.argv[2]} - ${new Date().toLocaleString()}\n`);
    }).then(() => leaveCA(ca))
        .then(() => {
            if (++i === 5) {
                clearInterval(interval);
                closeCA(ca);
            }
        });
}, 5000);