<template>
  <div class="container">
    <div class="indexTitleUser">
      用户：{{username}}
      <div class="userLogo"><i class="iconfont icon-yyyonghu2 iconStyleLogo"></i></div>
    </div>
    <div class="indexTitleStat">栏舍健康信息统计 </div>
    <div class="wrapEcharts">
      <div class="mainChart1">
        <div class="chartArea">健康情况分布</div>
        <mpvue-echarts :echarts="echarts" :onInit="onInit" canvasId="index-pie" />
      </div>
      <div class="mainChart2">
        <div class="statList"><span style="color:#53bd53">&#9635;</span> 正常：{{normalRoomCount}} 间</div>
        <div class="statList" @click='goWarnRoomList'><span style="color:#f6d101">&#9635;</span> 报警：{{alarmRoomCount}} 间</div>
        <div class="statList"><span style="color:#e53036">&#9635;</span> 离线：{{offlineRoomCount}} 间</div>
      </div>
      <div class="mainChart3">
        <div class="bigFont">{{totalRoomCount}}</div>
        <div class="circleBlue"></div>
        <div class='normalFont'> &nbsp;栏舍合计</div>
        <div class="bigFont">{{normalRate}}</div>
        <div class="squareGreen">&#10004;</div>
        <div class='normalFont'> &nbsp;正常比例</div>
      </div>
    </div>
    <div class="indexTitleStat" style="height:10px;width:100%"></div>
    <div class="column_box" @click="goWarnMsgList('1')">
      <div class="column_img"><img src="/static/images/alarm.png"></div>
      <div class="columnTitle">昨日警报</div>
      <div class="columnRightDetailWarn">{{remindCount['1']}}</div>
    </div>
    <div class="border_bottom"></div>
    <div class="column_box" @click="goWarnMsgList('2')">
      <div class="column_img"><img src="/static/images/calendar.png"></div>
      <div class="columnTitle">日常事务</div>
      <div class="columnRightDetailNormal">{{remindCount['2']}}</div>
    </div>
    <div class="border_bottom"></div>
    <div class="column_box" @click="goWarnMsgList('3')">
      <div class="column_img"><img src="/static/images/device.png"></div>
      <div class="columnTitle">设备到期</div>
      <div class="columnRightDetailNormal">{{remindCount['3']}}</div>
    </div>
    <div class="border_bottom"></div>
    <div class="column_box" @click="goWarnMsgList('4')">
      <div class="column_img"><img src="/static/images/switch.png"></div>
      <div class="columnTitle">参数修改</div>
      <div class="columnRightDetailNormal">{{remindCount['4']}}</div>
    </div>
    <!-- <div class="divB1"> -->
    <!--
    <div @click="goWarnMsgList('1')" class="exception">昨日警报
      <br><span class="boldNumber">{{remindCount['1']}}</span></div>
    <div @click="goWarnMsgList('2')" class="exception">日常事务
      <br><span class="boldNumber">{{remindCount['2']}}</span></div>
    <div @click="goWarnMsgList('3')" class="exception">设备到期
      <br><span class="boldNumber">{{remindCount['3']}}</span></div>
    <div @click="goWarnMsgList('4')" class="exception">参数修改
      <br><span class="boldNumber">{{remindCount['4']}}</span></div>
    -->
    <!-- </div> -->
  </div>
</template>
<script>
import echarts from 'echarts'
import mpvueEcharts from 'mpvue-echarts'
import { getAlarmInfo, getRemindInfo, formatArray } from '@/utils/api'
const WARN_GATEWAY_LIST = 'WARN_GATEWAY_LIST'
const LAST_SUCCESS_LOGIN_INPUT = 'LAST_SUCCESS_LOGIN_INPUT'

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
    color: ['#f2f4f5', '#e62c33', '#52be52', '#f7d200', '#67E0E3', '#91F2DE', '#FFDB5C', '#FF9F7F'],
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
      center: ['50%', '45%'],
      radius: ['50%', '70%'],
      data: [{
        value: 3,
        name: '正常',
      }, {
        value: 1,
        name: '异常',
      }],
      // itemStyle: {
      //   emphasis: {
      //     shadowBlur: 10,
      //     shadowOffsetX: 0,
      //     shadowColor: 'rgba(0, 2, 2, 0.3)'
      //   }
      // }
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
      normalRate: 0,
      offlineRoomCount: 0,
      alarmRoomCount: 0,
      totalRoomCount: 0,
      username: '',
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
      if (this.alarmRoomCount > 0) {
        wx.navigateTo({
          url: '/pages/monitors/warnRoomList'
        })
      }
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
      let cache = wx.getStorageSync(LAST_SUCCESS_LOGIN_INPUT)
      this.username = cache.userName
      this.normalNumber = Number(data.Result.Alarm._attributes.rate.replace('%', '')).toFixed(0)
      this.offlineRoomCount = parseInt(data.Result.Alarm._attributes.offlineAmt)
      this.alarmRoomCount = parseInt(data.Result.Alarm._attributes.alarmAmt)
      this.totalRoomCount = parseInt(data.Result.Alarm._attributes.shackAmt)
      this.normalRoomCount = this.totalRoomCount - this.offlineRoomCount - this.alarmRoomCount
      this.normalRate = Number(100 * this.normalRoomCount / parseInt(data.Result.Alarm._attributes.shackAmt)).toFixed(0) + '%'
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
          console.log('WARN_GATEWAY_LIST', {
            data: { gateways: data.Result.Alarm.Id }
          })
        }
      }
      // if (this.normalNumber > 0) {
      option.series[0].data = [{
        value: 0,
        name: '',
      }, {
        value: this.offlineRoomCount,
        name: '',
      }, {
        value: this.normalRoomCount,
        name: '',
      }, {
        value: this.alarmRoomCount,
        name: '',
      }]
      option.series[0].hoverAnimation = false
      option.series[0].z = 1
      // option.series[0].legendHoverLink = false
      option.series.push({
        data: [{ value: 100 }],
        radius: ['0%', '50%'],
        type: "pie",
        center: ['50%', '45%'],
        label: {
          show: false,
          normal: {
            fontSize: 14
          }
        },
        labelLine: {
          show: false
        },
        hoverAnimation: false,
        z: 10,
      })
      // option.series[1] = 
      option.title = {
        text: this.normalRate,
        // subtext: 'From ExcelHome',
        // sublink: 'http://e.weibo.com/1341556070/AhQXtjbqh',
        x: 'center',
        y: '38%',
        itemGap: 20,
        textStyle: {
          color: '#53bc53',
          fontFamily: '微软雅黑',
          fontSize: 14,
          fontWeight: 'bolder'
        },
        z: 20,
      }
      option.legend = {
        show: false
      }
      option.grid = {
        top: 0,
      }
      chartPie.clear()
      chartPie.setOption(option);

      chartPie.off("mousedown")
      chartPie.off("click")
      /*
      chartPie.on("mousedown", function(params) {
        console.log('mousedown', params)
        if (params.name.startsWith("异常")) {
          wx.navigateTo({
            url: '/pages/monitors/warnRoomList'
          })
        }
      });
      */
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
  padding: 15px 28px;
  display: flex;
  /*
  flex-direction: column;
  */
  align-items: center;
  justify-content: space-between;
  font-size: 28px;
  box-sizing: border-box;
  border-radius: 0px;
  background-color: rgb(0, 162, 233);
}

.normalFont {
  float: left;
  font-size: 11px;
}

.mainChart1 {
  float: left;
  width: 49%;
  height: 200px;
}

.mainChart2 {
  font-size: 14px;
  float: left;
  width: 27%;
}

.mainChart3 {
  float: left;
  width: 23%;
  border-left: 1px solid #dfdfe0;
  padding-left: 20rpx;
  padding-bottom: 14px;
}

.bigFont {
  clear: both;
  white-space: nowrap;
  text-align: left;
  font-size: 28px;
  font-weight: 700;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(0, 0, 0);
  padding-top: 15px;
  padding-bottom: 4px;
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

.circleBlue {
  float: left;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #007aff;
}

.squareGreen {
  float: left;
  width: 16px;
  height: 16px;
  background-color: #53bd53;
  color: white;
  padding-left: 4px;
  padding-bottom: 2px;
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
  background-color: #f2f4f5;
}

.statList {
  padding-top: 12px;
}

.echarts-wrap {
  width: 100%;
  height: 200px;
}



.columnRightDetailWarn {
  padding-right: 30px;
  white-space: nowrap;
  text-align: left;
  font-size: 18px;
  font-weight: 700;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(255, 0, 51);
}

.userLogo {
  float: right;
  width: 59px;
  height: 59px;
  border-style: solid;
  border-color: rgb(255, 255, 255);
  border-width: 2px;
  background-color: rgb(215, 215, 215);
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  /*
  flex-direction: column;
  */
  align-items: center;
  justify-content: center;
}

.iconStyleLogo {
  font-size: 45px;
}

.chartArea {
  padding-top: 14px;
  padding-left: 14px;
  font-size: 11px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(102, 102, 102);
}

</style>
