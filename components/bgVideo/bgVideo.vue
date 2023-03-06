<template>
  <div class="bgVideo-container">
    <video id="bgVideo" class="bgVideo" codec="software" :src="url" :controls="false" autoplay loop></video>
  </div>
</template>

<script>
export default {
  name: "bgVideo",
  props: {
    url: {
      type: String,
      default: ""
    },
  },
  data () {
    return {
    };
  }
};
</script>

<style lang="less">
.bgVideo-container {
  position: absolute;
  left: 0;
  top: 0;
  .bgVideo {
    width: 1upx;
    height: 1upx;
    background-color: transparent;
  }
}
</style>
