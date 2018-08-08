import wx from 'wx'
import Fly from 'flyio'

const request = new Fly()
const DEFAULT_URL = 'https://controller.junciot.com'

request.config.timeout = 10 * 1000
// request.config.baseURL = 'http://wlwhkq.loongk.com:8080' 

request.initConfig = function() {
  let cache = wx.getStorageSync('SERVER_HOST')
  if (cache) {
    request.config.baseURL = cache
  } else {
    request.config.baseURL = DEFAULT_URL
    wx.setStorageSync('SERVER_HOST', DEFAULT_URL)
  }
}

request.initConfig()

request.interceptors.request.use((request) => {
  wx.showLoading({ title: '联网中...' })
  return request
})

request.interceptors.response.use(
  (response, promise) => {
    wx.hideLoading()
    return promise.resolve(response.data)
  },
  (err, promise) => {
    wx.hideLoading()
    wx.showToast({
      title: err.message,
      icon: 'none'
    })
    wx.redirectTo({ url: '/pages/monitors/login' })
    return promise.resolve()
  }
)

export default request
