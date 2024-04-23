<script>
import Api from "@/common/api.js";

// Sip对讲
const Sip = uni.requireNativePlugin("Sip");
// 语音播报
const Base = uni.requireNativePlugin("GK-Base");
const Utils = uni.requireNativePlugin("Utils");
// 音频控制
const HarUtils = uni.requireNativePlugin("HarUtils");
// 升级APP
const UpdateApp = uni.requireNativePlugin("GK-UpdateApp");
// 看门狗
const CrashHandle = uni.requireNativePlugin("CrashHandle");
// 读卡器 & 屏幕常亮设置
const CardManager = uni.requireNativePlugin("card-module");
// 指纹控制
const Fingerprint = uni.requireNativePlugin("FingerprintModule");

export default {
	onLaunch: function () {
		// #ifdef APP-PLUS
		// 系统状态栏显隐
		HarUtils.showStatusBar();
		HarUtils.hideStatusBar();
		// 初始化音频增益
		HarUtils.initAudioGain();
		HarUtils.setVolume(0, uni.getStorageSync("mediaDefaultVolume"));
		HarUtils.setVolume(3, uni.getStorageSync("mediaDefaultVolume"));
		// 应急报警按键事件
		HarUtils.removeKeyCallBack();
		HarUtils.addKeyCallBack();
		// 设置全屏
		plus.navigator.setFullscreen(true);
		// 添加week自定义字体规则
		let domModule = weex.requireModule("dom");
		domModule.addRule("fontFace", {
			fontFamily: "uniicons",
			src: "url('./static/uni.ttf')",
		});
		CrashHandle.startGather(0); //开启日志，参数无效，默认保存着
		CrashHandle.startGuard(10000); //启动守护，0-不轮询
		// 登录SIP服务
		if (!!uni.getStorageSync("baseUrl")) {
			// SIP登录
			this.initSip();
			// 初始化语音播报
			Base.speechInit();
			// 修改分机信息
			this.setTerminalInfo();
		}
		// 开启屏幕常亮
		CardManager.keepScreenOn(result => {
			const res = JSON.parse(result);
			console.log("开启屏幕常亮：" + JSON.stringify(res));
		});
		// #endif
	},
	methods: {
		// 初始化SIP对讲服务
		initSip() {
			if (Sip.logout() === 0) {
				console.log("SIP注销成功");
			}
			if (Sip.init() === 0) {
				console.log("SIP初始化成功");
				if (Utils.isSelfStart() === 0) {
					// 首次自启动
					Sip.startEchoCancellerCalibration();
				}
				let { sipAccount } = uni.getStorageSync("managerInfo");
				let sipPwd = uni.getStorageSync("sipTalkDevicePwd");
				let sipUrl = uni.getStorageSync("sipTalkServerUrl");
				if (Sip.login(sipAccount, sipPwd, sipUrl) === 0) {
					console.log("SIP登录成功");
				} else {
					console.log("SIP登录失败");
				}
			} else {
				console.log("SIP初始化失败");
			}
		},
		// 修改分机信息
		async setTerminalInfo() {
			const { terminalId: id, managerCode: code } = uni.getStorageSync("managerInfo");
			let params = {
				data: {
					id, code, version: plus.runtime.version,
				}
			};
			let res = await Api.apiCall("post", Api.index.updateTerminal, params);
			if (res.state.code == 200) {
				console.log("修改信息成功");
			}
		},
	},
	globalData: {
		Sip,
		Base,
		Utils,
		HarUtils,
		UpdateApp,
		CrashHandle,
		CardManager,
		Fingerprint,
		webSocketConnected: false,
	},
};
</script>

<style>
/* #ifndef APP-PLUS-NVUE */
@import './common/css/uni.css';
@import './static/icons/iconfont.css';
@import './common/css/home-img.css';
@import './common/css/header-img.css';
@import './common/css/navbar-img.css';
@import './common/css/police-img.css';
@import './common/css/bgStyle-img.css';
@import './common/css/neilModal-img.css';
@import './common/css/picker-img.css';
@import './common/css/mood-img.css';
@import './common/css/keyboard-img.css';
@import './common/css/input-img.css';
/* #endif*/
</style>
