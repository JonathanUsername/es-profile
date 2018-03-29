# es-profile
Profile Elasticsearch queries with an interactive flamegraph.

This was made as a very quick hack to help profile some ES queries. It is extremely particular to our setup, and I don't really care enough to generalise it, since it has served its purpose now.
If you're trying to dig into something similar and can't afford the paid-for alternatives, try hacking around on this, or just read what I did and do it better!

## Features
- Interactive flamegraph of the query AST, as supplied by the Elasticsearch profile api (using [this d3 library](https://github.com/spiermar/d3-flame-graph))
- List of the query "hits", with associated information
- Shard selector, to compare performance across shards
- Supports basic authentication. Because who would need anything more?
- Quick "hammer" function to flood the endpoint with requests as a small stress test. For masochists that like to DDoS themselves.

## Gorgeous interface
Just look at this. I'm speechless. Move over, Jony Ive.

![Picture of interface](https://user-images.githubusercontent.com/7237525/38099122-b670fb26-3371-11e8-907d-d601a0755144.png)

Get this, it's even interactive:


![Picture of flame graph](https://user-images.githubusercontent.com/7237525/38099869-9c71ece2-3373-11e8-896e-2eb85089d1f2.gif)
