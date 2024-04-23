<template>
  <div class="schedule-container">
    <div class="schedule-wrapper" v-if="scheduleList.length">
      <div class="schedule-left">
        <scroll-view scroll-y="true" class="schedule-left-scroll">
          <div class="schedule-left-item" v-for="list in scheduleList" :key="list.type"
            :class="selectInfo.type == list.type ? 'schedule-selected-img' : 'schedule-img'"
            @click="selectScheduleItem(list)">
            <text :class="selectInfo.type == list.type ? 'select-item' : ''">{{ list.typeName }}</text>
          </div>
        </scroll-view>
      </div>
      <div class="page-vertical-divider"></div>
      <div class="schedule-right">
        <scroll-view scroll-y="true" class="schedule-right-scroll">
          <div class="schedule-right-item" v-for="(item, index) in selectInfo.list" :key="index">
            <div class="schedule-header">
              <section class="title">{{ item.title }}</section>
              <section class="time">{{ item.time }}</section>
            </div>
            <div class="schedule-content">{{ item.content }}</div>
          </div>
        </scroll-view>
      </div>
    </div>
    <div class="schedule-empty" v-else>暂无数据</div>
  </div>
</template>

<script>
import Api from "@/common/api";

export default {
  name: "schedule",
  data() {
    return {
      // 事务列表
      scheduleList: [],
      // 已选事务项
      selectInfo: {},
    };
  },
  mounted() {
    // 获取事务列表
    this.getScheduleInfo();
  },
  methods: {
    // 获取事务列表
    async getScheduleInfo() {
      let params = {
        data: {}
      };
      let res = await Api.apiCall("post", Api.police.schedule.findReminder, params);
      if (res.state.code == 200) {
        this.scheduleList = res.data;
        this.selectInfo = this.scheduleList[0];
      }
    },
    selectScheduleItem(item) {
      this.selectInfo = item;
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>