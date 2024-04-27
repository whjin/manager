<template>
	<div v-if="showNavBar" class="nav-bar-container nav-bar-img">
		<div class="nav-bar-title">
			<text @click="onClickInit">{{ title }}</text>
		</div>
		<div class="nav-bar-home" :class="position">
			<div v-if="homeState" class="operating" @touchstart.stop="onClickHome">
				<common-icons iconType="iconhome" size="45" color="#fff" />
			</div>
			<div v-if="backState" class="operating" @touchstart.stop="onClickBack">
				<common-icons iconType="iconback" size="40" color="#fff" />
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex";

import commonIcons from "@/components/common-icons/common-icons.vue";

export default {
	name: "NavBar",
	props: {
		showNavBar: {
			type: Boolean,
			default: true,
		},
		currentTab: {
			type: Number,
			default: 1,
		},
		title: {
			type: String,
			default: "监管智能交互终端系统",
		},
		homeState: {
			type: Boolean,
			default: true,
		},
		backState: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		...mapState({
			// 当前页面是否为每日巡诊
			isDiagnosisPage: (state) => state.app.isDiagnosisPage
		}),
		// 操作栏显示位置
		position () {
			return uni.getStorageSync("navbarPosition") || "right";
		},
	},
	components: {
		commonIcons,
	},
	methods: {
		onClickInit () {
			this.$emit("click-init");
		},
		// 返回首页
		onClickHome () {
			this.$emit("click-home");
		},
		// 页面回退
		onClickBack () {
			if (this.isDiagnosisPage) {
				uni.$emit('diagnosis-back');
			} else {
				this.$emit("click-back");
			}
		},
	},
};
</script>

<style lang="less">
.nav-bar-container {
	width: 100%;
	height: 81.25upx;
	box-sizing: border-box;
	.nav-bar-title {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.nav-bar-home {
		display: flex;
		align-items: center;
		position: absolute;
		z-index: 9999;
		top: 32upx;
	}
	.right {
		right: 0;
		.operating {
			padding: 0 36upx 42upx 0;
		}
	}
	.left {
		left: 0;
		.operating {
			padding: 0 0 42upx 36upx;
		}
	}
}
</style>
