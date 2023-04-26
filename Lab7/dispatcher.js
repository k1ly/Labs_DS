import udp from 'dgram';
import fs from 'fs';
import log4js from 'log4js';
import config from './config.json' assert {type: 'json'};

const logger = log4js.configure(config.log).getLogger('Dispatcher');

logger.info('Services:', Object.entries(config.services).map(([id, service]) => ({[id]: service.address})));

let client;
let service;

let socket = udp.createSocket('udp4')
    .on('message', (msg, rinfo) => {
        if (msg.toString() === 'TIME') {
            fs.readFile('./coordinator.json', (error, data) => {
                if (error)
                    logger.error(error.toString());
                else {
                    let coordinator = JSON.parse(data.toString());
                    logger.info(`Time request: client - ${rinfo.address}:${rinfo.port}, coordinator - ${coordinator.address}:${config.port}`);
                    client = rinfo;
                    service = coordinator;
                    socket.send('TIME', config.port, coordinator.address,
                        error => error ? logger.error(error.toString()) : null);
                }
            });
        } else if (client) {
            socket.send(msg, client.port, client.address,
                error => error ? logger.error(error.toString()) : null);
            client = null;
            service = null;
        }
    }).on('error', error => logger.error(error.toString()))
    .bind(config.port, config.dispatcher.address);