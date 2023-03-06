<template>
  <div class="intercom-container">
    <div class="intercom-wrapper">
      <div class="intercom-header">正在与{{ intercomName }}视频通话</div>
      <div class="intercom-box">
        <div class="intercom-left">
          <div class="intercom-title">{{ intercomInfo.content }}</div>
          <div class="intercom-terminal" v-if="!openIntercom">
            <common-icons iconType="iconvideorecord" size="80" color="#5c748e" />
          </div>
        </div>
        <div class="intercom-right">
          <div class="intercom-manager">
            <div class="manager-title">仓外屏视频</div>
            <div class="manager-content" v-if="!openIntercom">
              <common-icons iconType="iconvideorecord" size="80" color="#5c748e" />
            </div>
          </div>
          <div class="manager-bottom">
            <div class="manager-talktime">
              通话时间：<text>{{ talkCountTime }}</text>
            </div>
            <div class="manager-button" :class="{ 'manager-disabled': !openIntercom }">
              <div class="button" @click="volumeControl">调节音量</div>
              <div class="button" @click="handleVideoMute">
                {{ isMute ? "关闭静音" : "开启静音" }}
              </div>
              <div class="button" @click="hangupIntercom">挂断</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="neil-modal-container">
      <!-- 调节音量弹框 -->
      <neil-modal :show="showVolume">
        <div class="volume-modal-box">
          <div class="modal-header">
            <div class="modal-title">音量调节</div>
            <div class="modal-close" @click="closeModal('Volume')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <div class="volume-modal-content">
            <div class="volume-modal-section">
              <div class="volume-text">本机音量</div>
              <common-icons type="iconvolume" size="32" color="#fff"></common-icons>
              <div class="volume-slider">
                <slider :value="managerVolume" min="0" max="100" show-value block-size="46" @change="setManagerVolume" />
              </div>
            </div>
            <div class="volume-modal-section" v-show="intercomInfo.id==1">
              <div class="volume-text">分机音量</div>
              <common-icons type="iconvolume" size="32" color="#fff"></common-icons>
              <div class="volume-slider">
                <slider :value="terminalVolume" min="0" max="100" show-value block-size="46" @change="setTerminalVolume" />
              </div>
            </div>
          </div>
          <div class="volume-modal-btn">
            <div class="cancel-btn" @click="closeModal('Volume')">
              <span>取消</span>
            </div>
            <div class="confirm-btn" @click="intercomVolume">
              <span>确认</span>
            </div>
          </div>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import commonIcons from "@/components/common-icons/common-icons.vue";
import neilModal from "@/components/neil-modal/neil-modal.vue";
import { mapState, mapMutations } from "vuex";
import { showNum } from "@/common/utils/util.js";

export default {
  name: "intercom",
  components: {
    commonIcons,
    neilModal,
  },
  data () {
    return {
      // 通话定时器
      talkTimer: null,
      // 通话时间
      talkCountTime: "00:00:00",
      // 是否静音
      isMute: false,
      // 调节音量弹框
      showVolume: false,
      // 本机音量值
      managerVolume: 20,
      // 分机音量值
      terminalVolume: 20,
      // 禁止重复操作
      isRepeatState: false,
    };
  },
  computed: {
    ...mapState({
      // 视频对讲状态
      openIntercom: (state) => state.app.openIntercom,
      // 视频对讲提示
      intercomName: (state) => state.app.intercomName,
      // 视频对讲信息
      intercomInfo: (state) => state.app.intercomInfo,
    }),
  },
  mounted () {
    // 通话计时
    this.setTalkTime();
  },
  beforeDestroy () {
    this.hangupIntercom();
  },
  destroyed () {
    this.cleanIntercomInfo();
  },
  methods: {
    ...mapMutations({
      // 设置对讲远端目标地址
      setAioRemoteTarget: "app/SET_AIOREMOTETARGET",
      // 设置对讲本地目标地址
      setAioPreviewTarget: "app/SET_AIOPREVIEWTARGET",
    }),
    // 通话时长
    setTalkTime () {
      let countTime = 0,
        hours = "",
        minutes = "",
        seconds = "";
      this.talkTimer = setInterval(() => {
        countTime++;
        hours = showNum(parseInt(countTime / 3600));
        minutes = showNum(parseInt(countTime / 60) % 60);
        seconds = showNum(countTime % 60);
        this.talkCountTime = `${hours}:${minutes}:${seconds}`;
      }, 1000);
    },
    // 清理对讲信息
    cleanIntercomInfo () {
      clearInterval(this.talkTimer);
      this.setAioRemoteTarget("");
      this.setAioPreviewTarget("");
      uni.getSubNVueById("aioRemoteVideo").hide();
      uni.getSubNVueById("aioPreviewVideo").hide();
      this.$parent.countTimer();
    },
    // 挂断视频通话
    hangupIntercom () {
      if (!this.isRepeatState) {
        this.isRepeatState = true;
        setTimeout(() => {
          this.isRepeatState = false;
        }, 1500);
        if (this.openIntercom) {
          let managerCode = uni.getStorageSync("managerInfo").code;
          if (this.intercomInfo.id == 0) {
            // 挂断主机视频通话
            let controlCode = uni.getStorageSync("managerInfo").controlCode;
            this.$parent.sendWebsocket(
              `{maindevno:"${controlCode}",devno:"${managerCode}",type:"100",msg:"22"}`
            );
          } else {
            // 挂断分机视频通话
            let terminalCode = uni.getStorageSync("managerInfo").terminalCode;
            this.$parent.sendWebsocket(
              `{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"24"}`
            );
            let { controlSipAccount: masterNum, TerSipAccount: slaveNum } = uni.getStorageSync("managerInfo");
            console.log(masterNum, slaveNum);
            getApp().globalData.FloatUniModule.nativeHangup(0, masterNum, slaveNum, 0);
          }
        }
      }
    },
    // 设置本机音量进度条
    setManagerVolume (e) {
      this.managerVolume = e.detail.value;
    },
    // 设置分机音量进度条
    setTerminalVolume (e) {
      this.terminalVolume = e.detail.value;
    },
    // 音量调节弹框
    volumeControl () {
      // 获取本地音量
      getApp().globalData.FloatUniModule.getStreamVolumeTypeVoiceCall(e => {
        this.managerVolume = e.value;
        if (this.intercomInfo.id == 1) {
          // 获取分机音量
          let managerCode = uni.getStorageSync("managerInfo").code;
          let terminalCode = uni.getStorageSync("managerInfo").terminalCode;
          this.$parent.sendWebsocket(
            `{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"8",extend:""}`
          );
        }
        getApp().globalData.FloatUniModule.setTalkViewPosition(45, 220, 1, 1);
        getApp().globalData.FloatUniModule.setLocalVideoViewPosition(1150, 220, 1, 1);
        this.showVolume = true;
      });
    },
    // 确认音量调节
    intercomVolume () {
      // 本机对讲音量调节
      getApp().globalData.FloatUniModule.setStreamVolumeTypeVoiceCall(this.managerVolume);
      if (this.intercomInfo.id == 1) {
        // 分机音量调节
        let managerCode = uni.getStorageSync("managerInfo").code;
        let terminalCode = uni.getStorageSync("managerInfo").terminalCode;
        this.$parent.sendWebsocket(
          `{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"8",extend:"${this.terminalVolume}"}`
        );
      }
      this.closeModal("Volume");
    },
    // 设置静音
    handleVideoMute () {
      this.isMute = !this.isMute;
      if (this.isMute) {
        // 开启静音
        getApp().globalData.FloatUniModule.setExtMicEna(false);
        console.log("开启静音");
      } else {
        // 关闭静音
        getApp().globalData.FloatUniModule.setExtMicEna(true);
        console.log("关闭静音");
      }
    },
    openModal (type) {
      this[`show${type}`] = true;
    },
    closeModal (type) {
      this[`show${type}`] = false;
      this.$nextTick(() => {
        getApp().globalData.FloatUniModule.setTalkViewPosition(45, 220, 1060, 710);
        getApp().globalData.FloatUniModule.setLocalVideoViewPosition(1150, 220, 727, 460);
      });
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
