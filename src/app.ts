import fs from 'fs';
import { Graph } from 'graphlib';
import dot from 'graphlib-dot';

import * as Vue from 'vue';
import * as Vuetify from 'vuetify';
import * as VuetifyComponents from 'vuetify/lib/components/index.mjs';
import * as VuetifyDirectives from 'vuetify/lib/directives/index.mjs';
import { VuetifyOptions } from 'vuetify/framework';
//@ts-ignore
import AppComponent from './components/app.vue';


class App {
    vue: Vue.Component & AppProps

    constructor() {
        const app = Vue.createApp(AppComponent);
        const vuetify = Vuetify.createVuetify(
            {
                VuetifyComponents,
                VuetifyDirectives,
                theme: { defaultTheme: 'light' } /* sorry, default graphviz render is not compatible with dark theme */
            } as VuetifyOptions);
    
        app.use(vuetify);
    
        this.vue = withProps<AppProps>()(app.mount(document.body));
    }

    openMaster(dotFilename: string) {
        let masterDot = fs.readFileSync(dotFilename, 'utf-8'),
            master = dot.read(masterDot);
        master.dot = masterDot;
        this.vue.graph = master;
    }
}


interface AppProps {
    graph: Graph
}


function withProps<T>() {
    return <U>(u: U) => u as U & T;
}


export { App }