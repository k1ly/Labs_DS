const udp = require('dgram');

let queue = [];

queue.enter = () => {
    let ca = queue.at(queue.length - 1);
    ca.status = 'ENTER'
    socket.send(JSON.stringify(ca), ca.port, ca.ipAddress, error => error ? console.error(error) : null);
    console.log(`Enter critical section (${ca.ipAddress}:${ca.port})`);
}

queue.leave = () => {
    let ca = queue.pop();
    ca.status = 'INIT'
    socket.send(JSON.stringify(ca), ca.port, ca.ipAddress, error => error ? console.error(error) : null);
    console.log(`Leave critical section (${ca.ipAddress}:${ca.port})`);
}

let socket = udp.createSocket('udp4')
    .on('message', (msg, rinfo) => {
        let ca = JSON.parse(msg.toString());
        ca.ipAddress = rinfo.address;
        ca.port = rinfo.port;
        switch (ca.status) {
            case 'INIT':
                console.log(`Initialize critical section (${ca.ipAddress}:${ca.port})`);
                break;
            case 'WAIT':
                if (!queue.find(e => e.ipAddress === ca.ipAddress && e.port === ca.port)) {
                    queue.push(ca);
                    console.log(`Wait critical section (${ca.ipAddress}:${ca.port})`);
                    if (queue.at(0).status === 'WAIT')
                        queue.enter();
                } else console.warn('WARN: Repeating queue enter request:', ca);
                break;
            case 'LEAVE':
                if (queue.at(0) && queue.at(0).ipAddress === ca.ipAddress && queue.at(0).port === ca.port) {
                    queue.leave();
                    if (queue.at(0) && queue.at(0).status === 'WAIT')
                        queue.enter();
                } else console.warn('WARN: Missing queue leave request:', ca);
                break;
            case 'NO_INIT':
                console.log(`Destroy critical section (${ca.ipAddress}:${ca.port})`);
                break;
        }
    }).on('error', err => console.error(err))
    .bind(6000, '0.0.0.0');