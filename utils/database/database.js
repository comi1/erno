const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(databaseName) {
        this.db = new sqlite3.Database(databaseName ? databaseName : './utils/database/Erno_Database.sqlite');
    }

    async createTable(tableName, data) {
        return new Promise((resolve, reject) => {
            const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${Object.entries(data).map(([key, value]) => `${key} ${value}`).join(', ')})`;
            this.db.run(createTableSQL, (err) => {
                if (err) reject(err);
                else resolve(`Table '${tableName}' created successfully.`);
            });
        });
    }

    async insert(tableName, data) {
        return new Promise((resolve, reject) => {
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);
            this.db.run(`INSERT INTO ${tableName} VALUES (${placeholders})`, values, (err) => {
                if (err) reject(err);
                else resolve("Inserted successfully.");
            });
        });
    }

    async findOne(tableName, conditions) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(conditions);
            const values = Object.values(conditions);
            const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
            this.db.get(`SELECT * FROM ${tableName} WHERE ${whereClause}`, values, (err, row) => {
                if (err) {
                    console.error(`Error while searching in table ${tableName}:`, err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    
    
    async get(tableName, conditions) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(conditions);
            const values = Object.values(conditions);
            const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
            this.db.all(`SELECT * FROM ${tableName} WHERE ${whereClause}`, values, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
    
    async update(tableName, newData, conditions) {
        return new Promise((resolve, reject) => {
            const updateValues = Object.entries(newData).map(([key, value]) => `${key} = ?`).join(', ');
            const updateParams = [...Object.values(newData), ...Object.values(conditions)];
            const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            this.db.run(`UPDATE ${tableName} SET ${updateValues} WHERE ${whereClause}`, updateParams, (err) => {
                if (err) reject(err);
                else resolve("Updated successfully.");
            });
        });
    }
    
    async delete(tableName, conditions) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(conditions);
            const values = Object.values(conditions);
            const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
            this.db.run(`DELETE FROM ${tableName} WHERE ${whereClause}`, values, (err) => {
                if (err) reject(err);
                else resolve("Deleted successfully.");
            });
        });
    }

    async findAll(tableName) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                if (err) {
                    console.error(`Error while retrieving all rows from table ${tableName}:`, err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    async deleteAll(tableName) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${tableName}`, (err) => {
                if (err) {
                    console.error(`Error while deleting all rows from table ${tableName}:`, err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
        
    

    async tables(tables) {
        return new Promise((resolve, reject) => {
            const promises = [];
            for (const [tableName, tableDefinition] of Object.entries(tables)) {
                promises.push(this.createTable(tableName, tableDefinition));
            }
            Promise.all(promises)
                .then(results => resolve(results))
                .catch(err => reject(err));
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;