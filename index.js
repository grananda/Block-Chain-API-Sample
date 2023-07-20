import { config } from './src/ config/config.js';
import { Application } from './src/application.js';

const port = process.argv[2] ? process.argv[2] : config.PORT;

export const app = new Application(port);
app.init().configureServer().start();
