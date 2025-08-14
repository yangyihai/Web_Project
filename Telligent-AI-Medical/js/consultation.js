// 咨询诊断模块
class ConsultationModule {
    constructor() {
        this.symptoms = [];
        this.analysisResults = [];
        this.isAnalyzing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAI();
    }

    setupEventListeners() {
        // 监听分析按钮点击
        const analyzeBtn = document.querySelector('.analyze-button');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeSymptoms());
        }

        // 监听输入变化
        const symptomsInput = document.getElementById('symptoms');
        if (symptomsInput) {
            symptomsInput.addEventListener('input', this.debounce((e) => {
                this.validateSymptoms(e.target.value);
            }, 500));
        }
    }

    // 症状分析主函数
    async analyzeSymptoms() {
        if (this.isAnalyzing) return;

        const symptoms = document.getElementById('symptoms').value.trim();
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const uploadedFiles = document.querySelectorAll('.file-item');

        // 验证输入
        if (!this.validateInputs(symptoms, age, gender)) {
            return;
        }

        this.isAnalyzing = true;
        this.showLoadingState();

        try {
            // 记录分析活动
            this.logActivity('consultation', '开始症状分析');

            // 模拟AI分析过程
            const analysisResult = await this.performAIAnalysis({
                symptoms,
                age,
                gender,
                files: Array.from(uploadedFiles).map(item => ({
                    name: item.querySelector('.file-name').textContent,
                    type: item.querySelector('i').className.includes('image') ? 'image' : 'pdf'
                }))
            });

            this.displayAnalysisResults(analysisResult);
            this.logActivity('consultation', '症状分析完成');

        } catch (error) {
            console.error('分析错误:', error);
            this.showError('分析过程中发生错误，请稍后重试');
            this.logActivity('consultation', '分析失败: ' + error.message, 'error');
        } finally {
            this.isAnalyzing = false;
            this.hideLoadingState();
        }
    }

    // 输入验证
    validateInputs(symptoms, age, gender) {
        const errors = [];

        if (!symptoms || symptoms.length < 10) {
            errors.push('请详细描述您的症状（至少10个字符）');
        }

        if (!age) {
            errors.push('请选择年龄段');
        }

        if (!gender) {
            errors.push('请选择性别');
        }

        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }

        return true;
    }

    validateSymptoms(symptoms) {
        const symptomsField = document.getElementById('symptoms');
        
        if (symptoms.length < 10) {
            this.showFieldError(symptomsField, '请详细描述您的症状（至少10个字符）');
        } else {
            this.clearFieldError(symptomsField);
        }
    }

    showValidationErrors(errors) {
        const errorHtml = errors.map(error => `<p>• ${error}</p>`).join('');
        this.showNotification(errorHtml, 'error');
    }

    // AI分析模拟
    async performAIAnalysis(data) {
        // 模拟分析延迟
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 基于症状关键词的简单分析逻辑
        const analysis = this.generateAnalysis(data);
        
        return analysis;
    }

    generateAnalysis(data) {
        const { symptoms, age, gender, files } = data;
        
        // 症状关键词匹配
        const keywordAnalysis = this.analyzeKeywords(symptoms.toLowerCase());
        
        // 基于年龄和性别的风险评估
        const riskFactors = this.assessRiskFactors(age, gender);
        
        // 生成诊断建议
        const diagnoses = this.generateDiagnoses(keywordAnalysis, riskFactors);
        
        return {
            diagnoses,
            riskLevel: this.calculateRiskLevel(keywordAnalysis),
            recommendations: this.generateRecommendations(diagnoses, riskFactors),
            urgency: this.assessUrgency(keywordAnalysis),
            followUp: this.generateFollowUp(diagnoses)
        };
    }

    analyzeKeywords(symptoms) {
        const keywordMap = {
            fever: ['发烧', '发热', '高烧', '低烧', '体温', '烧'],
            headache: ['头痛', '头疼', '偏头痛', '头晕', '头昏'],
            cough: ['咳嗽', '咳痰', '干咳', '咳血'],
            pain: ['疼痛', '疼', '痛', '酸痛', '刺痛'],
            fatigue: ['疲劳', '乏力', '困倦', '虚弱', '无力'],
            nausea: ['恶心', '呕吐', '想吐', '胃部不适'],
            respiratory: ['呼吸困难', '气短', '喘息', '胸闷'],
            digestive: ['腹痛', '腹泻', '便秘', '胃痛', '消化不良'],
            skin: ['皮疹', '红疹', '瘙痒', '皮肤', '过敏'],
            mental: ['焦虑', '抑郁', '失眠', '情绪', '精神']
        };

        const foundKeywords = {};
        let totalScore = 0;

        Object.keys(keywordMap).forEach(category => {
            const keywords = keywordMap[category];
            let categoryScore = 0;

            keywords.forEach(keyword => {
                const regex = new RegExp(keyword, 'g');
                const matches = symptoms.match(regex);
                if (matches) {
                    categoryScore += matches.length;
                }
            });

            if (categoryScore > 0) {
                foundKeywords[category] = categoryScore;
                totalScore += categoryScore;
            }
        });

        return { keywords: foundKeywords, totalScore };
    }

    assessRiskFactors(age, gender) {
        const factors = [];

        // 年龄相关风险
        if (age === '0-10') {
            factors.push({ type: 'age', risk: 'medium', description: '儿童免疫系统发育中' });
        } else if (age === '60+') {
            factors.push({ type: 'age', risk: 'high', description: '老年人群，需要特别关注' });
        }

        // 性别相关风险（示例）
        if (gender === 'female') {
            factors.push({ type: 'gender', risk: 'low', description: '女性特有健康关注点' });
        }

        return factors;
    }

    generateDiagnoses(keywordAnalysis, riskFactors) {
        const diagnoses = [];
        const { keywords } = keywordAnalysis;

        // 基于关键词生成可能的诊断
        if (keywords.fever && keywords.headache) {
            diagnoses.push({
                condition: '上呼吸道感染',
                confidence: 0.75,
                severity: 'medium',
                description: '基于发热和头痛症状，可能为病毒性上呼吸道感染'
            });
        }

        if (keywords.cough && keywords.respiratory) {
            diagnoses.push({
                condition: '呼吸系统感染',
                confidence: 0.68,
                severity: 'medium',
                description: '咳嗽和呼吸困难提示可能的呼吸系统问题'
            });
        }

        if (keywords.pain && keywords.fatigue) {
            diagnoses.push({
                condition: '一般性疲劳综合征',
                confidence: 0.55,
                severity: 'low',
                description: '疼痛和疲劳可能与压力或生活方式相关'
            });
        }

        if (keywords.digestive) {
            diagnoses.push({
                condition: '消化系统不适',
                confidence: 0.62,
                severity: 'low',
                description: '消化相关症状，可能与饮食或压力有关'
            });
        }

        // 如果没有匹配到特定模式，提供一般性建议
        if (diagnoses.length === 0) {
            diagnoses.push({
                condition: '症状需要进一步评估',
                confidence: 0.40,
                severity: 'unknown',
                description: '症状描述需要专业医生进行详细评估'
            });
        }

        return diagnoses;
    }

    calculateRiskLevel(keywordAnalysis) {
        const { totalScore, keywords } = keywordAnalysis;
        
        // 高风险症状
        const highRiskSymptoms = ['respiratory', 'chest_pain', 'severe_pain'];
        const hasHighRisk = highRiskSymptoms.some(symptom => keywords[symptom]);
        
        if (hasHighRisk || totalScore > 10) {
            return 'high';
        } else if (totalScore > 5) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    generateRecommendations(diagnoses, riskFactors) {
        const recommendations = [];

        // 基于诊断生成建议
        diagnoses.forEach(diagnosis => {
            if (diagnosis.condition.includes('感染')) {
                recommendations.push('充分休息，多喝水');
                recommendations.push('避免过度劳累');
                recommendations.push('必要时就医检查');
            }
            
            if (diagnosis.condition.includes('呼吸')) {
                recommendations.push('保持室内空气流通');
                recommendations.push('避免吸烟和二手烟');
                recommendations.push('如症状加重请及时就医');
            }
            
            if (diagnosis.condition.includes('消化')) {
                recommendations.push('注意饮食清淡');
                recommendations.push('避免刺激性食物');
                recommendations.push('规律饮食');
            }
        });

        // 通用建议
        recommendations.push('保持良好的生活习惯');
        recommendations.push('如症状持续或加重，请及时就医');

        return [...new Set(recommendations)]; // 去重
    }

    assessUrgency(keywordAnalysis) {
        const { keywords } = keywordAnalysis;
        
        // 紧急症状
        const urgentSymptoms = ['chest_pain', 'severe_pain', 'breathing_difficulty'];
        const hasUrgentSymptom = urgentSymptoms.some(symptom => keywords[symptom]);
        
        if (hasUrgentSymptom) {
            return 'urgent';
        } else if (keywords.fever && keywords.headache) {
            return 'moderate';
        } else {
            return 'routine';
        }
    }

    generateFollowUp(diagnoses) {
        const followUp = [];

        diagnoses.forEach(diagnosis => {
            if (diagnosis.severity === 'high') {
                followUp.push('建议24小时内就医');
            } else if (diagnosis.severity === 'medium') {
                followUp.push('建议1-2天内观察症状变化');
            } else {
                followUp.push('注意观察症状，如有变化及时就医');
            }
        });

        return [...new Set(followUp)];
    }

    // 显示分析结果
    displayAnalysisResults(results) {
        const resultContainer = document.getElementById('analysisResult');
        if (!resultContainer) return;

        let html = '';

        // 显示诊断结果
        results.diagnoses.forEach(diagnosis => {
            const severityClass = `severity-${diagnosis.severity}`;
            html += `
                <div class="diagnosis-card">
                    <div class="diagnosis-header">
                        <div class="severity-indicator ${severityClass}"></div>
                        <h3 class="diagnosis-title">${diagnosis.condition}</h3>
                    </div>
                    <div class="diagnosis-content">
                        <p>${diagnosis.description}</p>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${diagnosis.confidence * 100}%"></div>
                        </div>
                        <div class="confidence-text">置信度: ${Math.round(diagnosis.confidence * 100)}%</div>
                    </div>
                </div>
            `;
        });

        // 显示建议
        if (results.recommendations.length > 0) {
            html += `
                <div class="recommendations">
                    <h4><i class="fas fa-lightbulb"></i> 建议</h4>
                    <ul class="recommendation-list">
                        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // 显示紧急程度
        const urgencyColors = {
            urgent: '#dc3545',
            moderate: '#ffc107',
            routine: '#28a745'
        };

        const urgencyTexts = {
            urgent: '紧急',
            moderate: '中等',
            routine: '常规'
        };

        html += `
            <div class="urgency-indicator" style="color: ${urgencyColors[results.urgency]}">
                <i class="fas fa-exclamation-triangle"></i>
                紧急程度: ${urgencyTexts[results.urgency]}
            </div>
        `;

        resultContainer.innerHTML = html;
    }

    // 显示加载状态
    showLoadingState() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }

        const analyzeBtn = document.querySelector('.analyze-button');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
        }
    }

    hideLoadingState() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        const analyzeBtn = document.querySelector('.analyze-button');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-stethoscope"></i> 开始AI分析';
        }
    }

    showError(message) {
        const resultContainer = document.getElementById('analysisResult');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    initializeAI() {
        console.log('✓ AI诊断模块已初始化');
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

    showNotification(message, type = 'info') {
        if (window.medicalApp) {
            window.medicalApp.showNotification(message, type);
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
window.analyzeSymptoms = function() {
    if (window.consultationModule) {
        window.consultationModule.analyzeSymptoms();
    }
};

// 初始化咨询模块
document.addEventListener('DOMContentLoaded', () => {
    window.consultationModule = new ConsultationModule();
});