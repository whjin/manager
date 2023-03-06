<template>
  <neil-modal :show="isShow" :autoClose="true" @close="handleClose">
    <view class="recognition-dialogs-container">
      <!-- 顶部操作栏 -->
      <view class="modal-header">
        <view class="modal-title">温馨提示</view>
        <div class="modal-close" @click="handleClose">
          <image src="/static/images/common/close.png"></image>
        </div>
      </view>
      <view class="page-horizontal-divider"></view>
      <view class="uni-flex uni-flex-item uni-column" style="justify-content: space-around; align-items: center">
        <!-- 人脸认证 -->
        <template v-if="isFaceRecognition">
          <div class="face-recognition-bg">
            <!-- <image src="/static/images/call/face_recognition_bg.png"></image>
            <div class="scan-line"></div> -->
          </div>
          <text style="font-size: 20.83upx; font-weight: 400">{{ faceConfig.scanTips }}</text>
        </template>
        <!-- 指纹认证 -->
        <template v-else>
          <common-icons iconType="iconzhiwen" size="100" color="#fff" />
          <text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
        </template>
      </view>
      <!-- 切换按钮 -->
      <div class="switch-btn-wrapper" v-if="debounceSwitch">
        <div type="default" class="switch-type-btn" @touchstart.stop="debounceSwitch">切换{{ isFaceRecognition ? '指纹' : '人脸' }}</div>
      </div>
    </view>
  </neil-modal>
</template>

<script>
import { pathToBase64 } from '../../lib/imageTools.js';
import Log from '@/common/utils/log.js';
import Api from '@/common/api.js';
import { debounce } from "@/common/utils/util.js";
import neilModal from "@/components/neil-modal/neil-modal.vue";
export default {
  components: {
    neilModal
  },
  props: {
    // 人脸识别登录弹窗显示状态
    isShow: {
      type: Boolean,
      default: false,
    },
    // 人脸认证角色 0：医务 1：管教
    role: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      // 人脸比对socket
      faceRecognitionSocket: null,
      // 人脸 or 指纹登录
      defaultLoginType: uni.getStorageSync('defaultLoginType'),
      // 人脸登录需要的配置
      faceConfig: {
        pic: '',
        // 扫描提示
        scanTips: '请站好正视屏幕，识别验证中...',
      },
      // 切换按钮防抖
      debounceSwitch: null,
      // 正在人脸识别
      isFacing: false,
      // 指纹开启状态
      isOpen: false,
      // 禁止重复操作
      isRepeatState: false,
    };
  },
  computed: {
    // 人脸验证 or 指纹验证
    isFaceRecognition () {
      if (this.defaultLoginType == 1) {
        return false;
      } else {
        return true;
      }
    }
  },
  watch: {
    isShow (state) {
      if (!state) {
        this.isFacing = false;
        uni.$emit('live-push', {
          status: 'stopPre'
        });
        uni.$off('get-img-path');
        this.closeFingerPrint();
      } else {
        this.defaultLoginType = uni.getStorageSync('defaultLoginType');
        this.debounceSwitch = debounce(this.switchRecognitionMode);
        uni.$on('get-img-path', path => {
          this.pathToBase64(path).then(base64 => {
            this.faceConfig.pic = base64;
            this.faceRecognition1N();
          }).catch(err => {
            console.log(err);
          });
        });
      }
    }
  },
  destroyed () {
    this.closeFingerPrint();
  },
  methods: {
    // 开始识别
    startRecognition () {
      if (this.isFaceRecognition) {
        this.faceVoice('开始人脸识别，请站好正视屏幕');
        this.faceRecognition();
      } else {
        this.verifyFingerPrint();
      }
    },
    // 切换登录方式
    switchRecognitionMode () {
      this.defaultLoginType = this.defaultLoginType == 1 ? 0 : 1;
      this.$emit('switchRecognitionMode', this.isFaceRecognition);
      if (this.isFaceRecognition) {
        this.faceVoice('开始人脸识别，请站好正视屏幕');
        this.faceRecognition();
        this.closeFingerPrint();
      } else {
        this.verifyFingerPrint();
      }
    },
    // 人脸识别
    faceRecognition (livePushPre = true) {
      if (!this.isFacing) {
        if (livePushPre) {
          uni.$emit('live-push', {
            status: 'startPre'
          });
        }
        this.isFacing = true;
        setTimeout(() => {
          uni.$emit('live-push', {
            status: 'snapshot'
          });
        }, 2000);
      }
    },
    async faceRecognition1N () {
      let params = {
        role: this.role,
        roomId: uni.getStorageSync('managerInfo').roomId,
        base64Str: this.faceConfig.pic
      };
      let url = Api.police.faceRecognition1N;
      let res = await Api.apiCall("post", url, { data: params }, true, true);
      this.isFacing = false;
      if (!this.isShow || !this.isFaceRecognition) return;
      if (res.state.code === 200) {
        this.faceVoice('人脸识别成功');
        // 登录返回登录人员信息
        setTimeout(() => {
          this.$emit('faceRecognitionSuccess', Object.assign({}, res.data));
        }, 1000);
      } else {
        let tips = res.state.msg || '未检测到有效人脸，请站好正视屏幕';
        this.faceVoice(tips);
        this.faceRecognition(false);
      }
    },
    // 图片路径转base64
    pathToBase64 (imgPath) {
      let _this = this;
      return new Promise((resolve, reject) => {
        pathToBase64(imgPath).then(base64 => {
          let imgBase64 = base64.replace('data:image/jpeg;base64,', '');
          resolve(imgBase64);
          _this.deleteFile(imgPath);
        }).catch(error => {
          reject(error);
          _this.deleteFile(imgPath);
          Log.writeLog(`人脸认证图片转换base64失败，Error：${error}`, false);
        });
      });
    },
    // 根据文件路径删除文件
    deleteFile (filePath) {
      // #ifdef APP-PLUS
      plus.io.requestFileSystem(
        plus.io.PUBLIC_DOCUMENTS, // 程序公用文档目录常量
        fs => {
          // 创建或打开文件, fs.root是根目录操作对象,直接fs表示当前操作对象
          fs.root.getFile(filePath, {
            create: false // 文件不存在则创建
          }, fileEntry => {
            // 文件在手机中的路径	
            fileEntry.remove(() => {
            }, () => {
              Log.writeLog('删除人脸认证图片失败', false);
            });
          });
        },
        e => {
          console.log(e.message);
        }
      );
      // #endif
    },
    // 开始指纹识别
    verifyFingerPrint () {
      this.isFacing = false;
      uni.$emit('live-push', {
        status: 'stopPre'
      });
      if (!this.isOpen) {
        // 打开指纹设备
        this.isOpen = true;
        getApp().globalData.FloatUniModule.syncStartFinger(e => {
          if (e.code == 0) {
            console.log("指纹设备已打开");
            this.$parent.voiceBroadcast("请按压要识别的指纹");
            getApp().globalData.FloatUniModule.fingerprintRecognition();
            getApp().globalData.FloatUniModule.setCompareFingerprintCallBack(res => {
              if (!this.isRepeatState) {
                this.isRepeatState = true;
                setTimeout(() => {
                  this.isRepeatState = false;
                }, 1500);
                if (res.code == "0") {
                  console.log("指纹识别成功");
                  this.$parent.voiceBroadcast("指纹识别成功");
                  let params = {
                    mKey: res.id,
                  };
                  this.$parent.fingerRecognitionSuccess(params);
                } else {
                  this.$parent.voiceBroadcast("识别失败，指纹不匹配!");
                }
              }
            });
          } else {
            this.$parent.voiceBroadcast("指纹设备未打开");
            console.log("指纹设备未打开");
          }
        });
      }
    },
    // 关闭指纹连接
    closeFingerPrint () {
      this.isOpen = false;
      getApp().globalData.FloatUniModule.syncStopFinger(e => {
        if (e.code == 0) {
          console.log("指纹设备已关闭");
          getApp().globalData.FloatUniModule.fingerModuleStop();
        }
      });
    },
    // 人脸语音播报
    faceVoice (text) {
      this.faceConfig.scanTips = text;
      this.$parent.voiceBroadcast(text);
    },
    // 关闭人脸识别弹窗
    handleClose () {
      this.$emit('close');
    },
  }
}
</script>

<style lang="less" scoped>
@import '../../common/less/neilModalHead.less';
.recognition-dialogs-container {
  width: 555.55upx;
  height: 472upx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .face-recognition-bg {
    width: 221.5upx;
    height: 249.3upx;
    image {
      width: 100%;
      height: 100%;
    }
    .scan-line {
      width: 138.88upx;
      height: 4.16upx;
      background: #72f9fd;
      border-radius: 3px;
      transform: translate3d(40.5upx, -229.5upx, 0upx);
      animation: scan 3s ease 0s infinite;
      @keyframes scan {
        0% {
          transform: translate3d(40.5upx, -229.5upx, 0upx);
        }
        50% {
          transform: translate3d(40.5upx, -42upx, 0upx);
        }
        100% {
          transform: translate3d(40.5upx, -229.5upx, 0upx);
        }
      }
    }
  }
  .switch-btn-wrapper {
    margin-bottom: 30upx;
    width: 555.55upx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .switch-type-btn {
      margin-right: 35upx;
      width: 125upx;
      height: 43upx;
      border-radius: 4px;
      line-height: 43upx;
      background-color: #007aff;
      color: #fff;
      font-size: 20.83upx;
      text-align: center;
    }
  }
  .call-modal-content {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    .modal-fingerInit,
    .modal-fingerSuccess {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .finger-image {
        height: 122.22upx;
        width: 141.66upx;
      }
      .finger-name {
        font-size: 27.77upx;
        font-weight: bold;
        color: #35fffa;
        line-height: 41.66upx;
        margin-top: 20upx;
      }
      .finger-tip {
        color: #fff;
      }
    }
  }
}
</style>
