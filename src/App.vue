<script>
export default {
  created() {
    // 调用API从本地缓存中获取数据
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    console.log('app created and cache logs by setStorageSync')
  }
}

</script>
<style>
@import './iconfont/iconfont.css';
.container {
  /*
  height: 100vh;
  */
  display: flex;
  align-items: center;
  /*
  background-color: #f8f9fb;
  justify-content: space-between;
*/
  padding: 10rpx 0;
  box-sizing: border-box;
  flex-wrap: wrap;
}

body {}

.bigBtn {
  width: 75%;
  display: inline-block;
  margin: 10px auto;
  padding: 15px 15px;
  text-align: center;
  font-size: 16px;
  color: #fff;
  background-color: #0ca3e9;
  border: 1px solid #0ca3e9;
  border-radius: 15rpx;
}

.smallBtn {
  display: inline-block;
  margin: 10px auto;
  padding: 5px 10px;
  color: black;
  border: 1px solid #000;
  border-radius: 25rpx;
  box-shadow: 2px 2px 5px #000;
}

.formControl {
  display: block;
  width: 80%;
  padding: 5px 12px;
  padding-left: 0;
  padding-bottom: 10px;
  margin-bottom: 5px;
  border-bottom: 1px solid #ccc;
  border-radius: 5rpx;
}


.roomWarn {
  background: red;
  animation: myblink 3s;
  animation-iteration-count: infinite;
}

@keyframes myblink {
  0% {
    background: red;
  }
  50% {
    background: yellow;
  }
  100% {
    background: red;
  }
}

.border_bottom {
  clear: both;
  background-color: #dfdfe0;
  height: 1px;
  width: 95%;
  bottom: 0;
}

.column_img img {
  width: 18px;
  height: 18px;
}

.column_box {
  width: 100%;
  height: 46px;
  font-size: 14px;
  line-height: 46px;
  background-color: #fff;
  padding-left: 4%;
  padding-right: 4%;
  position: relative;
  display: flex;
  align-items: center;
}

.column_img {
  float: left;
  margin-top: 10px;
  margin-right: 15px;
}

.columnTitle {
  float: left;
  width: 75%;
}


.columnRightDetailNormal {
  padding-right: 30px;
  white-space: nowrap;
  text-align: left;
  font-size: 18px;
  font-weight: 700;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: #666666;
}

</style>
