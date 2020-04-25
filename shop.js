//myUser.js  我的
const app = getApp()
var call = require("../../../utils/request.js");
var commodyLists = [], total = 0, pageindex = 0,size=10; //数据备份
Page({
  data: {
    selectId: 0,
    shopCount: 0,
    shopId:'',
    activeId: '33',
    height: '', //屏幕高度
    items: [],
    isLoad : false,
    commodyList: []
  },
  onLoad: function (options) {
    let shopId = options.shopId;
    let shopName = options.shopName;
    wx.setNavigationBarTitle({
      title: shopName
    });
    this.setData({
      shopId: shopId
    })
    let activeId = this.data.activeId;
    if (activeId == '0') {
      activeId = '';
    }
    this.getCloudshopTypeList();
    this.getCommodyList(activeId);
    this.shoppingCartList();
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          height: res.windowHeight
        })
      }
    })
  },
  lower() {
    var result = this.data.commodyList;
    this.setData({
      isLoad: true
    });
    if (result.length >= total) {
      return false;
    } else if (!this.data.isLoad && pageindex > 1 && commodyLists.length == 0) {
      return false;
    } else {
      let activeId = this.data.activeId;
      if (activeId == '0') {
        activeId = '';
      }
      this.getCommodyList(activeId);
      let _this = this;
      let timeoutID = setInterval(() => {
        if (commodyLists.length > 0) {
          clearTimeout(timeoutID)
          var cont = result.concat(commodyLists);
          this.setData({
            commodyList: cont
          });
        } else {
          wx.showLoading({ //期间为了显示效果可以添加一个过度的弹出框提示“加载中”  
            title: '加载中',
            icon: 'loading',
          });
        }
      }, 200)
    }
  },
  plus: function (event) {
    this.reducew(event, 1)
  },
  minus: function (event) {
    this.reducew(event, 0)
  },
  overlimit: function (event) {
    this.reducew(event, 0)
  },
  reducew: function (event, type) {
    if (app.globalData.unionid != null) {
      let obj = event.currentTarget.dataset;
      let index = obj.index;
      let item = this.data.commodyList[index];
      let shopCount = this.data.shopCount;
      if (type == 1) {
        item.commody_cnt++;
        shopCount++;
      } else if (type == 0) {
        item.commody_cnt--;
        shopCount--;
      }
      this.setData({
        commodyList: this.data.commodyList,
        shopCount: shopCount
      })
      this.addShoppingCart(item)
    }
  },
  addShoppingCart: function (form) {
    let that = this;
    let params = {
      userId: app.globalData.unionid,
      commodyId: form.commody_id,
      commodyCnt: form.commody_cnt,
      commodyAmount: form.commody_money
      // token:getUser.Token
    };
    call.request('/shopping/cart/insertShoppingCart', params, function (data) {
      console.log(data)
    }, function (data) {

    });
  },
  gridItem: function (event) {
    console.log(event)
  },
  onChange: function (event) {
    var dataTimes = new Date();
    console.log(dataTimes.getHours() + ' ' + dataTimes.getMinutes() + ' ' + dataTimes.getSeconds() + '：' + dataTimes.getMilliseconds())
    let activeId = event.detail.name;
    pageindex= 1;
    this.setData({
      activeId: activeId,
      overlayShow: true,
      commodyList: [],
      
    });
    if (activeId == '0') {
      activeId = '';
    }
    console.log(dataTimes.getHours() + ' ' + dataTimes.getMinutes() + ' ' + dataTimes.getSeconds())
    this.getCommodyList(activeId)
    wx.showToast({
      title: `切换到标签 ${event.detail.name}`,
      icon: 'none'
    });
  },
  getCloudshopTypeList: function () {
    let that = this;
    let params = {
      shopId: this.data.shopId,
      parent_type: 3,
    };
    call.request('/cloudshopType/getCloudshopTypeList', params, function (data) {
      let list = data.data;
      let dataList = [{
        id: "0",
        label: '全部商品'
      }];
      if (list.length > 0) {
        list.forEach((item, index) => {
          let obj = {
            id: item.cloudshopTypeId + "",
            label: item.cloudshopTypeName
          };
          dataList.push(obj);
        });
      }
      that.setData({
        items: dataList
      });
    });
  },
  getCommodyList: function (type) {
    let that = this;
    var dataTimes = new Date();
    let params = {
      userId: app.globalData.unionid,
      commodyStatus: 1,
      commodyType: type,
      shopId:this.data.shopId,
      page: pageindex,
      size: size
    };
    call.request('/commodys/getCommodyList', params, function (data) {
      console.log(dataTimes.getHours() + '：' + dataTimes.getMinutes() + '：' + dataTimes.getSeconds() + '：' + dataTimes.getMilliseconds())
      
      let list = data.data.list;
      let dataList = [];
      // let typeList = [{
      //   id: 0,
      //   label: '全部商品'
      // }];
      list.forEach(element => {
        let obj = {
          commody_id: element.commodyId, //商品编号
          is_select: false, //是否选中
          commody_name: element.commodyName, //商品名称
          commody_present: element.commodyPresent, //商品介绍
          shop_id: element.shopId, //店铺编号
          commody_type: element.commodyType, //商品类型
          delivery: element.isDelivery == 1 ? true : false, //是否配送
          commody_status: element.commodyStatus, //商品状态
          commody_money: element.commodyMoney, //商品价格
          commody_moneyOld: "", //商品原价
          commody_cnt: element.commodyCnt, //购买数量
          commody_unit: element.commodyUnit, //计量单位
          commody_img: call.host + 'shops/show?fileName=' + element.commodyImg.split(";")[0].split(".")[0] +
            '-thumbnail.' + element.commodyImg.split(";")[0].split(".")[1], //商品图片
          commody_stock: element.commodyStock, //剩余库存
          commody_activity: [{
            activity_id: "",
            activity_name: "新品"
          }]
        };
        // if (that.data.commodyTypeList.length > 0) {
        //   let typeName = that.data.commodyTypeList.filter(
        //     o => o.id == element.commodyType
        //   )[0];
        //   if (typeList.filter(o => o.label == typeName.text).length == 0) {
        //     typeList.push({
        //       id: typeName.id,
        //       label: typeName.text
        //     });
        //   }
        // }
        dataList.push(obj);
        // that.data.commodyList.push(obj); //注释
      });
      
      console.log(dataTimes.getHours() + ' ' + dataTimes.getMinutes() + ' ' + dataTimes.getSeconds() + '：' + dataTimes.getMilliseconds())
      total=data.data.total;
      pageindex= pageindex + 1;
      if (that.data.commodyList.length == 0) {
        that.setData({
          commodyList: dataList,
          isLoad:false,
          overlayShow: false,
        });
      } else {
        commodyLists= dataList;
        that.setData({
          overlayShow: false,
          isLoad: false
        });
      }
      console.log(dataTimes.getHours() + ' ' + dataTimes.getMinutes() + ' ' + dataTimes.getSeconds() + '：' + dataTimes.getMilliseconds())
    }, function (data) {
      console.log(data)
    });
  },
  //获取商品列表
  shoppingCartList: function () {
    let that = this;
    let ite = {
      userId: app.globalData.unionid
    };
    call.request('/shopping/cart/getShoppingCart', ite, function (data) {
      let list = data.data;
      if (list != null && list.length > 0) {
        let shoppCartList = [];
        let all = [];
        let shopCount = 0;
        list.forEach((item, index) => {
          shopCount += item.commody_cnt;
        });
        that.setData({
          shopCount: shopCount
        });
      }
    }, function (data) {
      console.log(data)
    });
  },
  //防止冒泡
  preventD: function () { }
})