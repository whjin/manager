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
							<div class="button" @touchstart.stop="volumeControl">调节音量</div>
							<div class="button" @touchstart.stop="handleVideoMute">{{ isMute ? "关闭静音" : "开启静音" }}</div>
							<div class="button" @touchstart.stop="hangupIntercom">挂断</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="neil-modal-container">
			<!-- 监仓调节音量弹框 -->
			<neil-modal :show="showIntercomVolume">
				<div class="volume-modal-box">
					<div class="modal-header">
						<div class="modal-title">音量</div>
						<div class="modal-close" @click="closeModal('IntercomVolume')">
							<image src="/static/images/common/close.png"></image>
						</div>
					</div>
					<div class="modal-horizontal-divider"></div>
					<div class="volume-modal-content">
						<div class="volume-modal-section">
							<div class="volume-text">本机音量</div>
							<common-icons type="iconvolume" size="32" color="#fff"></common-icons>
							<div class="volume-slider">
								<slider :value="managerVolume" max="5" show-value block-size="46"
									@change="setManagerVolume" />
							</div>
						</div>
						<div class="volume-modal-section" v-if="intercomInfo.id">
							<div class="volume-text">分机音量</div>
							<common-icons type="iconvolume" size="32" color="#fff"></common-icons>
							<div class="volume-slider">
								<slider :value="terminalVolume" max="20" show-value block-size="46"
									@change="setTerminalVolume" />
							</div>
						</div>
					</div>
					<div class="volume-modal-btn">
						<div class="cancel-btn" @click="closeModal('IntercomVolume')">
							<span>取消</span>
						</div>
						<div class="confirm-btn" @touchstart.stop="intercomVolume">
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
import { mapState } from 'vuex';
import Api from '@/common/api.js';
import Log from "@/common/utils/log.js";
import { showNum } from "@/common/utils/util.js";

export default {
	name: "intercom",
	components: {
		commonIcons,
		neilModal,
	},
	data() {
		return {
			// 通话定时器
			talkTimer: null,
			// 通话时间
			talkCountTime: "00:00:00",
			// 是否静音
			isMute: false,
			// 调节音量弹框
			showIntercomVolume: false,
			// 本机音量值
			managerVolume: 5,
			// 分机音量值
			terminalVolume: 20,
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
		})
	},
	mounted() {
		// 通话计时
		this.setTalkTime();
	},
	destroyed() {
		clearInterval(this.talkTimer);
		this.showIntercomVolume = false;
		this.hangupIntercom();
		// 关闭静音
		getApp().globalData.Sip.enableMic(1);
		this.$parent.countTimer();
	},
	methods: {
		// 通话时长
		setTalkTime() {
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
		// 清除通话时长定时器
		stopTalkTimer() {
			clearInterval(this.talkTimer);
		},
		// 设置本机音量进度条
		setManagerVolume(e) {
			this.managerVolume = e.detail.value;
		},
		// 设置分机音量进度条
		setTerminalVolume(e) {
			this.terminalVolume = e.detail.value;
		},
		// 获取本地|仓内屏音量
		volumeControl() {
			// 获取本地音量
			this.managerVolume = getApp().globalData.HarUtils.getVolume(0);
			if (!!this.intercomInfo.id) {
				// 获取仓内屏音量
				this.getTerminalVolume();
			}
			uni.getSubNVueById("sipRemote").hide();
			uni.getSubNVueById("sipPreview").hide();
			this.showIntercomVolume = true;
		},
		// 音量调节确认
		intercomVolume() {
			// 关闭静音
			if (getApp().globalData.Sip.enableMic(1) === 0) {
				this.isMute = false;
				console.log("关闭主机静音成功");
				Log.writeLog("关闭主机静音成功", false);
			} else {
				console.log("关闭主机静音失败");
				Log.writeLog("关闭主机静音失败", false);
			}
			// 本机对讲音量调节
			getApp().globalData.HarUtils.setVolume(0, this.managerVolume);
			if (!!this.intercomInfo.id) {
				// 仓内屏音量调节
				this.setDeviceVolume();
			}
			this.closeModal("IntercomVolume");
		},
		// 获取分机音量
		async getTerminalVolume() {
			const { embeddedIp: ip } = uni.getStorageSync("managerInfo");
			let res = await Api.apiCall("get", Api.index.getTerminalVolume, { ip });
			if (res.state.code == 200) {
				this.terminalVolume = res.data;
			}
		},
		// 设置分机音量
		async setDeviceVolume() {
			let params = {
				ip: uni.getStorageSync("managerInfo").embeddedIp,
				deviceVol: `0,${this.terminalVolume * 5}`,
			};
			let res = await Api.apiCall("get", Api.index.setDeviceVolume, params);
			if (res.state.code == 200) {
				this.$parent.handleShowToast("音量调节成功", "bottom", 5000);
			}
		},
		// 设置静音
		handleVideoMute() {
			this.isMute = !this.isMute;
			if (this.isMute) {
				// 开启静音
				if (getApp().globalData.Sip.enableMic(0) === 0) {
					console.log("设置主机静音成功");
					Log.writeLog("设置主机静音成功", false);
				} else {
					console.log("设置主机静音失败");
					Log.writeLog("设置主机静音失败", false);
				}
			} else {
				// 关闭静音
				if (getApp().globalData.Sip.enableMic(1) === 0) {
					console.log("关闭主机静音成功");
					Log.writeLog("关闭主机静音成功", false);
				} else {
					console.log("关闭主机静音失败");
					Log.writeLog("关闭主机静音失败", false);
				}
			}
		},
		// 挂断视频通话
		hangupIntercom() {
			if (this.openIntercom) {
				clearInterval(this.talkTimer);
				let { managerCode } = uni.getStorageSync("managerInfo");
				if (!this.intercomInfo.id) {
					// 挂断主机视频通话
					let { controlCode } = uni.getStorageSync("managerInfo");
					this.$parent.sendWebsocket(
						`{maindevno:"${controlCode}",devno:"${managerCode}",type:"100",msg:"22"}`);
				} else {
					// 挂断仓内屏视频通话
					let { terminalCode } = uni.getStorageSync("managerInfo");
					this.$parent.sendWebsocket(
						`{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"24"}`);
					let { TerSipAccount } = uni.getStorageSync("managerInfo");
					if (getApp().globalData.Sip.hangup(TerSipAccount) === 0) {
						console.log("SIP挂断成功");
						Log.writeLog("SIP挂断成功", false);
					} else {
						console.log("SIP挂断失败");
						Log.writeLog("SIP挂断失败", false);
					}
				}
			}
		},
		// 挂断消息处理
		hangupMsgHandler() {
			let {managerCode} = uni.getStorageSync("managerInfo");
			if (!this.intercomInfo.id) {
				// 挂断主机视频通话
				let { controlCode } = uni.getStorageSync("managerInfo");
				this.$parent.sendWebsocket(
					`{maindevno:"${controlCode}",devno:"${managerCode}",type:"100",msg:"22"}`);
			} else {
				// 挂断仓内屏视频通话
				let { terminalCode } = uni.getStorageSync("managerInfo");
				this.$parent.sendWebsocket(
					`{maindevno:"${managerCode}",devno:"${terminalCode}",type:"100",msg:"24"}`);
			}
		},
		openModal(type) {
			this[`show${type}`] = true;
		},
		closeModal(type) {
			this[`show${type}`] = false;
			if (type == "IntercomVolume") {
				if (this.openIntercom) {
					uni.getSubNVueById("sipRemote").show();
					uni.getSubNVueById("sipPreview").show();
				}
			}
		},
	},
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
