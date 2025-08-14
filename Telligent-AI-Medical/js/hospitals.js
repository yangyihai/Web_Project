// 医院查找功能 - 百度地图集成
class HospitalFinder {
    constructor() {
        this.map = null;
        this.geolocation = null;
        this.geocoder = null;
        this.userLocation = null;
        this.markers = [];
        this.currentMapType = BMAP_NORMAL_MAP;
        this.searchRadius = 5000; // 默认5公里
        this.currentPlaces = [];
        
        // 默认中心点坐标（杭州）
        this.defaultCenter = new BMapGL.Point(120.197925, 30.191001);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // 等待百度地图GL API加载完成后初始化
        if (typeof BMapGL !== 'undefined') {
            this.initializeMap();
        } else {
            // 如果百度地图GL API还未加载完成，等待加载
            const checkBMapGL = setInterval(() => {
                if (typeof BMapGL !== 'undefined') {
                    clearInterval(checkBMapGL);
                    this.initializeMap();
                }
            }, 100);
        }
    }

    setupEventListeners() {
        // 搜索按钮事件
        const hospitalSearch = document.getElementById('hospitalSearch');
        if (hospitalSearch) {
            hospitalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchHospitals();
                }
            });
        }

        // 筛选条件变化事件
        const hospitalType = document.getElementById('hospitalType');
        if (hospitalType) {
            hospitalType.addEventListener('change', () => {
                this.searchNearbyPlaces();
            });
        }

        const distanceFilter = document.getElementById('distanceFilter');
        if (distanceFilter) {
            distanceFilter.addEventListener('change', (e) => {
                this.searchRadius = parseInt(e.target.value);
                this.searchNearbyPlaces();
            });
        }
    }

    // 初始化百度地图 - 使用新的BMapGL
    initializeMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('找不到地图容器元素');
            return;
        }

        // 设置地图容器样式
        mapElement.style.height = '100%';
        mapElement.style.margin = '0px';
        mapElement.style.padding = '0px';

        try {
            // 创建地图实例 - 使用BMapGL
            this.map = new BMapGL.Map(mapElement);
            
            // 创建点坐标 - 使用您提供的杭州坐标
            const point = new BMapGL.Point(120.197925, 30.191001);
            this.defaultCenter = point;
            
            // 设置中心点和缩放级别
            this.map.centerAndZoom(point, 15);
            
            // 启用滚轮缩放
            this.map.enableScrollWheelZoom(true);
            
            // 添加地图控件 - 使用BMapGL控件
            this.map.addControl(new BMapGL.NavigationControl());
            this.map.addControl(new BMapGL.ScaleControl());
            this.map.addControl(new BMapGL.OverviewMapControl());
            this.map.addControl(new BMapGL.MapTypeControl());

            // 设置地图样式
            this.map.setMapStyleV2({
                styleId: 'c8b36ab77e603ec3b3b00b1f14c1c636'
            });

            // 初始化定位和搜索服务 - 使用BMapGL
            this.geolocation = new BMapGL.Geolocation();
            this.geocoder = new BMapGL.Geocoder();

            // 请求用户位置
            this.requestLocation();

            console.log('百度地图GL版本初始化成功');
        } catch (error) {
            console.error('地图初始化失败:', error);
            this.updateLocationStatus('地图加载失败，请检查网络连接');
        }
    }

    // 请求用户位置
    requestLocation() {
        this.updateLocationStatus('正在获取您的位置...');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const point = new BMapGL.Point(position.coords.longitude, position.coords.latitude);
                    this.userLocation = point;
                    this.map.centerAndZoom(point, 15);
                    
                    this.updateLocationStatus(`位置获取成功 (精度: ${position.coords.accuracy.toFixed(0)}米)`);
                    
                    // 添加用户位置标记
                    this.addUserLocationMarker(point);
                    
                    // 搜索附近医院
                    this.searchNearbyPlaces();
                },
                (error) => {
                    console.error('位置获取失败:', error);
                    this.handleLocationError(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        } else {
            // 浏览器不支持定位，使用百度定位
            this.useBaiduLocation();
        }
    }

    // 使用百度定位
    useBaiduLocation() {
        this.geolocation.getCurrentPosition((result) => {
            if (this.geolocation.getStatus() == BMAP_STATUS_SUCCESS) {
                this.userLocation = result.point;
                this.map.centerAndZoom(result.point, 15);
                
                this.updateLocationStatus('位置获取成功');
                this.addUserLocationMarker(result.point);
                this.searchNearbyPlaces();
            } else {
                this.handleLocationError(null);
            }
        });
    }

    // 处理定位错误
    handleLocationError(error) {
        let errorMsg = '位置获取失败，使用默认位置';
        
        if (error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = '用户拒绝了位置请求，使用默认位置';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '位置信息不可用，使用默认位置';
                    break;
                case error.TIMEOUT:
                    errorMsg = '位置请求超时，使用默认位置';
                    break;
            }
        }
        
        this.updateLocationStatus(errorMsg);
        this.userLocation = this.defaultCenter;
        this.map.centerAndZoom(this.defaultCenter, 14);
        this.addUserLocationMarker(this.defaultCenter);
        this.searchNearbyPlaces();
    }

    // 更新位置状态显示
    updateLocationStatus(message) {
        const locationText = document.getElementById('locationText');
        if (locationText) {
            locationText.textContent = message;
        }
    }

    // 添加用户位置标记
    addUserLocationMarker(point) {
        // 创建自定义图标
        const userIcon = new BMapGL.Icon(
            'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#667eea" stroke="white" stroke-width="3"/>
                    <circle cx="16" cy="16" r="6" fill="white"/>
                </svg>
            `),
            new BMapGL.Size(32, 32),
            { anchor: new BMapGL.Size(16, 16) }
        );

        const userMarker = new BMapGL.Marker(point, { icon: userIcon });
        this.map.addOverlay(userMarker);

        // 添加信息窗口
        const infoWindow = new BMapGL.InfoWindow(`
            <div style="padding: 10px;">
                <h4 style="margin: 0 0 8px 0; color: #1d1d1f;">您的当前位置</h4>
                <p style="margin: 0; color: #86868b; font-size: 14px;">
                    经度: ${point.lng.toFixed(6)}<br>
                    纬度: ${point.lat.toFixed(6)}
                </p>
            </div>
        `, {
            width: 250,
            height: 80
        });

        userMarker.addEventListener('click', () => {
            this.map.openInfoWindow(infoWindow, point);
        });
    }

    // 搜索附近的医疗机构
    searchNearbyPlaces() {
        if (!this.userLocation) return;

        this.clearMarkers();
        this.showLoading();

        const hospitalType = document.getElementById('hospitalType')?.value || 'hospital';
        let keyword = '';
        
        switch (hospitalType) {
            case 'hospital':
                keyword = '医院';
                break;
            case 'clinic':
                keyword = '诊所';
                break;
            case 'pharmacy':
                keyword = '药房';
                break;
            default:
                keyword = '医院';
        }

        // 使用百度地图本地搜索
        const local = new BMapGL.LocalSearch(this.map, {
            renderOptions: { map: this.map, autoViewport: false },
            onSearchComplete: (results) => {
                this.handleSearchResults(results, hospitalType);
            }
        });

        // 在指定范围内搜索
        local.searchNearby(keyword, this.userLocation, this.searchRadius);
    }

    // 处理搜索结果
    handleSearchResults(results, type) {
        if (!results || results.getNumPois() === 0) {
            this.showError('附近没有找到相关医疗机构');
            return;
        }

        const places = [];
        const maxResults = Math.min(results.getNumPois(), 20); // 限制最多显示20个结果

        for (let i = 0; i < maxResults; i++) {
            const poi = results.getPoi(i);
            if (poi) {
                // 计算距离
                const distance = this.map.getDistance(this.userLocation, poi.point);
                
                places.push({
                    name: poi.title,
                    address: poi.address,
                    point: poi.point,
                    distance: distance,
                    telephone: poi.telephone || '',
                    type: type,
                    index: i
                });
            }
        }

        // 按距离排序
        places.sort((a, b) => a.distance - b.distance);

        this.currentPlaces = places;
        this.displayPlaces(places);
        this.addPlaceMarkers(places, type);
    }

    // 文本搜索医院
    searchHospitals() {
        const query = document.getElementById('hospitalSearch')?.value.trim();
        if (!query) return;

        this.clearMarkers();
        this.showLoading();

        const local = new BMapGL.LocalSearch(this.map, {
            renderOptions: { map: this.map, autoViewport: false },
            onSearchComplete: (results) => {
                this.handleSearchResults(results, 'hospital');
                
                // 调整地图视野以显示所有结果
                if (results && results.getNumPois() > 0) {
                    const points = [];
                    points.push(this.userLocation);
                    
                    for (let i = 0; i < Math.min(results.getNumPois(), 10); i++) {
                        const poi = results.getPoi(i);
                        if (poi) points.push(poi.point);
                    }
                    
                    this.map.setViewport(points);
                }
            }
        });

        // 在当前位置附近搜索
        if (this.userLocation) {
            local.searchNearby(query + ' 医院', this.userLocation, this.searchRadius * 2);
        } else {
            local.search(query + ' 医院');
        }
    }

    // 显示搜索结果列表
    displayPlaces(places) {
        const hospitalsList = document.getElementById('hospitalsList');
        if (!hospitalsList) return;
        
        if (places.length === 0) {
            hospitalsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #86868b;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>附近没有找到相关医疗机构</p>
                    <p style="font-size: 14px;">尝试扩大搜索范围或更改筛选条件</p>
                </div>
            `;
            return;
        }

        hospitalsList.innerHTML = places.map((place, index) => {
            const distance = this.formatDistance(place.distance);
            const typeText = this.getPlaceTypeText(place.type);

            return `
                <div class="hospital-item" onclick="hospitalFinder.selectPlace(${index})">
                    <div class="hospital-header">
                        <div>
                            <div class="hospital-name">${place.name}</div>
                        </div>
                        <div class="hospital-type">${typeText}</div>
                    </div>
                    
                    <div class="hospital-info">
                        <div class="hospital-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${place.address || '地址信息不完整'}</span>
                        </div>
                        <div class="hospital-info-item">
                            <i class="fas fa-route"></i>
                            <span class="hospital-distance">${distance}</span>
                        </div>
                        ${place.telephone ? `
                        <div class="hospital-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${place.telephone}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="hospital-actions">
                        <button class="hospital-btn primary" onclick="event.stopPropagation(); hospitalFinder.getDirections(${index})">
                            <i class="fas fa-directions"></i>
                            导航
                        </button>
                        <button class="hospital-btn secondary" onclick="event.stopPropagation(); hospitalFinder.callHospital('${place.telephone || ''}')">
                            <i class="fas fa-phone"></i>
                            联系
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 添加地图标记
    addPlaceMarkers(places, type) {
        const iconConfig = {
            hospital: { color: '#ff3b30', text: '医' },
            clinic: { color: '#007aff', text: '诊' },
            pharmacy: { color: '#34c759', text: '药' }
        };

        const config = iconConfig[type] || iconConfig.hospital;

        places.forEach((place, index) => {
            // 创建自定义图标
            const icon = new BMapGL.Icon(
                'data:image/svg+xml;base64,' + btoa(`
                    <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 0C8.059 0 0 8.059 0 18C0 28.294 18 48 18 48S36 28.294 36 18C36 8.059 27.941 0 18 0Z" fill="${config.color}"/>
                        <circle cx="18" cy="18" r="12" fill="white"/>
                        <text x="18" y="23" text-anchor="middle" fill="${config.color}" font-family="SimHei, Microsoft YaHei" font-size="14" font-weight="bold">${config.text}</text>
                    </svg>
                `),
                new BMapGL.Size(36, 48),
                { anchor: new BMapGL.Size(18, 48) }
            );

            const marker = new BMapGL.Marker(place.point, { icon: icon });
            this.map.addOverlay(marker);

            // 添加点击事件
            marker.addEventListener('click', () => {
                this.selectPlace(index);
                this.showPlaceInfo(place, marker);
            });

            this.markers.push(marker);
        });
    }

    // 选择医疗机构
    selectPlace(index) {
        const place = this.currentPlaces[index];
        if (!place) return;

        // 地图中心移动到选中的位置
        this.map.centerAndZoom(place.point, 16);

        // 高亮对应的列表项
        document.querySelectorAll('.hospital-item').forEach((item, i) => {
            item.style.borderColor = i === index ? '#667eea' : '#f0f0f0';
            item.style.boxShadow = i === index ? '0 8px 25px rgba(102, 126, 234, 0.2)' : '';
        });

        // 显示详细信息
        this.showPlaceInfo(place, this.markers[index]);
    }

    // 显示地点详细信息
    showPlaceInfo(place, marker) {
        const distance = this.formatDistance(place.distance);

        const infoWindow = new BMapGL.InfoWindow(`
            <div style="max-width: 280px; padding: 16px;">
                <h4 style="margin: 0 0 12px 0; color: #1d1d1f; font-size: 16px;">${place.name}</h4>
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${place.address}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #667eea; font-size: 14px; font-weight: 600;">
                        <i class="fas fa-route"></i>
                        <span>${distance}</span>
                    </div>
                    ${place.telephone ? `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #34c759; font-size: 14px;">
                        <i class="fas fa-phone"></i>
                        <span>${place.telephone}</span>
                    </div>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="hospitalFinder.getDirections(${place.index})" 
                            style="flex: 1; padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-directions"></i> 导航
                    </button>
                    ${place.telephone ? `
                    <button onclick="hospitalFinder.callHospital('${place.telephone}')" 
                            style="flex: 1; padding: 8px 12px; background: white; color: #667eea; border: 1px solid #667eea; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-phone"></i> 联系
                    </button>
                    ` : ''}
                </div>
            </div>
        `, {
            width: 320,
            height: 160
        });

        this.map.openInfoWindow(infoWindow, place.point);
    }

    // 获取导航路线
    getDirections(index) {
        const place = this.currentPlaces[index];
        if (!place) return;

        // 打开百度地图导航
        const url = `https://api.map.baidu.com/direction?origin=${this.userLocation.lat},${this.userLocation.lng}&destination=${place.point.lat},${place.point.lng}&mode=driving&region=杭州&output=html&src=webapp.baidu.openAPIdemo`;
        window.open(url, '_blank');
    }

    // 联系医院
    callHospital(phoneNumber) {
        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            if (window.medicalApp) {
                window.medicalApp.showNotification('暂无联系电话信息', 'info');
            }
        }
    }

    // 工具函数
    formatDistance(distance) {
        if (distance < 1000) {
            return Math.round(distance) + '米';
        } else {
            return (distance / 1000).toFixed(1) + '公里';
        }
    }

    getPlaceTypeText(type) {
        const typeMap = {
            hospital: '医院',
            clinic: '诊所',
            pharmacy: '药房'
        };
        return typeMap[type] || '医疗机构';
    }

    // 清除地图标记
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeOverlay(marker);
        });
        this.markers = [];
    }

    // 显示加载状态
    showLoading() {
        const hospitalsList = document.getElementById('hospitalsList');
        if (hospitalsList) {
            hospitalsList.innerHTML = `
                <div class="loading-hospitals">
                    <div class="spinner"></div>
                    <p>正在搜索附近医院...</p>
                </div>
            `;
        }
    }

    // 显示错误信息
    showError(message) {
        const hospitalsList = document.getElementById('hospitalsList');
        if (hospitalsList) {
            hospitalsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ff3b30;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>${message}</p>
                    <button onclick="hospitalFinder.searchNearbyPlaces()" 
                            style="margin-top: 16px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        重新搜索
                    </button>
                </div>
            `;
        }
    }
}

// 地图控制函数
function centerMap() {
    if (hospitalFinder && hospitalFinder.map && hospitalFinder.userLocation) {
        hospitalFinder.map.centerAndZoom(hospitalFinder.userLocation, 15);
    }
}

function toggleMapType() {
    if (!hospitalFinder || !hospitalFinder.map) return;
    
    const types = [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP];
    const currentIndex = types.indexOf(hospitalFinder.currentMapType);
    const nextIndex = (currentIndex + 1) % types.length;
    
    hospitalFinder.currentMapType = types[nextIndex];
    hospitalFinder.map.setMapType(hospitalFinder.currentMapType);
}

function requestLocation() {
    if (hospitalFinder) {
        hospitalFinder.requestLocation();
    }
}

function searchHospitals() {
    if (hospitalFinder) {
        hospitalFinder.searchHospitals();
    }
}

// 全局变量
let hospitalFinder;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待百度地图GL API加载完成
    const initBaiduMap = () => {
        if (typeof BMapGL !== 'undefined') {
            hospitalFinder = new HospitalFinder();
        } else {
            setTimeout(initBaiduMap, 100);
        }
    };
    initBaiduMap();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HospitalFinder;
}