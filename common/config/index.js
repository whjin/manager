export default {
  // pro
  baseUrl: "http://192.168.20.201:8100/",
  // dev
  // baseUrl: "http://192.168.1.17:8100/",

  terminalIP: "192.168.20.104",

  /*
   * websocket自动重连时间（毫秒）
   */
  websocketTime: 8000,
  /*
   * 控制模块类型
   */
  controlType: {
    HEARTBEAT: "000",
    INTERCOM: "100",
    RADIO: "200",
    AUDIO: "300",
    VIDEO: "400",
    ALARM: "500",
    ROLLCALL: "600",
    DEVICE: "700",
    DUTY: "800",
  },
  // 管理员账号
  admin: {
    name: '管理员',
    dabh: '099',
    rybh: '0999',
    code: '09999'
  }
};
