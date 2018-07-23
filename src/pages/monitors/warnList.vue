<template>
  <div class="container">
    <div class="searchWrap">
      <div class="search-top">
        <img class="imgSearch" src="/static/images/a/search_black.png">
        <input v-model="searchContent" type="text" placeholder="请输入栏舍名称" />
      </div>
    </div>
    <div class="wrap" v-for="(i,i1) in remindInfo" :key="i" @click='redirectToRoomDetail(i.basic_gateway_id._text)'>
      <div class='warnContent'>
        <div>
          <span class="fontBig">{{i.gatewayName._text}}</span>
          <span class="fontTime">{{i.contentInfo.alarmTime}}{{i.contentInfo.editTime}}</span>
        </div>
        <div class="lineGray"></div>
        <div class="divRoom">
          <span class="fontRoom"><img class="imgWarn" src="/static/images/a/warn_yellow.png"></span>
          <div class="divMsg">
            <div v-for="(item,i2) in i.displayContents" :key="item" class="fontMsg">{{item}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getRemindInfo, redirectToRoomDetail, getWarnTypeNameById } from '@/utils/api'
var remindInfo = {}
export default {
  data() {
    return {
      remindInfo: [],
      searchContent: '',
    }
  },
  // computed: {
  //   // 计算属性的 getter
  //   remindInfo: function() {
  //     let tmpReminds = []
  //     for (let info of remindInfo.Result.Reminds.Remind) {
  //       console.log('info', info)
  //       if (info.remind_type._text == this.$root.$mp.query.type) {
  //         info.content._cdata = info.content._cdata.replace(new RegExp("'", "gm"), '"')
  //         if (Array.isArray(info.content._cdata)) {
  //           info.contentInfo = {}
  //           info.contentInfo.alarmMsg = info.content._cdata.join()
  //         } else {
  //           info.contentInfo = JSON.parse(info.content._cdata)
  //         }
  //         this.typeName(info)
  //         tmpReminds.push(info)
  //       }
  //     }
  //     return tmpReminds
  //   }
  // },
  watch: {
    searchContent: function(newContent, oldContent) {
      let tmpReminds = []
      for (let info of remindInfo.Result.Reminds.Remind) {
        if (info.gatewayName._text.indexOf(newContent) >= 0) {
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
      }
      this.remindInfo = tmpReminds
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
      remindInfo = await getRemindInfo()
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
      // console.log('tmpReminds', tmpReminds)
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
  },
  onShow() {
    console.log('onShow')
    this.searchContent = ''
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
  padding-top: 20px;
  border-bottom: 1px solid #bebebe;
  background-color: #f2f4f5;
}

.lineGray {
  height: 1px;
  width: 100%;
  background-color: #e1e1e1;
  margin-top: 10px;
}

.warnContent {
  background-color: #fff;
  padding: 10px;
}

.divRoom {
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fontBig {
  /*
  padding: 10px;
  font-size: 24px;
  font-weight: bold;
  */
  white-space: nowrap;
  text-align: left;
  font-size: 16px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(0, 0, 0);
}

.imgWarn {
  width: 51px;
  height: 51px;
}

.imgSearch {
  float: left;
  width: 22px;
  height: 22px;
  padding-top: 3px;
}


.fontRoom {
  float: left;
  height: 51px;
}

.fontMsg {
  width: 100%;
  clear: both;

  /*
  height: 51px;
  white-space: nowrap;
  */
  font-size: 14px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: left;
}

.divMsg {
  width: 67%;
  float: left;

  /*
  height: 51px;
  white-space: nowrap;
    display: flex;
  align-items: center;
  justify-content: left;
  */
}

.fontTime {
  float: right;
  white-space: nowrap;
  text-align: left;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(102, 102, 102);
  padding-top: 10px;
}

.search-top {
  float: left;
  padding-top: 4px;
  padding-left: 14px;
  height: 30px;
  width: 80%;
  border-radius: 30px;
  background-color: #fff;
}

.search-top input {
  width: 60%;
  float: left;
  height: 14px;
  line-height: 14px;
  background-color: #fff;
  text-align: left;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  font-family: 微软雅黑;
  color: rgb(153, 153, 153);
  background-color: rgb(255, 255, 255);
  padding-left: 28px;
}

.container {
  padding: 0;
}

.searchWrap {
  width: 100%;
  background-color: #01a2e9;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
}

</style>
