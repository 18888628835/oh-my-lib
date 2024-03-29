import { defineConfig } from 'dumi';
import nav from './routes/nav';
import componentsMenu from './routes/menu-components';

const repo = 'oh-my-lib';

export default defineConfig({
  title: repo,
  // favicon: `/${repo}/lightbulb.png`,
  // logo: `/${repo}/lightbulb.png`,
  favicon: `/lightbulb.png`,
  logo: `/lightbulb.png`,
  outputPath: 'docs-dist',
  mode: 'site',
  hash: true,
  base: `/${repo}/`,
  publicPath: `/${repo}/`,
  alias: {
    src: '/src',
    components: '/src/components',
  },
  apiParser: {
    propFilter: {
      skipNodeModules: true, // 是否忽略从 node_modules 继承的属性，默认值为 false
      skipPropsWithName: [], // 需要忽略的属性名列表，默认为空数组
      skipPropsWithoutDoc: false, // 是否忽略没有文档说明的属性，默认值为 false
    },
  },
  exportStatic: {},
  navs: nav,
  menus: {
    ...componentsMenu,
  },
  styles: ['https://cdnjs.cloudflare.com/ajax/libs/antd/4.20.7/antd.min.css'],
});
