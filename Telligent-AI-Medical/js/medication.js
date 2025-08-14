// 用药提醒模块
class MedicationModule {
    constructor() {
        this.medications = [];
        this.reminders = [];
        this.notificationPermission = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.loadMedications();
        this.startReminderSystem();
        console.log('✓ 用药提醒模块已初始化');
    }

    setupEventListeners() {
        // 添加用药提醒按钮
        const addBtn = document.querySelector('.med-form button');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addMedication();
            });
        }

        // 表单验证
        const inputs = document.querySelectorAll('.med-form input, .med-form select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    // 请求通知权限
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            
            if (!this.notificationPermission) {
                this.showNotification('请允许通知权限以便接收用药提醒', 'warning');
            }
        }
    }

    // 添加用药提醒
    addMedication() {
        const name = document.getElementById('medName').value.trim();
        const dosage = document.getElementById('medDosage').value.trim();
        const frequency = document.getElementById('medFrequency').value;
        const time = document.getElementById('medTime').value;

        // 验证输入
        if (!this.validateMedicationForm(name, dosage, frequency, time)) {
            return;
        }

        // 创建用药记录
        const medication = {
            id: Date.now(),
            name,
            dosage,
            frequency,
            time,
            startDate: new Date().toISOString().split('T')[0],
            status: 'active',
            createdAt: new Date(),
            history: []
        };

        this.medications.push(medication);
        this.saveMedications();
        this.displayMedications();
        this.setupReminders(medication);
        this.clearForm();

        this.showNotification(`已添加用药提醒：${name}`, 'success');
        this.logActivity('medication', `添加用药提醒: ${name}`);
    }

    // 验证用药表单
    validateMedicationForm(name, dosage, frequency, time) {
        const errors = [];

        if (!name) errors.push('请输入药品名称');
        if (!dosage) errors.push('请输入剂量');
        if (!frequency) errors.push('请选择服药频率');
        if (!time) errors.push('请设置提醒时间');

        // 检查药品名称是否重复
        const existingMed = this.medications.find(med => 
            med.name.toLowerCase() === name.toLowerCase() && med.status === 'active'
        );
        if (existingMed) {
            errors.push('该药品已存在活跃提醒');
        }

        if (errors.length > 0) {
            this.showNotification(errors.join('<br>'), 'error');
            return false;
        }

        return true;
    }

    // 验证单个字段
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        switch (field.id) {
            case 'medName':
                isValid = value.length > 0 && value.length <= 50;
                break;
            case 'medDosage':
                isValid = value.length > 0 && /^[\d\.]+(片|粒|毫升|ml|滴|包|袋)$/.test(value);
                break;
            case 'medTime':
                isValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
                break;
        }

        if (isValid) {
            this.clearFieldError(field);
        } else {
            this.showFieldError(field, this.getFieldErrorMessage(field.id));
        }

        return isValid;
    }

    getFieldErrorMessage(fieldId) {
        const messages = {
            medName: '请输入有效的药品名称（1-50字符）',
            medDosage: '请输入有效的剂量（如：1片、2粒、5ml等）',
            medTime: '请输入有效的时间格式（HH:MM）'
        };
        return messages[fieldId] || '输入格式不正确';
    }

    // 清空表单
    clearForm() {
        document.getElementById('medName').value = '';
        document.getElementById('medDosage').value = '';
        document.getElementById('medFrequency').value = '';
        document.getElementById('medTime').value = '';
    }

    // 显示用药列表
    displayMedications() {
        const container = document.getElementById('medicationItems');
        if (!container) return;

        if (this.medications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pills"></i>
                    <h3>暂无用药提醒</h3>
                    <p>添加您的第一个用药提醒</p>
                </div>
            `;
            return;
        }

        const activeMeds = this.medications.filter(med => med.status === 'active');
        const html = activeMeds.map(med => this.createMedicationCard(med)).join('');
        container.innerHTML = html;
    }

    // 创建用药卡片
    createMedicationCard(medication) {
        const nextDose = this.getNextDoseTime(medication);
        const statusClass = this.getMedicationStatusClass(medication);
        
        return `
            <div class="medication-item" data-med-id="${medication.id}">
                <div class="medication-header">
                    <h3 class="medication-name">${medication.name}</h3>
                    <span class="medication-status ${statusClass}">${this.getStatusText(medication)}</span>
                </div>
                <div class="medication-details">
                    <div class="detail-item">
                        <div class="detail-label">剂量</div>
                        <div class="detail-value">${medication.dosage}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">频率</div>
                        <div class="detail-value">${this.getFrequencyText(medication.frequency)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">提醒时间</div>
                        <div class="detail-value">${medication.time}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">下次服药</div>
                        <div class="detail-value">${nextDose}</div>
                    </div>
                </div>
                <div class="medication-actions">
                    <button class="take-btn" onclick="medicationModule.takeMedication(${medication.id})">
                        <i class="fas fa-check"></i> 已服药
                    </button>
                    <button class="skip-btn" onclick="medicationModule.skipDose(${medication.id})">
                        <i class="fas fa-times"></i> 跳过
                    </button>
                    <button class="edit-btn" onclick="medicationModule.editMedication(${medication.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="delete-btn" onclick="medicationModule.deleteMedication(${medication.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `;
    }

    // 获取频率文本
    getFrequencyText(frequency) {
        const frequencies = {
            once: '每日1次',
            twice: '每日2次',
            three: '每日3次',
            four: '每日4次'
        };
        return frequencies[frequency] || frequency;
    }

    // 获取状态文本
    getStatusText(medication) {
        const now = new Date();
        const nextDose = new Date();
        const [hours, minutes] = medication.time.split(':');
        nextDose.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (nextDose <= now) {
            return '待服药';
        } else {
            return '正常';
        }
    }

    // 获取用药状态类
    getMedicationStatusClass(medication) {
        const status = this.getStatusText(medication);
        return status === '待服药' ? 'status-missed' : 'status-active';
    }

    // 获取下次服药时间
    getNextDoseTime(medication) {
        const now = new Date();
        const nextDose = new Date();
        const [hours, minutes] = medication.time.split(':');
        
        nextDose.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (nextDose <= now) {
            nextDose.setDate(nextDose.getDate() + 1);
        }
        
        return nextDose.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 服药记录
    takeMedication(medicationId) {
        const medication = this.medications.find(med => med.id === medicationId);
        if (!medication) return;

        // 记录服药历史
        medication.history.push({
            date: new Date(),
            action: 'taken',
            dosage: medication.dosage
        });

        this.saveMedications();
        this.displayMedications();
        
        this.showNotification(`已记录 ${medication.name} 的服药记录`, 'success');
        this.logActivity('medication', `服药记录: ${medication.name}`);
    }

    // 跳过服药
    skipDose(medicationId) {
        const medication = this.medications.find(med => med.id === medicationId);
        if (!medication) return;

        if (confirm(`确定要跳过 ${medication.name} 的服药吗？`)) {
            medication.history.push({
                date: new Date(),
                action: 'skipped',
                reason: '用户跳过'
            });

            this.saveMedications();
            this.displayMedications();
            
            this.showNotification(`已跳过 ${medication.name} 的服药`, 'info');
            this.logActivity('medication', `跳过服药: ${medication.name}`);
        }
    }

    // 编辑用药
    editMedication(medicationId) {
        const medication = this.medications.find(med => med.id === medicationId);
        if (!medication) return;

        // 填充表单
        document.getElementById('medName').value = medication.name;
        document.getElementById('medDosage').value = medication.dosage;
        document.getElementById('medFrequency').value = medication.frequency;
        document.getElementById('medTime').value = medication.time;

        // 删除原有记录
        this.deleteMedication(medicationId, false);
        
        this.showNotification('用药信息已加载到表单，请修改后重新添加', 'info');
    }

    // 删除用药
    deleteMedication(medicationId, confirm = true) {
        const medication = this.medications.find(med => med.id === medicationId);
        if (!medication) return;

        if (confirm && !window.confirm(`确定要删除 ${medication.name} 的用药提醒吗？`)) {
            return;
        }

        // 标记为删除而不是真正删除（保留历史记录）
        medication.status = 'deleted';
        medication.deletedAt = new Date();

        this.saveMedications();
        this.displayMedications();
        this.clearReminders(medicationId);
        
        this.showNotification(`已删除 ${medication.name} 的用药提醒`, 'success');
        this.logActivity('medication', `删除用药提醒: ${medication.name}`);
    }

    // 设置提醒
    setupReminders(medication) {
        const times = this.calculateReminderTimes(medication.frequency, medication.time);
        
        times.forEach(time => {
            this.scheduleReminder(medication, time);
        });
    }

    // 计算提醒时间
    calculateReminderTimes(frequency, primaryTime) {
        const [hours, minutes] = primaryTime.split(':').map(Number);
        const times = [];

        switch (frequency) {
            case 'once':
                times.push({ hours, minutes });
                break;
            case 'twice':
                times.push({ hours, minutes });
                times.push({ hours: (hours + 12) % 24, minutes });
                break;
            case 'three':
                times.push({ hours, minutes });
                times.push({ hours: (hours + 8) % 24, minutes });
                times.push({ hours: (hours + 16) % 24, minutes });
                break;
            case 'four':
                times.push({ hours, minutes });
                times.push({ hours: (hours + 6) % 24, minutes });
                times.push({ hours: (hours + 12) % 24, minutes });
                times.push({ hours: (hours + 18) % 24, minutes });
                break;
        }

        return times;
    }

    // 安排提醒
    scheduleReminder(medication, time) {
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(time.hours, time.minutes, 0, 0);

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeoutId = setTimeout(() => {
            this.showMedicationReminder(medication);
            // 设置下一天的提醒
            this.scheduleReminder(medication, time);
        }, reminderTime.getTime() - now.getTime());

        this.reminders.push({
            medicationId: medication.id,
            timeoutId,
            time: reminderTime
        });
    }

    // 显示用药提醒
    showMedicationReminder(medication) {
        // 浏览器通知
        if (this.notificationPermission) {
            new Notification(`用药提醒：${medication.name}`, {
                body: `该服用 ${medication.dosage} 了`,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }

        // 页面内通知
        this.showNotification(
            `🔔 用药提醒：该服用 ${medication.name} (${medication.dosage}) 了`,
            'warning',
            10000
        );

        this.logActivity('medication', `提醒服药: ${medication.name}`);
    }

    // 清除提醒
    clearReminders(medicationId) {
        this.reminders = this.reminders.filter(reminder => {
            if (reminder.medicationId === medicationId) {
                clearTimeout(reminder.timeoutId);
                return false;
            }
            return true;
        });
    }

    // 开始提醒系统
    startReminderSystem() {
        // 为所有活跃的用药设置提醒
        this.medications
            .filter(med => med.status === 'active')
            .forEach(med => this.setupReminders(med));

        // 每分钟检查一次是否有遗漏的提醒
        setInterval(() => {
            this.checkMissedReminders();
        }, 60000);
    }

    // 检查遗漏的提醒
    checkMissedReminders() {
        const now = new Date();
        
        this.medications
            .filter(med => med.status === 'active')
            .forEach(med => {
                const times = this.calculateReminderTimes(med.frequency, med.time);
                
                times.forEach(time => {
                    const reminderTime = new Date();
                    reminderTime.setHours(time.hours, time.minutes, 0, 0);
                    
                    // 如果提醒时间已过但在5分钟内
                    if (now > reminderTime && now - reminderTime < 5 * 60 * 1000) {
                        const lastHistory = med.history[med.history.length - 1];
                        
                        // 检查是否已经记录了今天这个时间的服药
                        if (!lastHistory || 
                            !this.isSameDay(new Date(lastHistory.date), now) ||
                            new Date(lastHistory.date).getHours() !== time.hours) {
                            
                            this.showMedicationReminder(med);
                        }
                    }
                });
            });
    }

    // 检查是否是同一天
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    // 保存用药数据
    saveMedications() {
        try {
            const encryptedData = this.encryptData(this.medications);
            localStorage.setItem('medicalApp_medications', encryptedData);
        } catch (error) {
            console.error('保存用药数据失败:', error);
        }
    }

    // 加载用药数据
    loadMedications() {
        try {
            const encryptedData = localStorage.getItem('medicalApp_medications');
            if (encryptedData) {
                this.medications = this.decryptData(encryptedData) || [];
                this.displayMedications();
            }
        } catch (error) {
            console.error('加载用药数据失败:', error);
            this.medications = [];
        }
    }

    // 简单的数据加密（实际应用中应使用更强的加密）
    encryptData(data) {
        return btoa(JSON.stringify(data));
    }

    // 简单的数据解密
    decryptData(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (error) {
            return null;
        }
    }

    // 工具方法
    showNotification(message, type = 'info', duration = 5000) {
        if (window.medicalApp) {
            window.medicalApp.showNotification(message, type, duration);
        }
    }

    logActivity(action, details, level = 'info') {
        if (window.medicalApp) {
            window.medicalApp.logActivity(action, details, level);
        }
    }

    showFieldError(field, message) {
        if (window.medicalApp) {
            window.medicalApp.showFieldError(field, message);
        }
    }

    clearFieldError(field) {
        if (window.medicalApp) {
            window.medicalApp.clearFieldError(field);
        }
    }
}

// 全局函数供HTML调用
window.addMedication = function() {
    if (window.medicationModule) {
        window.medicationModule.addMedication();
    }
};

// 为了兼容HTML中的点击事件
window.medicationModule = null;

// 初始化用药提醒模块
document.addEventListener('DOMContentLoaded', () => {
    window.medicationModule = new MedicationModule();
});