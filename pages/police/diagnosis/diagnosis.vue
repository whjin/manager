<template>
  <view class="diagnosis main-area" @click.stop="handlePageClick">
    <view class="uni-flex page-title">
      <text>{{ title }}</text>
    </view>
    <view class="uni-flex uni-flex-item" style="width: 100%; height: 85%">
      <!-- 在押人员列表 -->
      <view class="list-of-cell-personnel" v-show="showPrisonerList">
        <scroll-view class="swiper" scroll-y>
          <view class="swiper-item">
            <div class="person-details" v-for="i in prisonerList" :key="i.rybh">
              <view class="img-box inner-glow-box">
                <image class="img" :src="i.imgUrl"></image>
                <text class="name">{{ i.xm }}</text>
              </view>
              <view class="prescribe-btn" @click="handlePrescribe(i)">开药</view>
            </div>
          </view>
        </scroll-view>
      </view>
      <!-- 开药/处方操作页 -->
      <view class="diagnosis-page" v-if="!showPrisonerList">
        <view class="tabs-list">
          <view v-for="tab in tabConfig" :key="tab.page" class="tab" :class="{ 'active': tab.page == curPage }"
            @click="changeTab(tab.page)">
            <common-icons :iconType="tab.icon" size="39" color="#fff" />
            <text class="title">{{ tab.title }}</text>
          </view>
        </view>
        <view class="diagnosis-form">
          <drugDelivery v-show="curPage == 1" ref="drugDelivery" :selectedPrisoner="selectedPrisoner"
            :personInfo="personInfo" :nowTimestamp="nowTimestamp" />
          <prescribe v-show="curPage == 2" ref="prescribe" :selectedPrisoner="selectedPrisoner" :personInfo="personInfo"
            :nowTimestamp="nowTimestamp" />
          <view class="prescription" v-show="curPage == 3">
            <view class="head">
              <text v-for="i in recordConfig" :key="i.code" class="title">{{ i.title }}</text>
            </view>
            <scroll-view class="swiper small-swiper" scroll-y @scrolltolower="handleSearchDataToLower">
              <view class="swiper-item">
                <ul class="list" v-if="recordList && recordList.length && recordList[0]">
                  <li v-for="(record, index) in recordList" :key="record.prescribeNo" class="list-row">
                    <template v-for="(config) in recordConfig">
                      <text v-if="config.code == 'index'" :key="config.code" class="list-col">{{ index + 1 }}</text>
                      <text v-else-if="config.code == 'name' || config.code == 'archivesNo' || config.code == 'sex'"
                        :key="config.code + 0" class="list-col">{{ selectedPrisoner[config.code] }}</text>
                      <text v-else-if="config.code == 'treatTime'" :key="config.code + 1" class="list-col">{{
                        record[config.code] | dateFormatFilter }}</text>
                      <text v-else-if="config.code == 'operate'" :key="config.code + 2" class="list-col check"
                        @click="handleCheckDetail(record)">查看详情</text>
                      <text v-else :key="config.code + 3" class="list-col">{{ record[config.code] }}</text>
                    </template>
                  </li>
                </ul>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </view>
    <neil-modal :show="isShowDetails" :autoClose="true" @close="handleDetailsClose">
      <view class="record-details-wrapper">
        <!-- 顶部操作栏 -->
        <view class="modal-header" style="padding: 0;">
          <view class="modal-title">巡诊记录详情</view>
          <div class="modal-close" @click="handleDetailsClose">
            <image src="/static/images/common/close.png"></image>
          </div>
        </view>
        <view class="page-horizontal-divider" style="margin-bottom: 30upx;"></view>
        <prescribe :isShowDetails="true" :selectedPrisoner="selectedPrisoner" :details="selectedRecordDetails"
          :personInfo="personInfo" />
      </view>
    </neil-modal>
  </view>
</template>

<script>
import Api from '@/common/api.js';
import { mapState, mapMutations } from "vuex";

import commonIcons from "@/components/common-icons/common-icons.vue";
import ePicker from "@/components/e-picker/e-picker.vue";
import drugDelivery from './components/drugDelivery.vue';
import prescribe from './components/prescribe.vue';
import neilModal from "@/components/neil-modal/neil-modal.vue";

import { dateFormat } from "@/common/utils/util.js";

export default {
  name: 'diagnosis',
  components: {
    commonIcons,
    ePicker,
    drugDelivery,
    prescribe,
    neilModal
  },
  data() {
    return {
      title: '每日巡诊',
      roomId: uni.getStorageSync("managerInfo").roomId,
      showPrisonerList: true, // 显示人员列表
      selectedPrisoner: {}, // 被选中的在押人员
      prisonerList: [
        // {
        //   "txhj":"",
        //   "majorillness":"",
        //   "xm":"诸葛芝英",
        //   "rybh":"111",
        //   "fxdj":"2",
        //   "jshj":"",
        //   "lshj":"", 
        //   "mz":"01",
        //   "rotator":"",
        //   "imgUrl": "",
        //   "nutrition": ""
        // }
      ],
      curPage: 1,
      tabConfig: [
        {
          title: '巡诊出药',
          page: 1,
          icon: 'iconxunzhenchuyao'
        },
        {
          title: '巡诊开处方',
          page: 2,
          icon: 'iconrecord'
        },
        {
          title: '巡诊记录',
          page: 3,
          icon: 'iconxunzhenjilu'
        },
      ],
      recordConfig: [
        {
          title: '序号',
          code: 'index'
        },
        {
          title: '姓名',
          code: 'name'
        },
        {
          title: '档案编号',
          code: 'archivesNo'
        },
        {
          title: '性别',
          code: 'sex'
        },
        {
          title: '处方单号',
          code: 'prescribeNo'
        },
        {
          title: '初步诊断',
          code: 'diagnosis'
        },
        {
          title: '巡诊时间',
          code: 'treatTime'
        },
        {
          title: '操作',
          code: 'operate'
        },
      ],
      recordList: [], // 记录列表
      selectedRecord: {}, // 被查看的记录
      recordDetail: [], // 记录详情
      isShowDetails: false, // 显示详情弹框
      // 分页参数
      pageParam: {
        pageIndex: 1,
        pageSize: 15
      },
      recordTotal: 0, // 记录总数
      // 当前时间戳
      nowTimestamp: 0
    };
  },
  computed: {
    ...mapState({
      // 登录人员信息
      personInfo: (state) => state.app.personInfo,
      // 当前页面是否为每日巡诊
      isDiagnosisPage: (state) => state.app.isDiagnosisPage
    }),
    selectedRecordDetails() {
      let recipeList = []; // 处方列表
      let transfuseList = []; // 输液列表
      if (this.selectedRecord.dataSource == '0') {
        this.selectedRecord.outDate = this.recordDetail[0] && this.recordDetail[0].outDate || '';
        recipeList = this.recordDetail;
      } else {
        recipeList = this.recordDetail.filter(record => {
          return !record.drugGroup;
        });
        transfuseList = this.recordDetail.filter(record => {
          return record.drugGroup;
        });
      }
      return Object.assign({}, this.selectedRecord, {
        recipeList,
        transfuseList
      });
    }
  },
  filters: {
    dateFormatFilter(val) {
      if (!val) return '无';
      return dateFormat('YYYY-MM-DD', new Date(val));
    }
  },
  destroyed() {
    this.isShowDetails = false;
  },
  methods: {
    ...mapMutations({
      // 设置视频对讲信息
      setIsDiagnosisPage: 'app/SET_ISDIAGNOSISPAFE',
    }),
    // 点击页面
    handlePageClick(e) {
      if (this.curPage == 1) {
        this.$refs.drugDelivery && this.$refs.drugDelivery.hideResult();
      } else if (this.curPage == 2) {
        this.$refs.prescribe && this.$refs.prescribe.hideResult();
      }
    },
    changeTab(page) {
      if (this.curPage == page) return;
      this.curPage = page;
      if (page == 3) {
        this.pageParam.pageIndex = 1;
        this.getRoundVisitsRecord();
      }
    },
    // 获取在押人员列表
    async getRoomPrisonerList() {
      let params = {
        data: {
          roomId: this.roomId
        },
        pageParam: {
          pageIndex: 1,
          pageSize: 50
        }
      };
      let res = await Api.apiCall('post', Api.main.getRoomPrisonerInfo, params, true);
      if (res.state.code == 200) {
        this.prisonerList = res.data;
        this.nowTimestamp = res.date || new Date().getTime();
      }
    },
    // 开药
    handlePrescribe(prisoner) {
      this.getPrisonerInfo(prisoner.rybh);
    },
    // 获取人员详情
    async getPrisonerInfo(rybh) {
      let params = {
        data: {
          personNo: rybh
        }
      };
      let res = await Api.apiCall('post', Api.police.diagnosis.getPrisonerInfo, params, true);
      if (res.state.code == 200) {
        this.selectedPrisoner = (res.data && res.data[0] && Object.assign({}, res.data[0], {
          rybh
        })) || {
          rybh
        };
        this.showPrisonerList = false;
      }
    },
    // 获取巡诊记录
    async getRoundVisitsRecord() {
      let params = {
        data: {
          personNo: this.selectedPrisoner.rybh
        },
        pageParam: this.pageParam
      };
      let res = await Api.apiCall('post', Api.police.diagnosis.getRoundVisitsRecord, params, true);
      if (res.state.code == 200) {
        let data = (res && res.data) || [];
        let total = (res.page && res.page.total) || 0;
        if (this.pageParam.pageIndex == 1) {
          this.recordList = data;
        } else {
          this.recordList = this.recordList.concat(data);
        }
        this.recordTotal = total;
      } else {
        this.$parent.handleShowToast((res.state && res.state.msg) || `获取巡诊记录失败！code：${res.state && res.state.code}`, "center");
      }
    },
    // 详情滚动触底回调
    handleSearchDataToLower() {
      if (this.recordList.length >= this.recordTotal) {
        return this.$parent.handleShowToast("暂无更多数据", "center");
      }
      this.pageParam.pageIndex += 1;
      this.getRoundVisitsRecord();
    },
    // 点击查看详情
    handleCheckDetail(record) {
      this.selectedRecord = record;
      this.getRecordDetail();
    },
    handleDetailsClose() {
      this.isShowDetails = false;
    },
    // 获取巡诊记录详情
    async getRecordDetail() {
      let params = {
        data: {
          prescribeNo: this.selectedRecord.prescribeNo
        }
      };
      let res = await Api.apiCall('post', Api.police.diagnosis.getRecordDetail, params, true);
      if (res.state.code == 200) {
        this.recordDetail = res.data;
        this.isShowDetails = true;
      } else {
        this.$parent.handleShowToast((res.state && res.state.msg) || `获取巡诊记录详情失败！code：${res.state && res.state.code}`, "center");
      }
    },
    init() {
      this.getRoomPrisonerList();
      this.setIsDiagnosisPage(true);
      uni.$off('diagnosis-back');
      uni.$on('diagnosis-back', () => {
        if (this.showPrisonerList) {
          this.setIsDiagnosisPage(false);
          this.$parent.onClickBack();
        } else {
          this.showPrisonerList = true;
        }
      });
    }
  },

  created() {
    this.init();
  },
};
</script>

<style lang="less" scoped>
@import '@/common/less/form.less';
@import '@/common/less/unitConfig.less';
@import "@/common/less/neilModalHead.less";

.inner-glow-box {
  padding: 10.84upx 20.84upx 20.84upx;
  box-sizing: border-box;
  border: 1px solid #00c6ff;
  border-radius: 4px;
  box-shadow: inset 0upx 0upx 5upx 5upx rgba(25, 106, 190, 0.5);
}

.swiper {
  width: 100%;
  height: 470upx;

  .swiper-item {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;

    &.cushion {
      .px2upx(padding-bottom, 300);
    }
  }

  &.small-swiper {
    height: 427upx;
  }
}

.list-of-cell-personnel {
  padding: 0 156.25upx;

  .person-details {
    margin-left: 68.06upx;
    margin-bottom: 30.6upx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    &:nth-child(1),
    &:nth-child(6n + 1) {
      margin-left: 0;
    }

    .img-box {
      padding: 10.417upx;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      box-sizing: border-box;

      .img {
        width: 90.28upx;
        height: 111.11upx;
      }

      .name {
        width: 90.28upx;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        font-size: 15.28upx;
      }
    }

    .prescribe-btn {
      margin-top: 10.417upx;
      padding: 9.5upx 30upx;
      border-radius: 4px;
      font-size: 15.28upx;
      background-color: #3396ff;
    }
  }
}

.diagnosis-page {
  padding-left: 48.61upx;
  width: 100%;
  .px2upx(padding-right, 46);
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  .tabs-list {
    padding-right: 20.83upx;
    box-sizing: border-box;

    .tab {
      margin-bottom: 26.39upx;
      .px2upx(width, 160);
      .px2upx(height, 160);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background-color: #004b76;

      &.active {
        background-color: #007aff;
      }

      border-radius: 4px;

      .title {
        .px2upx(margin-top, 15);
        font-size: 18.06upx;
      }
    }
  }

  .diagnosis-form {
    .px2upx(padding-left, 50);
    width: 100%;
    border-left: 1px solid #00c6ff;
  }
}

.prescription {
  width: 100%;

  .head {
    width: 100%;
    .px2upx(height, 62);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background-color: rgba(17, 62, 141, 0.5);
    box-sizing: border-box;

    .title {
      flex: 1;
      text-align: center;
      .px2upx(font-size, 28);

      &.flex-2 {
        flex: 2;
      }
    }
  }

  .list {
    padding: 0;
    width: 100%;

    .list-row {
      width: 100%;
      .px2upx(height, 66);
      display: flex;
      justify-content: flex-start;
      align-items: center;
      box-sizing: border-box;
      border-bottom: 1px solid rgba(17, 62, 141, 0.9);

      .list-col {
        .px2upx(padding-left, 20);
        .px2upx(padding-right, 20);
        flex: 1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .px2upx(font-size, 26);

        &.check {
          color: #35fffa;
          cursor: pointer;
        }
      }
    }
  }
}

.record-details-wrapper {
  .px2upx(padding-left, 60);
  .px2upx(padding-right, 60);
  .px2upx(width, 1565);
}
</style>