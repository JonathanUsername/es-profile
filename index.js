const { runQueryPromise, transformValues } = require("./utils");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json({ type: "application/json" }));

app.use(express.static("static"));

let hammering = null;

app.post("/query", (req, res) => {
    let { user, pass, json, url, hammer, reqsec } = req.body;
    if (hammer) {
        let requestCount = 0;
        hammering = setInterval(() => {
            json = transformValues(json);
            const reqId = ++requestCount
            console.log(`Sending request ${reqId}`);
            runQueryPromise({ url, user, pass, json, profile: true })
                .then(body => {
                    console.log(`Receiving request ${reqId}`);
                })
                .catch(err => {
                    console.error(err);
                });
        }, 1000 / reqsec);
        res.send({message: "Running hammer... click GO to stop"});
    } else {
        if (hammering) {
            clearInterval(hammering);
        }
        runQueryPromise({ url, user, pass, json, profile: true })
            .then(body => {
                res.send(JSON.stringify(body));
            })
            .catch(err => {
                res.send(err);
            });
    }
});

app.listen(port, err => {
    if (err) {
        return console.error(err);
    }

    console.log(`server is listening on ${port}`);
});
