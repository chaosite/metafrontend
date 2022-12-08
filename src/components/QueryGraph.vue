<template>
  <v-responsive min-height="300px" min-width="100%">
    <div ref="graph" style="height: 100%; width: 100%"></div>
  </v-responsive>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from "vue";
  import * as dor from "../dor";
  import cytoscape from "cytoscape";

  const graph = ref(null as cytoscape.Core);
  const state = reactive({ cy: null });
  const emit = defineEmits(['select']);
  const prop = defineProps(['masterQuery']);

  onMounted(async () => {
    const container = graph.value;
    await Promise.resolve();
    state.cy = dor.initPuzzle(container as any);
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
