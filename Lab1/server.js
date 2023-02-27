const udp = require('dgram');

let Cs = Date.now();
let exp = [];

let server = udp.createSocket('udp4')
    .on('message', (msg, rinfo) => {
        let request = JSON.parse(msg.toString());
        let correction = (Date.now() - Cs) - request.curValue
        server.send(JSON.stringify({
            cmd: 'SYNC',
            correction: correction
        }), rinfo.port, rinfo.address, error => {
            if (error)
                console.error(error);
        });
        exp.push(correction);
        console.log(`${rinfo.address}:${rinfo.port}`);
        console.log(`Correction = ${correction}`);
        console.log(`Average correction = ${exp.reduce((previousValue, currentValue) => previousValue + currentValue, 0) / exp.length}`);
        if (exp.length === 10)
            server.close(() => {
                console.log(exp);
                console.log('Maximum =', Math.max(...exp));
                console.log('Minimum =', Math.min(...exp));
                console.log('Average =', exp.reduce((previousValue, currentValue) => previousValue + currentValue, 0) / exp.length);
            });
    }).on('error', err => console.error(err))
server.bind(6000);

let ntpClient = new (require('ntp-time')).Client('1.pool.ntp.org', 123, {timeout: 1000});
setInterval(() => {
    ntpClient.syncTime().then(date => {
        Cs = Date.parse(date.time);
        console.log('Time =', Cs)
    }).catch(err => console.error(err.message))
}, 10000);