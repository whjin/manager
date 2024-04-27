<template>
  <view class="condition-report main-area" @touchstart.stop="handlePageClick">
    <view class="uni-flex page-title">
      <text>{{ title }}</text>
    </view>
    <view class="uni-flex uni-flex-item" style="width: 100%; height: 85%">
      <view class="content-wrapper">
        <view class="tabs-list">
          <view v-for="tab in tabConfig" :key="tab.page" class="tab" :class="{ 'active': tab.page === curPage }" @click="changeTab(tab.page)">
            <common-icons :iconType="tab.icon" size="39" color="#fff" />
            <text class="title">{{ tab.title }}</text>
          </view>
        </view>
        <view class="content">
          <template v-if="curPage === 1">
            <view class="prisoner-list">
              <view class="select-all">
                请选择在押人员：
                <checkbox-group @change="handleSelectedAll">
                  <label style="display: flex;">
                    <checkbox value="all" :checked="isAllSelected" style="display: flex;" />
                    全部人员
                  </label>
                </checkbox-group>
              </view>
              <scroll-view scroll-y style="width: 100%; height: 450upx;">
                <ul class="list">
                  <li class="li" :class="{ 'inside-border': prisoner.checked }" v-for="(prisoner, index) in cellPersonnelList" :key="prisoner.rybh" @click="handleSelectedPrisoner(index)">
                    <image class="img" :src="prisoner.imgUrl"></image>
                    <text class="name" :class="{ 'checked': prisoner.checked }">{{ prisoner.xm }}</text>
                    <common-icons v-show="prisoner.checked" class="prisoner-checkbox" iconType="iconsuccess" size="24" color="#1296db" />
                  </li>
                </ul>
              </scroll-view>
            </view>
            <reportForm :selectedPrisonerArr="selectedPrisonerArr" />
          </template>

          <view class="prescription" v-else>
            <view class="head">
              <text v-for="i in recordConfig" :key="i.code" class="title">{{ i.title }}</text>
            </view>
            <scroll-view class="swiper small-swiper" scroll-y @scrolltolower="handleSearchDataToLower">
              <view class="swiper-item">
                <ul class="list" v-if="reportRecordList.length">
                  <li v-for="(record, index) in reportRecordList" :key="record.dateTime" class="list-row">
                    <template v-for="(config) in recordConfig">
                      <text v-if="config.code === 'index'" :key="config.code" class="list-col">{{ index + 1 }}</text>
                      <text v-else-if="config.code === 'roomNo'" :key="config.code" class="list-col">{{ roomName }}</text>
                      <text v-else-if="config.code === 'dateTime'" :key="config.code" class="list-col">{{ record[config.code] | dateFormatFilter }}</text>
                      <text v-else-if="config.code === 'operate'" :key="config.code" class="list-col check" @click="handleCheckDetail(record)">查看详情</text>
                      <text v-else :key="config.code" class="list-col">{{ record[config.code] }}</text>
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
        <view class="modal-header">
          <view class="modal-title">违规记录详情</view>
          <div class="modal-close" @click="handleDetailsClose">
            <image src="/static/images/common/close.png"></image>
          </div>
        </view>
        <view class="page-horizontal-divider" style="margin-bottom: 30upx;"></view>
        <reportForm :isShowDetails="true" :details="selectedRecordDetails" />
      </view>
    </neil-modal>
  </view>
</template>

<script>
import Api from '@/common/api.js';

import ePicker from "@/components/e-picker/e-picker.vue";
import commonIcons from "@/components/common-icons/common-icons.vue";
import fuzzySearch from './components/fuzzySearch.vue';
import reportForm from './components/reportForm.vue';
import neilModal from "@/components/neil-modal/neil-modal.vue";

import { dateFormat } from "@/common/utils/util.js";

export default {
  name: 'conditionReport',
  components: {
    ePicker,
    commonIcons,
    fuzzySearch,
    reportForm,
    neilModal
  },
  data () {
    return {
      title: '监室情况上报',
      curPage: 1,
      roomId: uni.getStorageSync('managerInfo').roomId,
      cellPersonnelList: [], // 人员列表
      tabConfig: [
        {
          title: '违规登记',
          page: 1,
          icon: 'iconweiguidengji'
        },
        {
          title: '违规记录',
          page: 2,
          icon: 'iconweiguijilu'
        }
      ],
      selectedPrisonerArr: [], // 已选择人员
      recordConfig: [
        {
          title: '序号',
          code: 'index'
        },
        {
          title: '监室号',
          code: 'roomNo'
        },
        {
          title: '违规人员',
          code: 'rybhs'
        },
        {
          title: '违规人数',
          code: 'num'
        },
        {
          title: '违规时间',
          code: 'dateTime'
        },
        {
          title: '违规类别',
          code: 'violateType'
        },
        {
          title: '简要情况',
          code: 'remarks'
        },
        {
          title: '操作',
          code: 'operate'
        },
      ],
      // 分页参数
      pageParam: {
        pageIndex: 1,
        pageSize: 15
      },
      reportRecordList: [],
      recordTotal: 0,
      selectedRecordDetails: {},
      isShowDetails: false
    };
  },
  computed: {
    roomName () {
      return uni.getStorageSync('managerInfo').roomName;
    },
    isAllSelected () {
      let allSelected = this.selectedPrisonerArr.length === this.cellPersonnelList.length;
      return allSelected;
    },
  },

  filters: {
    dateFormatFilter (val) {
      if (!val) return '无';
      return dateFormat('YYYY-MM-DD', new Date(val));
    },
  },
  destroyed () {
    this.isShowDetails = false;
  },
  methods: {
    // 点击页面
    handlePageClick () {
      this.$parent.initCountTimer();
    },
    changeTab (page) {
      this.curPage = page;
      if (page === 1) {
        this.selectedPrisonerArr = [];
        this.cellPersonnelList.map(item => {
          item.checked = false;
          return item;
        });
      }
      if (page === 2) {
        this.reportRecordList = [];
        this.pageParam.pageIndex = 1;
        this.getViolationRecord();
      }
    },
    // 获取在押人员
    async getRoomPrisonerInfo () {
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
      if (res.state.code === 200) {
        this.cellPersonnelList = res.data;
      }
    },
    // 选择全部人
    handleSelectedAll (evt) {
      if (!evt.detail.value.length) {
        this.cellPersonnelList.map(item => {
          item.checked = false;
          return item;
        });
        this.selectedPrisonerArr = [];
      } else {
        this.cellPersonnelList.map(item => {
          item.checked = true;
          return item;
        });
        this.selectedPrisonerArr = this.cellPersonnelList;
      }
    },
    // 选择在押人员
    handleSelectedPrisoner (index) {
      this.cellPersonnelList[index].checked = !this.cellPersonnelList[index].checked;
      this.selectedPrisonerArr = this.cellPersonnelList.filter(item => item.checked);
    },
    // 获取违规记录
    async getViolationRecord () {
      let params = {
        data: {
          roomNo: uni.getStorageSync('managerInfo').roomNo
        },
        pageParam: this.pageParam
      };
      let res = await Api.apiCall('post', Api.police.conditionReport.getViolationRecord, params, true);
      if (res.state.code === 200) {
        let data = res.data || [];
        let total = (res.page && res.page.total) || 0;
        if (this.pageParam.pageIndex === 1) {
          this.reportRecordList = data;
        } else {
          this.reportRecordList = this.reportRecordList.concat(data);
        }
        this.recordTotal = total;
      } else {
        this.$parent.handleShowToast((res.state && res.state.msg) || `获取违规上报记录失败！code：${res.state && res.state.code}`, "center");
      }
    },
    // 点击查看详情
    handleCheckDetail (record) {
      this.selectedRecordDetails = record;
      this.isShowDetails = true;
    },
    handleDetailsClose () {
      this.isShowDetails = false;
    },
    // 详情滚动触底回调
    handleSearchDataToLower () {
      if (this.reportRecordList.length >= this.recordTotal) {
        return this.$parent.handleShowToast("暂无更多数据", "center");
      }
      this.pageParam.pageIndex += 1;
      this.getViolationRecord();
    },
    init () {
      this.getRoomPrisonerInfo();
    }
  },

  created () {
    this.init();
  },
}
</script>

<style lang="less" scoped>
@import '@/common/less/unitConfig.less';
@import '@/common/less/neilModalHead.less';

.inside-border {
  box-shadow: 0px 0px 6px 0px rgb(27, 146, 239) inset;
  background: rgba(27, 146, 239, 0.25);
  border: #1b92ef 1px solid;
  border-radius: 4px;
}

.content-wrapper {
  padding-left: 48.61upx;
  width: 100%;
  .px2upx(padding-right, 46);
  box-sizing: border-box;
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
  .content {
    .px2upx(padding-left, 40);
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border-left: 1px solid #00c6ff;
    box-sizing: border-box;
  }
}

.prisoner-list {
  .px2upx(margin-right, 40);
  flex: 1;
  border-right: 1px solid #00c6ff;
  .select-all {
    .px2upx(margin-bottom, 20);
    display: flex;
    .px2upx(font-size, 26);
    white-space: nowrap;
  }
  .list {
    padding: 0;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    list-style: none;
    .li {
      .px2upx(margin-left, 40);
      .px2upx(margin-bottom, 40);
      position: relative;
      .px2upx(padding, 15);
      .px2upx(width, 160);
      .px2upx(height, 226);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: column;
      border: 1px solid #4f81b3;
      box-sizing: border-box;
      &:nth-child(1),
      &:nth-child(5n + 1) {
        margin-left: 0;
      }
      .img {
        .px2upx(width, 130);
        .px2upx(height, 160);
      }
      .name {
        .px2upx(width, 80);
        .px2upx(font-size, 20);
        text-align: center;
        overflow: auto;
        white-space: nowrap;
        &.checked {
          color: #00c6ff;
        }
      }
      .prisoner-checkbox {
        position: absolute;
        bottom: 0;
        right: 0;
      }
    }
  }
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

.prescription {
  .px2upx(width, 1560);
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
      .px2upx(font-size, 24);
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
        .px2upx(font-size, 20);
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
  .px2upx(width, 800);
}
</style>