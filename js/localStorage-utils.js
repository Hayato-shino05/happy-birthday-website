/**
 * Tiện ích quản lý localStorage với mã hóa đơn giản và xử lý lỗi
 */

// Khóa mã hóa đơn giản (không phải bảo mật cao)
const ENCRYPTION_KEY = 'HappyBirthdayWebsite2023';

/**
 * Mã hóa đơn giản một chuỗi
 * @param {string} text Chuỗi cần mã hóa
 * @returns {string} Chuỗi đã mã hóa
 */
function encryptData(text) {
    if (!text) return '';
    
    try {
        // Mã hóa đơn giản sử dụng XOR với khóa
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            result += String.fromCharCode(charCode);
        }
        // Chuyển sang Base64 để lưu trữ an toàn
        return btoa(result);
    } catch (error) {
        console.error('Lỗi khi mã hóa dữ liệu:', error);
        return text; // Trả về text gốc nếu có lỗi
    }
}

/**
 * Giải mã một chuỗi đã mã hóa
 * @param {string} encryptedText Chuỗi đã mã hóa
 * @returns {string} Chuỗi gốc
 */
function decryptData(encryptedText) {
    if (!encryptedText) return '';
    
    try {
        // Giải mã Base64
        const base64 = atob(encryptedText);
        // Giải mã XOR
        let result = '';
        for (let i = 0; i < base64.length; i++) {
            const charCode = base64.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    } catch (error) {
        console.error('Lỗi khi giải mã dữ liệu:', error);
        return encryptedText; // Trả về text đã mã hóa nếu có lỗi
    }
}

/**
 * Lưu dữ liệu vào localStorage với mã hóa
 * @param {string} key Khóa lưu trữ
 * @param {any} value Giá trị cần lưu
 * @param {boolean} encrypt Có mã hóa hay không
 * @returns {boolean} Kết quả lưu trữ
 */
function setLocalData(key, value, encrypt = true) {
    try {
        // Chuyển đổi giá trị thành chuỗi JSON
        const jsonValue = JSON.stringify(value);
        
        // Mã hóa nếu cần
        const dataToStore = encrypt ? encryptData(jsonValue) : jsonValue;
        
        // Thêm tiền tố để đánh dấu dữ liệu đã mã hóa
        const prefixedData = encrypt ? `encrypted:${dataToStore}` : dataToStore;
        
        // Lưu vào localStorage
        localStorage.setItem(key, prefixedData);
        
        // Đồng bộ dữ liệu giữa các tab (nếu cùng domain)
        broadcastDataChange(key, value);
        
        return true;
    } catch (error) {
        console.error(`Lỗi khi lưu dữ liệu cho khóa "${key}":`, error);
        
        // Kiểm tra lỗi QuotaExceededError
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            alert('Bộ nhớ trình duyệt đã đầy. Vui lòng xóa bớt dữ liệu hoặc sử dụng trình duyệt khác.');
        }
        
        return false;
    }
}

/**
 * Lấy dữ liệu từ localStorage với giải mã
 * @param {string} key Khóa lưu trữ
 * @param {any} defaultValue Giá trị mặc định nếu không tìm thấy
 * @returns {any} Giá trị đã lấy
 */
function getLocalData(key, defaultValue = null) {
    try {
        // Lấy dữ liệu từ localStorage
        const storedData = localStorage.getItem(key);
        
        // Nếu không có dữ liệu, trả về giá trị mặc định
        if (!storedData) return defaultValue;
        
        // Kiểm tra xem dữ liệu có được mã hóa không
        if (storedData.startsWith('encrypted:')) {
            // Cắt bỏ tiền tố và giải mã
            const encryptedData = storedData.substring(10); // 'encrypted:'.length = 10
            const decryptedData = decryptData(encryptedData);
            
            // Parse JSON
            return JSON.parse(decryptedData);
        } else {
            // Dữ liệu không được mã hóa, parse trực tiếp
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error(`Lỗi khi đọc dữ liệu cho khóa "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Xóa dữ liệu từ localStorage
 * @param {string} key Khóa cần xóa
 * @returns {boolean} Kết quả xóa
 */
function removeLocalData(key) {
    try {
        localStorage.removeItem(key);
        
        // Thông báo cho các tab khác
        broadcastDataChange(key, null, true);
        
        return true;
    } catch (error) {
        console.error(`Lỗi khi xóa dữ liệu cho khóa "${key}":`, error);
        return false;
    }
}

/**
 * Xóa tất cả dữ liệu trong localStorage
 * @returns {boolean} Kết quả xóa
 */
function clearAllLocalData() {
    try {
        localStorage.clear();
        
        // Thông báo cho các tab khác
        broadcastDataChange('ALL_DATA', null, true);
        
        return true;
    } catch (error) {
        console.error('Lỗi khi xóa tất cả dữ liệu:', error);
        return false;
    }
}

/**
 * Kiểm tra xem localStorage có khả dụng không
 * @returns {boolean} Kết quả kiểm tra
 */
function isLocalStorageAvailable() {
    try {
        const testKey = '__test_storage__';
        localStorage.setItem(testKey, testKey);
        const result = localStorage.getItem(testKey) === testKey;
        localStorage.removeItem(testKey);
        return result;
    } catch (e) {
        return false;
    }
}

/**
 * Phát sóng thay đổi dữ liệu giữa các tab
 * @param {string} key Khóa dữ liệu
 * @param {any} value Giá trị mới
 * @param {boolean} isRemoved Dữ liệu đã bị xóa
 */
function broadcastDataChange(key, value, isRemoved = false) {
    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('happy_birthday_storage_sync');
        bc.postMessage({
            key,
            value,
            isRemoved,
            timestamp: Date.now()
        });
        bc.close();
    }
}

/**
 * Lắng nghe thay đổi dữ liệu từ các tab khác
 */
function listenForStorageChanges() {
    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('happy_birthday_storage_sync');
        bc.onmessage = (event) => {
            const { key, value, isRemoved, timestamp } = event.data;
            
            // Kiểm tra nếu là xóa tất cả
            if (key === 'ALL_DATA' && isRemoved) {
                // Xóa tất cả dữ liệu cục bộ (không phát sóng lại)
                try {
                    localStorage.clear();
                } catch (e) {
                    console.error('Lỗi khi đồng bộ xóa tất cả dữ liệu:', e);
                }
                return;
            }
            
            // Cập nhật dữ liệu cục bộ
            try {
                if (isRemoved) {
                    localStorage.removeItem(key);
                } else {
                    // Chuyển đổi giá trị thành chuỗi JSON
                    const jsonValue = JSON.stringify(value);
                    localStorage.setItem(key, jsonValue);
                }
                
                // Kích hoạt sự kiện storage để các listener khác có thể phản ứng
                window.dispatchEvent(new StorageEvent('storage', {
                    key,
                    newValue: isRemoved ? null : JSON.stringify(value),
                    oldValue: localStorage.getItem(key),
                    storageArea: localStorage
                }));
            } catch (e) {
                console.error('Lỗi khi đồng bộ dữ liệu:', e);
            }
        };
    }
}

// Khởi tạo lắng nghe thay đổi khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    listenForStorageChanges();
});

// Xuất các hàm tiện ích
window.setLocalData = setLocalData;
window.getLocalData = getLocalData;
window.removeLocalData = removeLocalData;
window.clearAllLocalData = clearAllLocalData;
window.isLocalStorageAvailable = isLocalStorageAvailable;

// Tương thích với code cũ
window.saveUsername = function(name) {
    return setLocalData('birthdayChatUserName', name);
};

window.getSavedUsername = function() {
    return getLocalData('birthdayChatUserName', '');
}; 