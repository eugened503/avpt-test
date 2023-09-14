import { createApp } from 'vue'
import App from './App.vue'
import YmapPlugin from 'vue-yandex-maps'

const app = createApp(App)

app.use(YmapPlugin, {
  apiKey: '0b98c44a-82f3-4bcc-a19f-5d354de77405',
  lang: 'ru_RU',
  coordorder: 'latlong',
  version: '2.1'
})

app.mount('#app')
