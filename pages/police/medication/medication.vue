<template>
  <div class="medication-container">
    <div class="medication-wrapper">
      <div class="medication-title">
        <text>派药管理</text>
      </div>
      <scroll-view scroll-y="true" class="medication-scroll">
        <div v-if="medicationList.length" class="medication-list-wrapper">
          <div class="medication-item" v-for="item in medicationList" :key="item.prescribeId">
            <div class="item-top">
              <div class="item-image">
                <image :src="item.imgUrl || defaultImgUrl" lazy-load alt="image" @error="imageError($event, item)">
                </image>
              </div>
              <div class="item-info">
                <section>姓名：<text>{{ item.name }}</text></section>
                <section>性别：<text>{{ parseInt(item.sex) == '1' ? '男' : '女' }}</text></section>
                <section>监室：<text>{{ item.roomName }}</text></section>
                <section>类型：<text>{{ item.typeText }}</text></section>
              </div>
            </div>
            <div class="item-middle">处方：<text>{{ item.prescribe }}</text></div>
            <div class="item-bottom">
              <div class="bottom-times">派药次数：<text>{{ item.amount }}</text>次</div>
              <div class="bottom-btn">
                <section class="button"
                  :class="{ 'limiter-disabled': item.disabled || item.refuseState || item.upperLimit || item.dispense }"
                  @touchstart.stop="sourceConfirmModal(item, 0)">派药
                </section>
                <section class="button" :class="{ 'refuse-disabled': item.refuseState || item.upperLimit }"
                  @touchstart.stop="sourceConfirmModal(item, 1)">拒服药
                </section>
                <section class="button" @touchstart.stop="resetDispense(item.prescribeId)">重置</section>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="medication-list-empty">暂无数据</div>
      </scroll-view>
      <div v-if="medicationList.length" class="medication-confirm">
        <div class="confirm-btn" @touchstart.stop="openConfirmModal">派药确认</div>
      </div>
    </div>
    <div class="neil-modal-container">
      <recognition-dialogs ref="recognitionDialogs" useFor="medication" :regConfig="regConfig"
        :isShow="showRecognitionDialogs" @faceRecognitionSuccess="faceRecognitionSuccess"
        @fingerRecognitionSuccess="fingerRecognitionSuccess" @close="recognitionDialogsClose"></recognition-dialogs>
      <!-- 派药认证弹框 -->
      <neil-modal :show="showDispenseModal && !showRecognitionDialogs">
        <div class="common-modal-container">
          <div class="modal-header">
            <div class="modal-title">温馨提示</div>
            <div class="modal-close" @touchstart.stop="closeModal('DispenseModal')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <div class="common-modal-content">
            <section v-if="showRecognition">请<span>管教</span>和<span>医生</span>进行认证！</section>
            <section v-else>确认派药后不可撤回，请确认是否派药？</section>
          </div>
          <div class="common-modal-button" v-if="showRecognition">
            <div class="btn-confirm" :class="{ 'btn-signed': !!policeRecognition }"
              @touchstart.stop="handleRecognition(0)">{{
                !!policeRecognition ? '管教已认证' : '管教认证' }}
            </div>
            <div class="btn-confirm" :class="{ 'btn-signed': !!doctorRecognition }"
              @touchstart.stop="handleRecognition(1)">{{
                !!doctorRecognition ? '医生已认证' : '医生认证' }}
            </div>
          </div>
          <div class="common-modal-button" v-else>
            <div class="btn-cancel" @touchstart.stop="closeModal('DispenseModal')">取消</div>
            <div class="btn-confirm" @touchstart.stop="dispenseConfirm">确认</div>
          </div>
        </div>
      </neil-modal>
      <!-- 线下派药确认弹框 -->
      <neil-modal :show="showConfirmModal">
        <div class="common-modal-container">
          <div class="modal-header">
            <div class="modal-title">温馨提示</div>
            <div class="modal-close" @touchstart.stop="closeModal('ConfirmModal')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <div class="common-modal-content">
            <section class="confirm">{{ confirmText }}</section>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @touchstart.stop="closeModal('ConfirmModal')">取消</div>
            <div class="btn-confirm" @touchstart.stop="handleConfirm">{{ confirmBtnText }}</div>
          </div>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import Api from "@/common/api";

export default {
  name: "medication",
  data() {
    return {
      // 派药信息列表
      medicationList: [],
      // 派药次数列表
      amountList: [],
      // 派药列表
      dispenseList: [],
      // 派药确认弹框
      showDispenseModal: false,
      // 认证弹框
      showRecognitionDialogs: false,
      regConfig: {
        regName: "",
        rybh: "",
      },
      // 默认头像
      defaultImgUrl: "/static/images/room/none.jpg",
      // 认证人员 0-管教 1-医生
      role: 0,
      // 管教认证方式
      operatePolice: 0,
      // 医生认证方式
      operateDoctor: 0,
      // 管教认证
      policeRecognition: "",
      // 医务人员认证
      doctorRecognition: "",
      // 线下派药确认弹框
      showConfirmModal: false,
      // 当前派药信息
      selectInfo: {},
      // 派药处理类型
      dispenseType: 0,
      // 线下派药提示
      confirmText: "",
    };
  },
  computed: {
    showRecognition() {
      return [this.policeRecognition, this.doctorRecognition].includes("");
    },
    confirmBtnText() {
      return this.dispenseType == 0 ? "派药" : "拒服药";
    },
  },
  created() {
    // 获取派药信息
    this.getDispenseInfo();
  },
  methods: {
    // 获取派药信息
    async getDispenseInfo() {
      const { roomNo } = uni.getStorageSync("managerInfo");
      let res = await Api.apiCall("get", Api.police.medication.listDrugDispense + `?roomNo=${roomNo}`);
      if (res.state.code == 200) {
        this.amountList = [];
        this.dispenseList = [];
        this.medicationList = res.data;
        if (this.medicationList.length) {
          this.medicationList.map(item => {
            let { amount, prescribeId, type } = item;
            this.amountList.push({ amount, prescribeId });
            item.upperLimit = item.amount >= item.limiter;
            item.typeText = type == "0" ? "处方" : type == "1" ? "临时医嘱" : "长期医嘱";
          });
        }
      }
    },
    // 图片加载失败
    imageError(e, item) {
      this.medicationList.map((list, index) => {
        if (list.prescribeId == item.prescribeId) {
          list.imgUrl = this.defaultImgUrl;
          this.medicationList.splice(index, 1, list);
        }
      });
    },
    // 线下派药弹框
    sourceConfirmModal(item, type) {
      this.selectInfo = item;
      this.dispenseType = type;
      const { name, sendDate } = item;
      if (item.source == "0") {
        // 实战平台线下派药
        this.confirmText = `${name}已于${sendDate}在医务室服药`;
        this.showConfirmModal = true;
      } else {
        // 仓外屏派药
        if (type == 0) {
          this.handleDispense(item);
        } else {
          this.handleRefuse(item);
        }
      }
    },
    // 继续派药|拒服药
    handleConfirm() {
      this.showConfirmModal = false;
      if (this.dispenseType == 0) {
        // 继续派药
        this.handleDispense(this.selectInfo);
      } else {
        // 继续拒服药
        this.handleRefuse(this.selectInfo);
      }
    },
    // 开始派药
    handleDispense(item) {
      if (item.amount < item.limiter) {
        item.amount++;
        item.dispense = true;
        let typeMap = {
          0: "0",
          1: "4",
          2: "5"
        };
        this.dispenseList.push({ dataId: item.prescribeId, dataType: typeMap[item.type], refuse: "0" });
      } else {
        this.medicationList.map((list, index) => {
          if (list.prescribeId == item.prescribeId) {
            list.disabled = true;
            this.medicationList.splice(index, 1, list);
          }
        });
        this.$parent.handleShowToast(`最大派药次数为${item.limiter}`, "center", 5000);
      }
    },
    // 设置拒服药
    handleRefuse(item) {
      if (!item.dispense) {
        this.handleDispense(item);
      }
      this.medicationList.map((list, index) => {
        if (list.prescribeId == item.prescribeId) {
          list.refuse = "1";
          list.refuseState = true;
          this.medicationList.splice(index, 1, list);
        }
      });
      this.dispenseList.map((list, index) => {
        if (list.dataId == item.prescribeId) {
          list.refuse = "1";
          this.dispenseList.splice(index, 1, list);
        }
      });
    },
    // 重置派药
    resetDispense(id) {
      this.medicationList.map((list, index) => {
        if (list.prescribeId == id) {
          list.disabled = false;
          list.refuse = "0";
          list.refuseState = false;
          list.dispense = false;
          this.amountList.map(item => {
            if (item.prescribeId == id) {
              list.amount = item.amount;
            }
          });
          this.medicationList.splice(index, 1, list);
          this.dispenseList = this.dispenseList.filter(item => item.dataId != id);
        }
      });
    },
    // 派药确认弹框
    openConfirmModal() {
      if (!this.dispenseList.length) {
        this.$parent.handleShowToast("派药信息为空", "center");
        return;
      }
      this.showDispenseModal = true;
    },
    // 认证人员 0-管教 1-医生
    handleRecognition(type) {
      this.role = type;
      this.showRecognitionDialogs = true;
      this.$nextTick(() => {
        this.$refs.recognitionDialogs &&
          this.$refs.recognitionDialogs.startRecognition();
      });
    },
    // 派药确认
    dispenseConfirm() {
      this.showDispenseModal = false;
      this.saveDrugDispense();
    },
    // 人脸认证成功回调
    faceRecognitionSuccess(data) {
      const { name, rybh, userId, operate } = data;
      this.regConfig = {
        rybh,
        regName: name,
      };
      switch (this.role) {
        case 0:
          this.operatePolice = operate;
          this.policeRecognition = userId;
          break;
        case 1:
          this.operateDoctor = operate;
          this.doctorRecognition = userId;
          break;
      }
      setTimeout(() => {
        this.recognitionDialogsClose();
      }, 2000);
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess(data) {
      this.getFingerPersonInfo(data);
    },
    // 获取指纹认证人员信息
    async getFingerPersonInfo(data) {
      const { roomId } = uni.getStorageSync("managerInfo");
      let params = {
        mKey: data.mKey,
        roomId,
      };
      let res = await Api.apiCall("get", Api.index.getOdsPoliceInfo, params);
      if (res.state.code == 200) {
        if (Reflect.has(res, "data") && Object.keys(res.data).length) {
          this.$parent.voiceBroadcast("指纹识别成功");
          const { name, userId } = res.data;
          this.regConfig = {
            regName: name,
            regText: "验证通过"
          };
          switch (this.role) {
            case 0:
              this.operatePolice = data.operate;
              this.policeRecognition = userId;
              break;
            case 1:
              this.operateDoctor = data.operate;
              this.doctorRecognition = userId;
              break;
          }
          setTimeout(() => {
            this.recognitionDialogsClose();
          }, 2000);
        } else {
          this.$parent.voiceBroadcast("指纹识别失败");
        }
      }
    },
    // 刷卡认证成功回调
    cardRecognitionSuccess(data) {
      const { name, userId, operate } = data;
      this.regConfig = {
        regName: name,
      };
      switch (this.role) {
        case 0:
          this.operatePolice = operate;
          this.policeRecognition = userId;
          break;
        case 1:
          this.operateDoctor = operate;
          this.doctorRecognition = userId;
          break;
      }
      setTimeout(() => {
        this.recognitionDialogsClose();
      }, 2000);
    },
    // 关闭认证弹框
    recognitionDialogsClose() {
      this.showRecognitionDialogs = false;
      this.regConfig = {
        rybh: "",
        regName: "",
      };
    },
    // 保存派药信息
    async saveDrugDispense() {
      let params = {
        data: {
          operatePolice: this.operatePolice,
          operateDoctor: this.operateDoctor,
          sendPoliceId: this.policeRecognition,
          sendUserId: this.doctorRecognition,
          dispenseList: this.dispenseList
        }
      };
      let res = await Api.apiCall("post", Api.police.medication.saveDrugDispense, params);
      if (res.state.code == 200) {
        this.policeRecognition = "";
        this.doctorRecognition = "";
        this.dispenseList = [];
        this.$parent.handleShowToast("派药信息保存成功");
        // 获取派药信息
        this.getDispenseInfo();
      }
    },
    // 关闭弹框
    closeModal(type) {
      this[`show${type}`] = false;
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>