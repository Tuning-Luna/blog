import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import M3Button from './components/M3Button.vue'
import M3Card from './components/M3Card.vue'
import M3Chip from './components/M3Chip.vue'
import M3Icon from './components/M3Icon.vue'
import M3IconButton from './components/M3IconButton.vue'
import M3Section from './components/M3Section.vue'
import M3Stat from './components/M3Stat.vue'
import './styles/index.css'

// M3 组件全局注册，Markdown 里可直接使用 <M3Chip /> 等。
export default {
  Layout,
  enhanceApp({ app }) {
    app.component('M3Button', M3Button)
    app.component('M3Card', M3Card)
    app.component('M3Chip', M3Chip)
    app.component('M3Icon', M3Icon)
    app.component('M3IconButton', M3IconButton)
    app.component('M3Section', M3Section)
    app.component('M3Stat', M3Stat)
  },
} satisfies Theme
