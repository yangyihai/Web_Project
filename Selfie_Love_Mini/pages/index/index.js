// pages/index/index.js
Page({
  data: {
    photoCount: 0,
    showTutorial: false,
    hasCameraPermission: false
  },

  onLoad() {
    this.checkCameraPermission();
    this.loadPhotoCount();
    this.checkFirstVisit();
  },

  onShow() {
    this.loadPhotoCount();
  },

  // 检查相机权限
  checkCameraPermission() {
    wx.getSetting({
      success: (res) => {
        this.setData({
          hasCameraPermission: !!res.authSetting['scope.camera']
        });
        
        if (!this.data.hasCameraPermission) {
          this.showPermissionGuide();
        }
      }
    });
  },

  // 请求相机权限
  requestCameraPermission() {
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        this.setData({ hasCameraPermission: true });
      },
      fail: () => {
        wx.showModal({
          title: '权限提示',
          content: '需要相机权限才能使用拍照功能',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      }
    });
  },

  // 显示权限引导
  showPermissionGuide() {
    wx.showModal({
      title: '权限说明',
      content: '使用Selfie Love需要相机和相册权限，请授权后使用',
      confirmText: '去授权',
      success: (res) => {
        if (res.confirm) {
          this.requestCameraPermission();
        }
      }
    });
  },

  // 加载照片数量
  loadPhotoCount() {
    try {
      const gallery = wx.getStorageSync('selfieLoveGallery') || [];
      this.setData({ photoCount: gallery.length });
    } catch (e) {
      console.error('获取照片数量失败:', e);
      this.setData({ photoCount: 0 });
    }
  },

  // 检查是否是首次访问
  checkFirstVisit() {
    try {
      const isFirstVisit = !wx.getStorageSync('notFirstVisit');
      if (isFirstVisit) {
        this.setData({ showTutorial: true });
        wx.setStorageSync('notFirstVisit', true);
      }
    } catch (e) {
      console.error('检查首次访问失败:', e);
    }
  },

  // 跳转到相机页面
  navigateToCamera() {
    if (!this.data.hasCameraPermission) {
      this.showPermissionGuide();
      return;
    }
    wx.navigateTo({
      url: '/pages/camera/camera'
    });
  },

  // 跳转到相册页面
  navigateToGallery() {
    wx.navigateTo({
      url: '/pages/gallery/gallery'
    });
  },

  // 显示/隐藏教程
  toggleTutorial() {
    this.setData({ showTutorial: !this.data.showTutorial });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'Selfie Love - 超可爱的自拍应用',
      path: '/pages/index/index',
      imageUrl: '/static/images/share-preview.jpg'
    };
  },

  // 用户下拉刷新
  onPullDownRefresh() {
    this.loadPhotoCount();
    wx.stopPullDownRefresh();
  }
});