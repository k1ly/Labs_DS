import udp from 'dgram';
import log4js from 'log4js';
import config from './config.json' assert {type: 'json'};

const logger = log4js.configure(config.log).getLogger('Client');

let socket = udp.createSocket('udp4')
    .on('message', msg => {
        logger.info(`Time - ${msg}`);
        socket.close();
    }).on('error', error => logger.error(error.toString()));

socket.send('TIME', config.port, config.dispatcher.address,
    error => error ? logger.error(error.toString()) : null);