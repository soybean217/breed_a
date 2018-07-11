<template>
  <div class="container">
    <div class="modifyServer">
      请输入服务器地址
    </div>
    <input type="text" class="formControl" v-model="serverHost" placeholder="服务器地址" />
    <span @click="modifyServer" class="bigBtn">确定</span>
  </div>
</template>
<script>
import { getStorage, setStorage } from '@/utils/wechat'
import { userLogin } from '@/utils/api'
import request from '@/utils/request'
const LAST_SPLASH_DATA = 'LAST_SPLASH_DATA'
const LAST_SUCCESS_LOGIN_INPUT = 'LAST_SUCCESS_LOGIN_INPUT'
const LAST_SUCCESS_LOGIN_TICKET = 'LAST_SUCCESS_LOGIN_TICKET'



export default {
  data() {
    return {
      serverHost: wx.getStorageSync('SERVER_HOST'),
    }
  },

  methods: {
    modifyServer() {
      wx.setStorageSync('SERVER_HOST', this.serverHost)
      request.initConfig()
      wx.showModal({
        title: '服务器地址',
        content: '已修改',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.redirectTo({ url: '/pages/monitors/login' })
          }
        }
      })
    }
  },

  mounted() {}
}

</script>
<style scoped>
.container {
  background-color: #f2f4f5;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  box-sizing: border-box;
}

.modifyServer {
  width: 256px;
  padding-bottom: 20px;
  text-align: left;
  font-size: 14px;
}

.formControl {
  width: 256px;
  border: 1px solid #ccc;
  margin-bottom: 30px;
}

.bigBtn {
  width: 40%;
}

</style>
