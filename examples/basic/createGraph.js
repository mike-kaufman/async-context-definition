var jsav = new JSAV("av");

// var g = initGraph({
//     layout: "layered"
// });

function getExecuteNodeID(id) {
    return `Execute ${id}`;
}

function getCauseNodeID(id) {
    return `Cause ${id}`;
}

function getLinkNodeID(id) {
    return `Link ${id}`;
}

var tempRecords = [{
        event: "executeBegin",
        executeID: 0
    },
    {
        event: "link",
        executeID: 0,
        linkID: 1
    },
    {
        event: "cause",
        executeID: 0,
        linkID: 1,
        causeID: 2
    },
    {
        event: "executeEnd",
        executeID: 0
    },

    {
        event: "executeBegin",
        executeID: 3,
        causeID: 2
    },
    {
        event: "link",
        executeID: 3,
        linkID: 4
    },
    {
        event: "link",
        executeID: 3,
        linkID: 5
    },
    {
        event: "link",
        executeID: 3,
        linkID: 6
    },
    {
        event: "cause",
        executeID: 3,
        linkID: 4,
        causeID: 7
    },
    {
        event: "executeEnd",
        executeID: 3
    },

    {
        event: "executeBegin",
        executeID: 8,
        causeID: 7
    },
    {
        event: "cause",
        executeID: 8,
        linkID: 5,
        causeID: 9
    },
    {
        event: "cause",
        executeID: 8,
        linkID: 6,
        causeID: 10
    },
    {
        event: "executeEnd",
        executeID: 8
    },
    {
        event: "executeBegin",
        executeID: 11,
        causeID: 9
    },
    {
        event: "executeEnd",
        executeID: 11
    },
    {
        event: "executeBegin",
        executeID: 12,
        causeID: 10
    },
    {
        event: "executeEnd",
        executeID: 12
    }
];

var nodes = {};

function addNode(g, value) {
    //jsav.displayInit();
    const n = g.addNode(value);
    nodes[value] = n;
    // g.layout();
    // jsav.step();
}

function getNode(value) {
    return nodes[value];
}

function addEdge(g, v1, v2) {
    //jsav.displayInit();
    const n1 = getNode(v1);
    const n2 = getNode(v2);
    g.addEdge(n1, n2);
    // g.layout();
    // jsav.step();
}

function processNodes(records, g) {

    for (let i = 0; i < records.length; i++) {
        const r = records[i];
        switch (r.event) {
            case 'executeBegin':
                addNode(g, getExecuteNodeID(r.executeID));
                if (r.executeID != 0) {
                    addEdge(g, getCauseNodeID(r.causeID), getExecuteNodeID(r.executeID));
                }
                break;
            case 'executeEnd':
                // change state on 'execute' node to "completed"
                // event:
                //  { type: 'executeEnd'
                //      executeID:  
                //   }
                break;
            case 'link':

                // add link node
                addNode(g, getLinkNodeID(r.linkID));
                // add edge from current execution node to new link node
                addEdge(g, getExecuteNodeID(r.executeID), getLinkNodeID(r.linkID));

                //add 'link' node
                // add 'link' edge from "current" to ""
                //  { type: 'link'
                //    linkID:  5,  // ID of new link node
                //      executeID: n, // ID of current execute node
                //   }
                break;
            case 'cause':
                // create "cause" node
                addNode(g, getCauseNodeID(r.causeID));
                // create "edge to current execution edge"
                addEdge(g, getExecuteNodeID(r.executeID), getCauseNodeID(r.causeID))
                // create "linked-by" edge
                addEdge(g, getLinkNodeID(r.linkID), getCauseNodeID(r.causeID));
                // add 'cause' edge from where to where?
                // { 
                // type: 'cause',
                // causeID:  n,
                // linkID:  q,
                // executionID
                //}

                break;
            default:
                console.error(`unexpected event value: ${r.event}`);
        }
        g.layout();
        jsav.step();
    }
}

function initGraph(opts) {
    var g = jsav.ds.graph($.extend({
        width: 500,
        height: 350
    }, opts));
    return g;
};

function populateGraph(g){
    processNodes(tempRecords, g);
    // var a = g.addNode("A"),
    //     b = g.addNode("B"),
    //     c = g.addNode("C"),
    //     d = g.addNode("D"),
    //     e = g.addNode("E"),
    //     f = g.addNode("F");
    // g.addEdge(a, b);
    // g.addEdge(a, c);
    // g.addEdge(b, d);
    // g.addEdge(e, a);
    // g.addEdge(d, e);
    // g.addEdge(d, f);
}

    var l2 = jsav.label("Default automatic graph layout")
    var g2 = initGraph({
        layout: "layered"
    });

    //jsav.label("Layered graph layout")
    // var g = initGraph({
    //     layout: "layered"
    // });
    // g.layout();
    jsav.displayInit();
    populateGraph(g2);
    //g2.layout();
    //jsav.displayInit();

    // hide the "other" graph
    //g2.hide();
    //l2.hide();
    //jsav.step();

    var preVisit = function (node, prev) {
        node.addClass("processing");
        jsav.umsg("Add node " + node.value() + " to the DFS search tree");
        if (prev) {
            node.edgeFrom(prev).css("stroke", "red"); // highlight
            node.edgeTo(prev).css("stroke", "red"); // highlight
        }
        jsav.step();
    };
    var visit = function (node) {
        node.addClass("visited");
        jsav.umsg("Call DFS for node " + node.value());
        jsav.step();
    };
    var postVisit = function (node) {
        node.addClass("finished");
        jsav.umsg("Done with node " + node.value());
        jsav.step();
    };
    var dfs = function (start, prev) {
        var successors,
            next;
        preVisit(start, prev);
        successors = start.neighbors();
        for (next = successors.next(); next; next = successors.next()) {
            if (!next.hasClass("visited")) {
                visit(next);
                dfs(next, start);
            }
        }
        postVisit(start);
    };
    //visit(g.nodes()[0]);
    //dfs(g.nodes()[0]);
    jsav.recorded();