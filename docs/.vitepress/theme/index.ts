import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import './styles/index.css'

// 不做全局组件注册：M3 组件都在各自的 .vue 里显式 import —— 依赖关系可见，
// 也不会把组件及其依赖拖进「每个页面都会加载」的主题 chunk。
// M3Card / M3Chip / M3Section / M3Stat 目前全仓库无人使用，文件保留作组件库镜像；
// 未被 import 的文件不会进入任何 bundle，需要时直接 import 即可。
// BlogList 同样不在此注册：它由 Layout.vue 的 layout: blog 分支渲染。
export default {
  Layout,
} satisfies Theme
