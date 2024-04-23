<template>
  <view class="fuzzy-search">
    <input v-model="inputVal"
           class="search-input"
           type='text'
           @focus="handleFoucus"
           @blur="handleBlur"
           @input="handleInput"
           :placeholder="placeholder" />
    <scroll-view v-show="showResult"
                 scroll-y
                 class="search-result">
      <ul class="list">
        <li v-if="!resultList.length" class="li">无匹配内容</li>
        <scroll-view v-else
                     scroll-x
                     v-for="result in resultList"
                     :key="result.id">
          <li class="li" @click="handleLiClick(result)">{{ result[request.showField] }}</li>
        </scroll-view>
      </ul>
    </scroll-view>
  </view>
</template>

<script>
import Api from '@/common/api.js';

import { debounce } from "@/common/utils/util.js";

export default {
  name: 'fuzzySearch',
  props: {
    placeholder: {
      type: String,
      default: '请选填内容'
    },
    request: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      inputVal: '',
      showResult: false,
      resultList: []
    }
  },
  methods: {
    handleInput (e) {
      let val = e.detail.value;
      this.$emit('input', e.detail.value);
      debounce(this.startReq, 1000, false)(val);
    },
    handleFoucus () {
      this.showResult = true;
      debounce(this.startReq, 1000, false)(this.inputVal);
      uni.$emit('inputFoucus');
    },
    handleBlur () {
      this.showResult = false;
      uni.$emit('inputBlur');
    },
    handleLiClick (result) {
      this.inputVal = result[this.request.showField];
      this.$emit('selected', result);
      this.hideResult();
    },
    hideResult () {
      this.showResult = false;
    },
    async startReq (val) {
      if (!val) {
        this.resultList = [];
        return;
      }
      let params = {};
      if (this.request.type === 'get') {
        params[this.request.param] = val;
        params = Object.assign({}, this.request.extraParam, params);
      } else {
        // post
        let req = {};
        req[this.request.param] = val;
        req = Object.assign({}, this.request.extraParam, params);
        params.data = req;
      }
      let res = await Api.apiCall(this.request.type, this.request.api, params, true);
      if (res.state.code == 200) {
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