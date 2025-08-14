Page({
  data: {
    colorPresets: [
      '#FF6B9D', // 粉红
      '#FF5252', // 红色
      '#FFEB3B', // 黄色
      '#4CAF50', // 绿色
      '#2196F3', // 蓝色
      '#9C27B0', // 紫色
      '#FFFFFF', // 白色
      '#000000', // 黑色
    ],
    selectedColor: '#FF6B9D',
    customColor: '',
    validCustomColor: false,
    brightness: 80,
    opacity: 70,
    config: {
      selectedShape: 'heart',
      shapeColor: '#FF6B9D',
      shapeBrightness: 80,
      shapeOpacity: 70,
      selectedFilter: 'none'
    }
  },
  onLoad() {
    // 从本地存储加载配置
    const savedConfig = wx.getStorageSync('selfieLoveConfig');
    if (savedConfig) {
      this.setData({
        config: savedConfig,
        selectedColor: savedConfig.shapeColor,
        brightness: savedConfig.shapeBrightness,
        opacity: savedConfig.shapeOpacity
      });
    }
  },
  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedColor: color,
      customColor: color,
      validCustomColor: true
    });
  },
  onCustomColorInput(e) {
    this.setData({
      customColor: e.detail.value
    });
  },
  validateColor() {
    // 简单验证颜色格式
    const colorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (colorRegex.test(this.data.customColor)) {
      this.setData({
        selectedColor: this.data.customColor,
        validCustomColor: true
      });
    } else {
      // 如果格式不正确，显示提示
      wx.showToast({
        title: '颜色格式不正确',
        icon: 'none'
      });
      this.setData({
        validCustomColor: false
      });
    }
  },
  setBrightness(e) {
    this.setData({
      brightness: e.detail.value
    });
  },
  setOpacity(e) {
    this.setData({
      opacity: e.detail.value
    });
  },
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },
  saveAndReturn() {
    // 更新配置
    const config = this.data.config;
    config.shapeColor = this.data.selectedColor;
    config.shapeBrightness = this.data.brightness;
    config.shapeOpacity = this.data.opacity;
    
    // 保存到本地存储
    wx.setStorageSync('selfieLoveConfig', config);
    
    // 返回上一页
    wx.navigateBack({
      delta: 1
    });
  }
});