import axios from 'axios';
import log4js from 'log4js';
import config from './config.json' assert {type: 'json'};

if (process.argv.length < 3)
    throw Error('Service id was not specified!');

const serviceId = process.argv[2];
const logger = log4js.configure(config.log).getLogger(`Service-${serviceId}`);

setInterval(() => {
    let value = Math.floor(Math.random() * 7);
    axios.post(`http://${config.services[serviceId].address}:${config.port}/add`, {value: value})
        .then(res => logger.info(`Adding ${value} to service ${serviceId} -`, res.data))
        .catch(error => logger.error(error.response ? `${error.response.data} - ${error.response.config.url}` : error.toString()));
}, Object.entries(config.services).length * config.replicationInterval / 5 + 1000);
