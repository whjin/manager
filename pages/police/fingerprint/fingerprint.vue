<template>
	<div class="fingerprint-container">
		<div class="fingerprint-wrapper">
			<div class="fingerprint-header">
				<div class="fingerprint-title">民警指纹录入</div>
				<div class="fingerprint-btn-box">
					<div class="fingerprint-button" @click="fingerprintInit">指纹录入</div>
				</div>
			</div>
			<div class="fingerprint-box">
				<div class="fingerprint-list" v-for="(item, index) in policeFingerList" :key="index">
					<div class="fingerprint-item" :class="{ disabledClick: !!item.mKey && !!item.mKey2 }"
						@click="handleCheckChange(item, index)">
						<checkbox class="checkbox"
							:checked="!!item.mKey && !!item.mKey2 ? true : item.policeNumber == checkedId ? true : false"
							:disabled="!!item.mKey && !!item.mKey2" :class="{ disabledCheck: !!item.mKey && !!item.mKey2 }">
							<text>{{ item.policeName }}</text>
							<text :class="{ mark: !!item.mKey && !item.mKey2 }">{{
								!!item.mKey && !!item.mKey2 ? "" : !item.mKey && !item.mKey2 ? "" : 1
							}}</text>
						</checkbox>
					</div>
					<div class="page-horizontal-divider"></div>
				</div>
			</div>
		</div>
		<div class="neil-modal-container">
			<!-- 指纹录入 -->
			<neil-modal :show="showFingerInit">
				<div class="fingerprint-container">
					<div class="fingerprint-header">
						<div class="fingerprint-title">
							<text>温馨提示</text>
						</div>
						<div class="fingerprint-close" @click="closeModal('FingerInit')">
							<image src="/static/images/common/close.png"></image>
						</div>
					</div>
					<view class="page-horizontal-divider"></view>
					<view class="uni-flex uni-flex-item uni-column" style="justify-content: center; align-items: center">
						<common-icons iconType="iconzhiwen" size="100" color="#FFFFFF" />
						<text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
					</view>
				</div>
			</neil-modal>
		</div>
	</div>
</template>

<script>
import Api from "@/common/api.js";
import neilModal from "@/components/neil-modal/neil-modal.vue";
import commonIcons from "@/components/common-icons/common-icons.vue";
import Log from "@/common/utils/log.js";

export default {
	components: {
		neilModal,
		commonIcons,
	},
	data() {
		return {
			// 指纹认证弹框
			showFingerInit: false,
			// 指纹已录入不可选
			disabled: false,
			// 民警指纹信息
			policeFingerList: [],
			// 已选列表
			checkedList: [],
			// 已选人员ID
			checkedId: "",
			// 设备连接状态
			isOpen: false,
			// 建档ID(0-249)
			paramInt: 1,
			// 第一次建档定时器
			enroll1Timer: null,
			// 第一次松开指纹
			raise1Timer: null,
			// 第二次建档定时器
			enroll2Timer: null,
			// 第二次松开指纹
			raise2Timer: null,
			// 第三次建档定时器
			enroll3Timer: null,
			// 第三次松开指纹
			raiseThreeTimer: null,
		};
	},
	created() {
		// 获取民警指纹录入信息
		this.getPoliceFingerInfo();
	},
	destroyed() {
		this.showFingerInit = false;
		this.closeFingerPrint();
	},
	methods: {
		// 民警指纹录入信息
		async getPoliceFingerInfo() {
			const { roomId } = uni.getStorageSync("managerInfo");
			let res = await Api.apiCall("get", Api.index.getPoliceFingerInfo, { roomId });
			if (res.state.code == 200) {
				this.policeFingerList = res.data;
			}
		},
		// 选择人员
		handleCheckChange(item, index) {
			if (this.checkedList.length == 0) {
				this.checkedList.push(item);
				this.checkedId = this.checkedList[0].policeNumber;
			} else {
				if (item.policeNumber == this.checkedList[0].policeNumber) {
					this.checkedList = [];
				} else {
					this.checkedList.splice(0, 1, item);
					this.checkedId = this.checkedList[0].policeNumber;
				}
			}
		},
		// 获取建档ID
		async getPoliceFingerKey() {
			let params = {
				roomId: uni.getStorageSync("managerInfo").roomId,
				police: this.checkedList[0].policeNumber,
			};
			let res = await Api.apiCall("get", Api.index.getPoliceFingerKey, params);
			if (res.state.code == 200) {
				if (!this.checkedList[0].mKey) {
					this.paramInt = res.data[0];
				} else {
					this.paramInt = res.data[1];
				}
				getApp().globalData.Fingerprint.deleteID(this.paramInt);
			}
		},
		// 民警指纹录入
		fingerprintInit() {
			if (this.showFingerInit) {
				return;
			}
			if (!this.checkedList.length) {
				this.$parent.handleShowToast("请先选择人员列表");
				return;
			}
			this.showFingerInit = true;
			// 获取建档ID
			this.getPoliceFingerKey();
			this.startFingerPrint();
		},
		// 开始指纹录入
		startFingerPrint() {
			this.initFingerPrint();
			setTimeout(() => {
				this.entryFingerPrint();
			}, 1500);
		},
		// 设备连接
		initFingerPrint() {
			if (!this.isOpen) {
				getApp().globalData.Fingerprint.init((result) => {
					if (result == 0) {
						this.isOpen = true;
						console.log("设备已连接");
					} else {
						console.log("设备连接失败");
					}
				});
			}
		},
		// 指纹录入
		entryFingerPrint() {
			if (this.isOpen) {
				if (getApp().globalData.Fingerprint.enrollStart(this.paramInt) == 0) {
					this.voiceBroadcast(`建档成功，请按压指纹1`);
					// 第一次建档
					this.enroll1Timer = setInterval(() => {
						if (getApp().globalData.Fingerprint.isPressFinger() == 0) {
							if (getApp().globalData.Fingerprint.enroll1((rt) => { }) == 0) {
								clearInterval(this.enroll1Timer);
								Log.writeLog(`关闭民警指纹录入第一次建档按压指纹定时器,enroll1Timer=>${this.enroll1Timer}`, false);
								this.voiceBroadcast("登记1成功，请松开指纹");
								this.raise1Timer = setInterval(() => {
									if (getApp().globalData.Fingerprint.isPressFinger() != 0) {
										clearInterval(this.raise1Timer);
										Log.writeLog(`关闭民警指纹录入第一次建档松开指纹定时器,raise1Timer=>${this.raise1Timer}`, false);
										console.log("松开指纹成功，请按压指纹2");
										// 第二次建档
										this.enroll2Timer = setInterval(() => {
											if (getApp().globalData.Fingerprint.isPressFinger() == 0) {
												if (getApp().globalData.Fingerprint.enroll2() == 0) {
													clearInterval(this.enroll2Timer);
													Log.writeLog(
														`关闭民警指纹录入第二次建档按压指纹定时器,enroll2Timer=>${this.enroll2Timer}`,
														false
													);
													this.voiceBroadcast("登记2成功，请松开指纹");
													this.raise2Timer = setInterval(() => {
														if (getApp().globalData.Fingerprint.isPressFinger() != 0) {
															clearInterval(this.raise2Timer);
															Log.writeLog(
																`关闭民警指纹录入第二次建档松开指纹定时器,raise2Timer=>${this.raise2Timer}`,
																false
															);
															console.log("松开指纹成功，请按压指纹3");
															// 第三次建档
															this.enroll3Timer = setInterval(() => {
																if (getApp().globalData.Fingerprint.isPressFinger() == 0) {
																	let res = getApp().globalData.Fingerprint.enroll3(this.paramInt);
																	switch (res.code) {
																		case 0:
																			clearInterval(this.enroll3Timer);
																			Log.writeLog(
																				`关闭民警指纹录入第三次建档按压指纹定时器,状态:指纹录入成功!,enroll3Timer=>${this.enroll3Timer}`,
																				false
																			);
																			this.voiceBroadcast("指纹录入成功!");
																			this.savePoliceFingerInfo(String(res.result));
																			this.closeFingerPrint();
																			break;
																		case 4101:
																			clearInterval(this.enroll3Timer);
																			Log.writeLog(
																				`关闭民警指纹录入第三次建档按压指纹定时器,状态:指纹录入成功!,enroll3Timer=>${this.enroll3Timer}`,
																				false
																			);
																			this.voiceBroadcast("当前指纹特征值已存在!");
																			this.closeFingerPrint();
																			break;
																		case 4109:
																			clearInterval(this.enroll3Timer);
																			Log.writeLog(
																				`关闭民警指纹录入第三次建档按压指纹定时器,状态:指纹录入成功!,enroll3Timer=>${this.enroll3Timer}`,
																				false
																			);
																			this.voiceBroadcast("指纹录入失败，请重新录入!");
																			this.closeFingerPrint();
																			break;
																		default:
																			console.log("登记3失败，请重新按压指纹3");
																			break;
																	}
																} else {
																	console.log("请按压指纹");
																}
															}, 2000);
															Log.writeLog(
																`民警指纹录入第三次建档按压指纹定时器,enroll3Timer=>${this.enroll3Timer}`,
																false
															);
														} else {
															console.log("请松开指纹");
														}
													}, 1000);
													Log.writeLog(`民警指纹录入第二次建档松开指纹定时器,raise2Timer=>${this.raise2Timer}`, false);
												} else {
													console.log("登记2失败，请重新按压指纹2");
												}
											} else {
												console.log("请按压指纹");
											}
										}, 1000);
										Log.writeLog(`民警指纹录入第二次建档按压指纹定时器,enroll2Timer=>${this.enroll2Timer}`, false);
									} else {
										console.log("请松开指纹");
									}
								}, 1000);
								Log.writeLog(`民警指纹录入第一次建档松开指纹定时器,raise1Timer=>${this.raise1Timer}`, false);
							} else {
								console.log("登记1失败，请重新按压指纹1");
							}
						} else {
							console.log("请按压指纹");
						}
					}, 1000);
					Log.writeLog(`民警指纹录入第一次建档按压指纹定时器,enroll1Timer=>${this.enroll1Timer}`, false);
				} else {
					this.voiceBroadcast("建档失败");
				}
			} else {
				console.log("请先连接设备");
			}
		},
		// 录入成功后保存指纹信息
		async savePoliceFingerInfo(pHint) {
			let params = {
				mKey: this.paramInt,
				police: this.checkedList[0].policeNumber,
				pHint: pHint,
			};
			let res = await Api.apiCall("post", Api.index.savePoliceFingerInfo, params);
			if (res.state.code == 200) {
				this.policeFingerList.map((item, index) => {
					if (item.policeNumber == res.data.police) {
						item.mKey = res.data.mKey;
						item.mKey2 = res.data.mKey2;
						this.policeFingerList.splice(index, 1, item);
					}
				});
				this.$parent.handleShowToast("指纹信息保存成功");
			}
		},
		// 关闭指纹连接
		closeFingerPrint() {
			if (this.isOpen) {
				let res = getApp().globalData.Fingerprint.close();
				if (res == 0) {
					clearInterval(this.enroll1Timer);
					Log.writeLog(
						`关闭民警指纹录入第一次建档按压指纹定时器,状态:设备关闭成功!,enroll1Timer=>${this.enroll1Timer}`,
						false
					);
					this.isOpen = false;
					this.showFingerInit = false;
					console.log("设备关闭成功");
					Log.writeLog("设备关闭成功", false);
				} else {
					console.log("设备关闭失败");
					Log.writeLog("设备关闭失败", false);
					this.$parent.handleShowToast("设备关闭失败", "bottom", 5000);
				}
			}
		},
		// 指纹认证语音播放
		voiceBroadcast(voiceText) {
			let options = {
				content: voiceText,
			};
			getApp().globalData.Base.speech(options);
		},
		openModal(type) {
			this[`show${type}`] = true;
		},
		closeModal(type) {
			this[`show${type}`] = false;
			clearInterval(this.enroll2Timer);
			clearInterval(this.enroll3Timer);
			Log.writeLog(
				`关闭民警指纹录入第三次建档按压指纹定时器,状态:关闭指纹录入弹框!,enroll3Timer=>${this.enroll3Timer}`,
				false
			);
			this.closeFingerPrint();
		},
	},
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
