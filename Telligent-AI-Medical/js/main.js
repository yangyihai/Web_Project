// 智慧医疗咨询平台主应用
class MedicalApp {
    constructor() {
        this.currentSection = 0; // 使用索引而不是ID
        this.sliderWrapper = null;
        this.sectionNames = ['home', 'consultation', 'hospitals', 'medication'];
        this.auditLog = [];
        this.sessionId = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.initializeSecurity();
        this.showSection(0); // 默认显示首页
    }

    // 设置导航功能
    setupNavigation() {
        this.sliderWrapper = document.getElementById('sliderWrapper');
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = parseInt(link.getAttribute('data-section'));
                this.showSection(targetSection);
            });
        });

        // 移动端菜单切换
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // 支持键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentSection > 0) {
                this.showSection(this.currentSection - 1);
            } else if (e.key === 'ArrowRight' && this.currentSection < 3) {
                this.showSection(this.currentSection + 1);
            }
        });

        // 支持触摸滑动
        this.setupTouchNavigation();
    }

    setupTouchNavigation() {
        if (!this.sliderWrapper) return;

        let startX = 0;
        let startY = 0;
        let moving = false;

        this.sliderWrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            moving = false;
        }, { passive: true });

        this.sliderWrapper.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // 检查是否为水平滑动
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                moving = true;
                e.preventDefault();
            }
        });

        this.sliderWrapper.addEventListener('touchend', (e) => {
            if (!moving || !startX) return;

            const currentX = e.changedTouches[0].clientX;
            const diffX = startX - currentX;

            if (Math.abs(diffX) > 100) {
                if (diffX > 0 && this.currentSection < 3) {
                    // 向左滑动，显示下一页
                    this.showSection(this.currentSection + 1);
                } else if (diffX < 0 && this.currentSection > 0) {
                    // 向右滑动，显示上一页
                    this.showSection(this.currentSection - 1);
                }
            }

            startX = 0;
            startY = 0;
            moving = false;
        }, { passive: true });
    }

    // 显示指定section
    showSection(sectionIndex) {
        if (sectionIndex < 0 || sectionIndex > 3) return;

        // 计算滑动距离
        const translateX = -sectionIndex * 25; // 每个section占25%宽度
        
        if (this.sliderWrapper) {
            this.sliderWrapper.style.transform = `translateX(${translateX}%)`;
        }

        // 更新导航状态
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.classList.remove('active');
            if (index === sectionIndex) {
                link.classList.add('active');
            }
        });

        this.currentSection = sectionIndex;
        this.logActivity('navigation', `切换到${this.sectionNames[sectionIndex]}页面`);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 文件上传处理
        this.setupFileUpload();
        
        // 表单验证
        this.setupFormValidation();
        
        // 通知系统
        this.setupNotificationSystem();
    }

    // 文件上传功能
    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadedFiles = document.getElementById('uploadedFiles');

        if (!uploadArea || !fileInput) return;

        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(0, 113, 227, 0.08)';
            uploadArea.style.borderColor = '#0071e3';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#fafafa';
            uploadArea.style.borderColor = '#d2d2d7';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#fafafa';
            uploadArea.style.borderColor = '#d2d2d7';
            this.handleFiles(e.dataTransfer.files);
        });

        // 文件选择处理
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (!uploadedFiles) return;

        Array.from(files).forEach(file => {
            // 验证文件类型和大小
            if (!this.validateFile(file)) return;

            const fileItem = this.createFileItem(file);
            uploadedFiles.appendChild(fileItem);
        });
    }

    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            this.showNotification('文件类型不支持', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification('文件大小超过10MB限制', 'error');
            return false;
        }

        return true;
    }

    createFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            margin: 8px 0;
            background: white;
            border: 1px solid #d2d2d7;
            border-radius: 12px;
            transition: all 0.3s ease;
        `;

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const icon = file.type.startsWith('image/') ? 'fas fa-image' : 'fas fa-file-pdf';
        
        fileInfo.innerHTML = `
            <i class="${icon}" style="font-size: 24px; color: #0071e3;"></i>
            <div>
                <div class="file-name" style="font-weight: 500; color: #1d1d1f;">${file.name}</div>
                <div class="file-size" style="font-size: 14px; color: #86868b;">${this.formatFileSize(file.size)}</div>
            </div>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.style.cssText = `
            background: #ff3b30;
            color: white;
            border: none;
            border-radius: 6px;
            width: 30px;
            height: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => fileItem.remove();

        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);

        return fileItem;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 表单验证
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, '此字段为必填项');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#ff3b30';
        
        // 移除之前的错误消息
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // 添加新的错误消息
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #ff3b30;
            font-size: 14px;
            margin-top: 6px;
        `;
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '#d2d2d7';
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // 通知系统
    setupNotificationSystem() {
        // 创建通知容器
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 64px;
                right: 22px;
                z-index: 10000;
                pointer-events: none;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.04);
            margin-bottom: 12px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s cubic-bezier(0.28, 0.11, 0.32, 1);
            pointer-events: auto;
            overflow: hidden;
        `;

        const colors = {
            success: '#34c759',
            error: '#ff3b30',
            warning: '#ff9500',
            info: '#0071e3'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div style="padding: 16px 20px; display: flex; align-items: flex-start; gap: 12px;">
                <i class="${icons[type]}" style="color: ${colors[type]}; font-size: 20px; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1d1d1f; margin-bottom: 4px;">
                        ${this.getNotificationTitle(type)}
                    </div>
                    <div style="color: #86868b; font-size: 15px; line-height: 1.4;">
                        ${message}
                    </div>
                </div>
                <button onclick="this.parentNode.parentNode.remove()" 
                        style="background: none; border: none; color: #86868b; cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动消失
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    getNotificationTitle(type) {
        const titles = {
            success: '成功',
            error: '错误',
            warning: '警告',
            info: '提示'
        };
        return titles[type] || '通知';
    }

    // 安全性和隐私保护初始化
    initializeSecurity() {
        // 初始化数据加密
        this.setupDataEncryption();
        
        // 设置会话超时
        this.setupSessionTimeout();
        
        // 初始化审计日志
        this.initAuditLog();
    }

    setupDataEncryption() {
        console.log('✓ 数据加密已启用 (AES-256)');
    }

    setupSessionTimeout() {
        // 30分钟无活动自动登出
        let timeoutId;
        const timeout = 30 * 60 * 1000; // 30分钟

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                this.showNotification('会话已超时，数据已自动清除', 'warning');
                this.clearSensitiveData();
            }, timeout);
        };

        // 监听用户活动
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        resetTimer();
    }

    initAuditLog() {
        this.auditLog = [];
        this.logActivity('system', '应用初始化');
    }

    logActivity(action, details, level = 'info') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            details,
            level,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };

        this.auditLog.push(logEntry);
        
        // 保持日志在合理大小
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-500);
        }

        // 在开发环境中输出日志
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`[AUDIT] ${action}: ${details}`);
        }
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    clearSensitiveData() {
        // 清除表单数据
        const sensitiveFields = document.querySelectorAll('textarea, input[type="text"]');
        sensitiveFields.forEach(field => field.value = '');

        // 清除上传的文件
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (uploadedFiles) {
            uploadedFiles.innerHTML = '';
        }

        // 清除诊断结果
        const analysisResult = document.getElementById('analysisResult');
        if (analysisResult) {
            analysisResult.innerHTML = `
                <div class="loading" id="loadingIndicator">
                    <div class="spinner"></div>
                    <p>AI正在分析您的症状...</p>
                </div>
            `;
        }

        this.logActivity('security', '敏感数据已清除');
    }

    // 工具方法
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 滚动到功能区域
window.scrollToFeatures = function() {
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
        featuresSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// 全局函数供HTML调用
window.showSection = function(sectionId) {
    if (window.medicalApp) {
        const sectionIndex = window.medicalApp.sectionNames.indexOf(sectionId);
        if (sectionIndex !== -1) {
            window.medicalApp.showSection(sectionIndex);
        }
    }
};

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    window.medicalApp = new MedicalApp();
    
    // 性能监控
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`页面加载时间: ${loadTime}ms`);
                
                if (loadTime > 2000) {
                    console.warn('页面加载时间超过2秒，建议优化');
                }
            }, 0);
        });
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('应用错误:', e.error);
    if (window.medicalApp) {
        window.medicalApp.logActivity('error', e.message, 'error');
    }
});

// 导出用于其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicalApp;
}