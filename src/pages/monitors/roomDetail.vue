<template>
  <div class="container">
    <div class="echarts-wrap">
      <mpvue-echarts :echarts="echarts" :onInit="onInit" canvasId="detail-line" />
    </div>
    <div class="divFull" v-if="status.alarm"><span class="roomWarn">报警：{{status.alarm}}</span></div>
    <div class="addtionParasCss">
      <div class="status" v-for="(para,i2) in addtionParas" :key='i2'>
        {{para.title}}：<span class="colorGreen" v-bind:class="para.style">{{para.description}}</span>
      </div>
    </div>
    <div class="monitors">
      <div class="monitor" v-bind:class="{ monitorSelected: detail.isSelected }" v-for="(detail,i1) in details" :key='i1' @click='selectMachine(detail)'>
        <div class="dataTitle">{{detail.name}}</div>
        <!-- <div v-if="detail.icon" :style="'background:url('+detail.icon+');background-size: contain;'" class="imgIcon"> -->
        <div v-if="detail.icon" class="imgIconDiv">
          <img :src='detail.icon' class="imgIcon" />
          <!-- <div class="desc">{{detail.value}}</div> -->
          <span class="smallByIcon">{{detail.value}}</span>
        </div>
        <div v-else class="dataValue" v-bind:class="detail.style">{{detail.value}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import echarts from 'echarts'
import mpvueEcharts from 'mpvue-echarts'
import { gatewayDetail, detailValueFormat, hourData, minData, formatErrMsg, formatArray } from '@/utils/api'
const GATEWAY_CONFIG_PREFIX = 'GC_'
const CURRENT_GATEWAY = 'CURRENT_GATEWAY'

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
    grid: {
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
      status: {},
      selectedHour: '',
      timeType: 'hour',
      addtionParas: []
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
            data: chartData.data
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
      option.title = {
        left: '50%',
        text: '小时数据',
        textAlign: 'center',
        textStyle: {
          fontSize: 16,
        }
      }
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
          option.legend.data.push(sensor.name)
          option.series.push({
            name: sensor.name,
            type: 'line',
            smooth: true,
            data: chartData.data
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
      // console.log('chartData', chartData)
      // option.legend.data = [sensor.name]
      option.title = {
        left: '50%',
        text: this.selectedHour + '点的分钟数据',
        textAlign: 'center',
        textStyle: {
          fontSize: 16,
        }
      }
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
    },
    async getInitData() {
      let gatewayId = wx.getStorageSync(CURRENT_GATEWAY)
      // console.log('getInitData', gatewayId)
      let cache = wx.getStorageSync(GATEWAY_CONFIG_PREFIX + '' + gatewayId)
      console.log('gateway config cache', cache)
      wx.setNavigationBarTitle({
        title: cache._attributes.Name
      })
      let gw = await gatewayDetail({ gatewayId: gatewayId })
      console.log('gw', gw)
      this.procStatuts(gw)
      let details = []
      let addtionParas = []
      if (gw.Result.SensorDatas.Sensor) {
        gw.Result.SensorDatas.Sensor = formatArray(gw.Result.SensorDatas.Sensor)
        for (let sensor of gw.Result.SensorDatas.Sensor) {
          for (let sensorConfig of cache.Sensors.Sensor) {
            if (sensorConfig._attributes.Id == sensor._attributes.Id) {
              let tmpText = detailValueFormat({ config: sensorConfig, item: sensor, catalog: 'sensor' })
              details.push({
                isSelected: false,
                catalog: 'sensor',
                'name': sensorConfig._attributes.Name,
                config: sensorConfig,
                'value': tmpText,
                style: this.computeColorClass(tmpText)
              })
              if (sensorConfig.Params && sensor.Params) {
                sensorConfig.Params.Param = formatArray(sensorConfig.Params.Param)
                sensor.Params.Param = formatArray(sensor.Params.Param)
                for (let sc of sensorConfig.Params.Param) {
                  for (let s of sensor.Params.Param) {
                    if (sc._attributes.Code == s._attributes.Id) {
                      let tmpText = s._attributes.Val ? s._attributes.Val : '---'
                      addtionParas.push({
                        title: sc._attributes.Name,
                        description: tmpText,
                        style: this.computeColorClass(tmpText),
                        code: sc._attributes.Code
                      })
                      break;
                    }
                  }
                }
              }
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
              details.push({
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
      if (Array.isArray(this.details) && this.details.length > 0) {
        this.selectMachine(this.details[0])
      }
      // let tmpAddtionParas = this.addtionParas
      // this.addtionParas = []
      // this.addtionParas = tmpAddtionParas
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
      let dictory = '/static/images/breed/'
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
    console.log('roomDetail mounted', getCurrentPages())
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
  border-bottom: 1px solid #bbb;
}


.monitor {
  float: left;
  width: 24%;
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
  border: 1px solid #f8f9fb;
  border-radius: 25rpx;
  box-shadow: 2px 2px 5px #000;
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
  width: 40px;
  height: 40px;
}

.imgIconDiv {
  width: 100%;
  height: 40px;
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
}

.link {
  width: 50%;
  text-align: center;
  padding: 10px 0;
}

.echarts-wrap {
  width: 100%;
  height: 300px;
}

.dataTitle {
  font-size: 14px;
  width: 100%;
  text-align: center;
}

.container {
  display: flex;
  /*
  flex-direction: column;
  */
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.dataValue {
  font-weight: bold;
  font-size: 16px;
  color: #6E8B3D;
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

</style>
