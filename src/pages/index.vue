<template>
  <div class="container">
    <div class="indexTitleUser">用户：XXX </div>
    <div class="indexTitleStat">栏舍健康信息统计 </div>
    <div class="wrapEcharts">
      <div class="mainChart1">
        <mpvue-echarts :echarts="echarts" :onInit="onInit" canvasId="index-pie" />
      </div>
      <div class="mainChart2">正常：{{normalRoomCount}} 间
        <br/>报警：{{alarmRoomCount}} 间
        <br/>离线：{{offlineRoomCount}} 间
        <br/>
      </div>
      <div class="mainChart3">3</div>
    </div>
    <div class="echarts-wrap">
    </div>
    <div class="divFull" v-if='alartCount' @click='goWarnRoomList'>
      <span class="roomWarn">报警栏舍数量：{{alartCount}}</span>
    </div>
    <!-- <div class="divB1"> -->
    <div @click="goWarnMsgList('1')" class="exception">昨日警报
      <br><span class="boldNumber">{{remindCount['1']}}</span></div>
    <div @click="goWarnMsgList('2')" class="exception">日常事务
      <br><span class="boldNumber">{{remindCount['2']}}</span></div>
    <div @click="goWarnMsgList('3')" class="exception">设备到期
      <br><span class="boldNumber">{{remindCount['3']}}</span></div>
    <div @click="goWarnMsgList('4')" class="exception">参数修改
      <br><span class="boldNumber">{{remindCount['4']}}</span></div>
    <!-- </div> -->
  </div>
</template>
<script>
import echarts from 'echarts'
import mpvueEcharts from 'mpvue-echarts'
import { getAlarmInfo, getRemindInfo, formatArray } from '@/utils/api'
const WARN_GATEWAY_LIST = 'WARN_GATEWAY_LIST'

var chartPie = null;
var option = {}

function initChart(canvas, width, height) {
  chartPie = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chartPie);
  // chartPie.on("mousedown", function(params) {
  //   console.log('mousedown', params)
  //   if (params.name == "异常栏舍") {
  //     wx.navigateTo({
  //       url: '/pages/monitors/warnRoomList'
  //     })
  //   }
  // });

  option = {
    backgroundColor: '#84c1ff',
    color: ['#e62c33', '#52be52', '#f7d200', '#67E0E3', '#91F2DE', '#FFDB5C', '#FF9F7F'],
    series: [{
      label: {
        show: false,
        normal: {
          fontSize: 14
        }
      },
      labelLine: {
        show: false
      },
      type: 'pie',
      center: ['50%', '50%'],
      radius: ['40%', '60%'],
      data: [{
        value: 3,
        name: '正常',
      }, {
        value: 1,
        name: '异常',
      }],
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 2, 2, 0.3)'
        }
      }
    }]
  }

  // chartPie.setOption(option);

  return chartPie; // 返回 chartPie 后可以自动绑定触摸操作
}


export default {
  components: {
    mpvueEcharts
  },
  data() {
    return {
      echarts,
      onInit: initChart,
      remindCount: { "1": 0, "2": 0, "3": 0, "4": 0 },
      normalNumber: 0,
      alartCount: 0,
      needReload: false,
      normalRoomCount: 0,
      offlineRoomCount: 0,
      alarmRoomCount: 0,
    }
  },
  methods: {
    goWarnMsgList(id) {
      if (this.remindCount[id] > 0) {
        wx.navigateTo({
          url: '/pages/monitors/warnList?type=' + id
        })
      }
    },
    goWarnRoomList() {
      wx.navigateTo({
        url: '/pages/monitors/warnRoomList'
      })
    },
    async getInitData() {
      let remindInfo = await getRemindInfo()
      for (let tmp in this.remindCount) {
        this.remindCount[tmp] = 0
      }
      if (!Array.isArray(remindInfo.Result.Reminds.Remind)) {
        let tmpInfo = remindInfo.Result.Reminds.Remind
        remindInfo.Result.Reminds.Remind = []
        remindInfo.Result.Reminds.Remind.push(tmpInfo)
      }
      for (let info of remindInfo.Result.Reminds.Remind) {
        if (this.remindCount[info.remind_type._text]) {
          this.remindCount[info.remind_type._text]++
        } else {
          this.remindCount[info.remind_type._text] = 1
        }
      }
      this.alartCount = 0
      let data = await getAlarmInfo()
      this.normalNumber = Number(data.Result.Alarm._attributes.rate.replace('%', '')).toFixed(0)
      this.offlineRoomCount = parseInt(data.Result.Alarm._attributes.offlineAmt)
      this.alarmRoomCount = parseInt(data.Result.Alarm._attributes.alarmAmt)
      this.normalRoomCount = parseInt(data.Result.Alarm._attributes.shackAmt) - this.offlineRoomCount - this.alarmRoomCount
      if (data.Result.Alarm.Id) {
        data.Result.Alarm.Id = formatArray(data.Result.Alarm.Id)
        this.alartCount = data.Result.Alarm.Id.length
        if (Array.isArray(data.Result.Alarm.Id)) {
          for (let gateway of data.Result.Alarm.Id) {
            gateway._attributes = {}
            gateway._attributes.Id = gateway._text
          }
          wx.setStorageSync(WARN_GATEWAY_LIST, {
            data: { gateways: data.Result.Alarm.Id }
          })
        }
      }
      // if (this.normalNumber > 0) {
      option.series[0].data = [{
        value: this.alarmRoomCount,
        name: '',
      }, {
        value: this.normalRoomCount,
        name: '',
      }, {
        value: this.offlineRoomCount,
        name: '',
      }]
      option.title = {
        text: Number(100 * this.normalRoomCount / parseInt(data.Result.Alarm._attributes.shackAmt)).toFixed(0) + '%',
        // subtext: 'From ExcelHome',
        // sublink: 'http://e.weibo.com/1341556070/AhQXtjbqh',
        x: 'center',
        y: 'center',
        itemGap: 20,
        textStyle: {
          color: '#53bc53',
          fontFamily: '微软雅黑',
          fontSize: 14,
          fontWeight: 'bolder'
        }
      }
      // option.graghic = {
      //   type: 'text',
      //   left: 'center',
      //   right: 'center',
      //   z: 2,
      //   zlevel: 100,
      //   style: {
      //     text: '100%',
      //     x: 100,
      //     y: 100,
      //     textAlign: 'center',
      //     fill: '#fff',
      //     width: 30,
      //     height: 30,
      //   }
      // }
      // } else {
      //   option.series[0].data = [{
      //     value: 100,
      //     name: '正常100%',
      //   }]
      // }
      chartPie.clear()
      chartPie.setOption(option);
      chartPie.off("mousedown")
      chartPie.on("mousedown", function(params) {
        console.log('mousedown', params)
        if (params.name.startsWith("异常")) {
          wx.navigateTo({
            url: '/pages/monitors/warnRoomList'
          })
        }
      });
      // this.drawChart()
    },
  },
  mounted() {
    // console.log('mounted')
    this.getInitData()
    this.needReload = true
  },
  onShow() {
    console.log('onShow')
    if (this.needReload) {
      this.getInitData()
    }

    // chartPie.on("mousedown", function(params) {
    //   console.log('mousedown', params)
    //   if (params.name == "异常栏舍") {
    //     wx.navigateTo({
    //       url: '/pages/monitors/warnRoomList'
    //     })
    //   }
    // });
    // chartPie.setOption(option);
  }
}

</script>
<style scoped>
.divFull {
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 5px;
}

.indexTitleUser {
  left: 0px;
  top: 0px;
  width: 100%;
  color: white;
  padding: 28px;
  font-size: 28px;
  box-sizing: border-box;
  border-radius: 0px;
  background-color: rgb(0, 162, 233);
}

.mainChart1 {
  float: left;
  width: 39%;
  height: 200px;
}

.mainChart2 {
  font-size: 14px;
  float: left;
  width: 30%;
}

.mainChart3 {
  float: left;
  width: 30%;
}

.wrapEcharts {
  width: 100%;
  height: 160px;
  white-space: nowrap;
  text-align: left;
  font-size: 11px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(102, 102, 102);
  display: flex;
  align-items: center;
  background-color: #f2f4f5;
}

.indexTitleStat {
  left: 0px;
  top: 0px;
  width: 100%;
  color: black;
  padding: 12px;
  font-size: 12px;
  box-sizing: border-box;
  border-radius: 0px;
  background-color: #f2f4f5;
  white-space: nowrap;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
}

.divB1 {
  width: 90%;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.exception {
  width: 360rpx;
  float: left;
  text-align: center;
  padding: 20px 0;
  /*
  background-color: #DBDBDB;
  */
  font-weight: bold;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 25rpx;
}

.boldNumber {
  color: #6E8B3D;
  font-size: 30px;
  font-weight: bold;
}

.container {
  height: 100%;
  display: flex;
  /*
  flex-direction: column;
  */
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding-top: 0;
}

.echarts-wrap {
  width: 100%;
  height: 200px;
}

</style>
