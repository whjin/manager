<template>
  <view class="prescription">
    <view class="head">
      <text class="title flex-2">药品名称</text>
      <text class="title">规格</text>
      <text class="title flex-2">用量（每次）</text>
      <text class="title flex-2">单位</text>
      <text class="title flex-2">频率</text>
      <text class="title flex-2">药量天数</text>
      <text class="title flex-2">用法</text>
      <text v-if="isNeedGrouping" class="title flex-2">分组</text>
      <text class="title">操作</text>
    </view>
    <ul class="list">
      <li v-for="(i, index) in list"
          :key="i.drugManageId"
          class="list-row"
          :class="{
            'lack-val': (!i.quantity || !i.drugUsage)
          }">
        <view class="list-col flex-2">
          <view class="fuzzy-search">
            <input v-model="i.drugName"
                   class="search-input"
                   type='text'
                   @focus="handleFoucus(index)"
                   @blur="handleBlur"
                   @input="handleInput"
                   placeholder="请输入药品名称" />
            <scroll-view v-show="i.showResult && resultList.length"
                         scroll-y
                         class="search-result">
              <ul class="list">
                <li class="li"
                    v-for="result in resultList"
                    :key="result.drugManageId"
                    @click="handleLiClick(index, result)">{{ result.drugName }}</li>
              </ul>
            </scroll-view>
          </view>
        </view>
        <!-- 规格 -->
        <text class="list-col text have-border">{{ i.format }}</text>
        <!-- 用量 -->
        <input class="list-col have-border flex-2"
               v-model="i.quantity"
               type='number'
               @input="updateRecipe"
               placeholder="请输入用量" />
        <!-- 单位 -->
        <view class="list-col flex-2">
          <xfl-select :list="unitList"
                      widthStyle="100%"
                      :clearable="false"
                      :placeholder="'请选择单位'"
                      :initValue="i.sydw - 1"
                      :rowIndex="index"
                      @change="handleUnitChange"></xfl-select>
        </view>
        <!-- 频率 -->
        <view class="list-col flex-2">
          <xfl-select :list="frequencyList"
                      widthStyle="100%"
                      :clearable="false"
                      :placeholder="'请选择频率'"
                      :initValue="i.yypl - 1"
                      :rowIndex="index"
                      @change="handleFrequencyChange"></xfl-select>
        </view>
        <input class="list-col flex-2"
               v-model="i.drugUseDays"
               type='number'
               @input="updateRecipe"
               placeholder="请输入药量天数" />
        <input class="list-col flex-2"
               v-model="i.drugUsage"
               type='text'
               @input="updateRecipe"
               placeholder="请输入用法" />
        <view v-if="isNeedGrouping" class="list-col flex-2">
          <xfl-select :list="groupList"
                      widthStyle="100%"
                      :clearable="false"
                      :placeholder="'请选择分组'"
                      :initValue="i.drugGroup - 1"
                      :rowIndex="index"
                      @change="handleGroupChange"></xfl-select>
        </view>
        <text class="list-col red-font" @click="removePrescription(index)">删除</text>
      </li>
      <li class="list-row" @click="addPrescription">+</li>
    </ul>
  </view>
</template>

<script>
import Api from '@/common/api.js';

import xflSelect from "@/components/xfl-select/xfl-select.vue";

import { debounce } from "@/common/utils/util.js";

export default {
  name: 'prescription',
  components: {
    xflSelect
  },
  props: {
    view: {
      type: String,
      default: ''
    },
    outDate: {
      type: [String, Number],
      default: ''
    },
    isNeedOutDate: {
      type: Boolean,
      default: false
    },
    isNeedGrouping: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: [
        // {
        //   drugName: '老鼠药',
        //   format: '规格',
        //   quantity: '数量',
        //   drugUsage: '用法',
        //   prescribeId: 'id',
        //   drugType: 2,
        //   outDate: '2021-08-05',
        //   drugManageId: '',
        //   drugGroup: 1,
        //   type: 1,
        //   drugUseDays: 1,
        //   yypl: 1,
        //   sydw: '个',
        // }
      ],
      inputVal: '',
      resultList: [],
      frequencyList: [], // 频率
      unitList: [], // 单位
      groupList: [
        {
          value: '第一组',
          id: 1
        },
        {
          value: '第二组',
          id: 2
        },
        {
          value: '第三组',
          id: 3
        },
        {
          value: '第四组',
          id: 4
        },
        {
          value: '第五组',
          id: 5
        },
      ]
    }
  },
  methods: {
    addPrescription () {
      let newPre = {
        drugType: '',
        drugName: '',
        quantity: '',
        format: '',
        drugUsage: '',
        drugUseDays: '',
        yypl: 1,
        sydw: 1,
        showResult: false,
        drugManageId: new Date().getTime(),
        type: 1,
      }
      if (this.isNeedOutDate) {
        newPre = Object.assign({}, newPre, {
          outDate: this.outDate,
          outgoerStatus: 1
        });
      }
      if (this.isNeedGrouping) {
        newPre = Object.assign({}, newPre, {
          drugGroup: 1,
          type: 3
        });
      }
      this.list.push(newPre);
    },
    updateList (list) {
      this.list = list;
      this.$forceUpdate();
    },
    clearList () {
      this.list = [];
    },
    clearResultList () {
      this.resultList = [];
    },
    fillPrescription (drug) {
      let addPre = drug.detail;
      addPre = Object.assign(this.list[drug.index], addPre);
      this.list.splice(drug.index, 1, addPre);
    },
    removePrescription (index) {
      this.list.splice(index, 1);
    },
    updateRecipe () {
      this.$emit('updateRecipe', this.list)
    },
    /************ 药品搜索框 start *************/
    handleInput (e) {
      let val = e.detail.value;
      this.inputVal = val;
      debounce(this.getDrugInfo, 1000, false)(val);
    },
    handleFoucus (index) {
      this.list[index].showResult = true;
      debounce(this.getDrugInfo, 1000, false)(this.inputVal);
      this.$emit('inputFoucus', this.view);
    },
    handleBlur () {
      this.$emit('inputBlur', this.view);
    },
    handleLiClick (index, result) {
      this.inputVal = result.drugName;
      this.fillPrescription({
        detail: result,
        index
      })
      this.updateRecipe();
      this.clearResultList();
      this.hideResult();
    },
    /************ 药品搜索框 end *************/
    handleFrequencyChange (e) {
      this.fillPrescription({
        detail: {
          yypl: e.orignItem.id
        },
        index: e.rowIndex
      })
      this.updateRecipe();
    },
    handleUnitChange (e) {
      this.fillPrescription({
        detail: {
          sydw: e.orignItem.id
        },
        index: e.rowIndex
      })
      this.updateRecipe();
    },
    handleGroupChange (e) {
      this.fillPrescription({
        detail: {
          drugGroup: e.orignItem.id
        },
        index: e.rowIndex
      })
      this.updateRecipe();
    },
    hideResult () {
      this.list.forEach(item => {
        item.showResult = false;
      });
    },
    // 药品信息
    async getDrugInfo (val) {
      if (!val) {
        this.clearResultList();
        return;
      }
      let params = {
        data: {
          drugName: val
        }
      }
      let res = await Api.apiCall('post', Api.police.diagnosis.getDrugInfo, params, true);
      if (res.state.code == 200) {
        this.resultList = res.data;
      }
    },
    // 频率
    async getYYPL () {
      let res = await Api.apiCall('get', Api.police.diagnosis.getYYPL, null, true);
      if (res && res.state && res.state.code == 200) {
        this.frequencyList = res.data;
      }
    },
    // 单位
    async getDrugUnit () {
      let res = await Api.apiCall('get', Api.police.diagnosis.getDrugUnit, null, true);
      if (res && res.state && res.state.code == 200) {
        this.unitList = res.data;
      }
    },
  },
  created() {
    if (!this.frequencyList.length) {
      this.getYYPL();
    }
    if (!this.unitList.length) {
      this.getDrugUnit();
    }
  },
}
</script>

<style lang="less" scoped>
@import '@/common/less/unitConfig.less';

.prescription {
  width: 100%;
  .head {
    .px2upx(padding-left, 20);
    .px2upx(padding-right, 20);
    width: 100%;
    .px2upx(height, 62);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background-color: rgba(17, 62, 141, .5);
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
      .px2upx(padding-left, 20);
      .px2upx(padding-right, 20);
      width: 100%;
      .px2upx(height, 66);
      display: flex;
      justify-content: flex-start;
      align-items: center;
      box-sizing: border-box;
      border-bottom: 1px solid rgba(17, 62, 141, .9);
      .list-col {
        position: relative;
        flex: 1;
        text-align: center;
        .px2upx(font-size, 26);
        &.text {
          overflow: hidden;
          white-space: nowrap;
        }
        &.flex-2 {
          flex: 2;
        }
        &.red-font {
          color: red;
        }
        &.have-border {
          border-left: 1px solid rgba(17, 62, 141, .9);
          border-right: 1px solid rgba(17, 62, 141, .9);
        }
      }
      &.lack-val {
        border: 2px solid red;
      }
    }
  }
}
.fuzzy-search {
  position: relative;
  width: 100%;
  height: 100%;
  .search-input {
    width: 100%;
    height: 100%;
    .px2upx(font-size, 26);
  }
  .search-result {
    z-index: 999;
    position: absolute;
    left: 0;
    .px2upx(top, 56);
    box-shadow: 0px 0px 6px 0px rgb(27, 146, 239) inset;
    // background: rgba(27, 146, 239, 0.25);
    background: #113E8D;
    border: #1b92ef 1px solid;
    border-radius: 4px;
    .list {
      .px2upx(padding-left, 0);
      .px2upx(max-height, 250);
      list-style: none;
      .li {
        .px2upx(padding-left, 20);
        .px2upx(height, 50);
        .px2upx(line-height, 50);
        .px2upx(font-size, 26);
        text-align: left;
        &:active,
        &:focus {
          background: rgb(27, 146, 239);
        }
      }
    }
  }
}
</style>