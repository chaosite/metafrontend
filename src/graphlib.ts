const fs = (0 || require)('fs');
import { graphviz as gv, wasmFolder } from '@hpcc-js/wasm';
import cytoscape from 'cytoscape';
import disjointSet from 'disjoint-set';

wasmFolder("../../node_modules/@hpcc-js/wasm/dist"); // maybe fix later

enum EdgeType {
    Data = "data",
    Control = "control",
    Associated = "associated"
}

export async function parseDot(dotGraph: string): Promise<any> {
    return JSON.parse(await gv.layout(dotGraph, 'json'));
}

export function simpleLoadJson(cy: cytoscape.Core, jsonDot: any, color: string): cytoscape.Layouts {
    cy.remove(cy.elements());
    cy.remove(cy.edges());
    cy.add(jsonDot.objects.map((node) => ({
        group: 'nodes',
        data: { id: node._gvid, label: node.label, color: color }
    })));
    cy.add(jsonDot.edges.map((edge) => ({
        group: 'edges',
        data: {
            id: 'e' + edge._gvid,
            source: edge.tail,
            target: edge.head,
            label: edge.label
        }
    })));

    const layoutOptions = {
        name: 'breadthfirst',
        padding: 30,
        directed: true,
        fit: true,
        spacingFactor: 1.75,
        avoidOverlap: true,

    };
    const layout = cy.layout(layoutOptions);
    //renderHiding();
    layout.run();
    cy.reset();
    cy.fit();
    return layout;
}

export function loadJson(jsonDot: any, cy: cytoscape.Core): cytoscape.Layouts {
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
    return cy.layout(layoutOptions);
}
