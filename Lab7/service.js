import udp from 'dgram';
import fs from 'fs';
import dateformat from 'dateformat';
import log4js from 'log4js';
import config from './config.json' assert {type: 'json'};

if (process.argv.length < 3)
    throw Error('Service address was not specified!');

const service = config.services[process.argv[2]];

if (!service)
    throw Error('Invalid service address!');

const logger = log4js.configure(config.log).getLogger(`Service-${service.address}`);

let coordinatorCheckAttempt = 0;
let self = false;

function setCoordinator() {
    logger.info('Setting new coordinator -', service.address);
    fs.writeFile('./coordinator.json', JSON.stringify({address: service.address}, null, 2), error => {
        if (error)
            logger.error(error.toString());
        else socket.send('COORDINATOR', config.port, config.broadcast,
            error => error ? logger.error(error.toString()) : null);
    });
}

function startVoting() {
    logger.info('Voting for coordinator...');
    self = true;
    setTimeout(() => {
        if (self)
            setCoordinator();
    }, config.coordinatorVotingTimeout);
    Object.values(config.services).filter(s => s.address > service.address).forEach(s => {
        socket.send('VOTING', config.port, s.address,
            error => error ? logger.error(error.toString()) : null);
    });
}

let socket = udp.createSocket('udp4')
    .on('message', (msg, rinfo) => {
        switch (msg.toString()) {
            case 'TIME':
                socket.send(dateformat(new Date(), 'dd.mm.yyyy-HH:MM:ss'), rinfo.port, rinfo.address,
                    error => error ? logger.error(error.toString()) : null);
                break;
            case 'CHECK':
                socket.send('OK', rinfo.port, rinfo.address,
                    error => error ? logger.error(error.toString()) : null);
                break;
            case 'VOTING':
                socket.send('OK', rinfo.port, rinfo.address,
                    error => error ? logger.error(error.toString()) : null);
                startVoting();
                break;
            case 'OK':
            case'COORDINATOR':
                coordinatorCheckAttempt = 0;
                self = false;
                break;
        }
    }).bind(config.port, service.address);

setInterval(() => {
    if (coordinatorCheckAttempt < config.coordinatorCheckAttempt)
        fs.readFile('./coordinator.json', (error, data) => {
            if (error)
                logger.error(error.toString());
            else {
                let coordinator = JSON.parse(data.toString());
                if (coordinator.address !== service.address) {
                    logger.info(`Checking coordinator ${coordinator.address}...`);
                    socket.send('CHECK', config.port, coordinator.address,
                        error => error ? logger.error(error.toString()) : null);
                    coordinatorCheckAttempt++;
                }
            }
        });
    else startVoting();
}, config.coordinatorCheckInterval);

startVoting();