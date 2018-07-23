<template>
  <div class="container">
    <div class="wrap" v-for="(gateway,i1) in farmInfo.gateways" :key="gateway._attributes.Id" @click="toRoomDetail(gateway)">
      <div class="left online" v-if="gateway.details && gateway.details[0] != '设备离线'">
        <img class="imgLeft" src='/static/images/a/room_device_red.png'>
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
import { syncGatewaysConfig, gatewayDetail, redirectToRoomDetail, detailValueFormat } from '@/utils/api'
const WARN_GATEWAY_LIST = 'WARN_GATEWAY_LIST'
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
      redirectToRoomDetail(gateway._attributes.Id)
    },
    async getInitData() {
      let data = await getStorage(WARN_GATEWAY_LIST)
      console.log('WARN_GATEWAY_LIST', data)
      this.farmInfo = data.data.data
      syncGatewaysConfig({ gateways: this.farmInfo.gateways })
      for (let gateway of this.farmInfo.gateways) {
        var cache = wx.getStorageSync(GATEWAY_CONFIG_PREFIX + gateway._attributes.Id)
        gateway._attributes.Name = cache._attributes.Name
        let gw = await gatewayDetail({ gatewayId: gateway._attributes.Id })
        if (gw.Result.OnLine._text == 'Y') {
          let tmpCount = 0
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
  color: red;
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
  border-bottom: 10px solid #f2f4f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background-color: #fff;
}

.container {
  display: block;
  height: 100vh;
  /*
  flex-direction: column;
  */
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background-color: #f2f4f5;
}

</style>
