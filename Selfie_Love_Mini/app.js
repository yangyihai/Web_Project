// app.js
App({
  onLaunch: function() {
    console.log('Selfie Love App Launch');
    
    // 初始化应用状态
    this.initializeApp();
  },
  
  onShow: function() {
    console.log('App Show');
  },
  
  onHide: function() {
    console.log('App Hide');
  },
  
  globalData: {
    userInfo: null
  },
  
  initializeApp: function() {
    // 检查权限
    this.checkPermissions();
    
    // 初始化全局配置
    this.initGlobalConfig();
  },
  
  checkPermissions: function() {
    // 检查相机权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.camera']) {
          console.log('需要相机权限');
        }
        if (!res.authSetting['scope.writePhotosAlbum']) {
          console.log('需要相册写入权限');
        }
      }
    });
  },
  
  initGlobalConfig: function() {
    // 设置默认配置
    const defaultConfig = {
      selectedShape: 'heart',
      shapeColor: '#FF6B9D',
      shapeBrightness: 80,
      shapeOpacity: 70,
      selectedFilter: 'none'
    };
    
    // 从本地存储获取配置
    try {
      const savedConfig = wx.getStorageSync('selfieLoveConfig');
      if (!savedConfig) {
        wx.setStorageSync('selfieLoveConfig', defaultConfig);
      }
    } catch (e) {
      console.error('存储初始化失败:', e);
      // 出错时也设置默认值
      wx.setStorageSync('selfieLoveConfig', defaultConfig);
    }
  }
});