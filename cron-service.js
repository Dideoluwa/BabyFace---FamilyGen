const cron = require('node-cron');
const https = require('https');

const CRON_URL = process.env.CRON_URL;

function cronService() {
  https.get(CRON_URL, (res) => {
    res.on('data', () => {});
    res.on('end', () => {});
  }).on('error', () => {});
}

cron.schedule('*/14 * * * *', cronService);
