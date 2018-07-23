import request from './request'
import md5 from 'js-md5'
import { getStorage, setStorage } from '@/utils/wechat'
var convert = require('xml-js');
const LAST_SUCCESS_LOGIN_INPUT = 'LAST_SUCCESS_LOGIN_INPUT'
const LAST_SUCCESS_LOGIN_TICKET = 'LAST_SUCCESS_LOGIN_TICKET'
const GATEWAY_CONFIG_PREFIX = 'GC_'
const CURRENT_GATEWAY = 'CURRENT_GATEWAY'

export function userLogin({ userName = '', password = '' } = {}) {
  return login({ userName: userName, password: password })
}
export async function farmList() {
  // var formData = new FormData();
  // formData.append('account',userName)
  // formData.append('Password',md5(password))
  let data = await getFarmList()
  checkResponse(data)
  return data
}
export async function gatewayList({ farmId = '' } = {}) {
  // var formData = new FormData();
  // formData.append('account',userName)
  // formData.append('Password',md5(password))
  let data = await getGatewayList(arguments[0])
  checkResponse(data)
  return data
}
export function getWarnTypeNameById(typeId) {
  switch (typeId) {
    case '1':
      return '栏舍警报'
    case '2':
      return '日常事务'
    case '3':
      return '设备到期'
    case '4':
      return '参数修改'
    default:
      return '未定义'
  }
}
export function formatArray(target) {
  if (Array.isArray(target)) {
    return target
  } else {
    let result = []
    result.push(target)
    return result
  }
}

export async function hourData({ machineId = '' } = {}) {
  let ticket = getLastSuccessTicket()
  let params = {}
  params.ticket = ticket.data.ticket
  params.machineid = machineId
  let result = await (request.post(`/langrh/mobile/mobile!hourline.action`, json2Form(params)))
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  checkResponse(data)
  return data
}
export async function minData({ machineId = '', hour = '' } = {}) {
  let ticket = getLastSuccessTicket()
  let params = {}
  params.ticket = ticket.data.ticket
  params.machineid = machineId
  let cDate = new Date()
  params.searchhour = cDate.getFullYear() + '-' + fillZeroForMinute(cDate.getMonth() + 1) + '-' + fillZeroForMinute(cDate.getDate()) + ' ' + fillZeroForMinute(hour)
  // console.log('json2Form(params)', json2Form(params))
  let result = await (request.post(`/langrh/mobile/mobile!minutesline.action`, json2Form(params)))
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  checkResponse(data)
  return data
}

function fillZeroForMinute(input) {
  if (input.toString().length == 1) {
    return '0' + input
  } else {
    return input
  }
}
export async function getAlarmInfo() {
  let ticket = getLastSuccessTicket()
  let params = {}
  params.paramStr = JSON.stringify({ ticket: ticket.data.ticket })
  let result = await request.post(`/langrh/mobile/mobileGateway!getAlarmRate.action`, json2Form(params))
  console.log('getAlarmInfo', result)
  // result = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Result><ReturnFlag>0</ReturnFlag><ReturnMsg>success</ReturnMsg><Alarm shackAmt='47' alarmAmt='0' offlineAmt='24' rate='0.0%' offlineRate='48.93617%'></Alarm></Result>"
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  console.log('getAlarmInfo', data)
  let check = checkResponse(data)
  return data
}
export async function getRemindInfo() {
  let ticket = getLastSuccessTicket()
  let params = {}
  params.paramStr = JSON.stringify({ ticket: ticket.data.ticket })
  let result = await request.post(`/langrh/mobile/mobileGateway!loadAllYestRemind.action`, json2Form(params))
  // result = result.replace(/<br\s*[\/]?>/gi, "")
  // console.log('getRemindInfo', result)
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  console.log('getRemindInfo', data)
  checkResponse(data)
  return data
}
// export async function gatewayConfig({ gatewayId = '' } = {}) {
//   let data = await getGatewayConfig(arguments[0])
//   let check = checkResponse(data)
//   if (check == 1) {
//     return data
//   } else if (check == 2) {
//     console.log('ticket overdue')
//     let r = await loginWithCache()
//   }
// }
export async function gatewayDetail({ gatewayId = '' } = {}) {
  let data = await getGatewayDetail(arguments[0])
  let check = checkResponse(data)
  return data
}
export async function syncGatewaysConfig({ gateways = [] } = {}) {
  console.log('syncGatewaysConfig', gateways)
  for (var gateway of gateways) {
    cacheGatewayConfig({ gateway: gateway })
  }
}
export function redirectToRoomDetail(gatewayId) {
  wx.setStorageSync(CURRENT_GATEWAY, gatewayId)
  // wx.redirectTo({
  //   url: '/pages/monitors/roomDetail'
  // })
  wx.navigateTo({
    url: '/pages/monitors/roomDetail'
  })
}
export async function checkLoginStatus() {

}
export function detailValueFormat({ config = {}, item = {}, catalog = '' } = {}) {
  switch (catalog) {
    case 'controller':
      return _formatController({ config: config, item: item })
      break
    case 'sensor':
      return _formatSensor({ config: config, item: item })
      break
    default:
      return item._attributes.Val
  }
  return item._attributes.Val
}
export function formatErrMsg(val) {
  val = parseInt(val)
  if (val <= -600) {
    return _matchErrMsg(val)
  } else {
    return val
  }
}

function _matchErrMsg(val) {
  switch (val) {
    case -999:
      return '未接入'
    case -998:
      return '未配置'
    case -888:
      return '未录入'
    default:
      return '异常'
  }
}

export function formatSensorUnite(config = {}, val) {
  return _formatSensorUnite(config, val)
}

function _formatSensorUnite(config = {}, val) {
  switch (config._attributes.Type) {
    case 'TEMPERATURE':
      return val + ' ℃'
    case 'HUMIDITY':
      return val + ' %'
    case 'AMMONIA':
      return val + ' ppm'
    case 'BRIGHTENESS':
      return val + ' lx'
    case 'DRINK':
      return val + ' kg'
    case 'FORAGE':
      return val + ' kg'
    case 'AMMETER':
      return val + ' kw.h'
    case 'CO2':
      return val + ' ppm'
    case 'ANEMOMETER':
      return val + ' m/s'
    case 'PRESSURE':
      return val + ' pa'
    case 'AIRFLOW':
      return val + ' m3/h'
    default:
      return val
  }
}

function _formatSensor({ config = {}, item = {} } = {}) {
  let val = parseInt(item._attributes.Val)
  if (val <= -600) {
    return _matchErrMsg(val)
  } else {
    return _formatSensorUnite(config, item._attributes.Val)
  }

  return item._attributes.Val
}

function _formatController({ config = {}, item = {} } = {}) {
  if (item._attributes.Degree.length > 0) {
    return item._attributes.Degree
  } else {
    switch (item._attributes.Val) {
      case '0':
        // return '关'
        return ''
      case '1':
        // return '正开'
        return ''
      case '2':
        // return '反开'
        return ''
      case '3':
        // return '错误'
        return ''
      default:
        return item._attributes.Val
    }
  }
  return item._attributes.Val
}


async function getGatewayDetail({ gatewayId = '' } = {}) {
  // console.log('getGatewayDetail', gatewayId)
  let ticket = getLastSuccessTicket()
  let params = {}
  params.ticket = ticket.data.ticket
  params.gatewayid = gatewayId
  let result = await (request.post(`/langrh/mobile/mobile!getShackStatusAndDatas.action`, json2Form(params)))
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  // console.log('getGatewayDetail', data)
  return data
}
async function cacheGatewayConfig({ gateway = {} } = {}) {
  try {
    var cache = wx.getStorageSync(GATEWAY_CONFIG_PREFIX + gateway._attributes.Id)
    if (cache) {
      if (gateway._attributes.Version && cache._attributes.Version != gateway._attributes.Version) {
        let tmp = await getGatewayConfig({ gatewayId: gateway._attributes.Id })
        return tmp
      } else {
        return cache
      }
    } else {
      let tmp = await getGatewayConfig({ gatewayId: gateway._attributes.Id })
    }
  } catch (e) {
    console.log('catch', e)
  }
}
async function initGatewaysConfig() {
  await setStorage(GATEWAY_CONFIG_PREFIX, {
    data: {},
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000
  })
  console.log('initGatewaysConfig saved')
}
async function getGatewayConfig({ gatewayId = '' } = {}) {
  console.log('gatewayId', gatewayId)
  let ticket = getLastSuccessTicket()
  let params = {}
  params.ticket = ticket.data.ticket
  params.gatewayid = gatewayId
  let result = await (request.post(`/langrh/mobile/mobile!config.action`, json2Form(params)))
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  console.log('getGatewayConfig', data)
  try {
    wx.setStorageSync(GATEWAY_CONFIG_PREFIX + data.Result.Gateway._attributes.Id, data.Result.Gateway)
  } catch (e) {
    console.log(e)
  }
  return data.Result.Gateway
}

function checkResponse(data) {
  if (data.Result.ReturnFlag._text == '0' && data.Result.ReturnMsg._text == "success") {
    return 1
  } else if (data.Result.ReturnFlag._text == '2' && data.Result.ReturnMsg._text == "ticket overdue") {
    console.log('checkResponse', getCurrentPages())
    loginWithCache()
    return 2
  }
}

async function getFarmList() {
  let ticket = getLastSuccessTicket()
  let params = {}
  params.paramStr = JSON.stringify({ ticket: ticket.data.ticket })
  // let result = await request.post(`/langrh/mobile/mobileFarm!loadFarms.action`, json2Form(params))
  let result = await request.post(`/langrh/mobile/mobileFarm!loadFarms4Level.action`, json2Form(params))
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  console.log('farmList', data)
  return data
}
async function getGatewayList({ farmId = '' } = {}) {
  let ticket = getLastSuccessTicket()
  let params = {}
  console.log('getGatewayList', farmId)
  params.paramStr = JSON.stringify({ ticket: ticket.data.ticket, level: '3', nodeId: farmId })
  let result = await (request.post(`/langrh/mobile/mobileGateway!loadGateway.action`, json2Form(params)))
  let data = JSON.parse(convert.xml2json(result, { compact: true }))
  console.log('getGatewayList', data)
  return data
}

function getLastSuccessTicket() {
  try {
    let value = wx.getStorageSync(LAST_SUCCESS_LOGIN_TICKET)
    if (value) {
      return value
    } else {
      loginWithCache()
    }
  } catch (e) {
    console.log('getLastSuccessTicket catch', e)
    loginWithCache()
  }
}


async function loginWithCache() {
  try {
    let value = wx.getStorageSync(LAST_SUCCESS_LOGIN_INPUT)
    console.log('loginWithCache', value)
    if (value) {
      let data = await login({ userName: value.userName, password: value.password })
      let pages = getCurrentPages()
      wx.reLaunch({
        url: '/' + pages[pages.length - 1].route
      })
    } else {
      wx.redirectTo({ url: '/pages/monitors/login' })
    }
  } catch (e) {
    console.log('loginWithCache catch', e)
  }
  return result
}

// { userName = '测试账户', password = '888888' } = {}
async function login({ userName = '', password = '' } = {}) {
  let params = {}
  params.account = userName
  // params.Password = password
  params.Password = md5(password)
  try {
    let result = await request.post(`/langrh/mobile/mobile!login.action`, json2Form(params))
    let data = JSON.parse(convert.xml2json(result, { compact: true }))
    if (data.Result.ReturnFlag._text == '0' && data.Result.ReturnMsg._text == "success") {
      await setStorage(LAST_SUCCESS_LOGIN_TICKET, {
        data: { ticket: data.Result.Ticket._text }
      })
      await setStorage(LAST_SUCCESS_LOGIN_INPUT, {
        userName: userName,
        password: password
      })

      function asyncConfig(callback) {
        callback.call()
      }
      asyncConfig(function() {
        console.log('data', data)
        for (var gateway of data.Result.Gateways.Gateway) {
          cacheGatewayConfig({ gateway: gateway })
        }
      })
      console.log('login success')
      return data
    } else {
      wx.showModal({
        title: '登录失败',
        content: '请重试',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.redirectTo({ url: '/pages/monitors/login' })
          }
        }
      })
    }
  } catch (e) {
    console.log('catch', e)
  }
}

function json2Form(json) {

  var str = [];

  for (var p in json) {

    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));

  }

  return str.join("&");

}
