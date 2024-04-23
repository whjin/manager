<template>
	<div class="main-container">
		<div class="main-wrapper">
			<header class="header">
				<h1 class="title">{{ mainTitle }}</h1>
				<div class="goto-btn-wrapper" @touchstart.stop="goToTerminal">
					<div class="goto-btn">请登录进入</div>
				</div>
			</header>
			<div class="contents">
				<div class="left-top-box">
					<!-- 值班人员列表 -->
					<div class="corner-box watchkeeper">
						<i class="left-top corner-icon"></i>
						<i class="left-bottom corner-icon"></i>
						<i class="right-top corner-icon"></i>
						<i class="right-bottom corner-icon"></i>
						<ul class="scroll-list police-list">
							<li class="scroll-item" v-for="(item, index) in policeList" :key="item.id">
								<i v-if="index === 0" class="responsibility-icon" :style="{ 'background-color': '#91E3F7' }"></i>
								<span class="type">{{ item.type + "：" }}</span>
								<scroll-view class="list-of-persons" style="width: 95upx" scroll-x="true">
									<div class="list-details">
										{{ item.name.length ? item.name.join("、") : "无" }}
									</div>
								</scroll-view>
							</li>
						</ul>
						<ul class="scroll-list watchkeeper-list">
							<li class="scroll-item" v-for="item in watchkeeperList" :key="item.type">
								<i class="responsibility-icon" :style="{ 'background-color': item.iconColor }"></i>
								<span class="type">{{ item.type + "：" }}</span>
								<scroll-view class="list-of-persons" scroll-x="true">
									<div class="list-details">
										{{ item.name.length ? item.name.join("、") : "无" }}
									</div>
								</scroll-view>
							</li>
						</ul>
					</div>
					<!-- 危险人员列表 -->
					<div class="corner-box wanted-criminal">
						<i class="left-top corner-icon"></i>
						<i class="left-bottom corner-icon"></i>
						<i class="right-top corner-icon"></i>
						<i class="right-bottom corner-icon"></i>
						<ul class="scroll-list wanted-criminal-list">
							<li class="scroll-item" v-for="item in wantedCriminalList" :key="item.type">
								<span class="type">{{ item.type + "：" }}</span>
								<scroll-view class="list-of-persons" scroll-x="true">
									<div class="list-details">
										{{ item.name.length ? item.name.join("、") : "无" }}
									</div>
								</scroll-view>
							</li>
						</ul>
					</div>
				</div>
				<!-- 监室人员动态框 -->
				<div class="right-top-box">
					<div class="title" :style="roomLevelTextColor">{{ roomLevel }}</div>
				</div>
				<!-- 监室人员列表 -->
				<div class="left-bottom-box">
					<ul class="people-counting-list">
						<li class="people-counting-item inner-glow-box" v-for="item in peopleCountingList" :key="item.code" @click="checkPersonDetails(item)">
							<span class="type">{{ item.type }}</span>
							<span class="num-list">
								<span class="num" v-for="(i, index) in item.numList" :key="index">{{ i }}</span>
							</span>
							<span class="unit">人</span>
						</li>
					</ul>
					<view class="list-of-cell-personnel">
						<swiper class="swiper" :circular="true">
							<swiper-item v-for="(item, index) in cellPersonnelList" :key="index">
								<view class="swiper-item">
									<div class="person-details" v-for="i in item" :key="i.rybh">
										<view class="img-box inner-glow-box">
											<image class="img" :src="i.imgUrl"></image>
											<div class="responsibility-box" v-if="
                          i.isRotator ||
                          i.isMajorillness ||
                          i.isSickMeal
                        ">
												<i class="responsibility-icon" v-if="i.isRotator" :style="{ 'background-color': '#FFBA00' }"></i>
												<i class="responsibility-icon" v-if="i.isMajorillness" :style="{ 'background-color': '#4CC35A' }"></i>
												<i class="responsibility-icon" v-if="i.isSickMeal" :style="{ 'background-color': '#0E6DE9' }"></i>
											</div>
											<div class="nation-icon" v-if="i.isMinority || i.isForeigner">
												<div class="nation" :style="{
                            'background-color':
                              i.isForeigner ? '#E82727' : '#007AFF',
                          }">
													{{ i.isForeigner ? "外" : "少" }}
												</div>
												<div class="triangle" :class="{
                            'triangle-red': i.isForeigner,
                            'triangle-blue': i.isMinority,
                          }"></div>
											</div>
										</view>
										<text class="name">{{ i.xm }}</text>
									</div>
								</view>
							</swiper-item>
						</swiper>
					</view>
				</div>
				<!-- 监室、放风仓视频 -->
				<div class="right-bottom-box">
					<div class="dynamic-box">
						<div class="title">监室人员动态</div>
						<ul class="scroll-list dynamic-list">
							<li class="scroll-item" v-for="item in dynamicList" :key="item.type">
								<span class="type">{{ item.type }}</span>
								<span class="num">{{ item.name.length }}</span>
								<scroll-view class="list-of-persons" scroll-x="true">
									<div class="list-details">
										{{ item.name.length ? item.name.join("、") : "无" }}
									</div>
								</scroll-view>
							</li>
						</ul>
					</div>
					<div class="video-box">
						<video :src="videoUrl" id="roomVideo" codec="software" autoplay :controls="false" style="width: 0px; height: 0px" object-fit="fill" @fullscreenclick="handleFullscreenchange('roomVideo', false)"></video>
						<div class="video-btn" v-for="item in videoList" :key="item.id" @touchstart.stop="handleFullscreenchange(item.id, true)">
							<image class="video-image" :src="item.imgSrc"></image>
							<div class="title">{{ item.title }}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<neil-modal :show="isShowDetails" :autoClose="true" @close="handleDetailsClose">
			<view class="person-details-wrapper">
				<!-- 顶部操作栏 -->
				<view class="modal-header" style="padding: 0 27.77upx;">
					<view class="modal-title">{{ detailsTitle }}</view>
					<div class="modal-close" @click="handleDetailsClose">
						<image src="/static/images/common/close.png"></image>
					</div>
				</view>
				<view class="page-horizontal-divider"></view>
				<myTable :headers="detailsHeader" :contents="detailsContent"></myTable>
			</view>
		</neil-modal>
	</div>
</template>

<script>
import Api from "@/common/api.js";
import Log from "@/common/utils/log.js";
import { mapMutations } from "vuex";
import commonIcons from "@/components/common-icons/common-icons.vue";
import neilModal from "@/components/neil-modal/neil-modal.vue";
import myTable from "@/components/myTable/myTable.vue";

import { dateFormat } from "@/common/utils/util.js";

export default {
	name: "Main",
	components: {
		commonIcons,
		neilModal,
		myTable
	},
	data () {
		return {
			isShowDetails: false,
			detailsType: 'sickMeal',
			sickMealHeader: [
				{
					label: '序号',
					key: 'index'
				},
				{
					label: '在押人员',
					key: 'xm'
				},
				{
					label: '档案编号',
					key: 'dabh'
				},
				{
					label: '病号餐开始时间',
					key: 'mealStartTime'
				},
				{
					label: '病号餐结束时间',
					key: 'mealEndTime'
				},
			],
			minorityHeader: [
				{
					label: '序号',
					key: 'index'
				},
				{
					label: '在押人员',
					key: 'xm'
				},
				{
					label: '档案编号',
					key: 'dabh'
				},
				{
					label: '民族',
					key: 'mzName'
				},
			],
			sickMealList: [], // 病号餐人员列表
			minorityList: [], // 少数民族人员列表
			// 监室等级
			roomLevel: "",
			// 民警列表 主管、协管
			policeList: [
				{
					code: "roomSupervisor",
					type: "主管民警",
					name: [],
				},
				{
					code: "coordinatingPolice",
					type: "协管民警",
					name: [],
				},
			],
			// 轮值、重大疾病、病号餐人员列表
			watchkeeperList: [
				{
					code: "rotator",
					iconColor: "#FFBA00",
					type: "轮值员",
					name: [],
				},
				{
					code: "majorillness",
					iconColor: "#4CC35A",
					type: "重大疾病",
					name: [],
				},
				{
					code: "sickMeal",
					iconColor: "#0E6DE9",
					type: "病号餐人员",
					name: [],
				},
			],
			// 风险人员列表
			wantedCriminalList: [
				{
					level: 2,
					type: "一级风险",
					name: [],
				},
				{
					level: 3,
					type: "二级风险",
					name: [],
				},
				{
					level: 4,
					type: "三级风险",
					name: [],
				},
			],
			// 监室人员动态列表
			dynamicList: [
				{
					code: "lshj",
					type: "律师会见",
					name: [],
				},
				{
					code: "jshj",
					type: "家属会见",
					name: [],
				},
				{
					code: "txhj",
					type: "提讯会见",
					name: [],
				},
			],
			// 人员统计列表
			peopleCountingList: [
				{
					code: "total",
					type: "监室人数",
					numList: [0, 0],
				},
				{
					code: "curNum",
					type: "目前人数",
					numList: [0, 0],
				},
				{
					code: "outdoor",
					type: "外出人数",
					numList: [0, 0],
				},
				{
					code: "foreigner",
					type: "外籍人员",
					numList: [0, 0],
				},
				{
					code: "minority",
					type: "少数民族",
					numList: [0, 0],
				},
				{
					code: "sickMeal",
					type: "病号餐",
					numList: [0, 0],
				},
			],
			// 监仓人员头像列表
			cellPersonnelList: [],
			// 监室、放风仓视频
			videoList: [
				{
					id: "my-video1",
					orderc: 3,
					title: "监室视频",
					imgSrc: "../../../static/images/main/room-video.png",
					videoUrl: "../../../static/video/defaultVideo.mp4",
				},
				{
					id: "my-video3",
					orderc: 1,
					title: "放风仓视频",
					imgSrc: "../../../static/images/main/video.png",
					videoUrl: "../../../static/video/defaultVideo.mp4",
				},
			],
			videoUrl: "../../../static/video/defaultVideo.mp4",
			roomId: uni.getStorageSync("managerInfo").roomId,
			notForeignerArr: ['156', '158', '344', '446'],
			minorityArr: ['01', '57', '58'],
		};
	},
	computed: {
		mainTitle () {
			let areaName = uni.getStorageSync("managerInfo").areaName || "";
			let roomName = uni.getStorageSync("managerInfo").roomName || "";
			return `${areaName} ${roomName}`;
		},
		roomLevelTextColor () {
			let style = {
				"background-image": "-webkit-linear-gradient(#35fffa, #007aff)",
			};
			if (this.roomLevel == "文明监室") {
				style = {
					"background-image": "-webkit-linear-gradient(#00e0af, #00b666)",
				};
			} else if (this.roomLevel == "严管监室") {
				style = {
					"background-image": "-webkit-linear-gradient(#ea5288, #c71445)",
				};
			}
			return style;
		},
		detailsTitle () {
			if (this.detailsType === 'sickMeal') {
				return '病号餐人员';
			} else {
				return '少数民族';
			}
		},
		detailsHeader () {
			if (this.detailsType === 'sickMeal') {
				return this.sickMealHeader;
			} else {
				return this.minorityHeader;
			}
		},
		detailsContent () {
			if (this.detailsType === 'sickMeal') {
				return this.sickMealList;
			} else {
				return this.minorityList;
			}
		}
	},
	mounted () {
		this.initData();
	},
	methods: {
		...mapMutations({
			// 设置当前页面
			setCurrentTab: "app/SET_CURRENTTAB",
			// 保存视频播放信息
			saveVideoInfo: "app/SET_VIDEOINFO",
		}),
		// 刷新首页数据
		refreshData (showTips) {
			Log.writeLog("首页数据刷新", false);
			// 退出全屏
			let videoContext = uni.createVideoContext("roomVideo");
			videoContext.exitFullScreen();
			this.videoUrl = "../../../static/video/defaultVideo.mp4";
			this.$nextTick(() => {
				videoContext.stop();
			});
			this.initData(showTips);
		},
		goToTerminal () {
			this.$parent.countTimer();
			this.setCurrentTab(2);
		},
		// 视频全屏
		handleFullscreenchange (id, isFullScreen) {
			this.saveVideoInfo({ id: "roomVideo", isFullScreen });
			let videoContext = uni.createVideoContext("roomVideo");
			if (isFullScreen) {
				Log.writeLog("点击查看监控视频", false);
				this.videoList.map((item) => {
					if (item.id === id) {
						this.videoUrl = item.videoUrl;
						return item;
					}
				});
				this.$nextTick(() => {
					videoContext.requestFullScreen();
				});
			} else {
				Log.writeLog("点击退出查看监控视频", false);
				videoContext.exitFullScreen();
				this.videoUrl = "../../../static/video/defaultVideo.mp4";
				this.$nextTick(() => {
					videoContext.stop();
				});
			}
		},
		// 获取管教人员
		async getRoomPolices () {
			let res = await Api.apiCall("get", Api.main.getRoomPolices + this.roomId, null, true);
			if (res.state.code == 200) {
				this.resetPoliceData();
				this.$nextTick(() => {
					let data = res.data;
					// 主管民警
					this.roomLevel = data.roomLevel;
					let roomSupervisor = data.roomSupervisor;
					if (roomSupervisor && roomSupervisor.name) {
						this.policeList
							.find((i) => {
								return i.code === "roomSupervisor";
							})
							.name.push(`${roomSupervisor.name.substr(0, 1)}警官`);
					}
					// 协管民警
					let coordinatingPolice = data.coordinatingPolice;
					if (coordinatingPolice && coordinatingPolice.length) {
						coordinatingPolice.forEach((item) => {
							this.policeList
								.find((i) => {
									return i.code === "coordinatingPolice";
								})
								.name.push(`${item.name.substr(0, 1)}警官`);
						});
					}
				});
			}
		},
		// 获取在押人员
		async getRoomPrisonerInfo () {
			let params = {
				data: {
					roomId: this.roomId,
				},
				pageParam: {
					pageIndex: 1,
					pageSize: 50,
				},
			};
			let res = await Api.apiCall("post", Api.main.getRoomPrisonerInfo, params, true);
			if (res.state.code == 200) {
				this.resetPrisonerData();
				this.$nextTick(() => {
					let data = res.data;
					if (!data.length) return;
					let personList = [];
					let cellPersonnelList = [];
					let peopleCountingConfig = {
						total: 0,
						curNum: 0,
						outdoor: 0,
						minority: 0,
						foreigner: 0,
						sickMeal: 0
					};

					data.map((item, index) => {
						// 轮值、重大疾病、病号餐人员列表
						this.watchkeeperList.map((i) => {
							if (i.code === 'majorillness' && Number(item[i.code]) === 1) {
								item.isMajorillness = true;
								i.name.push(item.xm);
							} else if (i.code === 'sickMeal' && Number(item.mealStartTime)) {
								item.isSickMeal = true;
								item.mealStartTime = dateFormat('YYYY-MM-DD hh:mm:ss', new Date(item.mealStartTime));
								item.mealEndTime = dateFormat('YYYY-MM-DD hh:mm:ss', new Date(item.mealEndTime));
								i.name.push(item.xm);
							} else if (i.code === 'rotator' && Number(item[i.code])) {
								item.isRotator = true;
								i.name.push(item.xm);
							}
							return i;
						});
						// 风险人员列表
						this.wantedCriminalList.map((i) => {
							if (Number(item.fxdj) === i.level) {
								i.name.push(item.xm);
							}
							return i;
						});
						// 监室人员动态列表
						this.dynamicList.map((i) => {
							if (Number(item[i.code])) {
								i.name.push(item.xm);
							}
							return i;
						});
						// 监仓人员头像列表
						personList.push(item);
						let num = index + 1;
						if (num % 14 === 0 || num === data.length) {
							cellPersonnelList.push(personList);
							personList = [];
						}
						// 少数民族、外籍人员统计
						if (this.notForeignerArr.indexOf(item.gj) < 0) {
							// 外籍人员
							peopleCountingConfig.foreigner += 1;
							item.isForeigner = true;
						} else if (this.minorityArr.indexOf(item.mzValue) < 0) {
							// 少数民族
							item.isMinority = true;
							peopleCountingConfig.minority += 1;
							this.minorityList.push(item);
						}
						if (item.isSickMeal) {
							// 病号餐
							peopleCountingConfig.sickMeal += 1;
							this.sickMealList.push(item);
						}

						return item;
					});

					this.cellPersonnelList = cellPersonnelList;

					// 人员统计列表
					// 总人数
					peopleCountingConfig.total = data.length;
					// 外出人数
					this.dynamicList.forEach((item) => {
						peopleCountingConfig.outdoor += item.name.length;
					});
					// 当前人数
					peopleCountingConfig.curNum = peopleCountingConfig.total - peopleCountingConfig.outdoor;
					// 设置到人员统计列表
					this.peopleCountingList.map((item) => {
						let num = this.replenishZero(peopleCountingConfig[item.code]);
						item.numList = num.split("");
						return item;
					});
				});
			}
		},
		// 获取视频
		async getRoomDeviceInfo (showTips = false) {
			let res = await Api.apiCall("get", Api.main.getRoomDeviceInfo + this.roomId, null, true);
			if (res.state.code == 200) {
				// 刷新提示
				if (showTips) {
					this.$parent.handleShowToast("刷新成功！");
				}
				this.resetVideoData();
				this.$nextTick(() => {
					let data = res.data;
					data.forEach((item) => {
						let url = `rtsp://${item.userName}:${item.passwd}@${item.ip}:${item.url}`;
						this.videoList.map((i) => {
							if (Number(item.orderc) === i.orderc) {
								i.videoUrl = `${url}102`;
								return i;
							}
						});
					});
				});
			}
		},
		initData (showTips = false) {
			this.getRoomPolices();
			this.getRoomPrisonerInfo();
			this.getRoomDeviceInfo(showTips);
		},
		// 重置民警数据
		resetPoliceData () {
			this.policeList = [
				{
					code: "roomSupervisor",
					type: "主管民警",
					name: [],
				},
				{
					code: "coordinatingPolice",
					type: "协管民警",
					name: [],
				},
			];
		},
		// 重置在押人员数据
		resetPrisonerData () {
			this.watchkeeperList = [
				{
					code: "rotator",
					iconColor: "#FFBA00",
					type: "轮值员",
					name: [],
				},
				{
					code: "majorillness",
					iconColor: "#4CC35A",
					type: "重大疾病",
					name: [],
				},
				{
					code: "sickMeal",
					iconColor: "#0E6DE9",
					type: "病号餐人员",
					name: [],
				},
			];
			this.wantedCriminalList = [
				{
					level: 2,
					type: "一级风险",
					name: [],
				},
				{
					level: 3,
					type: "二级风险",
					name: [],
				},
				{
					level: 4,
					type: "三级风险",
					name: [],
				},
			];
			this.dynamicList = [
				{
					code: "lshj",
					type: "律师会见",
					name: [],
				},
				{
					code: "jshj",
					type: "家属会见",
					name: [],
				},
				{
					code: "txhj",
					type: "提讯会见",
					name: [],
				},
			];
			this.sickMealList = [];
			this.minorityList = [];
		},
		// 重置视频数据
		resetVideoData () {
			this.videoList = [
				{
					id: "my-video1",
					orderc: 3,
					title: "监室视频",
					videoUrl: "../../../static/video/defaultVideo.mp4",
				},
				{
					id: "my-video3",
					orderc: 1,
					title: "放风仓视频",
					videoUrl: "../../../static/video/defaultVideo.mp4",
				},
			];
		},
		replenishZero (num) {
			return num < 10 ? "0" + num : "" + num;
		},
		checkPersonDetails (item) {
			this.detailsType = item.code;
			if (this.detailsType === 'minority' || this.detailsType === 'sickMeal') {
				this.isShowDetails = true;
			}
		},
		handleDetailsClose () {
			this.isShowDetails = false;
		}
	},
};
</script>

<style lang="less" scoped>
@import '@/common/less/index.less';
@import '@/common/less/neilModalHead.less';
</style>
