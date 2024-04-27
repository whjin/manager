<template>
  <div class="home-container">
    <nav-bar :showNavBar="showNavBar" :homeState="homeState && showHomeState" :backState="backState && showBackState"
      @click-init="onClickInitSet" @click-home="onClickHome" @click-back="onClickBack" />
    <div class="home-wrapper">
      <terminalMain v-if="currentTab == 1" ref="main"></terminalMain>
      <div v-else-if="currentTab == 2" class="police-container" @touchstart.stop="initCountTimer">
        <div class="police-content">
          <scroll-view scroll-y="true" class="police-scroll">
            <uni-grid :column="6" :show-border="false" :square="false">
              <uni-grid-item class="police-item" v-for="(item, index) in policeList" :key="index">
                <div class="police-list" :class="index % 2 ? 'bgStyle-two' : 'bgStyle-one'"
                  @click="handlePoliceClick(index)">
                  <image :src="item.image"></image>
                  <text>{{ item.name }}</text>
                </div>
              </uni-grid-item>
            </uni-grid>
          </scroll-view>
        </div>
      </div>
      <terminal-intercom v-else-if="currentTab == 3" ref="intercom"></terminal-intercom>
      <terminal-policeFingerprint v-else-if="currentTab == 4" ref="policeFingerprint"></terminal-policeFingerprint>
      <terminal-face v-else-if="currentTab == 5" ref="face"></terminal-face>
      <terminal-check v-else-if="currentTab == 6" ref="check"></terminal-check>
      <terminal-outRoomRegister v-else-if="currentTab == 7" ref="outRoomRegister"></terminal-outRoomRegister>
      <terminal-conditionReport v-else-if="currentTab == 8" ref="conditionReport"></terminal-conditionReport>
      <terminal-diagnosis v-else-if="currentTab == 9" ref="diagnosis"></terminal-diagnosis>
      <terminal-shopping v-else-if="currentTab == 10" ref="shopping"></terminal-shopping>
      <terminal-prisonerInfo v-else-if="currentTab == 11" ref="prisonerInfo"></terminal-prisonerInfo>
      <terminal-patrol v-else-if="currentTab == 12" ref="patrol"></terminal-patrol>
      <bottom-bar :showBottomBar="showBottomBar" :loginState="loginState" :name="person.name" :countdown="loginTimeout"
        @click-logout="handleLogout" @click-set="handleSetUp" />
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
          <view class="modal-horizontal-divider"></view>
          <view class="modal-baseurl-body">
            <view class="baseurl-content">
              <text class="baseurl-text">基础Url：</text>
              <input class="baseurl-input input-baseurl" v-model="baseUrl" placeholder="http://ip:port/" />
            </view>
            <view class="baseurl-btn-box">
              <view class="page-button" @click="setBaseUrl">下一步</view>
            </view>
            <view class="baseurl-clear" @click="clearALLCache">
              高科通信 V1.0.0
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
          <view class="modal-horizontal-divider"></view>
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
          <div class="modal-horizontal-divider"></div>
          <div class="videochat-cancel" @touchstart.stop="closeModal('VideoConnect')">
            <common-icons iconType="iconphonecancel" size="70" color="#ba242c" />
          </div>
        </div>
      </neil-modal>
      <!-- 密码验证 -->
      <keyboard :show="showSystemPwd" :failSystemPwd="failSystemPwd" ref="keyboard" @getPassword="getPassword"
        @hideKey="hideKeyModel"></keyboard>
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
              <li @click="policeFingerprintEnter">民警指纹录入</li>
              <div class="page-horizontal-divider"></div>
              <li @click="showPoliceFinger = true">同步民警指纹</li>
              <div class="page-horizontal-divider"></div>
              <li @click="showPrisonerFinger = true">同步在押人员指纹</li>
              <div class="page-horizontal-divider"></div>
              <li @click="showStatusBar">显示状态栏</li>
              <div class="page-horizontal-divider"></div>
              <li @click="hideStatusBar">隐藏状态栏</li>
              <div class="page-horizontal-divider"></div>
              <li @click="showRestartDev = true">设备重启</li>
              <div class="page-horizontal-divider"></div>
              <li @click="showRestartApp = true">应用重启</li>
              <div class="page-horizontal-divider"></div>
              <li @click="showConfigInfo = true">同步配置信息</li>
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
      <recognition-dialogs ref="recognitionDialogs" useFor="login" :isShow="showRecognitionDialogs" :role="loginRole"
        @fingerRecognitionSuccess="fingerRecognitionSuccess" @faceRecognitionSuccess="faceRecognitionSuccess"
        @close="handleRecognitionDialogsClose"></recognition-dialogs>
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
      <!-- 同步在押人员指纹弹框 -->
      <neil-modal :show="showPrisonerFinger">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否同步在押人员指纹？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('PrisonerFinger')">
              取消
            </div>
            <div class="btn-confirm" @touchstart.stop="syncPrisonerFinger">
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
import terminalPoliceFingerprint from "@/pages/police/fingerprint/fingerprint.vue";
import terminalPatrol from "@/pages/police/patrol/patrol.vue";
import { isNullStr, str2Array } from "@/common/utils/util.js";
import Api from "@/common/api.js";
import Log from "@/common/utils/log.js";
import { mapState, mapMutations } from "vuex";
import policeList from "@/static/mock/policeList.json";

// 指纹认证
const utils = uni.requireNativePlugin("Utils");
const sip = uni.requireNativePlugin("Sip");
// 升级APP
const updateApp = uni.requireNativePlugin("GK-UpdateApp");
// 看门狗
const crashHandle = uni.requireNativePlugin("CrashHandle");

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
    terminalPoliceFingerprint,
    terminalPatrol,
  },
  data() {
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
      policeList: policeList,
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
      // 同步在押人员指纹弹框
      showPrisonerFinger: false,
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
      // 设备连接状态
      isOpen: false,
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
      // 防止重复点击
      isRepeatState: false,
      // 按键对讲防抖
      keyRepeatState: false,
      // webSocket 会话对象
      socketTask: null,
      // 当前页面 用于登录成功后跳转
      currentPage: 2,
      // 登录人员身份 0：医务 1：管教
      loginRole: 1,
      // 音量增益状态
      micState: false,
      // socket重连次数
      reconnectCount: 0,
    };
  },
  computed: {
    ...mapState({
      // 当前页面
      currentTab: (state) => state.app.currentTab,
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
    showNavBar() {
      return this.currentTab > 1;
    },
    // 状态栏状态
    showBottomBar() {
      return this.currentTab > 1;
    },
    // 返回首页状态
    showHomeState() {
      return this.currentTab > 1 && this.currentTab != 3;
    },
    // 页面回退状态
    showBackState() {
      return this.currentTab > 3;
    },
    // 重连定时器间隔
    websocketTime() {
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
    terminalIP() {
      return (
        getApp().globalData.Base.getIpAddress().ip || this.$config.terminalIP
      );
    },
  },
  onLoad() {
    this.reconnectCount = 0;
    //初始化配置-基础Url
    if (isNullStr(uni.getStorageSync("baseUrl"))) {
      this.baseUrl = this.$config.baseUrl;
      this.openModal("UrlConfig");
    } else {
      this.baseUrl = uni.getStorageSync("baseUrl");
      // 同步配置信息
      this.configInfoSync();
      // #ifdef APP-PLUS
      const _this = this;
      // 监听对讲状态
      plus.globalEvent.removeEventListener("onCallStateChanged");
      plus.globalEvent.addEventListener("onCallStateChanged", (e) => {
        console.log("对讲状态：" + JSON.stringify(e));
        // 主机呼叫分机中，等待接听
        if (e.state === 1) {
          // SIP接听对讲
          if (sip.answer(e.address) === 0) {
            // 仓外屏拨通主机消息回传
            let managerCode = uni.getStorageSync("managerInfo").code;
            let controlCode = uni.getStorageSync("managerInfo").controlCode;
            _this.sendWebsocket(
              `{maindevno:"${controlCode}",devno:"${managerCode}",type:"100",msg:"20"}`
            );
            _this.handleManagerIntercom(_this);
            setTimeout(() => {
              _this.voiceBroadcast("请注意，已经开启视频对讲！");
            }, 1500);
          } else {
            _this.handleShowToast("SIP接听失败");
          }
        }
        if (e.state === 6) {
          // 仓外屏拨通仓内屏消息回传
          let managerCode = uni.getStorageSync("managerInfo").code;
          let terminalCode = uni.getStorageSync("managerInfo").terminalCode;
          _this.sendWebsocket(
            `{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"23"}`
          );
          _this.handleManagerIntercom(_this);
        }
        // 主机声音逻辑，接通后
        if (e.state === 7) {
          getApp().globalData.harUtils.outputTransition();
          getApp().globalData.harUtils.inputTransition();
          // 设置远端画面
          if (sip.setRemote() === 0) {
            console.log("设置远端画面成功");
            Log.writeLog("设置远端画面成功", false);
          } else {
            console.log("设置远端画面失败");
            Log.writeLog("设置远端画面失败", false);
            _this.handleShowToast("设置远端画面失败");
          }
          // 设置预览画面
          if (sip.setPreview() === 0) {
            console.log("预览画面成功");
            Log.writeLog("预览画面成功", false);
          } else {
            console.log("预览画面失败");
            _this.handleShowToast("预览画面失败");
          }
          // 设置音量增益
          if (!_this.micState) {
            _this.micState = true;
            getApp().globalData.harUtils.setAdcBoost(
              uni.getStorageSync("audioMICValue")
            );
          }
        }
        // 对讲关闭或出错
        if (e.state === 12 || e.state === 13) {
          // 挂断对讲
          _this.closeVideoChat(_this);
        }
      });
      // 视频对讲按键事件监听
      plus.globalEvent.removeEventListener("key");
      plus.globalEvent.addEventListener("key", function (e) {
        console.log("对讲按键状态：" + JSON.stringify(e));
        if (e.value) {
          if (!getApp().globalData.webSocketConnected) {
            _this.showDevOffline = true;
            return;
          }
          if (!_this.keyRepeatState) {
            _this.keyRepeatState = true;
            setTimeout(() => {
              _this.keyRepeatState = false;
            }, 10000);
            if (_this.currentTab != 3) {
              // 监仓视频通话
              _this.handleTerminalCall();
              _this.showRecognitionDialogs = false;
              _this.showManagerCall = false;
              if (_this.showVideoConnect) {
                _this.closeModal("VideoConnect");
              }
              _this.showSystemPwd = false;
              _this.showUrlConfig = false;
              _this.showCacheConfig = false;
              _this.showSystemMenu = false;
              _this.showPoliceFinger = false;
              _this.showPrisonerFinger = false;
              _this.showRestartDev = false;
              _this.showRestartApp = false;
              _this.showConfigInfo = false;
              _this.showUpdateApp = false;
            }
          }
        }
      });
      // 监听刷卡事件
      getApp().globalData.cardManager.startReadCard((result) => {
        let res = JSON.parse(result);
        console.log("刷卡状态：" + JSON.stringify(res));
        if (res.code == 0) {
          if (_this.currentPage >= 5) {
            let cardNo = res.cardData.cardNum.replace(/\s/g, "");
            _this.getPoliceByCardNum(cardNo);
          }
        }
      });
      // #endif
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
  destroyed() {
    this.clickNums = 0;
    uni.hideToast();
  },
  methods: {
    ...mapMutations({
      // 设置当前页面
      setCurrentTab: "app/SET_CURRENTTAB",
      // 认证人员信息
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
    // 仓外屏视频通话
    handleManagerIntercom(_this) {
      clearInterval(_this.timer);
      _this.showVideoConnect = false;
      _this.setOpenIntercom(true);
      getApp().globalData.harUtils.setIsSpeak(1);
      getApp().globalData.harUtils.setVolume(
        0,
        uni.getStorageSync("mediaDefaultVolume")
      );
      _this.handleShowToast("正在加载对讲画面，请稍候...", "center", 5000);
      // 跳转进入视频对讲页面
      _this.setCurrentTab(3);
      uni.getSubNVueById("sipRemote").show();
      uni.getSubNVueById("sipPreview").show();
      uni.getSubNVueById("sipRemote").setStyle({
        width: "996px",
        height: "598px",
        top: "288px",
        left: "60px",
      });
      uni.getSubNVueById("sipPreview").setStyle({
        top: "673px",
        left: "356px",
        top: "288px",
        left: "1132px",
      });
    },
    // 挂断视频通话
    closeVideoChat(_this) {
      _this.setOpenIntercom(false);
      _this.intercomState = false;
      _this.showVideoConnect = false;
      _this.micState = false;
      uni.getSubNVueById("sipRemote").hide();
      uni.getSubNVueById("sipPreview").hide();
      if (_this.currentTab == 3) {
        _this.$refs.intercom.stopTalkTimer();
        _this.$refs.intercom.hangupMsgHandler();
      }
      getApp().globalData.harUtils.setIsSpeak(0);
      _this.setCurrentTab(2);
    },
    // 重置倒计时
    initCountTimer() {
      this.loginTimeout = uni.getStorageSync("loginTimeout") || 30;
    },
    // 重置其他倒计时长
    initSpecialTimeout() {
      this.loginTimeout = uni.getStorageSync("specialLoginTimeout") || 120;
    },
    // 倒计时
    countTimer() {
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
          this.currentPage = 1;
          this.setCurrentTab(1);
        }
      }, 1000);
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
    // 切换民警子模块
    handlePoliceClick(index) {
      this.handleHomeModal(this.policeList[index]);
    },
    // 子模块路由跳转
    handleHomeModal(item) {
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
    getPassword(e) {
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
    hideKeyModel() {
      this.initState = false;
      this.setupState = false;
      this.showSystemPwd = false;
    },
    // 民警指纹录入页面
    policeFingerprintEnter() {
      this.currentPage = 4;
      this.setCurrentTab(4);
      this.showSystemMenu = false;
    },
    // 设备重启
    handleRestartDev() {
      uni.closeSocket();
      utils.reboot();
      Log.writeLog("【手动重启设备，reboot()】", false);
    },
    // 应用重启
    handleRestartApp() {
      getApp().globalData.harUtils.showStatusBar();
      if (this.videoInfo.isFullScreen) {
        let videoContext = uni.createVideoContext(this.videoInfo.id);
        videoContext.exitFullScreen();
      }
      // #ifdef APP-PLUS
      plus.runtime.restart();
      // #endif
    },
    // 显示状态栏
    showStatusBar() {
      getApp().globalData.harUtils.showStatusBar();
    },
    //隐藏状态栏
    hideStatusBar() {
      getApp().globalData.harUtils.hideStatusBar();
    },
    // 同步配置信息
    configInfoSync() {
      this.sysCacheInfo = "";
      // 加载系统缓存
      this.setAllSettingCache();
      // 同步认证终端信息
      this.AllBindInfoSync();
      this.showConfigInfo = false;
    },
    // 升级APP
    async getUpdateAppInfo(type) {
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
    handleUpdateApp() {
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
    updateControl() {
      plus.nativeUI.showWaiting("安装包下载中，请稍候...");
      plus.downloader
        .createDownload(
          this.downloadUrl,
          { filename: "/sdcard/Download/update.apk" },
          (d, status) => {
            plus.nativeUI.closeWaiting();
            if (status == 200) {
              console.log("下载成功：" + d.filename);
              updateApp.install(d.filename, (res) => {
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
    echoCalibrate() {
      sip.startEchoCancellerCalibration();
      console.log("【回声校准成功，echoCalibrate()】");
    },
    // 开启守护
    openCrashHandle() {
      crashHandle.startGuard(10000); //启动守护，0-不轮询
      console.log("【开启守护成功，openCrashHandle()】");
    },
    // 关闭守护
    closeCrashHandle() {
      crashHandle.startGuard(0); //启动守护，0-不轮询
      console.log("【关闭守护成功，openCrashHandle()】");
    },
    // 点击打开设置
    onClickInitSet() {
      if (this.currentTab == 2) {
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
    onClickHome() {
      clearInterval(this.timer);
      this.initCountTimer();
      if (this.person.id != "0999") {
        this.person.id = "";
        this.person.name = "";
        this.person.code = "";
        this.setPersonInfo({});
        this.setLoginState(false);
      }
      this.currentPage = 1;
      this.setCurrentTab(1);
    },
    // 页面回退
    onClickBack() {
      if (this.person.id != "0999") {
        this.person.id = "";
        this.person.name = "";
        this.person.code = "";
        this.setPersonInfo({});
        this.setLoginState(false);
      }
      this.initCountTimer();
      this.currentPage = 2;
      this.setCurrentTab(2);
    },
    // 下一步设置baseUrl
    setBaseUrl() {
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
    async setAllSettingCache() {
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
    async setAllBindInfo() {
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
    async AllBindInfoSync() {
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
    setManagerStorage(data) {
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
    closeCacheConfig() {
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
        getApp().globalData.harUtils.showStatusBar();
        // #ifdef APP-PLUS
        plus.runtime.restart();
        // #endif
      }
    },
    // 发送WebSocket数据
    sendWebsocket(data) {
      this.socketTask.send({
        data: data,
        success(res) {
          console.log("消息发送成功:" + JSON.stringify(data));
        },
        fail(err) {
          console.log("消息发送失败:" + JSON.stringify(err));
          this.webSocketReConnct();
        },
      });
    },
    // WebSocket初始连接
    connectWebSocketInit(code) {
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
        success(res) { },
        fail(err) { },
      });
      this.socketTask.onOpen((res) => {
        this.handleShowToast("绑定终端信息成功！");
        this.webSocketOn();
        clearTimeout(this.socketTimer);
        clearTimeout(this.heartbeatTimer);
        console.log("WebSocket连接成功！");
        // 重新获取电子水牌页数据
        setTimeout(() => {
          if (this.currentTab == 1) {
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
          const { code } = uni.getStorageSync("managerInfo");
          this.sendWebsocket(
            `{maindevno:'', devno:'${code}', type:'000', msg:'1',extend:{'ip':'${this.terminalIP}'}}`
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
          } else if (info.msg == "2") {
            // 开启监视监听
          } else if (
            info.msg == "6" ||
            info.msg == "10" ||
            info.msg == "13" ||
            info.msg == "21"
          ) {
            // 视频通话无应答
            this.intercomState = false;
            this.showVideoConnect = false;
            this.setOpenIntercom(false);
            this.voiceBroadcast("对方正忙，请稍后再拨！");
          } else if (info.msg == "11") {
            // 分机发起对讲请求（对讲声道占用，设备问题）
            this.setOpenIntercom(true);
            this.voiceBroadcast("正在发起视频通话");
          }
        } else if (info.type == this.$config.controlType.ALARM) {
          if (info.msg == "7") {
            getApp().globalData.harUtils.switchCtrl(0, 0);
          } else if (info.msg == "8") {
            getApp().globalData.harUtils.switchCtrl(0, 1);
          }
        } else if (info.type == this.$config.controlType.DEVICE) {
          let content = {
            content: info.extend,
          };
          // 建立连接后打开音频IO
          getApp().globalData.harUtils.openAudioIO();
          Log.writeLog(
            "this.$config.controlType.DEVICE,打开openAudioIO",
            false
          );
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
            utils.setTime(info.extend);
            Log.writeLog("this.$config.controlType.DEVICE,设备校时", false);
          } else if (info.msg == "3") {
            // 设备重启
            sip.logout();
            uni.closeSocket();
            utils.reboot();
            Log.writeLog("this.$config.controlType.DEVICE,设备重启", false);
          } else if (info.msg == "4") {
            if (!!info.extend) {
              let ids = info.extend;
              // 删除在押人员指纹ID
              this.delPrisonerFingerId(ids);
            } else {
              // 同步在押人员指纹
              this.syncPrisonerFinger();
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
            sip.logout();
            Log.writeLog("this.$config.controlType.DEVICE,sip.logout()", false);
            getApp().globalData.harUtils.showStatusBar();
            if (this.videoInfo.isFullScreen) {
              let videoContext = uni.createVideoContext(this.videoInfo.id);
              videoContext.exitFullScreen();
            }
            // 应用重启
            // #ifdef APP-PLUS
            plus.runtime.restart();
            // #endif
          } else if (info.msg == "9") {
            if (this.currentTab == 1) {
              this.$refs.main.refreshData(true);
            }
          } else if (info.msg == "10") {
            // 回声消除
            sip.startEchoCancellerCalibration();
            console.log("回声校准成功");
            Log.writeLog("回声校准成功", false);
          } else if (info.msg == "11") {
            // 开启守护
            crashHandle.startGuard(10000); //启动守护，0-不轮询
            Log.writeLog("开启守护成功", false);
          } else if (info.msg == "12") {
            // 关闭守护
            crashHandle.startGuard(0); //启动守护，0-不轮询
            Log.writeLog("关闭守护成功", false);
          } else if (info.msg == "13") {
            Log.uploadLogFile(content.content);
          } else if (info.msg == "15") {
            // 打开设备ADB
            updateApp.shell(
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
            updateApp.shell(
              {
                command: "stop adbd",
                root: true,
              },
              (res) => {
                console.log("关闭ADB：", JSON.stringify(res));
              }
            );
          } else if (info.msg == "18") {
            if (Reflect.has(info, "extend")) {
              let extend = JSON.parse(info.extend);
              this.setPersonInfo(extend);
              this.person.name = extend.name;
              this.person.id = extend.rybh;
            } else {
              let admin = {
                name: "管理员",
                dabh: "099",
                rybh: "0999",
                code: "09999",
              };
              this.setPersonInfo(admin);
              this.person.name = admin.name;
              this.person.id = admin.rybh;
              this.person.code = admin.code;
            }
            this.setLoginState(true);
            this.setCurrentTab(2);
          } else if (info.msg == "19") {
            clearInterval(this.timer);
            this.initCountTimer();
            this.person.id = "";
            this.person.name = "";
            this.person.code = "";
            this.setPersonInfo({});
            this.setLoginState(false);
            this.currentPage = 1;
            this.setCurrentTab(1);
          }
        }
      });
    },
    webSocketReConnct() {
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
    webSocketOff() {
      // 离线标记
      this.showDevOffline = true;
      // websocket 断开标记
      getApp().globalData.webSocketConnected = false;
      // 系统配置信息
      this.sysWebSocketInfo = "";
      // 打开重复认证终端
      this.isWebSocketDisable = false;
    },
    webSocketOn() {
      getApp().globalData.webSocketConnected = true;
      this.sysWebSocketInfo = "已连接";
      this.sysCacheInfo = "配置系统缓存成功！";
      // 禁用重复认证终端
      this.isWebSocketDisable = true;
      this.showDevOffline = false;
      this.reconnectCount = 0;
    },
    // 删除在押人员指纹
    delPrisonerFingerId(ids) {
      this.initFingerPrint();
      setTimeout(() => {
        if (this.isOpen) {
          let res = 0;
          for (let i = 0; i < ids.length; i++) {
            getApp().globalData.fingerprint.deleteID(ids[i]);
            Log.writeLog(
              "this.$config.controlType.DEVICE,删除在押人员指纹ID:" + ids[i],
              false
            );
            res++;
          }
          if (res > 0) {
            console.log("删除在押人员指纹成功！");
            Log.writeLog("删除在押人员指纹成功！", false);
          } else {
            console.log("删除在押人员指纹失败！");
            this.handleShowToast("删除在押人员指纹失败！");
          }
          getApp().globalData.fingerprint.close();
          this.isOpen = false;
        } else {
          console.log("请先连接设备！");
        }
      }, 1500);
    },
    // 同步民警指纹信息
    syncPoliceFinger() {
      this.initFingerPrint();
      setTimeout(() => {
        if (this.isOpen) {
          // 获取民警信息
          this.getPoliceFingerInfo();
        } else {
          console.log("请先连接设备");
        }
      }, 1500);
    },
    // 民警指纹信息
    async getPoliceFingerInfo() {
      let params = {
        roomId: uni.getStorageSync("managerInfo").roomId,
      };
      let res = await Api.apiCall("get", Api.index.getPoliceFingerInfo, params);
      if (res.state.code == "200") {
        let successNum = 0,
          failNum = 0,
          successList = [],
          failList = [];
        if (res.data.length) {
          let state = res.data.every(item => !item.mKey && !item.mKey2);
          if (state) {
            getApp().globalData.fingerprint.deleteAll();
            console.log("删除全部指纹成功");
          } else {
            res.data.map((item) => {
              if (!!item.mKey) {
                getApp().globalData.fingerprint.deleteID(item.mKey);
                let result1 = getApp().globalData.fingerprint.setTemplate(
                  item.mKey,
                  str2Array(item.pHint)
                );
                Log.writeLog(
                  "同步民警指纹信息setTemplate()key:" + item.mKey,
                  false
                );
                if (!result1) {
                  successNum++;
                  successList.push(item.mKey);
                } else {
                  failNum++;
                  failList.push(item.mKey);
                }
              }
              if (!!item.mKey2) {
                getApp().globalData.fingerprint.deleteID(item.mKey2);
                let result2 = getApp().globalData.fingerprint.setTemplate(
                  item.mKey2,
                  str2Array(item.pHint2)
                );
                Log.writeLog(
                  "同步民警指纹信息setTemplate()key:" + item.mKey2,
                  false
                );
                if (!result2) {
                  successNum++;
                  successList.push(item.mKey2);
                } else {
                  failNum++;
                  failList.push(item.mKey2);
                }
              }
            });
          }
        }
        this.closeModal("PoliceFinger");
        console.log(`同步民警指纹成功${successNum}个，失败${failNum}个`);
        Log.writeLog(
          `同步民警指纹成功${successNum}个，失败${failNum}个`,
          false
        );
        this.handleShowToast(
          `同步民警指纹成功${successNum}个，失败${failNum}个`
        );
        getApp().globalData.fingerprint.close();
        Log.writeLog("同步民警指纹成功，关闭指纹设备:", false);
        this.isOpen = false;
        let roomNo = uni.getStorageSync("managerInfo").roomNo;
        let content = `设备指纹特征同步结果：监室号：${roomNo}，成功：${successList}，失败：${failList}`;
        this.saveFingerStateInfo(content, "07");
      }
    },
    // 同步在押人员指纹
    syncPrisonerFinger() {
      this.initFingerPrint();
      setTimeout(() => {
        if (this.isOpen) {
          // 同步在押人员信息
          this.syncPersonFingerInfo();
        } else {
          console.log("请先连接设备");
        }
      }, 1500);
    },
    // 同步在押人员指纹信息
    async syncPersonFingerInfo() {
      let { roomNo } = uni.getStorageSync("managerInfo");
      let res = await Api.apiCall(
        "get",
        Api.index.syncRoomPersonFingerInfo,
        { roomNo }
      );
      if (res.state.code == 200) {
        let successNum = 0,
          failNum = 0,
          successList = [],
          failList = [];
        if (res.data.length) {
          res.data.map((item) => {
            if (!!item.mKey) {
              getApp().globalData.fingerprint.deleteID(item.mKey);
              let result = getApp().globalData.fingerprint.setTemplate(
                item.mKey,
                str2Array(item.pHint)
              );
              if (!result) {
                successNum++;
                successList.push(item.mKey);
              } else {
                failNum++;
                failList.push(item.mKey);
              }
            }
          });
        } else {
          getApp().globalData.fingerprint.deleteAll();
          console.log("删除全部指纹成功");
        }
        this.closeModal("PrisonerFinger");
        console.log(`同步在押人员指纹成功${successNum}个，失败${failNum}个`);
        this.handleShowToast(
          `同步在押人员指纹成功${successNum}个，失败${failNum}个`
        );
        getApp().globalData.fingerprint.close();
        this.isOpen = false;
        let content = `设备指纹特征同步结果：监室号：${roomNo}，成功：${successList}，失败：${failList}`;
        this.saveFingerStateInfo(content, "06");
      }
    },
    // 保存指纹同步状态（成功|失败）信息
    async saveFingerStateInfo(content, type) {
      let res = await Api.apiCall(
        "post",
        Api.index.saveFingerState + `?content=${content}&logType=${type}`,
        null
      );
      if (res.state.code == "200") {
        this.handleShowToast("保存同步指纹信息成功");
      }
    },
    // 设备连接
    initFingerPrint() {
      if (!this.isOpen) {
        getApp().globalData.fingerprint.init((result) => {
          Log.writeLog("指纹设备连接init()", false);
          if (result == 0) {
            this.isOpen = true;
            console.log("设备已连接");
          } else {
            console.log("设备连接失败");
          }
        });
      }
    },
    // 切换登录模式回调
    switchRecognitionMode(mode) {
      this.initCountTimer();
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess(res) {
      if (!this.showRecognitionDialogs) return;
      this.getLoginPersonInfo(res);
    },
    // 人脸认证成功回调
    faceRecognitionSuccess(res) {
      if (!this.showRecognitionDialogs) return;
      this.faceVerificationLogin(res);
    },
    // 认证失败回调
    recognitionFail() {
      this.handleRecognitionDialogsClose();
    },
    // 登录弹框关闭回调
    handleRecognitionDialogsClose() {
      this.initCountTimer();
      this.closeModal("RecognitionDialogs");
      this.currentPage = 2;
      this.setCurrentTab(2);
    },
    // 刷卡获取民警信息
    async getPoliceByCardNum(cardNo) {
      let res = await Api.apiCall(
        "get",
        Api.police.getUserByCardNum + cardNo,
        null
      );
      if (res.state.code == 200) {
        this.policePermissionHandler(res.data, 1);
      }
    },
    // 设置人脸认证登录人员信息
    faceVerificationLogin(data) {
      this.policePermissionHandler(data, 2);
    },
    // 获取指纹认证登录人员信息
    async getLoginPersonInfo(data) {
      let params = {
        mKey: data.mKey,
      };
      let url = "";
      if (data.useFor == "outroom") {
        params.roomNo = uni.getStorageSync("managerInfo").roomNo;
        url = Api.index.getOdsPrisonerInfo;
      } else {
        params.roomId = uni.getStorageSync("managerInfo").roomId;
        url = Api.index.getOdsPoliceInfo;
      }
      let res = await Api.apiCall("get", url, params, true);
      if (res.state.code == 200) {
        if (Reflect.has(res, "data") && Object.keys(res.data).length) {
          this.policePermissionHandler(res.data, 3);
          this.voiceBroadcast("指纹识别成功");
        } else {
          this.voiceBroadcast("指纹识别失败");
        }
      }
    },
    // 认证登录权限处理
    policePermissionHandler(data, type) {
      if (Object.keys(data).length) {
        this.closeModal("RecognitionDialogs");
        this.initCountTimer();
        if (data.idProperty == "1") {
          this.setPoliceInfo(data, type);
        } else if (data.idProperty == "2") {
          if ([7, 8].includes(this.currentPage)) {
            this.setPoliceInfo(data, type);
          } else {
            this.handleShowToast("没有操作权限");
          }
        } else {
          this.handleShowToast("没有操作权限");
        }
      }
    },
    // 设置民警/辅警登录信息
    setPoliceInfo(data, type) {
      if (type == 1) {
        // 刷卡
        this.handleShowToast("刷卡成功");
        const { accountName: code, name } = data;
        this.setPersonInfo(Object.assign(data, { code }));
        this.person.id = code;
        this.person.name = name;
      } else {
        // 人脸|指纹
        const { userId, name } = data;
        this.setPersonInfo(data);
        this.person.id = userId;
        this.person.name = name;
      }
      this.setLoginState(true);
      this.setCurrentTab(this.currentPage);
    },
    // 语音播放
    voiceBroadcast(voiceText) {
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
    handleManagerCall() {
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
        let managerCode = uni.getStorageSync("managerInfo").code;
        let controlCode = uni.getStorageSync("managerInfo").controlCode;
        let manageInfo = uni.getStorageSync("managerInfo");
        this.sendWebsocket(
          `{maindevno:'${controlCode}', devno:'${managerCode}', type:'100', msg:'19', extend:{'roomName':'${manageInfo.roomName}仓外屏','sipAccount':'${manageInfo.sipAccount}'}}`
        );
        this.voiceBroadcast("正在发起视频通话");
      }
    },
    // 监仓视频通话
    handleTerminalCall() {
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
        let managerCode = uni.getStorageSync("managerInfo").code;
        let terminalCode = uni.getStorageSync("managerInfo").terminalCode;
        this.terminalDeviceStatus(terminalCode, managerCode);
        this.showTerminalCall = false;
      }
    },
    // // 获取分机离线|对讲中状态
    async terminalDeviceStatus(code, controlCode) {
      let res = await Api.apiCall(
        "get",
        Api.index.terminalDeviceStatus +
        `?code=${code}&controlCode=${controlCode}`,
        null
      );
      if (res.state.code == "200") {
        let terminalName = uni.getStorageSync("managerInfo").roomName;
        switch (res.data.status) {
          case 0:
            this.voiceBroadcast(`${terminalName}已离线！`);
            break;
          case 1:
            let TerSipAccount = uni.getStorageSync("managerInfo").TerSipAccount;
            this.setIntercomName(terminalName);
            this.setIntercomInfo({ id: 1, content: "仓内屏视频" });
            if (sip.call(TerSipAccount) === 0) {
              console.log("SIP呼叫成功");
              Log.writeLog("SIP呼叫成功", false);
            } else {
              console.log("SIP呼叫失败");
              Log.writeLog("SIP呼叫失败", false);
            }
            break;
          case 2:
            this.voiceBroadcast(`${terminalName}对讲中！`);
            break;
        }
      }
    },
    // 底栏注销
    handleLogout() {
      this.onClickHome();
    },
    // 底栏设置
    handleSetUp() {
      if (this.currentTab == 2) {
        this.setupState = true;
        this.showSystemPwd = !this.showSystemPwd;
      }
    },
    // 清理缓存
    clearALLCache() {
      uni.showModal({
        title: "提示",
        content: "是否确定清除App所有数据存储缓存？",
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync();
            this.sysCacheInfo = "";
            this.webSocketOff();
            if (this.socketTask) {
              this.socketTask.close({
                success: (res) => {
                  console.log(JSON.stringify(res), "关闭WebSocket成功！");
                },
                fail: (err) => {
                  console.log(JSON.stringify(err), "关闭WebSocket失败！");
                },
              });
            }
          } else if (res.cancel) {
          }
        },
      });
    },
    // 打开弹框
    openModal(type) {
      this[`show${type}`] = true;
    },
    // 关闭弹框
    closeModal(type) {
      this[`show${type}`] = false;
      // 取消更新APP
      if (type == "UpdateApp") {
        this.disabledClick = false;
      }
      // 取消值班室对讲
      if (type == "ManagerCall") {
        this.intercomState = false;
      }
      // 取消设备重启
      if (type == "RestartDev") {
        this.intercomState = false;
      }
      // 取消值班室视频通话
      if (type == "VideoConnect") {
        this.intercomState = false;
        let managerCode = uni.getStorageSync("managerInfo").code;
        let controlCode = uni.getStorageSync("managerInfo").controlCode;
        this.sendWebsocket(
          `{maindevno:"${controlCode}",devno:"${managerCode}",type:"100",msg:"25"}`
        );
      }
    },
  },
};
</script>

<style lang="less">
@import "../../../common/less/index.less";
</style>
