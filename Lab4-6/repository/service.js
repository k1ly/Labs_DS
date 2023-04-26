import mssql from 'mssql';

class DataRepository {
    config;

    constructor(config) {
        this.config = config;
    }

    getLastByDate = date => new Promise((resolve, reject) => {
        mssql.connect(this.config)
            .then(connection => {
                connection.request()
                    .input('date', mssql.DateTime, date)
                    .query('select * from data where date > @date')
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
                    }).catch(error => reject(error));
            }).catch(error => reject(error));
    })

    add = data => new Promise((resolve, reject) => {
        mssql.connect(this.config)
            .then(connection => {
                connection.request()
                    .input('id', mssql.BigInt, data.id)
                    .input('date', mssql.DateTime, data.date)
                    .input('value', mssql.Int, data.value)
                    .input('service', mssql.BigInt, data.service)
                    .query('insert into data(id, date, value, service) values (@id, @date, @value, @service)')
                    .then(result => {
                        if (result.rowsAffected[0] > 0)
                            resolve();
                        else
                            reject('Data was not inserted!');
                    }).catch(reject);
            })
    })

    merge = data => new Promise((resolve, reject) => {
        mssql.connect(this.config)
            .then(connection => {
                connection.request()
                    .input('id', mssql.BigInt, data.id)
                    .input('date', mssql.DateTime, data.date)
                    .input('value', mssql.Int, data.value)
                    .input('service', mssql.BigInt, data.service)
                    .query(`begin if not exists (select * from data where date = @date and value = @value and service = @service) ` +
                        `begin insert into data(id, date, value, service) values (@id, @date, @value, @service) end ` +
                        `else begin update data set id = @id where date = @date and value = @value and service = @service end end`)
                    .then(() => resolve())
                    .catch(reject);
            })
    })

    clear = () => new Promise((resolve, reject) => {
        mssql.connect(this.config)
            .then(connection => {
                connection.query('delete from data')
                    .then(() => resolve())
                    .catch(reject);
            })
    })
}

export default DataRepository;