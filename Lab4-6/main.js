import express from 'express';
import axios from 'axios';
import log4js from 'log4js';
import DataRepository from './repository/main.js';
import config from './config.json' assert {type: 'json'};

const repository = new DataRepository(config.main.connectionConfig);
const logger = log4js.configure(config.log).getLogger('Main');
const serviceMap = new Map(Object.entries(config.services).map(([id, service]) => [id, {
    address: service.address,
    isStarted: false
}]));

logger.info('Services:', Array.from(serviceMap).map(([id, service]) => ({[id]: service.address})));

let time = Date.now();
setInterval(() => time = Date.now(), 1000);

let app = express();
app.use(express.json());

app.get('/time', (req, res) => {
    res.json({time: time});
});

app.get('/init', (req, res) => repository.getAll()
    .then(dataArray => res.json(dataArray))
    .catch(error => res.status(500).send(error.toString())));

app.post('/start', (req, res) => {
    let service = serviceMap.get(req.body.id);
    if (service) {
        service.isStarted = true;
        res.send('Success');
    } else res.status(400).send('Invalid service id!');
});

app.listen(config.port, config.main.address);

setInterval(() => {
    logger.info('Starting pull replication...');
    let services = Array.from(serviceMap.entries()).filter(([id, service]) => service.isStarted);
    Promise.all(services.map(([id, service]) => new Promise(resolve => {
        axios.get(`http://${service.address}:${config.port}/pull`)
            .then(res => {
                logger.debug('Adding data:', res.data);
                repository.add(
                    res.data.map(data => ({
                        date: new Date(data.date),
                        value: data.value,
                        service: data.service
                    }))).then(() => {
                    logger.debug(`Pull replication from service ${id} - Success`);
                    resolve();
                }).catch(error => logger.error(error.toString()))
            }).catch(error => logger.error(error.response ? `${error.response.data} - ${error.response.config.url}` : error.toString()));
    }))).then(() => {
        logger.info('Starting push replication...');
        repository.getLastFive()
            .then(data => {
                services.forEach(([id, service]) => {
                    axios.post(`http://${service.address}:${config.port}/push`, data)
                        .then(res => {
                            logger.info(`Push replication to service ${id} -`, res.data);
                        }).catch(error => logger.error(error.response ? `${error.response.data} - ${error.response.config.url}` : error.toString()));
                });
            }).catch(error => logger.error(error.toString()));
    });
}, config.replicationInterval);