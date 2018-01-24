var jsav = new JSAV("av");

function getExecuteNodeID(id) {
    return `Execute ${id}`;
}

function getCauseNodeID(id) {
    return `Cause ${id}`;
}

function getLinkNodeID(id) {
    return `Link ${id}`;
}

function getOutputNodeID(id) {
    return `Output ${id}`;
}

var nodes = {};

function addNode(g, value, extra) {
    let displayString = value;
    if (extra) {
        displayString = `${value} (${extra})`;
    }
    const n = g.addNode(displayString);
    nodes[value] = n;
 }

function getNode(value) {
    return nodes[value];
}

function addEdge(g, v1, v2) {
    const n1 = getNode(v1);
    const n2 = getNode(v2);
    g.addEdge(n1, n2);
}

const jsavCode = jsav.code(codeLines);

function processNodes(records, g) {

    let currentExecutionID = -1;
    let currentHighlightLine = undefined;
    for (let i = 0; i < records.length; i++) {
        const r = records[i];

         // handle code highlighting
         if (r.data && r.data.highlightLine !== undefined) {
            if (currentHighlightLine > 0) {
                jsavCode.unhighlight(currentHighlightLine);
            }
            jsavCode.highlight(r.data.highlightLine);
            currentHighlightLine = r.data.highlightLine;
         }

        switch (r.event) {
            case 'executeBegin':
                currentExecutionID = r.executeID;
                addNode(g, getExecuteNodeID(r.executeID));
                if (r.executeID != 0) {
                    addEdge(g, getCauseNodeID(r.causeID), getExecuteNodeID(r.executeID));
                }
                break;
            case 'executeEnd':
                currentExecutionID = -1;
                // change state on 'execute' node to "completed"
                // event:
                //  { type: 'executeEnd'
                //      executeID:  
                //   }
                break;
            case 'link':
{
                // add link node
                let extraData;
                if (r.data && r.data.type) {
                    extraData = r.data.type;
                }
                addNode(g, getLinkNodeID(r.linkID), extraData);
                // add edge from current execution node to new link node
                addEdge(g, getExecuteNodeID(r.executeID), getLinkNodeID(r.linkID));

            }
                break;
            case 'cause':
                // create "cause" node
                addNode(g, getCauseNodeID(r.causeID));
                // create "edge to current execution edge"
                addEdge(g, getExecuteNodeID(r.executeID), getCauseNodeID(r.causeID))
                // create "linked-by" edge
                addEdge(g, getLinkNodeID(r.linkID), getCauseNodeID(r.causeID));
                break;
            case 'output':
            {
                let extraData;
                if (r.data && r.data.output) {
                    extraData = r.data.output;
                }
                addNode(g, getOutputNodeID(currentExecutionID), extraData);
                // add edge from current execution node to new link node
                addEdge(g, getExecuteNodeID(currentExecutionID), getOutputNodeID(currentExecutionID));
            }
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

function populateGraph(g) {
    processNodes(records, g);
}

var l2 = jsav.label("Async Context Visualization");
var g2 = initGraph({
    layout: "layered"
});

jsav.displayInit();
populateGraph(g2);

//
// see below for adding css styling to edges/nodes
//
// var preVisit = function (node, prev) {
//     node.addClass("processing");
//     jsav.umsg("Add node " + node.value() + " to the DFS search tree");
//     if (prev) {
//         node.edgeFrom(prev).css("stroke", "red"); // highlight
//         node.edgeTo(prev).css("stroke", "red"); // highlight
//     }
//     jsav.step();
// };
// var visit = function (node) {
//     node.addClass("visited");
//     jsav.umsg("Call DFS for node " + node.value());
//     jsav.step();
// };
// var postVisit = function (node) {
//     node.addClass("finished");
//     jsav.umsg("Done with node " + node.value());
//     jsav.step();
// };

jsav.recorded();