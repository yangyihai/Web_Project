Page({
  data: {
    shapes: [
      { id: 'heart', name: '爱心' },
      { id: 'star', name: '星星' },
      { id: 'circle', name: '圆形' },
      { id: 'flower', name: '花朵' },
      { id: 'butterfly', name: '蝴蝶' },
      { id: 'crown', name: '皇冠' },
      { id: 'glasses', name: '眼镜' },
      { id: 'sparkle', name: '闪光' },
      { id: 'none', name: '无' }
    ],
    selectedShape: 'heart',
    config: {
      selectedShape: 'heart',
      shapeColor: '#FF6B9D',
      shapeBrightness: 80,
      shapeOpacity: 70,
      selectedFilter: 'none'
    }
  },

  onLoad() {
    const savedConfig = wx.getStorageSync('selfieLoveConfig');
    if (savedConfig) {
      this.setData({
        config: savedConfig,
        selectedShape: savedConfig.selectedShape
      });
    }
  },

  selectShape(e) {
    const shapeId = e.currentTarget.dataset.shape;
    this.setData({
      selectedShape: shapeId
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  saveAndReturn() {
    const config = this.data.config;
    config.selectedShape = this.data.selectedShape;
    
    wx.setStorageSync('selfieLoveConfig', config);
    
    wx.navigateBack({
      delta: 1
    });
  }
});