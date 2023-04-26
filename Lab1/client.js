const udp = require('dgram');

const Tc = parseInt(process.argv[2]);
let Cc = 0;

let client = udp.createSocket('udp4')
    .on('message', msg => {
        let response = JSON.parse(msg.toString());
        Cc += response.correction;
        console.log(response);
    })
setInterval(() => {
    Cc += Tc;
    client.send(JSON.stringify({cmd: 'SYNC', curValue: Cc}), 6000, '127.0.0.1', error => {
        if (error)
            console.error(error);
    });
}, Tc);
