<template>
  <v-app>
    <v-app-bar></v-app-bar>
    <v-navigation-drawer :width="512" v-model="drawer" temporary>
      <QueryGraph @select="focusOnSubquery"
      :masterQuery="compositeQuery?.masterQuery"></QueryGraph>
      <SubqueryGraph :dotJson="getSubquery(currentSubquery)" ref="subqueryGraph"></SubqueryGraph>
    </v-navigation-drawer>
    <v-main>
      <v-card height="600px">
        <v-btn @click.stop="drawer = !drawer">Query</v-btn>
        <ResultGraph></ResultGraph>
      </v-card>
    </v-main>
  </v-app>
</template>

<script lang="ts">
  import ResultGraph from './ResultGraph.vue';
  import QueryGraph from './QueryGraph.vue';
  import SubqueryGraph from './SubqueryGraph.vue';
  import { CompositeQuery } from '../queries';


  export default {
    components: {
      ResultGraph,
      QueryGraph,
      SubqueryGraph,
    },
    data() {
      return {
        drawer: true,
        currentSubquery: null,
        compositeQuery: null,
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
