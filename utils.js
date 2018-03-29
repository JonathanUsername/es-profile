const request = require("request").defaults({ jar: true });

const runQueryPromise = ({ url, user, pass, json, profile }) => {
    return new Promise((resolve, reject) => {
        request(
            {
                method: "GET",
                uri: url,
                auth: {
                    user,
                    pass
                },
                json: {
                    ...json,
                    profile
                }
            },
            (err, response, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            }
        );
    });
};

// Use this to transform the values, add random integers for a certain field
// to get around caching, etc.
// TODO: allow this to be added from the frontend somehow
const transformValues = (json) => {
    return json
};

module.exports = {
    runQueryPromise,
    transformValues
};
