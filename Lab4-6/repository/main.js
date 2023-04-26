import mssql from 'mssql';

class DataRepository {
    config;

    constructor(config) {
        this.config = config;
    }

    getLastFive = () => new Promise((resolve, reject) => {
        mssql.connect(this.config)
            .then(connection => {
                connection.query('select top(5) * from data order by date desc')
                    .then(result => {
                        let data = [];
                        for (let i = 0; i < result.rowsAffected[0]; i++) {
                            let row = {}
                            for (let key in result.recordset[i]) {
                                row[key] = result.recordset[i][key];
                            }
                            data.push(row);
                        }
                        resolve(data);
                    }).catch(reject);
            }).catch(reject);
    })

    getAll = () => new Promise((resolve, reject) => {
        mssql.connect(this.config)
            .then(connection => {
                connection.query('select * from data')
                    .then(result => {
                        let data = [];
                        for (let i = 0; i < result.rowsAffected[0]; i++) {
                            let row = {}
                            for (let key in result.recordset[i]) {
                                row[key] = result.recordset[i][key];
                            }
                            data.push(row);
                        }
                        resolve(data);
                    }).catch(reject);
            }).catch(reject);
    })

    add = data => new Promise((resolve, reject) => {
        mssql.connect(this.config)
            .then(connection => {
                Promise.all(data.map(data => new Promise((resolve, reject) => {
                    connection.request()
                        .input('date', mssql.DateTime, data.date)
                        .input('value', mssql.Int, data.value)
                        .input('service', mssql.BigInt, data.service)
                        .query('insert into data(date, value, service) values (@date, @value, @service)')
                        .then(result => {
                            if (result.rowsAffected[0] > 0)
                                resolve();
                            else reject('Data was not inserted!');
                        }).catch(reject);
                }))).then(resolve)
                    .catch(reject)
            }).catch(reject)
    })
}

export default DataRepository;