<template>
  <div class="container">
    <!-- <div class="wrap">
      <div class="stat">合格率(%)
        <br>0</div>
      <div class="stat">总次数
        <br>4</div>
      <div class="stat">总时长
        <br>21：20</div>
    </div> -->
    <div class="wrap" v-for="(i,i1) in remindInfo" :key="i" @click='redirectToRoomDetail(i.basic_gateway_id._text)'>
      <div>
        <span class="fontBig">{{i.gatewayName._text}}</span> <span class="fontTime">{{i.contentInfo.alarmTime}}{{i.contentInfo.editTime}}</span> </div>
      <div class="divRoom">
        <span class="fontRoom"></span>
        <div v-for="(item,i2) in i.displayContents" :key="item" class="fontMsg">{{item}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { getRemindInfo, redirectToRoomDetail, getWarnTypeNameById } from '@/utils/api'
export default {
  data() {
    return {
      remindInfo: [],
    }
  },
  methods: {
    redirectToRoomDetail(gatewayId) {
      redirectToRoomDetail(gatewayId)
    },
    async getInitData() {
      wx.setNavigationBarTitle({
        title: getWarnTypeNameById(this.$root.$mp.query.type)
      })
      let remindInfo = await getRemindInfo()
      if (!Array.isArray(remindInfo.Result.Reminds.Remind)) {
        let tmpInfo = remindInfo.Result.Reminds.Remind
        remindInfo.Result.Reminds.Remind = []
        remindInfo.Result.Reminds.Remind.push(tmpInfo)
      }
      let tmpReminds = []
      for (let info of remindInfo.Result.Reminds.Remind) {
        if (info.remind_type._text == this.$root.$mp.query.type) {
          info.content._cdata = info.content._cdata.replace(new RegExp("'", "gm"), '"')
          if (Array.isArray(info.content._cdata)) {
            info.contentInfo = {}
            info.contentInfo.alarmMsg = info.content._cdata.join()
          } else {
            info.contentInfo = JSON.parse(info.content._cdata)
          }
          this.typeName(info)
          tmpReminds.push(info)
        }
      }
      this.remindInfo = tmpReminds
      console.log('tmpReminds', tmpReminds)
    },
    typeName(info) {
      switch (info.remind_type._text) {
        case '1':
          info.displayContents = []
          info.displayContents.push(info.contentInfo.alarmMsg)
          info.typeName = '栏舍警报'
          break
        case '2':
          info.displayContents = info.contentInfo.remindMsg.split(/<br\/>/)
          info.typeName = '日常事务'
          break
        case '3':
          info.displayContents = []
          info.displayContents.push('设备名称：' + info.contentInfo.machineName)
          info.displayContents.push('到期时间：' + info.contentInfo.expiredTime)
          return '设备到期'
          break
        case '4':
          info.displayContents = info.contentInfo.editContent.split(/<br\/>/)
          info.typeName = '参数修改'
          break
        default:
          return '未定义'
      }
    }
  },
  mounted() {
    console.log('this.$root.$mp.query', this.$root.$mp.query)
    this.getInitData()
  }
}

</script>
<style scoped>
.stat {
  align-items: center;
  width: 30%;
  text-align: center;
  float: left;
  padding: 15px 0;
}

.wrap {
  width: 100%;
  padding: 20px;
  border-bottom: 1px solid #bebebe;
}

.divRoom {
  width: 100%;
  padding: 10px;
}

.fontBig {
  padding: 10px;
  font-size: 24px;
  font-weight: bold;
}

.fontRoom {
  padding: 10px;
  font-size: 20px;
}

.fontMsg {
  font-size: 16px;
}

.fontTime {
  font-size: 12px;
}

</style>
