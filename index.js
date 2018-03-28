const j = require('/tmp/profiled.json');
const fs = require('fs');
const request = require('request').defaults({ jar: true });

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ type: 'application/json' }));
const port = 3000;

app.use(express.static('static'));

// app.get('/', (request, response) => {
//   response.static('static')
// })

app.post('/query', (req, res) => {
    const { user, pass, json, url } = req.body;
    const profileJson = {
        ...json,
        profile: true
    }
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
            console.log(body)
            if (err) {
                res.send(err);
            }
            res.send(JSON.stringify(body));
        }
    );
});

app.listen(port, err => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});

function getShardInfo(shard) {
    var shardId = shard.id;
    // There's one search per shard for this query
    var search = shard.searches[0];
    // There's one query per search for this query
    var query = search.query[0];
    return getQueryInfo(query);
}

function getQueryInfo(query) {
    return {
        name: query.description,
        value: query.time_in_nanos,
        children: query.children ? query.children.map(i => getQueryInfo(i)) : []
    };
}

// fs.writeFileSync(
//     'flame.json',
//     JSON.stringify(getShardInfo(j.profile.shards[0]))
// );
