<template>
  <div class="prisonerInfo-container" @touchstart.stop="initCountTimer">
    <div class="prisonerInfo-wrapper">
      <div class="prisonerInfo-title">
        <text>在押人员信息</text>
      </div>
      <scroll-view scroll-y="true" class="prisonerInfo-box-scroll">
        <div class="prisonerInfo-list">
          <div class="prisonerInfo-item" v-for="(item, index) in prisonerInfoList" :key="index" @click="getPersonDetailById(item.id)">
            <div class="item-image-box">
              <image :src="item.imgUrl" alt="image"></image>
              <div class="item-mark">
                <div :class="
                    item.mzValue == '98'
                      ? 'nation-red'
                      : item.mzValue != '01'
                      ? 'nation-blue'
                      : ''
                  ">
                  {{ item.mzValue == "01" ? "" : item.mzValue == "98" ? "外" : "少" }}
                </div>
                <div :class="
                    item.mzValue == '98'
                      ? 'triangle-red'
                      : item.mzValue != '01'
                      ? 'triangle-blue'
                      : ''
                  "></div>
              </div>
            </div>
            <div class="item-name">{{ item.xm }}</div>
          </div>
        </div>
      </scroll-view>
    </div>
    <div class="neil-modal-container">
      <neil-modal :show="showPrisonerInfo">
        <div class="prisonerInfo-modal-box">
          <div class="modal-header">
            <div class="modal-title">
              在押人员基本信息：<text>{{ prisonerInfo.xm }}</text>
            </div>
          </div>
          <div class="modal-horizontal-divider"></div>
          <div class="prisonerInfo-modal-content">
            <div class="prisonerInfo-detail-box">
              <div class="detail-image">
                <image :src="prisonerInfo.img_url"></image>
              </div>
              <div class="detail-content">
                <div class="detail-cell">
                  <text>姓名：</text>
                  <input type="text" v-model="prisonerInfo.xm" disabled />
                </div>
                <div class="detail-cell">
                  <text>性别：</text>
                  <input type="text" v-model="prisonerInfo.xb" disabled />
                </div>
                <div class="detail-cell">
                  <text>番号：</text>
                  <input type="text" v-model="prisonerInfo.fh" disabled />
                </div>
                <div class="detail-cell">
                  <text>政治面貌：</text>
                  <input type="text" v-model="prisonerInfo.zzmm" disabled />
                </div>
                <div class="detail-cell">
                  <text>出生日期：</text>
                  <input type="text" v-model="prisonerInfo.csrq" disabled />
                </div>
                <div class="detail-cell">
                  <text>文化程度：</text>
                  <input type="text" v-model="prisonerInfo.whcd" disabled />
                </div>
                <div class="detail-cell">
                  <text>国籍：</text>
                  <input type="text" v-model="prisonerInfo.gj" disabled />
                </div>
                <div class="detail-cell">
                  <text>工作单位：</text>
                  <input type="text" v-model="prisonerInfo.gzdw" disabled />
                </div>
                <div class="detail-cell">
                  <text>民族：</text>
                  <input type="text" v-model="prisonerInfo.mz" disabled />
                </div>
                <div class="detail-cell">
                  <text>婚姻状况：</text>
                  <input type="text" v-model="prisonerInfo.hyzk" disabled />
                </div>
                <div class="detail-cell">
                  <text>证件类型：</text>
                  <input type="text" v-model="prisonerInfo.zjlx" disabled />
                </div>
                <div class="detail-cell">
                  <text>证件号码：</text>
                  <input type="text" v-model="prisonerInfo.zjhm" disabled />
                </div>
                <div class="detail-cell">
                  <text>涉嫌罪名：</text>
                  <input class="detail-row" type="text" v-model="prisonerInfo.sxzm" disabled />
                </div>
                <div class="detail-cell">
                  <text>现居住址：</text>
                  <input class="detail-row" type="text" v-model="prisonerInfo.xzzxz" disabled />
                </div>
              </div>
            </div>
          </div>
          <div class="prisonerInfo-button">
            <div class="btn-confirm" @touchstart.stop="closeModal('PrisonerInfo')">
              关闭
            </div>
          </div>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import { dateFormat } from "@/common/utils/util.js";
import Api from "@/common/api";

export default {
  name: "prisonerInfo",
  data () {
    return {
      // 人员信息列表
      prisonerInfoList: [],
      // 人员详情
      prisonerInfo: {},
      // 详情弹框
      showPrisonerInfo: false,
    };
  },
  created () {
    // 获取在押人员信息
    this.getRoomPrisonerInfo();
  },
  methods: {
    // 重置倒计时
    initCountTimer () {
      this.$parent.initCountTimer();
    },
    // 获取在押人员信息
    async getRoomPrisonerInfo () {
      let roomId = uni.getStorageSync("managerInfo").roomId;
      let params = {
        data: {
          roomId,
        },
        pageParam: {
          pageIndex: 1,
          pageSize: 50,
        },
      };
      let res = await Api.apiCall("post", Api.main.getRoomPrisonerInfo, params);
      if (res.state.code == "200") {
        let result = res.data;
        if (result.length) {
          this.prisonerInfoList = result;
        } else {
          this.$parent.handleShowToast("暂无数据", "center", 5000);
        }
      }
    },
    // 获取在押人员详情
    async getPersonDetailById (id) {
      this.prisonerInfo = {};
      let res = await Api.apiCall(
        "get",
        Api.index.getOdsPersonById + `?id=${id}`,
        null
      );
      if (res.state.code == "200") {
        let result = res.data;
        if (Object.keys(result).length) {
          result.csrq = dateFormat(
            "YYYY-MM-DD",
            new Date(result.csrq)
          );
          this.prisonerInfo = result;
          this.showPrisonerInfo = true;
        } else {
          this.$parent.handleShowToast("暂无数据", "center", 5000);
        }
      }
    },
    openModal (type) {
      this[`show${type}`] = true;
    },
    closeModal (type) {
      this[`show${type}`] = false;
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
