import { defineConfig } from 'dumi';
import componentsMenu from './menus/components';
import docsMenu from './menus/docs';

const repo = 'oh-my-lib';
const navs = [
  { title: 'Blog', path: '/docs' },
  { title: '组件库', path: '/components' },
  {
    title: 'GitHub',
    path: 'https://github.com/18888628835',
  },
];

export default defineConfig({
  title: repo,
  favicon: `/${repo}/lightbulb.png`,
  logo: `/${repo}/lightbulb.png`,
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
      // 是否忽略从 node_modules 继承的属性，默认值为 false
      skipNodeModules: true,
      // 需要忽略的属性名列表，默认为空数组
      skipPropsWithName: [],
      // 是否忽略没有文档说明的属性，默认值为 false
      skipPropsWithoutDoc: false,
    },
  },
  exportStatic: {},
  navs,
  menus: {
    ...componentsMenu,
    ...docsMenu,
  },
});
