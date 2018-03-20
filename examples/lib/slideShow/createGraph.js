(function () {
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
        return `Output ${id}:`;
    }

    var nodes = {};

    function addNode(g, value, extra) {
        let displayString = value;
        if (extra) {
            displayString = `${value} (${extra})`;
        }
        const n = g.addNode(displayString);
        nodes[value] = n;
        return n;
    }

    function getNode(value) {
        return nodes[value];
    }

    // see valid opts for Edge:
    //  -  http://jsav.io/graphicalprimitives/lines/
    //  -  https://dmitrybaranovskiy.github.io/raphael/reference.html
    function addEdge(g, v1, v2, opts) {
        const n1 = getNode(v1);
        const n2 = getNode(v2);
        opts = opts || {};
        opts['arrow-end'] = 'classic-wide-long'; /*classic, block, open, oval, diamond, none,*/ ;
        return g.addEdge(n1, n2, opts);
    }

    // set up code display
    const jsavCode = jsav.code(codeLines, {
        after: {
            element: $('#codeAnchor')
        }
    });

    // set up event display
    const recordsString = records.reduce((accumlator, curr) => {
        const obj = Object.assign({}, curr);
        if (obj.data) {
            delete obj.data;
        }
        return accumlator += JSON.stringify(obj) + '\n';
    }, '');
    const jsavEvents = jsav.code(recordsString, {
        after: {
            element: $('#eventAnchor')
        }
    })

    function processNodes(records, g) {

        let currentExecutionID = -1;
        let currentCodeHighlightLine = undefined;
        for (let i = 0; i < records.length; i++) {
            const r = records[i];

            // handle code highlighting
            if (r.data && r.data.highlightLine !== undefined) {
                if (currentCodeHighlightLine > 0) {
                    jsavCode.unhighlight(currentCodeHighlightLine);
                }
                jsavCode.highlight(r.data.highlightLine);
                currentCodeHighlightLine = r.data.highlightLine;
            }

            if (i > 0) {
                jsavEvents.unhighlight(i);
            }
            jsavEvents.highlight(i + 1);

            switch (r.event) {
                case 'executeBegin':
                    currentExecutionID = r.executeID;
                    addNode(g, getExecuteNodeID(r.executeID)).addClass('activeExecutionNode');
                    if (r.executeID != 0) {
                        addEdge(g, getCauseNodeID(r.causeID), getExecuteNodeID(r.executeID));
                    }
                    break;
                case 'executeEnd':
                    if (currentCodeHighlightLine > 0) {
                        jsavCode.unhighlight(currentCodeHighlightLine);
                        currentCodeHighlightLine = -1;
                    }
                    currentExecutionID = -1;
                    getNode(getExecuteNodeID(r.executeID)).removeClass('activeExecutionNode').addClass('completedExecutionNode');
                    break;
                case 'link':
                    {
                        // add link node
                        let extraData;
                        if (r.data && r.data.type) {
                            extraData = r.data.type;
                        }
                        addNode(g, getLinkNodeID(r.linkID), extraData).addClass('linkNode');
                        // add edge from current execution node to new link node
                        addEdge(g, getExecuteNodeID(r.executeID), getLinkNodeID(r.linkID));

                    }
                    break;
                case 'cause':
                    // create "cause" node
                    addNode(g, getCauseNodeID(r.causeID)).addClass('causeNode');
                    // create "edge to current execution edge"
                    addEdge(g, getExecuteNodeID(r.executeID), getCauseNodeID(r.causeID), {
                        'stroke-dasharray': ['- .'],
                        'arrow-end': 'block' /*, classic, block, open, oval, diamond, none,*/
                    });
                    // create "linked-by" edge
                    addEdge(g, getLinkNodeID(r.linkID), getCauseNodeID(r.causeID));
                    break;
                case 'output':
                    {
                        let extraData;
                        if (r.data && r.data.output) {
                            extraData = r.data.output;
                        }
                        addNode(g, getOutputNodeID(currentExecutionID), extraData).addClass('outputNode');
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

    jsav.recorded();
})();