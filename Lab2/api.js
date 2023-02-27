const udp = require('dgram');

let socket = udp.createSocket('udp4');

until = async (predicate, ...args) => {
    while (!predicate(...args)) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

initCA = (ipAddress, resource) => {
    let ca = {ipAddress: ipAddress, resource: resource, status: 'INIT'};
    socket.send(JSON.stringify(ca), 6000, ca.ipAddress, error => error ? console.error(error) : null);
    return ca;
}

enterCA = async ca => {
    await until(ca => ca.status === 'INIT', ca);
    ca.status = 'WAIT';
    socket.send(JSON.stringify(ca), 6000, ca.ipAddress, error => error ? console.error(error) : null);
    await until(ca => ca.status !== 'WAIT', ca);
}

leaveCA = async ca => {
    await until(ca => ca.status === 'ENTER', ca);
    ca.status = 'LEAVE';
    socket.send(JSON.stringify(ca), 6000, ca.ipAddress, error => error ? console.error(error) : null);
    await until(ca => ca.status !== 'LEAVE', ca);
}

closeCA = ca => {
    ca.status = 'NO_INIT';
    socket.send(JSON.stringify(ca), 6000, ca.ipAddress, error => error ? console.error(error) : null);
}

module.exports = {socket, until, initCA, enterCA, leaveCA, closeCA};