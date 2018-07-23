import Vue from 'vue'
import App from './App'
// import './iconfont/iconfont.css'

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue(App)
app.$mount()

export default {
  config: {
    // 页面前带有 ^ 符号的，会被编译成首页，其他页面可以选填，我们会自动把 webpack entry 里面的入口页面加进去
    pages: ['^pages/index'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#01a2e9',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'white',
      backgroundColor: '#fff'
    },
    tabBar: {
      color: '#666666',
      selectedColor: '#000000',
      borderStyle: 'black',
      backgroundColor: '#ededed',
      list: [{
          text: '首页',
          pagePath: 'pages/index',
          iconPath: 'static/images/home.png',
          selectedIconPath: 'static/images/home-actived.png'
        },
        {
          text: '监控',
          pagePath: 'pages/monitors/farmList',
          iconPath: 'static/images/board.png',
          selectedIconPath: 'static/images/board-actived.png'
        },
        {
          text: '设置',
          pagePath: 'pages/monitors/profile',
          iconPath: 'static/images/config.png',
          selectedIconPath: 'static/images/config_blue.png'
        }
      ]
    }
  }
}
