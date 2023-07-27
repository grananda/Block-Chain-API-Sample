import 'dotenv/config';

export const config = {
    NAME: process.env.NAME,
    VERSION: process.env.VERSION,
    PORT: process.env.PORT,
    IP: process.env.IP,
    ENV: process.env.NODE_ENV,
};
