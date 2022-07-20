<template>
  <pan-zoom ref="pz">
    <graphviz-svg ref="graph"
      :graph="graph" :layoutStylesheet="layoutStylesheet"/>
  </pan-zoom>
</template>

<script>
import PanZoom from '../infra/ui-pan-zoom.vue';
import GraphvizSvg from './graphviz-svg.vue';

export default {
  props: ['graph', 'layoutStylesheet'],
  mounted() {
    this.$refs.pz.zoom.zoomRange = {min: 0.1, max: 2};
    this.$watch(() => this.$refs.graph.hover, h => {
      console.log(h.node);
    }, {deep: true});
  },
  components: { PanZoom, GraphvizSvg }
}
</script>