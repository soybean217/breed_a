<template>
  <div class="container">
    <div class="farmMenu">
      <div class="farmMenuNormal" @click='goRecent'>最近访问</div>
      <div class="farmMenuActive">全部</div>
    </div>
    <div class="list" v-for="(f0,i0)  in parentLeave" :key='f0.id._text'>
      <div @click='chooseFarm(f0)' class="level_1">
        {{f0.name._text}}
      </div>
      <div v-if="f0.childShow" class="list1" v-for="(f1,i1) in childMapList[f0.id._text] " :key='f1.id._text'>
        <div @click='chooseFarm(f1)' class="level_2">
          {{f1.name._text}}
          <div class="arrow"><i class="iconfont icon-jiantouxia"></i></div>
        </div>
        <div v-if="f1.childShow" class="list1" v-for="f2 in childMapList[f1.id._text] " :key='f2.id._text'>
          <div @click='chooseFarm(f2)'><span v-if="f2.hasChild">
            <span v-if="f2.childShow">-</span><span v-else>+</span></span>
            &nbsp;&nbsp;{{f2.name._text}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getStorage, setStorage } from '@/utils/wechat'
import { userLogin, farmList, gatewayList } from '@/utils/api'
const LAST_SPLASH_DATA = 'LAST_SPLASH_DATA'
const GATEWAY_LIST_FOR_LAST_FARM = 'GATEWAY_LIST_FOR_LAST_FARM'

const DEFAULT_CHILD_SHOW = true

export default {
  data() {
    return {
      farmData: {},
      parentLeave: [],
      childMapList: {},
    }
  },

  methods: {
    async chooseFarm(farm) {
      if (farm.hasChild) {
        farm.childShow = !farm.childShow
        let tmp = this.farmData
        this.farmData = []
        this.farmData = tmp
      } else {
        console.log('farmId', farm.id._text)
        let data = await gatewayList({ farmId: farm.id._text })
        console.log('data', data)
        if (data.Result.ReturnFlag._text == '0' && data.Result.ReturnMsg._text == "success") {
          if (data.Result.Gateways.Gateway) {
            if (!Array.isArray(data.Result.Gateways.Gateway)) {
              let tmpArray = []
              tmpArray.push(data.Result.Gateways.Gateway)
              data.Result.Gateways.Gateway = tmpArray
            }
            await setStorage(GATEWAY_LIST_FOR_LAST_FARM, {
              data: { gateways: data.Result.Gateways.Gateway, farm: farm }
            })
            console.log('saved')
            wx.navigateTo({
              url: '/pages/monitors/roomList'
            })
          }
        }
      }
    },
    async getCache() {
      try {
        let res = await getStorage(LAST_SPLASH_DATA)
        const { movies, expires } = res.data
        // 有缓存，判断是否过期
        if (movies && expires > Date.now()) {
          return res.data
        }
        // 已经过期
        console.log('uncached')
        return null
      } catch (error) {
        return null
      }
    },

    handleStart() {
      // TODO: 访问历史的问题
      wx.switchTab({
        url: '../board/main'
      })
    },
    goRecent() {
      wx.navigateTo({
        url: '/pages/monitors/recentRoomList'
      })
    },
    async getInitData() {
      // let data = await userLogin({})
      let data = await farmList()
      console.log('data', data)
      this.farmData = data
      this.procLeaveMark()
      this.initParent()
    },
    procLeaveMark() {
      this.childMapList = {}
      for (let i of this.farmData.Result.Farms.Farm) {
        let hasChild = false
        for (let j of this.farmData.Result.Farms.Farm) {
          if (i.id._text == j.parentId._text) {
            if (!hasChild) {
              hasChild = true
            }
            if (!this.childMapList[i.id._text]) {
              this.childMapList[i.id._text] = []
            }
            this.childMapList[i.id._text].push(j)
          }
        }
        i.hasChild = hasChild
      }
    },
    initParent() {
      this.parentLeave = []
      for (let farm of this.farmData.Result.Farms.Farm) {
        if (farm.parentId._text == '-100') {
          farm.childShow = DEFAULT_CHILD_SHOW
          this.parentLeave.push(farm)
        }
      }
      console.log('initParent', this.farmData.Result.Farms.Farm)
    },
  },

  mounted() {
    this.getInitData()
  }
}

</script>
<style scoped>
body {
  background-color: #f8f9fb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.farmMenu {
  width: 100%;
  background-color: #f2f4f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.farmMenuNormal {
  float: left;
  padding: 12px;
  width: 49%;
  text-align: center;
  color: rgb(153, 153, 153);
  border-bottom: 3px solid rgb(153, 153, 153);
}

.farmMenuActive {
  float: left;
  width: 49%;
  padding: 12px;
  text-align: center;
  color: rgb(0, 162, 233);
  border-bottom: 3px solid rgb(0, 162, 233);
}

.symbol {
  font-size: 60rpx;
  font-weight: bold;
  color: green;
}

.list {
  width: 100%;
  font-size: 40rpx;
  padding: 0;
  background-color: #fff;
  border: 5rpx solid #f8f9fb;
  border-radius: 25rpx;
}

.list1 {
  width: 100%;
  padding-left: 14px;
  padding-top: 15rpx;
  padding-bottom: 10rpx;
  background-color: #fff;
  font-size: 14px;
  color: rgb(153, 153, 153);
}

.level_1 {
  width: 100%;
  padding: 4px 6px;
  font-size: 16px;
  font-weight: 700;
  font-style: normal;
  font-family: 微软雅黑;
  color: rgb(51, 51, 51);
}

.level_2 {
  width: 100%;
  padding: 10px 0;
  border-bottom: 1rpx solid #cccccc;
}

.arrow {
  float: right;
  padding-right: 40px;
  font-size: 16px;
}

</style>
