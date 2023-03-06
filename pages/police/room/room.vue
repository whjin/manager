<template>
  <view>
    <view class="main-area">
      <view class="uni-flex page-title">
        <text>进出监室登记</text>
      </view>
      <view class="uni-flex uni-flex-item" style="height: 85%">
        <view class="uni-flex uni-column page-menu-area">
          <view class="uni-flex uni-column page-menu" :class="currentPage == 1 ? 'page-menu-activate' : ''" @click="switchPage(1)">
            <image src="/static/images/room/out.png" style="width: 46.52upx; height: 46.52upx; margin-top: 15.97upx"></image>
            <text style="line-height: 20.83upx; margin-top: 13.19upx">外出监室\n登记</text>
          </view>
          <view class="uni-flex uni-column page-menu" :class="currentPage == 2 ? 'page-menu-activate' : ''" @click="switchPage(2)">
            <image src="/static/images/room/in.png" style="
                width: 75.69upx;
                height: 46.52upx;
                margin-top: 11.11upx;
                margin-right: 29.86upx;
              "></image>
            <text style="line-height: 20.83upx; margin-top: 13.19upx">返回监室\n登记</text>
          </view>
          <view class="uni-flex uni-column page-menu" :class="currentPage == 3 ? 'page-menu-activate' : ''" @click="switchPage(3)">
            <image src="/static/images/room/record.png" style="width: 35.41upx; height: 42.36upx; margin-top: 9.72upx"></image>
            <text style="line-height: 20.83upx; margin-top: 13.19upx">进出监室\n记录</text>
          </view>
        </view>
        <view class="page-vertical-divider"></view>
        <view v-if="currentPage == 1 ? true : false" class="uni-flex uni-column uni-flex-item" style="width: 1039.58upx; margin-left: 54.16upx">
          <view class="uni-flex">
            <view class="describe" style="width: 136.8upx">{{
              roomInfo.roomName
            }}</view>
            <view class="describe" style="width: 209.02upx">关押人数：{{ totalNum }}人</view>
            <view class="describe" style="width: 325.69upx">外出人数：{{ outlNum }}人</view>
            <view class="describe" style="width: 370upx; text-align: right">责任教官：{{ roomInfo.policeName }}</view>
          </view>
          <view class="uni-flex" style="
              width: 1039.58upx;
              height: 0.69upx;
              opacity: 0.16;
              background: #00c6ff;
              margin-top: 11.8upx;
            "></view>
          <scroll-view scroll-y="true" @scrolltolower="prisonerLoadLower" class="uni-flex uni-row" style="width: 1040upx; flex-direction: row; height: 460upx">
            <view class="uni-flex" style="flex-wrap: wrap">
              <view class="symptoms" v-for="(item, index) in prisonerInfoList" :key="index" :style="index % 5 == 0 ? '' : 'margin-left: 46upx;'">
                <view class="uni-flex" style="margin-top: 20upx; margin-left: 25.69upx">
                  <image :src="
                      item.zp == undefined
                        ? '/static/images/room/none.jpg'
                        : item.zp
                    " style="width: 121.52upx; height: 118.75upx"></image>
                </view>
                <view class="uni-flex text-describe">姓名：{{ item.name }}</view>
                <view class="uni-flex text-describe">编号：{{ item.code }}</view>
                <view class="uni-flex button" @click="openModal('out', index, item)" style="margin-left: 23.83upx; margin-top: 11.8upx">
                  <view style="
                      line-height: 18.05upx;
                      font-size: 18.05upx;
                      margin-top: 9.72upx;
                    ">带出</view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <view v-if="currentPage == 2 ? true : false" class="uni-flex uni-column uni-flex-item" style="width: 1039.58upx; margin-left: 54.16upx">
          <view class="uni-flex">
            <view class="describe" style="width: 136.8upx">{{
              roomInfo.roomName
            }}</view>
            <view class="describe" style="width: 209.02upx">关押人数：{{ totalNum }}人</view>
            <view class="describe" style="width: 325.69upx">外出人数：{{ outlNum }}人</view>
            <view class="describe" style="width: 370upx; text-align: right">责任民警：{{ roomInfo.policeName }}</view>
          </view>
          <view class="uni-flex" style="
              width: 1039.58upx;
              height: 0.69upx;
              opacity: 0.16;
              background: #00c6ff;
              margin-top: 11.8upx;
            "></view>
          <scroll-view scroll-y="true" @scrolltolower="outPrisonerLoadLower" class="uni-flex uni-row" style="width: 1040upx; flex-direction: row; height: 460upx">
            <view class="uni-flex" style="flex-wrap: wrap">
              <view class="symptoms" v-for="(item, index) in outPrisonerInfoList" :key="index" :style="index % 5 == 0 ? '' : 'margin-left: 46upx;'">
                <view class="uni-flex" style="margin-top: 20upx; margin-left: 25.69upx">
                  <image :src="
                      item.zp == undefined
                        ? '/static/images/room/none.jpg'
                        : item.zp
                    " style="width: 121.52upx; height: 118.75upx"></image>
                </view>
                <view class="uni-flex text-describe">姓名：{{ item.name }}</view>
                <view class="uni-flex text-describe">编号：{{ item.code }}</view>
                <view class="uni-flex button" @click="openModal('back', index, item)" style="
                    margin-left: 23.83upx;
                    margin-top: 11.8upx;
                    background-color: #007aff;
                  ">
                  <view style="
                      line-height: 18.05upx;
                      font-size: 18.05upx;
                      margin-top: 9.72upx;
                    ">带回</view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <view v-if="currentPage == 3 ? true : false" class="uni-flex uni-column uni-flex-item" style="width: 1039.58upx; margin-left: 54.16upx">
          <view class="uni-flex">
            <view class="describe" style="margin-left: 20.83upx">在押人员：</view>
            <view style="margin-left: 37.5upx">
              <xfl-select ref="selectPrisonerNo" :clearable="false" :showItemNum="4" :list="prisonerSearchList" :placeholder="'请选择在押人员'" @change="prisonerChangeSearch"></xfl-select>
            </view>
            <view class="describe" style="margin-left: 137.5upx">外出原因：</view>
            <view style="margin-left: 37.5upx">
              <xfl-select ref="outTypeList" :clearable="false" :showItemNum="4" :list="outReasonList" :placeholder="'请选择原因'" @change="outReasonChangeSearch"></xfl-select>
            </view>
          </view>

          <view class="uni-flex" style="margin-top: 15.97upx">
            <view class="describe" style="margin-top: 8upx; margin-left: 20.83upx">外出时间：</view>
            <e-picker mode="dateTime" @change="bindDateTime">
              <view class="record-date">{{ outDateTime }}</view>
            </e-picker>
            <view class="describe" style="margin-top: 8upx; margin-left: 137.5upx">返回时间：</view>
            <e-picker mode="dateTime" @change="bindBackDateTime">
              <view class="record-date">{{ backDateTime }}</view>
            </e-picker>
            <view @click="searchRecord" class="account-operateing-ok" style="margin-left: 5px">查询</view>
          </view>
          <view class="uni-flex" style="width: 950upx; margin-left: 121.52upx; margin-top: 30.55upx">
            <view class="uni-flex uni-column" style="padding: 0 18.75upx; height: 100%; width: 100%">
              <view class="uni-flex" id="thead">
                <view class="uni-flex-item table-th table-th-radius-tl">序号</view>
                <view class="uni-flex-item table-th">在押人员</view>
                <view class="uni-flex-item table-th">编号</view>
                <view class="uni-flex-item table-th">外出原因</view>
                <view class="uni-flex-item table-th" style="flex: 1.5">外出时间</view>
                <view class="uni-flex-item table-th" style="flex: 1.5">返回时间</view>
                <view class="uni-flex-item table-th table-th-radius-tr">负责民警</view>
              </view>
              <scroll-view scroll-y="true" @scrolltolower="accessRecordLoadLower" class="uni-flex-item uni-flex uni-column">
                <view id="tbody" class="uni-flex table-td-divider" v-for="(item, index) in accessRecordInfoList" :key="index">
                  <view class="uni-flex-item table-td">{{ index + 1 }}</view>
                  <view class="uni-flex-item table-td">{{ item.name }}</view>
                  <view class="uni-flex-item table-td">{{ item.code }}</view>
                  <view class="uni-flex-item table-td">{{ item.outType }}</view>
                  <view class="uni-flex-item table-td" style="flex: 1.5">{{
                    item.outTime
                  }}</view>
                  <view class="uni-flex-item table-td" style="flex: 1.5">{{
                    item.backTime
                  }}</view>
                  <view class="uni-flex-item table-td">{{ item.police }}</view>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>
      </view>·
      <neil-modal :show="takeOutConfirm" @close="closeModal('out')">
        <view style="width: 720.62upx; height: 580.41upx">
          <view class="uni-flex model-bar">
            <view class="uni-flex-item model-bar-title">{{ currentPage == 1 ? "带出" : "带回" }}监室</view>
            <view class="uni-flex uni-flex-item model-bar-close" @click="closeModal('out')">
              <image src="/static/images/common/close.png"></image>
            </view>
          </view>
          <view class="page-horizontal-divider"></view>
          <view v-if="currentPage == 1">
            <view class="uni-flex" style="font-size: 20.83upx; margin: 43.05upx 0upx 0upx 157.63upx">外出原因：
              <xfl-select ref="clearSelect" :clearable="false" :showItemNum="4" :list="outReasonList" @change="outReasonChange"></xfl-select>
            </view>
          </view>
          <view class="uni-flex symptoms" style="
              width: 191.66upx;
              height: 160.83upx;
              margin: 33.33upx 0upx 0upx 250.91upx;
              justify-content: center;
            ">
            <image :src="
                outer.zp == undefined
                  ? '/static/images/room/none.jpg'
                  : outer.zp
              " style="width: 137.5upx; height: 134.72upx; margin-top: 15upx"></image>
          </view>
          <view class="uni-flex modal-text">姓名：{{ outer.name }}</view>
          <view class="uni-flex modal-text">编号：{{ outer.code }}</view>
          <view class="uni-flex modal-text">负责民警：{{ roomInfo.policeName }}</view>
          <!-- page == 2 -->
          <view v-if="currentPage == 2">
            <view class="uni-flex modal-text">外出原因：{{ outer.outType }}</view>
          </view>
          <view class="uni-flex button" @click="takeOut(outer)" style="background: #007aff; margin: 45.13upx 0upx 0upx 297.91upx">
            <view style="font-size: 20.83upx; margin-top: 5upx">{{
              currentPage == 1 ? "带出" : "带回"
            }}</view>
          </view>
        </view>
      </neil-modal>
    </view>
    <bottom-bar :name="roomInfo.policeName" />
  </view>
</template>

<script>
import navBar from "@/components/nav-bar/nav-bar.vue";
import bottomBar from "@/components/bottom-bar/bottom-bar.vue";
import neilModal from "@/components/neil-modal/neil-modal.vue";
import ePicker from "@/components/e-picker/e-picker.vue";
import { isNullStr } from "@/common/utils/util.js";
import { mapMutations } from "vuex";
import Api from "@/common/api.js";
export default {
  components: {
    navBar,
    bottomBar,
    neilModal,
    ePicker,
  },
  data () {
    return {
      outType: {},
      outer: {},
      outIndex: 0,
      takeOutConfirm: false,
      roomInfo: {},
      currentPage: 1 /* 1：外出监室登记；2：返回监室登记；3：进出监室记录 */,
      selectListBoxStyle: `height: 40px; width:260px; font-size: 20px;border: #2A4273 1px solid;`,
      selectListBoxStyle2: `height: 40px; width:280px; font-size: 20px;`,
      totalNum: 0,
      outlNum: 0,
      prisonerInfoPageIndex: 1,
      prisonerInfoPageSize: 15,
      prisonerInfoPageLoadFlag: true,
      prisonerInfoList: [],
      outPrisoner: {},
      showGoout: false,
      outReasonList: [],
      selectOutReason: "",
      isSubmitDisable: false,
      outPrisonerInfoList: [],
      showBack: false,
      prisonerSearchList: [],
      selectPrisonerId: "",
      outReasonSearch: "",
      timeStartSearch: "",
      accessRecordPageIndex: 1,
      accessRecordPageSize: 8,
      accessRecordPageLoadFlag: true,
      accessRecordInfoList: [],
      outDateTime: "",
      backDateTime: "",
    };
  },
  created () {
    this.setBottomBar(false);
    let managerInfo = uni.getStorageSync("managerInfo");
    this.getCheckInfo(managerInfo);
    this.getOutReasonList();
  },
  destroyed () {
    this.takeOutConfirm = false;
  },
  methods: {
    ...mapMutations({
      // 设置状态栏显隐
      setBottomBar: "app/SET_BOTTOMBAR",
    }),
    async getCheckInfo (managerInfo) {
      let res = await Api.apiCall("get", Api.mutual.getRoomInfo + "/" + managerInfo.roomId, null, true);
      if (res.state.code == 200) {
        this.roomInfo = res.data;
        this.getPrisonerNum();
        this.loadPrisonerInfo();
      }
    },
    async getPrisonerNum () {
      let params = {
        data: {
          id: this.roomInfo.roomId,
          jsh: this.roomInfo.roomNo,
        },
      };
      let res = await Api.apiCall("post", Api.access.getPrisonersNumByJsh, params);
      if (res.state.code == 200) {
        this.totalNum = res.data.totalNum;
        this.outlNum = res.data.outNum;
      }
    },
    prisonerLoadLower: function (e) {
      if (this.prisonerInfoPageLoadFlag) {
        this.loadPrisonerInfo();
      }
    },
    async loadPrisonerInfo () {
      let params = {
        data: {
          roomId: this.roomInfo.roomId,
          jsh: this.roomInfo.roomNo,
        },
        emptyPage: true,
        pageParam: {
          pageIndex: this.prisonerInfoPageIndex,
          pageSize: this.prisonerInfoPageSize,
        },
      };
      let res = await Api.apiCall("post", Api.access.getPrisonerInfo, params, true);
      if (res.state.code == 200) {
        if (res.data.length < this.prisonerInfoPageSize) {
          this.prisonerInfoPageLoadFlag = false;
        } else {
          this.prisonerInfoPageIndex++;
          this.prisonerInfoPageLoadFlag = true;
        }
        this.prisonerInfoList = this.prisonerInfoList.concat(res.data);
      }
    },
    outPrisonerLoadLower: function (e) {
      if (this.prisonerInfoPageLoadFlag) {
        this.loadOutPrisonerInfo();
      }
    },
    async loadOutPrisonerInfo () {
      let params = {
        data: {
          roomId: this.roomInfo.roomId,
        },
        emptyPage: true,
        pageParam: {
          pageIndex: this.prisonerInfoPageIndex,
          pageSize: this.prisonerInfoPageSize,
        },
      };
      let res = await Api.apiCall("post", Api.access.getOutPrisonerInfo, params, true);
      if (res.state.code == 200) {
        if (res.data.length < this.prisonerInfoPageSize) {
          this.prisonerInfoPageLoadFlag = false;
        } else {
          this.prisonerInfoPageIndex++;
          this.prisonerInfoPageLoadFlag = true;
        }
        this.outPrisonerInfoList = this.outPrisonerInfoList.concat(res.data);
      }
    },
    async getOutReasonList () {
      let code = "SYS_OUT_TYPE";
      let res = await Api.apiCall("get", Api.police.face.getDictionaryTypeList + "/" + code, null, true);
      if (res.state.code == 200) {
        this.outReasonList = res.data;
      }
    },
    outReasonChange ({ newVal, oldVal, index, orignItem }) {
      this.selectOutReason = orignItem.code;
    },
    outTypeChange ({ newVal, oldVal, index, orignItem }) {
      this.outType = orignItem;
    },
    async takeOut (item) {
      if (this.currentPage == 2) {
        this.submitBack();
      } else {
        if (!this.isSubmitDisable) {
          if (!isNullStr(this.selectOutReason)) {
            this.isSubmitDisable = true;
            let params = {
              roomId: this.roomInfo.roomId,
              dutyPolice: this.roomInfo.policeId,
              personCode: this.outPrisoner.rybh,
              outType: this.selectOutReason,
            };
            let res = await Api.apiCall("post", Api.access.saveAccess, params);
            if (res.state.code == 200) {
              // this.prisonerInfoList.splice(this.outIndex,1);
              this.reloadPrisonerInfo();
              this.getPrisonerNum();
              this.closeModal("out");
              this.$refs.clearSelect.onClear();
            }
            this.$parent.handleShowToast(res.state.msg);
            setTimeout(() => {
              this.isSubmitDisable = false;
            }, 2000);
          } else {
            this.$parent.handleShowToast("请选择外出原因！");
          }
        }
      }
    },
    async submitBack () {
      if (!this.isSubmitDisable) {
        this.isSubmitDisable = true;
        let params = {
          id: this.outPrisoner.id,
        };
        let res = await Api.apiCall("post", Api.access.saveAccess, params);
        if (res.state.code == 200) {
          // this.outPrisonerInfoList.splice(this.outIndex,1);
          this.reloadOutPrisonerInfo();
          this.getPrisonerNum();
          this.closeModal("out");
        }
        this.$parent.handleShowToast(res.state.msg);
        setTimeout(() => {
          this.isSubmitDisable = false;
        }, 2000);
      }
    },
    reloadPrisonerInfo () {
      this.prisonerInfoList = [];
      this.prisonerInfoPageIndex = 1;
      this.prisonerInfoPageSize = 15;
      this.prisonerInfoPageLoadFlag = true;
      this.loadPrisonerInfo();
    },
    openModal (type, index, item) {
      this.selectOutReason = "";
      this.takeOutConfirm = true;
      this.outer = item;
      this.outPrisoner = item;
      this.outIndex = index;
    },
    closeModal (type) {
      this.takeOutConfirm = false;
    },
    prisonerChangeSearch ({ newVal, oldVal, index, orignItem }) {
      this.selectPrisonerId = orignItem.code;
    },
    outReasonChangeSearch ({ newVal, oldVal, index, orignItem }) {
      this.outReasonSearch = orignItem.code;
    },
    searchRecord () {
      this.accessRecordInfoList = [];
      this.accessRecordPageIndex = 1;
      this.accessRecordPageSize = 8;
      this.accessRecordPageLoadFlag = true;
      this.loadAccessRecord();
    },
    bindDateTime: function (e) {
      this.outDateTime = e;
    },
    bindBackDateTime: function (e) {
      this.backDateTime = e;
    },
    getPolice ({ newVal, oldVal, index, orignItem }) {
      this.personnelItem.responsiblePolice = orignItem.code;
    },
    switchPage (page) {
      this.currentPage = page;
      if (page == 1) {
        this.selectOutReason = "";
        this.clearRegister();
        this.reloadPrisonerInfo();
      } else if (page == 2) {
        this.selectOutReason = "";
        this.clearRegister();
        this.reloadOutPrisonerInfo();
      } else if (page == 3) {
        this.selectOutReason = "";
        this.getPrisonerSearchList();
        this.clearRegister();
        this.accessRecordInfoList = [];
        this.accessRecordPageIndex = 1;
        this.accessRecordPageSize = 8;
        this.accessRecordPageLoadFlag = true;
        this.loadAccessRecord();
      }
    },
    reloadOutPrisonerInfo () {
      this.outPrisonerInfoList = [];
      this.prisonerInfoPageIndex = 1;
      this.prisonerInfoPageSize = 15;
      this.prisonerInfoPageLoadFlag = true;
      this.loadOutPrisonerInfo();
    },
    async getPrisonerSearchList () {
      let res = await Api.apiCall("get", Api.access.getAllPrisonerByJsh + "/" + this.roomInfo.roomNo, null, true);
      if (res.state.code == 200) {
        this.prisonerSearchList = res.data;
      }
    },
    accessRecordLoadLower: function (e) {
      if (this.accessRecordPageLoadFlag) {
        this.loadAccessRecord();
      }
    },
    async loadAccessRecord () {
      let outDateTime = "";
      let backDateTime = "";
      if (!isNullStr(this.outDateTime)) {
        outDateTime = this.outDateTime;
      }
      if (!isNullStr(this.outDateTime)) {
        backDateTime = this.backDateTime;
      }
      let params = {
        data: {
          roomId: this.roomInfo.roomId,
          dutyPolice: this.roomInfo.policeId,
          prisoner: this.selectPrisonerId,
          outType: this.outReasonSearch,
          outDateTime: outDateTime,
          backDateTime: backDateTime,
        },
        emptyPage: true,
        pageParam: {
          pageIndex: this.accessRecordPageIndex,
          pageSize: this.accessRecordPageSize,
        },
      };
      let res = await Api.apiCall("post", Api.access.accessRecord, params, true);
      if (res.state.code == 200) {
        if (res.data.length < this.accessRecordPageSize) {
          this.accessRecordPageLoadFlag = false;
        } else {
          this.accessRecordPageIndex++;
          this.accessRecordPageLoadFlag = true;
        }
        this.accessRecordInfoList = this.accessRecordInfoList.concat(res.data);
      }
    },
    clearRegister () {
      this.selectPrisonerId = "";
      this.outReasonSearch = "";
      this.outDateTime = "";
      this.backDateTime = "";
    },
  },
  mounted () { },
};
</script>

<style>
.describe {
  height: 20.13upx;
  font-size: 20.83upx;
  font-weight: bold;
  color: rgba(255, 255, 255, 1);
}

.text-describe {
  font-size: 16.66upx;
  line-height: 15.97upx;
  margin-top: 7.63upx;
  margin-left: 25upx;
  color: #ffffff;
}

.symptoms {
  background-image: url('data:image/png;base64,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');
  background-size: 100% 100%;
  width: 170.83upx;
  height: 259.16upx;
  color: #bbbbbb;
  text-align: center;
  line-height: 59.02upx;
}

.button {
  justify-content: center;
  width: 127.77upx;
  height: 38.19upx;
  background: rgba(210, 45, 45, 1);
  border-radius: 2.77upx;
}

.modal-text {
  font-size: 18.05upx;
  font-weight: 400;
  margin: 17.36upx 0upx 0upx 283.33upx;
}

.record-date {
  background: rgba(27, 146, 239, 0.25);
  padding-left: 10.41upx;
  border: 0.69upx solid rgba(0, 122, 255, 1);
  box-shadow: 0upx 0upx 4.86upx 2.08upx rgba(27, 146, 239, 0.45) inset;
  border-radius: 2.77upx;
  text-align: left;
  width: 239upx;
  height: 36.11upx;
  margin-left: 37.5upx;
  margin-top: 5upx;
  font-size: 18.05upx;
  line-height: 36.11upx;
}
.account-operateing-ok {
  background: rgba(0, 122, 255, 0.99);
  border: rgba(0, 122, 255, 0.99) 0.69upx solid;
  text-align: center;
  height: 43.05upx;
  width: 111.11upx;
  font-size: 18.05upx;
  font-weight: 500;
  line-height: 45upx;
  border-radius: 2.77upx;
  float: right;
}
#thead > view {
  text-align: center;
}
#tbody > view {
  text-align: center;
}
</style>
