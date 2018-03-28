const fs = require('fs');
const request = require('request').defaults({ jar: true });

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json({ type: 'application/json' }));

app.use(express.static('static'));

app.post('/query', (req, res) => {
    const { user, pass, json, url } = req.body;
    const profileJson = {
        ...json,
        profile: true
    };
    request(
        {
            method: 'GET',
            uri: url,
            auth: {
                user,
                pass
            },
            json: profileJson
        },
        (err, response, body) => {
            if (err) {
                res.send(err);
            }
            res.send(JSON.stringify(body));
        }
    );
});

app.listen(port, err => {
    if (err) {
        return console.error(err);
    }

    console.log(`server is listening on ${port}`);
});
