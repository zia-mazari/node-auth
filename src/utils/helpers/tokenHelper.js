const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const {redisClient} = require('../../config/redisConfig');
require('dotenv').config();


exports.updateTokens = async (user, token, maxAllowedTokens = process.env.MAX_ALLOWED_LOGINS) => {
    try {
        const client = await redisClient();
        user.tokens.push(token);
        if (user.tokens.length > maxAllowedTokens) {
            // Remove the first token from the array & Redis
            const removedToken = user.tokens.shift();
            await client.del(removedToken.rtv);
        }
        const expiryTimeInSeconds = parseInt(process.env.TOKEN_LIFETIME_HOURS, 10) * 60 * 60;
        const v = await client.set(token.rtv, user.id, {
            EX: expiryTimeInSeconds,
            NX: true,
        });
        await user.save();
        return { success: true, message: 'Tokens updated' };
    } catch (exc) {
        console.log('Exc to update token', exc);
        return { success: false, message: exc.message };
    }
};

exports.validateAccessToken = async (tokenVersion, payload) => {
    try {
        const client = await redisClient();
        return await client.exists(tokenVersion);
    } catch (exc) {
        console.log('Error validating access token:', exc);
        return false;
    }
};

exports.generateAccessTokens = async (user) => {
    const tokenVersion = uuidv4();
    const refreshToken = jwt.sign(
        { user: { id: user.id }, token: { type: 'refresh', version: tokenVersion } },
        process.env.JWT_SECRET,
        { expiresIn: '1w' }
    );
    const accessToken = jwt.sign(
        { user: { id: user.id }, token: { type: 'access', version: tokenVersion } },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return { accessToken, refreshToken, tokenVersion };
};
