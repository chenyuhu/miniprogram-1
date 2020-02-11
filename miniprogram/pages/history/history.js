const db = wx.cloud.database()
const _ = db.command

Page({
  /**
   * 页面的初始数据
   */
  data: {
    date: new Date(),
    data: []
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let date = new Date().toLocaleDateString()
    date = date.split('/').map(item => {
      if (Number(item) < 10) {
        item = `0${item}`
      }
      return item
    }).join('/')
    this.setData({
      date
    })
    await this.getAllData(date)
  },

  // 日期改变触发的事件
  async changeDate(event){
    let date = event.detail.value
    date = date.split('-').join('/')
    this.setData({
      date
    })
    await this.getAllData(date)
  },

  // 查询喂奶数据
  async getMilkData(date) {
    const { data } = await db.collection("niuniumilk").where(_.and(
      {
        createDate: _.gt(date[0])
      },
      {
        createDate: _.lt(date[1])
      }
    )).get()
    return data
  },

  // 查询睡眠记录
  async getSleepData(date) {
    const { data } = await db.collection('niuniusleep').where(_.and(
      {
        createDate: _.gt(date[0])
      },
      {
        createDate: _.lt(date[1])
      }
    )).get()
    return data
  },

  // 获得所有的数据
  async getAllData(date) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const data = [new Date(date),new Date(`${date} 23:59:59`)]
    const [milkData,sleepData] = await Promise.all([
      this.getMilkData(data),
      this.getSleepData(data)
    ])
    this.setData({
      data: milkData
            .concat(sleepData)
            .sort((a, b) => a.createDate > b.createDate)
    })
    wx.hideLoading()
  }
})
