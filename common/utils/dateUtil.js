/**
 * @description 获取当前日期、时间、星期
 * @param {type}  返回类型(空为日期+时间，,0为日期，1为时间，2为星期,3为日期2)
 */

// 格式化日期类型,fmt格式可选择
function dateFormat(fmt, date) {
  let ret;
  let opt = {
    "Y+": date.getFullYear().toString(), // 年
    "M+": (date.getMonth() + 1).toString(), // 月
    "D+": date.getDate().toString(), // 日
    "h+": date.getHours().toString(), // 时
    "m+": date.getMinutes().toString(), // 分
    "s+": date.getSeconds().toString(), // 秒
    "ms+": date.getMilliseconds().toString(), // 毫秒
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"));
    }
  }
  return fmt;
}

// 获取星期
function getWeek() {
  let weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  let now = new Date();
  let day = now.getDay();
  let week = weeks[day];
  return week;
}

export const getTime = (type) => {
  let date = new Date(),
    currentDate,
    currentTime,
    seperator = "-", // 如果想要其他格式 只需 修改这里
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    weex = date.getDay(),
    day = date.getDate(),
    hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
    minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
    second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  month >= 1 && month <= 9 ? (month = "0" + month) : "";
  day >= 0 && day <= 9 ? (day = "0" + day) : "";
  // 当前 日期
  currentDate = year + "-" + month + "-" + day + "";
  // 当前 时间
  currentTime = hour + ":" + minute + ":" + second;

  if (type == 0) {
    return currentDate;
  } else if (type == 1) {
    return currentTime;
  } else if (type == 2) {
    if (weex == 1) {
      return "星期一";
    }
    if (weex == 2) {
      return "星期二";
    }
    if (weex == 3) {
      return "星期三";
    }
    if (weex == 4) {
      return "星期四";
    }
    if (weex == 5) {
      return "星期五";
    }
    if (weex == 6) {
      return "星期六";
    }
    if (weex == 7 || weex == 0) {
      return "星期日";
    }
  } else if (type == 3) {
    return month + "月" + day + "日";
  } else {
    return currentDate + " " + currentTime;
  }
};

/**
 * @description 格式化处理日期
 * @param {date} 要处理的日期
 */
export const timeFormat = (date) => {
  if (!date || typeof date === "string") {
    this.error("参数异常，请检查...");
  }
  var y = date.getFullYear(); //年
  var m = date.getMonth() + 1; //月
  var d = date.getDate(); //日
  m >= 1 && m <= 9 ? (m = "0" + m) : "";
  d >= 0 && d <= 9 ? (d = "0" + d) : "";
  return y + "-" + m + "-" + d;
};

/**
 * @description 获取当前周的周一
 */
export const getFirstDayOfWeek = () => {
  var date = new Date();
  var day = date.getDay() || 7;
  return timeFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day));
};

/**
 * @description 获取当前周的周日
 */
export const getEndDayOfWeek = () => {
  var date = new Date();
  var day = date.getDay() || 7;
  return timeFormat(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day + 6));
};

/**
 * @description 获取日期(picker日期插件使用)
 * @param {type} 处理类型
 */
export const getDate = (type) => {
  const date = new Date();

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (type === "start") {
    year = year - 60;
  } else if (type === "end") {
    year = year + 2;
  } else if (type === "lastMonth") {
    month = month - 1;
  }
  month = month > 9 ? month : "0" + month;
  day = day > 9 ? day : "0" + day;

  return `${year}-${month}-${day}`;
};

export { dateFormat, getWeek };
