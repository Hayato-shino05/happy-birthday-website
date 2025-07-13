// Cấu hình album
const AlbumConfig = {
    supabaseStorageUrl: 'your-supabase-link/storage/v1/object/public/media/',
    mediaBucket: 'media',
    itemLimit: 100,
    itemOffset: 0,
    sortColumn: 'name',
    sortOrder: 'asc',
    cacheExpiryTime: 60000, // 1 phút
    defaultErrorTimeout: 5000,
    defaultSuccessTimeout: 3000,
    slideshowDelay: 3000,     // 3 giây
    slideshowTransitionSpeed: 300  // 300ms
};

// Styles cho album
const AlbumStyles = {
    photoItem: `
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
    `,
    photoItemHover: `
        transform: scale(1.05);
        z-index: 2;
    `,
    photoItemMedia: `
        width: 100%;
        height: 100%;
        object-fit: cover;
    `,
    playIcon: `
        transition: all 0.3s ease;
        pointer-events: auto;
    `,
    playIconHover: `
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
    `,
    modal: `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `,
    modalMedia: `
        max-width: 90%;
        max-height: 80vh;
        object-fit: contain;
        z-index: 10001;
    `,
    button: `
        padding: 10px 20px;
        background: #854D27;
        color: #FFF9F3;
        border: 2px solid #D4B08C;
        cursor: pointer;
        font-size: 1.1em;
        border-radius: 0;
        box-shadow: 2px 2px 0 #D4B08C;
    `,
    slideshowContainer: `
        width: 100%;
        height: 100%;
        position: relative;
        display: none;
    `,
    slideshowSlide: `
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        transition: opacity ${AlbumConfig.slideshowTransitionSpeed}ms ease-in-out;
    `,
    slideshowActiveSlide: `
        opacity: 1;
        z-index: 2;
    `,
    slideshowControls: `
        position: absolute;
        bottom: 20px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        z-index: 10;
    `,
    slideshowButton: `
        padding: 10px 20px;
        background: #854D27;
        color: #FFF9F3;
        border: 2px solid #D4B08C;
        cursor: pointer;
        font-size: 1.1em;
        border-radius: 0;
        box-shadow: 2px 2px 0 #D4B08C;
        opacity: 0.7;
        transition: opacity 0.3s;
    `,
    slideshowButtonHover: `
        opacity: 1;
    `,
    slideshowNavigation: `
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background: rgba(133, 77, 39, 0.7);
        color: #FFF;
        font-size: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 10;
        border-radius: 50%;
        opacity: 0.7;
        transition: opacity 0.3s;
    `,
    slideshowNavigationHover: `
        opacity: 1;
        background: rgba(133, 77, 39, 0.9);
    `
};

// Namespace cho trạng thái album thay vì biến window
const AlbumState = {
    mediaFilesLoaded: false,  // Kiểm tra xem đã tải dữ liệu chưa
    mediaFiles: [],  // Lưu trữ danh sách file đã tải
    isLoadingMedia: false,  // Ngăn tải file cùng lúc
    cacheTime: 0,    // Thời gian lưu cache
    mediaTags: {},   // Cache cho media tags
    currentPage: 1,  // Trang hiện tại (chuẩn bị cho phân trang)
    itemsPerPage: 20, // Số item trên mỗi trang
    observers: [],   // Lưu trữ các observer để cleanup
    slideshow: {
        active: false,
        currentIndex: 0,
        timer: null,
        slides: [],
        isPlaying: false
    }
};

// Cleanup function để gọi khi unload
function cleanupResources() {
    // Cleanup các observer
    if (AlbumState.observers.length > 0) {
        AlbumState.observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        AlbumState.observers = [];
    }
    
    // Hủy timer nếu có
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
        AlbumState.slideshow.timer = null;
    }
    
    // Xóa cache
    invalidateCache();
}

// Thêm CSS cho phần video
const albumStyle = document.createElement('style');
albumStyle.textContent = `
.photo-item {
    ${AlbumStyles.photoItem}
}

.photo-item:hover {
    ${AlbumStyles.photoItemHover}
}

.photo-item-media {
    ${AlbumStyles.photoItemMedia}
}

.play-icon {
    ${AlbumStyles.playIcon}
}

.photo-item:hover .play-icon {
    ${AlbumStyles.playIconHover}
}

/* Đảm bảo video trong modal hiển thị đúng */
#fullSizeMediaModal video {
    display: block;
    max-width: 90%;
    max-height: 80vh;
}

/* Đảm bảo các nút điều khiển hiển thị phía trên */
#fullSizeMediaModal button,
#fullSizeMediaModal .caption {
    z-index: 10002;
}

/* Slideshow styles */
.slideshow-container {
    ${AlbumStyles.slideshowContainer}
}

.slideshow-slide {
    ${AlbumStyles.slideshowSlide}
}

.slideshow-slide.active {
    ${AlbumStyles.slideshowActiveSlide}
}

.slideshow-controls {
    ${AlbumStyles.slideshowControls}
}

.slideshow-button {
    ${AlbumStyles.slideshowButton}
}

.slideshow-button:hover {
    ${AlbumStyles.slideshowButtonHover}
}

.slideshow-nav {
    ${AlbumStyles.slideshowNavigation}
}

.slideshow-nav:hover {
    ${AlbumStyles.slideshowNavigationHover}
}

.slideshow-prev {
    left: 20px;
}

.slideshow-next {
    right: 20px;
}

.slideshow-pagination {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.slideshow-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: background 0.3s;
}

.slideshow-dot.active {
    background: #FFF;
}
`;
document.head.appendChild(albumStyle);

// Khởi tạo Swiper
let swiperInstance = null;

/**
 * Lấy thống kê từ Supabase - có thể tùy chỉnh để lọc các file
 * @param {string} bucket Tên bucket lưu trữ
 * @param {boolean} useCache Sử dụng cache hay không
 * @returns {Promise<Object>} Thống kê media
 */
async function getMediaStats(bucket = AlbumConfig.mediaBucket, useCache = true) {
    try {
        // Kiểm tra cache nếu có yêu cầu
        const now = Date.now();
        if (useCache && AlbumState.cacheTime > 0 && 
            (now - AlbumState.cacheTime < AlbumConfig.cacheExpiryTime) && 
            AlbumState.mediaFiles.length > 0) {
            
            return {
                total: AlbumState.mediaFiles.length,
                images: AlbumState.mediaFiles.filter(file => getFileType(file) === 'image').length,
                videos: AlbumState.mediaFiles.filter(file => getFileType(file) === 'video').length,
                fileList: AlbumState.mediaFiles.map(name => ({ name }))
            };
        }
        
        // Không có cache hoặc cache hết hạn, tải từ Supabase
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .list('', {
                limit: AlbumConfig.itemLimit,
                offset: (AlbumState.currentPage - 1) * AlbumState.itemsPerPage,
                sortBy: { column: AlbumConfig.sortColumn, order: AlbumConfig.sortOrder }
            });
        
        if (error) throw error;
        
        // Lọc bỏ file .emptyFolderPlaceholder
        const filteredData = data.filter(file => file.name !== '.emptyFolderPlaceholder');
        
        // Đếm số lượng ảnh và video
        const stats = {
            total: filteredData.length,
            images: filteredData.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length,
            videos: filteredData.filter(file => file.name.match(/\.(mp4|webm|mov|avi)$/i)).length,
            fileList: filteredData
        };
        
        // Lưu vào cache
        AlbumState.cacheTime = now;
        
        return stats;
    } catch (error) {
        handleError(error, "Lỗi khi lấy thống kê media");
        throw error;
    }
}

/**
 * Làm mới cache
 */
function invalidateCache() {
    AlbumState.cacheTime = 0;
    AlbumState.mediaFiles = [];
    AlbumState.mediaFilesLoaded = false;
}

/**
 * Hiển thị tiến trình tải
 * @param {string} message Thông báo
 * @param {number} progress Tiến trình (0-100)
 */
function showLoadingProgress(message, progress = -1) {
    let loadingElement = document.getElementById('albumLoadingProgress');
    
    if (!loadingElement) {
        loadingElement = createElementWithStyles('div', {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FFF9F3',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        }, { id: 'albumLoadingProgress' });
        
        const loadingText = createElementWithStyles('span', {}, {}, message);
        loadingElement.appendChild(loadingText);
        
        // Thêm progress bar nếu có tiến trình cụ thể
        if (progress >= 0) {
            const progressContainer = createElementWithStyles('div', {
                width: '100px',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
            });
            
            const progressBar = createElementWithStyles('div', {
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#854D27',
                transition: 'width 0.3s ease'
            }, { id: 'albumLoadingBar' });
            
            progressContainer.appendChild(progressBar);
            loadingElement.appendChild(progressContainer);
        }
        
        document.body.appendChild(loadingElement);
    } else {
        // Cập nhật thông báo
        const textElement = loadingElement.querySelector('span');
        if (textElement) textElement.textContent = message;
        
        // Cập nhật tiến trình
        if (progress >= 0) {
            const progressBar = document.getElementById('albumLoadingBar');
            if (progressBar) progressBar.style.width = `${progress}%`;
        }
    }
    
    return loadingElement;
}

/**
 * Ẩn tiến trình tải
 */
function hideLoadingProgress() {
    const loadingElement = document.getElementById('albumLoadingProgress');
    if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
        }, 500);
    }
}

/**
 * Kiểm tra xem Supabase đã được khởi tạo chưa
 * @returns {boolean} true nếu Supabase đã khởi tạo
 */
function checkSupabaseInitialized() {
    if (typeof supabase === 'undefined') {
        handleError(new Error('Supabase chưa được khởi tạo'), 'Lỗi kết nối cơ sở dữ liệu', true);
        return false;
    }
    return true;
}

/**
 * Tải dữ liệu album từ Supabase
 * @param {boolean} forceRefresh Bắt buộc tải lại dữ liệu mới
 */
async function loadAlbumMedia(forceRefresh = false) {
    // Ngăn tải hai lần
    if (AlbumState.isLoadingMedia) {
        return;
    }
    
    // Kiểm tra Supabase đã khởi tạo chưa
    if (!checkSupabaseInitialized()) {
        return;
    }
    
    // Đánh dấu đang tải
    AlbumState.isLoadingMedia = true;
    
    const gallery = document.getElementById('photoGallery');
    const slideshowWrapper = document.getElementById('slideshowWrapper');
    
    // Hiển thị tiến trình tải
    showLoadingProgress('Đang tải dữ liệu album...', 10);
    
    // Xóa nội dung hiện tại nếu yêu cầu tải lại
    if (forceRefresh) {
        gallery.innerHTML = '';
        invalidateCache();
    }
    
    try {
        // Tải dữ liệu từ Supabase Storage
        const stats = await getMediaStats(AlbumConfig.mediaBucket, !forceRefresh);
        showLoadingProgress('Đã nhận dữ liệu...', 40);
        
        // Hiển thị thống kê vào gallery
        let statsInfo = document.getElementById('mediaStatsInfo');
        if (!statsInfo) {
            statsInfo = createElementWithStyles('div', {}, { id: 'mediaStatsInfo' });
            statsInfo.innerHTML = `<div style="text-align: center; padding: 5px; margin-bottom: 10px; background: #f8f8f8;">
                <strong>Thông kê Album:</strong> Tổng cộng ${stats.total} file (${stats.images} ảnh, ${stats.videos} video)
            </div>`;
            
            if (gallery.firstChild) {
                gallery.insertBefore(statsInfo, gallery.firstChild);
            } else {
                gallery.appendChild(statsInfo);
            }
        } else {
            statsInfo.innerHTML = `<div style="text-align: center; padding: 5px; margin-bottom: 10px; background: #f8f8f8;">
                <strong>Thông kê Album:</strong> Tổng cộng ${stats.total} file (${stats.images} ảnh, ${stats.videos} video)
            </div>`;
        }
        
        // Lấy danh sách file từ Supabase
        const mediaFiles = stats.fileList;
        
        if (!mediaFiles || mediaFiles.length === 0) {
            const noDataMsg = createElementWithStyles('div', {
                textAlign: 'center',
                padding: '20px',
                color: '#8B4513',
                fontSize: '16px'
            }, {}, 'Không có hình ảnh hoặc video nào.');
            
            gallery.appendChild(noDataMsg);
            hideLoadingProgress();
            AlbumState.isLoadingMedia = false;
            return;
        }
        
        // Lưu vào bộ nhớ đệm
        AlbumState.mediaFiles = mediaFiles.map(file => file.name);
        AlbumState.mediaFilesLoaded = true;
        
        showLoadingProgress('Đang hiển thị media...', 70);
        
        // Hiển thị tất cả các file, loại bỏ file .emptyFolderPlaceholder
        const mediaItemsExist = gallery.querySelectorAll('.photo-item').length > 0;
        
        // Chỉ thêm file mới nếu không phải tải lại hoàn toàn
        if (!mediaItemsExist || forceRefresh) {
            mediaFiles.forEach((file, index) => {
                if (file.name !== '.emptyFolderPlaceholder') {
                    // Thêm độ trễ nhỏ để không làm treo giao diện
                    setTimeout(() => {
                        renderPhotoItem(file.name, gallery);
                        
                        // Cập nhật tiến trình
                        const progress = 70 + Math.floor(30 * (index + 1) / mediaFiles.length);
                        showLoadingProgress(`Đang hiển thị media (${index+1}/${mediaFiles.length})...`, progress);
                        
                        // Khi hiển thị xong file cuối cùng
                        if (index === mediaFiles.length - 1) {
                            // Thêm nút tải lên ở cuối
                            addUploadButton(gallery);
                            hideLoadingProgress();
                        }
                    }, 0);
                }
            });
        } else {
            hideLoadingProgress();
        }
        
        // Nếu đang ở chế độ slideshow, render slideshow
        if (document.getElementById('slideshowContainer').style.display === 'block') {
            renderSlideshow();
        }
    } catch (error) {
        handleError(error, 'Lỗi khi tải ảnh từ Supabase', true);
        
        const errorMsg = createElementWithStyles('div', {
            textAlign: 'center',
            padding: '20px',
            color: '#721c24',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            margin: '20px 0'
        }, {}, 'Không thể tải dữ liệu từ Supabase. Vui lòng thử lại sau.');
        
        gallery.innerHTML = '';
        gallery.appendChild(errorMsg);
    } finally {
        // Xóa trạng thái đang tải
        AlbumState.isLoadingMedia = false;
    }
}

/**
 * Kiểm tra loại file dựa trên tên file
 * @param {string} fileName Tên file cần kiểm tra
 * @returns {string} 'image' hoặc 'video' tùy theo loại file
 */
function getFileType(fileName) {
    if (fileName.match(/\.(mp4|webm|mov|avi)$/i)) {
        return 'video';
    } else {
        return 'image';
    }
}

/**
 * Tạo phần tử media (image hoặc video) dựa trên loại file
 * @param {string} mediaPath Đường dẫn đến file media
 * @param {string} fileName Tên file
 * @param {string} mediaType Loại media ('image' hoặc 'video')
 * @returns {HTMLElement} Phần tử media đã tạo
 */
function createMediaElement(mediaPath, fileName, mediaType) {
    if (mediaType === 'video') {
        // Tạo video element
        const video = createElementWithStyles('video', {}, {
            className: 'photo-item-media',
            src: mediaPath,
            controls: false,
            muted: true,
            loop: true,
            preload: 'metadata'
        });
        
        return video;
    } else {
        // Tạo image element
        const img = createElementWithStyles('img', {}, {
            className: 'photo-item-media',
            src: mediaPath,
            alt: `Memory ${fileName}`,
            loading: 'lazy'
        });
        
        // Xử lý lỗi khi tải ảnh
        img.onerror = function() {
            console.error(`Không thể tải ảnh: ${mediaPath}`);
            // Hiển thị hình ảnh lỗi
            img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23EEEEEE%22%20d%3D%22M0%200h400v300H0z%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2CSans-serif%22%20font-size%3D%2230%22%20font-weight%3D%22bold%22%20dy%3D%22.3em%22%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%3EKhông%20tải%20được%20ảnh%3C%2Ftext%3E%3C%2Fsvg%3E';
        };
        
        return img;
    }
}

/**
 * Lấy tags của một media từ Supabase
 * @param {string} mediaPath Đường dẫn đến file
 * @returns {Promise<Array>} Danh sách tags
 */
async function getMediaTags(mediaPath) {
    try {
        // Kiểm tra Supabase đã khởi tạo chưa
        if (!checkSupabaseInitialized()) {
            return [];
        }

        const { data, error } = await supabase
            .from('media_tags')
            .select('tags')
            .eq('media_path', mediaPath)
            .single();
            
        if (error) {
            // Nếu không tìm thấy record, trả về mảng rỗng
            if (error.code === 'PGRST116') {
                return [];
            }
            throw error;
        }
        
        return data?.tags || [];
    } catch (error) {
        handleError(error, `Lỗi khi lấy tags cho media ${mediaPath}`);
        return [];
    }
}

/**
 * Lưu tags cho một media vào Supabase
 * @param {string} mediaPath Đường dẫn đến file
 * @param {string} tagsInput Chuỗi tags cách nhau bằng dấu phẩy
 * @returns {Promise<boolean>} Kết quả lưu
 */
async function saveMediaTags(mediaPath, tagsInput) {
    try {
        // Kiểm tra Supabase đã khởi tạo chưa
        if (!checkSupabaseInitialized()) {
            return false;
        }

        // Chuyển đổi input thành mảng tags
        const tags = tagsInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '')
            .slice(0, 5); // Giới hạn 5 thẻ
        
        // Kiểm tra xem thẻ đã tồn tại chưa
        const { data: existingTags, error: fetchError } = await supabase
            .from('media_tags')
            .select('*')
            .eq('media_path', mediaPath);
            
        if (fetchError) throw fetchError;
        
        let result;
        if (existingTags && existingTags.length > 0) {
            // Cập nhật thẻ hiện có
            const { error: updateError } = await supabase
                .from('media_tags')
                .update({ tags: tags })
                .eq('media_path', mediaPath);
                
            if (updateError) throw updateError;
            result = true;
        } else {
            // Tạo thẻ mới
            const { error: insertError } = await supabase
                .from('media_tags')
                .insert([{ media_path: mediaPath, tags: tags }]);
                
            if (insertError) throw insertError;
            result = true;
        }
        
        return result;
    } catch (error) {
        handleError(error, `Lỗi khi lưu tags cho media ${mediaPath}`, true);
        return false;
    }
}

/**
 * Hiển thị tags cho media item
 * @param {HTMLElement} container Phần tử chứa tags
 * @param {string} mediaPath Đường dẫn đến file media
 */
async function displayTags(container, mediaPath) {
    try {
        // Lấy tags từ Supabase
        const tags = await getMediaTags(mediaPath);
        
        // Xóa tags hiện tại nếu có
        const existingTagsContainer = container.querySelector('.tags-container');
        if (existingTagsContainer) {
            container.removeChild(existingTagsContainer);
        }
        
        // Thêm hiển thị tags nếu có
        if (tags && tags.length > 0) {
            const tagsContainer = createElementWithStyles('div', {}, { className: 'tags-container' });
            
            tags.forEach(tag => {
                const tagElement = createElementWithStyles('span', {}, { className: 'tag' }, tag);
                tagsContainer.appendChild(tagElement);
            });
            
            container.appendChild(tagsContainer);
        }
    } catch (error) {
        handleError(error, `Lỗi khi hiển thị tags cho media ${mediaPath}`);
    }
}

// Render một ảnh/video vào gallery
function renderPhotoItem(index, gallery) {
    // Bỏ qua file .emptyFolderPlaceholder
    if (index === '.emptyFolderPlaceholder') {
        return;
    }
    
    // Tạo container cho ảnh/video
    const photoContainer = createElementWithStyles('div', {}, {
        className: 'photo-item',
        'data-mediaNumber': index,
        'data-index': index
    });
    
    // Thêm nút tag
    const tagButton = createElementWithStyles('button', {}, {
        className: 'tag-button',
    }, '+', (e) => {
        e.stopPropagation();
        openTagModal(index);
    });
    
    photoContainer.appendChild(tagButton);
    
    // Lấy URL từ Supabase Storage
    const mediaPath = getMediaPath(index);
    
    // Hiển thị tags
    const mediaKey = `memory/${index}`;
    displayTags(photoContainer, mediaKey);
    
    // Xác định loại file
    const mediaType = getFileType(index);
    
    if (mediaType === 'video') {
        // Xử lý video
        const video = createMediaElement(mediaPath, index, 'video');
        
        // Hiển thị video khi click
        photoContainer.addEventListener('click', () => {
            openFullSizeMedia(video.src, index, 'video');
        });
        
        // Hiển thị icon play
        const playIcon = createElementWithStyles('div', {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '30px',
            opacity: '0.8',
            textShadow: '0 0 5px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            zIndex: '5'
        }, { className: 'play-icon' }, '▶️', (e) => {
            e.stopPropagation(); // Ngăn chặn lan truyền để không kích hoạt click của photoContainer
            openFullSizeMedia(video.src, index, 'video');
        });
        
        photoContainer.appendChild(playIcon);
        
        // Phát video khi hover
        photoContainer.addEventListener('mouseenter', () => {
            video.play().catch(e => console.log('Video autoplay failed'));
        });
        
        photoContainer.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        
        video.addEventListener('ended', () => {
            photoContainer.classList.remove('active');
        });
        
        photoContainer.appendChild(video);
    } else {
        // Xử lý ảnh
        const img = createMediaElement(mediaPath, index, 'image');
        
        // Hiển thị ảnh khi click
        photoContainer.addEventListener('click', () => {
            openFullSizeMedia(img.src, index, 'image');
        });
        
        photoContainer.appendChild(img);
    }
    
    gallery.appendChild(photoContainer);
}

function toggleSlideshowMode(enabled) {
    const slideshowContainer = document.getElementById('slideshowContainer');
    const photoGallery = document.getElementById('photoGallery');
    
    if (enabled) {
        // Vô hiệu hóa gallery và hiển thị slideshow
        if (photoGallery) photoGallery.style.display = 'none';
        if (slideshowContainer) slideshowContainer.style.display = 'block';
        
        // Đặt trạng thái slideshow active
        AlbumState.slideshow.active = true;
        
        // Đảm bảo có dữ liệu để hiển thị
        if (AlbumState.mediaFilesLoaded && AlbumState.mediaFiles.length > 0) {
            // Hiển thị ngay nếu đã có dữ liệu
            renderSlideshow();
        } else {
            // Tải dữ liệu rồi hiển thị
            showLoadingProgress("Đang tải dữ liệu slideshow...");
            loadAlbumMedia(false, () => {
                hideLoadingProgress();
                renderSlideshow();
            });
        }
    } else {
        // Tắt slideshow
        stopSlideshow();
        AlbumState.slideshow.active = false;
        
        // Ẩn slideshow, hiện gallery
        if (slideshowContainer) slideshowContainer.style.display = 'none';
        if (photoGallery) photoGallery.style.display = 'grid';
    }
}

function renderSlideshow() {
    // Lấy container
    const slideshowContainer = document.getElementById('slideshowContainer');
    if (!slideshowContainer) {
        handleError(new Error("Không tìm thấy container slideshow"), "Lỗi hiển thị slideshow");
        return;
    }

    // Xóa nội dung cũ
    slideshowContainer.innerHTML = '';
    
    // Kiểm tra xem có dữ liệu để hiển thị không
    if (!AlbumState.mediaFilesLoaded || !AlbumState.mediaFiles || AlbumState.mediaFiles.length === 0) {
        slideshowContainer.innerHTML = '<div class="error-message">Không có dữ liệu để hiển thị slideshow</div>';
        return;
    }

    // Lọc bỏ file .emptyFolderPlaceholder
    AlbumState.slideshow.slides = AlbumState.mediaFiles.filter(file => file !== '.emptyFolderPlaceholder');
    
    // Tạo wrapper cho slides
    const slidesWrapper = document.createElement('div');
    slidesWrapper.className = 'slideshow-wrapper';
    slideshowContainer.appendChild(slidesWrapper);
    
    // Tạo slide cho mỗi file
    AlbumState.slideshow.slides.forEach((file, index) => {
        const slide = document.createElement('div');
        slide.className = 'slideshow-slide';
        if (index === 0) slide.classList.add('active'); // Slide đầu tiên active
        slidesWrapper.appendChild(slide);
        
        // Render nội dung slide
        renderSlideItem(file, slide);
    });
    
    // Tạo các nút điều hướng
    const prevButton = document.createElement('div');
    prevButton.className = 'slideshow-nav slideshow-prev';
    prevButton.innerHTML = '&#10094;';
    prevButton.addEventListener('click', () => navigateSlideshow('prev'));
    
    const nextButton = document.createElement('div');
    nextButton.className = 'slideshow-nav slideshow-next';
    nextButton.innerHTML = '&#10095;';
    nextButton.addEventListener('click', () => navigateSlideshow('next'));
    
    // Thêm vào container
    slideshowContainer.appendChild(prevButton);
    slideshowContainer.appendChild(nextButton);
    
    // Tạo pagination dots
    const pagination = document.createElement('div');
    pagination.className = 'slideshow-pagination';
    
    AlbumState.slideshow.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'slideshow-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        pagination.appendChild(dot);
    });
    
    // Thêm các nút điều khiển
    const controls = document.createElement('div');
    controls.className = 'slideshow-controls';
    
    // Nút play/pause
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'slideshow-button';
    playPauseBtn.textContent = 'Tạm dừng';
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Nút đóng
    const closeBtn = document.createElement('button');
    closeBtn.className = 'slideshow-button';
    closeBtn.textContent = 'Đóng Slideshow';
    closeBtn.addEventListener('click', () => toggleSlideshowMode(false));
    
    controls.appendChild(playPauseBtn);
    controls.appendChild(pagination);
    controls.appendChild(closeBtn);
    
    slideshowContainer.appendChild(controls);
    
    // Bắt đầu slideshow
    AlbumState.slideshow.currentIndex = 0;
    startSlideshow();
}

function renderSlideItem(fileName, slide) {
    // Bỏ qua file không hợp lệ
    if (!fileName || fileName === '.emptyFolderPlaceholder') {
        return;
    }
    
    // Xác định loại media và đường dẫn
    const mediaPath = getMediaPath(fileName);
    const mediaType = getFileType(fileName);
    
    // Tạo container cho media
    const mediaContainer = createElementWithStyles('div', {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    });
    
    // Tạo element tương ứng với loại media
    if (mediaType === 'video') {
        // Xử lý video
        const video = createElementWithStyles('video', {
            maxHeight: '80vh',
            maxWidth: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }, {
            className: 'memory-photo',
            src: mediaPath,
            controls: true,
            loop: false,
            preload: 'metadata'
        });
        
        mediaContainer.appendChild(video);
        
        // Tự động phát khi slide active
        slide.addEventListener('transitionend', () => {
            if (slide.classList.contains('active')) {
                video.play().catch(e => console.log('Video autoplay failed'));
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    } else {
        // Xử lý ảnh
        const img = createElementWithStyles('img', {
            maxHeight: '80vh',
            maxWidth: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }, {
            className: 'memory-photo',
            src: mediaPath,
            alt: `Memory ${fileName}`,
            loading: 'lazy'
        });
        
        mediaContainer.appendChild(img);
    }
    
    slide.appendChild(mediaContainer);
}

// Functions điều khiển slideshow
function startSlideshow() {
    // Bắt đầu autoplay
    AlbumState.slideshow.isPlaying = true;
    
    // Đặt timer
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
    }
    
    AlbumState.slideshow.timer = setTimeout(() => {
        navigateSlideshow('next');
    }, AlbumConfig.slideshowDelay);
}

function stopSlideshow() {
    // Dừng autoplay
    AlbumState.slideshow.isPlaying = false;
    
    // Xóa timer
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
        AlbumState.slideshow.timer = null;
    }
    
    // Dừng tất cả video
    const videos = document.querySelectorAll('#slideshowContainer video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
}

function togglePlayPause() {
    const playPauseBtn = document.querySelector('.slideshow-controls .slideshow-button:first-child');
    
    if (AlbumState.slideshow.isPlaying) {
        stopSlideshow();
        if (playPauseBtn) playPauseBtn.textContent = 'Tiếp tục';
    } else {
        startSlideshow();
        if (playPauseBtn) playPauseBtn.textContent = 'Tạm dừng';
    }
}

function navigateSlideshow(direction) {
    // Lấy index hiện tại
    let currentIndex = AlbumState.slideshow.currentIndex;
    let newIndex;
    
    // Tính toán index mới
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % AlbumState.slideshow.slides.length;
    } else {
        newIndex = (currentIndex - 1 + AlbumState.slideshow.slides.length) % AlbumState.slideshow.slides.length;
    }
    
    // Chuyển đến slide mới
    goToSlide(newIndex);
}

function goToSlide(index) {
    // Cập nhật index hiện tại
    AlbumState.slideshow.currentIndex = index;
    
    // Cập nhật class cho slides
    const slides = document.querySelectorAll('.slideshow-slide');
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // Cập nhật pagination dots
    const dots = document.querySelectorAll('.slideshow-dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Xử lý video - Tạm dừng tất cả video
    const videos = document.querySelectorAll('#slideshowContainer video');
    videos.forEach((video, i) => {
        const slide = video.closest('.slideshow-slide');
        if (slide && slide.classList.contains('active')) {
            video.play().catch(e => console.log('Video autoplay failed'));
        } else {
            video.pause();
            video.currentTime = 0;
        }
    });
    
    // Reset timer nếu đang phát
    if (AlbumState.slideshow.isPlaying) {
        if (AlbumState.slideshow.timer) {
            clearTimeout(AlbumState.slideshow.timer);
        }
        
        AlbumState.slideshow.timer = setTimeout(() => {
            navigateSlideshow('next');
        }, AlbumConfig.slideshowDelay);
    }
}

// Khởi tạo lưu trữ thẻ nếu chưa có
function initTags() {
    // Không cần khởi tạo localStorage nữa vì tags được lưu trực tiếp vào Supabase
}

/**
 * Tạo modal cơ bản
 * @param {string} id ID của modal
 * @param {object} styles Style cho modal (optional)
 * @returns {HTMLElement} Element modal đã tạo
 */
function createModal(id, styles = {}) {
    // Đóng modal cũ nếu có
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }
    
    // Tạo modal mới
    const modal = createElementWithStyles('div', {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999',
        ...styles
    }, { id: id });
    
    // Thêm vào DOM
    document.body.appendChild(modal);
    
    return modal;
}

/**
 * Tạo nút đóng cho modal
 * @param {HTMLElement} parentElement Phần tử chứa nút đóng
 * @param {Function} closeHandler Handler khi click nút đóng
 * @returns {HTMLElement} Nút đóng đã tạo
 */
function createCloseButton(parentElement, closeHandler) {
    const closeBtn = createElementWithStyles('button', {
        position: 'absolute',
        top: '20px',
        right: '20px',
        fontSize: '30px',
        color: 'white',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        zIndex: '10002'
    }, {}, '×', (e) => {
        e.stopPropagation();
        if (closeHandler) {
            closeHandler(e);
        } else {
            // Mặc định đóng modal cha
            parentElement.remove();
        }
    });
    
    parentElement.appendChild(closeBtn);
    return closeBtn;
}

/**
 * Tạo button với style mặc định
 * @param {string} text Nội dung text của button
 * @param {object} styles Style bổ sung (optional)
 * @param {Function} clickHandler Handler khi click
 * @param {object} attributes Thuộc tính bổ sung (optional)
 * @returns {HTMLElement} Button đã tạo
 */
function createButton(text, styles = {}, clickHandler = null, attributes = {}) {
    return createElementWithStyles('button', {
        padding: '10px 20px',
        background: '#854D27',
        color: '#FFF9F3',
        border: '2px solid #D4B08C',
        cursor: 'pointer',
        borderRadius: '0',
        boxShadow: '2px 2px 0 #D4B08C',
        fontSize: '1.1em',
        ...styles
    }, attributes, text, clickHandler);
}

/**
 * Mở modal xem ảnh/video toàn màn hình
 * @param {string} mediaUrl Đường dẫn đến media
 * @param {string} mediaNumber Số thứ tự của media
 * @param {string} mediaType Loại media ('image' hoặc 'video')
 */
function openFullSizeMedia(mediaUrl, mediaNumber, mediaType) {
    // Tạo modal
    const modal = createModal('fullSizeMediaModal');

    // Tạo phần tử media tương ứng
    let mediaElement;
    
    if (mediaType === 'video') {
        mediaElement = createElementWithStyles('video', {
            maxWidth: '90%',
            maxHeight: '80vh',
            objectFit: 'contain',
            zIndex: '10001'
        }, {
            src: mediaUrl,
            controls: true,
            autoplay: true
        });
        
        // Đảm bảo video có thể phát được
        mediaElement.addEventListener('loadedmetadata', () => {
            mediaElement.play().catch(e => handleError(e, 'Lỗi khi phát video'));
        });
        
        // Tạo nút phát/dừng phụ trợ
        const playPauseBtn = createButton(
            '⏸️',
            {
                position: 'absolute',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)'
            },
            (e) => {
                e.stopPropagation();
                if (mediaElement.paused) {
                    mediaElement.play();
                    playPauseBtn.innerHTML = '⏸️';
                } else {
                    mediaElement.pause();
                    playPauseBtn.innerHTML = '▶️';
                }
            }
        );
        
        modal.appendChild(playPauseBtn);
    } else {
        mediaElement = createElementWithStyles('img', {
            maxWidth: '90%',
            maxHeight: '80vh',
            objectFit: 'contain',
            zIndex: '10001'
        }, {
            src: mediaUrl,
            alt: `Memory ${mediaNumber}`
        });
    }

    // Tạo nút đóng
    createCloseButton(modal, () => {
        // Nếu đang phát video, dừng video trước khi đóng modal
        if (mediaType === 'video' && mediaElement && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    // Tạo caption
    const caption = createElementWithStyles('div', {
        position: 'absolute',
        bottom: '20px',
        color: 'white',
        fontSize: '18px',
        background: 'rgba(0,0,0,0.5)',
        padding: '5px 15px',
        borderRadius: '20px',
        zIndex: '10002'
    }, { className: 'caption' }, `${mediaType === 'video' ? 'Video' : 'Hình'} ${mediaNumber}`);

    // Tạo nút gắn thẻ
    const tagBtn = createButton('Gắn Thẻ', {
        position: 'absolute',
        bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)'
    }, (e) => {
        e.stopPropagation();
        openTagModal(mediaNumber);
    });

    modal.appendChild(mediaElement);
    modal.appendChild(caption);
    modal.appendChild(tagBtn);

    // Xử lý sự kiện click trên modal để đóng
    modal.addEventListener('click', () => {
        // Nếu đang phát video, dừng video trước khi đóng modal
        if (mediaType === 'video' && mediaElement && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    // Ngăn chặn sự kiện click trên phần tử media khỏi lan truyền đến modal
    mediaElement.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

/**
 * Mở modal gắn thẻ cho media
 * @param {string} mediaIndex Mã định danh của media
 */
function openTagModal(mediaIndex) {
    // Tạo modal gắn thẻ mới
    const tagModal = createModal('tagModalCustom', {
        display: 'flex' // Hiển thị ngay
    });
    tagModal.dataset.mediaIndex = mediaIndex;
    
    // Tạo nội dung modal
    const modalContent = createElementWithStyles('div', {
        background: '#FFF9F3',
        border: '2px solid #D4B08C',
        borderRadius: '0',
        padding: '20px',
        width: '80%',
        maxWidth: '500px',
        boxShadow: '8px 8px 0 #D4B08C',
        position: 'relative',
        textAlign: 'center'
    }, { className: 'modal-content' });
    
    // Tạo nút đóng
    const closeBtn = createCloseButton(modalContent, () => {
        tagModal.style.display = 'none';
    });
    closeBtn.style.color = '#854D27';
    
    // Tạo tiêu đề
    const title = createElementWithStyles('h2', {
        color: '#854D27',
        marginBottom: '20px',
        fontFamily: '\'DM Serif Display\', serif'
    }, {}, 'Gắn Thẻ Hình Ảnh/Video');
    
    // Tạo mô tả
    const description = createElementWithStyles('p', {
        marginBottom: '20px'
    }, {}, 'Nhập các thẻ, cách nhau bằng dấu phẩy (ví dụ: bạn bè, sinh nhật)');
    
    // Tạo input nhập thẻ
    const tagInput = createElementWithStyles('input', {
        width: '100%',
        padding: '10px',
        border: '2px solid #D4B08C',
        borderRadius: '0',
        marginBottom: '20px',
        fontFamily: '\'Old Standard TT\', serif',
        fontSize: '16px',
        background: '#FFF9F3',
        color: '#2C1810'
    }, {
        type: 'text',
        id: 'tagInputCustom',
        placeholder: 'Nhập thẻ...'
    });
    
    // Tạo nút lưu
    const submitBtn = createButton('Lưu Thẻ', {
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'all 0.3s',
        boxShadow: '4px 4px 0 #D4B08C'
    }, async () => {
        const tagsText = tagInput.value.trim();
        await saveTags(mediaIndex, tagsText);
        tagModal.style.display = 'none';
        tagInput.value = '';
    });
    
    // Thêm hiệu ứng hover cho nút
    submitBtn.addEventListener('mouseover', () => {
        submitBtn.style.transform = 'translate(-2px, -2px)';
        submitBtn.style.boxShadow = '6px 6px 0 #D4B08C';
    });
    submitBtn.addEventListener('mouseout', () => {
        submitBtn.style.transform = 'none';
        submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
    });
    
    // Thêm các phần tử vào modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(tagInput);
    modalContent.appendChild(submitBtn);
    tagModal.appendChild(modalContent);
    
    // Hiển thị thẻ hiện tại nếu có
    getMediaTags(mediaIndex).then(tags => {
        if (tags && tags.length > 0) {
            tagInput.value = tags.join(', ');
        } else {
            tagInput.value = '';
        }
    }).catch(error => {
        handleError(error, 'Lỗi khi lấy tags hiện tại');
        tagInput.value = '';
    });
    
    // Focus vào ô input
    setTimeout(() => tagInput.focus(), 100);
}

/**
 * Tìm kiếm media theo tags
 * @param {string} query Từ khóa tìm kiếm
 * @returns {Promise<void>}
 */
async function searchMediaByTag(query) {
    try {
        // Kiểm tra Supabase đã khởi tạo chưa
        if (!checkSupabaseInitialized()) {
            return;
        }
        
        const photoGallery = document.getElementById('photoGallery');
        const mediaItems = photoGallery.querySelectorAll('.photo-item');
        const searchTerm = query.toLowerCase().trim();
        
        // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
        if (searchTerm === '') {
            mediaItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        // Lấy tất cả các thẻ từ Supabase
        const { data: tagData, error } = await supabase
            .from('media_tags')
            .select('*');
            
        if (error) throw error;
        
        // Tạo đối tượng mapping từ media_path sang tags
        const tagsMap = {};
        if (tagData) {
            tagData.forEach(item => {
                tagsMap[item.media_path] = item.tags;
            });
        }
        
        // Hiển thị/ẩn các item dựa trên thẻ
        mediaItems.forEach(item => {
            const mediaIndex = item.dataset.index;
            const tags = tagsMap[mediaIndex] || [];
            const matches = tags.some(tag => tag.toLowerCase().includes(searchTerm));
            item.style.display = matches ? 'block' : 'none';
        });
    } catch (error) {
        handleError(error, 'Lỗi khi tìm kiếm theo thẻ từ Supabase', true);
        
        // Hiển thị tất cả nếu có lỗi
        const photoGallery = document.getElementById('photoGallery');
        const mediaItems = photoGallery.querySelectorAll('.photo-item');
        mediaItems.forEach(item => {
            item.style.display = 'block';
        });
    }
}

// Hàm lưu thẻ (wrapper cho saveMediaTags)
async function saveTags(mediaIndex, tagsInput) {
    const result = await saveMediaTags(mediaIndex, tagsInput);
    
    if (result) {
        // Chỉ cập nhật lại hiển thị thẻ cho item cụ thể, không tải lại toàn bộ
        const photoItem = document.querySelector(`.photo-item[data-index="${mediaIndex}"]`);
        if (photoItem) {
            await displayTags(photoItem, mediaIndex);
        }
    }
}

/**
 * Tải lên file media đến Supabase
 * @param {File} file File để tải lên
 * @param {string} fileName Tên file
 * @param {HTMLElement} statusElement Element hiển thị trạng thái
 * @returns {Promise<boolean>} Kết quả tải lên
 */
async function uploadMediaFile(file, fileName, statusElement) {
    try {
        // Kiểm tra kết nối Supabase
        if (!checkSupabaseInitialized()) {
            throw new Error("Không thể kết nối tới Supabase");
        }

        // Cập nhật thông báo
        statusElement.textContent = `Đang tải lên: ${file.name}`;
        
        // Kiểm tra kích thước file
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error(`File quá lớn (${(file.size/1024/1024).toFixed(2)}MB). Giới hạn là ${maxSize/1024/1024}MB.`);
        }
        
        // Kiểm tra loại file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            throw new Error(`Loại file không được hỗ trợ. Chỉ hỗ trợ JPEG, PNG, GIF, WebP, MP4, WebM và QuickTime.`);
        }
        
        // Tải lên Supabase Storage
        const { data, error } = await supabase.storage
            .from(AlbumConfig.mediaBucket)
            .upload(fileName, file);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        handleError(error, `Lỗi khi tải file ${fileName} lên`, true);
        return false;
    }
}

/**
 * Tạo và hiển thị thông báo tải lên
 * @returns {HTMLElement} Phần tử thông báo
 */
function createUploadStatusNotification() {
    const notification = createElementWithStyles('div', {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#FFF9F3',
        border: '2px solid #D4B08C',
        padding: '15px 20px',
        zIndex: '10000',
        boxShadow: '0 0 15px rgba(0,0,0,0.2)'
    });
    
    document.body.appendChild(notification);
    return notification;
}

/**
 * Cập nhật thông báo tải lên
 * @param {HTMLElement} notification Phần tử thông báo
 * @param {string} message Nội dung thông báo
 * @param {string} type Loại thông báo ('progress', 'success', 'error')
 */
function updateUploadStatus(notification, message, type = 'progress') {
    notification.textContent = message;
    
    // Thay đổi style theo loại thông báo
    if (type === 'success') {
        notification.style.backgroundColor = '#d4edda';
        notification.style.borderColor = '#c3e6cb';
        notification.style.color = '#155724';
        
        // Tự động ẩn thông báo thành công sau 3 giây
        setTimeout(() => {
            notification.remove();
        }, AlbumConfig.defaultSuccessTimeout);
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f8d7da';
        notification.style.borderColor = '#f5c6cb';
        notification.style.color = '#721c24';
        
        // Tự động ẩn thông báo lỗi sau 5 giây
        setTimeout(() => {
            notification.remove();
        }, AlbumConfig.defaultErrorTimeout);
    }
}

/**
 * Xử lý tải file lên
 * @param {Event} event Sự kiện thay đổi input file
 */
async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Hiển thị thông báo đang tải
    const uploadStatus = createUploadStatusNotification();
    updateUploadStatus(uploadStatus, `Đang chuẩn bị tải lên ${files.length} file...`);
    
    try {
        // Kiểm tra kết nối Supabase
        if (!checkSupabaseInitialized()) {
            throw new Error("Không thể kết nối tới Supabase");
        }
        
        let successCount = 0;
        let failedCount = 0;
        
        // Tải file lên Supabase Storage
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `upload_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            
            // Cập nhật thông báo
            updateUploadStatus(uploadStatus, `Đang tải lên (${i+1}/${files.length}): ${file.name}`);
            
            // Tải file lên
            const success = await uploadMediaFile(file, fileName, uploadStatus);
            
            if (success) {
                successCount++;
            } else {
                failedCount++;
            }
        }
        
        // Hiển thị thông báo thành công
        let message = `Đã tải lên ${successCount} file thành công!`;
        if (failedCount > 0) {
            message += ` (${failedCount} file thất bại)`;
        }
        
        updateUploadStatus(uploadStatus, message, 'success');
        
        // Tải lại album để hiển thị file mới
        loadAlbumMedia();
    } catch (error) {
        updateUploadStatus(uploadStatus, `Lỗi: ${error.message || 'Không thể tải file lên'}`, 'error');
    }
}

/**
 * Tạo nút tải lên ảnh/video
 * @param {HTMLElement} gallery Phần tử gallery để thêm nút
 */
function addUploadButton(gallery) {
    const uploadContainer = createElementWithStyles('div', {}, {
        className: 'photo-item upload-item'
    });
    
    // Tạo phần tử hiển thị upload
    const mediaPlaceholder = createElementWithStyles('div', {
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    }, {
        className: 'photo-item-media'
    });
    
    // Icon tải lên
    const uploadIcon = createElementWithStyles('div', {}, {});
    uploadIcon.innerHTML = '<img src="assets/icon/upload.png" alt="Upload Icon" style="width: 100px; height: 100px;">';
    
    // Văn bản hướng dẫn
    const uploadText = createElementWithStyles('div', {
        color: '#854D27',
        fontSize: '20px',
        fontWeight: 'bold',
        marginTop: '10px'
    }, {}, 'Tải lên');
    
    // Input type="file" (ẩn)
    const fileInput = createElementWithStyles('input', {
        display: 'none'
    }, {
        type: 'file',
        id: 'uploadMediaFile',
        name: 'uploadMediaFile',
        accept: 'image/*,video/*',
        multiple: true
    });
    
    // Thêm các phần tử con vào container
    mediaPlaceholder.appendChild(uploadIcon);
    mediaPlaceholder.appendChild(uploadText);
    uploadContainer.appendChild(mediaPlaceholder);
    uploadContainer.appendChild(fileInput);
    
    // Thêm hiệu ứng hover
    uploadContainer.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    uploadContainer.addEventListener('mouseenter', () => {
        uploadContainer.style.transform = 'scale(1.05)';
        uploadContainer.style.boxShadow = '6px 6px 15px rgba(139, 69, 19, 0.5)';
    });
    
    uploadContainer.addEventListener('mouseleave', () => {
        uploadContainer.style.transform = '';
        uploadContainer.style.boxShadow = '';
    });
    
    // Thêm viền đứt nét
    uploadContainer.style.border = '2px dashed #D4B08C';
    
    // Thêm sự kiện click
    uploadContainer.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Xử lý sự kiện khi chọn file
    fileInput.addEventListener('change', handleFileUpload);
    
    // Thêm vào gallery
    gallery.appendChild(uploadContainer);
}

// Utility functions
/**
 * Lấy đường dẫn đến file media
 * @param {string} fileName Tên file
 * @returns {string} Đường dẫn đầy đủ đến file
 */
function getMediaPath(fileName) {
    return `${AlbumConfig.supabaseStorageUrl}${fileName}`;
}

/**
 * Xử lý lỗi một cách nhất quán
 * @param {Error} error Đối tượng lỗi
 * @param {string} message Thông báo lỗi
 * @param {boolean} showToUser Có hiển thị lỗi cho người dùng không
 */
function handleError(error, message, showToUser = false) {
    console.error(`${message}:`, error);
    
    if (showToUser) {
        // Hiển thị thông báo lỗi cho người dùng
        const errorNotification = document.createElement('div');
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '20px';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translateX(-50%)';
        errorNotification.style.backgroundColor = '#f8d7da';
        errorNotification.style.borderColor = '#f5c6cb';
        errorNotification.style.color = '#721c24';
        errorNotification.style.padding = '15px 20px';
        errorNotification.style.zIndex = '10000';
        errorNotification.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        errorNotification.textContent = `Lỗi: ${error.message || message}`;
        
        document.body.appendChild(errorNotification);
        
        // Tự động ẩn thông báo lỗi sau 5 giây
        setTimeout(() => {
            errorNotification.remove();
        }, AlbumConfig.defaultErrorTimeout);
    }
    
    return error; // Cho phép chaining với throw
}

/**
 * Tạo phần tử HTML với style
 * @param {string} type Loại phần tử (div, button, span, etc.)
 * @param {object} styles Đối tượng chứa style
 * @param {object} attributes Các thuộc tính khác
 * @param {string} textContent Nội dung văn bản
 * @param {Function} clickHandler Handler cho sự kiện click
 * @returns {HTMLElement} Phần tử HTML đã tạo
 */
function createElementWithStyles(type, styles = {}, attributes = {}, textContent = '', clickHandler = null) {
    const element = document.createElement(type);
    
    // Áp dụng style
    Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
    });
    
    // Áp dụng các thuộc tính
    Object.entries(attributes).forEach(([attr, value]) => {
        if (attr === 'className' || attr === 'class') {
            element.className = value;
        } else {
            element.setAttribute(attr, value);
        }
    });
    
    // Thêm nội dung văn bản
    if (textContent) {
        element.textContent = textContent;
    }
    
    // Thêm sự kiện click
    if (clickHandler) {
        element.addEventListener('click', clickHandler);
    }
    
    return element;
}

// Khởi tạo Album
function initPhotoAlbum() {
    // Khởi tạo lưu trữ thẻ
    initTags();
    
    // Đăng ký sự kiện cho nút mở Album
    const openAlbumButton = document.getElementById('openAlbum');
    if (openAlbumButton) {
        openAlbumButton.addEventListener('click', showPhotoAlbum);
    }
    
    // Đăng ký sự kiện cho nút chuyển Slideshow
    const slideshowBtn = document.getElementById('slideshowBtn');
    if (slideshowBtn) {
        slideshowBtn.addEventListener('click', () => {
            toggleSlideshowMode(true);
        });
    }
    
    // Đăng ký sự kiện cho nút đóng Slideshow
    const closeSlideBtn = document.getElementById('closeSlideshow');
    if (closeSlideBtn) {
        closeSlideBtn.addEventListener('click', () => {
            toggleSlideshowMode(false);
        });
    }
    
    // Đăng ký sự kiện cho nút đóng Album
    const closeAlbumBtn = document.createElement('button');
    closeAlbumBtn.id = 'closeAlbum';
    closeAlbumBtn.textContent = 'Đóng Album';
    closeAlbumBtn.className = 'close-album-btn';
    closeAlbumBtn.style.position = 'absolute';
    closeAlbumBtn.style.top = '10px';
    closeAlbumBtn.style.right = '10px';
    closeAlbumBtn.style.padding = '10px 15px';
    closeAlbumBtn.style.background = '#854D27';
    closeAlbumBtn.style.color = '#FFF9F3';
    closeAlbumBtn.style.border = '2px solid #D4B08C';
    closeAlbumBtn.style.borderRadius = '0';
    closeAlbumBtn.style.cursor = 'pointer';
    closeAlbumBtn.style.zIndex = '1000';
    closeAlbumBtn.addEventListener('click', hidePhotoAlbum);
    
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall && !document.getElementById('closeAlbum')) {
        memoryWall.appendChild(closeAlbumBtn);
    }
    
    // Tải media vào album khi trang web tải xong
    loadAlbumMedia();
    
    // Thêm nút tải lại sau khi tải xong
    setTimeout(() => {
        const gallery = document.getElementById('photoGallery');
        addRefreshButton(gallery);
    }, 1000);

    // Đăng ký sự kiện cho thanh tìm kiếm
    const searchInput = document.getElementById('searchTags');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchMediaByTag(e.target.value);
        });
    }

    // Đăng ký sự kiện unload để cleanup resource
    window.addEventListener('beforeunload', cleanupResources);
}

// Hàm hiển thị album ảnh
function showPhotoAlbum() {
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall) {
        // Đảm bảo CSS hoàn chỉnh
        memoryWall.style.position = 'fixed';
        memoryWall.style.top = '50%';
        memoryWall.style.left = '50%';
        memoryWall.style.transform = 'translate(-50%, -50%)';
        memoryWall.style.width = '80%';
        memoryWall.style.height = '80%';
        memoryWall.style.background = '#FFF9F3';
        memoryWall.style.border = '2px solid #D4B08C';
        memoryWall.style.zIndex = '2000';
        memoryWall.style.padding = '20px';
        memoryWall.style.overflowY = 'auto';
        memoryWall.style.boxShadow = '8px 8px 0 #D4B08C';
        
        // Hiệu ứng hiển thị
        memoryWall.style.display = 'block';
        memoryWall.style.opacity = '0'; 
        memoryWall.style.transition = 'opacity 0.3s ease';
        
        // Animation hiển thị
        setTimeout(() => {
            memoryWall.style.opacity = '1';
        }, 10);
    } else {
        console.error('Không tìm thấy phần tử #memoryWall');
    }
    
    // Tải lại dữ liệu media nếu cần
    loadAlbumMedia();
}

// Hàm ẩn album ảnh
function hidePhotoAlbum() {
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall) {
        memoryWall.style.opacity = '0';
        setTimeout(() => {
            memoryWall.style.display = 'none';
        }, 300);
    }
}

// Thêm nút tải lại cho Album
function addRefreshButton(gallery) {
    // Tìm statsInfo
    const statsInfo = document.getElementById('mediaStatsInfo');
    
    // Thêm nút tải lại vào statsInfo
    if (statsInfo) {
        const refreshButton = createButton('🔄 Tải lại', {
            padding: '5px 10px',
            fontSize: '0.9em',
            margin: '0 10px'
        }, () => {
            // Tải lại album với tham số forceRefresh = true
            loadAlbumMedia(true);
        });
        
        // Nếu đã có nút tải lại thì không thêm nữa
        if (!statsInfo.querySelector('button')) {
            statsInfo.firstChild.appendChild(refreshButton);
        }
    }
}

// Khởi tạo Swiper với xử lý tốt hơn
function initSlideshow() {
    // Không còn sử dụng Swiper nữa
}

// Khởi chạy khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra tồn tại của các phần tử cần thiết trước khi khởi tạo
    if (document.getElementById('photoGallery')) {
        initPhotoAlbum();
    }
    
    // Kiểm tra phiên bản nếu cần update cache
    const albumVersionKey = 'albumVersion';
    const currentVersion = '1.2.0'; // Tăng phiên bản do có thay đổi lớn ở slideshow
    const storedVersion = localStorage.getItem(albumVersionKey);
    
    if (storedVersion !== currentVersion) {
        // Version khác nhau, xóa cache
        invalidateCache();
        localStorage.setItem(albumVersionKey, currentVersion);
    }
});
