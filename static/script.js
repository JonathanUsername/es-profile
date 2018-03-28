var flameGraph = d3
    .flameGraph()
    .width(960)
    .cellHeight(18)
    .transitionDuration(750)
    .transitionEase(d3.easeCubic)
    .sort(true)
    //Example to sort in reverse order
    //.sort(function(a,b){ return d3.descending(a.name, b.name);})
    .title('');

// Example on how to use custom tooltips using d3-tip.
var tip = d3
    .tip()
    .direction('s')
    .offset([8, 0])
    .attr('class', 'd3-flame-graph-tip')
    .html(function(d) {
        return 'name: ' + d.data.name + ', value: ' + d.data.value;
    });

flameGraph.tooltip(tip);

// Example on how to use custom labels
// var label = function(d) {
//  return "name: " + d.data.name + ", value: " + d.data.value;
// }

// flameGraph.label(label);
function init(data) {
    d3
        .select('#chart')
        .datum(data)
        .call(flameGraph);
}

var holder = document.getElementById('json-holder');

// For instance:
// holder.value = `{"query": {"bool": {"filter": {"bool": {"must_not": [{"term": {"block_up_next": true}}], "must": [{"term": {"is_public": true}}, {"range": {"quality_score": {"gte": 0.2}}}, {"range": {"plays": {"gte": 10}}}]}}, "must": {"function_score": {"query": {"more_like_this": {"fields": ["discover_tag", "genre", "cloudcast_name", "owner.name"], "max_query_terms": 12, "like": [{"_type": "cloudcast", "_id": 150843434, "_index": "mixcloud_search_read"}], "min_term_freq": 1}}, "functions": [{"field_value_factor": {"field": "owner.boost"}}]}}}}}`;
var pass = document.getElementById('pass');
var url = document.getElementById('url');
var user = document.getElementById('user');
var go = document.getElementById('go');
var total = document.getElementById('total');
var shards = document.getElementById('shards');
var hits = document.getElementById('hits');
var bottom = document.getElementById('bottom-bit');

var globalData;

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

function displayShard(obj, shard_idx) {
    var data = getShardInfo(obj.profile.shards[shard_idx]);
    total.innerText = `Total time: ${obj.took}ms`;
    d3
        .select('#chart')
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

function init() {
    var json = null
    doOrErr(() => {
        json = JSON.parse(holder.value.trim());
    }, "Can't parse JSON value");
    if (!json) {
        return
    }
    var body = {
        pass: pass.value,
        user: user.value,
        url: url.value,
        json
    };

    fetch('/query', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(i => i.json())
        .then(obj => {
            if (obj.error) {
                total.innerText = obj.error.reason;
                return;
            }
            doOrErr(() => {
                console.log(obj.profile.shards);
            }, JSON.stringify(obj));
            globalData = obj;
            shards.style.display = 'block';
            bottom.style.display = 'block';
            while (shards.firstChild) {
                shards.removeChild(shards.firstChild);
            }
            obj.profile.shards.forEach((i, idx) => {
                const e = document.createElement('button');
                e.innerText = `${i.id}`;
                e.addEventListener(
                    'click',
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
                    const e = document.createElement('p');
                    e.innerText = `${i._id} - ${i._source.cloudcast_name} by ${
                        i._source.owner.name
                    }`;
                    e.addEventListener(
                        'click',
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

go.addEventListener('click', init, false);

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    search();
});

function search() {
    var term = document.getElementById('term').value;
    flameGraph.search(term);
}

function clear() {
    document.getElementById('term').value = '';
    flameGraph.clear();
}

function resetZoom() {
    flameGraph.resetZoom();
}

function onClick(d) {
    console.info('Clicked on ' + d.data.name);
}