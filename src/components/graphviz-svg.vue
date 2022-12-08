<template>
  <svg ref="svg" class="graphviz" :viewBox="'0  0 ' + size.width + ' ' + size.height" :height="size.height"
       :width="size.width">
    <g ref="drawGraph"></g>
    <slot/>
  </svg>
</template>

<script lang="ts">
import {GraphvizAdapter} from '../graphs/graphviz';
import {defineComponent} from "vue";

export default defineComponent({
  props: ['graph', 'layoutStylesheet'],
  data: () => ({
    size: {width: 150, height: 150},
    adapter: null,
    rendered: null
  }),
  mounted() {
    this.adapter = new GraphvizAdapter();
    if (this.graph) this.render();
  },
  watch: {
    graph() {
      if (this.graph) this.render(); else this.clear();
    }
  },
  methods: {
    async render() {
      this.adapter.stylesheet = this.layoutStylesheet;
      let {svg, graph} = this.rendered =
          await this.adapter.render(this.graph);
      if (graph !== this.graph) return; /* race avoidance */

      this.clear();
      (this.$refs.drawGraph as SVGElement).append(...svg.children);
      this.size = {
        width: svg.width.baseVal.valueInSpecifiedUnits,
        height: svg.height.baseVal.valueInSpecifiedUnits
      };
      this.rendered.svg = this.$refs.svg;
      this.$emit('rendered', this.rendered);
    },
    clear() {
      (this.$refs.drawGraph as any).textContent = '';
      /* @todo reset size? */
    },
    nodeFromElement(el) {
      return this.rendered.nodeFromElement(el);
    },
  }
})
</script>
