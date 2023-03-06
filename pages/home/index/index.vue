<template>
  <div class="home-container">
    <nav-bar :showNavBar="showNavBar" :homeState="homeState && showHomeState" :backState="backState && showBackState" @click-init="onClickInitSet" @click-home="onClickHome" @click-back="onClickBack" />
    <div class="home-wrapper">
      <terminal-main v-if="currentTab == 31" ref="main"></terminal-main>
      <div v-else-if="currentTab == 32" class="police-container" @touchstart.stop="initCountTimer">
        <div class="police-content">
          <scroll-view scroll-y="true" class="police-scroll">
            <uni-grid :column="6" :show-border="false" :square="false">
              <uni-grid-item class="police-item" v-for="(item, index) in policeList" :key="index">
                <div class="police-list" :class="index % 2 ? 'bgStyle-two' : 'bgStyle-one'" @click="handlePoliceClick(index)">
                  <image :src="item.image"></image>
                  <text>{{ item.name }}</text>
                </div>
              </uni-grid-item>
            </uni-grid>
          </scroll-view>
        </div>
      </div>
      <terminal-intercom v-else-if="currentTab == 33" ref="intercom"></terminal-intercom>
      <police-fingerprint v-else-if="currentTab == 34" ref="fingerprint"></police-fingerprint>
      <terminal-face v-else-if="currentTab == 26" ref="face"></terminal-face>
      <terminal-outRoomRegister v-else-if="currentTab == 27" ref="outRoomRegister"></terminal-outRoomRegister>
      <terminal-check v-else-if="currentTab == 28" ref="check"></terminal-check>
      <terminal-conditionReport v-else-if="currentTab == 29" ref="conditionReport"></terminal-conditionReport>
      <terminal-diagnosis v-else-if="currentTab == 30" ref="diagnosis"></terminal-diagnosis>
      <terminal-shopping v-else-if="currentTab == 35" ref="shopping"></terminal-shopping>
      <terminal-prisonerInfo v-else-if="currentTab == 36" ref="prisonerInfo"></terminal-prisonerInfo>
      <terminal-message v-else-if="currentTab == 37" ref="message"></terminal-message>
      <bottom-bar :showBottomBar="showBottomBar" :loginState="loginState" :name="person.name" :countdown="loginTimeout" @click-logout="handleLogout" @click-set="handleSetUp" />
    </div>
    <div class="neil-modal-container">
      <!-- APP配置-基础URL -->
      <neil-modal class="setting-modal-container" :show="showUrlConfig" @close="closeModal('UrlConfig')">
        <view class="modal-box">
          <view class="modal-header">
            <view class="modal-title">
              APP配置-基础URL
              <text class="modal-warning">(非专业人员请勿操作)</text>
            </view>
          </view>
          <view class="page-horizontal-divider"></view>
          <view class="modal-baseurl-body">
            <view class="baseurl-content">
              <text class="baseurl-text">基础Url：</text>
              <input class="baseurl-input input-baseurl" v-model="baseUrl" placeholder="http://ip:port/" />
            </view>
            <view class="baseurl-btn-box">
              <view class="page-button" @click="setBaseUrl">下一步</view>
            </view>
            <view class="baseurl-clear" @click="clearALLCache">
              广州市高科通信技术股份有限公司版权所有
            </view>
          </view>
        </view>
      </neil-modal>
      <!-- APP配置-系统缓存 -->
      <neil-modal class="setting-modal-container" :show="showCacheConfig" @close="closeModal('CacheConfig')">
        <view class="modal-box">
          <view class="modal-header">
            <view class="modal-title">
              APP配置-系统缓存
              <text class="modal-warning" @click="closeModal('CacheConfig')">(非专业人员请勿操作)</text>
            </view>
          </view>
          <view class="page-horizontal-divider"></view>
          <view class="modal-cache-body">
            <view class="cache-item">
              <text class="cache-text">系统缓存：{{ sysCacheInfo }}</text>
            </view>
            <view class="cache-item">
              <text class="cache-text">终端服务：{{ sysWebSocketInfo }}</text>
            </view>
            <view class="cache-item">
              <text class="cache-text">本机Ip：</text>
              <input class="cache-input input-baseurl" v-model="terminalIP" placeholder="ip" disabled />
            </view>
            <view class="cache-btn-box">
              <view class="page-button cache-btn" @click="setAllSettingCache">加载系统缓存</view>
              <view class="page-button cache-btn" @click="setAllBindInfo">认证终端信息</view>
              <view class="page-button-empty" @click="closeCacheConfig">关闭</view>
            </view>
          </view>
        </view>
      </neil-modal>
      <!-- 值班室视频通话弹框 -->
      <neil-modal :show="showManagerCall">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>确认开启值班室对讲？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('ManagerCall')">
              取消
            </div>
            <div class="btn-confirm" @touchstart.stop="handleManagerCall">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 监仓视频通话弹框 -->
      <neil-modal :show="showTerminalCall">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>确认开启监仓对讲？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('TerminalCall')">
              取消
            </div>
            <div class="btn-confirm" @touchstart.stop="handleTerminalCall">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 视频通话连接 -->
      <neil-modal :show="showVideoConnect">
        <div class="videochat-modal-container">
          <div class="videochat-modal-content">
            <image class="content-rotate" src="/static/images/index/home/connect.png"></image>
            <text>通话努力连接中...</text>
          </div>
          <div class="page-horizontal-divider"></div>
          <div class="videochat-cancel" @touchstart.stop="closeModal('VideoConnect')">
            <common-icons iconType="iconphonecancel" size="70" color="#ba242c" />
          </div>
        </div>
      </neil-modal>
      <!-- 密码验证 -->
      <keyboard :show="showSystemPwd" :failSystemPwd="failSystemPwd" ref="keyboard" @getPassword="getPassword" @hideKey="hideKeyModel"></keyboard>
      <!-- 系统菜单 -->
      <neil-modal :show="showSystemMenu">
        <div class="system-modal-container">
          <div class="modal-header">
            <div class="modal-title">
              <text>系统设置</text>
            </div>
            <div class="modal-close" @click="closeModal('SystemMenu')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <scroll-view scroll-y="true" class="system-menu-scroll">
            <ul>
              <li @click="policeFingerprint">民警指纹录入</li>
              <div class="page-horizontal-divider"></div>
              <li @click="openModal('PoliceFinger')">同步民警指纹</li>
              <div class="page-horizontal-divider"></div>
              <li @click="showNavigationBar">显示状态栏</li>
              <div class="page-horizontal-divider"></div>
              <li @click="hideNavigationBar">隐藏状态栏</li>
              <div class="page-horizontal-divider"></div>
              <li @click="openModal('RestartDev')">设备重启</li>
              <div class="page-horizontal-divider"></div>
              <li @click="openModal('RestartApp')">应用重启</li>
              <div class="page-horizontal-divider"></div>
              <li @click="openModal('ConfigInfo')">同步配置信息</li>
              <div class="page-horizontal-divider"></div>
              <li @click="getUpdateAppInfo(0)">升级APP</li>
              <div class="page-horizontal-divider"></div>
              <li @click="echoCalibrate">回声校准</li>
              <div class="page-horizontal-divider"></div>
              <li @click="openCrashHandle">开启守护</li>
              <div class="page-horizontal-divider"></div>
              <li @click="closeCrashHandle">关闭守护</li>
              <div class="page-horizontal-divider"></div>
            </ul>
          </scroll-view>
        </div>
      </neil-modal>
      <!-- 登录弹框 -->
      <recognition-dialogs ref="recognitionDialogs" :isShow="showRecognitionDialogs" :role="loginRole" @fingerRecognitionSuccess="fingerRecognitionSuccess" @faceRecognitionSuccess="faceRecognitionSuccess" @close="handleRecognitionDialogsClose"></recognition-dialogs>
      <!-- 同步民警指纹弹框 -->
      <neil-modal :show="showPoliceFinger">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否同步民警指纹？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('PoliceFinger')">
              取消
            </div>
            <div class="btn-confirm" @touchstart.stop="syncPoliceFinger">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 设备重启弹框 -->
      <neil-modal :show="showRestartDev">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否重启设备？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('RestartDev')">取消</div>
            <div class="btn-confirm" @touchstart.stop="handleRestartDev">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 应用重启弹框 -->
      <neil-modal :show="showRestartApp">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否重启应用？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('RestartApp')">取消</div>
            <div class="btn-confirm" @touchstart.stop="handleRestartApp">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 同步配置信息弹框 -->
      <neil-modal :show="showConfigInfo">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否同步配置信息？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('ConfigInfo')">取消</div>
            <div class="btn-confirm" @touchstart.stop="configInfoSync">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 升级APP弹框 -->
      <neil-modal :show="showUpdateApp">
        <div class="update-modal-container">
          <div class="modal-header">
            <div class="modal-title">当前版本V{{ appVersion }}</div>
          </div>
          <div class="page-horizontal-divider"></div>
          <scroll-view scroll-y="true" class="update-table-scroll">
            <div class="update-note">{{ updateNote }}</div>
          </scroll-view>
          <div class="update-modal-button">
            <div class="btn-cancel" @click="closeModal('UpdateApp')">取消</div>
            <div class="btn-confirm" :class="{ 'btn-disabled': disabledClick }" @touchstart.stop="handleUpdateApp">
              下载更新
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 设备离线弹框 -->
      <neil-modal :show="showDevOffline">
        <div class="offline-modal-container">
          <div class="modal-header">
            <div class="modal-title">温馨提示</div>
            <div class="modal-close" @click="closeModal('DevOffline')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <div class="offline-modal-box">
            <common-icons iconType="iconalarm" size="86" color="#fff"></common-icons>
            <text class="offline-content">网络异常，设备连接失败！({{ reconnectCount }})</text>
          </div>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import navBar from "@/components/nav-bar/nav-bar.vue";
import bottomBar from "@/components/bottom-bar/bottom-bar.vue";
import uniGrid from "@/components/uni/uni-grid/uni-grid.vue";
import uniGridItem from "@/components/uni/uni-grid-item/uni-grid-item.vue";
import neilModal from "@/components/neil-modal/neil-modal.vue";
import commonIcons from "@/components/common-icons/common-icons.vue";
import keyboard from "@/components/dt-keyboard/dt-keyboard.vue";
import recognitionDialogs from "@/components/recognition-dialogs/recognition-dialogs.vue";
import terminalMain from "@/pages/home/main/main.vue";
import terminalIntercom from "@/pages/police/intercom/intercom.vue";
import terminalFace from "@/pages/police/face/face.vue";
import terminalCheck from "@/pages/police/check/check.vue";
import terminalOutRoomRegister from "@/pages/police/outRoomRegister/outRoomRegister.vue";
import terminalConditionReport from "@/pages/police/conditionReport/conditionReport.vue";
import terminalDiagnosis from "@/pages/police/diagnosis/diagnosis.vue";
import terminalShopping from "@/pages/police/shopping/shopping.vue";
import terminalPrisonerInfo from "@/pages/police/prisonerInfo/prisonerInfo.vue";
import policeFingerprint from "@/pages/police/fingerprint/fingerprint.vue";
import terminalMessage from "@/pages/police/message/message.vue";
import { isNullStr, dateFormat } from "@/common/utils/util.js";
import Api from "@/common/api.js";
import Log from "@/common/utils/log.js";
import { mapState, mapMutations } from "vuex";
import policeList from "@/static/mock/policeList.json";

export default {
  components: {
    navBar,
    bottomBar,
    uniGrid,
    uniGridItem,
    neilModal,
    commonIcons,
    keyboard,
    recognitionDialogs,
    terminalMain,
    terminalIntercom,
    terminalFace,
    terminalCheck,
    terminalOutRoomRegister,
    terminalConditionReport,
    terminalDiagnosis,
    terminalShopping,
    terminalPrisonerInfo,
    policeFingerprint,
    terminalMessage,
  },
  data () {
    return {
      // 登录用户信息
      person: {
        id: "",
        name: "",
      },
      // 点击设置栏次数
      clickNums: 0,
      // 配置baseUrl弹框
      showUrlConfig: false,
      // 配置系统缓存弹框
      showCacheConfig: false,
      baseUrl: "",
      // 系统缓存
      sysCacheInfo: "",
      // WebSocket连接提示信息
      sysWebSocketInfo: "",
      // 是否关闭WebSocket
      isWebSocketDisable: false,
      // WebSocket连接定时器
      socketTimer: null,
      // 值班室视频通话弹框
      showManagerCall: false,
      // 监仓视频通话弹框
      showTerminalCall: false,
      // 视频对讲弹框
      showVideoConnect: false,
      // 登录弹框
      showRecognitionDialogs: false,
      // 民警菜单信息
      policeList: [],
      // 终端配置状态
      initState: false,
      // 底栏设置状态
      setupState: false,
      // 密码验证弹框
      showSystemPwd: false,
      // 密码验证失败
      failSystemPwd: false,
      // 同步民警指纹弹框
      showPoliceFinger: false,
      // 设备重启弹框
      showRestartDev: false,
      // 应用重启弹框
      showRestartApp: false,
      // 同步配置信息弹框
      showConfigInfo: false,
      // 升级APP弹框
      showUpdateApp: false,
      // APP版本
      appVersion: "",
      // APP更新内容
      updateNote: "",
      // 禁用按钮
      disabledClick: false,
      // APP下载地址
      downloadUrl: "",
      // 指纹登录定时器
      loginTimer: null,
      // 倒计时定时器
      timer: null,
      // 指纹认证倒计时
      loginTimeout: uni.getStorageSync("loginTimeout12") || 30,
      // 系统菜单弹框
      showSystemMenu: false,
      // 设备离线提示弹框
      showDevOffline: false,
      // 网络异常监听定时器
      heartbeatTimer: null,
      // 网络异常计时
      heartBeatTimeOut: uni.getStorageSync("heartBeatTimeOut"),
      // 视频对讲状态
      intercomState: false,
      // 禁止重复操作
      isRepeatState: false,
      // webSocket 会话对象
      socketTask: null,
      // 当前页面 用于登录成功后跳转
      currentPage: 2,
      // 登录人员身份 0：医务 1：管教
      loginRole: 1,
      // socket重连次数
      reconnectCount: 0,
    };
  },
  computed: {
    ...mapState({
      // 当前页面
      currentTab: (state) => state.app.currentTab,
      // 登录人员信息
      personInfo: (state) => state.app.personInfo,
      // 视频流地址
      playerUrl: (state) => state.app.playerUrl,
      // 菜单状态
      menuState: (state) => state.app.menuState,
      // 返回首页状态
      homeState: (state) => state.app.homeState,
      // 后退状态
      backState: (state) => state.app.backState,
      // 登录状态
      loginState: (state) => state.app.loginState,
      // 视频播放信息
      videoInfo: (state) => state.app.videoInfo,
    }),
    // 标题栏状态
    showNavBar () {
      return this.currentTab != 31;
    },
    // 状态栏状态
    showBottomBar () {
      return this.currentTab != 31;
    },
    // 返回首页状态
    showHomeState () {
      return ![31, 33].includes(this.currentTab);
    },
    // 页面回退状态
    showBackState () {
      return ![31, 32, 33].includes(this.currentTab);
    },
    // 重连定时器间隔
    websocketTime () {
      let count = this.reconnectCount;
      if (count >= 0 && count < 360) {
        return 10000;
      } else if (count >= 360 && count < 960) {
        return 30000;
      } else if (count >= 960 && count < 2040) {
        return 60000;
      } else if (count >= 2040 && count < 2760) {
        return 120000;
      } else {
        return 240000;
      }
    },
    // 分机IP
    terminalIP () {
      return getApp().globalData.Base.getIpAddress().ip || this.$config.terminalIP;
    }
  },
  onLoad () {
    this.reconnectCount = 0;
    //初始化配置-基础Url
    if (isNullStr(uni.getStorageSync("baseUrl"))) {
      this.baseUrl = this.$config.baseUrl;
      this.openModal("UrlConfig");
    } else {
      this.baseUrl = uni.getStorageSync("baseUrl");

      // 获取APP配置菜单
      this.getAppMenuList();
      // 同步配置信息
      this.configInfoSync();

      // #ifdef APP-PLUS
      const _this = this;
      // 门磁门灯事件监听
      plus.globalEvent.removeEventListener("IO_Alarm");
      plus.globalEvent.addEventListener("IO_Alarm", function (e) {
        console.log("门磁门灯状态：" + JSON.stringify(e));
        // 门磁门灯 1：开启 0：关闭
        getApp().globalData.SystemModule.setGpio(139, e.value);
        _this.setDynamicInfo(e.value);
      });
      // #endif
      // 来邦初始化对讲服务
      getApp().globalData.FloatUniModule.initIPCManager(e => {
        if (e.code == 0) {
          // 获取设备信息
          getApp().globalData.FloatUniModule.getCurrentDeviceInfo(info => {
            console.log(info);
            // 来邦对讲事件监听
            getApp().globalData.FloatUniModule.talkEventCallback(res => {
              console.log("对讲服务事件：" + JSON.stringify(res));
              getApp().globalData.FloatUniModule.openLocalCamera(true);
              if (res.eventID == 1) {
                // 呼出处理中
              } else if (res.eventID == 2) {
                // 呼出振铃
              } else if (res.eventID == 3) {
                // 监听接通
              } else if (res.eventID == 4) {
                // 对讲接通
                this.intercomHandler(res);
              } else if (res.eventID == 5) {
                // 通话或呼叫挂断
                this.stopIntercom(res);
              } else if (res.eventID == 7 || res.eventID == 8) {
                // 7对方忙，8呼出失败
                this.stopIntercom(res);
                let { code: managerCode, terminalCode } = uni.getStorageSync("managerInfo");
                this.sendWebsocket(
                  `{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"6"}`
                );
              } else if (res.eventID == 268 || res.eventID == 11) {
                // 10-按键对讲|11-按键报警
              }
            });
            // 来邦门磁事件监听
            getApp().globalData.FloatUniModule.onDoorContactValue(res => {
              console.log("门磁事件：" + JSON.stringify(res));
              // 门磁门灯 1开启 0关闭
              // _this.setDynamicInfo(res.isOpen);
            });
          });
        }
      });
      //websocket连接
      if (!getApp().globalData.webSocketConnected) {
        if (!isNullStr(uni.getStorageSync("managerInfo").code)) {
          //初始化配置WS服务
          this.connectWebSocketInit(uni.getStorageSync("managerInfo").code);
        } else {
          this.setAllBindInfo();
        }
      }
    }
  },
  destroyed () {
    this.clickNums = 0;
    uni.hideToast();
  },
  methods: {
    ...mapMutations({
      // 设置当前页面
      setCurrentTab: "app/SET_CURRENTTAB",
      // 指纹认证人员信息
      setPersonInfo: "app/SET_PERSONINFO",
      // 视频播放组件
      setShowPlayer: "app/SET_SHOWPLAYER",
      // 设置视频流地址
      setPlayerUrl: "app/SET_PLAYERURL",
      // 设置登录状态
      setLoginState: "app/SET_LOGINSTATE",
      // 设置视频对讲状态
      setOpenIntercom: "app/SET_OPENINTERCOM",
      // 设置视频对讲提示
      setIntercomName: "app/SET_INTERCOMNAME",
      // 设置视频对讲信息
      setIntercomInfo: "app/SET_INTERCOMINFO",
    }),
    // 获取APP配置菜单
    async getAppMenuList () {
      let areaCode = uni.getStorageSync("managerInfo").areaCode;
      let res = await Api.apiCall("get", Api.index.getAppModuleConf + `?device=manager&unitCode=${areaCode}`, null);
      if (res.state.code == 200) {
        if (res.data.length) {
          this.policeList = res.data[0].children;
        }
      }
    },
    // 仓外屏视频通话
    intercomHandler (res) {
      clearInterval(this.timer);
      this.showVideoConnect = false;
      this.setOpenIntercom(true);
      this.handleShowToast("正在加载对讲画面，请稍候...", "center", 5000);
      this.voiceBroadcast("请注意，已经开启视频对讲！");
      // 跳转进入视频对讲页面
      this.setCurrentTab(33);
      let { masterNum, slaveNum, devRegType } = res;
      console.log(masterNum, slaveNum, devRegType);
      getApp().globalData.FloatUniModule.setTalkViewPosition(45, 220, 1060, 710);
      getApp().globalData.FloatUniModule.nativeAnswer(0, masterNum, slaveNum, devRegType);
      getApp().globalData.FloatUniModule.hideLocalPreView(false);
      getApp().globalData.FloatUniModule.setLocalVideoViewPosition(1150, 220, 727, 460);
    },
    // 关闭视频通话
    stopIntercom (device) {
      this.resetIntercom();
      let { masterNum, slaveNum } = device;
      console.log(masterNum, slaveNum);
      getApp().globalData.FloatUniModule.nativeHangup(0, masterNum, slaveNum, 0);
      this.setCurrentTab(32);
    },
    // 重置对讲状态
    resetIntercom () {
      this.intercomState = false;
      this.showVideoConnect = false;
      this.setOpenIntercom(false);
    },
    // 重置倒计时
    initCountTimer () {
      this.loginTimeout = uni.getStorageSync("loginTimeout") || 30;
    },
    // 重置其他倒计时长
    initSpecialTimeout () {
      this.loginTimeout = uni.getStorageSync("specialLoginTimeout") || 120;
    },
    // 倒计时
    countTimer () {
      this.initCountTimer();
      this.timer = setInterval(() => {
        this.loginTimeout--;
        if (this.loginTimeout <= 0) {
          clearInterval(this.timer);
          clearInterval(this.loginTimer);
          this.initCountTimer();
          if (this.person.id !== "0999") {
            this.setLoginState(false);
          }
          this.showManagerCall = false;
          this.showTerminalCall = false;
          this.closeModal("RecognitionDialogs");
          this.setCurrentTab(31);
        }
      }, 1000);
    },
    // 消息提示
    handleShowToast (title, position = "bottom", duration = 1500) {
      uni.showToast({
        title: title,
        position: position,
        duration: duration,
        icon: "none",
      });
    },
    // 切换民警子模块
    handlePoliceClick (index) {
      this.handleHomeModal(this.policeList[index]);
    },
    // 子模块路由跳转
    handleHomeModal (item) {
      if (!this.intercomState) {
        this.intercomState = true;
        setTimeout(() => {
          this.intercomState = false;
        }, 1000);
        if (!isNullStr(item.isModal) && item.isModal) {
          this.openModal(item.url);
        } else {
          if (isNullStr(item.name)) {
            this.handleShowToast("Developing");
          } else {
            if (!isNullStr(item.index) && item.index > 2) {
              if (item.index === 9) {
                this.loginRole = 2;
              } else {
                this.loginRole = 1;
              }
              this.initCountTimer();
              this.currentPage = item.index;
              if (this.person.id === "0999" || item.index == 10) {
                this.setCurrentTab(this.currentPage);
              } else {
                this.showRecognitionDialogs = true;
                this.$nextTick(() => {
                  this.$refs.recognitionDialogs.startRecognition();
                });
              }
            }
          }
        }
      }
    },
    // 管理员密码验证
    getPassword (e) {
      let adminPassword = uni.getStorageSync("adminPassword");
      if (e == adminPassword) {
        this.showSystemPwd = false;
        if (this.initState) {
          this.openModal("UrlConfig");
          this.initState = false;
        }
        if (this.setupState) {
          this.showSystemMenu = true;
          this.setupState = false;
        }
      } else {
        this.failSystemPwd = true;
        this.$refs.keyboard.clear();
        setTimeout(() => (this.failSystemPwd = false), 600);
      }
    },
    // 关闭密码验证弹框
    hideKeyModel () {
      this.initState = false;
      this.setupState = false;
      this.showSystemPwd = false;
    },
    // 民警指纹录入页面
    policeFingerprint () {
      this.setCurrentTab(34);
      this.showSystemMenu = false;
    },
    // 重启设备
    handleRestartDev () {
      uni.closeSocket();
      getApp().globalData.FloatUniModule.rebootSystem();
    },
    // 重启应用
    handleRestartApp () {
      // #ifdef APP-PLUS
      plus.runtime.restart();
      // #endif
    },
    // 显示状态栏
    showNavigationBar () {
    },
    //隐藏状态栏
    hideNavigationBar () {
    },
    // 同步配置信息
    configInfoSync () {
      this.sysCacheInfo = "";
      // 加载系统缓存
      this.setAllSettingCache();
      // 同步认证终端信息
      this.AllBindInfoSync();
      this.showConfigInfo = false;
    },
    // 升级APP
    async getUpdateAppInfo (type) {
      let params = {
        data: {
          versionCode: plus.runtime.versionCode,
          deviceType: 3,
        },
      };
      let res = await Api.apiCall("post", Api.index.getUpdateInfo, params);
      if (res.state.code == "200") {
        switch (type) {
          case 0:
            this.appVersion = plus.runtime.version;
            if (res.data.status == 0) {
              this.updateNote = `当前已是最新版本！`;
              this.disabledClick = true;
            } else {
              this.updateNote = res.data.note;
              this.downloadUrl = res.data.url;
            }
            this.showUpdateApp = true;
            break;
          case 1:
            if (res.data.status == 0) {
              console.log("当前已是最新版本！");
            } else {
              this.downloadUrl = res.data.url;
              this.handleUpdateApp();
            }
            break;
        }
      }
    },
    // 下载更新APP
    handleUpdateApp () {
      plus.io.resolveLocalFileSystemURL(
        "/sdcard/Download/update.apk",
        (entry) => {
          console.log("安装包已存在");
          plus.io.resolveLocalFileSystemURL(
            "/sdcard/Download/update.apk",
            (entry) => {
              entry.remove(
                (res) => {
                  console.log("删除文件成功");
                  this.updateControl();
                },
                (err) => {
                  console.log("删除文件失败");
                }
              );
            }
          );
        },
        (err) => {
          console.log("文件夹为空");
          this.updateControl();
        }
      );
    },
    // 下载安装APP
    updateControl () {
      plus.nativeUI.showWaiting("安装包下载中，请稍候...");
      plus.downloader
        .createDownload(
          this.downloadUrl,
          { filename: "/sdcard/Download/update.apk" },
          (d, status) => {
            plus.nativeUI.closeWaiting();
            if (status == 200) {
              console.log("下载成功：" + d.filename);
              getApp().globalData.UpdateApp.install(d.filename, (res) => {
                Log.writeLog("【安装APP，updateApp.install()】", false);
                if (res.state) {
                  console.log("APP安装成功");
                } else {
                  console.log("APP安装失败");
                  Log.writeLog("APP安装失败", false);
                }
              });
            } else {
              console.log("安装包下载失败");
              Log.writeLog("安装包下载失败", false);
            }
          }
        )
        .start();
    },
    // 回声校准
    echoCalibrate () { },
    // 开启守护
    openCrashHandle () {
      getApp().globalData.FloatUniModule.openGuard(1);
      console.log("【开启守护成功，openCrashHandle()】");
      Log.writeLog("【开启守护成功，openCrashHandle()】", false);
    },
    // 关闭守护
    closeCrashHandle () {
      getApp().globalData.FloatUniModule.openGuard(0);
      console.log("【关闭守护成功，openCrashHandle()】");
      Log.writeLog("【关闭守护成功，closeCrashHandle()】", false);
    },
    // 点击打开设置
    onClickInitSet () {
      if (this.currentTab == 32) {
        if (this.clickNums == 3) {
          this.clickNums = 0;
          this.initState = true;
          this.showSystemPwd = true;
        } else {
          this.clickNums = this.clickNums + 1;
        }
      }
    },
    // 返回首页
    onClickHome () {
      clearInterval(this.timer);
      this.initCountTimer();
      if (this.person.id != "0999") {
        this.person.id = "";
        this.person.name = "";
        this.person.code = "";
        this.setPersonInfo({});
        this.setLoginState(false);
      }
      this.setCurrentTab(31);
    },
    // 页面回退
    onClickBack () {
      if (this.person.id != "0999") {
        this.person.id = "";
        this.person.name = "";
        this.person.code = "";
        this.setPersonInfo({});
        this.setLoginState(false);
      }
      this.initCountTimer();
      this.setCurrentTab(32);
    },
    // 下一步设置baseUrl
    setBaseUrl () {
      if (!isNullStr(this.baseUrl)) {
        uni.setStorageSync("baseUrl", this.baseUrl);
        this.closeModal("UrlConfig");
        this.openModal("CacheConfig");
        if (!uni.getStorageSync("adminPassword")) {
          uni.setStorageSync("adminPassword", "654321");
        }
      } else {
        uni.showToast({
          title: "url不能为空！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      }
    },
    // 加载系统缓存
    async setAllSettingCache () {
      if (!isNullStr(this.sysCacheInfo)) {
        return;
      }
      let res = await Api.apiCall("get", Api.index.getAllSetting, null, true);
      if (res.state.code == "200") {
        let data = res.data;
        data.map((item) => {
          if (item.skey) {
            let key = item.skey;
            uni.setStorageSync(`${key}`, item.svalue);
          }
        });
        this.sysCacheInfo = "配置系统缓存成功！";
        console.log("配置系统缓存成功！");
        this.handleShowToast("配置系统缓存成功！");
      } else {
        console.log("配置系统缓存失败！");
        this.handleShowToast("配置系统缓存成功！");
      }
    },
    // 认证终端信息
    async setAllBindInfo () {
      if (this.isWebSocketDisable) {
        this.handleShowToast("请勿重复认证！");
        return;
      }
      let params = {
        ip: this.terminalIP,
        terminalType: 1,
      };
      uni.setStorageSync("authTerminalIP", this.terminalIP);
      let res = await Api.apiCall(
        "get",
        Api.index.getTerminalInfo,
        params,
        true
      );
      if (res.state.code == "200") {
        if (!isNullStr(res.data)) {
          // 设置本地缓存公共方法
          this.setManagerStorage(res.data);
          if (!isNullStr(uni.getStorageSync("managerInfo").code)) {
            //初始化配置WS服务
            this.connectWebSocketInit(uni.getStorageSync("managerInfo").code);
          } else {
            uni.showToast({
              title: "缓存设置失败！！",
              image: "../../../static/images/common/error.png",
              icon: "none",
            });
          }
        } else {
          uni.showToast({
            title: "请先添加终端！",
            image: "../../../static/images/common/error.png",
            icon: "none",
          });
        }
      } else {
        uni.showToast({
          title: "认证终端信息失败！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      }
    },
    // 同步认证终端信息
    async AllBindInfoSync () {
      let params = {
        ip: this.terminalIP,
        terminalType: 1,
      };
      let res = await Api.apiCall(
        "get",
        Api.index.getTerminalInfo,
        params,
        true
      );
      if (res.state.code == "200") {
        if (!isNullStr(res.data)) {
          // 设置本地缓存公共方法
          this.setManagerStorage(res.data);
          this.handleShowToast("绑定终端信息成功！");
        } else {
          uni.showToast({
            title: "请先添加终端！",
            image: "../../../static/images/common/error.png",
            icon: "none",
          });
        }
      } else {
        uni.showToast({
          title: "认证终端信息失败！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      }
    },
    // 设置本地缓存公共方法
    setManagerStorage (data) {
      let managerInfo = {
        ...data,
        code: data.managerCode,
        name: data.managerName,
        ip: data.terminalIp,
        id: data.terminalId,
      };
      uni.setStorageSync("managerInfo", managerInfo);
    },
    // 关闭终端配置弹框
    closeCacheConfig () {
      if (isNullStr(this.sysCacheInfo)) {
        uni.showToast({
          title: "系统缓存为空！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      } else if (isNullStr(uni.getStorageSync("managerInfo"))) {
        uni.showToast({
          title: "终端信息为空！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      } else if (!getApp().globalData.webSocketConnected) {
        this.showVideoConnect = false;
        uni.showToast({
          title: "终端服务连接失败！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      } else {
        this.closeModal("CacheConfig");
        // #ifdef APP-PLUS
        plus.runtime.restart();
        // #endif
      }
    },
    // 发送WebSocket数据
    sendWebsocket (data) {
      this.socketTask.send({
        data: data,
        success (res) {
          console.log("消息发送成功:" + JSON.stringify(data));
        },
        fail (err) {
          console.log("消息发送失败:" + JSON.stringify(err));
          this.webSocketReConnct();
        },
      });
    },
    // 开始视频推流
    startLivePusher (pushUrl) {
      let subNVue = uni.getSubNVueById("livePusher");
      subNVue.show("fade-in", 200, () => {
        uni.$emit("live-push", {
          status: "start",
          url: pushUrl,
        });
      });
    },
    // 停止监视监听|广播推流
    stopLivePusher () {
      uni.$emit("stop-play");
      this.setPlayerUrl("");
      let subNVue = uni.getSubNVueById("livePusher");
      subNVue.show("fade-in", 200, () => {
        uni.$emit("live-push", {
          status: "stop",
        });
      });
    },
    // WebSocket初始连接
    connectWebSocketInit (code) {
      // 设备离线状态
      if (!getApp().globalData.webSocketConnected) {
        this.showVideoConnect = false;
        this.showDevOffline = true;
      } else {
        this.showDevOffline = false;
        return;
      }
      this.socketTask = uni.connectSocket({
        url: uni.getStorageSync("webSocketUrl") + code,
        success (res) { },
        fail (err) { },
      });
      this.socketTask.onOpen((res) => {
        this.handleShowToast("绑定终端信息成功！");
        this.webSocketOn();
        clearTimeout(this.socketTimer);
        clearTimeout(this.heartbeatTimer);
        // 重新获取电子水牌页数据
        setTimeout(() => {
          if (this.currentTab == 31) {
            this.$refs.main.refreshData(true);
          }
        }, 30000);
      });
      this.socketTask.onError((err) => {
        console.log(
          "连接失败，可能是websocket服务不可用，正在发起重连",
          JSON.stringify(err)
        );
        this.webSocketReConnct();
      });
      // 关闭WebSocket
      this.socketTask.onClose((res) => {
        console.log("检测到WebSocket连接关闭，正在发起重连！！");
        this.webSocketReConnct();
      });
      // 获取主机websocket数据
      this.socketTask.onMessage((res) => {
        let info = JSON.parse(res.data);
        console.log(JSON.stringify(info));
        if (info.type == this.$config.controlType.HEARTBEAT) {
          let { code, ip } = uni.getStorageSync("managerInfo");
          this.sendWebsocket(
            `{maindevno:'', devno:'${code}', type:'000', msg:'1',extend:{'ip':'${ip}'}}`
          );
          if (!isNullStr(this.heartbeatTimer)) {
            clearTimeout(this.heartbeatTimer);
          }
          this.heartbeatTimer = setTimeout(() => {
            this.webSocketReConnct();
          }, this.heartBeatTimeOut * 1000);
        } else if (info.type == this.$config.controlType.INTERCOM) {
          if (info.msg == "1") {
            // 挂断对讲
            this.resetIntercom();
            this.voiceBroadcast("对方已挂断！");
          } else if (info.msg == "2") {
            // 开启监视监听
          } else if (
            info.msg == "6" ||
            info.msg == "10" ||
            info.msg == "13" ||
            info.msg == "21"
          ) {
            // 视频通话无应答
            this.resetIntercom();
            this.voiceBroadcast("对方正忙，请稍后再拨！");
          } else if (info.msg == "8") {
            if (info.extend == "") {
              // 回传本机音量
              getApp().globalData.FloatUniModule.getStreamVolumeTypeVoiceCall(e => {
                this.sendWebsocket(
                  `{maindevno:'${info.maindevno}', devno:'${info.devno}', type:'100', msg:'9',extend:'${e.value}'}`
                );
              });
            } else {
              // 设置本机音量
              getApp().globalData.FloatUniModule.setStreamVolumeTypeVoiceCall(Number(info.extend));
            }
          } else if (info.msg == "9") {
            // 获取分机音量
            this.$refs.intercom.terminalVolume = Number(info.extend);
          } else if (info.msg == "11") {
            // 分机发起对讲请求（对讲声道占用，设备问题）
            this.setOpenIntercom(true);
            this.voiceBroadcast("正在发起视频通话");
          }
        } else if (info.type == this.$config.controlType.ALARM) {
          if (info.msg == "7") {
            getApp().globalData.HarUtils.switchCtrl(0, 0);
          } else if (info.msg == "8") {
            getApp().globalData.HarUtils.switchCtrl(0, 1);
          }
        } else if (info.type == this.$config.controlType.DEVICE) {
          let content = {
            content: info.extend,
          };
          if (info.msg == "0") {
            console.log("开始语音播报");
            getApp().globalData.Base.speech(content);
            Log.writeLog("this.$config.controlType.DEVICE,开始语音播报", false);
          } else if (info.msg == "1") {
            console.log("停止语音播报");
            getApp().globalData.Base.speechStop();
            Log.writeLog("this.$config.controlType.DEVICE,停止语音播报", false);
          } else if (info.msg == "2") {
            console.log("设备校时");
            getApp().globalData.FloatUniModule.setSystemTime(info.extend);
          } else if (info.msg == "3") {
            // 设备重启
            uni.closeSocket();
            getApp().globalData.FloatUniModule.rebootSystem();
          } else if (info.msg == "4") {
            if (!!info.extend) {
              let ids = info.extend;
              // 删除在押人员指纹ID
              this.delPrisonerFingerId(ids);
            }
          } else if (info.msg == "5") {
            // 同步民警指纹
            this.syncPoliceFinger();
          } else if (info.msg == "6") {
            // 同步配置信息
            this.configInfoSync();
          } else if (info.msg == "7") {
            // 自动升级APP
            this.getUpdateAppInfo(1);
          } else if (info.msg == "8") {
            // 应用重启
            // #ifdef APP-PLUS
            plus.runtime.restart();
            // #endif
          } else if (info.msg == "9") {
            if (this.currentTab == 31) {
              this.$refs.main.refreshData(true);
            }
          } else if (info.msg == "10") {
            // 回声消除
          } else if (info.msg == "11") {
            // 开启守护
            getApp().globalData.FloatUniModule.openGuard(1);
            console.log("开启守护成功");
          } else if (info.msg == "12") {
            // 关闭守护
            getApp().globalData.FloatUniModule.openGuard(0);
            console.log("关闭守护成功");
          } else if (info.msg == "13") {
            Log.uploadLogFile(content.content);
          } else if (info.msg == "15") {
            // 打开设备ADB
            getApp().globalData.UpdateApp.shell(
              {
                command: "start adbd",
                root: true,
              },
              (res) => {
                console.log("打开ADB：", JSON.stringify(res));
              }
            );
          } else if (info.msg == "16") {
            // 关闭设备ADB
            getApp().globalData.UpdateApp.shell(
              {
                command: "stop adbd",
                root: true,
              },
              (res) => {
                console.log("关闭ADB：", JSON.stringify(res));
              }
            );
          } else if (info.msg == "18") {
            this.setPersonInfo(this.$config.admin);
            this.person.id = this.$config.admin.rybh;
            this.person.name = this.$config.admin.name;
            this.person.code = this.$config.admin.code;
            this.setLoginState(true);
          } else if (info.msg == "19") {
            clearInterval(this.timer);
            this.initCountTimer();
            this.person.id = "";
            this.person.name = "";
            this.person.code = "";
            this.setPersonInfo({});
            this.setLoginState(false);
            this.setCurrentTab(31);
          }
        }
      });
    },
    webSocketReConnct () {
      clearInterval(this.socketTimer);
      clearTimeout(this.heartbeatTimer);
      // 重置会话，如不重置，重复创建会话对象，不知资源是否会释放
      if (this.socketTask != null) {
        this.socketTask.close({
          success: (res) => {
            console.log(JSON.stringify(res), "关闭WebSocket成功！");
          },
          fail: (err) => {
            console.log(JSON.stringify(err), "关闭WebSocket失败！");
          },
        });
        this.socketTask = null;
      }
      this.webSocketOff();
      this.showVideoConnect = false;
      this.reconnectCount++;
      this.socketTimer = setTimeout(() => {
        console.log(
          "create，清除this.socketTimer定时器，触发重连机制",
          uni.getStorageSync("managerInfo").code
        );
        this.connectWebSocketInit(uni.getStorageSync("managerInfo").code);
      }, this.websocketTime);
    },
    webSocketOff () {
      // 离线标记
      this.showDevOffline = true;
      // websocket 断开标记
      getApp().globalData.webSocketConnected = false;
      // 系统配置信息
      this.sysWebSocketInfo = "";
      // 打开重复认证终端
      this.isWebSocketDisable = false;
    },
    webSocketOn () {
      getApp().globalData.webSocketConnected = true;
      this.sysWebSocketInfo = "已连接";
      this.sysCacheInfo = "配置系统缓存成功！";
      // 禁用重复认证终端
      this.isWebSocketDisable = true;
      this.showDevOffline = false;
      this.reconnectCount = 0;
      console.log("WebSocket连接成功！");
      // 获取APP配置菜单
      this.getAppMenuList();
    },
    delPrisonerFingerId (ids) {
      // 打开指纹设备
      getApp().globalData.FloatUniModule.syncStartFinger(e => {
        if (e.code == 0) {
          let res = 0;
          for (let i = 0; i < ids.length; i++) {
            getApp().globalData.FloatUniModule.clearFingerprintById(ids[i]);
            Log.writeLog(
              "this.$config.controlType.DEVICE,删除民警指纹ID:" + ids[i],
              false
            );
            res++;
          }
          if (res > 0) {
            console.log("删除民警指纹成功！");
            Log.writeLog("删除民警指纹成功！", false);
          } else {
            console.log("删除民警指纹失败！");
            this.handleShowToast("删除民警指纹失败！");
          }
          getApp().globalData.FloatUniModule.syncStopFinger(e => {
            if (e.code == 0) {
              console.log("指纹设备已关闭");
              getApp().globalData.FloatUniModule.fingerModuleStop();
            }
          });
        } else {
          this.voiceBroadcast("指纹设备未打开");
          console.log("指纹设备未打开");
        }
      });
    },
    // 同步民警指纹信息
    syncPoliceFinger () {
      // 打开指纹设备
      getApp().globalData.FloatUniModule.syncStartFinger(e => {
        if (e.code == 0) {
          console.log("指纹设备已打开");
          getApp().globalData.FloatUniModule.clearAllFingerprint();
          // 同步民警信息
          this.syncPersonFingerInfo();
          console.log("删除全部指纹成功");
          Log.writeLog("删除全部指纹成功", false);
        } else {
          this.voiceBroadcast("指纹设备未打开");
          console.log("指纹设备未打开");
        }
      });
    },
    // 民警指纹信息
    async syncPersonFingerInfo () {
      let roomId = uni.getStorageSync("managerInfo").roomId;
      let res = await Api.apiCall("get", Api.index.getPoliceFingerInfo, {
        roomId,
      });
      if (res.state.code == "200") {
        if (res.data.length) {
          let successNum = 0,
            failNum = 0,
            successList = [],
            failList = [];
          res.data.map((item) => {
            if (!!item.mKey) {
              getApp().globalData.FloatUniModule.fingerprintFeatureInput(
                item.mKey,
                item.pHint
              );
              successNum++;
              successList.push(item.mKey);
            }
            if (!!item.mKey2) {
              getApp().globalData.FloatUniModule.fingerprintFeatureInput(
                item.mKey2,
                item.pHint2
              );
              successNum++;
              successList.push(item.mKey2);
            }
          });
          this.closeModal("PoliceFinger");
          console.log(`同步民警指纹成功${successNum}个，失败${failNum}个`);
          Log.writeLog(
            `同步民警指纹成功${successNum}个，失败${failNum}个`,
            false
          );
          this.handleShowToast(
            `同步民警指纹成功${successNum}个，失败${failNum}个`
          );
          let roomNo = uni.getStorageSync("managerInfo").roomNo;
          let content = `设备指纹特征同步结果：监室号：${roomNo}，成功：${successList}，失败：${failList}`;
          this.saveFingerStateInfo(content, "07");
        } else {
          this.closeModal("PoliceFinger");
          this.handleShowToast("同步民警指纹为空");
          console.log("民警指纹为空");
        }
        getApp().globalData.FloatUniModule.syncStopFinger(e => {
          if (e.code == 0) {
            console.log("指纹设备已关闭");
            getApp().globalData.FloatUniModule.fingerModuleStop();
          }
        });
      }
    },
    // 保存指纹同步状态（成功|失败）信息
    async saveFingerStateInfo (content, type) {
      let res = await Api.apiCall(
        "post",
        Api.index.saveFingerState + `?content=${content}&logType=${type}`,
        null
      );
      if (res.state.code == "200") {
        this.handleShowToast("保存同步指纹信息成功");
      }
    },
    // 获取指纹认证登录人员信息
    async getLoginPersonInfo (mKey) {
      let params = {
        roomId: uni.getStorageSync("managerInfo").roomId,
        mKey: mKey,
      };
      let url = Api.index.getOdsPoliceInfo;
      let res = await Api.apiCall("get", url, params, true);
      if (!this.showRecognitionDialogs) return;
      if (res.state.code == "200") {
        this.closeModal("RecognitionDialogs");
        this.initCountTimer();
        this.person.id = (res.data && res.data.rybh) || "";
        this.person.name = (res.data && res.data.name) || "";
        this.person.code = res.data.code;
        this.setPersonInfo(res.data);
        this.setLoginState(true);
        this.setCurrentTab(this.currentPage);
      }
    },
    // 设置人脸认证登录人员信息
    async faceVerificationLogin (res) {
      this.closeModal("RecognitionDialogs");
      this.initCountTimer();
      this.setPersonInfo(res);
      this.person.id = res.rybh;
      this.person.name = res.name;
      this.person.code = res.code;
      this.person.userId = res.userId;
      this.setLoginState(true);
      this.setCurrentTab(this.currentPage);
    },
    // 语音播放
    voiceBroadcast (voiceText) {
      let options = {
        content: voiceText,
      };
      let res = getApp().globalData.Base.speech(options);
      Log.writeLog("语音播放", false);
      if (res.code == 0) {
        // console.log("播报成功");
      } else {
        console.log("播报失败");
      }
    },
    // 值班室视频通话
    handleManagerCall () {
      if (!this.isRepeatState) {
        this.isRepeatState = true;
        setTimeout(() => {
          this.isRepeatState = false;
        }, 3000);
        if (!getApp().globalData.webSocketConnected) {
          this.showManagerCall = false;
          this.showVideoConnect = false;
          this.showDevOffline = true;
          return;
        }
        this.showManagerCall = false;
        this.showVideoConnect = true;
        let controlName = uni.getStorageSync("managerInfo").controlName;
        this.setIntercomName(controlName);
        this.setIntercomInfo({ id: 0, content: "值班室视频" });
        let manageInfo = uni.getStorageSync("managerInfo");
        this.sendWebsocket(
          `{maindevno:'${manageInfo.controlCode}', devno:'${manageInfo.code}', type:'100', msg:'19', extend:{'roomName':'${manageInfo.roomName}仓外屏','sipAccount':'${manageInfo.sipAccount}'}}`
        );
        this.voiceBroadcast("正在发起视频通话");
      }
    },
    // 监仓视频通话
    handleTerminalCall () {
      if (!this.isRepeatState) {
        this.isRepeatState = true;
        setTimeout(() => {
          this.isRepeatState = false;
        }, 3000);
        if (!getApp().globalData.webSocketConnected) {
          this.showTerminalCall = false;
          this.showVideoConnect = false;
          this.showDevOffline = true;
          return;
        }
        if (this.videoInfo.isFullScreen) {
          let videoContext = uni.createVideoContext(this.videoInfo.id);
          videoContext.exitFullScreen();
        }
        this.showTerminalCall = false;
        let managerCode = uni.getStorageSync("managerInfo").code;
        let terminalCode = uni.getStorageSync("managerInfo").terminalCode;
        this.terminalDeviceStatus(terminalCode, managerCode);
      }
    },
    // // 获取分机离线|对讲中状态
    async terminalDeviceStatus (terminalCode, managerCode) {
      let res = await Api.apiCall(
        "get",
        Api.index.terminalDeviceStatus +
        `?code=${terminalCode}&controlCode=${managerCode}`,
        null
      );
      if (res.state.code == "200") {
        let terminalName = uni.getStorageSync("managerInfo").roomName;
        switch (res.data.status) {
          case 0:
            this.voiceBroadcast(`${terminalName}已离线！`);
            break;
          case 1:
            this.sendWebsocket(
              `{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"23"}`
            );
            this.setIntercomName(terminalName);
            this.setIntercomInfo({ id: 1, content: "仓内屏视频" });
            let { controlSipAccount: masterNum, TerSipAccount: slaveNum } = uni.getStorageSync("managerInfo");
            console.log(masterNum, slaveNum);
            getApp().globalData.FloatUniModule.deviceClick(0, masterNum, slaveNum, 0);
            break;
          case 2:
            this.voiceBroadcast(`${terminalName}对讲中！`);
            break;
        }
      }
    },
    // 底栏注销
    handleLogout () {
      this.onClickHome();
    },
    // 底栏设置
    handleSetUp () {
      if (this.currentTab == 32) {
        this.setupState = true;
        this.showSystemPwd = !this.showSystemPwd;
      }
    },
    // 清理缓存
    clearALLCache () {
      const _this = this;
      uni.showModal({
        title: "提示",
        content: "是否确定清除App所有数据存储缓存？",
        success: function (res) {
          if (res.confirm) {
            uni.clearStorageSync();
            _this.sysCacheInfo = "";
            _this.webSocketOff();
            _this.socketTask.close({
              success: (res) => {
                console.log(JSON.stringify(res), "关闭WebSocket成功！");
              },
              fail: (err) => {
                console.log(JSON.stringify(err), "关闭WebSocket失败！");
              },
            });
          } else if (res.cancel) {
          }
        },
      });
    },
    // 新增(门磁门灯)动态信息
    async setDynamicInfo (status) {
      let content;
      let operationTime = dateFormat("YYYY-MM-DD", new Date());
      let controlId = uni.getStorageSync("managerInfo").controlId;
      let areaName = uni.getStorageSync("managerInfo").areaName;
      let roomName = uni.getStorageSync("managerInfo").roomName;
      if (status == 1) {
        content = `${areaName}${roomName}门已打开`;
      } else {
        content = `${areaName}${roomName}门已关闭`;
      }
      let params = {
        type: "700",
        controlId,
        operationTime,
        content,
      };
      let res = await Api.apiCall("post", Api.index.setDynamicInfo, params);
      if (res.state.code == "200") {
        this.handleShowToast("门磁门灯动态保存成功");
        // 推送主机(门磁门灯)动态消息
        this.sendMsgToControl();
      }
    },
    // 推送主机(门磁门灯)动态消息
    async sendMsgToControl () {
      let params = {
        type: "700",
        msg: "9",
        maindevno: "",
        devno: "",
        extend: "",
      };
      let controlCode = uni.getStorageSync("managerInfo").controlCode;
      await Api.apiCall(
        "post",
        Api.index.sendMsgToControl + `?devNo=${controlCode}`,
        params
      );
    },
    // 打开弹框
    openModal (type) {
      this[`show${type}`] = true;
    },
    // 关闭弹框
    closeModal (type) {
      this[`show${type}`] = false;
      this.intercomState = false;
      // 取消更新APP
      if (type == "UpdateApp") {
        this.disabledClick = false;
      }
      // 取消值班室视频通话
      if (type == "VideoConnect") {
        let managerCode = uni.getStorageSync("managerInfo").code;
        let controlCode = uni.getStorageSync("managerInfo").controlCode;
        this.sendWebsocket(
          `{maindevno:"${controlCode}",devno:"${managerCode}",type:"100",msg:"25"}`
        );
      }
    },
    // 切换登录模式回调
    switchRecognitionMode (mode) {
      this.initCountTimer();
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess (res) {
      if (!this.showRecognitionDialogs) return;
      this.getLoginPersonInfo(res.mKey);
    },
    // 人脸认证成功回调
    faceRecognitionSuccess (res) {
      if (!this.showRecognitionDialogs) return;
      this.faceVerificationLogin(res);
    },
    // 认证失败回调
    recognitionFail () {
      this.handleRecognitionDialogsClose();
    },
    // 登录弹框关闭回调
    handleRecognitionDialogsClose () {
      this.initCountTimer();
      this.closeModal("RecognitionDialogs");
      this.setCurrentTab(32);
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
