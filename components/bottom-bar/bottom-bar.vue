<template>
	<div v-if="showBottomBar" class="bottom-bar-container">
		<div class="bottom-bar-left">
			<div class="bottom-bar-user" @click="onClickLogin">
				<image src="/static/images/common/user.png"></image>
			</div>
			<div v-if="loginState" class="login-name">{{ name }}</div>
			<div v-if="loginState" class="bottom-bar-logout" @click="onClickLogout">
				<common-icons iconType="iconlogout" size="28" color="#fff" />
				<text>注销</text>
			</div>
			<div v-if="!loginState" class="login-setup" @click="onClickSet">
				<common-icons iconType="iconset" size="28" color="#fff" />
				<text>设置</text>
			</div>
		</div>
		<div @click="onCenterDblclick" class="bottom-bar-center">
			<template v-if="isShowCenter">
				<text v-if="authIP !== curIP" class="text red-color">认证IP：{{ authIP || '无' }}</text>
				<text class="text">当前IP：{{ curIP || '无' }}</text>
				<text class="text">版本号：V{{ version || '无' }}</text>
			</template>
		</div>
		<div v-if="showCountTime" class="bottom-bar-right">
			页面操作倒计时:<text>{{countdown}}</text>
		</div>
	</div>
</template>

<script>
import commonIcons from "@/components/common-icons/common-icons.vue";
import { mapState } from "vuex";

export default {
	name: "BottomStatus",
	components: {
		commonIcons,
	},
	props: {
		showBottomBar: {
			type: Boolean,
			default: true,
		},
		name: {
			type: String,
			default: "未知名",
		},
		loginState: {
			type: Boolean,
			default: true,
		},
		countdown: {
			type: Number | String,
			default: 30,
		},
	},
	data () {
		return {
			isShowCenter: false,
			clickCount: 0,
			startTime: 0,
			endTime: 0,
			version: '',
			curIP: '',
			authIP: ''
		};
	},
	computed: {
		...mapState({
			// 当前页面
			currentTab: (state) => state.app.currentTab,
		}),
		// 倒计时状态
		showCountTime () {
			if ([31, 33].includes(this.currentTab)) {
				return false;
			} else {
				return true;
			}
		}
	},
	methods: {
		onClickLogout () {
			this.$emit("click-logout");
		},
		onClickSet () {
			this.$emit("click-set");
		},
		onClickLogin () {
			this.$emit("click-login");
		},
		onCenterDblclick () {
			if (this.isShowCenter) return;
			this.clickCount = this.clickCount == 0 ? 1 : this.clickCount + 1;
			if (this.clickCount == 1) {
				this.startTime = new Date().getTime();
				setTimeout(() => {
					this.clickCount = this.startTime = this.endTime = 0;
				}, 200);
			} else if (this.clickCount == 2) {
				this.endTime = new Date().getTime();
				if (this.endTime - this.startTime < 300) {
					this.getAppInfo();
					this.isShowCenter = !this.isShowCenter;
					setTimeout(() => {
						this.isShowCenter = !this.isShowCenter;
					}, 3000);
				}
				this.clickCount = this.startTime = this.endTime = 0;
			}
		},
		getAppInfo () {
			this.version = plus.runtime.version;
			this.curIP = getApp().globalData.Base.getIpAddress().ip;
			this.authIP = uni.getStorageSync('authTerminalIP');
		}
	},
};
</script>

<style lang="less">
@import '../../common/less/index.less';
</style>
