// import * as vis from './vis-wrap';
const fs = (0 || require)('fs');
import { graphviz as gv, wasmFolder } from '@hpcc-js/wasm';
wasmFolder("../../node_modules/@hpcc-js/wasm/dist"); // maybe fix later
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import layoutUtilities from 'cytoscape-layout-utilities';
import disjointSet from 'disjoint-set';
import axios from 'axios';

import { App } from './app';
import './index.css';


cytoscape.use(layoutUtilities);
cytoscape.use(fcose);

async function parseDot(dotGraph: string): Promise<any> {
    return JSON.parse(await gv.layout(dotGraph, 'json'));
}

// provide data in the DOT language


//const starterGraphJson = await parseDot(DOTstring);

export var hideExtras = false;
export var cy: cytoscape.Core = null;
export var layout: cytoscape.LayoutManipulation = null;

enum EdgeType {
    Data = "data",
    Control = "control",
    Associated = "associated"
}

class QueryResults {
    _results: { string: string[] }[];
    _query_vertices: { string: string }
    curr: number;

    constructor(results: { string: string[] }[], qVs: { string: string }) {
        this.curr = 0
        this._results = results;
        this._query_vertices = qVs;
    }

    display() {
        cy.nodes().removeClass("queryHilight");
        const vs = this._results[this.curr];
        Object.entries(vs).forEach(([qV, gVs]) => {
            const qVdata = this._query_vertices[qV];
            gVs.forEach(gV => {
                const node = cy.nodes('[name = "' + gV + '"]');
                if (node.size() != 1) {
                    console.error("Bad node", node, gV);
                } else {
                    node.addClass("queryHilight");
                    node[0].data("captureGroup", qVdata);
                }
            });
        });
    }

    next() {
        if (this.curr < this._results.length - 1) {
            this.curr++;
        }
        this.display();
    }

    prev() {
        if (this.curr > 0) {
            this.curr--;
        }
        this.display();
    }
}

export var queryResults: QueryResults = null;

// create a network
async function initFunc() {
    let app = new App;

    Object.assign(window, { app });


    app.openMaster('test_cases/sample.dot');
    /*
    const container = document.getElementById("mynetwork");
    cy = cytoscape({
        container: container,
        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'color': '#fff',
                    'label': 'data(label)',
                    'shape': 'round-rectangle',
                    'width': '11em',
                    'text-valign': 'center',
                    'text-wrap': 'ellipsis'
                }
            },
            {
                selector: 'node.queryHilight',
                style: {
                    'background-color': '#EE8',
                    'color': '#000'
                }
            },
            {
                selector: '.hidden',
                style: {
                    display: 'none'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'text-wrap': 'ellipsis'
                }
            },
            {
                selector: 'edge[type = "data"]',
                style: {
                    'line-color': '#e88',
                    'target-arrow-color': '#e88',
                }
            },
            {
                selector: 'edge[type = "control"]',
                style: {
                    'line-color': '#88b',
                    'target-arrow-color': '#88b',
                }
            }

        ],
    });
    const DOTstring = fs.readFileSync('./test_cases/0.dot', 'UTF-8');
    const result = JSON.parse(fs.readFileSync("./test_cases/0.json", "UTF-8"));
    parseDot(DOTstring)
        .then((newGraph) => { loadJson(newGraph); })
        .then(() => {
            queryResults = new QueryResults(result.queryResults,
                result.queryVertices);
            queryResults.display();
        });

     */
}

function loadJson(jsonDot: any, cy: cytoscape.Core): void {
    function id2node(id: number): string { return 'n' + id; }
    function id2edge(id: number): string { return 'e' + id; }
    console.log(jsonDot);
    cy.remove(cy.elements());
    cy.remove(cy.edges());
    const constraints = [];
    const valign = disjointSet();
    cy.add(jsonDot.objects.map((node) => {
        const id = id2node(node._gvid);
        let extra = "f";
        if (node.label.includes("FrameState"))
            extra = "t";
        const pos = node.pos.split(',');
        return {
            'group': 'nodes',
            'data': {
                'id': id,
                'label': node.label,
                'name': node.name,
                'extra': extra
            },
            'position': { x: parseInt(pos[0]), y: -parseInt(pos[1]) }
        }
    }));
    cy.add(jsonDot.edges.map((edge) => {
        const source = id2node(edge.tail);
        const target = id2node(edge.head);
        const id = id2edge(edge._gvid);
        let edgeType: EdgeType;
        switch (edge.color) {
            case 'blue':
                edgeType = EdgeType.Control;
                break;
            case 'red':
                edgeType = EdgeType.Data;
                break;
            case 'green':
                edgeType = EdgeType.Associated;
                break;
        }

        if (edge.color == 'red' && edge.label != '?loop') {
            constraints.push({ 'top': source, 'bottom': target, gap: 60 });
            switch (edge.label) {
                case 'trueSuccessor':
                    constraints.push({ 'left': source, 'right': target, gap: 40 });
                    break;
                case 'falseSuccessor':
                    constraints.push({ 'right': source, 'left': target, gap: 40 });
                    break;
                case 'next':
                case '???':
                    constraints.push({ 'top': source, 'bottom': target, gap: 40 });
                    valign.add(source);
                    valign.add(target);
                    if (!cy.$id(target).data('label').match((/Merge$/i)))
                        valign.union(source, target);
                    break;
            }
        }
        if (edge.color == 'blue') {
            switch (edge.label) {
                case 'condition':
                case 'x':
                case 'y':
                case 'arguments':
                    constraints.push({ 'top': source, 'bottom': target, gap: 40 });
                    break;
            }

        }
        return {
            'group': 'edges',
            'data': {
                'id': id,
                'source': source,
                'target': target,
                'label': edge.label,
                'type': edgeType
            }
        }
    }));
    const layoutOptions = {
        'name': 'fcose',
        'quality': 'proof',
        'nodeDimensionsIncludeLabels': true,
        'uniformNodeDimensions': true,
        'nodeSeparation': 300,
        'sampleSize': 100,
        'idealEdgeLength': (e) => 250,
        'fixedNodeConstraint': [{ 'nodeId': 'n0', 'position': { 'x': 0, 'y': 0 } }],
        'alignmentConstraint': { 'vertical': valign.extract() },
        'relativePlacementConstraint': constraints
    };
    layout = cy.layout(layoutOptions);
    renderHiding();
    //layout.run();
    cy.reset();
    cy.fit();
}

function renderHiding() {
    if (hideExtras)
        cy.$('node[extra = "t"]').addClass("hidden");
    else
        cy.$('node[extra = "t"]').removeClass("hidden");
}

// After all this await business, we *might* have already loaded the DOM...
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', initFunc);
} else {
    initFunc();
}

export function executeHandler() {
    const code = document.querySelector<HTMLTextAreaElement>("#code-area").value
    axios.post('http://localhost:8080/api/compiler/run', {
        "args": "",
        "files": [
            {
                name: "File.kt",
                text: code
            }
        ]
    }).then(res => {
        console.log(`status: ${res.status}`);
        console.log(res);
        const result = JSON.parse(res.data.text
            .replace(/^<outStream>/, "")
            .replace(/<\/outStream>$/, ""));
        const newGraphDot = result.graph;
        console.log(newGraphDot);
        parseDot(newGraphDot)
            .then((newGraph) => { loadJson(newGraph, cy); })
            .then(() => {
                queryResults = new QueryResults(result.queryResults,
                    result.queryVertices);
                queryResults.display();
            });
    }).catch(err => {
        console.error(err);
    });
}

function queryNextHandler() {
    queryResults.next();
    queryResults.display();
}

function queryPrevHandler() {
    queryResults.prev();
    queryResults.display();
}

function extrasCheckHandler() {
    hideExtras = document.querySelector<HTMLInputElement>("#hideExtras").checked;
    renderHiding();
    layout.run();
}

Object.assign(window, { executeHandler, queryNextHandler, queryPrevHandler, extrasCheckHandler });
