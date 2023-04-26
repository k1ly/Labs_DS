import express from 'express';
import axios from 'axios';
import log4js from 'log4js';
import DataRepository from './repository/service.js';
import config from './config.json' assert {type: 'json'};

if (process.argv.length < 3)
    throw Error('Service id was not specified!');

const serviceId = process.argv[2];
const repository = new DataRepository(config.services[serviceId].connectionConfig);
const logger = log4js.configure(config.log).getLogger(`Service-${serviceId}`);

let time = 0;
let lastPull = 0;
let dataId = 0;

setInterval(() => {
    axios.get(`http://${config.main.address}:${config.port}/time`,)
        .then(res => {
            time = res.data.time;
        }).catch(error => logger.error(error.response ? `${error.response.data} - ${error.response.config.url}` : error.toString()));
}, 1000);

let app = express();
app.use(express.json());

app.get('/pull', (req, res) => {
    repository.getLastByDate(new Date(lastPull))
        .then(data => {
            lastPull = time;
            res.json(data);
        }).catch(error => res.status(500).send(error.toString()));
});

app.post('/push', (req, res) => {
    dataId = req.body.length > 0 ? req.body.map(data => data.id).sort()[0] + 1 : 1;
    Promise.all(req.body.map(data => repository.merge({
        id: data.id,
        date: new Date(data.date),
        value: data.value,
        service: data.service
    }))).then(() => {
        res.send('Success');
    }).catch(error => res.status(500).send(error.toString()));
})

app.post('/add', (req, res) => {
    repository.add({id: dataId, date: new Date(time), value: req.body.value, service: serviceId})
        .then(() => {
            res.send('Success');
        }).catch(error => res.status(500).send(error.toString()));
});

repository.clear().then(() => {
    axios.get(`http://${config.main.address}:${config.port}/init`)
        .then(res => {
            Promise.all(res.data.map(data => repository.add(data)
                .catch(error => logger.error(error.toString()))))
                .then(() => {
                    lastPull = time;
                    dataId = res.data.length > 0 ? res.data.map(data => data.id).sort()[0] + 1 : 1;
                    axios.post(`http://${config.main.address}:${config.port}/start`, {id: serviceId})
                        .then(res => {
                            logger.info('Service start -', res.data);
                            app.listen(config.port, config.services[serviceId].address);
                        }).catch(error => logger.error(error.response ? `${error.response.data} - ${error.response.config.url}` : error.toString()));
                })
        }).catch(error => logger.error(error.response ? `${error.response.data} - ${error.response.config.url}` : error.toString()));
}).catch(error => logger.error(error.toString()));