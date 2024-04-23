<template>
  <view class="report-form">
    <scroll-view scroll-y style="width: 100%; height: 470upx;">
      <view class="form">
        <!-- 监室号 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">监室号：</text>
            </view>
            <view class="inside-border input">{{ roomName }}</view>
          </view>
        </view>
        <!-- 违规人员 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">违规人员：</text>
            </view>
            <view v-if="isShowDetails" class="inside-border text-area" style="overflow: auto;">{{ details.rybhs }}</view>
            <view v-else class="inside-border text-area" :class="{
                    'lack-val': !reportParams.rybhs
                  }" style="overflow: auto;">{{ selectedPrisoner }}</view>
          </view>
        </view>
        <!-- 违规人数 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">违规人数：</text>
            </view>
            <view v-if="isShowDetails" class="inside-border input">{{ details.num }}</view>
            <view v-else class="inside-border input">{{ selectedPrisonerArr.length }}</view>
          </view>
        </view>
        <!-- 违规时间 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">违规时间：</text>
            </view>
            <view v-if="isShowDetails" class="inside-border input">{{ details.dateTime | dateFormatFilter }}</view>
            <e-picker v-else mode="dateTime" @change="setDateTime">
              <div class="input inside-border" :class="{
                     'lack-val': !reportParams.dateTime
                   }">{{ reportParams.dateTime || '请选择上报时间' }}</div>
            </e-picker>
          </view>
        </view>
        <!-- 违规类型 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">违规类型：</text>
            </view>
            <view v-if="isShowDetails" class="inside-border input">{{ details.violateType }}</view>
            <fuzzySearch v-else @selected="setViolateType" class="inside-border input" :class="{
                           'lack-val': !reportParams.violateType
                         }" placeholder="请选填违规类型" />
          </view>
        </view>
        <!-- 简要情况 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">简要情况：</text>
            </view>
            <textarea v-if="isShowDetails" disabled class="inside-border text-area" :value="details.remarks" />
            <textarea v-else class="inside-border text-area" :class="{
                        'lack-val': !reportParams.remarks
                      }" placeholder="请输入简要情况" :value="reportParams.remarks" />
          </view>
        </view>
        <!-- 记录民警 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">记录民警：</text>
            </view>
            <view class="inside-border input">{{ personInfo.name }}</view>
          </view>
        </view>
        <!-- 登记按钮 -->
        <view v-if="!isShowDetails" class="form-row">
          <view class="report-btn" @click="handleReport">确认登记</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import Api from '@/common/api.js';

import { mapState } from "vuex";

import fuzzySearch from './fuzzySearch.vue';

import { dateFormat } from "@/common/utils/util.js";

export default {
  name: 'reportForm',
  components: {
    fuzzySearch
  },
  props: {
    selectedPrisonerArr: {
      type: Array,
      default () {
        return [];
      }
    },
    details: {
      type: Object,
      default () {
        return {};
      }
    },
    isShowDetails: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      violateTypeText: '',
      reportParams: {
        dateTime: dateFormat('YYYY-MM-DD hh:mm', new Date()), // 违规时间
        remarks: '', // 简要情况
        rybhs: '', // 违规人员
        accountName: '', // 民警
        roomNo: uni.getStorageSync("managerInfo").roomNo, // 监室号
        num: 0, // 违规人数
        violateType: '', // 违规类型
      },
    };
  },
  computed: {
    ...mapState({
      // 登录人员信息
      personInfo: (state) => state.app.personInfo
    }),
    roomName () {
      return uni.getStorageSync("managerInfo").roomName;
    },
    selectedPrisoner () {
      if (!this.selectedPrisonerArr.length) return '无';
      let nameArr = this.selectedPrisonerArr.map(item => {
        return item.xm;
      });
      return nameArr.join('、');
    }
  },
  watch: {
    'selectedPrisonerArr.length' (val) {
      this.reportParams.num = val;
      this.reportParams.rybhs = !val ? '' : this.selectedPrisoner;
      this.setRemarks();
    }
  },
  filters: {
    dateFormatFilter (val) {
      if (!val) return '无';
      return dateFormat('YYYY-MM-DD', new Date(val));
    },
  },
  methods: {
    // 设置违规时间
    setDateTime (time) {
      this.reportParams.dateTime = time;
      this.setRemarks();
    },
    // 设置违规类型
    setViolateType (type) {
      this.reportParams.violateType = type.field_value;
      this.violateTypeText = type.field_name;
      this.setRemarks();
    },
    // 设置简要说明
    setRemarks () {
      let nameArr = (this.selectedPrisonerArr.length && this.selectedPrisonerArr.map(item => item.xm)) || [];
      this.reportParams.remarks = `${this.reportParams.dateTime} ${nameArr.join('、')} ${this.violateTypeText} `;
    },
    // 点击确认登记按钮
    handleReport () {
      if (!this.reportParams.rybhs || !this.reportParams.violateType) {
        return uni.showToast({
          title: '违规上报失败，请填写完整表格！',
          position: 'center',
          icon: "none",
        });
      }
      this.saveViolation();
    },
    // 确认登记
    async saveViolation () {
      let params = Object.assign({}, this.reportParams, {
        accountName: this.personInfo.name
      });
      let res = await Api.apiCall('post', Api.police.conditionReport.saveViolation, params, true);
      if (res.state.code == 200) {
        uni.showToast({
          title: res.data || '违规上报成功！',
          position: 'center',
          icon: "none",
        });
      }
    },
  },
  mounted () {
    this.setRemarks();
  },
}
</script>

<style lang="less" scoped>
@import '@/common/less/form.less';
@import '@/common/less/unitConfig.less';

.report-form {
  margin: auto;
  .px2upx(width, 500);
}

.report-btn {
  .px2upx(width, 160);
  .px2upx(height, 62);
  background-color: #007aff;
  border-radius: 4px;
  .px2upx(font-size, 26);
  .px2upx(line-height, 62);
  text-align: center;
}
</style>