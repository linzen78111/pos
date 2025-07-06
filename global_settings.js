// 全局設定管理模組
class GlobalSettings {
  constructor() {
    this.settings = {
      store_info: {},
      system_params: {
        refreshInterval: 10,
        takeoutMin: 1,
        takeoutMax: 999,
        lowStockThreshold: 20,
        enableSound: true,
        enableAutoDeduction: true,
        dataRetention: 365
      },
      print_settings: {
        printerWidth: 80,
        printFontSize: 14,
        autoPrint: false,
        printCopies: 1
      },
      notification_settings: {
        enableOrderNotify: true,
        enableStockNotify: true,
        enableDailyReport: true,
        notifyEmail: '',
        notifyTime: '22:00'
      },
      business_hours: {}
    };
    this.initialized = false;
  }

  // 初始化設定
  async initialize(db) {
    if (this.initialized) return;
    
    try {
      console.log('正在載入全局設定...');
      
      // 載入所有設定
      await Promise.all([
        this.loadStoreInfo(db),
        this.loadSystemParams(db),
        this.loadPrintSettings(db),
        this.loadNotificationSettings(db),
        this.loadBusinessHours(db)
      ]);
      
      this.initialized = true;
      console.log('全局設定載入完成:', this.settings);
      
      // 觸發設定載入完成事件
      this.dispatchSettingsLoaded();
      
    } catch (error) {
      console.error('載入全局設定失敗:', error);
    }
  }

  // 載入店家資訊
  async loadStoreInfo(db) {
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js");
      const docRef = doc(db, "settings", "store_info");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.settings.store_info = docSnap.data();
      }
    } catch (error) {
      console.error('載入店家資訊失敗:', error);
    }
  }

  // 載入系統參數
  async loadSystemParams(db) {
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js");
      const docRef = doc(db, "settings", "system_params");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.settings.system_params = { ...this.settings.system_params, ...docSnap.data() };
      }
    } catch (error) {
      console.error('載入系統參數失敗:', error);
    }
  }

  // 載入列印設定
  async loadPrintSettings(db) {
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js");
      const docRef = doc(db, "settings", "print_settings");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.settings.print_settings = { ...this.settings.print_settings, ...docSnap.data() };
      }
    } catch (error) {
      console.error('載入列印設定失敗:', error);
    }
  }

  // 載入通知設定
  async loadNotificationSettings(db) {
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js");
      const docRef = doc(db, "settings", "notification_settings");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.settings.notification_settings = { ...this.settings.notification_settings, ...docSnap.data() };
      }
    } catch (error) {
      console.error('載入通知設定失敗:', error);
    }
  }

  // 載入營業時間
  async loadBusinessHours(db) {
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js");
      const docRef = doc(db, "settings", "business_hours");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.settings.business_hours = docSnap.data().hours || {};
      }
    } catch (error) {
      console.error('載入營業時間失敗:', error);
    }
  }

  // 觸發設定載入完成事件
  dispatchSettingsLoaded() {
    const event = new CustomEvent('globalSettingsLoaded', {
      detail: this.settings
    });
    window.dispatchEvent(event);
  }

  // 獲取設定值
  get(category, key = null) {
    if (!this.initialized) {
      console.warn('全局設定尚未初始化');
      return null;
    }
    
    if (key) {
      return this.settings[category]?.[key];
    }
    return this.settings[category];
  }

  // 獲取店家名稱
  getStoreName() {
    return this.get('store_info', 'name') || 'G茶餐酒館';
  }

  // 獲取刷新間隔
  getRefreshInterval() {
    return this.get('system_params', 'refreshInterval') || 10;
  }

  // 獲取取餐號碼範圍
  getTakeoutNumberRange() {
    return {
      min: this.get('system_params', 'takeoutMin') || 1,
      max: this.get('system_params', 'takeoutMax') || 999
    };
  }

  // 檢查是否啟用音效
  isSoundEnabled() {
    return this.get('system_params', 'enableSound') !== false;
  }

  // 檢查是否啟用自動庫存扣減
  isAutoDeductionEnabled() {
    return this.get('system_params', 'enableAutoDeduction') !== false;
  }

  // 獲取低庫存閾值
  getLowStockThreshold() {
    return this.get('system_params', 'lowStockThreshold') || 20;
  }

  // 獲取列印設定
  getPrintSettings() {
    return this.get('print_settings') || {
      printerWidth: 80,
      printFontSize: 14,
      autoPrint: false,
      printCopies: 1
    };
  }

  // 檢查是否啟用自動列印
  isAutoPrintEnabled() {
    return this.get('print_settings', 'autoPrint') || false;
  }

  // 獲取通知設定
  getNotificationSettings() {
    return this.get('notification_settings') || {
      enableOrderNotify: true,
      enableStockNotify: true,
      enableDailyReport: true,
      notifyEmail: '',
      notifyTime: '22:00'
    };
  }

  // 檢查今天是否營業
  isOpenToday() {
    const today = new Date().getDay(); // 0=Sunday, 1=Monday, ...
    const dayIndex = today === 0 ? 6 : today - 1; // 轉換為我們的索引 (0=Monday, 6=Sunday)
    
    const businessHours = this.get('business_hours');
    if (!businessHours || !businessHours[dayIndex]) {
      return true; // 預設營業
    }
    
    return businessHours[dayIndex].enabled;
  }

  // 獲取今天的營業時間
  getTodayBusinessHours() {
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    
    const businessHours = this.get('business_hours');
    if (!businessHours || !businessHours[dayIndex]) {
      return { open: '10:00', close: '22:00', enabled: true };
    }
    
    return businessHours[dayIndex];
  }

  // 檢查當前是否在營業時間內
  isCurrentlyOpen() {
    const todayHours = this.getTodayBusinessHours();
    if (!todayHours.enabled) {
      return false;
    }
    
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }

  // 更新設定（當設定頁面修改時調用）
  updateSettings(category, newSettings) {
    if (this.settings[category]) {
      this.settings[category] = { ...this.settings[category], ...newSettings };
      
      // 觸發設定更新事件
      const event = new CustomEvent('globalSettingsUpdated', {
        detail: { category, settings: this.settings[category] }
      });
      window.dispatchEvent(event);
    }
  }

  // 重新載入所有設定
  async reload(db) {
    this.initialized = false;
    await this.initialize(db);
  }
}

// 創建全局實例
window.globalSettings = new GlobalSettings();

// 導出供其他模組使用
export default window.globalSettings; 