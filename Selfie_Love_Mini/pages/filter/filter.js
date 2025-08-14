Page({
  data: {
    filters: [
      { id: 'none', name: '无滤镜', description: '原始效果，不添加任何滤镜' },
      { id: 'warm', name: '暖阳', description: '增加温暖橙色调，让照片更加温馨自然' },
      { id: 'cool', name: '冷静', description: '增添蓝色调，带来冷静清新的感觉' },
      { id: 'vintage', name: '复古', description: '复古怀旧风格，带来时光倒流的感觉' },
      { id: 'dramatic', name: '戏剧', description: '增加照片的戏剧性和对比度' },
      { id: 'bw', name: '黑白', description: '经典黑白效果，突显照片的情感表达' }
    ],
    selectedFilter: 'none',
    currentFilterName: '无滤镜',
    currentFilterDesc: '原始效果，不添加任何滤镜',
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
        selectedFilter: savedConfig.selectedFilter
      });
      this.updateFilterInfo();
    }
  },
  selectFilter(e) {
    const filterId = e.currentTarget.dataset.filter;
    this.setData({
      selectedFilter: filterId
    });
    this.updateFilterInfo();
  },
  updateFilterInfo() {
    const filter = this.data.filters.find(f => f.id === this.data.selectedFilter);
    this.setData({
      currentFilterName: filter ? filter.name : '无滤镜',
      currentFilterDesc: filter ? filter.description : '原始效果，不添加任何滤镜'
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
    config.selectedFilter = this.data.selectedFilter;
    
    // 保存到本地存储
    wx.setStorageSync('selfieLoveConfig', config);
    
    // 返回上一页
    wx.navigateBack({
      delta: 1
    });
  }
});