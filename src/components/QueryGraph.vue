<template>
  <v-responsive min-height="500px" min-width="100%">
    <div ref="graph" style="height: 100%; width: 100%"></div>
  </v-responsive>
</template>

<script setup>
  import { ref, reactive, onMounted, watch } from "vue";
  import cytoscape from "cytoscape";
  import { parseDot } from "../graphlib";
  import * as dor from "../dor";

  const graph = ref(null);
  const state = reactive({ cy: null });
  const emit = defineEmits(['select']);
  const prop = defineProps(['masterQuery']);

  onMounted(async () => {
    const container = graph.value;
    await Promise.resolve();
    state.cy = dor.initPuzzle(graph.value);
    state.cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      emit('select', { id: node.id(), node });
    });
  });

  watch(() => prop.masterQuery,
    (curr, prev) => {
    curr && dor.populatePuzzle(state.cy, curr);
  });
</script>
