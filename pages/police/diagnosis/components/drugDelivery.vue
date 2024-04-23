<template>
  <scroll-view class="swiper" scroll-y :scroll-into-view="intoView">
    <view class="swiper-item">
      <view class="form" :class="{ cushion: addCushion }">
        <!-- 基本信息 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">姓名：</text>
            </view>
            <view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.name || '无' }}</view>
          </view>
          <view class="form-col">
            <view class="fields">
              <text class="text">监室号：</text>
            </view>
            <view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.prisonNo || '无' }}</view>
          </view>
          <view class="form-col">
            <view class="fields">
              <text class="text">出生年月：</text>
            </view>
            <view class="inside-border input">{{ selectedPrisoner.birthday | dateFormatFilter }}</view>
          </view>
        </view>
        <!-- 基本信息 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">性别：</text>
            </view>
            <view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.sex || '无' }}</view>
          </view>
          <view class="form-col">
            <view class="fields">
              <text class="text">档案编号：</text>
            </view>
            <view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.archivesNo || '无' }}</view>
          </view>
          <view class="form-col">
            <view class="fields">
              <text class="text">入所时间：</text>
            </view>
            <view class="inside-border input">{{ selectedPrisoner.entryTime | dateFormatFilter }}</view>
          </view>
        </view>
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">健康状态：</text>
            </view>
            <view class="inside-border input">{{ selectedPrisoner && selectedPrisoner.healthStatus || '无' }}</view>
          </view>
          <view class="form-col col-2">
            <view class="fields req">
              <text class="text">症状/主诉：</text>
            </view>
            <input class="inside-border input" :class="{
                     'lack-val': !medicineParams.symptom
                   }" v-model="medicineParams.symptom" type='text' placeholder="请输入症状/主诉" />
          </view>
        </view>
        <!-- 药物过敏/处方时间 -->
        <view class="form-row">
          <view class="form-col">
            <view class="fields req lack-val">
              <text class="text">药物过敏：</text>
            </view>
            <input class="inside-border input" :class="{
                     'lack-val': !medicineParams.allergy
                   }" v-model="medicineParams.allergy" type='text' placeholder="请输入药物过敏" />
          </view>
          <view class="form-col col-2">
            <view class="fields req">
              <text class="text">开药时间：</text>
            </view>
            <e-picker mode="dateTime" @change="setPrescribeTime">
              <div class="input inside-border" style="margin-right: 362.5upx; width: 236.2upx;">{{ prescribeTime || '请选择开药时间' }}</div>
            </e-picker>
          </view>
        </view>
        <view class="form-row">
          <view class="form-col">
            <view class="fields req lack-val">
              <text class="text">初步诊断：</text>
            </view>
            <input class="inside-border input" :class="{
                     'lack-val': !medicineParams.diagnosis
                   }" style="width: 960.417upx;" v-model="medicineParams.diagnosis" type='text' placeholder="请输入初步诊断" />
          </view>
        </view>
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">体格检查：</text>
            </view>
            <view class="physique-info">
              <view class="physique-info-details">
                体温
                <input class="inside-border input" v-model="medicineParams.bodyTemperature" type="number">
                ℃
              </view>
              <view class="physique-info-details">
                血压
                <input class="inside-border input" v-model="medicineParams.bloodPressure" type="number">
                mmHg
              </view>
              <view class="physique-info-details">
                脉搏
                <input class="inside-border input" v-model="medicineParams.pulse" type="number">
                次/min
              </view>
              <view class="physique-info-details">
                呼吸
                <input class="inside-border input" v-model="medicineParams.breathe" type="number">
                次/min
              </view>
            </view>
          </view>
        </view>
        <!-- 处方 -->
        <view class="form-row" id="medicinePrescription">
          <view class="form-col">
            <view class="fields req">
              <text class="text">处方：</text>
            </view>
            <view class="prescription-wrapper">
              <prescription view="medicinePrescription" ref="prescriptionList" :isNeedOutDate="true" :outDate="prescribeTime" @updateRecipe="setMedicineRecipeParams" @inputFoucus="inputFoucus" @inputBlur="inputBlur" />
            </view>
          </view>
        </view>
        <view class="form-row">
          <view class="form-col">
            <view class="fields">
              <text class="text">医师：</text>
            </view>
            <view class="inside-border input">{{ personInfo.name }}</view>
          </view>
          <view class="form-col col-2">
            <view class="fields">
              <text class="text">巡诊时间：</text>
            </view>
            <view class="inside-border input" style="margin-right: 362.5upx; width: 236.2upx;">{{ medicineParams.treatTime }}</view>
          </view>
        </view>
        <view class="form-row">
          <view class="delivery-btn" @click="handleDrugDelivery">药品出库</view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import Api from '@/common/api.js';

import ePicker from "@/components/e-picker/e-picker.vue";
import prescription from "./prescription.vue";

import { dateFormat } from "@/common/utils/util.js";

export default {
  name: 'drugDelivery',
  components: {
    ePicker,
    prescription
  },
  props: {
    selectedPrisoner: {
      type: Object,
      default () {
        return {};
      }
    },
    personInfo: {
      type: Object,
      default () {
        return {};
      }
    },
    nowTimestamp: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      intoView: '',
      addCushion: false, // 是否正在模糊查询 true则给外层添加margin-bottom增加高度 实现滚动定位
      // 当前时间 => 开药时间
      prescribeTime: dateFormat('YYYY-MM-DD hh:mm', new Date()),
      // 出药基础参数
      medicineParams: {
        drugOutStockFlag: 1,
        bodyTemperature: '', // 体温
        bloodPressure: '', // 血压
        pulse: '', // 脉搏
        breathe: '', // 呼吸
        symptom: '', // 症状
        allergy: '', // 过敏
        diagnosis: '', // 初步诊断
        doctors: '', // 医师
        treatTime: dateFormat('YYYY-MM-DD hh:mm', new Date()), // 巡诊时间
        dataSource: 0
      },
      // 出药处方参数
      medicineRecipeParams: [],
      // 基础参数验证
      baseValidate: {
        symptom: '请输入症状/主诉！',
        allergy: '请输入药物过敏！',
        diagnosis: '请输入初步诊断！'
      },
      // 处方参数验证
      recipeValidate: {
        drugName: '请填选药品名称！',
        quantity: '请输入数量！',
        drugUsage: '请输入用法！',
        drugUseDays: '请输入药量天数！',
        yypl: '请输入频率！',
        sydw: '请输入单位！'
      }
    };
  },
  watch: {
    nowTimestamp (val) {
      this.medicineParams.treatTime = dateFormat('YYYY-MM-DD hh:mm', new Date(val));
    }
  },
  filters: {
    dateFormatFilter (val) {
      if (!val) return '无';
      return dateFormat('YYYY-MM-DD', new Date(val));
    }
  },
  methods: {
    hideResult () {
      this.$refs.prescriptionList && this.$refs.prescriptionList.hideResult();
    },
    inputFoucus (view) {
      this.intoView = '';
      this.addCushion = true;
      this.$forceUpdate();
      this.$nextTick(() => {
        this.intoView = view;
      });
    },
    inputBlur () {
      this.$forceUpdate();
      this.$nextTick(() => {
        this.addCushion = false;
      });
    },
    // 设置出药时间
    setPrescribeTime (time) {
      this.prescribeTime = time;
    },
    setMedicineRecipeParams (recipe) {
      this.medicineRecipeParams = recipe;
    },
    // 药品出库参数处理
    handleDrugDelivery () {
      this.medicineParams.doctors = this.personInfo.userId;
      this.medicineParams.personCode = this.selectedPrisoner.rybh;
      this.handleParamsValidate().then(() => {
        this.drugDelivery();
      });
    },
    // 必填项判断
    handleParamsValidate () {
      return new Promise((resolve, reject) => {
        // 验证基础参数
        let baseRule = this.baseValidate;
        let allPass = true;
        for (const key in baseRule) {
          if (Object.hasOwnProperty.call(baseRule, key)) {
            if (!this.medicineParams[key]) {
              allPass = false;
              break;
            }
          }
        }
        // 验证处方
        if (allPass) {
          if (this.medicineRecipeParams.length) {
            let recipeRule = this.recipeValidate;
            this.medicineRecipeParams.forEach((recipe, index) => {
              for (const key in recipeRule) {
                if (Object.hasOwnProperty.call(recipeRule, key)) {
                  if (!recipe[key]) {
                    allPass = false;
                    break;
                  }
                }
              }
            });
          } else {
            allPass = false;
          }
        }
        if (allPass) {
          resolve();
        } else {
          uni.showToast({
            title: '药品出库失败，请填写完整表格！',
            position: 'center',
            icon: "none",
          });
        }
      });
    },
    // 药品出库
    async drugDelivery () {
      let isEnough = true; // 判断库存
      let lackDrug = '';
      let PacMPrescribeDetailsDO = this.medicineRecipeParams;
      let pacMDrugManageDO = [];
      PacMPrescribeDetailsDO.map(i => {
        let obj = {
          id: i.drugManageId,
          drugSpecific: i.drugSpecific
        };
        let quantity = i.quantity * i.yypl * i.drugUseDays;
        if (isEnough) {
          if (quantity > i.remainStorehouse) {
            isEnough = false;
            lackDrug = i.drugName;
          } else {
            i.quantity = quantity;
            i.outgoer = this.personInfo.userId;
            pacMDrugManageDO.push(obj);
            return i;
          }
        }
      });
      if (!isEnough) {
        return uni.showToast({
          title: `开具处方失败，${lackDrug}库存不足！`,
          position: 'center',
          icon: "none",
        });
      }
      let params = {
        PacMPrescribeDO: this.medicineParams,
        PacMPrescribeDetailsDO,
        pacMDrugManageDO
      };
      let res = await Api.apiCall('post', Api.police.diagnosis.drugDelivery, params, true);
      this.medicineRecipeParams = [];
      this.$refs.prescriptionList && this.$refs.prescriptionList.clearList();
      if (res.state.code == 200) {
        uni.showToast({
          title: res.data || '药品出库成功！',
          position: 'center',
          icon: "none",
        });
      } else {
        uni.showToast({
          title: (res.state && res.state.msg) || `药品出库失败！code：${res.state && res.state.code}`,
          position: 'center',
          icon: "none",
        });
      }
    },
  },
  beforeCreate () {
    uni.showLoading({
      title: "加载中..",
      mask: true,
    });
  },
  mounted () {
    uni.hideLoading();
  },
}
</script>

<style lang="less" scoped>
@import '@/common/less/unitConfig.less';
@import '@/common/less/form.less';

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

.prescription-wrapper {
  .px2upx(width, 1405);
}

.delivery-btn {
  .px2upx(width, 160);
  .px2upx(height, 62);
  background-color: #007aff;
  border-radius: 4px;
  .px2upx(font-size, 26);
  .px2upx(line-height, 62);
  text-align: center;
}

.physique-info {
  width: 977.083upx;
  display: flex;
  justify-content: space-around;
  align-items: center;

  .physique-info-details {
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 18.06upx;
    .input {
      margin: 0 5upx;
      width: 50upx !important;
    }
  }
}
</style>