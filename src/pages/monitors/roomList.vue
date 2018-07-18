<template>
  <div class="container">
    <div class="wrap" v-for="(gateway,i1) in farmInfo.gateways" :key="gateway._attributes.Id" @click="toRoomDetail(gateway)">
      <div class="left online" v-if="gateway.details && gateway.details[0] != '设备离线'">
        <img class="imgLeft" src='/static/images/a/room_device_blue.png'>
        <br>{{gateway._attributes.Name}}
      </div>
      <div class="left" v-else>
        <img class="imgLeft" src='/static/images/a/room_device_gray.png'>
        <br>{{gateway._attributes.Name}}
      </div>
      <div class="right">
        <div v-for="(detail,i2) in gateway.details" :key="i2">{{detail}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { getStorage, setStorage } from '@/utils/wechat'
import { syncGatewaysConfig, gatewayDetail, redirectToRoomDetail, detailValueFormat, formatArray } from '@/utils/api'
const GATEWAY_LIST_FOR_LAST_FARM = 'GATEWAY_LIST_FOR_LAST_FARM'
const GATEWAY_CONFIG_PREFIX = 'GC_'
const CURRENT_GATEWAY = 'CURRENT_GATEWAY'
const DETAIL_LIMIT = 4
export default {
  data() {
    return {
      farmInfo: {}
    }
  },
  methods: {
    toRoomDetail(gateway) {
      if (gateway.details[0] != '设备离线') {
        console.log('toRoomDetail', gateway._attributes.Id)
        redirectToRoomDetail(gateway._attributes.Id)
      }
    },
    async getInitData() {
      console.log('getInitData')
      let data = await getStorage(GATEWAY_LIST_FOR_LAST_FARM)
      console.log('getInitData', data)
      wx.setNavigationBarTitle({
        title: data.data.data.farm.name._text
      })
      this.farmInfo = data.data.data
      console.log('getInitData', data)
      syncGatewaysConfig({ gateways: this.farmInfo.gateways })
      for (let gateway of this.farmInfo.gateways) {
        var cache = wx.getStorageSync(GATEWAY_CONFIG_PREFIX + gateway._attributes.Id)
        let gw = await gatewayDetail({ gatewayId: gateway._attributes.Id })
        if (gw.Result.OnLine._text == 'Y') {
          let tmpCount = 0
          gw.Result.SensorDatas.Sensor = formatArray(gw.Result.SensorDatas.Sensor)
          for (let sensor of gw.Result.SensorDatas.Sensor) {
            if (tmpCount >= DETAIL_LIMIT) {
              break
            }
            // if (parseInt(sensor._attributes.Val) > -600) {
            for (let sensorConfig of cache.Sensors.Sensor) {
              if (sensorConfig._attributes.Type == "TEMPERATURE" && sensorConfig._attributes.Id == sensor._attributes.Id) {
                if (!gateway.details) {
                  gateway.details = []
                }
                gateway.details.push(sensorConfig._attributes.Name + ' : ' + detailValueFormat({ config: sensorConfig, item: sensor, catalog: 'sensor' }))
                tmpCount++
                break
              }
            }
            for (let sensorConfig of cache.Sensors.Sensor) {
              if (sensorConfig._attributes.Type == "HUMIDITY" && sensorConfig._attributes.Id == sensor._attributes.Id) {
                if (!gateway.details) {
                  gateway.details = []
                }
                gateway.details.push(sensorConfig._attributes.Name + ' : ' + detailValueFormat({ config: sensorConfig, item: sensor, catalog: 'sensor' }))
                tmpCount++
                break
              }
            }
            // }
          }
        } else {
          gateway.details = []
          gateway.details.push('设备离线')
        }

        let tmpInfo = this.farmInfo
        this.farmInfo = {}
        this.farmInfo = tmpInfo
      }
      console.log('this.farmInfo', this.farmInfo)
    },
  },
  mounted() {
    console.log('roomList mounted')
    this.getInitData()
    wx.showTabBar()
  }
}

</script>
<style scoped>
.imgLeft {
  width: 48px;
  height: 36px;
}

.left {
  align-items: center;
  width: 40%;
  text-align: center;
  float: left;
  padding: 15px 5px;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  font-family: 微软雅黑;
}

.online {
  color: #01a2e9;
}

.right {
  width: 50%;
  float: left;
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 400;
  font-style: normal;
  font-family: 微软雅黑;
  color: rgb(0, 0, 0);
}

.wrap {
  width: 100%;
  border-bottom: 1px solid #bbb;
  display: flex;
  justify-content: center;
  align-items: center;
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

</style>
