<template>
  <view class="fuzzy-search">
    <view v-show="inputVal"
          class="search-input"
          @click="handleFoucus">
      {{ inputVal }}
    </view>
    <view v-show="!inputVal"
          class="search-input"
          style="color: grey;"
          @click="handleFoucus">
      {{ placeholder }}
    </view>
    <scroll-view v-show="showResult && resultList.length"
                 scroll-y
                 class="search-result">
      <ul class="list">
        <scroll-view scroll-x
                     v-for="result in resultList"
                     :key="result.field_value">
          <li class="li" @click="hanldeLiClick(result)">{{ result.field_name }}</li>
        </scroll-view>
      </ul>
    </scroll-view>
  </view>
</template>

<script>
import Api from '@/common/api.js';

export default {
  name: 'fuzzySearch',
  props: {
    placeholder: {
      type: String,
      default: '请选填内容'
    }
  },
  data() {
    return {
      inputVal: '',
      showResult: false,
      resultList: [],
      isFirst: true
    }
  },
  methods: {
    handleFoucus () {
      this.showResult = true;
      this.isFirst = true;
      this.getDrugInfo();
      uni.$emit('inputFoucus');
    },
    hanldeLiClick (result) {
      if (this.isFirst) {
        this.isFirst = false;
        this.getViolation(result.field_value);
      } else {
        this.isFirst = true;
        this.inputVal = result.field_name;
        this.$emit('selected', result);
        this.hideResult();
      }
    },
    hideResult () {
      this.showResult = false;
    },
    async getDrugInfo () {
      let res = await Api.apiCall('get', Api.police.conditionReport.getViolationType, {}, true);
      if (res.state.code === 200) {
        this.resultList = res.data;
      }
    },
    async getViolation (val) {
      let res = await Api.apiCall('get', Api.police.conditionReport.getViolation, {
        fieldName: val
      }, true);
      if (res.state.code === 200) {
        this.resultList = res.data;
      }
    }
  },
}
</script>

<style lang="less" scoped>
@import '@/common/less/unitConfig.less';

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