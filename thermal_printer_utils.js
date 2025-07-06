// 熱感應出單機工具類
class ThermalPrinterUtils {
  
  // 字符編碼對照表
  static charMappings = {
    // 中文字符對照 (Big5 安全字符)
    'G茶餐酒館': 'G Tea Restaurant',
    '訂單確認': 'Order Confirm',
    '用餐方式': 'Dine Type',
    '桌號': 'Table',
    '取餐號碼': 'Pickup No',
    '訂單編號': 'Order ID',
    '品項': 'Item',
    '數量': 'Qty',
    '小計': 'Subtotal',
    '總計': 'Total',
    '內用': 'Dine In',
    '外帶': 'Takeout',
    '下單時間': 'Order Time',
    '列印時間': 'Print Time',
    '日結帳報表': 'Daily Report',
    '總營業額': 'Total Revenue',
    '訂單數量': 'Orders Count',
    '熱銷商品': 'Hot Items',
    '營收金額': 'Revenue'
  };

  // 支援的編碼類型
  static encodingTypes = {
    ASCII: 'ascii',
    BIG5: 'big5',
    GB2312: 'gb2312',
    UTF8: 'utf8'
  };

  // 轉換中文為安全字符
  static convertToSafeChars(text, encoding = 'ascii') {
    if (encoding === 'utf8') {
      return text; // UTF-8 直接返回
    }

    let result = text;
    
    // 替換已知的中文字符
    for (const [chinese, english] of Object.entries(this.charMappings)) {
      result = result.replace(new RegExp(chinese, 'g'), english);
    }

    if (encoding === 'ascii') {
      // ASCII 模式：移除所有非 ASCII 字符
      result = result.replace(/[^\x20-\x7E]/g, '?');
    }

    return result;
  }

  // 格式化熱感應出單機內容
  static formatThermalContent(order, settings = {}) {
    const {
      encoding = 'ascii',
      printerWidth = 80,
      fontSize = 14,
      storeName = 'G茶餐酒館'
    } = settings;

    // 轉換文字
    const safeStoreName = this.convertToSafeChars(storeName, encoding);
    const safeOrderConfirm = this.convertToSafeChars('訂單確認', encoding);
    const safeDineType = this.convertToSafeChars('用餐方式', encoding);
    const safeTableLabel = order.dineType === '外帶' ? 
      this.convertToSafeChars('取餐號碼', encoding) : 
      this.convertToSafeChars('桌號', encoding);
    const safeOrderId = this.convertToSafeChars('訂單編號', encoding);
    const safeTotal = this.convertToSafeChars('總計', encoding);

    // 計算總金額
    let total = 0;
    order.items?.forEach(item => {
      const price = item.price || 0;
      const subtotal = price * item.quantity;
      total += subtotal;
    });

    // 生成內容
    let content = '';
    content += this.centerText(safeStoreName, printerWidth) + '\n';
    content += this.centerText(safeOrderConfirm, printerWidth) + '\n';
    content += this.generateSeparator(printerWidth) + '\n';
    
    // 基本資訊
    content += `${safeDineType}: ${this.convertToSafeChars(order.dineType || '', encoding)}\n`;
    
    const tableInfo = order.dineType === '外帶' ? 
      (order.takeoutNumber || '001') : 
      (order.tableNumber || '');
    content += `${safeTableLabel}: ${tableInfo}\n`;
    content += `${safeOrderId}: ${order.orderId || order.id}\n`;
    content += this.generateSeparator(printerWidth) + '\n';

    // 商品明細
    if (order.items) {
      order.items.forEach(item => {
        const safeName = this.convertToSafeChars(item.name, encoding);
        const price = item.price || 0;
        const subtotal = price * item.quantity;
        
        content += `${safeName}\n`;
        content += `  ${item.quantity} x $${price} = $${subtotal}\n`;
      });
    }
    
    content += this.generateSeparator(printerWidth) + '\n';
    content += this.centerText(`${safeTotal}: $${total}`, printerWidth) + '\n';
    content += this.generateSeparator(printerWidth) + '\n';

    // 時間資訊（使用數字格式，黑色字體）
    const orderTime = order.timestamp ? order.timestamp.toDate() : new Date();
    content += `Order: ${orderTime.toLocaleString('en-US')}\n`;
    content += `Print: ${new Date().toLocaleString('en-US')}\n`;

    return content;
  }

  // 居中對齊文字
  static centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  // 生成分隔線
  static generateSeparator(width, char = '=') {
    return char.repeat(Math.min(width, 48));
  }

  // 檢測出單機編碼支援
  static detectPrinterEncoding() {
    // 這裡可以加入實際的出單機編碼檢測邏輯
    // 目前返回預設的安全編碼
    return 'ascii';
  }

  // 生成 HTML 預覽（保持原有中文顯示）
  static generateHTMLPreview(order, settings = {}) {
    const {
      printerWidth = 80,
      fontSize = 14,
      storeName = 'G茶餐酒館'
    } = settings;

    const actualWidth = printerWidth === 58 ? '218px' : '302px';

    let total = 0;
    order.items?.forEach(item => {
      const price = item.price || 0;
      const subtotal = price * item.quantity;
      total += subtotal;
    });

    let content = `<div style="width:${actualWidth};margin:0 auto;padding:8px;font-family:monospace;font-size:${fontSize}px;line-height:1.2;background:#fff;">`;
    content += `<div style="text-align:center;font-size:${fontSize + 5}px;font-weight:bold;margin-bottom:12px;">${storeName}</div>`;
    content += '<div style="text-align:center;font-size:13px;margin-bottom:12px;">訂單確認</div>';
    content += '<div style="border-bottom:1px solid #000;margin-bottom:8px;"></div>';
    
    // 訂單基本資訊
    content += '<div style="margin-bottom:8px;">';
    content += `<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>用餐方式:</span><span>${order.dineType || ''}</span></div>`;
    
    if (order.dineType === '外帶') {
      content += `<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>取餐號碼:</span><span style="font-weight:bold;font-size:16px;">${order.takeoutNumber || '001'}</span></div>`;
    } else {
      content += `<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>桌號:</span><span style="font-weight:bold;font-size:16px;">${order.tableNumber || ''}</span></div>`;
    }
    
    content += `<div style="font-size:11px;color:#000;font-weight:bold;margin-top:4px;">訂單編號: ${order.orderId || order.id}</div>`;
    content += '</div>';
    content += '<div style="border-bottom:1px solid #000;margin-bottom:8px;"></div>';

    // 商品明細
    content += '<div style="margin-bottom:8px;">';
    if (order.items) {
      order.items.forEach(item => {
        const price = item.price || 0;
        const subtotal = price * item.quantity;
        content += '<div style="margin-bottom:8px;">';
        content += `<div style="font-weight:bold;margin-bottom:4px;">${item.name}</div>`;
        content += `<div style="display:flex;justify-content:space-between;font-size:11px;color:#000;"><span>${item.quantity} × $${price}</span><span>$${subtotal}</span></div>`;
        content += '</div>';
      });
    }
    content += '</div>';
    
    content += '<div style="border-bottom:2px solid #000;margin-bottom:8px;"></div>';
    content += '<div style="text-align:center;margin-bottom:12px;">';
    content += `<div style="font-size:18px;font-weight:bold;">總計: $${total}</div>`;
    content += '</div>';
    
    // 時間資訊
    const orderTime = order.timestamp ? order.timestamp.toDate() : new Date();
    content += '<div style="border-top:1px solid #000;padding-top:8px;font-size:11px;text-align:center;color:#000;font-weight:bold;">';
    content += `<div>下單時間: ${orderTime.toLocaleString('zh-TW')}</div>`;
    content += `<div>列印時間: ${new Date().toLocaleString('zh-TW')}</div>`;
    content += '</div>';
    
    content += '</div>';

    return content;
  }
}

// 全域導出
window.ThermalPrinterUtils = ThermalPrinterUtils; 