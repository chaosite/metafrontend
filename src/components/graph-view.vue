<template>
  <SvgPanZoom
      :zoomEnabled="true"
      :fit="true"
      :center="true"
      :min-zoom="2"
      :max-zoom="50"
      @created="register">
    <graphviz-svg ref="graph"
                  :graph="graph" :layoutStylesheet="layoutStylesheet"
                  @rendered="reinit()">
      <!-- put overlay stuff here -->
    </graphviz-svg>
  </SvgPanZoom>
</template>

<script lang="ts">

import {SvgPanZoom} from "vue-svg-pan-zoom";
import GraphvizSvg from './graphviz-svg.vue';
import {ResultDotJson} from '../queries';
import {defineComponent, PropType} from "vue";

export default defineComponent({
  props: {
    'graph': Object as PropType<any>,
    'layoutStylesheet': String,
    'results': Object as PropType<ResultDotJson>
  },
  data() {
    return {
      svgpanzoom: null as typeof SvgPanZoom,
      currentResult: 0
    }
  },
  mounted() {
    this.$watch(() => this.currentResult, h => {
      if (h >= 0 && h < this.results.length) {
        /* do the thing */
      } else {
        this.currentResult = Math.min(this.results.length, Math.max(0, h));
      }
      console.log(this.results[this.currentResult])
    }, {})
    this.$watch(() => this.results, h => {
      for (let {el, _} of (this.$refs.graph as typeof GraphvizSvg).rendered.iterNodeElements()) {
        el.classList.remove("hilight")
      }
      for (let result of this.results[this.currentResult]) {
        let e = (this.$refs.graph as typeof GraphvizSvg).rendered.elementFromId(result.vertexName)
        e.classList.add("hilight")
      }
      console.log(this.results[this.currentResult])
    }, {})
  },
  components: {SvgPanZoom, GraphvizSvg},
  methods: {
    register(svgpanzoom: typeof SvgPanZoom) {
      this.svgpanzoom = svgpanzoom
    },
    reinit() {
      // praying and spraying
      this.svgpanzoom.resize()
      this.svgpanzoom.updateBBox()
      this.svgpanzoom.resize()
      this.svgpanzoom.updateBBox()
      this.svgpanzoom.fit()
      this.svgpanzoom.contain()
      this.svgpanzoom.center()
      this.svgpanzoom.resize()
      this.svgpanzoom.updateBBox()
      this.svgpanzoom.reset()
    }
  }
})
</script>