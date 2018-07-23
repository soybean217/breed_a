<template>
  <div class="container">
    <!-- <div class="profileArea">
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
    </div> -->
    <div class="column_box" @click='goLogin'>
      <div class="column_img"><img src="/static/images/a/refresh.png"></div>
      <div class="columnTitle">重新登录</div>
      <div class="columnRightDetailNormal"><i class="iconfont icon-jiantouyou"></i></div>
    </div>
    <!-- <div class="border_bottom"></div>
    <div class="column_box" @click='goServerEdit'>
      <div class="column_img"><img src="/static/images/a/server.png"></div>
      <div class="columnTitle">设置服务器</div>
      <div class="columnRightDetailNormal"><img class="arrowImg" src="/static/images/a/arrow_right.png"></div>
    </div> -->
    <div class="border_bottom"></div>
    <div class="column_box" @click='logout'>
      <div class="column_img"><img src="/static/images/a/logout.png"></div>
      <div class="columnTitle">注销</div>
      <div class="columnRightDetailNormal"><i class="iconfont icon-jiantouyou"></i></div>
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
  height: 100vh;
  display: block;
  /*
  
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  */
  padding: 20rpx 0;
  box-sizing: border-box;
  background-color: #f2f3f5;
}


.arrowImg {
  padding-top: 3px;
  width: 24px;
  height: 24px;
}

.column_box {
  padding-left: 20px;
}

</style>
