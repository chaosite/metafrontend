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

            <v-row v-if="currentSubquery != null" align="center" justify="space-between">
              <v-btn @click.stop="decrementResult()">Prev</v-btn>
              <v-btn @click.stop="incrementResult()">Next</v-btn>
              <p>Match: {{ getMatchNumber() }} / {{ getNumberOfMatches() }}</p>
            </v-row>

            <SubqueryGraph :dotJson="getSubquery(currentSubquery)" :color="subqueryColor"
                           ref="subqueryGraph"></SubqueryGraph>
          </v-container>
        </pane>
        <pane :size="100 - (drawer ? drawerSize : 0)">
          <graph-view ref="program" :graph="graph" :results="this.compositeQuery?.subqueryResults" :current-result="0"/>
        </pane>
      </splitpanes>
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
// @ts-ignore
import {Splitpanes, Pane} from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import ResultGraph from './ResultGraph.vue';
import QueryGraph from './QueryGraph.vue';
import SubqueryGraph from './SubqueryGraph.vue';
import {CompositeQuery, Matches, Result} from '../queries';

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
     // console.log(id)
    },
    getSubquery(this: {compositeQuery: CompositeQuery | undefined}, id) {
      return this.compositeQuery?.subqueries.get(id);
    },
    getResults(id) {
      return this.compositeQuery?.subqueryResults?.get(id);
    },
    incrementResult() {
      const result = this.compositeQuery?.subqueryResults?.get(this.currentSubquery)

      if (result && result.selected < result.matches.length - 1)
        result.selected++
    },
    decrementResult() {
      const result = this.compositeQuery?.subqueryResults?.get(this.currentSubquery)
      if (result && result.selected > 0)
        result.selected--
    },
    getMatchNumber(): number {
      if (!this.compositeQuery || !this.currentSubquery)
        return null

      return this.compositeQuery?.subqueryResults?.get(this.currentSubquery).selected + 1
    },
    getNumberOfMatches(): number {
      if (!this.compositeQuery || !this.currentSubquery)
        return null

      return this.compositeQuery?.subqueryResults.get(this.currentSubquery).matches.length
    }
  },
  async mounted() {
    this.compositeQuery = await CompositeQuery.open('./test_cases/puzzle.json',
        './test_cases/subqueries',
        './test_cases/kruskal1');
  }
})
</script>
