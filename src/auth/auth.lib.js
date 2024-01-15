/*
 AUTH0 CODE
*/
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const log = require('lambda-log');
const util = require('util');
const { env } = require('../config/env');

const getPolicyDocument = (/** @type {string} */ effect, /** @type {any} */ resource) => {
    const policyDocument = {
        Version: '2012-10-17', // default version
        Statement: [{
            Action: 'execute-api:Invoke', // default action
            Effect: effect,
            Resource: resource,
        }]
    };
    return policyDocument;
}


// extract and return the Bearer Token from the Lambda event parameters
const getToken = (/** @type {{ methodArn?: any; type?: any; authorizationToken?: any; }} */ params) => {
    if (!params.type || params.type !== 'TOKEN') {
        throw new Error('Expected "event.type" parameter to have value "TOKEN"');
    }

    const tokenString = params.authorizationToken;
    if (!tokenString) {
        throw new Error('Expected "event.authorizationToken" parameter to be set');
    }

    const match = tokenString.match(/^Bearer (.*)$/);
    if (!match || match.length < 2) {
        throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`);
    }
    return match[1];
}

const jwtOptions = {
    audience: env.audience,
    issuer: env.tokenIssuer
};

module.exports.authenticate = (/** @type {{ methodArn: any; }} */ params) => {
    log.info(JSON.stringify(params));
    const token = getToken(params);

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('invalid token');
    }

    const getSigningKey = util.promisify(client.getSigningKey);
    return getSigningKey(decoded.header.kid)
        .then((key) => {
            // @ts-ignore
            const signingKey = key.publicKey || key.rsaPublicKey;
            return jwt.verify(token, signingKey, jwtOptions);
        })
        .then((d)=> ({
            principalId: d.sub,
            policyDocument: getPolicyDocument('Allow', params.methodArn),
            // @ts-ignore
            context: { scope: d.scope }
        }));
}

const client = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10, // Default value
    jwksUri: env.jwksUri
});
