// ===== テーマ設定 =====
/**
 * すべてのテーマ関連設定のための中央集権化された設定オブジェクト
 * アプリケーション全体でハードコードされた値を置き換え、保守性を向上させます
 * @namespace THEME_CONFIG
 */
const THEME_CONFIG = {
    /**
     * テーマ名がサポートされているか検証します
     * @param {string} theme - 検証するテーマ名
     * @returns {boolean} テーマが有効な場合はtrue
     */
    isValidTheme(theme) {
        return this.allThemeClasses.includes(theme);
    },
    
    /**
     * 言語コードがサポートされているか検証します
     * @param {string} lang - 検証する言語コード
     * @returns {boolean} 言語が有効な場合はtrue
     */
    isValidLanguage(lang) {
        return translations && translations[lang];
    },
    
    /**
     * 検証済みのテーマ名をフォールバック付きで返します
     * @param {string} theme - 検証するテーマ名
     * @returns {string} 有効なテーマ名、またはフォールバックとして'spring'
     */
    getValidatedTheme(theme) {
        if (!theme || !this.isValidTheme(theme)) {
            console.warn(`無効なテーマ'${theme}'、'spring'にフォールバックします`);
            return 'spring';
        }
        return theme;
    },
    
    themeNames: {
        hanami: '花見',
        obon: 'お盆',
        tsukimi: '月見',
        christmas: 'クリスマス',
        halloween: 'ハロウィン',
        tanabata: '七夕',
        shogatsu: 'お正月',
        kodomo: 'こどもの日',
        bunka: '文化の日',
        spring: '春',
        summer: '夏',
        autumn: '秋',
        winter: '冬'
    },
    
    videoSources: {
        spring: 'video/spring.mp4',
        summer: 'video/summer.mp4',
        autumn: 'video/autumn.mp4',
        winter: 'video/winter.mp4',
        hanami: ['video/hanami.mov', 'video/hanami-2.mp4'],
        christmas: 'video/christmas.mp4',
        halloween: 'video/halloween.mp4',
        obon: 'video/obon.mp4',
        tsukimi: 'video/tsukimi.mp4',
        tanabata: 'video/tanabata.mp4',
        shogatsu: 'video/shogatsu.mp4',
        kodomo: 'video/kodomo.mp4',
        bunka: 'video/bunka.mp4'
    },
    
    fallbackVideoSources: {
        christmas: 'https://cdn.pixabay.com/vimeo/403565117/snowfall-22544.mp4',
        halloween: 'https://cdn.pixabay.com/vimeo/474265737/fog-54278.mp4',
        obon: 'https://cdn.pixabay.com/vimeo/353997337/lanterns-14022.mp4',
        tsukimi: 'https://cdn.pixabay.com/vimeo/330326136/moon-8312.mp4',
        tanabata: 'https://cdn.pixabay.com/vimeo/353997337/lanterns-14022.mp4',
        shogatsu: 'https://cdn.pixabay.com/vimeo/567444566/lanterns-92722.mp4'
    },
    
    effects: {
        autumn: [{ type: 'fallingLeaves', count: 40 }],
        tsukimi: [{ type: 'fallingLeaves', count: 40 }],
        spring: [{ type: 'fallingPetals', count: 30 }],
        hanami: [{ type: 'fallingPetals', count: 30 }],
        summer: [{ type: 'heatWave', count: 1 }, { type: 'sunGlare', count: 5 }],
        winter: [{ type: 'fallingSnow', count: 50 }],
        christmas: [{ type: 'christmasLights', count: 30 }],
        halloween: [{ type: 'bats', count: 10 }, { type: 'ghosts', count: 5 }],
        obon: [{ type: 'floatingLanterns', count: 20 }],
        tanabata: [{ type: 'floatingLanterns', count: 15 }, { type: 'fallingPetals', count: 20 }],
        shogatsu: [{ type: 'fireworks', count: 8 }, { type: 'floatingLanterns', count: 10 }],
        kodomo: [{ type: 'fallingPetals', count: 25 }],
        bunka: [{ type: 'fallingLeaves', count: 30 }]
    },
    
    festivalDates: {
        christmas: { month: 12, startDate: 20, endDate: 25 },
        halloween: { month: 10, startDate: 28, endDate: 31 },
        hanami: [
            { month: 3, startDate: 20, endDate: 31 },
            { month: 4, startDate: 1, endDate: 30 },
            { month: 5, startDate: 1, endDate: 10 }
        ],
        obon: { month: 8, startDate: 13, endDate: 16 },
        tsukimi: [
            { month: 9, startDate: 15, endDate: 30 },
            { month: 10, startDate: 1, endDate: 15 }
        ],
        tanabata: { month: 7, startDate: 1, endDate: 7 },
        shogatsu: { month: 1, startDate: 1, endDate: 7 },
        kodomo: { month: 5, startDate: 1, endDate: 5 },
        bunka: { month: 11, startDate: 1, endDate: 7 }
    },
    

    seasonDates: {
        spring: { months: [3, 4, 5] },
        summer: { months: [6, 7, 8] },
        autumn: { months: [9, 10, 11] },
        winter: { months: [12, 1, 2] }
    },
    
    /**
     * 指定された日付で祭りがアクティブかどうかを確認します
     * @param {string} festivalKey - 祭りの識別子
     * @param {number} month - 月 (1-12)
     * @param {number} date - 日
     * @returns {boolean} 祭りがアクティブな場合はtrue
     */
    isFestivalActive(festivalKey, month, date) {
        const festivalConfig = this.festivalDates[festivalKey];
        if (!festivalConfig) return false;
        
        // 日付範囲の配列を処理します（複数月にまたがる祭り）
        if (Array.isArray(festivalConfig)) {
            return festivalConfig.some(range => 
                month === range.month && date >= range.startDate && date <= range.endDate
            );
        }
        
        // 単一の日付範囲を処理します
        return month === festivalConfig.month && 
               date >= festivalConfig.startDate && 
               date <= festivalConfig.endDate;
    },
    
    allThemeClasses: ['spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween', 'hanami', 'obon', 'tsukimi', 'tanabata', 'shogatsu', 'kodomo', 'bunka']
};

const translations = {
    ja: {
        title: "お誕生日おめでとうございます",
        countdownTitle: "誕生日までのカウントダウン",
        countdownTemplate: "の誕生日までのカウントダウン",
        days: "日",
        hours: "時間",
        minutes: "分",
        seconds: "秒",
        blowButton: "ろうそくを吹き消して！",
        micPermission: "マイクの使用を許可する",
        birthdayMessageDefault: "お誕生日おめでとうございます！喜びと幸せに満ちた一日になりますように！",
        birthdayMessageSuccess: "お誕生日おめでとうございます！🎉<br>ろうそくを吹き消しました！<br>すべての願いが叶いますように！",
        
        albumButton: "📸 思い出のアルバムを見る",
        memoryGame: "🎮 神経衰弱",
        puzzleGame: "🧩 パズル",
        birthdayCalendar: "📅 誕生日カレンダー",
        birthdayQuiz: "❓ 誕生日クイズ",
        customMessage: "✍️ お祝いメッセージ",
        bulletinBoard: "📋 お祝い掲示板",
        groupChat: "💬 グループチャット",
        inviteFriends: "👥 友達を招待",
        selectMusic: "🎵 音楽を選ぶ",
        
        songTitle: "ハッピーバースデーソング",
        
        searchPlaceholder: "タグで検索...",
        slideshow: "▶️ スライドショー",
        closeslideshow: "スライドショーを閉じる",
        
        bulletinBoardTitle: "お誕生日お祝い掲示板",
        selectVirtualGift: "🎁 バーチャルギフトを選ぶ",
        sendGift: "ギフトを送る",
        sendMessage: "メッセージを送る",
        namePlaceholder: "お名前...",
        messagePlaceholder: "メッセージを入力してください...",
        
        languageJapanese: "日本語",
        languageEnglish: "English",
        
        inviteModalTitle: "Invite Friends to Join the Celebration",
        inviteModalDescription: "Invite friends to celebrate {person}'s birthday{date} together! Let's create wonderful memories and send heartfelt birthday messages.",
        inviteLink: "Invitation Link:",
        copyButton: "📋 Copy",
        copyComplete: "✓ Copied",
        shareLabel: "Share:",
        emailInviteLabel: "Send invitation by email:",
        emailPlaceholder: "Recipient's email address...",
        messagePlaceholder2: "Personal message (optional)...",
        sendInvite: "📧 Send Invitation",
        enterEmailAlert: "Please enter recipient's email address!",
        
        countdownNotification: "{days} days, {hours} hours, {minutes} minutes, {seconds} seconds until birthday!",
        
        closeAlbum: "Close Album",
        
        customMessageTitle: "Enter Birthday Message",
        recordMessage: "🎤 Record Message",
        recordVideo: "🎥 Record Video", 
        recordMessageTitle: "Record Birthday Message",
        recordVideoTitle: "Record Birthday Video",
        viewVideoMessages: "🎥 View Video Messages",
        videoSavedAlert: "Birthday video saved successfully!",
        noVideoMessages: "No video messages yet.",
        videoFromSender: "Birthday Video from {sender}",
        birthdayVideoTitle: "Birthday Videos for {person}",
        
        shareECardText: "Copy link to share birthday card:",
        copyLinkButton: "Copy Link",
        linkCopied: "✓ Link Copied",
        
        inviteModalTitle: "Invite Friends to Join the Celebration",
        inviteModalDescription: "Invite friends to celebrate {person}'s birthday{date} together! Let's create wonderful memories and send heartfelt birthday messages.",
        inviteLink: "Invitation Link:",
        copyButton: "📋 Copy",
        copyComplete: "✓ Copied",
        shareLabel: "Share:",
        emailInviteLabel: "Send invitation by email:",
        emailPlaceholder: "Recipient's email address...",
        messagePlaceholder2: "Personal message (optional)...",
        sendInvite: "📧 Send Invitation", 
        enterEmailAlert: "Please enter recipient's email address!",
        
        countdownNotification: "{days} days, {hours} hours, {minutes} minutes, {seconds} seconds until birthday!",
        
        closeAlbum: "Close Album",
        
        customMessageTitle: "Enter Birthday Message",
        recordMessage: "🎤 Record Message",
        recordVideo: "🎥 Record Video",
        recordMessageTitle: "Record Birthday Message",
        recordVideoTitle: "Record Birthday Video",
        viewVideoMessages: "🎥 View Video Messages",
        videoSavedAlert: "Birthday video saved successfully!",
        noVideoMessages: "No video messages yet.",
        videoFromSender: "Birthday Video from {sender}",
        birthdayVideoTitle: "Birthday Videos for {person}",
        
        shareECardText: "Copy link to share birthday card:",
        copyLinkButton: "Copy Link",
        linkCopied: "✓ Link Copied"
    },
    en: {
        title: "Happy Birthday",
        countdownTitle: "Countdown to Birthday",
        countdownTemplate: "'s Birthday Countdown",
        days: "Days",
        hours: "Hours",
        minutes: "Minutes",
        seconds: "Seconds",
        blowButton: "Blow the Candles!",
        micPermission: "Allow Microphone Access",
        birthdayMessageDefault: "Happy Birthday! Wishing you a day full of joy and happiness!",
        birthdayMessageSuccess: "Happy Birthday! 🎉<br>You've successfully blown out the candles!<br>May all your wishes come true!",
        
        albumButton: "📸 View Memory Album",
        memoryGame: "🎮 Memory Game",
        puzzleGame: "🧩 Puzzle Game",
        birthdayCalendar: "📅 Birthday Calendar",
        birthdayQuiz: "❓ Birthday Quiz",
        customMessage: "✍️ Birthday Message",
        bulletinBoard: "📋 Birthday Board",
        groupChat: "💬 Group Chat",
        inviteFriends: "👥 Invite Friends",
        selectMusic: "🎵 Select Music",
        
        songTitle: "Happy Birthday Song",
        
        searchPlaceholder: "Search by tags...",
        slideshow: "▶️ Slideshow",
        closeslideshow: "Close Slideshow",
        
        bulletinBoardTitle: "Birthday Celebration Board",
        selectVirtualGift: "🎁 Select Virtual Gift",
        sendGift: "Send Gift",
        sendMessage: "Send Message",
        namePlaceholder: "Your name...",
        messagePlaceholder: "Enter your message...",
        
        languageJapanese: "日本語",
        languageEnglish: "English"
    }
};

/**
 * 検証付きでUI要素に言語設定を適用します
 * 指定された言語がサポートされていない場合、日本語にフォールバックします
 * @param {string} lang - 言語コード ('en', 'ja')
 */
function applyLanguage(lang) {
    // 検証：langが有効かチェック
    if (!lang || !translations[lang]) {
        console.warn(`言語'${lang}'はサポートされていません。'ja'にフォールバックします`);
        lang = 'ja'; 
    }
    
    const t = translations[lang];
    
    const birthdayTitle = document.getElementById('birthdayTitle');
    const blowButton = document.getElementById('blowButton');
    const micPermissionBtn = document.getElementById('micPermissionBtn');
    const birthdayMessage = document.getElementById('birthdayMessage');
    const songTitle = document.querySelector('.song-title');
    
    if (birthdayTitle) birthdayTitle.textContent = t.title;
    if (blowButton) blowButton.textContent = t.blowButton;
    if (micPermissionBtn) micPermissionBtn.textContent = t.micPermission;
    if (birthdayMessage && !birthdayMessage.innerHTML.includes('<br>')) {
        birthdayMessage.textContent = t.birthdayMessageDefault;
    }
    if (songTitle) songTitle.textContent = t.songTitle;
    
    const openAlbum = document.getElementById('openAlbum');
    const startMemoryGame = document.getElementById('startMemoryGame');
    const startPuzzleGame = document.getElementById('startPuzzleGame');
    const openCalendar = document.getElementById('openCalendar');
    const startBirthdayQuiz = document.getElementById('startBirthdayQuiz');
    const customMessageBtn = document.getElementById('customMessageBtn');
    const bulletinBoardBtn = document.getElementById('bulletinBoardBtn');
    
    if (openAlbum) openAlbum.textContent = t.albumButton;
    if (startMemoryGame) startMemoryGame.textContent = t.memoryGame;
    if (startPuzzleGame) startPuzzleGame.textContent = t.puzzleGame;
    if (openCalendar) openCalendar.textContent = t.birthdayCalendar;
    if (startBirthdayQuiz) startBirthdayQuiz.textContent = t.birthdayQuiz;
    if (customMessageBtn) customMessageBtn.textContent = t.customMessage;
    if (bulletinBoardBtn) bulletinBoardBtn.textContent = t.bulletinBoard;
    
    const openChatBtn = document.getElementById('openChatBtn');
    const inviteFriendsBtn = document.getElementById('inviteFriendsBtn');
    const musicSelectionBtn = document.getElementById('musicSelectionBtn');
    
    if (openChatBtn) openChatBtn.textContent = t.groupChat;
    if (inviteFriendsBtn) inviteFriendsBtn.textContent = t.inviteFriends;
    if (musicSelectionBtn) musicSelectionBtn.textContent = t.selectMusic;
    
    const searchTags = document.getElementById('searchTags');
    const slideshowBtn = document.getElementById('slideshowBtn');
    const closeSlideshow = document.getElementById('closeSlideshow');
    
    if (searchTags) searchTags.placeholder = t.searchPlaceholder;
    if (slideshowBtn) slideshowBtn.textContent = t.slideshow;
    if (closeSlideshow) closeSlideshow.textContent = t.closeslideshow;
    
    const bulletinBoardTitle = document.querySelector('.bulletin-board-modal h2');
    const selectGiftBtn = document.getElementById('selectGiftBtn');
    const submitPost = document.getElementById('submitPost');
    const submitGift = document.getElementById('submitGift');
    const submitCustomMessage = document.getElementById('submitCustomMessage');
    const customMessageTitle = document.getElementById('customMessageTitle');
    
    if (bulletinBoardTitle) bulletinBoardTitle.textContent = t.bulletinBoardTitle;
    if (selectGiftBtn) selectGiftBtn.textContent = t.selectVirtualGift;
    if (submitPost) submitPost.textContent = t.sendGift;
    if (submitGift) submitGift.textContent = t.sendGift;
    if (submitCustomMessage) submitCustomMessage.textContent = t.sendMessage;
    if (customMessageTitle) customMessageTitle.textContent = t.customMessageTitle;
    
    const giftSender = document.getElementById('giftSender');
    const customMessageInput = document.getElementById('customMessageInput');
    
    if (giftSender) giftSender.placeholder = t.namePlaceholder;
    if (customMessageInput) customMessageInput.placeholder = t.messagePlaceholder;
    
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        const jaOption = languageSelect.querySelector('option[value="ja"]');
        const enOption = languageSelect.querySelector('option[value="en"]');
        if (jaOption) jaOption.textContent = t.languageJapanese;
        if (enOption) enOption.textContent = t.languageEnglish;
    }
    
    updateCountdownLanguage(lang);
    
    updateDynamicButtonsLanguage(lang);
    
    updateInviteModalLanguage(lang);
    updateCustomMessageModalLanguage(lang);
    updateAlbumLanguage(lang);
    
    localStorage.setItem('language', lang);
    console.log(`適用された言語: ${lang}`);
}

/**
 * カウントダウンのテキストを現在の言語で更新します
 * @param {string} lang - 言語コード
 */
function updateCountdownLanguage(lang) {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement || !translations[lang]) return;
    
    const t = translations[lang];
    
    const titleElement = countdownElement.querySelector('h1');
    if (titleElement) {
        const personName = titleElement.dataset.person;
        if (personName) {
            titleElement.textContent = personName + t.countdownTemplate;
        }
    }
    
    const timeDiv = countdownElement.querySelector('.time');
    if (timeDiv) {
        const unitDivs = timeDiv.querySelectorAll('div > div:last-child');
        if (unitDivs.length >= 4) {
            unitDivs[0].textContent = t.days;
            unitDivs[1].textContent = t.hours;
            unitDivs[2].textContent = t.minutes;
            unitDivs[3].textContent = t.seconds;
        }
    }
}

/**
 * 動的に作成されたボタンのテキストを更新します
 * @param {string} lang - 言語コード
 */
function updateDynamicButtonsLanguage(lang) {
    if (!translations[lang]) return;
    
    const t = translations[lang];
    
    const openChatBtn = document.getElementById('openChatBtn');
    const inviteFriendsBtn = document.getElementById('inviteFriendsBtn');
    const selectMusicBtn = document.getElementById('selectMusicBtn');
    
    if (openChatBtn) openChatBtn.textContent = t.groupChat;
    if (inviteFriendsBtn) inviteFriendsBtn.textContent = t.inviteFriends;
    if (selectMusicBtn) selectMusicBtn.textContent = t.selectMusic;
    
    const musicModalTitle = document.querySelector('.music-modal-title');
    if (musicModalTitle) musicModalTitle.textContent = t.selectMusic;
}

/**
 * 現在の日付に基づいて現在の季節と祭りを検出します
 * 両方が適用される場合、祭りを季節より優先します
 * 日付範囲と検証にはTHEME_CONFIGを使用します
 * @returns {string} テーマ名（祭りまたは季節）
 */
function detectSeasonAndFestival() {
    const now = new Date();
    const month = now.getMonth() + 1; // 月は1-12
    const date = now.getDate();
    let theme = 'default';
    
    console.log(`日付のテーマを検出中: ${month}/${date}`);
    
    // 祭りを先に決定（季節より優先）
    const festivals = ['christmas', 'halloween', 'hanami', 'obon', 'tsukimi', 'tanabata', 'shogatsu', 'kodomo', 'bunka'];
    
    for (const festival of festivals) {
        if (THEME_CONFIG.isFestivalActive(festival, month, date)) {
            theme = festival;
            console.log(`祭りを検出しました: ${festival}`);
            break;
        }
    }
    
    // 祭りがなければ、気候に基づいて季節を決定
    if (theme === 'default') {
        for (const [season, config] of Object.entries(THEME_CONFIG.seasonDates)) {
            if (config.months.includes(month)) {
                theme = season;
                console.log(`季節を検出しました: ${season}`);
                break;
            }
        }
    }
    
    return theme;
}

function applyTheme(theme) {
    theme = THEME_CONFIG.getValidatedTheme(theme);
    
    const body = document.body;
    const countdown = document.querySelector('.countdown');
    
    const themeEffects = document.querySelectorAll('.theme-effect');
    themeEffects.forEach(effect => effect.remove());
    
    const balloonContainer = document.getElementById('balloonContainer');
    if (balloonContainer) {
        balloonContainer.innerHTML = '';
    }
    
    body.classList.remove(...THEME_CONFIG.allThemeClasses);
    if (countdown) {
        countdown.classList.remove(...THEME_CONFIG.allThemeClasses);
    }
    
    body.classList.add(theme);
    if (countdown) {
        countdown.classList.add(theme);
    }
    
    applyVideoBackground(theme, body);
    
    const effectsConfig = THEME_CONFIG.effects[theme];
    if (effectsConfig) {
        console.log(`${theme}のエフェクトを作成中:`, effectsConfig);
        effectsConfig.forEach(effect => {
            switch(effect.type) {
                case 'fallingLeaves':
                    createFallingLeaves(effect.count, theme);
                    break;
                case 'fallingPetals':
                    createFallingPetals(effect.count, theme);
                    break;
                case 'heatWave':
                    createHeatWave(theme);
                    break;
                case 'sunGlare':
                    createSunGlare(theme);
                    break;
                case 'fallingSnow':
                    createFallingSnow(effect.count, theme);
                    break;
                case 'christmasLights':
                    createChristmasLights(effect.count, theme);
                    break;
                case 'fireworks':
                    createFireworks(effect.count, theme);
                    break;
                case 'bats':
                    createBats(effect.count, theme);
                    break;
                case 'ghosts':
                    createGhosts(effect.count, theme);
                    break;
                case 'floatingLanterns':
                    createFloatingLanterns(effect.count, theme);
                    break;
                default:
                    console.warn(`不明なエフェクトタイプ: ${effect.type}`);
            }
        });
    }
    
    const themeIndicator = document.createElement('div');
    themeIndicator.className = 'theme-indicator';
    
    const themeText = THEME_CONFIG.themeNames[theme] || theme.charAt(0).toUpperCase() + theme.slice(1);
    themeIndicator.textContent = `現在のテーマ: ${themeText}`;
    body.appendChild(themeIndicator);
    
    console.log(`テーマを適用しました: ${theme}`);
}

function applyVideoBackground(theme, body) {
    const videoConfig = THEME_CONFIG.videoSources[theme];
    if (!videoConfig) {
        console.warn(`テーマのビデオ設定が見つかりません: ${theme}`);
        return;
    }
    
    let videoSource = '';
    
    if (Array.isArray(videoConfig)) {
        const lastHanamiUsed = localStorage.getItem('lastHanamiVideo') || videoConfig[0];
        const currentIndex = videoConfig.indexOf(lastHanamiUsed);
        const nextIndex = (currentIndex + 1) % videoConfig.length;
        videoSource = videoConfig[nextIndex];
        localStorage.setItem('lastHanamiVideo', videoSource);
    } else {
        videoSource = videoConfig;
    }

    const oldVideos = body.querySelectorAll('.video-background');
    oldVideos.forEach(video => video.remove());
    
    const video = document.createElement('video');
    video.className = 'video-background';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;

    video.onerror = function() {
        const fallbackSource = THEME_CONFIG.fallbackVideoSources[theme];
        if (fallbackSource) {
            console.log(`ローカルビデオが利用できません、オンラインビデオを使用: ${fallbackSource}`);
            video.src = fallbackSource;
        } else {
            console.warn(`テーマのフォールバックビデオがありません: ${theme}`);
        }
    };

    video.src = videoSource;
    body.insertBefore(video, body.firstChild);
    console.log(`テーマのビデオ背景を適用: ${theme}, ソース: ${videoSource}`);
}

function createHeatWave(theme) {
    const heatWave = document.createElement('div');
    heatWave.className = 'theme-effect heat-wave';
    document.body.appendChild(heatWave);
    console.log('熱波エフェクトを作成:', theme);
}

function createSunGlare(theme) {
    for (let i = 0; i < 5; i++) {
        const glare = document.createElement('div');
        glare.className = 'theme-effect sun-glare';
        glare.style.left = `${Math.random() * 80 + 10}vw`;
        glare.style.top = `${Math.random() * 50}vh`;
        glare.style.width = `${Math.random() * 100 + 50}px`;
        glare.style.height = `${Math.random() * 100 + 50}px`;
        glare.style.animationDuration = `${Math.random() * 2 + 2}s`;
        glare.style.animationDelay = `${Math.random() * 3}s`;
        document.body.appendChild(glare);
    }
    console.log('太陽のきらめきエフェクトを作成:', theme);
}

function createBats(count, theme) {
    for (let i = 0; i < count; i++) {
        const bat = document.createElement('div');
        bat.className = 'theme-effect bat';
        bat.style.left = `${Math.random() * 80 + 10}vw`;
        bat.style.top = `${Math.random() * 30 + 10}vh`;
        bat.style.width = `${Math.random() * 20 + 10}px`;
        bat.style.height = `${Math.random() * 10 + 5}px`;
        bat.style.animationDuration = `${Math.random() * 3 + 3}s`;
        bat.style.animationDelay = `${Math.random() * 3}s`;
        document.body.appendChild(bat);
    }
    console.log('コウモリエフェクトを作成:', theme);
}

function createFallingPetals(count, theme) {
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'theme-effect petal';
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.top = `${Math.random() * -50}vh`;
        petal.style.width = `${Math.random() * 10 + 5}px`;
        petal.style.height = `${Math.random() * 10 + 5}px`;
        petal.style.animationDuration = `${Math.random() * 5 + 5}s`;
        petal.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(petal);
    }
    console.log('桜の花びらエフェクトを作成:', theme);
}

function createFallingLeaves(count, theme) {
    const autumnColors = ['#FF4500', '#FF8C00', '#A52A2A', '#8B0000', '#CD5C5C', '#B22222', '#FF6347', '#DC143C', '#E25822', '#D2691E'];
    const leafShapes = ['0 50% 0 50%', '50% 0 50% 50%', '50% 50% 0 50%', '30% 70% 70% 30%'];
    
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'theme-effect leaf';
        leaf.style.left = `${Math.random() * 100}vw`;
        leaf.style.top = `${Math.random() * -50}vh`;
        
        const size = Math.random() * 15 + 5;
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size * 0.8}px`;
        
        leaf.style.backgroundColor = autumnColors[Math.floor(Math.random() * autumnColors.length)];
        leaf.style.borderRadius = leafShapes[Math.floor(Math.random() * leafShapes.length)];
        
        const fallDuration = Math.random() * 8 + 7;
        const swayDuration = Math.random() * 3 + 2;
        leaf.style.animationDuration = `${fallDuration}s, ${swayDuration}s, ${swayDuration * 1.5}s`;
        leaf.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 2}s, ${Math.random() * 3}s`;
        
        document.body.appendChild(leaf);
    }
    console.log('落ち葉エフェクトを作成:', theme);
}

function createFallingSnow(count, theme) {
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'theme-effect snowflake';
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.top = `${Math.random() * -50}vh`;
        snowflake.style.width = `${Math.random() * 5 + 2}px`;
        snowflake.style.height = `${Math.random() * 5 + 2}px`;
        snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(snowflake);
    }
    console.log('雪のエフェクトを作成:', theme);
}

function createFloatingLanterns(count, theme) {
    for (let i = 0; i < count; i++) {
        const lantern = document.createElement('div');
        lantern.className = 'theme-effect lantern';
        lantern.style.left = `${Math.random() * 80 + 10}vw`;
        lantern.style.top = `${Math.random() * 60 + 20}vh`;
        lantern.style.width = `${Math.random() * 20 + 10}px`;
        lantern.style.height = `${Math.random() * 30 + 15}px`;
        lantern.style.animationDuration = `${Math.random() * 3 + 3}s`;
        lantern.style.animationDelay = `${Math.random() * 3}s`;
        document.body.appendChild(lantern);
    }
    console.log('提灯エフェクトを作成:', theme);
}

function createChristmasLights(count, theme) {
    for (let i = 0; i < count; i++) {
        const light = document.createElement('div');
        light.className = 'theme-effect christmas-light';
        light.style.left = `${Math.random() * 80 + 10}vw`;
        light.style.top = `${Math.random() * 30}vh`;
        light.style.backgroundColor = ['#FF0000', '#00FF00', '#FFFF00'][Math.floor(Math.random() * 3)];
        light.style.animationDuration = `${Math.random() * 1 + 1}s`;
        light.style.animationDelay = `${Math.random() * 2}s`;
        document.body.appendChild(light);
    }
    console.log('クリスマスライトエフェクトを作成:', theme);
}

function createFireworks(count, theme) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'theme-effect firework';
            firework.style.left = `${Math.random() * 80 + 10}vw`;
            firework.style.top = `${Math.random() * 50 + 20}vh`;
            firework.style.backgroundColor = ['#FF0000', '#FFD700', '#00FF00'][Math.floor(Math.random() * 3)];
            document.body.appendChild(firework);
            
            setTimeout(() => firework.remove(), 2000);
        }, Math.random() * 5000);
    }
    setTimeout(() => createFireworks(count, theme), 10000);
    console.log('花火エフェクトを作成:', theme);
}

function createGhosts(count, theme) {
    for (let i = 0; i < count; i++) {
        const ghost = document.createElement('div');
        ghost.className = 'theme-effect ghost';
        ghost.style.left = `${Math.random() * 80 + 10}vw`;
        ghost.style.top = `${Math.random() * 60 + 20}vh`;
        ghost.style.width = `${Math.random() * 30 + 20}px`;
        ghost.style.height = `${Math.random() * 40 + 30}px`;
        ghost.style.animationDuration = `${Math.random() * 5 + 5}s`;
        ghost.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(ghost);
    }
    console.log('おばけエフェクトを作成:', theme);
}

/**
 * Invite modalのテキストを更新します
 * @param {string} lang - 言語コード
 */
function updateInviteModalLanguage(lang) {
    if (!translations[lang]) return;
    
    const t = translations[lang];
    
    const inviteModalTitle = document.querySelector('.invite-modal h2, #inviteModal h2');
    if (inviteModalTitle) inviteModalTitle.textContent = t.inviteModalTitle;
    
    const linkLabel = document.querySelector('.invite-link-label');
    if (linkLabel) linkLabel.textContent = t.inviteLink;
    
    const copyBtn = document.querySelector('.invite-copy-btn');
    if (copyBtn && !copyBtn.textContent.includes('✓')) {
        copyBtn.textContent = t.copyButton;
    }
    
    const shareLabel = document.querySelector('.social-share-label');
    if (shareLabel) shareLabel.textContent = t.shareLabel;
    
    const emailLabel = document.querySelector('.email-invite-label');
    if (emailLabel) emailLabel.textContent = t.emailInviteLabel;
    
    const emailInput = document.getElementById('inviteEmailInput');
    if (emailInput) emailInput.placeholder = t.emailPlaceholder;
    
    const messageInput = document.getElementById('inviteMessageInput');
    if (messageInput) messageInput.placeholder = t.messagePlaceholder2;
    
    const sendBtn = document.querySelector('.email-send-btn');
    if (sendBtn) sendBtn.textContent = t.sendInvite;
}

/**
 * Custom Message modalのテキストを更新します
 * @param {string} lang - 言語コード
 */
function updateCustomMessageModalLanguage(lang) {
    if (!translations[lang]) return;
    
    const t = translations[lang];
    
    const customModalTitle = document.getElementById('customMessageTitle');
    if (customModalTitle) customModalTitle.textContent = t.customMessageTitle;
    
    const recordBtn = document.getElementById('recordMessageBtn');
    if (recordBtn) recordBtn.textContent = t.recordMessage;
    
    const videoBtn = document.getElementById('videoMessageBtn');
    if (videoBtn) videoBtn.textContent = t.recordVideo;
    
    const viewVideoBtn = document.getElementById('viewVideoMessagesBtn');
    if (viewVideoBtn) viewVideoBtn.textContent = t.viewVideoMessages;
}

/**
 * Albumのテキストを更新します
 * @param {string} lang - 言語コード
 */
function updateAlbumLanguage(lang) {
    if (!translations[lang]) return;
    
    const t = translations[lang];
    
    const closeAlbumBtn = document.getElementById('closeAlbum');
    if (closeAlbumBtn) closeAlbumBtn.textContent = t.closeAlbum;
}