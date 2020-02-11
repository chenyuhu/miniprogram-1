//index.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    form: {
      milkTime: null,
      milkNote: null,
      sleepType: "睡着了"
    },
    loading: false
  },

  // 改变时间记录
  changeTimeNote(event){
    const value = event.currentTarget.dataset.value
    const form = this.data.form
    if (value !== 'milkTime') {

    }
    form[value] = event.detail.value
    this.setData({ form })
  },

  // 提交喂奶数据
  onSubmitMilk(event) {
    const that = this
    that.setData({
      loading: !that.data.loading
    })
    const form = that.data.form
    const date = new Date().toLocaleDateString()
    if(form.milkNote && form.milkNote > 0){
      db.collection("niuniumilk").add({
        data: {
          milkNote: form.milkNote,
          milkTime: new Date(`${date} ${form.milkTime}`),
          createDate: new Date()
        },
        success: () => {
          that.setData({
            loading: !that.data.loading,
            form: {
              milkTime: form.milkTime,
              milkNote: null,
              sleepType: form.sleepType,
            }
          })
          wx.showToast({
            title: "保存成功!",
            mask: true
          })
        },
        fail: (err) => {
          wx.showToast({
            title: "出现错误!",
            mask: true,
            icon: "none"
          })
          that.setData({
            loading: !that.data.loading
          })
        }
      })
    }else {
      wx.showToast({
        title: "请输入喂奶量",
        mask: true,
        icon: "none"
      })
      that.setData({
        loading: !that.data.loading
      })
    }
  },

  // 提交睡眠数据
  async onSubmitSleep(event) {
    wx.showLoading({
      title: "加载中"
    })
    const sleepData = await this.getSleepData()
    const sleepType = event.currentTarget.dataset.sleeptype
    const form = this.data.form
    form.sleepType = sleepType === "睡着了" ? "睡好了" : "睡着了"
    this.setData({form})
    if (sleepType === "睡着了") {
      db.collection("niuniusleep").add({
        data: {
          sleepStartDate: new Date(),
          createDate: new Date()
        },
        success: () => {
          wx.showToast({
            title: "保存成功!",
            mask: true
          })
          wx.hideLoading()
        },
        fail: () => {
          wx.showToast({
            title: "添加失败!",
            mask: true,
            icon: "none"
          })
          wx.hideLoading()
        }
      })
    }else {
      const _id = sleepData[0]._id
      await db.collection("niuniusleep").doc(_id).update({
        data:{
          sleepEndDate: new Date()
        }
      })
      wx.hideLoading()
    }

  },

  // 监听页面加载
  async onShow(){
    const sleepData = await this.getSleepData()
    const time = new Date().toTimeString().substring(0,5)
    this.setData({
      form: {
        milkTime: time,
        milkNote: null,
        sleepType: sleepData.length > 0 ? "睡好了" : "睡着了"
      }
    })
  },

  // 获得最新的睡眠时间
  getSleepData: async () => {
    const {data} = await db.collection("niuniusleep").where({
      sleepStartDate: _.exists(true),
      sleepEndDate: _.exists(false),
    }).get()
    return data
  },

})
