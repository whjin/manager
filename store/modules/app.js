const state = {
  // 当前页面
  currentTab: 1,
  // 认证人员信息
  personInfo: {},
  // 播放组件显隐
  showPlayer: false,
  // 视频流地址
  playerUrl: "",
  // 首页状态栏显隐
  showBottomBar: true,
  // 返回首页状态
  homeState: true,
  // 后退状态
  backState: true,
  // 登录状态
  loginState: false,
  // 视频对讲状态
  openIntercom: false,
  // 视频对讲提示
  intercomName: "",
  // 视频对讲信息
  intercomInfo: { id: 0, content: "值班室视频" },
  // 当前页面是否在每日巡诊
  isDiagnosisPage: false,
  // 视频播放信息
  videoInfo: {
    id: "",
    isFullScreen: false,
  },
};

const mutations = {
  // 当前页面
  SET_CURRENTTAB(state, num) {
    state.currentTab = num;
  },
  // 认证人员信息
  SET_PERSONINFO(state, info) {
    state.personInfo = info;
  },
  // 播放组件显隐
  SET_SHOWPLAYER(state, bool) {
    state.showPlayer = bool;
  },
  // 视频流地址
  SET_PLAYERURL(state, info) {
    state.playerUrl = info;
  },
  // 设置状态栏显隐
  SET_BOTTOMBAR(state, bool) {
    state.showBottomBar = bool;
  },
  // 设置返回首页状态
  SET_HOMESTATE(state, bool) {
    state.homeState = bool;
  },
  // 设置后退状态
  SET_BACKSTATE(state, bool) {
    state.backState = bool;
  },
  // 设置登录状态
  SET_LOGINSTATE(state, bool) {
    state.loginState = bool;
  },
  // 设置视频对讲状态
  SET_OPENINTERCOM(state, bool) {
    state.openIntercom = bool;
  },
  // 设置视频对讲提示
  SET_INTERCOMNAME(state, info) {
    state.intercomName = info;
  },
  // 设置视频对讲信息
  SET_INTERCOMINFO(state, info) {
    state.intercomInfo = info;
  },
  // 设置当前页面是否为每日巡诊
  SET_ISDIAGNOSISPAFE(state, bool) {
    state.isDiagnosisPage = bool;
  },
  // 保存视频播放信息
  SET_VIDEOINFO(state, info) {
    state.videoInfo = info;
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
