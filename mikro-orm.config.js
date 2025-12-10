"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.default = (0, postgresql_1.defineConfig)({
    clientUrl: process.env.DATABASE_URL,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    driverOptions: {
        connection: {
            ssl: { rejectUnauthorized: false },
        },
    },
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
    },
    schemaGenerator: {
        ignoreSchema: ['auth', 'storage', 'realtime', 'vault'],
    },
});
//# sourceMappingURL=mikro-orm.config.js.map