<template>
	<neil-modal :show="isShow" @close="handleClose">
		<view class="recognition-dialogs-container">
			<!-- 顶部操作栏 -->
			<template>
				<view class="modal-header">
					<view class="modal-title">请刷卡/人脸认证</view>
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
					<text v-if="useFor == 'outroom'" style="font-size: 20.83upx; font-weight: 400; color: #35fffa">{{
						regConfig.regName }}</text>
					<text style="font-size: 20.83upx; font-weight: 400">{{
						faceConfig.scanTips
					}}</text>
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
								<text class="finger-tip">请进行验证</text>
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
import { pathToBase64 } from "@/common/utils/imageTools.js";
import Api from "@/common/api.js";
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
			default: 1,
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
					regName: "",
					rybh: "",
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
				pics: "",
				// 扫描提示
				scanTips: "请站好正视屏幕，识别验证中...",
			},
			// 指纹登录需要的配置
			frigerConfig: {
				// 指纹设备开启状态
				isFrigerOpen: false,
				loginTimer: null,
			},
			// 切换按钮防抖
			debounceSwitch: null,
			// 正在人脸识别
			isFacing: false,
		};
	},
	computed: {
		// 0-人脸认证，1-指纹认证
		isFaceRecognition() {
			return this.defaultLoginType == 0 ? true : false;
		},
		// 1:1人脸验证 or 1：N人脸验证
		useFace11() {
			return ["outroom"].includes(this.useFor);
		},
		topPos() {
			if (this.useFor == "login") {
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
				this.stopFacePreview(true);
				this.closeFingerPrint();
			} else {
				this.defaultLoginType = uni.getStorageSync("defaultLoginType");
				this.debounceSwitch = debounce(this.switchRecognitionMode, 1500);
				uni.$on("get-img-path", (path) => {
					this.handlePathToBase64(path).then((base64) => {
						this.faceRecognition(base64);
					});
				});
			}
		},
	},
	destroyed() {
		this.stopFacePreview(true);
		this.closeFingerPrint();
	},
	methods: {
		// 开始识别
		startRecognition() {
			if (this.isFaceRecognition) {
				this.faceVoice("开始人脸识别，请站好正视屏幕");
				this.isFacing = true;
				this.handleFaceRecognition(true);
			} else {
				this.verifyFingerPrint();
			}
		},
		// 切换登录方式
		switchRecognitionMode() {
			this.$emit("switchRecognitionMode", this.isFaceRecognition);
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
		handleFaceRecognition(livePushPre = true) {
			if (this.isShow && this.isFacing) {
				if (livePushPre) {
					this.startFacePreview();
				}
				setTimeout(() => {
					this.snapshotPreview();
				}, 2000);
			}
		},
		// 开始人脸视频预览
		startFacePreview() {
			uni.$emit("live-push", {
				status: "setStyle",
				width: "626",
				height: "382",
				left: "618",
				top: this.topPos,
			});
			uni.$emit("live-push", {
				status: "startPre",
			});
		},
		// 人脸认证快照
		snapshotPreview() {
			uni.$emit("live-push", {
				status: "snapshot",
			});
		},
		// 停止人脸视频预览
		stopFacePreview(state) {
			if (state) {
				uni.$off("get-img-path");
			}
			uni.$emit("live-push", {
				status: "stopPre",
			});
		},
		// 人脸识别
		async faceRecognition(base64Str = "") {
			let roomId = uni.getStorageSync("managerInfo").roomId;
			let params = {
				roomId,
				base64Str,
			};
			let url = "";
			if (this.useFace11) {
				params.rybh = this.regConfig.rybh;
				// 1:1 在押人员
				url = Api.prisoner.faceRecognition11;
			} else {
				params.role = this.role;
				// 1:N 民警
				url = Api.police.faceRecognition1N;
			}
			let res = await Api.apiCall("post", url, { data: params }, true, true);
			if (!this.isShow || !this.isFaceRecognition) return;
			if (res.state.code == 200) {
				if (this.useFace11) {
					this.faceConfig.scanTips = "验证通过";
					this.$emit("faceRecognitionSuccess");
				} else {
					this.faceVoice("人脸识别成功");
					this.$emit("faceRecognitionSuccess", res.data);
				}
			} else {
				let text =
					(res.state && res.state.msg) || "未检测到有效人脸，请站好正视屏幕";
				this.faceVoice(text);
				this.handleFaceRecognition(false);
			}
		},
		// 人脸语音播报
		faceVoice(text) {
			this.faceConfig.scanTips = text;
			this.voiceBroadcast(text);
		},
		// 关闭人脸识别弹窗
		handleClose() {
			this.stopFacePreview(true);
			this.$emit("close");
		},
		// 人工核对确认
		handleConfirm() {
			this.handleClose();
			this.$emit("confirm");
		},
		// 开始指纹识别
		verifyFingerPrint() {
			this.isFacing = false;
			this.stopFacePreview(false);
			this.initFingerPrint();
			setTimeout(() => {
				this.identifyFingerPrint();
			}, 1200);
		},
		// 指纹设备连接
		initFingerPrint() {
			if (!this.frigerConfig.isFrigerOpen) {
				getApp().globalData.fingerprint.init((result) => {
					if (result == 0) {
						this.frigerConfig.isFrigerOpen = true;
						console.log("设备已连接");
					} else {
						console.log("设备连接失败");
					}
				});
			}
		},
		// 指纹登录
		identifyFingerPrint() {
			this.isFacing = false;
			if (
				this.frigerConfig.isFrigerOpen &&
				!this.isFaceRecognition &&
				this.isShow
			) {
				this.voiceBroadcast("请按压要识别的指纹");
				clearInterval(this.frigerConfig.loginTimer);
				this.frigerConfig.loginTimer = setInterval(() => {
					if (this.isFaceRecognition || !this.isShow) {
						clearInterval(this.frigerConfig.loginTimer);
					}
					if (getApp().globalData.fingerprint.isPressFinger() == 0) {
						let res = getApp().globalData.fingerprint.identify();
						switch (res.code) {
							case 0:
								this.$emit("fingerRecognitionSuccess", {
									mKey: res.result,
									useFor: this.useFor
								});
								break;
							case 4104:
								this.voiceBroadcast("指纹识别失败，没有录入该指纹");
								this.$emit("recognitionFail");
								break;
							case 4106:
								this.voiceBroadcast("指纹识别失败，指纹库为空");
								this.$emit("recognitionFail");
								break;
						}
					} else {
						console.log("请按压指纹");
					}
				}, 3000);
			} else {
				console.log("请先连接设备");
			}
		},
		// 关闭指纹连接
		closeFingerPrint() {
			clearInterval(this.frigerConfig.loginTimer);
			this.frigerConfig.isFrigerOpen = false;
			let res = getApp().globalData.fingerprint.close();
			if (res == 0) {
				console.log("关闭指纹");
			} else {
				console.log("指纹关闭失败");
			}
		},
		// 图片路径转base64
		handlePathToBase64(imgPath) {
			return new Promise((res, rej) => {
				pathToBase64(imgPath)
					.then((base64) => {
						let index = base64.indexOf(",") + 1;
						let imgBase64 = base64.substr(index);
						res(imgBase64);
						this.deleteFile(imgPath);
					})
					.catch((error) => {
						rej(error);
						this.deleteFile(imgPath);
					});
			});
		},
		// 根据文件路径删除文件
		deleteFile(filePath) {
			// #ifdef APP-PLUS
			plus.io.requestFileSystem(
				plus.io.PUBLIC_DOCUMENTS, // 程序公用文档目录常量
				(fs) => {
					// 创建或打开文件, fs.root是根目录操作对象,直接fs表示当前操作对象
					fs.root.getFile(
						filePath,
						{
							create: false, // 文件不存在则创建
						},
						(fileEntry) => {
							// 文件在手机中的路径
							fileEntry.remove();
						}
					);
				}
			);
			// #endif
		},
		// 语音播放
		voiceBroadcast(voiceText) {
			let options = {
				content: voiceText,
			};
			getApp().globalData.Base.speech(options);
		},
	},
};
</script>

<style lang="less" scoped>
.recognition-dialogs-container {
	width: 555.55upx;
	min-height: 520upx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;

	.modal-header {
		height: 61.11upx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 27.77upx;

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
		margin: 13.88upx 0;
		width: 446upx;
		height: 272upx;
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
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: flex-end;

		.check-btn {
			display: flex;
			flex: 1;
			justify-content: flex-start;
			margin-left: 35upx;

			span {
				display: inline-block;
				width: fit-content;
				height: 43upx;
				border-radius: 4px;
				line-height: 43upx;
				background-color: #ff9900;
				color: #fff;
				font-size: 20.83upx;
				text-align: center;
				padding: 0 13.88upx;
			}
		}

		.switch-type-btn {
			width: 125upx;
			height: 43upx;
			border-radius: 4px;
			line-height: 43upx;
			background-color: #007aff;
			color: #fff;
			font-size: 20.83upx;
			text-align: center;
			margin-right: 35upx;
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
				margin-top: 50upx;
			}

			.finger-tip {
				color: #fff;
			}
		}
	}
}
</style>
