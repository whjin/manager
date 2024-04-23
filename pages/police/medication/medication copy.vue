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
              </div>
            </div>
            <div class="item-middle">处方：<text>{{ item.prescribe }}</text></div>
            <div class="item-bottom">
              <div class="bottom-times">派药次数：<text>{{ item.amount }}</text>次</div>
              <div class="bottom-btn">
                <section class="button" :class="{ 'limiter-disabled': item.disabled || item.shortage || item.upperLimit }"
                  @click.stop="handleDispense(item)">派药
                </section>
                <section class="button" :class="{ 'shortage-disabled': item.shortage }"
                  @click.stop="setShortage(item.prescribeId)">缺药
                </section>
                <section class="button" @click.stop="resetDispense(item.prescribeId)">重置</section>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="medication-list-empty">暂无数据</div>
      </scroll-view>
      <div v-if="medicationList.length" class="medication-confirm">
        <div class="confirm-btn" @click="openConfirmModal">派药确认</div>
      </div>
    </div>
    <div class="neil-modal-container">
      <recognition-dialogs ref="recognitionDialogs" useFor="medication" :isShow="showRecognitionDialogs"
        @faceRecognitionSuccess="faceRecognitionSuccess" @fingerRecognitionSuccess="fingerRecognitionSuccess"
        @close="recognitionDialogsClose"></recognition-dialogs>
      <neil-modal :show="showConfirmModal">
        <div class="common-modal-container">
          <div class="modal-header">
            <div class="modal-title">温馨提示</div>
            <div class="modal-close" @click="closeModal('ConfirmModal')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <div class="common-modal-content">
            <section v-if="showSignature">请<span>管教</span>和<span>医生</span>进行签名！</section>
            <section v-else>确认派药后不可撤回，请确认是否派药？</section>
          </div>
          <div class="common-modal-button" v-if="showSignature">
            <div class="btn-confirm" :class="{ 'btn-signed': !!policeSignature }" @click="handleSignature(0)">{{
              !!policeSignature ? '管教已签名' : '管教签名' }}
            </div>
            <div class="btn-confirm" :class="{ 'btn-signed': !!doctorSignature }" @click="handleSignature(1)">{{
              !!doctorSignature ? '医生已签名' : '医生签名' }}
            </div>
          </div>
          <div class="common-modal-button" v-else>
            <div class="btn-cancel" @click="closeModal('ConfirmModal')">取消</div>
            <div class="btn-confirm" @click="dispenseConfirm">确认</div>
          </div>
        </div>
      </neil-modal>
      <neil-modal :show="showSignModal" @close="closeModal('SignModal')">
        <div class="common-modal-container medication-modal-container">
          <div class="modal-header">
            <div class="modal-title">{{ signatureText }}（请从左往右进行签名）</div>
            <div class="modal-close" @click="closeModal('SignModal')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <view class="modal-horizontal-divider"></view>
          <div class="common-modal-content medication-modal-content">
            <htz-signature v-if="showSignModal" @submit="signSuccess" @fail="signFail" cid="signId"></htz-signature>
          </div>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import Api from "@/common/api";
import { mapState } from "vuex";
import htzSignature from "@/components/htz-signature/htz-signature.vue";
import { pathToBase64 } from "@/common/utils/imageTools.js";

export default {
  name: "medication",
  components: {
    htzSignature,
  },
  data() {
    return {
      // 派药信息列表
      medicationList: [],
      // 派药次数列表
      amountList: [],
      // 派药列表
      dispenseList: [],
      // 派药确认弹框
      showConfirmModal: false,
      // 认证弹框
      showRecognitionDialogs: false,
      // 默认头像
      defaultImgUrl: "/static/images/room/none.jpg",
      // 管教签名
      policeSignature: "",
      // 医务人员签名
      doctorSignature: "",
      // 服药签名弹框
      showSignModal: false,
      // 签名人员 0-管教 1-医生
      role: 0,
    };
  },
  computed: {
    ...mapState({
      // 登录人员信息
      personInfo: (state) => state.app.personInfo,
    }),
    showSignature() {
      return [this.policeSignature, this.doctorSignature].includes("");
    },
    signatureText() {
      return this.role == 0 ? "管教签名" : "医生签名";
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
            let { amount, prescribeId } = item;
            this.amountList.push({ amount, prescribeId });
            item.upperLimit = item.amount >= item.limiter;
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
    // 开始派药
    handleDispense(item) {
      if (item.amount < item.limiter) {
        item.amount++;
        this.dispenseList.push({ dataId: item.prescribeId, dataType: "0" });
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
    // 设置缺药
    setShortage(id) {
      this.medicationList.map((list, index) => {
        if (list.prescribeId == id) {
          list.shortage = true;
          this.medicationList.splice(index, 1, list);
          this.dispenseList = this.dispenseList.filter(item => item.dataId != id);
        }
      });
    },
    // 重置派药
    resetDispense(id) {
      this.medicationList.map((list, index) => {
        if (list.prescribeId == id) {
          list.disabled = false;
          list.shortage = false;
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
        this.$parent.handleShowToast("派药信息为空");
        return;
      }
      this.showConfirmModal = true;
    },
    // 签名人员 0-管教 1-医生
    handleSignature(type) {
      this.role = type;
      this.showSignModal = true;
    },
    // 获取签名成功
    signSuccess(res) {
      this.handlePathToBase64(res.tempFilePath).then(base64Str => {
        if (this.role == 0) {
          this.policeSignature = base64Str;
        } else {
          this.doctorSignature = base64Str;
        }
        this.closeModal("SignModal");
      });
    },
    // 获取签名失败
    signFail(err) {
      this.$parent.handleShowToast("获取签名失败", "center", 5000);
    },
    // 派药确认
    dispenseConfirm() {
      this.showConfirmModal = false;
      this.showRecognitionDialogs = true;
      this.$nextTick(() => {
        this.$refs.recognitionDialogs &&
          this.$refs.recognitionDialogs.startRecognition();
      });
    },
    // 人脸认证成功回调
    faceRecognitionSuccess(data) {
      this.verifySuccess();
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess(res) {
      this.verifySuccess();
      this.$parent.voiceBroadcast("验证通过");
    },
    // 验证成功
    verifySuccess() {
      this.recognitionDialogsClose();
      this.saveDrugDispense();
    },
    // 关闭认证弹框
    recognitionDialogsClose() {
      this.showRecognitionDialogs = false;
    },
    // 保存派药信息
    async saveDrugDispense() {
      let params = {
        data: {
          sendUserId: this.personInfo.userId,
          policeSignature: this.policeSignature,
          doctorSignature: this.doctorSignature,
          dispenseList: this.dispenseList
        }
      };
      let res = await Api.apiCall("post", Api.police.medication.saveDrugDispense, params);
      if (res.state.code == 200) {
        this.policeSignature = "";
        this.doctorSignature = "";
        this.dispenseList = [];
        this.$parent.handleShowToast("派药信息保存成功");
        // 获取派药信息
        this.getDispenseInfo();
      }
    },
    // 图片路径转Base64
    handlePathToBase64(imgPath) {
      return new Promise((resolve, reject) => {
        pathToBase64(imgPath).then(base64 => {
          let index = base64.indexOf(",") + 1;
          let imgBase64 = base64.substr(index);
          resolve(imgBase64);
          this.deleteFile(imgPath);
        }).catch(err => {
          reject(err);
          this.deleteFile(imgPath);
        });
      });
    },
    // 根据文件路径删除文件
    deleteFile(filePath) {
      // #ifdef APP-PLUS
      plus.io.requestFileSystem(
        plus.io.PUBLIC_DOCUMENTS, // 程序公用文档目录常量
        (fs) => {
          // 创建或打开文件, fs.root是根目录操作对象,直接fs表示当前操作对象
          fs.root.getFile(
            filePath,
            {
              create: false, // 文件不存在则创建
            },
            (fileEntry) => {
              // 文件在手机中的路径
              fileEntry.remove(() => {
              });
            }
          );
        }
      );
      // #endif
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