const redis = require('redis');
require('dotenv').config();

let isClientConnected = false;

exports.redisClient = () => {
    return new Promise(async (resolve, reject) => {
        const client = redis.createClient({
            url: process.env.REDIS_URL
        });
        if (isClientConnected) {
            resolve(client);
        } else {
            await client.connect();
            resolve(client);
        }
    });
};
