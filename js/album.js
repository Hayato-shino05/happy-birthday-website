const AlbumConfig = {
    supabaseStorageUrl: 'your-supabase-url/storage/v1/object/public/media/',
    mediaBucket: 'media',
    itemLimit: 100,
    itemOffset: 0,
    sortColumn: 'name',
    sortOrder: 'asc',
    cacheExpiryTime: 60000, 
    defaultErrorTimeout: 5000,
    defaultSuccessTimeout: 3000,
    slideshowDelay: 3000,     
    slideshowTransitionSpeed: 300 
};

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

const AlbumState = {
    mediaFilesLoaded: false,
    mediaFiles: [],
    isLoadingMedia: false,
    cacheTime: 0,
    mediaTags: {},
    currentPage: 1,
    itemsPerPage: 20,
    observers: [],
    slideshow: {
        active: false,
        currentIndex: 0,
        timer: null,
        slides: [],
        isPlaying: false
    }
};

function cleanupResources() {
    if (AlbumState.observers.length > 0) {
        AlbumState.observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        AlbumState.observers = [];
    }
    
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
        AlbumState.slideshow.timer = null;
    }
    
    invalidateCache();
}

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

#fullSizeMediaModal video {
    display: block;
    max-width: 90%;
    max-height: 80vh;
}

#fullSizeMediaModal button,
#fullSizeMediaModal .caption {
    z-index: 10002;
}

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

let swiperInstance = null;


async function getMediaStats(bucket = AlbumConfig.mediaBucket, useCache = true) {
    try {
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
        
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .list('', {
                limit: AlbumConfig.itemLimit,
                offset: (AlbumState.currentPage - 1) * AlbumState.itemsPerPage,
                sortBy: { column: AlbumConfig.sortColumn, order: AlbumConfig.sortOrder }
            });
        
        if (error) throw error;
        
        const filteredData = data.filter(file => file.name !== '.emptyFolderPlaceholder');
        
        const stats = {
            total: filteredData.length,
            images: filteredData.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length,
            videos: filteredData.filter(file => file.name.match(/\.(mp4|webm|mov|avi)$/i)).length,
            fileList: filteredData
        };
        
        AlbumState.cacheTime = now;
        
        return stats;
    } catch (error) {
        handleError(error, "メディア統計の取得エラー");
        throw error;
    }
}

function invalidateCache() {
    AlbumState.cacheTime = 0;
    AlbumState.mediaFiles = [];
    AlbumState.mediaFilesLoaded = false;
}

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
        const textElement = loadingElement.querySelector('span');
        if (textElement) textElement.textContent = message;
        
        if (progress >= 0) {
            const progressBar = document.getElementById('albumLoadingBar');
            if (progressBar) progressBar.style.width = `${progress}%`;
        }
    }
    
    return loadingElement;
}

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

function checkSupabaseInitialized() {
    if (typeof supabase === 'undefined') {
        handleError(new Error('Supabaseが初期化されていません'), 'データベース接続エラー', true);
        return false;
    }
    return true;
}

async function loadAlbumMedia(forceRefresh = false) {
    if (AlbumState.isLoadingMedia) {
        return;
    }
    
    if (!checkSupabaseInitialized()) {
        return;
    }
    
    AlbumState.isLoadingMedia = true;
    
    const gallery = document.getElementById('photoGallery');
    const slideshowWrapper = document.getElementById('slideshowWrapper');
    
    showLoadingProgress('アルバムデータを読み込み中...', 10);
    
    if (forceRefresh) {
        gallery.innerHTML = '';
        invalidateCache();
    }
    
    try {
        const stats = await getMediaStats(AlbumConfig.mediaBucket, !forceRefresh);
        showLoadingProgress('データを受信しました...', 40);
        
        let statsInfo = document.getElementById('mediaStatsInfo');
        if (!statsInfo) {
            statsInfo = createElementWithStyles('div', {}, { id: 'mediaStatsInfo' });
            statsInfo.innerHTML = `<div style="text-align: center; padding: 5px; margin-bottom: 10px; background: #f8f8f8;">
                <strong>アルバム統計:</strong> 合計 ${stats.total} ファイル (${stats.images} 画像, ${stats.videos} ビデオ)
            </div>`;
            
            if (gallery.firstChild) {
                gallery.insertBefore(statsInfo, gallery.firstChild);
            } else {
                gallery.appendChild(statsInfo);
            }
        } else {
            statsInfo.innerHTML = `<div style="text-align: center; padding: 5px; margin-bottom: 10px; background: #f8f8f8;">
                <strong>アルバム統計:</strong> 合計 ${stats.total} ファイル (${stats.images} 画像, ${stats.videos} ビデオ)
            </div>`;
        }
        
        const mediaFiles = stats.fileList;
        
        if (!mediaFiles || mediaFiles.length === 0) {
            const noDataMsg = createElementWithStyles('div', {
                textAlign: 'center',
                padding: '20px',
                color: '#8B4513',
                fontSize: '16px'
            }, {}, '画像またはビデオがありません。');
            
            gallery.appendChild(noDataMsg);
            hideLoadingProgress();
            AlbumState.isLoadingMedia = false;
            return;
        }
        
        AlbumState.mediaFiles = mediaFiles.map(file => file.name);
        AlbumState.mediaFilesLoaded = true;
        
        showLoadingProgress('メディアを表示中...', 70);
        
        const mediaItemsExist = gallery.querySelectorAll('.photo-item').length > 0;
        
        if (!mediaItemsExist || forceRefresh) {
            mediaFiles.forEach((file, index) => {
                if (file.name !== '.emptyFolderPlaceholder') {
                    setTimeout(() => {
                        renderPhotoItem(file.name, gallery);
                        
                        const progress = 70 + Math.floor(30 * (index + 1) / mediaFiles.length);
                        showLoadingProgress(`メディアを表示中 (${index+1}/${mediaFiles.length})...`, progress);
                        
                        if (index === mediaFiles.length - 1) {
                            addUploadButton(gallery);
                            hideLoadingProgress();
                        }
                    }, 0);
                }
            });
        } else {
            hideLoadingProgress();
        }
        
        if (document.getElementById('slideshowContainer').style.display === 'block') {
            renderSlideshow();
        }
    } catch (error) {
        handleError(error, 'Supabaseからの画像読み込みエラー', true);
        
        const errorMsg = createElementWithStyles('div', {
            textAlign: 'center',
            padding: '20px',
            color: '#721c24',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            margin: '20px 0'
        }, {}, 'Supabaseからデータを読み込めません。後で再試行してください。');
        
        gallery.innerHTML = '';
        gallery.appendChild(errorMsg);
    } finally {
        AlbumState.isLoadingMedia = false;
    }
}

function getFileType(fileName) {
    if (fileName.match(/\.(mp4|webm|mov|avi)$/i)) {
        return 'video';
    } else {
        return 'image';
    }
}

function createMediaElement(mediaPath, fileName, mediaType) {
    if (mediaType === 'video') {
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
        const img = createElementWithStyles('img', {}, {
            className: 'photo-item-media',
            src: mediaPath,
            alt: `Memory ${fileName}`,
            loading: 'lazy'
        });
        
        img.onerror = function() {
            console.error(`画像を読み込めません: ${mediaPath}`);
            img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22%23EEEEEE%22%20d%3D%22M0%200h400v300H0z%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2CSans-serif%22%20font-size%3D%2230%22%20font-weight%3D%22bold%22%20dy%3D%22.3em%22%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%3E画像を読み込めません%3C%2Ftext%3E%3C%2Fsvg%3E';
        };
        
        return img;
    }
}

async function getMediaTags(mediaPath) {
    try {
        if (!checkSupabaseInitialized()) {
            return [];
        }

        const { data, error } = await supabase
            .from('media_tags')
            .select('tags')
            .eq('media_path', mediaPath)
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                return [];
            }
            throw error;
        }
        
        return data?.tags || [];
    } catch (error) {
        handleError(error, `メディア ${mediaPath} のタグ取得エラー`);
        return [];
    }
}

async function saveMediaTags(mediaPath, tagsInput) {
    try {
        if (!checkSupabaseInitialized()) {
            return false;
        }

        const tags = tagsInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '')
            .slice(0, 5); 
        
        const { data: existingTags, error: fetchError } = await supabase
            .from('media_tags')
            .select('*')
            .eq('media_path', mediaPath);
            
        if (fetchError) throw fetchError;
        
        let result;
        if (existingTags && existingTags.length > 0) {
            const { error: updateError } = await supabase
                .from('media_tags')
                .update({ tags: tags })
                .eq('media_path', mediaPath);
                
            if (updateError) throw updateError;
            result = true;
        } else {
            const { error: insertError } = await supabase
                .from('media_tags')
                .insert([{ media_path: mediaPath, tags: tags }]);
                
            if (insertError) throw insertError;
            result = true;
        }
        
        return result;
    } catch (error) {
        handleError(error, `メディア ${mediaPath} のタグ保存エラー`, true);
        return false;
    }
}

async function displayTags(container, mediaPath) {
    try {
        const tags = await getMediaTags(mediaPath);
        
        const existingTagsContainer = container.querySelector('.tags-container');
        if (existingTagsContainer) {
            container.removeChild(existingTagsContainer);
        }
        
        if (tags && tags.length > 0) {
            const tagsContainer = createElementWithStyles('div', {}, { className: 'tags-container' });
            
            tags.forEach(tag => {
                const tagElement = createElementWithStyles('span', {}, { className: 'tag' }, tag);
                tagsContainer.appendChild(tagElement);
            });
            
            container.appendChild(tagsContainer);
        }
    } catch (error) {
        handleError(error, `メディア ${mediaPath} のタグ表示エラー`);
    }
}

function renderPhotoItem(index, gallery) {
    if (index === '.emptyFolderPlaceholder') {
        return;
    }
    
    const photoContainer = createElementWithStyles('div', {}, {
        className: 'photo-item',
        'data-mediaNumber': index,
        'data-index': index
    });
    
    const tagButton = createElementWithStyles('button', {}, {
        className: 'tag-button',
    }, '+', (e) => {
        e.stopPropagation();
        openTagModal(index);
    });
    
    photoContainer.appendChild(tagButton);
    
    const mediaPath = getMediaPath(index);
    
    displayTags(photoContainer, `memory/${index}`);
    
    const mediaType = getFileType(index);
    
    if (mediaType === 'video') {
        const video = createMediaElement(mediaPath, index, 'video');
        
        photoContainer.addEventListener('click', () => {
            openFullSizeMedia(video.src, index, 'video');
        });
        
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
            e.stopPropagation(); 
            openFullSizeMedia(video.src, index, 'video');
        });
        
        photoContainer.appendChild(playIcon);
        
        photoContainer.addEventListener('mouseenter', () => {
            video.play().catch(e => console.log('ビデオ自動再生が失敗しました'));
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
        const img = createMediaElement(mediaPath, index, 'image');
        
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
        photoGallery.style.display = 'none';
        slideshowContainer.style.display = 'block';
        
        AlbumState.slideshow.active = true;
        
        if (AlbumState.mediaFilesLoaded && AlbumState.mediaFiles.length > 0) {
            renderSlideshow();
        } else {
            showLoadingProgress("スライドショーデータを読み込み中...");
            loadAlbumMedia(false, () => {
                hideLoadingProgress();
                renderSlideshow();
            });
        }
    } else {
        stopSlideshow();
        AlbumState.slideshow.active = false;
        
        slideshowContainer.style.display = 'none';
        photoGallery.style.display = 'grid';
    }
}

function renderSlideshow() {
    const slideshowContainer = document.getElementById('slideshowContainer');
    if (!slideshowContainer) {
        handleError(new Error("スライドショーコンテナが見つかりません"), "スライドショー表示エラー");
        return;
    }

    slideshowContainer.innerHTML = '';
    
    if (!AlbumState.mediaFilesLoaded || !AlbumState.mediaFiles || AlbumState.mediaFiles.length === 0) {
        slideshowContainer.innerHTML = '<div class="error-message">スライドショーで表示するデータがありません</div>';
        return;
    }

    AlbumState.slideshow.slides = AlbumState.mediaFiles.filter(file => file !== '.emptyFolderPlaceholder');
    
    const slidesWrapper = document.createElement('div');
    slidesWrapper.className = 'slideshow-wrapper';
    slideshowContainer.appendChild(slidesWrapper);
    
    AlbumState.slideshow.slides.forEach((file, index) => {
        const slide = document.createElement('div');
        slide.className = 'slideshow-slide';
        if (index === 0) slide.classList.add('active'); 
        slidesWrapper.appendChild(slide);
        
        renderSlideItem(file, slide);
    });
    
    const prevButton = document.createElement('div');
    prevButton.className = 'slideshow-nav slideshow-prev';
    prevButton.innerHTML = '&#10094;';
    prevButton.addEventListener('click', () => navigateSlideshow('prev'));
    
    const nextButton = document.createElement('div');
    nextButton.className = 'slideshow-nav slideshow-next';
    nextButton.innerHTML = '&#10095;';
    nextButton.addEventListener('click', () => navigateSlideshow('next'));
    
    slideshowContainer.appendChild(prevButton);
    slideshowContainer.appendChild(nextButton);
    
    const pagination = document.createElement('div');
    pagination.className = 'slideshow-pagination';
    
    AlbumState.slideshow.slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'slideshow-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        pagination.appendChild(dot);
    });
    
    const controls = document.createElement('div');
    controls.className = 'slideshow-controls';
    
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'slideshow-button';
    playPauseBtn.textContent = 'Tạm dừng';
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'slideshow-button';
    closeBtn.textContent = 'スライドショーを閉じる';
    closeBtn.addEventListener('click', () => toggleSlideshowMode(false));
    
    controls.appendChild(playPauseBtn);
    controls.appendChild(pagination);
    controls.appendChild(closeBtn);
    
    slideshowContainer.appendChild(controls);
    
    AlbumState.slideshow.currentIndex = 0;
    startSlideshow();
}

function renderSlideItem(fileName, slide) {
    if (!fileName || fileName === '.emptyFolderPlaceholder') {
        return;
    }
    
    const mediaPath = getMediaPath(fileName);
    const mediaType = getFileType(fileName);
    
    const mediaContainer = createElementWithStyles('div', {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    });
    
    if (mediaType === 'video') {
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
        
        slide.addEventListener('transitionend', () => {
            if (slide.classList.contains('active')) {
                video.play().catch(e => console.log('ビデオ自動再生が失敗しました'));
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    } else {
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

function startSlideshow() {
    AlbumState.slideshow.isPlaying = true;
    
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
    }
    
    AlbumState.slideshow.timer = setTimeout(() => {
        navigateSlideshow('next');
    }, AlbumConfig.slideshowDelay);
}

function stopSlideshow() {
    AlbumState.slideshow.isPlaying = false;
    
    if (AlbumState.slideshow.timer) {
        clearTimeout(AlbumState.slideshow.timer);
        AlbumState.slideshow.timer = null;
    }
    
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
        playPauseBtn.textContent = '続行';
    } else {
        startSlideshow();
        playPauseBtn.textContent = '一時停止';
    }
}

function navigateSlideshow(direction) {
    let currentIndex = AlbumState.slideshow.currentIndex;
    let newIndex;
    
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % AlbumState.slideshow.slides.length;
    } else {
        newIndex = (currentIndex - 1 + AlbumState.slideshow.slides.length) % AlbumState.slideshow.slides.length;
    }
    
    goToSlide(newIndex);
}

function goToSlide(index) {
    AlbumState.slideshow.currentIndex = index;
    
    const slides = document.querySelectorAll('.slideshow-slide');
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    const dots = document.querySelectorAll('.slideshow-dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    const videos = document.querySelectorAll('#slideshowContainer video');
    videos.forEach((video, i) => {
        const slide = video.closest('.slideshow-slide');
        if (slide && slide.classList.contains('active')) {
            video.play().catch(e => console.log('ビデオ自動再生が失敗しました'));
        } else {
            video.pause();
            video.currentTime = 0;
        }
    });
    
    if (AlbumState.slideshow.isPlaying) {
        if (AlbumState.slideshow.timer) {
            clearTimeout(AlbumState.slideshow.timer);
        }
        
        AlbumState.slideshow.timer = setTimeout(() => {
            navigateSlideshow('next');
        }, AlbumConfig.slideshowDelay);
    }
}

function initTags() {
}

function createModal(id, styles = {}) {
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }
    
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
    
    document.body.appendChild(modal);
    
    return modal;
}

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
            parentElement.remove();
        }
    });
    
    parentElement.appendChild(closeBtn);
    return closeBtn;
}

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

function openFullSizeMedia(mediaUrl, mediaNumber, mediaType) {
    const modal = createModal('fullSizeMediaModal');

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
        
        mediaElement.addEventListener('loadedmetadata', () => {
            mediaElement.play().catch(e => handleError(e, 'ビデオ再生エラー'));
        });

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

    createCloseButton(modal, () => {
        if (mediaType === 'video' && mediaElement && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    const caption = createElementWithStyles('div', {
        position: 'absolute',
        bottom: '20px',
        color: 'white',
        fontSize: '18px',
        background: 'rgba(0,0,0,0.5)',
        padding: '5px 15px',
        borderRadius: '20px',
        zIndex: '10002'
    }, { className: 'caption' }, `${mediaType === 'video' ? 'ビデオ' : '画像'} ${mediaNumber}`);

    const tagBtn = createButton('タグ付け', {
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

    modal.addEventListener('click', () => {
        if (mediaType === 'video' && mediaElement && !mediaElement.paused) {
            mediaElement.pause();
        }
        modal.remove();
    });

    mediaElement.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function openTagModal(mediaIndex) {
    const tagModal = createModal('tagModalCustom', {
        display: 'flex'
    });
    tagModal.dataset.mediaIndex = mediaIndex;

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

    const closeBtn = createCloseButton(modalContent, () => {
        tagModal.style.display = 'none';
    });
    closeBtn.style.color = '#854D27';

    const title = createElementWithStyles('h2', {
        color: '#854D27',
        marginBottom: '20px',
        fontFamily: '\'DM Serif Display\', serif'
    }, {}, '画像/ビデオにタグ付け');

    const description = createElementWithStyles('p', {
        marginBottom: '20px'
    }, {}, 'タグを入力し、カンマで区切ってください（例：友達、誕生日）');

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
        placeholder: 'タグを入力...'
    });

    const submitBtn = createButton('タグを保存', {
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

    submitBtn.addEventListener('mouseover', () => {
        submitBtn.style.transform = 'translate(-2px, -2px)';
        submitBtn.style.boxShadow = '6px 6px 0 #D4B08C';
    });
    submitBtn.addEventListener('mouseout', () => {
        submitBtn.style.transform = 'none';
        submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
    });

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(description);
    modalContent.appendChild(tagInput);
    modalContent.appendChild(submitBtn);
    tagModal.appendChild(modalContent);

    getMediaTags(mediaIndex).then(tags => {
        if (tags && tags.length > 0) {
            tagInput.value = tags.join(', ');
        } else {
            tagInput.value = '';
        }
    }).catch(error => {
        handleError(error, 'タグの取得エラー');
        tagInput.value = '';
    });

    setTimeout(() => tagInput.focus(), 100);
}

async function searchMediaByTag(query) {
    try {
        if (!checkSupabaseInitialized()) {
            return;
        }

        const photoGallery = document.getElementById('photoGallery');
        const mediaItems = photoGallery.querySelectorAll('.photo-item');
        const searchTerm = query.toLowerCase().trim();

        if (searchTerm === '') {
            mediaItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }

        const { data: tagData, error } = await supabase
            .from('media_tags')
            .select('*');

        if (error) throw error;

        const tagsMap = {};
        if (tagData) {
            tagData.forEach(item => {
                tagsMap[item.media_path] = item.tags;
            });
        }

        mediaItems.forEach(item => {
            const mediaIndex = item.dataset.index;
            const tags = tagsMap[mediaIndex] || [];
            const matches = tags.some(tag => tag.toLowerCase().includes(searchTerm));
            item.style.display = matches ? 'block' : 'none';
        });
    } catch (error) {
        handleError(error, 'Supabaseでのタグ検索エラー', true);

        const photoGallery = document.getElementById('photoGallery');
        const mediaItems = photoGallery.querySelectorAll('.photo-item');
        mediaItems.forEach(item => {
            item.style.display = 'block';
        });
    }
}

async function saveTags(mediaIndex, tagsInput) {
    const result = await saveMediaTags(mediaIndex, tagsInput);

    if (result) {
        const photoItem = document.querySelector(`.photo-item[data-index="${mediaIndex}"]`);
        if (photoItem) {
            await displayTags(photoItem, mediaIndex);
        }
    }
}

async function uploadMediaFile(file, fileName, statusElement) {
    try {
        if (!checkSupabaseInitialized()) {
            throw new Error("Không thể kết nối tới Supabase");
        }

        statusElement.textContent = `アップロード中: ${file.name}`;

        const maxSize = 10 * 1024 * 1024; 
        if (file.size > maxSize) {
            throw new Error(`ファイルサイズが大きすぎます (${(file.size/1024/1024).toFixed(2)}MB)。上限は ${maxSize/1024/1024}MB です。`);
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            throw new Error(`サポートされていないファイル形式です。JPEG、PNG、GIF、WebP、MP4、WebM、QuickTimeのみサポートしています。`);
        }

        const { data, error } = await supabase.storage
            .from(AlbumConfig.mediaBucket)
            .upload(fileName, file);

        if (error) throw error;

        return true;
    } catch (error) {
        handleError(error, `ファイル ${fileName} のアップロードエラー`, true);
        return false;
    }
}

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

function updateUploadStatus(notification, message, type = 'progress') {
    notification.textContent = message;

    if (type === 'success') {
        notification.style.backgroundColor = '#d4edda';
        notification.style.borderColor = '#c3e6cb';
        notification.style.color = '#155724';

        setTimeout(() => {
            notification.remove();
        }, AlbumConfig.defaultSuccessTimeout);
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f8d7da';
        notification.style.borderColor = '#f5c6cb';
        notification.style.color = '#721c24';

        setTimeout(() => {
            notification.remove();
        }, AlbumConfig.defaultErrorTimeout);
    }
}

async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadStatus = createUploadStatusNotification();
    updateUploadStatus(uploadStatus, `${files.length}個のファイルのアップロードを準備中...`);

    try {
        if (!checkSupabaseInitialized()) {
            throw new Error("Supabase接続エラー");
        }

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `upload_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

            updateUploadStatus(uploadStatus, `アップロード中 (${i+1}/${files.length}): ${file.name}`);

            const success = await uploadMediaFile(file, fileName, uploadStatus);

            if (success) {
                successCount++;
            } else {
                failedCount++;
            }
        }

        let message = `${successCount}個のファイルのアップロードが成功しました！`;
        if (failedCount > 0) {
            message += ` (${failedCount}個のファイルが失敗)`;
        }

        updateUploadStatus(uploadStatus, message, 'success');

        loadAlbumMedia();
    } catch (error) {
        updateUploadStatus(uploadStatus, `エラー: ${error.message || 'ファイルをアップロードできません'}`, 'error');
    }
}

function addUploadButton(gallery) {
    const uploadContainer = createElementWithStyles('div', {}, {
        className: 'photo-item upload-item'
    });

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

    const uploadIcon = createElementWithStyles('div', {}, {});
    uploadIcon.innerHTML = '<img src="assets/icon/upload.png" alt="アップロード Icon" style="width: 100px; height: 100px;">';

    const uploadText = createElementWithStyles('div', {
        color: '#854D27',
        fontSize: '20px',
        fontWeight: 'bold',
        marginTop: '10px'
    }, {}, 'アップロード');

    const fileInput = createElementWithStyles('input', {
        display: 'none'
    }, {
        type: 'file',
        id: 'uploadMediaFile',
        name: 'uploadMediaFile',
        accept: 'image/*,video/*',
        multiple: true
    });

    mediaPlaceholder.appendChild(uploadIcon);
    mediaPlaceholder.appendChild(uploadText);
    uploadContainer.appendChild(mediaPlaceholder);
    uploadContainer.appendChild(fileInput);

    uploadContainer.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    uploadContainer.addEventListener('mouseenter', () => {
        uploadContainer.style.transform = 'scale(1.05)';
        uploadContainer.style.boxShadow = '6px 6px 15px rgba(139, 69, 19, 0.5)';
    });

    uploadContainer.addEventListener('mouseleave', () => {
        uploadContainer.style.transform = '';
        uploadContainer.style.boxShadow = '';
    });

    uploadContainer.style.border = '2px dashed #D4B08C';

    uploadContainer.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);

    gallery.appendChild(uploadContainer);
}

function getMediaPath(fileName) {
    return `${AlbumConfig.supabaseStorageUrl}${fileName}`;
}

function handleError(error, message, showToUser = false) {
    console.error(`${message}:`, error);

    if (showToUser) {
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
        errorNotification.textContent = `エラー: ${error.message || message}`;

        document.body.appendChild(errorNotification);

        setTimeout(() => {
            errorNotification.remove();
        }, AlbumConfig.defaultErrorTimeout);
    }

    return error; 
}

function createElementWithStyles(type, styles = {}, attributes = {}, textContent = '', clickHandler = null) {
    const element = document.createElement(type);

    Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
    });
    
    Object.entries(attributes).forEach(([attr, value]) => {
        if (attr === 'className' || attr === 'class') {
            element.className = value;
        } else {
            element.setAttribute(attr, value);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    if (clickHandler) {
        element.addEventListener('click', clickHandler);
    }
    
    return element;
}

function initPhotoAlbum() {

    initTags();
    
    const openAlbumButton = document.getElementById('openAlbum');
    if (openAlbumButton) {
        openAlbumButton.addEventListener('click', showPhotoAlbum);
    }
    
    const slideshowBtn = document.getElementById('slideshowBtn');
    if (slideshowBtn) {
        slideshowBtn.addEventListener('click', () => {
            toggleSlideshowMode(true);
        });
    }
    
    const closeSlideBtn = document.getElementById('closeSlideshow');
    if (closeSlideBtn) {
        closeSlideBtn.addEventListener('click', () => {
            toggleSlideshowMode(false);
        });
    }
    
    const closeAlbumBtn = document.createElement('button');
    closeAlbumBtn.id = 'closeAlbum';
    closeAlbumBtn.textContent = 'アルバムを閉じる';
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
    
    loadAlbumMedia();
    
    setTimeout(() => {
        const gallery = document.getElementById('photoGallery');
        addRefreshButton(gallery);
    }, 1000);

    const searchInput = document.getElementById('searchTags');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchMediaByTag(e.target.value);
        });
    }

    window.addEventListener('beforeunload', cleanupResources);
}

function showPhotoAlbum() {
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall) {
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
        
        memoryWall.style.display = 'block';
        memoryWall.style.opacity = '0'; 
        memoryWall.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            memoryWall.style.opacity = '1';
        }, 10);
    } else {
        console.error('#memoryWall要素が見つかりません');
    }
    
    loadAlbumMedia();
}

function hidePhotoAlbum() {
    const memoryWall = document.getElementById('memoryWall');
    if (memoryWall) {
        memoryWall.style.opacity = '0';
        setTimeout(() => {
            memoryWall.style.display = 'none';
        }, 300);
    }
}

function addRefreshButton(gallery) {

    const statsInfo = document.getElementById('mediaStatsInfo');
    
    if (statsInfo) {
        const refreshButton = createButton('🔄 再読み込み', {
            padding: '5px 10px',
            fontSize: '0.9em',
            margin: '0 10px'
        }, () => {
            loadAlbumMedia(true);
        });
        
        if (!statsInfo.querySelector('button')) {
            statsInfo.firstChild.appendChild(refreshButton);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {

    if (document.getElementById('photoGallery')) {
        initPhotoAlbum();
    }
    
    const albumVersionKey = 'albumVersion';
    const currentVersion = '1.2.0'; 
    const storedVersion = localStorage.getItem(albumVersionKey);
    
    if (storedVersion !== currentVersion) {
        invalidateCache();
        localStorage.setItem(albumVersionKey, currentVersion);
    }
});
