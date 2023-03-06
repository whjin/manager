const getDateTime = (time) => {
  if (!time) return 0;
  return new Date(time).getTime() + 8 * 60 * 60 * 1000;
};

export default {
  BASEURL: "",
  ESURI: "http://localhost:8081/api/",

  /**
   * 接口名称
   */
  /* 共有接口 得到 民警  名称，职务、监室号、等、字段，自行在接口中添加需要的字段*/
  mutual: {
    getRoomInfo: "terminal/common/getFaceRoomInfo",
    upload: "terminal/pacFile/upload",
  },
  // 主页|在押人员
  index: {
    // 获取APP配置菜单
    getAppModuleConf: "terminal/terAppModuleConf/getAppModuleConf",
    // 获取缓存信息
    getAllSetting: "terminal/terSetting/all",
    // 获取分机信息
    getTerminalInfo: "terminal/terTerminalInfo/getTerminalByIp",
    // 获取主机信息
    getControlInfo: "terminal/terControlInfo/getControlByCode",
    // 获取指纹认证在押人员信息
    getOdsPrisonerInfo: "terminal/odsFinger/getOdsPersonInfo",
    // 获取指纹认证民警信息
    getOdsPoliceInfo: "terminal/odsFinger/getOdsPoliceInfo",
    // 获取民警指纹录入信息
    getPoliceFingerInfo: "terminal/odsFinger/getPoliceFingerInfo",
    // 获取民警可用指纹mKey
    getPoliceFingerKey: "terminal/odsFinger/getPoliceFingerKey",
    // 保存民警录入指纹信息
    savePoliceFingerInfo: "terminal/odsFinger/savePolice",
    // 保存指纹同步状态（成功|失败）信息
    saveFingerState: "terminal/terLog/saveLog",
    // 获取心情信息
    getTodayMoodInfo: "terminal/face/api/getDictionaryTypeList/SYS_MOOD_TYPE",
    // 获取谈话预约记录
    getTalkRecordInfo: "terminal/talkedu/getTalkRecord",
    // 获取APP升级信息
    getUpdateInfo: "terminal/update/getUpdateInfo",
    // 修改分机信息
    updateTerminal: "terminal/common/updateAppVersion",
    // 1:1人脸比对，用于点名
    faceRecognition11: "arc/face/compareCNP",
    // 获取分机设备在线状态
    terminalDeviceStatus: "terminal/device/api/terminalDeviceStatus",
    // 获取在押人员信息
    getOdsPersonById: "terminal/odsPersonInfo/getOdsPersonById",
    // 新增操作动态信息
    setDynamicInfo: "terminal/terOperationInfo/save",
    // 推送主机动态消息
    sendMsgToControl: "websocket/msgFilterSend",
  },
  // 电子水牌页
  main: {
    // 管教人员
    getRoomPolices: "terminal/manager/getRoomPolices/",
    // 监室人员
    getRoomPrisonerInfo: "terminal/common/getRoomPrisonerInfo",
    // 设备，监室视频
    getRoomDeviceInfo: "terminal/manager/getRoomDeviceInfo/",
  },
  // 民警模块
  police: {
    // 获取预约人信息
    getPrisonerInfo: "terminal/access/api/getAllPrisonerByRoomId/",
    // 1:N人脸识别，用于登录
    faceRecognition1N: "terminal/faceRecognition/policeFaceOneToMany",
    // 面对面管理
    face: {
      getDictionaryTypeList: "terminal/face/api/getDictionaryTypeList",
      // 获取面对面民警
      getRoomPoliceInfo: "terminal/pacRoomInfo/getRoomPoliceInfo/",
      // 获取面对面类型
      getFaceType: "terminal/common/getDictionaryType/SYS_FACE_TYPE",
      // 保存面对面登记
      saveFaceRegister: "terminal/face/api/saveFaceRecord",
      // 查询面对面记录
      getFaceRecord: "terminal/face/api/getFaceRecord",
    },
    // 安全大检查
    check: {
      // 保存登记
      saveCheck: "terminal/check/api/saveCheck",
      // 获取检查类型、内容
      getSubDictionaryTypeList: "terminal/check/api/getSubDictionaryTypeList",
      // 获取检查记录
      getCheckRecord: "terminal/check/api/getCheckRecord",
      // 上传图片
      upload: "terminal/check/api/upload",
      // 获取检查类型、内容
      getCheckTypeAndContent: "terminal/check/api/getCheckTypeAndContent",
    },
    // 进出监室登记
    outRoomRegister: {
      // 获取人员列表
      getPrisonerList: "terminal/pacPersonnelAccessRoom/getAccessPrisoner",
      // 获取外出类型
      getOutTypeList: "terminal/common/getDictionaryType/SYS_OUT_TYPE",
      // 查询记录
      searchRecord: "terminal/pacPersonnelAccessRoom/findPageByParams",
      // 带出监室
      takeOut: "terminal/pacPersonnelAccessRoom/takeOut",
      // 带回监室
      takeBack: "terminal/pacPersonnelAccessRoom/takeBack",
    },
    // 每日巡诊
    diagnosis: {
      // 获取人员信息
      getPrisonerInfo: "terminal/pacMPrescribeDetails/getPersonInfo",
      // 模糊查询药品名称
      getDrugInfo: "terminal/pacMPrescribeDetails/getDrugByVague",
      // 模糊查询药品频率
      getYYPL: "terminal/sysDictionaryField/getYYPL",
      // 模糊查询药品单位
      getDrugUnit: "terminal/sysDictionaryField/getDrugUnit",
      // 药品出库
      drugDelivery: "terminal/pacMPrescribeDetails/saveVisitPrescribe",
      // 模糊查询疾病类型
      getDiseaseType: "terminal/pacMDiseaseType/getDiseaseType",
      // 模糊查询特殊病
      getSpecial: "terminal/pacMSpecialCases/getSpecialDisease",
      // 开具处方
      makePrescription: "terminal/pacMPrescribe/savePrescribe",
      // 巡诊记录
      getRoundVisitsRecord: "terminal/pacMPrescribe/getPrescribe",
      // 巡诊记录详情
      getRecordDetail: "terminal/pacMPrescribe/getPrescribeDetails",
      // 获取治疗方案
      getCureScheme: "terminal/sysDictionaryField/getAllCure",
      // 获取模板列表
      getTemplateList: "terminal/pacMDrugTemplate/getTemplateName",
      // 获取模板详情
      getTemplateDetails: "terminal/pacMDrugTemplate/getTemplateDetail",
    },
    // 监室情况上报
    conditionReport: {
      // 违规类型模糊查询
      getViolationType: "terminal/sysDictionaryField/getViolationType",
      getViolation: "terminal/sysDictionaryField/getViolation",
      // 确认登记
      saveViolation: "terminal/terViolation/saveViolation",
      // 查询上报记录
      getViolationRecord: "terminal/terViolation/getViolationRecord",
    },
    // 购物确认
    shopping: {
      // 获取订单确认记录
      getConfirmList: "terminal/financeShop/getOrderConfirmRecord",
      // 根据姓名模糊查询
      getAllPrisoner: "terminal/odsPersonInfo/getRyByKeyword",
    },
  },
  // 在押人员
  prisoner: {
    // 1:N人脸识别，用于登录
    faceRecognition1N: "arc/face/searchSuspectFaceCNP1_N",
  },
  medication: {
    getRoomInfo: "terminal/terTerminalInfo/getRoomInfo",
  },
  access: {
    getPrisonersNumByJsh: "terminal/access/api/getPrisonersNumByJsh",
    getPrisonerInfo: "terminal/access/api/getPrisonerInfoByRommId",
    getOutPrisonerInfo: "terminal/access/api/getOutPrisonerInfoByRommId",
    getAllPrisonerByJsh: "terminal/access/api/getAllPrisonerByJsh",
    saveAccess: "terminal/access/api/saveAccess",
    accessRecord: "terminal/access/api/accessRecord",
  },

  /**
   * 接口测试
   */
  async testCall(method, data) {
    const [err, res] = await uni.request({
      url: "http://localhost:8100/terminal/pacOneLife/all",
      data: {
        data: {
          uuid: "22222",
        },
      },
      method: "get",
    });
    return res;
  },

  /**
   * 封装请求（async await 封装uni.request）
   * method		post/get
   * endpoint		接口方法名
   * data			所需传递参数
   * load			是否需要loading
   */
  async apiCall(method, endpoint, data, load, hideErr) {
    const baseUrl = uni.getStorageSync("baseUrl");
    if (baseUrl) {
      if (!load) {
        uni.showLoading({
          title: "请稍候",
          mask: true,
        });
      }
      let fullUrl = baseUrl + endpoint;
      let Authorization;
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        let uuid = userInfo.uuid;
        if (uuid) {
          Authorization = userInfo.uuid + " " + userInfo.terminalIP;
        }
      }
      if (endpoint == "permission/terminalCertification") {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (!load) {
        }
        if (res.data.state.code != 200) {
          this.handleShowToast("终端认证失败！");
        }
        return res.data;
      } else {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (!load) {
          uni.hideLoading();
        }
        if (res.data.state.code != 200) {
          if (!hideErr) {
            this.handleShowToast(`请求出错：${res.data.state.msg}`);
          }
        }
        let date = (res.header && res.header.Date) || 0;
        let timestamp = date ? new Date(date).getTime() : 0;
        let result = Object.assign({}, res.data, {
          date: timestamp,
        });
        return result;
      }
    } else {
      console.log("请先设置基础baseUrl！");
      this.handleShowToast("请先设置基础baseUrl！");
    }
  },

  /**
   * 封装请求（async await 封装uni.request）（省厅财务系统对接请求）
   * method		post/get
   * endpoint		接口方法名
   * data			所需传递参数
   * load			是否需要loading
   */
  async apiCallFinance(method, endpoint, data, load) {
    const baseUrl = uni.getStorageSync("baseUrl");
    if (baseUrl) {
      if (!load) {
        uni.showLoading({
          title: "请稍候",
          mask: true,
        });
      }
      let fullUrl = baseUrl + endpoint;
      let Authorization;
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        let uuid = userInfo.uuid;
        if (uuid) {
          Authorization = userInfo.uuid + " " + userInfo.terminalIP;
        }
      }
      if (endpoint == "permission/terminalCertification") {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (!load) {
          uni.hideLoading();
        }
        if (res.data.state.code != 200) {
          this.handleShowToast("终端认证失败！");
        }
        return res.data;
      } else {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (!load) {
          uni.hideLoading();
        }
        return res;
      }
    } else {
      console.log("请先设置基础baseUrl！");
      this.handleShowToast("请先设置基础baseUrl！");
    }
  },

  /**
   * 封装请求（async await 封装uni.request）
   * method		post/get
   * endpoint		接口方法名
   * data			所需传递参数
   * load			是否需要loading
   */
  async apiEsCall(method, endpoint, data, load) {
    if (!load) {
      uni.showLoading({
        title: "请稍候",
        mask: true,
      });
      uni.hideLoading();
    }

    let fullUrl = this.ESURI + endpoint;
    let Authorization = "";
    let [error, res] = await uni.request({
      url: fullUrl,
      data: data,
      method: method,
      dataType: "json",
      header: {
        "content-Type": "application/x-www-form-urlencoded",
        Authorization: Authorization || "",
      },
    });
    return res.data;
  },
  // 消息提示
  handleShowToast(title, position = "bottom", duration = 1500) {
    uni.showToast({
      title: title,
      position: position,
      duration: duration,
      icon: "none",
    });
  },
};
