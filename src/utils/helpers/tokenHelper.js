const {createClient} = require('redis');
const {v4: uuidv4} = require("uuid");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const client = createClient();

exports.updateTokens = async (user, token, maxAllowedTokens = process.env.MAX_ALLOWED_LOGINS) => {
    try {
        await client.connect();
        user.tokens.push(token);
        if (user.tokens.length > maxAllowedTokens) {
            // Remove the first token from the array & redis
            const removedToken = user.tokens.shift();
            await client.del(removedToken.rtv);
        }
        const expiryTimeInSeconds = parseInt(process.env.TOKEN_LIFETIME_HOURS, 10) * 60 * 60;
        const v = await client.set(token.rtv, user.id, {
            EX: expiryTimeInSeconds,
            NX: true
        });
        await client.disconnect();
        await user.save();
        return {success: true, message: 'Tokens updated'};
    } catch (exc) {
        console.log("Exc:", exc.message)
        return {success: false, message: exc.message};
    }
}

exports.validateAccessToken = async (tokenVersion, payload) => {
    await client.connect();
    const totalTokens = await client.exists(tokenVersion);
    await client.disconnect();
    return totalTokens;
}

exports.generateAccessTokens = async (user) => {
    const tokenVersion = uuidv4();
    const refreshToken = jwt.sign({user: {id: user.id}, token: {type: 'refresh', version: tokenVersion}},
        process.env.JWT_SECRET, {expiresIn: '1w'});
    const accessToken = jwt.sign({user: {id: user.id}, token: {type: 'access', version: tokenVersion}},
        process.env.JWT_SECRET, {expiresIn: '8h'});

    return {accessToken, refreshToken, tokenVersion}
};