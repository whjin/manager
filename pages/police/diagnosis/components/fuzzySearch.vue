<template>
  <view class="fuzzy-search">
    <input v-model="inputVal"
           class="search-input"
           type='text'
           @focus="handleFoucus"
           @blur="handleBlur"
           @input="handleInput"
           :placeholder="placeholder" />
    <scroll-view v-show="showResult && resultList.length"
                 scroll-y
                 class="search-result">
      <ul class="list">
        <scroll-view scroll-x
                     v-for="result in resultList"
                     :key="result.id">
          <li class="li" @click="hanldeLiClick(result)">{{ result[name] }}</li>
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
    useFor: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputVal: '',
      showResult: false,
      resultList: []
    }
  },
  computed: {
    api () {
      if (this.useFor === 'DiseaseType') {
        return Api.police.diagnosis.getDiseaseType;
      } else if (this.useFor === 'Special') {
        return Api.police.diagnosis.getSpecial;
      } else {
        return Api.police.diagnosis.getDiseaseType;
      }
    },
    params () {
      if (this.useFor === 'DiseaseType') {
        return 'fieldName';
      } else if (this.useFor === 'Special') {
        return 'name';
      } else {
        return 'fieldName';
      }
    },
    name () {
      if (this.useFor === 'DiseaseType') {
        return 'diseaseName';
      } else if (this.useFor === 'Special') {
        return 'special';
      } else {
        return 'diseaseName';
      }
    }
  },
  methods: {
    handleInput (e) {
      let val = e.detail.value;
      debounce(this.getDrugInfo, 1000, false)(val);
    },
    handleFoucus () {
      this.showResult = true;
      debounce(this.getDrugInfo, 1000, false)(this.inputVal);
      uni.$emit('inputFoucus');
    },
    handleBlur () {
      // this.showResult = false;
      uni.$emit('inputBlur');
    },
    hanldeLiClick (result) {
      this.inputVal = result[this.name];
      this.$emit('selected', result);
      this.hideResult();
    },
    hideResult () {
      this.showResult = false;
    },
    async getDrugInfo (val) {
      if (!val) {
        this.resultList = [];
        return;
      }
      let params = {
        data: {}
      }
      params.data[this.params] = val;
      let res = await Api.apiCall('post', this.api, params, true);
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