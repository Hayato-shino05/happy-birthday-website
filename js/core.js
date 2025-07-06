// Dữ liệu ngày sinh nhật - sẽ được tải từ Supabase
let birthdays = [];

// Thêm CSS nội tuyến cần thiết
const style = document.createElement('style');
style.textContent = `
    .countdown {
        transition: all 1s ease-in-out;
    }
    
    .birthday-title {
        font-family: 'Dancing Script', cursive;
        font-size: 3.5em;
        color: #ff6b81;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
        margin: 0;
        padding: 20px;
        animation: birthdayPop 1.5s ease-out;
    }
    
    @keyframes birthdayPop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
    }
    .photo-item {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    
    .photo-item:hover {
        transform: scale(1.05);
    }
    
    .photo-item:hover .play-icon {
        opacity: 1;
    }
    
    .play-icon {
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    video.memory-photo {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
`;

document.head.appendChild(style);

// Tải danh sách sinh nhật từ Supabase
async function loadBirthdays() {
    try {
        // Sử dụng hàm getBirthdays từ supabase-config.js
        const data = await window.getBirthdays();
        
        if (!data || data.length === 0) {
            console.warn("Không có dữ liệu sinh nhật nào được tìm thấy");
            return;
        }
        
        // Chuyển đổi dữ liệu sang định dạng cần thiết
        birthdays = data.map(item => ({
            name: item.name,
            month: item.month,
            day: item.day,
            year: item.year,
            message: item.message || `🎉 Chúc mừng sinh nhật ${item.name}! 🎉`
        }));
        
        console.log("Đã tải danh sách sinh nhật từ Supabase:", birthdays);
        
        // Sau khi tải xong, kiểm tra sinh nhật
        checkBirthdayAndInitialize();
    } catch (error) {
        console.error("Lỗi khi tải sinh nhật từ Supabase:", error);
        // Hiển thị thông báo lỗi cho người dùng
        showErrorMessage("Không thể tải dữ liệu sinh nhật. Vui lòng thử lại sau.");
    }
}

// Hiển thị thông báo lỗi
function showErrorMessage(message) {
    // Kiểm tra xem đã có thông báo lỗi chưa
    let errorBox = document.getElementById('errorMessageBox');
    
    if (!errorBox) {
        // Tạo phần tử thông báo lỗi
        errorBox = document.createElement('div');
        errorBox.id = 'errorMessageBox';
        errorBox.style.position = 'fixed';
        errorBox.style.top = '10px';
        errorBox.style.left = '50%';
        errorBox.style.transform = 'translateX(-50%)';
        errorBox.style.backgroundColor = '#ffebee';
        errorBox.style.color = '#c62828';
        errorBox.style.padding = '10px 20px';
        errorBox.style.borderRadius = '4px';
        errorBox.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        errorBox.style.zIndex = '9999';
        errorBox.style.display = 'flex';
        errorBox.style.alignItems = 'center';
        errorBox.style.justifyContent = 'space-between';
        errorBox.style.maxWidth = '80%';
        
        document.body.appendChild(errorBox);
    }
    
    // Cập nhật nội dung thông báo
    errorBox.innerHTML = `
        <span>${message}</span>
        <button style="background: none; border: none; cursor: pointer; margin-left: 10px; font-weight: bold;" 
                onclick="this.parentElement.style.display='none'">×</button>
    `;
    
    // Hiển thị thông báo
    errorBox.style.display = 'flex';
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        if (errorBox) errorBox.style.display = 'none';
    }, 5000);
}

// Khởi tạo trang khi tài liệu sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    // Đăng ký xử lý lỗi toàn cục cho Supabase
    if (window.registerErrorHandler) {
        window.registerErrorHandler((operation, error) => {
            console.warn(`Lỗi Supabase trong thao tác [${operation}]:`, error);
            
            // Hiển thị thông báo lỗi thân thiện cho người dùng
            let userMessage = "Có lỗi xảy ra khi kết nối đến máy chủ.";
            
            if (error.message && error.message.includes('network')) {
                userMessage = "Kiểm tra kết nối mạng của bạn và thử lại.";
            } else if (error.code === 'PGRST301' || error.code === '401') {
                userMessage = "Phiên làm việc đã hết hạn, vui lòng làm mới trang.";
            }
            
            showErrorMessage(userMessage);
        });
    }
    
    // Tải danh sách sinh nhật từ Supabase khi trang đã tải xong
    setTimeout(loadBirthdays, 1000); // Chờ 1 giây để đảm bảo Supabase đã được khởi tạo
});

// Kiểm tra xem có phải ngày sinh nhật không
function checkIfBirthday(date) {
    try {
        // Reset time to midnight
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        return birthdays.find(person => {
            // So sánh tháng thực tế (1-12) và ngày
            const monthMatch = (checkDate.getMonth() + 1) === person.month;
            const dayMatch = checkDate.getDate() === person.day;
            
            console.log(`Checking ${person.name}:`, {
                personMonth: person.month,
                currentMonth: checkDate.getMonth() + 1,
                monthMatch: monthMatch,
                personDay: person.day,
                currentDay: checkDate.getDate(),
                dayMatch: dayMatch
            });
            
            return monthMatch && dayMatch;
        });
    } catch (error) {
        console.error('Error in checkIfBirthday:', error);
        return null;
    }
}

// Tìm sinh nhật tiếp theo
function findNextBirthday(currentDate) {
    try {
        let nearestPerson = null;
        let nearestDate = null;
        let smallestDiff = Infinity;

        // Tạo một bản sao của mảng birthdays để không ảnh hưởng đến mảng gốc
        const birthdaysList = [...birthdays];

        for (const person of birthdaysList) {
            // Tạo ngày sinh nhật cho năm hiện tại
            let birthday = new Date(currentDate.getFullYear(), person.month - 1, person.day);
            
            // Nếu sinh nhật năm nay đã qua, tính cho năm sau
            if (currentDate > birthday) {
                birthday = new Date(currentDate.getFullYear() + 1, person.month - 1, person.day);
            }

            const diff = birthday - currentDate;
            console.log(`Checking ${person.name}:`, {
                birthday: birthday,
                diff: diff,
                currentSmallest: smallestDiff
            });

            if (diff < smallestDiff && diff >= 0) {
                smallestDiff = diff;
                nearestDate = birthday;
                nearestPerson = person;
                console.log(`New nearest person: ${person.name}`);
            }
        }

        console.log('Final nearest person:', nearestPerson?.name);
        return { person: nearestPerson, date: nearestDate };
    } catch (error) {
        console.error('Error finding next birthday:', error);
        return { person: null, date: null };
    }
}

// Hiển thị đếm ngược
function displayCountdown(targetDate, person) {
    try {
        const now = new Date();
        const diff = targetDate - now;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.classList.remove('hidden');
            countdownElement.innerHTML = `
                <h1>Đếm Ngược Đến Sinh Nhật ${person.name}</h1>
                <div class="time">
                    <div>
                        <span id="days">${days}</span>
                        <div>Ngày</div>
                    </div>
                    <div>
                        <span id="hours">${hours}</span>
                        <div>Giờ</div>
                    </div>
                    <div>
                        <span id="minutes">${minutes}</span>
                        <div>Phút</div>
                    </div>
                    <div>
                        <span id="seconds">${seconds}</span>
                        <div>Giây</div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error displaying countdown:', error);
    }
}

// Hàm kiểm tra sinh nhật và khởi tạo
async function checkBirthdayAndInitialize() {
    try {
        // Nếu danh sách sinh nhật rỗng, thử tải lại từ Supabase
        if (birthdays.length === 0) {
            await loadBirthdays();
            // Nếu vẫn không có dữ liệu, dừng xử lý
            if (birthdays.length === 0) {
                console.error("Không thể tải dữ liệu sinh nhật");
                return;
            }
        }
        
        const now = new Date();
        const birthdayPerson = checkIfBirthday(now);

        // Nếu có sinh nhật, khởi tạo nội dung sinh nhật
        if (birthdayPerson) {
            const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            const lastShownDate = localStorage.getItem('lastBirthdayShown');
            
            // Nếu chưa hiển thị sinh nhật hôm nay
            if (lastShownDate !== today) {
                localStorage.setItem('lastBirthdayShown', today);
                localStorage.setItem('currentBirthday', birthdayPerson.name);
                localStorage.setItem('birthdayPerson', birthdayPerson.name); // Thêm cho các chức năng khác
                showBirthdayContent(birthdayPerson);
            }
        } else {
            // Xóa dữ liệu sinh nhật cũ
            localStorage.removeItem('lastBirthdayShown');
            localStorage.removeItem('currentBirthday');
            
            // Khởi tạo đếm ngược
            const nextBirthday = findNextBirthday(new Date());
            if (nextBirthday.person) {
                displayCountdown(nextBirthday.date, nextBirthday.person);
            }
        }
    } catch (error) {
        console.error('Error in checkBirthdayAndInitialize:', error);
    }
}

// Cập nhật thời gian đếm ngược (chạy mỗi giây)
function updateCountdownTime() {
    try {
        // Lấy thông tin sinh nhật tiếp theo từ localStorage
        const nextBirthdayDateStr = localStorage.getItem('nextBirthdayDate');
        const nextBirthdayPersonStr = localStorage.getItem('nextBirthdayPerson');
        
        if (!nextBirthdayDateStr || !nextBirthdayPersonStr) {
            // Nếu không có dữ liệu, chạy lại hàm khởi tạo một lần
            checkBirthdayAndInitialize();
            return;
        }
        
        const nextBirthdayDate = new Date(nextBirthdayDateStr);
        const nextBirthdayPerson = JSON.parse(nextBirthdayPersonStr);
        
        // Chỉ cập nhật bộ đếm thời gian, không kiểm tra lại ngày sinh nhật
        displayCountdown(nextBirthdayDate, nextBirthdayPerson);
    } catch (error) {
        console.error('Error in updateCountdownTime:', error);
    }
}

// Hiển thị nội dung sinh nhật
function showBirthdayContent(birthdayPerson) {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.classList.add('hidden');
    }

    const birthdayContent = document.getElementById('birthdayContent');
    if (birthdayContent) {
        birthdayContent.classList.remove('hidden');
        birthdayContent.classList.add('appearing');
        
        // Xóa lớp animation sau khi nó hoàn thành
        setTimeout(() => {
            birthdayContent.classList.remove('appearing');
        }, 1000);
    }

    const birthdayTitle = document.getElementById('birthdayTitle');
    if (birthdayTitle) {
        birthdayTitle.style.display = 'block';
        birthdayTitle.style.opacity = '1';
        birthdayTitle.classList.add('birthday-title');
        birthdayTitle.textContent = 'Chúc Mừng Sinh Nhật';
    }

    const birthdayMessage = document.getElementById('birthdayMessage');
    if (birthdayMessage) {
        birthdayMessage.textContent = birthdayPerson.message;
        birthdayMessage.style.display = 'block';
        birthdayMessage.style.opacity = '1';
        birthdayMessage.style.transform = 'translateY(0)';
        birthdayMessage.classList.add('celebrating');
    }

    // Hiển thị bánh 2D
    const cake2DContainer = document.querySelector('.cake-2d-container');
    if (cake2DContainer) {
        cake2DContainer.style.display = 'flex';
    }
    
    // Hiện nút thổi nến với hiệu ứng sau khi bánh đã hiển thị
    setTimeout(() => {
        const blowButton = document.getElementById('blowButton');
        if (blowButton) {
            blowButton.style.display = 'block';
            blowButton.style.opacity = '0';
            blowButton.style.transform = 'translateY(20px)';
            
            // Hiệu ứng hiện dần
            setTimeout(() => {
                blowButton.style.transition = 'all 0.5s ease';
                blowButton.style.opacity = '1';
                blowButton.style.transform = 'translateY(0)';
            }, 100);
            
            // Gắn sự kiện cho nút thổi nến - Chỉ cần nhấn nút là thổi tắt
            blowButton.onclick = function() {
                // Gọi trực tiếp hàm thổi tắt nến khi nhấn nút
                if (typeof blowOutCandle === 'function') {
                    blowOutCandle();
                } else {
                    console.log('Đang xử lý thổi nến...');
                    // Fallback nếu không tìm thấy hàm
                    const flames = document.querySelectorAll('.flame');
                    if (flames && flames.length > 0) {
                        flames.forEach((flame, index) => {
                            setTimeout(() => {
                                flame.style.opacity = '0';
                            }, index * 200);
                        });
                    }
                }
            };
        }
    }, 1000);
    
    // Ẩn nút cấp quyền microphone vì không cần thiết
    const micPermissionBtn = document.getElementById('micPermissionBtn');
    if (micPermissionBtn) {
        micPermissionBtn.style.display = 'none';
    }
    
    // Ẩn bánh 3D và hiển thị bánh 2D
    const cakeContainer = document.querySelector('.cake-container');
    if (cakeContainer) {
        cakeContainer.style.display = 'none';
    }
    
    const birthdayMessageContainer = document.querySelector('.birthday-message');
    if (birthdayMessageContainer) {
        birthdayMessageContainer.style.display = 'block';
    }

    // Thay đổi nền trang với hiệu ứng
    document.body.style.transition = 'background 1.5s ease';
    document.body.style.background = 'linear-gradient(135deg, #ffe6eb 0%, #ffb8c6 100%)';

    // Tạo hiệu ứng confetti rơi xuống
    setTimeout(() => {
    createConfetti();
        
        // Thêm đợt confetti thứ hai sau vài giây
        setTimeout(createConfetti, 2000);
    }, 500);

    // Phát nhạc sinh nhật với độ trễ nhỏ
    setTimeout(playBirthdayMusic, 1200);
    
    // Hiển thị lời chúc cá nhân hóa nếu có
    setTimeout(displaySavedCustomMessage, 1500);
    
    // Thêm hiệu ứng bóng bay
    if (typeof createBalloons === 'function') {
        setTimeout(createBalloons, 1000);
    }
}

// Hàm khởi tạo bánh sinh nhật 3D
function init3DCake() {
    // Bánh 3D đã bị vô hiệu hóa, chỉ sử dụng bánh 2D
    console.log('Bánh 3D đã bị vô hiệu hóa, chỉ sử dụng bánh 2D');
    return;
}

// Thêm trang trí cho bánh
function addCakeTierDecorations(tier, radius, height, color) {
    // Đã bị vô hiệu hóa vì không còn dùng bánh 3D
    return;
}

// Thêm chữ Happy Birthday lên bánh
function addBirthdayText(cakeGroup) {
    // Đã vô hiệu hóa chức năng hiển thị chữ "Chúc Mừng Sinh Nhật"
    return; // Không thêm chữ vào bánh nữa
}

// Tính năng tải Three.js nếu chưa có
function loadThreeJS(callback) {
    // Đã bị vô hiệu hóa vì không còn dùng bánh 3D
    if (callback) callback();
    return;
}

// Phát nhạc sinh nhật
function playBirthdayMusic() {
    const audio = new Audio('happy-birthday.mp3');
    audio.play().catch(e => {
        console.log('Auto-play prevented:', e);
        const playButton = document.getElementById('playMusic');
        if (playButton) {
            playButton.textContent = '▶️';
        }
    });
}

// Debug function
function debugDate() {
    const now = new Date();
    console.log('Current Date:', {
        fullDate: now,
        month: now.getMonth() + 1, // Chuyển về 1-12
        date: now.getDate(),
        year: now.getFullYear()
    });
    
    const birthdayPerson = checkIfBirthday(now);
    console.log('Birthday Check Result:', birthdayPerson);
    
    // Kiểm tra tất cả sinh nhật
    birthdays.forEach(person => {
        console.log(`Checking ${person.name}:`, {
            personMonth: person.month,
            currentMonth: now.getMonth() + 1,
            personDay: person.day,
            currentDay: now.getDate(),
            isMatch: (now.getMonth() + 1) === person.month && now.getDate() === person.day
        });
    });
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra sinh nhật một lần khi tải trang
    checkBirthdayAndInitialize();
    
    // Cập nhật đếm ngược mỗi giây (không kiểm tra lại ngày sinh nhật)
    setInterval(updateCountdownTime, 1000);
    
    // Khởi tạo các tính năng khác
    initPhotoAlbum();
    initGames();
    initSocialShare();
    initMusicPlayer();
    
    // Áp dụng giao diện theo mùa và lễ hội
    const theme = detectSeasonAndFestival();
    applyTheme(theme);
    
    // Áp dụng ngôn ngữ
    const savedLang = localStorage.getItem('language') || 'vi';
    document.getElementById('languageSelect').value = savedLang;
    applyLanguage(savedLang);
    
    // Khởi tạo tính năng lời chúc cá nhân hóa
    initCustomMessage();
    displaySavedCustomMessage();
    
    // Debug
    debugDate();
}); 