const { randomBytes } = require('crypto');
const format = require('pg-format');
const { default: migrate } = require('node-pg-migrate');
const pool = require('../pool');

const DEFAULT_OPTS = {
    host: 'localhost',
    port: 5432,
    database: 'socialnetwork-test',
    user: 'postgres',
    password: 'asdf'
};

class Context {
    static async build() {

        // randomly generating a role name to connect to PG
        const roleName = 'a' + randomBytes(4).toString('hex');

        // connect to PG as usual
        await pool.connect(DEFAULT_OPTS);

        // create a new role
        await pool.query(format(
            'CREATE ROLE %I WITH LOGIN PASSWORD %L;', roleName, roleName
        ));

        // create a schema with same name
        await pool.query(format(
            'CREATE SCHEMA %I AUTHORIZATION %I;', roleName, roleName
        ));

        // disconnect entirely from PG
        await pool.close();

        // run our migration in the new schema
        await migrate({
            schema: roleName,
            direction: 'up',
            log: () => {},
            noLock: true,
            dir: 'migrations',
            databaseUrl: {
                host: 'localhost',
                port: 5432,
                database: 'socialnetwork-test',
                user: roleName,
                password: roleName
            }
        });

        // connect to PG as the newly created schema
        await pool.connect({
            host: 'localhost',
            port: 5432,
            database: 'socialnetwork-test',
            user: roleName,
            password: roleName
        });
        return new Context(roleName);
    }
    constructor(roleName) {
        this.roleName = roleName;
    }

    async reset() {
        return pool.query(`
            DELETE FROM users;
        `);
    }

    async close() {
        // disconnect from PG
        await pool.close();

        // reconnect as out root user
        await pool.connect(DEFAULT_OPTS);

        // delete the role and schema we created
        await pool.query(format(
            'DROP SCHEMA %I CASCADE;', this.roleName
        ));

        await pool.query(format(
            'DROP ROLE %I;',  this.roleName
        ));

        // disconnect
        await pool.close();
    }
}

module.exports = Context;