const app = getApp() // 获取全局APP对象
let that = null // 页面this指针变量
Page({
  data: { // 默认数据
    latitude: 39.9869, // 地图中心纬度
    longitude: 116.3093, // 地图中心经度
    marker: { // 地图当前标记点
      id: 0, // 标记点ID，不用变更
      latitude: 39.9871, // 标记点所在纬度
      longitude: 116.3093, // 标记点所在经度
      iconPath: '../../asset/local.png', // 标记点图标，png或jpg类型
      width: '20', // 标记点图标宽度
      height: '20' // 标记点图标高度
    },
    info: { // 地图点位信息
      address: '-', // 常规地址
      adinfo: '-', // 行政区
      formatted: '-', // 推荐地址
      location: '-' // 经纬度
    }
  },
  /**
   * 页面装载回调
   */
  onLoad () {
    that = this // 设置页面this指针到全局that
    wx.getLocation({ // 获取当前位置
      type: 'gcj02', // gcj02火星坐标系，用于地图标记点位
      success (res) { // 获取成功
        that.setInfo([parseFloat(res.latitude), parseFloat(res.longitude)], 1) // 设置经纬度信息
        // that.getLocation() // 获取当前位置点
      },
      fail (e) { // 获取失败
        if (e.errMsg.indexOf('auth deny') !== -1) { // 如果是权限拒绝
          wx.showModal({ // 显示提示
            content: '你已经拒绝了定位权限，将无法获取到你的位置信息，可以选择前往开启',
            success (res) {
              if (res.confirm) { // 确认后
                wx.openSetting() // 打开设置页，方便用户开启定位
              }
            }
          })
        }
      }
    })
    that.geteBikeLocation()
  },
  /**
   * 地图范围改变
   * @param {*} e 页面载入参数
   */
  changeMap (e) {
    if (e.causedBy === 'drag' && e.type === 'end') { // 只有在手动拖动停止时，才执行动作
      const { latitude, longitude } = e.detail.centerLocation // 获取中心点位置
      that.setInfo([latitude, longitude], 1) // 不更改标记点，更新地图中心位置
    }
  },
  /**
   * 请求获取经纬度的详细信息
   * @param {object} data 经纬度信息
   */
  async getLocation (data = null) {
    const {
      latitude,
      longitude
    } = data || that.data // 如果传入为空，则使用data内数据
    await app.call({ // 发起云函数请求
      name: 'location', // 业务为location，获取经纬度信息
      data: { // 传入经纬度信息
        location: `${latitude},${longitude}`
      },
      load: false // 不显示加载loading，静默执行
    }).then((res) => { // 请求成功后
      that.setData({ // 将信息存储data数据
        info: res
      })
    })
  },
  /**
   * 请求获取自行车所在的经纬度
   */
  async geteBikeLocation() {
    const res = await wx.cloud.callContainer({
        "config": {
          "env": "prod-3g1xsb4ac69a2a97"
        },
        "path": "/api/position",
        "header": {
          "X-WX-SERVICE": "django-qix2"
        },
        "method": "GET",
      }).then((res)=>{
          let data = res.data.data;
          console.log(data)
          const {latitude, longitude} = data;
          that.setInfo([latitude, longitude], 2) // 只更改标记点
          that.getLocation(data)
      })
  },
  /**
   * 统一设置经纬度信息和额外信息
   * @param {array} pot 经纬度
   * @param {number} type 类型 0-都设置 1-只设置中心点 2-只设置标记点
   * @param {*} ext 额外的其他数据，一块带入
   */
  setInfo (pot = [39.9086, 116.3974], type = 0, ext = {}) {
    let data = { ...ext }
    if (type !== 1) { // 如果类型不为1
      data = Object.assign(data, { // 传入标记点
        'marker.latitude': pot[0],
        'marker.longitude': pot[1]
      })
    }
    if (type !== 2) { // 如果类型不为2
      data = Object.assign(data, { // 传入中心点
        latitude: pot[0],
        longitude: pot[1]
      })
    }
    that.setData(data)
  },
    /**
   * 统一设置经纬度信息和额外信息
   * @param {array} pot 经纬度
   * @param {number} type 类型 0-都设置 1-只设置中心点 2-只设置标记点
   * @param {*} ext 额外的其他数据，一块带入
   */
  setWhistle (on = true) {
    wx.request({
        url: 'https://flask-2abd-1901017-1311749828.ap-shanghai.run.tcloudbase.com/api/position',
        method: "POST",
        data: {"calling": on ? "1" : "0"},
        success(res) {
            console.log('success')
            console.log(res.data)
        },
        fail(res) {
            console.log('failed')
        }
      })
    }

})
