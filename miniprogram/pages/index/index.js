const app = getApp()
Page({
  tomap () {
    wx.navigateTo({
      url: '../map/map'
    })
  },
  onShareAppMessage () {
    return {
      title: '快来使用LBS定位小工具',
      imageUrl: '../../asset/logo.png'
    }
  }
})
