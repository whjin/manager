<template>
  <div class="patrol-container">
    <div class="patrol-wrapper">
      <div class="patrol-title">
        <text>巡诊登记</text>
      </div>
      <div class="patrol-content">
        <div class="patrol-menu-list">
          <div class="patrol-menu-item" :class="currentPage == 1 ? 'patrol-menu-active' : ''" @click="switchPage(1)">
            <common-icons iconType="icondispose" size="38" color="#fff" />
            <text>巡诊打卡</text>
          </div>
          <div class="patrol-menu-item" :class="currentPage == 2 ? 'patrol-menu-active' : ''" @click="switchPage(2)">
            <common-icons iconType="iconrecord" size="46" color="#fff" />
            <text>巡诊登记</text>
          </div>
        </div>
        <div class="page-vertical-divider"></div>
        <div class="patrol-table-wrapper" v-if="currentPage == 1">
          <div class="table-head">
            <div class="table-head-item" v-for="(item, index) in clockColumns" :key="index" :style="{ flex: item.flex }">
              {{ item.title }}
            </div>
          </div>
          <scroll-view scroll-y="true" class="patrol-clock-scroll">
            <div v-if="clockList.length">
              <div class="table-content-list" v-for="(item, index) in clockList" :key="index">
                <div class="content-item" style="flex: 1">
                  {{ item.roomName }}
                </div>
                <div class="content-item" style="flex: 1">
                  {{ item.userName }}
                </div>
                <div class="content-item" style="flex: 1">
                  {{ item.time }}
                </div>
              </div>
            </div>
            <div v-else class="table-content-empty">暂无数据</div>
          </scroll-view>
          <div class="patrol-button">
            <div class="button" @click="handlePatrolClock">打卡</div>
          </div>
        </div>
        <div class="patrol-table-wrapper" v-if="currentPage == 2">
          <div class="table-head">
            <div class="table-head-item" v-for="(item, index) in patrolColumns" :key="index" :style="{ flex: item.flex }">
              {{ item.title }}
            </div>
          </div>
          <scroll-view scroll-y="true" class="patrol-table-scroll">
            <div v-if="patrolList.length">
              <div class="table-content-list" v-for="(item, index) in patrolList" :key="index">
                <div class="content-item" style="flex: 1">
                  {{ item.xm }}
                </div>
                <div class="content-item content-section" style="flex: 2">
                  <div class="content">{{ item.name }}</div>
                </div>
                <div class="content-item" style="flex: 1">
                  {{ item.date }}
                </div>
                <div class="content-item" style="flex: 1">
                  {{ item.status }}
                </div>
                <div class="content-item" style="flex: 1">
                  <div class="button" @click="openPatrolModal(item)">
                    登记
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="table-content-empty">暂无数据</div>
          </scroll-view>
        </div>
      </div>
    </div>
    <div class="neil-modal-container">
      <neil-modal :show="showPatrolModal" @close="closeModal('PatrolModal')">
        <div class="common-modal-container">
          <div class="modal-header">
            <div class="modal-title">巡诊登记</div>
            <div class="modal-close" @click="closeModal('PatrolModal')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <view class="modal-horizontal-divider"></view>
          <div class="common-modal-content">
            <div class="form-item">
              <label>状态：</label>
              <xfl-select ref="patrolRef" :list="patrolTypeList" :placeholder="'请选择巡诊状态'" @change="selectPatrolType"
                @clear="clearPatrolType"></xfl-select>
            </div>
            <div class="form-item">
              <label>备注：</label>
              <textarea :value="patrolRemark" :maxlength="-1" @input="patrolRemarkChange"></textarea>
            </div>
            <div class="form-item form-button">
              <div class="button" @click="savePatrolInfo">提交</div>
            </div>
          </div>
        </div>
      </neil-modal>
    </div>
  </div>
</template>
  
<script>
import Api from "@/common/api";
import xflSelect from "@/components/xfl-select/xfl-select.vue";
import { dateFormat } from "@/common/utils/util.js";
import { mapState } from "vuex";
import patrolColumns from "@/static/mock/patrolColumns.json";
import clockColumns from "@/static/mock/clockColumns.json";

export default {
  name: "patrol",
  components: {
    xflSelect
  },
  data() {
    return {
      currentPage: 1,
      // 巡诊打卡表头
      clockColumns: clockColumns,
      // 巡诊登记表头
      patrolColumns: patrolColumns,
      // 巡诊打卡列表
      clockList: [],
      // 巡诊登记列表
      patrolList: [],
      // 巡诊信息
      patrolInfo: {},
      // 巡诊登记弹框
      showPatrolModal: false,
      // 巡诊状态
      patrolTypeList: [
        {
          code: "0",
          value: "正常"
        },
        {
          code: "1",
          value: "异常"
        }
      ],
      patrolStatus: "",
      patrolRemark: "",
    };
  },
  computed: {
    ...mapState({
      // 登录人员信息
      personInfo: (state) => state.app.personInfo,
    }),
  },
  created() {
    // 获取巡诊打卡信息
    this.getClockPatrolInfo();
    // 开启倒计时
    this.$parent.countTimer();
  },
  methods: {
    // 菜单切换
    switchPage(index) {
      this.currentPage = index;
      if (this.currentPage == 1) {
        // 获取巡诊打卡信息
        this.getClockPatrolInfo();
      } else {
        // 获取巡诊登记信息
        this.getPatrolInfo();
      }
    },
    // 获取巡诊打卡信息
    async getClockPatrolInfo() {
      const { roomId } = uni.getStorageSync("managerInfo");
      let res = await Api.apiCall("post", Api.police.patrol.findPatrolInfo, { data: { roomId } });
      if (res.state.code == 200) {
        this.clockList = res.data;
        if (this.clockList.length) {
          this.clockList.map(item => {
            item.time = dateFormat("YYYY-MM-DD hh:mm:ss", new Date(item.time));
          });
        }
      }
    },
    // 获取巡诊登记信息   
    async getPatrolInfo() {
      const { roomNo } = uni.getStorageSync("managerInfo");
      let res = await Api.apiCall("post", Api.police.patrol.getIllnessAppointmentListByRoomNo, { data: { roomNo } });
      if (res.state.code == 200) {
        this.patrolList = res.data;
        if (this.patrolList.length) {
          this.patrolList.map(item => {
            item.date = dateFormat("YYYY-MM-DD hh:mm:ss", new Date(item.date));
          });
        }
      }
    },
    // 巡诊打卡
    async handlePatrolClock() {
      const { roomId } = uni.getStorageSync("managerInfo");
      const { userId } = this.personInfo;
      let params = {
        data: { roomId, userId }
      };
      let res = await Api.apiCall("post", Api.police.patrol.savePatrolInfo, params);
      if (res.state.code == 200) {
        this.$parent.handleShowToast("保存巡诊打卡信息成功");
        this.getClockPatrolInfo();
      }
    },
    // 打开巡诊登记弹框
    openPatrolModal(info) {
      this.patrolInfo = info;
      const { patrolStatus, patrolRemark } = this.patrolInfo;
      this.patrolStatus = patrolStatus || "1";
      this.patrolRemark = patrolRemark || "";
      this.showPatrolModal = true;
      this.patrolTypeList.map(item => {
        if (item.code == this.patrolStatus) {
          this.$refs.patrolRef && this.$refs.patrolRef.onClickItem(item.code, item.value);
        }
      });
    },
    // 选择巡诊状态
    selectPatrolType(e) {
      this.patrolStatus = e.orignItem.code;
    },
    clearPatrolType() {
      this.patrolStatus = "";
    },
    // 巡诊备注
    patrolRemarkChange(e) {
      this.patrolRemark = e.detail.value;
    },
    // 保存巡诊登记信息
    async savePatrolInfo() {
      if (!this.patrolStatus) {
        return this.$parent.handleShowToast("请选择巡诊状态", "center");
      }
      const { id } = this.patrolInfo;
      let params = {
        data: {
          reportId: id,
          patrolStatus: this.patrolStatus,
          patrolRemark: this.patrolRemark,
        }
      };
      let res = await Api.apiCall("post", Api.police.patrol.saveReportDiseasePatrol, params);
      if (res.state.code == 200) {
        this.$parent.handleShowToast("保存巡诊登记信息成功");
        this.getPatrolInfo();
        this.patrolStatus = "";
        this.patrolRemark = "";
        this.closeModal("PatrolModal");
      }
    },
    closeModal(type) {
      this[`show${type}`] = false;

    },
  },
};
</script>
  
<style lang="less">
@import "../../../common/less/index.less";
</style>
  