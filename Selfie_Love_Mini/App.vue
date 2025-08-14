<script>
export default {
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
	methods: {
		initializeApp() {
			// 检查权限
			this.checkPermissions();
			
			// 初始化全局配置
			this.initGlobalConfig();
		},
		
		checkPermissions() {
			// 检查相机权限
			uni.getSetting({
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
		
		initGlobalConfig() {
			// 设置默认配置
			const defaultConfig = {
				selectedShape: 'heart',
				shapeColor: '#FF6B9D',
				shapeBrightness: 80,
				shapeOpacity: 70,
				selectedFilter: 'none'
			};
			
			// 从本地存储获取配置
			const savedConfig = uni.getStorageSync('selfieLoveConfig');
			if (!savedConfig) {
				uni.setStorageSync('selfieLoveConfig', defaultConfig);
			}
		}
	}
}
</script>

<style lang="scss">
/* 全局样式 */
@import './styles/variables.scss';
@import './styles/common.scss';

/* 应用基础样式 */
page {
	background-color: $background-color;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
	line-height: 1.6;
}

/* 通用动画 */
.fade-in {
	animation: fadeIn 0.3s ease-in;
}

.fade-out {
	animation: fadeOut 0.3s ease-out;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes fadeOut {
	from { opacity: 1; }
	to { opacity: 0; }
}

/* 通用按钮样式 */
.btn-primary {
	background: linear-gradient(135deg, $primary-color, $secondary-color);
	color: white;
	border: none;
	border-radius: 25px;
	padding: 12px 24px;
	font-size: 16px;
	font-weight: 500;
	transition: all 0.3s ease;
	box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.btn-primary:active {
	transform: scale(0.95);
	box-shadow: 0 2px 8px rgba(255, 107, 157, 0.4);
}

.btn-secondary {
	background: white;
	color: $primary-color;
	border: 2px solid $primary-color;
	border-radius: 25px;
	padding: 10px 22px;
	font-size: 16px;
	font-weight: 500;
	transition: all 0.3s ease;
}

.btn-secondary:active {
	background: $primary-color;
	color: white;
}

/* 卡片样式 */
.card {
	background: white;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	padding: 20px;
	margin: 10px;
}

/* 容器样式 */
.container {
	padding: 20px;
	max-width: 750px;
	margin: 0 auto;
}

/* 网格布局 */
.grid {
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
}

.grid-item {
	flex: 1;
	min-width: 0;
}

/* 文本样式 */
.text-primary {
	color: $primary-color;
}

.text-secondary {
	color: $secondary-color;
}

.text-center {
	text-align: center;
}

.text-large {
	font-size: 18px;
	font-weight: 600;
}

.text-small {
	font-size: 14px;
	color: #666;
}

/* 间距工具类 */
.mb-10 { margin-bottom: 10px; }
.mb-20 { margin-bottom: 20px; }
.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.p-10 { padding: 10px; }
.p-20 { padding: 20px; }
</style>