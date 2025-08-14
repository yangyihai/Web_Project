Page({
  data: {
    ctx: null,
    cameraHeight: 0,
    screenBrightness: 50, // 屏幕亮度，范围0-100
    showBrightnessPanel: false,
    showPreview: false,
    previewImage: '',
    // 新增emoji相关数据
    isEmoji: false,
    emojiHeight: 0,
    footHeight: 100,
    // emoji列表
    emojiList: [
      "❤", "💓", "💔", "💕", "💗", "💖", "💙", "💚", "💛", "💜", "💝", "💞", "💟",
      "😨", "😩", "😬", "😰", "😱", "�", "😵", "😡", "😠",
      "💫", "👑", "📿", "💎", "💨", "💫", "💬", "🗯", "💭", "🗨",
      "☸", "☘", "⭐", "🌟", "🌠", "🎆", "🎇", "✨", "🎉", "🎊",
      "💢", "🎭", "☀", "🌝", "🌞", "🎗"
    ],
    // 选中的emoji和位置数据
    selectedEmojis: [],
    // 当前操作的emoji
    activeEmojiIndex: -1,
    // 触摸相关数据
    touchStartDistance: 0,
    touchStartPos: { x: 0, y: 0 },
    touchEmojiActive: false
  },

  onLoad() {
    // 获取屏幕高度设置相机高度
    try {
      const windowInfo = wx.getWindowInfo();
      this.setData({
        cameraHeight: windowInfo.windowHeight
      });
    } catch (e) {
      console.error('获取窗口信息失败:', e);
      // 设置默认高度
      this.setData({
        cameraHeight: 600
      });
    }
    
    // 创建相机上下文
    this.setData({
      ctx: wx.createCameraContext()
    });

    // 获取当前屏幕亮度
    this.getCurrentBrightness();
  },
  
  onShow() {
    // 确保相机权限
    this.checkCameraPermission();
  },
  
  // 检查相机权限
  checkCameraPermission() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('相机授权成功');
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '需要相机权限才能使用拍照功能',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  } else {
                    wx.navigateBack();
                  }
                }
              });
            }
          });
        }
      }
    });
  },
  
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  // 切换亮度控制面板
  toggleBrightnessPanel() {
    this.setData({
      showBrightnessPanel: !this.data.showBrightnessPanel,
      isEmoji: false,
      emojiHeight: 0
    });
  },

  // 获取当前屏幕亮度
  getCurrentBrightness() {
    try {
      wx.getScreenBrightness({
        success: (res) => {
          // 转换为0-100的范围
          const brightnessPercentage = Math.round(res.value * 100);
          this.setData({
            screenBrightness: brightnessPercentage
          });
        },
        fail: (err) => {
          console.error('获取屏幕亮度失败', err);
        }
      });
    } catch (e) {
      console.error('获取屏幕亮度出错:', e);
    }
  },

  // 调整屏幕亮度
  adjustBrightness(e) {
    const brightness = e.detail.value;
    this.setData({
      screenBrightness: brightness
    });
    
    // 将0-100的值转换为0-1的范围
    const brightnessValue = brightness / 100;
    
    try {
      wx.setScreenBrightness({
        value: brightnessValue,
        success: () => {
          console.log('屏幕亮度设置成功:', brightnessValue);
        },
        fail: (err) => {
          console.error('设置屏幕亮度失败:', err);
          wx.showToast({
            title: '亮度调节失败',
            icon: 'none'
          });
        }
      });
    } catch (e) {
      console.error('设置屏幕亮度出错:', e);
    }
  },
  
  // 显示emoji选择面板
  onEmoji() {
    this.setData({
      isEmoji: true,
      emojiHeight: 400,
      footHeight: 500,
      showBrightnessPanel: false
    });
  },
  
  // 隐藏emoji选择面板
  hideEmoji() {
    this.setData({
      isEmoji: false,
      emojiHeight: 0,
      footHeight: 100
    });
  },
  
  // 选择emoji添加到屏幕
  selectEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji;
    
    // 获取屏幕尺寸用于定位
    const systemInfo = wx.getSystemInfoSync();
    const screenWidth = systemInfo.windowWidth;
    const screenHeight = systemInfo.windowHeight;
    
    // 添加新的emoji到列表，初始位置在屏幕中央
    const newEmoji = {
      text: emoji,
      x: screenWidth / 2 - 30, // 居中显示，减去表情大小的一半
      y: screenHeight / 2 - 30, // 居中显示，减去表情大小的一半
      size: 60, // 默认大小
      rotation: 0 // 默认旋转角度
    };
    
    const selectedEmojis = this.data.selectedEmojis;
    selectedEmojis.push(newEmoji);
    
    this.setData({
      selectedEmojis: selectedEmojis,
      activeEmojiIndex: selectedEmojis.length - 1, // 选中新添加的emoji
      isEmoji: false, // 隐藏选择面板
      emojiHeight: 0,
      footHeight: 100
    });
  },
  
  // 开始触摸emoji
  startTouchEmoji(e) {
    // 查找点击的是哪个emoji
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    const emojis = this.data.selectedEmojis;
    
    let activeIndex = -1;
    // 从后向前检查，这样可以优先选中最上层的emoji
    for (let i = emojis.length - 1; i >= 0; i--) {
      const emoji = emojis[i];
      // 检查触摸点是否在emoji区域内
      if (
        touchX >= emoji.x && 
        touchX <= emoji.x + emoji.size && 
        touchY >= emoji.y && 
        touchY <= emoji.y + emoji.size
      ) {
        activeIndex = i;
        break;
      }
    }
    
    if (activeIndex !== -1) {
      if (e.touches.length === 1) {
        // 单指触摸，准备移动emoji
        this.setData({
          'touchStartPos.x': touchX,
          'touchStartPos.y': touchY,
          touchEmojiActive: true,
          activeEmojiIndex: activeIndex
        });
      } else if (e.touches.length === 2) {
        // 双指触摸，准备调整大小
        const distance = Math.sqrt(
          Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + 
          Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
        );
        this.setData({
          touchStartDistance: distance,
          touchEmojiActive: true,
          activeEmojiIndex: activeIndex
        });
      }
    }
  },
  
  // 移动emoji
  moveTouchEmoji(e) {
    if (!this.data.touchEmojiActive || this.data.activeEmojiIndex === -1) return;

    if (e.touches.length === 1) {
      // 单指移动emoji位置
      const deltaX = e.touches[0].clientX - this.data.touchStartPos.x;
      const deltaY = e.touches[0].clientY - this.data.touchStartPos.y;
      
      const activeIndex = this.data.activeEmojiIndex;
      const emojis = this.data.selectedEmojis;
      
      emojis[activeIndex].x += deltaX;
      emojis[activeIndex].y += deltaY;
      
      this.setData({
        selectedEmojis: emojis,
        'touchStartPos.x': e.touches[0].clientX,
        'touchStartPos.y': e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // 双指调整emoji大小
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) + 
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      
      const scaleFactor = distance / this.data.touchStartDistance;
      
      const activeIndex = this.data.activeEmojiIndex;
      const emojis = this.data.selectedEmojis;
      
      // 调整大小，并确保在合理范围内
      let newSize = emojis[activeIndex].size * scaleFactor;
      newSize = Math.max(30, Math.min(200, newSize));
      
      emojis[activeIndex].size = newSize;
      
      this.setData({
        selectedEmojis: emojis,
        touchStartDistance: distance
      });
    }
  },
  
  // 结束触摸emoji
  endTouchEmoji() {
    this.setData({
      touchEmojiActive: false
    });
  },
  
  // 删除当前选中的emoji
  deleteEmoji() {
    if (this.data.activeEmojiIndex !== -1) {
      const emojis = this.data.selectedEmojis;
      emojis.splice(this.data.activeEmojiIndex, 1);
      
      this.setData({
        selectedEmojis: emojis,
        activeEmojiIndex: -1
      });
    }
  },
  
  takePhoto() {
    if (!this.data.ctx) {
      wx.showToast({
        title: '相机初始化失败',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '拍照中...'
    });
    
    // 拍照并合成emoji
    const _this = this;
    
    // 先获取相机快照
    this.data.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('拍照成功', res);
        
        // 如果没有选择emoji，直接显示预览
        if (_this.data.selectedEmojis.length === 0) {
          _this.setData({
            previewImage: res.tempImagePath,
            showPreview: true
          });
          wx.hideLoading();
          return;
        }
        
        // 如果选择了emoji，需要合成图像
        const cameraImagePath = res.tempImagePath;
        
        // 创建离屏canvas进行图像合成
        const canvasId = 'offscreenCanvas';
        const query = wx.createSelectorQuery();
        query.select('#' + canvasId)
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res || !res[0] || !res[0].node) {
              console.error('Canvas不可用');
              _this.setData({
                previewImage: cameraImagePath,
                showPreview: true
              });
              wx.hideLoading();
              return;
            }
            
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            // 获取设备信息设置canvas尺寸
            wx.getSystemInfo({
              success: (sysInfo) => {
                // 设置canvas尺寸与设备屏幕相匹配
                const width = sysInfo.windowWidth;
                const height = sysInfo.windowHeight;
                canvas.width = width;
                canvas.height = height;
                
                // 加载相机图像
                const cameraImg = canvas.createImage();
                cameraImg.onload = () => {
                  // 绘制相机图像
                  ctx.drawImage(cameraImg, 0, 0, width, height);
                  
                  // 绘制所有emoji
                  _this.drawEmojisOnCanvas(ctx, () => {
                    // 导出合成图像
                    canvas.toTempFilePath({
                      x: 0,
                      y: 0,
                      width: width,
                      height: height,
                      destWidth: width,
                      destHeight: height,
                      quality: 1,
                      success: (res) => {
                        // 显示合成后的图像
                        _this.setData({
                          previewImage: res.tempFilePath,
                          showPreview: true
                        });
                      },
                      fail: (error) => {
                        console.error('生成合成图像失败', error);
                        // 如果合成失败，则至少显示相机图像
                        _this.setData({
                          previewImage: cameraImagePath,
                          showPreview: true
                        });
                      },
                      complete: () => {
                        wx.hideLoading();
                      }
                    });
                  });
                };
                
                cameraImg.onerror = () => {
                  console.error('加载相机图像失败');
                  wx.hideLoading();
                  wx.showToast({
                    title: '图像处理失败',
                    icon: 'none'
                  });
                };
                
                cameraImg.src = cameraImagePath;
              },
              fail: () => {
                console.error('获取系统信息失败');
                // 如果获取系统信息失败，仍然显示原始图像
                _this.setData({
                  previewImage: cameraImagePath,
                  showPreview: true
                });
                wx.hideLoading();
              }
            });
          });
      },
      fail: (err) => {
        console.error('拍照失败', err);
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        });
        wx.hideLoading();
      }
    });
  },
  
  // 在canvas上绘制所有emoji
  drawEmojisOnCanvas(ctx, callback) {
    const emojis = this.data.selectedEmojis;
    
    if (emojis.length === 0) {
      callback();
      return;
    }
    
    // 遍历绘制每个emoji
    emojis.forEach((emoji, index) => {
      // 设置字体大小
      ctx.font = `${emoji.size}px Arial`;
      
      // 绘制emoji
      ctx.fillText(emoji.text, emoji.x, emoji.y + emoji.size * 0.8); // 调整Y坐标使emoji垂直居中
    });
    
    callback();
  },
  
  savePhoto() {
    wx.showLoading({
      title: '保存中...'
    });
    
    wx.saveImageToPhotosAlbum({
      filePath: this.data.previewImage,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 同时保存到本地相册数据
        this.saveToGallery();
        
        // 关闭预览
        this.setData({
          showPreview: false,
          previewImage: ''
        });
      },
      fail: (err) => {
        console.error('保存失败', err);
        
        // 如果是权限问题，提示用户授权
        if (err.errMsg && err.errMsg.indexOf('auth deny') >= 0) {
          wx.showModal({
            title: '提示',
            content: '需要相册权限才能保存照片',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  discardPhoto() {
    this.setData({
      showPreview: false,
      previewImage: ''
    });
  },
  
  saveToGallery() {
    // 获取当前相册数据
    try {
      let gallery = wx.getStorageSync('selfieLoveGallery') || [];
      
      // 添加新照片数据
      gallery.unshift({
        id: Date.now(),
        path: this.data.previewImage,
        date: new Date().toISOString()
      });
      
      // 限制最多保存50张照片
      if (gallery.length > 50) {
        gallery = gallery.slice(0, 50);
      }
      
      // 保存回本地存储
      wx.setStorageSync('selfieLoveGallery', gallery);
    } catch (e) {
      console.error('保存相册数据失败:', e);
      wx.showToast({
        title: '相册保存失败',
        icon: 'none'
      });
    }
  },
  
  handleError(e) {
    console.error('相机错误', e);
    
    wx.showModal({
      title: '相机无法使用',
      content: '请检查相机权限是否已授权',
      confirmText: '去授权',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting();
        } else {
          wx.navigateBack();
        }
      }
    });
  }
});