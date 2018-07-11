<template>
  <div class="container">
    <div class="profileArea">
      <div class="lineArea" @click='goLogin'>
        <div class='lineLeft'>重新登录</div>
        <div class='lineRight'>></div>
      </div>
      <div class="lineArea" @click='goServerEdit'>
        <div class='lineLeft'>设置服务器</div>
        <div class='lineRight'>></div>
      </div>
      <div class="lineArea" @click='logout'>
        <div class='lineLeft'>注销</div>
        <div class='lineRight'>></div>
      </div>
    </div>
    <!-- <a class="bigBtn" href="login">
      重新登录
    </a>
    <a class="bigBtn" href="serverEdit">
      设置服务器
    </a>
    <span class="bigBtn" @click='logout'>
      注销
    </span> -->
  </div>
</template>
<script>
const LAST_SUCCESS_LOGIN_INPUT = 'LAST_SUCCESS_LOGIN_INPUT'
const LAST_SUCCESS_LOGIN_TICKET = 'LAST_SUCCESS_LOGIN_TICKET'
export default {
  data() {
    return {}
  },
  methods: {
    goLogin() {
      wx.navigateTo({ url: '/pages/monitors/login' })
    },
    goServerEdit() {
      wx.navigateTo({ url: '/pages/monitors/serverEdit' })
    },
    logout() {
      wx.showModal({
        title: '是否注销',
        success: function(res) {
          if (res.confirm) {
            wx.setStorageSync(LAST_SUCCESS_LOGIN_INPUT, false)
            wx.setStorageSync(LAST_SUCCESS_LOGIN_TICKET, false)
            wx.redirectTo({ url: '/pages/monitors/login' })
          }
        }
      })
    },
  },
  mounted() {}
}

</script>
<style scoped>
.lineLeft {
  float: left
}

.lineRight {
  float: right
}

.lineArea {
  background-color: #fff;
  padding: 20px 20px 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #bbb;
}

.profileArea {
  width: 100%;
}

body {
  background-color: #f8f9fb;
  display: flex;
  align-items: center;
  justify-content: center;
}


.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
}

</style>
