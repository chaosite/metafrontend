<template>
  <v-app>
    <v-app-bar>
        <v-btn @click.stop="drawer = !drawer">Query</v-btn>
    </v-app-bar>
    <v-main>
      <splitpanes class="default-theme" :class="{drawer}" @resize="drawerSize = $event[0].size">
        <pane :size="drawer ? drawerSize : 0">
          <QueryGraph @select="focusOnSubquery"
          :masterQuery="compositeQuery?.masterQuery"></QueryGraph>
          <SubqueryGraph :dotJson="getSubquery(currentSubquery)" ref="subqueryGraph"></SubqueryGraph>
        </pane>
        <pane :size="100 - (drawer ? drawerSize : 0)">
          <graph-view ref="program" :graph="graph"/>
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
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';

  import ResultGraph from './ResultGraph.vue';
  import QueryGraph from './QueryGraph.vue';
  import SubqueryGraph from './SubqueryGraph.vue';
  import { CompositeQuery } from '../queries';

  import GraphView from './graph-view.vue';
  import GraphvizSvg from './graphviz-svg.vue';


  export default {
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
        currentSubquery: null,
        compositeQuery: null,
        graph: null
      };
    },
    methods: {
      focusOnSubquery({id, node}) {
        this.currentSubquery = id;
      },
      getSubquery(id) {
        return this.compositeQuery?.subqueries.get(id);
      }
    },
    async mounted() {
      this.compositeQuery = await CompositeQuery.open('./test_cases/puzzle.json',
                                                      './test_cases/subqueries');
    }
  }
</script>
