<template>
  <view class="shopping main-area" @touchstart.stop="handlePageClick">
    <view class="uni-flex page-title">
      <text>{{ title }}</text>
    </view>
    <view class="uni-flex uni-flex-item" style="width: 100%; height: 85%">
      <view class="tabs-list">
        <view v-for="tab in tabConfig" :key="tab.page" class="tab" :class="{ 'active': tab.page === curPage }">
          <common-icons :iconType="tab.icon" size="39" color="#fff" />
          <text class="title">{{ tab.title }}</text>
        </view>
      </view>
      <view class="shopping-details">
        <view class="search-wrapper">
          <view class="search-param">
            <view class="title">在押人员：</view>
            <fuzzy-search class="inside-border" placeholder="请输入在押人员" :request="request" @input="handleSearchInput" @selected="handleSearchSelect"></fuzzy-search>
          </view>
          <view class="search-param">
            <view class="title">档案编号：</view>
            <input class="inside-border" type="text" placeholder="请输入档案编号" v-model="searchParams.dabh">
          </view>
          <view class="search-param">
            <view class="title">确认状态：</view>
            <xfl-select ref="xflSelect" :clearable="false" :list="confirmStatusList" @change="setConfirmStatus" initValue="全部" :widthStyle="180" class="xfl-select"></xfl-select>
          </view>
          <view class="search-btn-wrapper">
            <button class="search-btn" type="primary" @touchstart.stop="refresh">查询</button>
            <button class="search-btn" type="primary" @touchstart.stop="refresh">刷新</button>
          </view>
        </view>
        <view class="head">
          <text v-for="i in headerConfig" :key="i.code" class="title" :class="i.class">{{ i.title }}</text>
        </view>
        <scroll-view class="swiper" scroll-y @scrolltolower="handleSearchDataToLower">
          <view class="swiper-item">
            <ul class="list" v-if="shoppingList && shoppingList.length && shoppingList[0]">
              <li v-for="(record, index) in shoppingList" :key="record.detailNo" class="list-row">
                <template v-for="(config) in headerConfig">
                  <text v-if="config.code === 'index'" :key="config.code" class="list-col">{{ index + 1 }}</text>
                  <text v-else-if="config.code === 'printTime' || config.code === 'confirmTime'" :key="config.code" class="list-col col-2">{{ record[config.code] | dateFormatFilter }}</text>
                  <text v-else-if="config.code === 'confirmStatus'" :key="config.code" class="list-col">{{ Number(record[config.code]) ? '已确认' : '未确认' }}</text>
                  <text v-else :key="config.code" class="list-col" :class="{'col-2': config.code === 'dabh'}">{{ record[config.code] }}</text>
                </template>
              </li>
            </ul>
            <ul class="list" v-else>
              <li class="list-row">
                <text class="list-col">暂无数据</text>
              </li>
            </ul>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import Api from '@/common/api.js';

import xflSelect from "@/components/xfl-select/xfl-select.vue";
import fuzzySearch from "@/components/fuzzy-search/fuzzy-search.vue";

import { dateFormat } from "@/common/utils/util.js";

export default {
  name: 'shopping',
  components: {
    xflSelect,
    fuzzySearch,
  },
  data () {
    return {
      title: '购物确认',
      curPage: 1,
      tabConfig: [
        {
          title: '购物确认',
          page: 1,
          icon: 'icongoumaiqueren'
        },
      ],
      confirmStatusList: [
        {
          value: '全部',
          code: ''
        },
        {
          value: '未确认',
          code: '0'
        },
        {
          value: '已确认',
          code: '1'
        },
      ],
      headerConfig: [
        {
          title: '序号',
          code: 'index'
        },
        {
          title: '在押人员',
          code: 'name'
        },
        {
          title: '档案编号',
          code: 'dabh',
          class: 'flex-2'
        },
        {
          title: '打印时间',
          code: 'printTime',
          class: 'flex-2'
        },
        {
          title: '确认时间',
          code: 'confirmTime',
          class: 'flex-2'
        },
        {
          title: '确认状态',
          code: 'confirmStatus'
        },
      ],
      shoppingList: [],
      listTotal: 0,
      searchParams: {
        roomNo: uni.getStorageSync("managerInfo").roomNo,
        name: '',
        dabh: '',
        confirmStatus: ''
      },
      // 分页参数
      pageParam: {
        pageIndex: 1,
        pageSize: 15
      },
      // 在押人员模糊查询参数
      request: {
        type: 'get',
        api: Api.police.shopping.getAllPrisoner,
        param: 'keyword',
        extraParam: {
          roomNo: uni.getStorageSync("managerInfo").roomNo
        },
        showField: 'name'
      }
    };
  },
  filters: {
    dateFormatFilter (val) {
      if (!val) return '-';
      return dateFormat('YYYY-MM-DD hh:mm', new Date(val));
    }
  },
  methods: {
    // 点击页面
    handlePageClick (e) {
      this.$parent.initCountTimer();
    },
    handleSearchDataToLower () {
      if (this.shoppingList.length >= this.listTotal) {
        return this.$parent.handleShowToast("暂无更多数据", "center");
      }
      this.pageParam.pageIndex += 1;
      this.getConfirmList();
    },
    handleSearchInput (val) {
      this.searchParams.name = val;
    },
    handleSearchSelect (val) {
      this.searchParams.name = val.name;
    },
    setConfirmStatus (val) {
      this.searchParams.confirmStatus = val.orignItem.code;
    },
    // 获取订单确认记录
    async getConfirmList () {
      let params = {
        data: this.searchParams,
        pageParam: this.pageParam
      };
      let res = await Api.apiCall('post', Api.police.shopping.getConfirmList, params, true);
      if (res.state.code === 200) {
        let data = (res && res.data) || [];
        let total = (res.page && res.page.total) || 0;
        if (this.pageParam.pageIndex === 1) {
          this.shoppingList = data;
        } else {
          this.shoppingList = this.recordList.concat(data);
        }
        this.listTotal = total;
      } else {
        this.$parent.handleShowToast((res.state && res.state.msg) || `获取订单确认记录失败！code：${res.state && res.state.code}`, "center");
      }
    },
    refresh () {
      this.resetPageParam();
      this.getConfirmList();
    },
    resetPageParam () {
      this.pageParam = {
        pageIndex: 1,
        pageSize: 15
      };
    }
  },
  created () {
    this.getConfirmList();
  },
}
</script>

<style lang="less" scoped>
@import '@/common/less/form.less';
@import '@/common/less/unitConfig.less';

.tabs-list {
  .px2upx(padding-left, 69);
  .px2upx(padding-right, 69);
  border-right: 1px solid #00c6ff;
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

.shopping-details {
  .px2upx(padding-left, 69);
  .px2upx(padding-right, 69);
  width: 100%;
  .search-wrapper {
    .px2upx(margin-bottom, 30);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .search-param {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .title {
        .px2upx(font-size, 28);
      }
      .inside-border {
        .px2upx(margin-right, 20);
        .px2upx(width, 260);
        .px2upx(height, 50);
        box-sizing: border-box;
        .px2upx(font-size, 25);
      }
    }
    .search-btn-wrapper {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex: 1;

      .search-btn {
        .px2upx(margin-left, 30);
        margin-right: 0;
        .px2upx(font-size, 25);
      }
    }
  }
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
        flex: 1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .px2upx(font-size, 26);
        &.col-2 {
          flex: 2;
        }
      }
    }
  }
}

.swiper {
  width: 100%;
  .px2upx(height, 500);
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
}
</style>