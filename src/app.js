import "babel-polyfill";
import Vue from "vue";
import {
  spinalCore
} from "spinal-core-connectorjs_type";
import VueMaterial from "vue-material";
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default-dark.css"; // This line here

import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/regular.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
Vue.use(VueMaterial);

import VTooltip from 'v-tooltip'
Vue.use(VTooltip)

import App from "./js/App.vue";

new Vue({
  el: "#app",
  render: h => h(App)
});
