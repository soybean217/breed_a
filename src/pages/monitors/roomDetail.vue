<template>
  <div class="container">
    <div class="onlineWrap">
      {{chartTitle}}
      <div v-if="online" class="onlineDiv">
        在线&nbsp;
        <img class="onlineIcon" src='/static/images/a/signal_green.png'></div>
      <div v-else>离线</div>
    </div>
    <div class="echarts-wrap">
      <mpvue-echarts :echarts="echarts" :onInit="onInit" canvasId="detail-line" />
    </div>
    <div class="divFull" v-if="status.alarm"><span class="roomWarn">报警：{{status.alarm}}</span></div>
    <div class="baseState">
      <div class="baseStateCell">{{state.state}}</div>
      <div class="baseStateVerticalLine"></div>
      <div class="baseStateCell">{{state.wind}}</div>
      <div class="baseStateVerticalLine"></div>
      <div class="baseStateCell">{{state.dayCount}}</div>
    </div>
    <!-- <div class="addtionParasCss">
      <div class="status" v-for="(para,i2) in addtionParas" :key='i2'>
        {{para.title}}：<span class="colorGreen" v-bind:class="para.style">{{para.description}}</span>
      </div>
    </div> -->
    <div class="monitors">
      <div class="monitor" v-bind:class="{ monitorSelected: detail.isSelected }" v-for="(detail,i1) in details" :key='i1' @click='selectMachine(detail)'>
        <div :class="detail.backgroundStyle">{{detail.name}}</div>
        <!-- <div v-if="detail.icon" :style="'background:url('+detail.icon+');background-size: contain;'" class="imgIcon"> -->
        <div v-if="detail.icon" class="imgIconDiv">
          <img :src='detail.icon' class="imgIcon" />
          <!-- <div class="desc">{{detail.value}}</div> -->
          <span class="smallByIcon">{{detail.value}}</span>
        </div>
        <div v-else class="dataValue" v-bind:class="detail.style">{{detail.value}}</div>
      </div>
    </div>
    <div class="lineWrap"></div>
    <div class="controllersWrap">
      <div class="styleController" v-bind:class="{ monitorSelected: detail.isSelected }" v-for="(detail,i1) in controllerDetails" :key='i1' @click='selectMachine(detail)'>
        <!-- <div v-if="detail.icon" :style="'background:url('+detail.icon+');background-size: contain;'" class="imgIcon"> -->
        <div v-if="detail.icon" class="imgIconDiv">
          <img :src='detail.icon' class="imgIcon" />
          <!-- <div class="desc">{{detail.value}}</div> -->
          <span class="smallByIcon">{{detail.value}}</span>
        </div>
        <div v-else class="dataValue" v-bind:class="detail.style">{{detail.value}}</div>
        <div class="styleControllerTitle">{{detail.name}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import echarts from 'echarts'
import mpvueEcharts from 'mpvue-echarts'
import { gatewayDetail, detailValueFormat, hourData, minData, formatErrMsg, formatArray, formatSensorUnite } from '@/utils/api'
const GATEWAY_CONFIG_PREFIX = 'GC_'
const CURRENT_GATEWAY = 'CURRENT_GATEWAY'
const RECENT_GATEWAYS = 'RECENT_GATEWAYS'
const RECENT_LIMIT = 5

var chart = null;
var option = {}

function initChart(canvas, width, height) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });

  canvas.setChart(chart);

  option = {
    // backgroundColor: '#fff',
    backgroundColor: 'rgba(128, 128, 128, 0)',
    color: ['#37A2DA', '#67E0E3', '#9FE6B8'],
    // tooltip: {
    //   trigger: 'axis'
    // },
    legend: {
      bottom: '10%',
      data: ['温度']
    },
    title: {
      show: false
    },
    grid: {
      top: 20,
      bottom: 40,
      containLabel: true
    },
    animation: false,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      // axisPointer: {
      //   label: {
      //     formatter: function(params) {
      //       console.log('params', params)
      //     }
      //   }
      // },
    },
    yAxis: {
      x: 'center',
      type: 'value'
    },
    series: [{
      name: '温度',
      type: 'line',
      symbolSize: 16,
      smooth: true,
      data: []
    }]
  }

  chart.setOption(option);

  return chart; // 返回 chart 后可以自动绑定触摸操作
}

export default {
  components: {
    mpvueEcharts
  },
  data() {
    return {
      echarts,
      onInit: initChart,
      details: [],
      controllerDetails: [],
      status: {},
      selectedHour: '',
      timeType: 'hour',
      addtionParas: [],
      state: {},
      online: true,
      chartTitle: '小时数据'
    }
  },
  methods: {
    computeColorClass(text) {
      if (text == '异常') {
        return 'colorError'
      } else if (text == '未接入' || text == '未配置' || text == '未录入') {
        return 'colorWarn'
      } else {
        return ''
      }
    },
    titleBackgroundColor(config) {
      switch (config._attributes.Type) {
        case 'TEMPERATURE':
          return 'styleBlue'
        case 'HUMIDITY':
          return 'styleBlue'
        case 'AMMONIA':
          return 'styleBlue'
        case 'BRIGHTENESS':
          return 'styleBlue'
        case 'DRINK':
          return 'styleGreen'
        case 'FORAGE':
          return 'styleGreen'
        case 'AMMETER':
          return 'styleGreen'
        case 'CO2':
          return 'styleBlue'
        case 'ANEMOMETER':
          return 'styleBlue'
        case 'PRESSURE':
          return 'styleBlue'
        case 'AIRFLOW':
          return 'styleBlue'
        default:
          return 'styleRed'
      }
    },
    selectMachine(sensor) {
      if (sensor.catalog == 'sensor') {
        let countSelected = 0
        for (let item of this.details) {
          if (item.isSelected) {
            countSelected++
            if (countSelected >= 3) {
              break;
            }
          }
        }
        if (countSelected != 3) {
          sensor.isSelected = !sensor.isSelected
          this.refreshDetails()
        } else {
          if (sensor.isSelected) {
            sensor.isSelected = !sensor.isSelected
            this.refreshDetails()
          } else {
            wx.showModal({
              title: '提示',
              content: '最多只能选择3个',
              showCancel: false,
              success: function(res) {}
            })
          }
        }
      }
    },
    refreshDetails() {
      let tmpDetails = this.details
      this.details = []
      this.details = tmpDetails
      if (this.timeType == 'hour') {
        this.hourDataMachine()
      } else {
        this.minDataMachine()
      }
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
    },
    procChartData(text) {
      if (text.indexOf('categories\:') != -1) {
        text = text.replace('categories', '\"categories\"')
      }
      if (text.indexOf('data\:') != -1) {
        text = text.replace('data', '"data"')
      }
      text = text.replace('[00,', '[0,')
      for (let i = 1; i <= 9; i++) {
        text = text.replace(',0' + i + ',', ',' + i + ',')
        text = text.replace(',0' + i + ']', ',' + i + ']')
      }
      return JSON.parse(text)
    },
    procMarkLine(sensor, chartData) {
      let markLineOpt = {}
      if (sensor.addPara) {
        markLineOpt = {
          animation: false,
          lineStyle: {
            normal: {
              type: 'dotted'
            }
          },
          data: [
            [{
              coord: [chartData.categories[0], sensor.addPara.oriValue],
              symbol: 'none'
            }, {
              coord: [chartData.categories[chartData.categories.length - 1], sensor.addPara.oriValue],
              symbol: 'none'
            }]
          ]
        };
      }
      return markLineOpt
    },
    async hourDataMachine() {
      option.legend.data = []
      option.series = []
      let needInitial = true
      for (let sensor of this.details) {
        if (sensor.isSelected) {
          // console.log('hourDataMachine sensor', sensor)
          let data = await hourData({ machineId: sensor.config._attributes.Id })
          let chartData = this.procChartData(data.Result.Datas._text)
          option.legend.data.push(sensor.name)
          option.series.push({
            name: sensor.name,
            type: 'line',
            smooth: true,
            data: chartData.data,
            markLine: this.procMarkLine(sensor, chartData)
          })
          if (needInitial) {
            option.xAxis = {
              type: 'category',
              boundaryGap: false,
              data: chartData.categories
            }
            if (chartData.categories.length > 0) {
              let ringArray = []
              for (let ring of chartData.categories) {
                ringArray.push(0)
              }
              option.series.push({
                name: '',
                type: 'line',
                lineStyle: {
                  width: 0
                },
                symbolSize: 16,
                data: ringArray
              })
            }
            needInitial = false
          }
        }
      }
      // option.title = {
      //   left: '50%',
      //   text: '小时数据',
      //   textAlign: 'center',
      //   textStyle: {
      //     fontSize: 16,
      //   }
      // }
      option.title = {
        show: false
      }
      this.chartTitle = '小时数据'
      // console.log('chartData', chartData)
      // option.legend.data = [sensor.name]
      chart.clear()
      chart.setOption(option);
      this.timeType = 'hour'
      chart.off("mousedown");
      let app = this
      chart.on("mousedown", function(params) {
        console.log('mousedown', params)
        app.selectedHour = params.name
        app.minDataMachine()
      });
    },
    async minDataMachine() {
      option.legend.data = []
      option.series = []
      let needInitial = true
      // console.log('this.details', this.details)
      for (let sensor of this.details) {
        if (sensor.isSelected) {
          let data = await minData({ machineId: sensor.config._attributes.Id, hour: this.selectedHour })
          let chartData = this.procChartData(data.Result.Datas._text)
          console.log('chartData', chartData)
          option.legend.data.push(sensor.name)
          option.series.push({
            name: sensor.name,
            type: 'line',
            smooth: true,
            data: chartData.data,
            markLine: this.procMarkLine(sensor, chartData)
          })
          if (needInitial) {
            option.xAxis = {
              type: 'category',
              boundaryGap: false,
              data: chartData.categories
            }
            if (chartData.categories.length > 0) {
              let ringArray = []
              for (let ring of chartData.categories) {
                ringArray.push(0)
              }
              option.series.push({
                name: '',
                type: 'line',
                lineStyle: {
                  width: 0
                },
                symbolSize: 16,
                data: ringArray
              })
            }
            needInitial = false
          }
        }
      }
      // option.title = {
      //   left: '50%',
      //   text: this.selectedHour + '点的分钟数据',
      //   textAlign: 'center',
      //   textStyle: {
      //     fontSize: 16,
      //   }
      // }
      this.chartTitle = this.selectedHour + '点的分钟数据'
      chart.clear()
      chart.setOption(option);
      this.timeType = 'minute'
      chart.off("mousedown");
      let app = this
      chart.on("mousedown", function(params) {
        console.log('mousedown', params)
        app.hourDataMachine()
      });
    },
    procStatuts(gw) {
      this.status = {}
      this.addtionParas = []
      if (gw.Result.Alarm) {
        this.status.alarm = gw.Result.Alarm._text
      }
      this.addtionParas.push({
        title: '日龄',
        description: formatErrMsg(gw.Result.Days._text),
        style: this.computeColorClass(formatErrMsg(gw.Result.Days._text))
      })
      this.addtionParas.push({
        title: '通风',
        description: formatErrMsg(gw.Result.VLevel._text),
        style: this.computeColorClass(formatErrMsg(gw.Result.VLevel._text))
      })
      this.addtionParas.push({
        title: '模式',
        description: this.getRunModeText(gw.Result.RunMode._text),
        style: this.computeColorClass(this.getRunModeText(gw.Result.RunMode._text))
      })
      this.addtionParas.push({
        title: '状态',
        description: gw.Result.OnLine._text == 'Y' ? '在线' : '离线',
        style: gw.Result.OnLine._text != 'Y' ? 'colorError' : ''
      })
      this.state.state = this.getRunModeText(gw.Result.RunMode._text)
      // this.state.wind = '通风：' + formatErrMsg(gw.Result.VLevel._text)
      this.state.wind = '通风：' + (parseInt(gw.Result.VLevel._text) >= 0 ? formatErrMsg(gw.Result.VLevel._text) : '---')
      this.state.dayCount = '天龄：' + formatErrMsg(gw.Result.Days._text)
    },
    async getInitData() {
      let gatewayId = wx.getStorageSync(CURRENT_GATEWAY)
      // console.log('getInitData', gatewayId)
      let cache = wx.getStorageSync(GATEWAY_CONFIG_PREFIX + '' + gatewayId)
      // console.log('gateway config cache', cache)
      wx.setNavigationBarTitle({
        title: cache._attributes.Name
      })
      let gw = await gatewayDetail({ gatewayId: gatewayId })
      // console.log('gw', gw)
      this.procStatuts(gw)
      let details = []
      let addParaDetails = []
      let controllerDetails = []
      let addtionParas = []
      if (gw.Result.SensorDatas.Sensor) {
        gw.Result.SensorDatas.Sensor = formatArray(gw.Result.SensorDatas.Sensor)
        for (let sensor of gw.Result.SensorDatas.Sensor) {
          for (let sensorConfig of cache.Sensors.Sensor) {
            if (sensorConfig._attributes.Id == sensor._attributes.Id) {
              let addParaDetail = false
              if (sensorConfig.Params && sensor.Params) {
                sensorConfig.Params.Param = formatArray(sensorConfig.Params.Param)
                sensor.Params.Param = formatArray(sensor.Params.Param)
                for (let sc of sensorConfig.Params.Param) {
                  for (let s of sensor.Params.Param) {
                    if (sc._attributes.Code == s._attributes.Id) {
                      let tmpText = s._attributes.Val ? s._attributes.Val : '---'
                      tmpText = formatSensorUnite(sensorConfig, tmpText)
                      addtionParas.push({
                        title: sc._attributes.Name,
                        description: tmpText,
                        style: this.computeColorClass(tmpText),
                        code: sc._attributes.Code
                      })
                      addParaDetail = {
                        isSelected: false,
                        catalog: 'addtionPara',
                        'name': sc._attributes.Name,
                        config: sensorConfig,
                        'value': tmpText,
                        oriValue: s._attributes.Val,
                        style: this.computeColorClass(tmpText),
                        backgroundStyle: 'dataTitle stylePurple'
                      }
                      addParaDetails.push(addParaDetail)
                      break;
                    }
                  }
                }
              }
              let tmpText = detailValueFormat({ config: sensorConfig, item: sensor, catalog: 'sensor' })
              details.push({
                isSelected: false,
                catalog: 'sensor',
                'name': sensorConfig._attributes.Name,
                config: sensorConfig,
                'value': tmpText,
                style: this.computeColorClass(tmpText),
                backgroundStyle: 'dataTitle ' + this.titleBackgroundColor(sensorConfig),
                addPara: addParaDetail,
              })
              break
            }
          }
        }
      }
      if (gw.Result.ControllerDatas.Controller) {
        gw.Result.ControllerDatas.Controller = formatArray(gw.Result.ControllerDatas.Controller)
        for (var item of gw.Result.ControllerDatas.Controller) {
          for (let config of cache.Controllers.Controller) {
            if (config._attributes.Id == item._attributes.Id) {
              controllerDetails.push({
                isSelected: false,
                catalog: 'controller',
                'name': config._attributes.Name,
                config: config,
                'value': detailValueFormat({ config: config, item: item, catalog: 'controller' }),
                'icon': this.getControlIcon({ config: config, item: item, catalog: 'controller' }),
              })
              break
            }
          }
        }
      }
      addtionParas.sort(function(a, b) {
        return a.code - b.code
      })
      this.addtionParas = this.addtionParas.concat(addtionParas)
      this.details = this.sortDetails(details)
      this.controllerDetails = this.sortDetails(controllerDetails)
      // this.details = this.details.concat(addParaDetails)
      this.procAddParaToDetails(addParaDetails)
      if (Array.isArray(this.details) && this.details.length > 0) {
        this.selectMachine(this.details[0])
      }
      // let tmpAddtionParas = this.addtionParas
      // this.addtionParas = []
      // this.addtionParas = tmpAddtionParas
      this.procRecentRoom(gatewayId)
    },
    procAddParaToDetails(addParaDetails) {
      for (let i = 0; i < this.details.length; i++) {
        for (let addPara of addParaDetails) {
          if (this.details[i].config._attributes.Name == addPara.config._attributes.Name) {
            this.details.splice(i + 1, 0, addPara)
            i++
          }
        }
      }
    },
    async procRecentRoom(lastId) {
      let recentGateways = await wx.getStorageSync(RECENT_GATEWAYS)
      if (recentGateways) {
        // clear current gateway id 
        for (let i = 0; i < recentGateways.data.gateways.length; i++) {
          let gateway = recentGateways.data.gateways[i]
          if (gateway._attributes.Id == lastId) {
            recentGateways.data.gateways.splice(i, 1)
            break;
          }
        }
        recentGateways.data.gateways.unshift({ _attributes: { Id: lastId } })
        if (recentGateways.data.gateways.length > RECENT_LIMIT) {
          recentGateways.data.gateways.splice(RECENT_LIMIT, recentGateways.data.gateways.length - RECENT_LIMIT)
        }
      } else {
        recentGateways = {
          data: { gateways: [{ _attributes: { Id: lastId } }] }
        }
      }
      wx.setStorageSync(RECENT_GATEWAYS, recentGateways)
    },
    sortDetails(oriDetails) {
      let result = []
      let sortTypes = ['TEMPERATURE', 'HUMIDITY', 'CO2', 'AMMONIA', 'PRESSURE', 'ANEMOMETER', 'AIRFLOW', 'BRIGHTENESS', 'DRINK', 'AMMETER', 'FORAGE', 'EGG', 'DIE', 'PNUMBER', 'EAT', 'IVFAN', 'FREQUENCY', 'FAN', 'WCURTAIN', 'CURTAIN', 'LIGHT', 'HEAT', 'SPRAYER', 'FDFUNNEL', 'FEED', 'SCRAPER']
      for (let type of sortTypes) {
        let tmpArr = []
        for (let detail of oriDetails) {
          if (detail.config._attributes.Type == type) {
            tmpArr.push(detail)
          }
        }
        tmpArr.sort(function(a, b) {
          return a.name.localeCompare(b.name)
        })
        result = result.concat(tmpArr)
      }
      if (result.length != oriDetails.length) {
        console.log('error sortDetails is not match', result, oriDetails)
      }
      return result
    },
    getControlIcon({ config = {}, item = {} } = {}) {
      let dictory = '/static/images/breed/a/'
      // if (item._attributes.Degree.length > 0 && item._attributes.Degree != '0') {
      //   return false
      // } else {
      switch (item._attributes.Val) {
        case '0':
          return dictory + config._attributes.Type.toLowerCase() + '_forwardoff.png'
        case '1':
          return dictory + config._attributes.Type.toLowerCase() + '_forwardinhandon.png'
        case '2':
          return dictory + config._attributes.Type.toLowerCase() + '_forwardinhandon.png'
        case '3':
          return dictory + config._attributes.Type.toLowerCase() + '_forwarderror.png'
        default:
          return false
      }
      // }
    },
    getRunModeText(mode) {
      switch (mode) {
        case "1":
          return "智能模式"
        case "2":
          return "受控模式"
        case "10":
          return "最小通风"
        case "11":
          return "横向通风"
        case "12":
          return "过渡通风"
        case "13":
          return "隧道通风"
        case "99":
          return "空舍模式"
        default:
          return "未定义"
      }
    },
  },
  onShow() {
    console.log('onShow')
    this.timeType = 'hour'
  },
  onUnload() {
    console.log('onUnload')
  },
  mounted() {
    this.getInitData()
  }
}

</script>
<style scoped>
.divFull {
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}


.monitor {
  float: left;
  width: 186rpx;
  height: 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
  /*
  background-color: #DBDBDB;
  */
  background-color: #fff;
  border-bottom: 1rpx solid #f2f4f5;
  border-right: 1rpx solid #f2f4f5;
}

.addtionParasCss {
  width: 620rpx;
}

.status {
  font-size: 30rpx;
  padding: 2rpx 10rpx 2rpx 0;
  float: left;
  width: 300rpx;
  border-bottom: 1rpx solid #bbb;
}

.monitorSelected {
  background-color: #99FFFF;
}

.imgIcon {
  width: 45px;
  height: 45px;
}

.imgIconDiv {
  width: 100%;
  height: 45px;
  float: left;
}

.imgIconDiv .desc {
  /*
  position: relative;
  top: -20px;
  */
  float: left;
  box-sizing: border-box;
  color: rgb(172, 29, 16);
  max-width: 100%;
  width: 15px;
  height: 40px;
  overflow-wrap: break-word;
  text-shadow: 2px 2px 10px rgb(0, 112, 192);
  font-size: 12px;
  float: right;
  right: 10%;
  z-index: 10;
}

.smallByIcon {
  font-size: 12px;
  text-shadow: 2px 2px 10px rgb(0, 112, 192);
}

.monitors {
  width: 100%;
  padding-top: 8px;
  text-align: center;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.link {
  width: 50%;
  text-align: center;
  padding: 10px 0;
}

.echarts-wrap {
  width: 750rpx;
  height: 375rpx;
  background-color: #f2f4f5;
}

.dataTitle {
  font-size: 10px;
  font-weight: 400;
  font-style: normal;
  font-family: Arial;
  color: rgb(255, 255, 255);
  width: 80%;
  padding: 2px 0;
  height: 14px;
  text-align: center;
  border-radius: 6px;
}

.styleControllerTitle {
  font-size: 10px;
  font-weight: 400;
  font-style: normal;
  font-family: 微软雅黑;
  color: rgb(102, 102, 102);
}

.styleBlue {
  background-color: #00a2e9;
}

.styleGreen {
  background-color: #009933;
}

.styleRed {
  background-color: #ff3300;
}

.stylePurple {
  background-color: #ff00ff;
}

.container {
  display: flex;
  /*
  flex-direction: column;
  */
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  background-color: #f2f4f5;
}

.dataValue {
  padding-top: 10px;
  font-size: 16px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  font-family: Arial;
  color: rgb(0, 0, 0);
}

.colorGreen {
  font-weight: bold;
  color: #6E8B3D;
}

.colorWarn {
  color: #EF8200
}

.colorError {
  color: red
}

.onlineIcon {
  padding: 0 2px;
  width: 20px;
  height: 20px;
}

.onlineDiv {
  float: right;
  padding: 2px 0;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  font-family: 微软雅黑;
  color: #00cc00;
  display: flex;
  justify-content: center;
  align-items: center;
}

.onlineWrap {
  padding: 4px 0;
  font-size: 14px;
  width: 100%;
  text-align: center;
  background-color: #f2f4f5;
}

.baseState {
  width: 95%;
  height: 30px;
  border-radius: 30px;
  background-color: #828383;
}

.baseStateCell {
  width: 33%;
  height: 30px;
  margin-top: 5px;
  float: left;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  font-style: normal;
  font-family: 微软雅黑;
  color: rgb(247, 247, 247);
}

.baseStateVerticalLine {
  width: 1rpx;
  height: 30px;
  float: left;
  background-color: #aeb0af;
}

.lineWrap {
  width: 100%;
  height: 20px;
  background-color: #f2f4f5;
  border-bottom: 1px solid #bbb;
}

.styleController {
  width: 150rpx;
  float: left;
  height: 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

</style>
