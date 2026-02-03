"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const connect_1 = require("./db/connect");
const env_1 = require("./config/env");
async function main() {
    await (0, connect_1.connectToDb)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on http://localhost:${env_1.env.PORT}`);
    });
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Fatal startup error', err);
    process.exit(1);
});
