<template>
	<neil-modal :show="isShow" @close="handleClose">
		<view class="recognition-dialogs-container">
			<!-- 顶部操作栏 -->
			<template>
				<view class="modal-header">
					<view class="modal-title">{{ regTitle }}</view>
					<div class="modal-close" @click="handleClose">
						<image src="/static/images/common/close.png"></image>
					</div>
				</view>
				<view class="page-horizontal-divider"></view>
			</template>
			<view class="uni-flex uni-flex-item uni-column" style="justify-content: space-around; align-items: center">
				<!-- 人脸认证 -->
				<template v-if="isFaceRecognition">
					<div class="face-recognition-bg">
						<image class="loading-tips" src="/static/images/index/connect.png"></image>
					</div>
					<text v-if="showRegConfig" style="font-size: 20.83upx; font-weight: 400; color: #35fffa">{{
						regConfig.regName }}</text>
					<text style="font-size: 20.83upx; font-weight: 400">{{ faceConfig.scanTips }}</text>
				</template>
				<!-- 指纹认证 -->
				<template v-else>
					<template v-if="useFor == 'login'">
						<common-icons iconType="iconzhiwen" size="100" color="#fff" />
						<text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
					</template>
					<div v-else class="call-modal-box">
						<div class="call-modal-content">
							<div class="modal-fingerInit modal-fingerSuccess">
								<common-icons iconType="iconzhiwen" size="100" color="#fff" />
								<text class="finger-name">{{ regConfig.regName }}</text>
								<text class="finger-tip">{{ regConfig.regText }}</text>
							</div>
						</div>
					</div>
				</template>
			</view>
			<!-- 切换按钮 -->
			<div class="switch-btn-wrapper" v-if="debounceSwitch">
				<div class="check-btn" v-if="isConfirm">
					<span @touchstart.stop="handleConfirm">{{ confirmText }}</span>
				</div>
				<div type="default" class="switch-type-btn" @touchstart.stop="debounceSwitch">
					切换{{ isFaceRecognition ? "指纹" : "人脸" }}
				</div>
			</div>
		</view>
	</neil-modal>
</template>

<script>
import Api from '@/common/api.js';
import { debounce } from "@/common/utils/util.js";

export default {
	props: {
		// 人脸识别登录弹窗显示状态
		isShow: {
			type: Boolean,
			default: false,
		},
		// 人脸认证角色 0：医务 1：管教
		role: {
			type: Number,
			default: 1
		},
		// 认证弹框的类型 login登录 outroom
		useFor: {
			type: String,
			default: "login",
		},
		isConfirm: {
			type: Boolean,
			default: false,
		},
		confirmText: {
			type: String,
			default: "确认",
		},
		// 人员验证信息
		regConfig: {
			type: Object,
			default() {
				return {
					regName: "某某某",
					rybh: "",
					regText: "请进行验证",
				};
			},
		},
	},
	data() {
		return {
			// 人脸 or 指纹登录
			defaultLoginType: uni.getStorageSync("defaultLoginType") || 0,
			// 人脸登录需要的配置
			faceConfig: {
				pics: '',
				// 扫描提示
				scanTips: '请站好正视屏幕，识别验证中...',
			},
			// 切换按钮防抖
			debounceSwitch: null,
			// 正在人脸识别
			isFacing: false,
			// 指纹开启状态
			isOpen: false,
			faceTimer: null,
		};
	},
	computed: {
		// 0-人脸认证，1-指纹认证
		isFaceRecognition() {
			return this.defaultLoginType == 0 ? true : false;
		},
		regTitle() {
			return this.isFaceRecognition ? "请进行人脸/刷卡认证" : "请进行指纹/刷卡认证";
		},
		showRegConfig() {
			return ["outroom", "medication"].includes(this.useFor);
		},
		// 人脸验证 1:1|1：N
		useFace11() {
			return ["outroom"].includes(this.useFor);
		},
		topPos() {
			if (["login", "medication"].includes(this.useFor)) {
				return "286";
			} else if (this.useFor == "outroom") {
				return "272";
			}
		},
	},
	watch: {
		isShow(state) {
			if (!state) {
				this.isFacing = false;
				this.stopFacePreview();
				this.closeFingerPrint();
			} else {
				this.defaultLoginType = uni.getStorageSync("defaultLoginType");
				this.debounceSwitch = debounce(this.switchRecognitionMode, 1500);
			}
		}
	},
	beforeDestroy() {
		this.stopFacePreview();
		this.closeFingerPrint();
	},
	methods: {
		// 开始识别
		startRecognition() {
			if (this.isFaceRecognition) {
				this.faceVoice('开始人脸识别，请站好正视屏幕');
				this.isFacing = true;
				this.handleFaceRecognition(true);
			} else {
				this.verifyFingerPrint();
			}
		},
		// 切换登录方式
		switchRecognitionMode() {
			this.defaultLoginType = this.defaultLoginType == 0 ? 1 : 0;
			if (this.isFaceRecognition) {
				this.faceVoice("开始人脸识别，请站好正视屏幕");
				this.isFacing = true;
				this.handleFaceRecognition(true);
				this.closeFingerPrint();
			} else {
				this.verifyFingerPrint();
			}
		},
		// 人脸拍照
		handleFaceRecognition(state = true) {
			if (this.isShow && this.isFacing) {
				if (state) {
					this.startFacePreview();
				}
				this.faceTimer = setTimeout(() => {
					this.snapshotPreview();
				}, 3000);
			}
		},
		// 人脸识别
		async faceRecognition(base64Str = "") {
			const { roomId } = uni.getStorageSync("managerInfo");
			let params = {
				roomId,
				base64Str
			};
			let url = "";
			if (this.useFace11) {
				// 1:1 在押人员
				params = Object.assign(params, {
					rybh: this.regConfig.rybh
				});
				url = Api.prisoner.prisonerImageOneToOne;
			} else {
				// 1:N 民警
				params = Object.assign(params, {
					role: this.role
				});
				url = Api.police.policeFaceOneToMany;
			}
			let res = await Api.apiCall("post", url, { data: params }, true, true);
			if (!this.isShow || !this.isFaceRecognition) {
				return;
			};
			if (res.state.code == 200) {
				if (this.useFace11) {
					this.faceConfig.scanTips = "验证通过";
					this.$emit("faceRecognitionSuccess");
				} else {
					this.faceVoice("人脸识别成功");
					this.$emit("faceRecognitionSuccess", Object.assign(res.data, {
						operate: this.isFaceRecognition ? 0 : 1
					}));
				}
			} else {
				let text = (res.state && res.state.msg) || "未检测到有效人脸，请站好正视屏幕";
				this.faceVoice(text);
				this.handleFaceRecognition(false);
			}
		},
		// 开始人脸视频预览
		startFacePreview() {
			getApp().globalData.FloatUniModule.initFrame();
			getApp().globalData.FloatUniModule.setLocalVideoViewPosition(620, 320, 680, 380);
			getApp().globalData.FloatUniModule.hideLocalPreView(false);
			getApp().globalData.FloatUniModule.setViewWidthHeight(440, 268); // 仓内屏拍照宽度
			getApp().globalData.FloatUniModule.startTakeFrame();
			getApp().globalData.FloatUniModule.takePictureCallBack((res) => {
				let base64Str = res.bytes.replace(/[\r\n]/g, "");
				this.faceRecognition(base64Str);
			});
		},
		// 人脸认证快照
		snapshotPreview() {
			getApp().globalData.FloatUniModule.takePicture();
		},
		// 停止人脸视频预览
		stopFacePreview() {
			clearTimeout(this.faceTimer);
			this.isFacing = false;
			getApp().globalData.FloatUniModule.stopTakeFrame();
			getApp().globalData.FloatUniModule.hideLocalPreView(true);
		},
		// 关闭人脸识别弹窗
		handleClose() {
			this.stopFacePreview();
			this.$emit("close");
		},
		// 人脸语音播报
		faceVoice(text) {
			this.faceConfig.scanTips = text;
			this.voiceBroadcast(text);
		},
		// 人工核对确认
		handleConfirm() {
			this.handleClose();
			this.$emit("confirm");
		},
		// 开始指纹识别
		verifyFingerPrint() {
			this.isFacing = false;
			this.stopFacePreview();
			if (!this.isOpen) {
				// 打开指纹设备
				this.isOpen = true;
				getApp().globalData.FloatUniModule.fingerModuleStop();
				getApp().globalData.FloatUniModule.syncStartFinger(e => {
					if (e.code == 0) {
						console.log("打开指纹");
						this.voiceBroadcast("请按压要识别的指纹");
						getApp().globalData.FloatUniModule.fingerprintRecognition();

					} else {
						this.voiceBroadcast("指纹设备未打开");
						console.log("指纹设备未打开");
					}
				});
			}
		},
		// 关闭指纹连接
		closeFingerPrint() {
			this.isOpen = false;
			getApp().globalData.FloatUniModule.syncStopFinger(e => {
				if (e.code == 0) {
					getApp().globalData.FloatUniModule.fingerModuleStop();
					console.log("关闭指纹");
				}
			});
		},
		// 语音播放
		voiceBroadcast(voiceText) {
			let options = {
				content: voiceText,
			};
			getApp().globalData.Base.speech(options);
		},
	}
};
</script>

<style lang="less">
.recognition-dialogs-container {
	width: 555.55upx;
	height: 472upx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;

	.modal-header {
		height: 61.11upx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 27.77upx;
		border: 0.69upx solid;
		border-image: 1 linear-gradient(to right,
				rgba(0, 198, 255, 0),
				rgba(0, 198, 255, 1),
				rgba(0, 198, 255, 0));

		.modal-title {
			height: 100%;
			display: flex;
			align-items: center;
			font-size: 22.22upx;
			font-weight: 500;
			color: #35fffa;
		}

		.modal-close {
			height: 100%;
			width: 22upx;
			display: flex;
			justify-content: center;
			align-items: center;

			image {
				height: 22upx;
				width: 22upx;
			}
		}
	}

	.face-recognition-bg {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 13.88upx;
		margin-bottom: 10.88upx;
		width: 472upx;
		height: 263upx;
		background-color: #000;

		.loading-tips {
			width: 50upx;
			height: 50upx;
			animation: tipsRotate 3s ease 0s infinite;

			@keyframes tipsRotate {
				0% {
					transform: rotate(0);
				}

				50% {
					transform: rotate(180deg);
				}

				100% {
					transform: rotate(360deg);
				}
			}
		}
	}

	.switch-btn-wrapper {
		margin-bottom: 30upx;
		width: 555.55upx;
		display: flex;
		justify-content: flex-end;
		align-items: center;

		.switch-type-btn {
			margin-right: 35upx;
			width: 125upx;
			height: 43upx;
			border-radius: 4px;
			line-height: 43upx;
			background-color: #007aff;
			color: #fff;
			font-size: 20.83upx;
			text-align: center;
		}
	}

	.call-modal-content {
		height: 100%;
		box-sizing: border-box;
		display: flex;
		justify-content: center;

		.modal-fingerInit,
		.modal-fingerSuccess {
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.finger-image {
				height: 122.22upx;
				width: 141.66upx;
			}

			.finger-name {
				font-size: 27.77upx;
				font-weight: bold;
				color: #35fffa;
				line-height: 41.66upx;
				margin-top: 20upx;
			}

			.finger-tip {
				color: #fff;
			}
		}
	}
}
</style>
