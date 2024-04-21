import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress';
import MyLayout from './MyLayout.vue';
import './styles/vars.css';
import './styles/custom.css';
import axios from 'axios';
import api from './api/index';
import vitepressNprogress from 'vitepress-plugin-nprogress'
import 'vitepress-plugin-nprogress/lib/css/index.css'
import codeblocksFold from 'vitepress-plugin-codeblocks-fold'; // import method
import 'vitepress-plugin-codeblocks-fold/style/index.scss'; // import style
export default {
  ...DefaultTheme,
  Layout: MyLayout,
  enhanceApp(ctx) {
    // extend default theme custom behaviour.
    DefaultTheme.enhanceApp(ctx);
    vitepressNprogress(ctx)
    // 全局挂载 API 接口
    ctx.app.config.globalProperties.$http = axios
    if (typeof window !== 'undefined') {
        window.$api = api;
    }

    // register your custom global components
    // ctx.app.component('MyGlobalComponent' /* ... */)
  },
  setup() {
    // get frontmatter and route
    const { frontmatter } = useData();
    const route = useRoute();
    // basic use
    codeblocksFold({ route, frontmatter }, true, 400);
  }
}