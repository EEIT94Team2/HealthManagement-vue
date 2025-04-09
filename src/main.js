// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import '@/assets/styles/index.scss';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"


axios.defaults.baseURL = 'http://localhost:8080'; // 將此處替換為你的後端 API URL

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(ElementPlus);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');