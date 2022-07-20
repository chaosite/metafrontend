<template>
    <svg ref="svg" class="graphviz" :height="size.y" :width="size.x"
        @mouseover="onMouseOver">
        <g ref="drawGraph"></g>
        <slot/>
    </svg>
</template>

<script>
import { GraphvizAdapter } from '../graphs/graphviz';

export default {
    props: ['graph', 'layoutStylesheet'],
    data: () => ({
        size: {x: 150, y: 150},
        hover: {}
    }),
    mounted() {
        this.adapter = new GraphvizAdapter();
        if (this.graph) this.render();
    },
    watch: {
        graph() { if (this.graph) this.render(); else this.clear(); }
    },
    methods: {
        async render() {
            this.adapter.stylesheet = this.layoutStylesheet;
            let {svg, graph} = this.rendered =
                await this.adapter.render(this.graph);
            if (graph !== this.graph) return; /* race avoidance */

            this.clear();
            this.$refs.drawGraph.append(...svg.children);
            this.size = {
                x: svg.width.baseVal.valueInSpecifiedUnits,
                y: svg.height.baseVal.valueInSpecifiedUnits
            };
            this.rendered.svg = this.$refs.svg;
            this.$emit('rendered', this.rendered);
        },
        clear() {
            this.$refs.drawGraph.textContent = '';
            /* @todo reset size? */
        },
        nodeFromElement(el) {
            return this.rendered.nodeFromElement(el);
        },
        onMouseOver(ev) {
            this.hover.node = this.nodeFromElement(ev.target)
                              ?? this._overlay?.eclassFromElement(ev.target);
        }
    }
}
</script>
