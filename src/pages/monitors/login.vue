<template>
  <div class="container">
    <div class="title"><img src="/static/images/a/logo.png" /></div>
    <div class="title">温氏环控小管家</div>
    <input type="text" class="formControl" v-model="username" placeholder="用户名" />
    <input type="password" class="formControl" v-model="password" placeholder="密码" />
    <div class="empty"></div>
    <span @click="login" class="bigBtn">登录</span>
    <br>
    <div class="modifyLink">
      <!-- <a href='/pages/monitors/serverEdit'>修改服务器地址</a> -->
    </div>
  </div>
</template>
<script>
import { getStorage, setStorage } from '@/utils/wechat'
import { userLogin } from '@/utils/api'
const LAST_SPLASH_DATA = 'LAST_SPLASH_DATA'
const LAST_SUCCESS_LOGIN_INPUT = 'LAST_SUCCESS_LOGIN_INPUT'
const LAST_SUCCESS_LOGIN_TICKET = 'LAST_SUCCESS_LOGIN_TICKET'



export default {
  data() {
    return {
      username: '',
      password: '',
    }
  },

  methods: {
    async getCache() {
      try {
        let res = await getStorage(LAST_SPLASH_DATA)
        const { movies, expires } = res.data
        // 有缓存，判断是否过期
        if (movies && expires > Date.now()) {
          return res.data
        }
        // 已经过期
        console.log('uncached')
        return null
      } catch (error) {
        return null
      }
    },

    handleStart() {
      // TODO: 访问历史的问题
      wx.switchTab({
        url: '../board/main'
      })
    },

    async getInitData() {
      let ticketCache = await getStorage(LAST_SUCCESS_LOGIN_TICKET)
      console.log('getInitData', ticketCache)

    },
    async login() {
      // let data = await userLogin({ userName: this.username, password:this.password, count: 3 })
      var app = this
      let data = await userLogin({ userName: app.username, password: app.password })
      // let data = await userLogin()
      if (data.Result.ReturnFlag._text == '0' && data.Result.ReturnMsg._text == "success") {
        wx.reLaunch({
          url: '/pages/index'
        })
      }
    }
  },

  mounted() {
    let cache = wx.getStorageSync(LAST_SUCCESS_LOGIN_INPUT)
    if (cache) {
      this.username = cache.userName
      this.password = cache.password
    } else {
      this.username = ''
      this.password = ''
    }
  }
}

</script>
<style scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  box-sizing: border-box;
}

.form-container {
  width: 80%;
}

.empty {
  height: 24px;
  width: 100%;
}

.title {
  padding-bottom: 24px;
  width: 100%;
  white-space: nowrap;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(38, 49, 54);
}

.title img {
  width: 100px;
  height: 100px;
}

.modifyLink {
  width: 80%;
  padding-top: 40rpx;
  text-align: right;
  font-size: 14px;
}

</style>
