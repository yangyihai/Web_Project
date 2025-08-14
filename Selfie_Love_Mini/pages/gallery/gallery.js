Page({
  data: {
    photos: [],
    selectedPhotos: [],
    showPreview: false,
    previewPhoto: null
  },

  onLoad() {
    this.loadPhotos();
  },

  onShow() {
    this.loadPhotos();
  },

  loadPhotos() {
    try {
      const gallery = wx.getStorageSync('selfieLoveGallery') || [];
      this.setData({
        photos: gallery,
        selectedPhotos: []
      });
    } catch (e) {
      console.error('加载照片失败:', e);
      this.setData({
        photos: [],
        selectedPhotos: []
      });
    }
  },

  toggleSelect(e) {
    const photo = e.currentTarget.dataset.photo;
    const selectedPhotos = this.data.selectedPhotos;
    const index = selectedPhotos.findIndex(item => item.id === photo.id);
    
    if (index === -1) {
      selectedPhotos.push(photo);
    } else {
      selectedPhotos.splice(index, 1);
    }
    
    this.setData({ selectedPhotos });
  },

  isSelected(photoId) {
    return this.data.selectedPhotos.some(photo => photo.id === photoId);
  },

  confirmDelete() {
    if (this.data.selectedPhotos.length === 0) return;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${this.data.selectedPhotos.length} 张照片吗？`,
      confirmColor: '#FF6B9D',
      success: (res) => {
        if (res.confirm) {
          this.deleteSelectedPhotos();
        }
      }
    });
  },

  deleteSelectedPhotos() {
    const selectedIds = this.data.selectedPhotos.map(photo => photo.id);
    const updatedGallery = this.data.photos.filter(photo => !selectedIds.includes(photo.id));
    
    try {
      wx.setStorageSync('selfieLoveGallery', updatedGallery);
      this.setData({
        photos: updatedGallery,
        selectedPhotos: []
      });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } catch (e) {
      console.error('删除照片失败:', e);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  viewPhoto(e) {
    const photo = e.currentTarget.dataset.photo;
    this.setData({
      previewPhoto: photo,
      showPreview: true
    });
  },

  hidePreview() {
    this.setData({
      showPreview: false,
      previewPhoto: null
    });
  },

  sharePhoto() {
    if (!this.data.previewPhoto) return;
    
    wx.shareAppMessage({
      title: 'Selfie Love 自拍',
      imageUrl: this.data.previewPhoto.path,
      success: () => {
        console.log('分享成功');
      },
      fail: (err) => {
        console.error('分享失败', err);
      }
    });
  },

  saveToAlbum() {
    if (!this.data.previewPhoto) return;
    
    wx.saveImageToPhotosAlbum({
      filePath: this.data.previewPhoto.path,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存失败', err);
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
      }
    });
  },

  deletePhoto() {
    if (!this.data.previewPhoto) return;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      confirmColor: '#FF6B9D',
      success: (res) => {
        if (res.confirm) {
          try {
            const updatedGallery = this.data.photos.filter(
              photo => photo.id !== this.data.previewPhoto.id
            );
            
            wx.setStorageSync('selfieLoveGallery', updatedGallery);
            this.setData({
              photos: updatedGallery,
              showPreview: false,
              previewPhoto: null
            });
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (e) {
            console.error('删除照片失败:', e);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 直接跳转到相机页面
  goToCamera() {
    // 检查相机权限
    wx.getSetting({
      success: (settingRes) => {
        if (settingRes.authSetting['scope.camera']) {
          // 已有权限，直接跳转
          wx.navigateTo({
            url: '/pages/camera/camera'
          });
        } else {
          // 没有权限，请求授权
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              wx.navigateTo({
                url: '/pages/camera/camera'
              });
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '需要相机权限才能使用拍照功能',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        }
      }
    });
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  },

  stopPropagation() {
    // 阻止事件冒泡
    return;
  }
});