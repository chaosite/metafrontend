<template>
  <v-responsive min-height="400px" min-width="100px">
    <div ref="graph" style="height: 100%; width: 100%"></div>
  </v-responsive>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from "vue";
  import cytoscape from "cytoscape";
  import * as g from "../graphlib";
  const fs = (0 || require)('fs');
  
  const graph = ref(null);
  const state = reactive({ cy: null, hideExtras: false });
 
  onMounted(() => {
    const container = graph.value;
    state.cy = cytoscape({
      container: container,
      style: [
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

    const DOTString = fs.readFileSync('./test_cases/0.dot', 'UTF-8');
    g.parseDot(DOTString)
     .then((newGraph) => { return g.loadJson(newGraph, state.cy); })
     .then((layout) => {
       layout.run();
       state.cy.reset();
       state.cy.fit();
     });
  });
</script>
