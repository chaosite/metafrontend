<template>
  <v-app>
    <v-app-bar>
      <v-btn @click.stop="drawer = !drawer">Query</v-btn>
    </v-app-bar>
    <v-main>
      <splitpanes class="default-theme" :class="{drawer}" @resize="drawerSize = $event[0].size">
        <pane :size="drawer ? drawerSize : 0">
          <v-container fluid>
            <QueryGraph @select="focusOnSubquery"
                        :masterQuery="compositeQuery?.masterQuery"></QueryGraph>

            <v-row align="center" justify="space-between">
              <v-btn plain>Prev</v-btn>
              <v-btn plain>Next</v-btn>
            </v-row>

            <SubqueryGraph :dotJson="getSubquery(currentSubquery)" :color="subqueryColor"
                           ref="subqueryGraph"></SubqueryGraph>
          </v-container>
        </pane>
        <pane :size="100 - (drawer ? drawerSize : 0)">
          <graph-view ref="program" :graph="graph" :results="getResults(currentSubquery)" :current-result="0"/>
        </pane>
      </splitpanes>
      <!-- 
      <v-card>
        <ResultGraph></ResultGraph>
      </v-card>
       -->
    </v-main>
  </v-app>
</template>

<style>
.splitpanes--vertical .splitpanes__pane {
  transition: none; /* to avoid useless animation on startup */
}

.splitpanes:not(.drawer) .splitpanes__splitter {
  display: none;
}
</style>

<script lang="ts">
import {Splitpanes, Pane} from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import ResultGraph from './ResultGraph.vue';
import QueryGraph from './QueryGraph.vue';
import SubqueryGraph from './SubqueryGraph.vue';
import {CompositeQuery} from '../queries';

import GraphView from './graph-view.vue';
import GraphvizSvg from './graphviz-svg.vue';

import {defineComponent} from 'vue'


export default defineComponent({
  components: {
    Splitpanes, Pane,
    ResultGraph,
    QueryGraph,
    SubqueryGraph,
    GraphvizSvg,
    GraphView
  },
  data() {
    return {
      drawer: true,
      drawerSize: 20,
      currentSubquery: null as String,
      subqueryColor: null as String,
      compositeQuery: null as CompositeQuery,
      graph: null,
      results: []
    };
  },
  methods: {
    focusOnSubquery({id, node}) {
      this.currentSubquery = id;
      this.subqueryColor = node._private.style["background-color"].strValue;
      console.log(id)
    },
    getSubquery(id) {
      return this.compositeQuery?.subqueries.get(id);
    },
    getResults(id) {
      return this.compositeQuery?.subqueryResults?.get(id);
    }
  },
  async mounted() {
    this.compositeQuery = await CompositeQuery.open('./test_cases/puzzle.json',
        './test_cases/subqueries',
        './test_cases/kruskal1');
  }
})
</script>
