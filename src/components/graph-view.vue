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
// @ts-ignore
import GraphvizSvg from './graphviz-svg.vue';
import {Matches, Result} from '../queries';
import {defineComponent, PropType} from "vue";


export default defineComponent({
  props: {
    'graph': Object as PropType<any>,
    'layoutStylesheet': String,
    'results': Object as PropType<Map<String, Result>>,
    'currentResult': String,
  },
  data() {
    return {
      svgpanzoom: null as typeof SvgPanZoom,
    }
  },
  mounted() {
    this.$watch(() => this.results, h => {
      if (!(this.$refs.graph as typeof GraphvizSvg).rendered)
        return
      for (let {el, _} of (this.$refs.graph as typeof GraphvizSvg).rendered.iterNodeElements()) {
        const toRemove = []
        el.classList.forEach(value => {
          if (value.startsWith("hilight"))
            toRemove.push(value)
        })
        toRemove.forEach(value => {
          el.classList.remove(value)
        })
      }
      for (let [subquery, result] of this.results) {
        for (let match of result.matches[result.selected]) {
          let e = (this.$refs.graph as typeof GraphvizSvg).rendered.elementFromId(match.vertexName)
          e.classList.add("hilight-" + subquery)
        }
      }
    }, {deep: true})
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