var flameGraph = d3
    .flameGraph()
    .width(960)
    .cellHeight(18)
    .transitionDuration(750)
    .transitionEase(d3.easeCubic)
    .sort(true)
    //Example to sort in reverse order
    //.sort(function(a,b){ return d3.descending(a.name, b.name);})
    .title("");

// Example on how to use custom tooltips using d3-tip.
var tip = d3
    .tip()
    .direction("s")
    .offset([8, 0])
    .attr("class", "d3-flame-graph-tip")
    .html(function(d) {
        return `<div style="max-width: 500px;"><div>time(ms): ${d.data.value /
            1000000}</div><div>function: ${d.data.name}</div></div>`; // convert from nanos to millis
    });

flameGraph.tooltip(tip);

var globalData;
var holder = document.getElementById("json-holder");
var pass = document.getElementById("pass");
var url = document.getElementById("url");
var user = document.getElementById("user");
var go = document.getElementById("go");
var hammer = document.getElementById("hammer");
var total = document.getElementById("total");
var shards = document.getElementById("shards");
var hits = document.getElementById("hits");
var reqsec = document.getElementById("reqsec");
var bottom = document.getElementById("bottom-bit");

var oldUrl = localStorage.getItem("url");
var oldJson = localStorage.getItem("json");
if (oldUrl) {
    url.value = oldUrl;
}
if (oldJson) {
    holder.value = oldJson;
}

function init(shouldHammer) {
    var json = null;

    doOrErr(() => {
        json = JSON.parse(holder.value.trim());
    }, "Can't parse JSON value");

    if (!json) {
        return;
    }

    var body = {
        pass: pass.value,
        user: user.value,
        url: url.value,
        hammer: shouldHammer,
        reqsec: reqsec.value,
        json
    };

    window.localStorage.setItem("url", url.value);
    window.localStorage.setItem("json", JSON.stringify(json));

    fetch("/query", {
        method: "post",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(i => i.json())
        .then(obj => {
            if (obj.error || obj.message) {
                var msg = obj.error || obj.message;
                total.innerText = msg;
                return;
            }
            doOrErr(() => {
                console.log(obj.profile.shards);
            }, JSON.stringify(obj));
            globalData = obj;
            shards.style.display = "block";
            bottom.style.display = "block";
            while (shards.firstChild) {
                shards.removeChild(shards.firstChild);
            }
            obj.profile.shards.forEach((i, idx) => {
                const e = document.createElement("button");
                e.innerText = `${i.id}`;
                e.addEventListener(
                    "click",
                    () => {
                        displayShard(obj, idx);
                    },
                    false
                );
                shards.appendChild(e);
            });
            while (hits.firstChild) {
                hits.removeChild(hits.firstChild);
            }
            if (!obj.hits.hits.length) {
                hits.innerHTML = `<p>NO HITS</p>`;
            } else {
                obj.hits.hits.forEach((i, idx) => {
                    const e = document.createElement("p");
                    e.innerText = `${i._id} - ${i._source.cloudcast_name} by ${
                        i._source.owner.name
                    }`;
                    e.style.cursor = "pointer";
                    e.addEventListener(
                        "click",
                        () => {
                            alert(JSON.stringify(i, null, 2));
                        },
                        false
                    );
                    hits.appendChild(e);
                });
            }
            displayShard(obj, 0);
        })
        .catch(err => {
            total.innerText = err;
        });
}

function initHammer() {
    init(true);
}

function getShardInfo(shard) {
    var shardId = shard.id;

    // TODO: handle multiple searches/queries

    var search = shard.searches[0];
    if (shard.searches.length > 1) {
        total.innerText += " (more than one search found but not displayed)";
    }

    var query = search.query[0];
    if (search.query.length > 1) {
        total.innerText += " (more than one query found but not displayed)";
    }
    return getQueryInfo(query);
}

function getQueryInfo(query) {
    // Pack tree into the data flamegraph expects
    return {
        name: query.description,
        value: query.time_in_nanos,
        children: query.children ? query.children.map(i => getQueryInfo(i)) : []
    };
}

function displayShard(obj, shard_idx) {
    var data = getShardInfo(obj.profile.shards[shard_idx]);
    total.innerText = `Total time: ${obj.took}ms`;
    d3
        .select("#chart")
        .datum(data)
        .call(flameGraph);
}

function doOrErr(fn, err) {
    let whoops = false;
    try {
        fn();
    } catch (e) {
        total.innerText = err;
        whoops = true;
    }
    if (whoops) {
        throw Error(err);
    }
}

document.getElementById("form").addEventListener("submit", function(event) {
    event.preventDefault();
    search();
});

function search() {
    var term = document.getElementById("term").value;
    flameGraph.search(term);
}

function clear() {
    document.getElementById("term").value = "";
    flameGraph.clear();
}

function resetZoom() {
    flameGraph.resetZoom();
}

function onClick(d) {
    console.info("Clicked on " + d.data.name);
}

// Unused, but could do something like this for random values somehow
function interpolateRandomValues(json) {
    const str = JSON.stringify(json);
    const matchGroup = str.match(/%RANDINT%/);
    if (!matchGroup) {
        resolve(json);
    }
    const [toReplace, fromInt, toInt, ...rest] = str.match(/%RANDINT%/);
    const randInt =
        Math.floor(Math.random() * parseInt(toInt, 10)) +
        parseInt(fromInt, 10);
    str.replace(toReplace, `${randInt}`);
    return JSON.parse(str);
};

go.addEventListener(
    "click",
    () => {
        init();
    },
    false
);
hammer.addEventListener("click", initHammer, false);
