function getSavedUsername() {
    return localStorage.getItem('birthdayChatUserName') || '';
}

function saveUsername(name) {
    if (name && name.trim() !== '') {
        localStorage.setItem('birthdayChatUserName', name.trim());
        return true;
    }
    return false;
}

window.saveUsername = saveUsername;
window.getSavedUsername = getSavedUsername;

function initBulletinBoard() {
    console.log('掲示板を初期化中');
    const bulletinBtn = document.getElementById('bulletinBoardBtn');
    const bulletinModal = document.getElementById('bulletinBoardModal');
    const closeBulletinBoard = document.getElementById('closeBulletinBoard');
    const selectGiftBtn = document.getElementById('selectGiftBtn');
    const submitPost = document.getElementById('submitPost');
    
    if (!bulletinBtn) {
        console.error('掲示板ボタンが見つかりません');
        return;
    }
    
    if (!bulletinModal) {
        console.error('掲示板モーダルが見つかりません');
        return;
    }
    
    if (!closeBulletinBoard) {
        console.error('掲示板閉じるボタンが見つかりません');
        return;
    }
    
    bulletinBtn.addEventListener('click', () => {
        console.log('お祝い掲示板を開く');
        
        const userName = getSavedUsername();
        
        if (!userName) {
            console.log('ユーザー名がありません、名前入力モーダルを開く');
            openUserNameModalForBulletin();
        } else {
            console.log('ユーザー名があります、掲示板を開く');
            bulletinModal.style.display = 'flex';
        }
    });
    
    closeBulletinBoard.addEventListener('click', () => {
        console.log('お祝い掲示板を閉じる');
        bulletinModal.style.display = 'none';
    });
    
    bulletinModal.addEventListener('click', (e) => {
        if (e.target === bulletinModal) {
            bulletinModal.style.display = 'none';
        }
    });
    
    if (selectGiftBtn) {
        selectGiftBtn.addEventListener('click', () => {
            const userName = getSavedUsername();
            
            if (!userName) {
                openUserNameModalForGift();
            } else {
                openVirtualGiftModal(userName);
            }
        });
    }
    
    if (submitPost) {
        submitPost.addEventListener('click', () => {
            const selectedGiftDisplay = document.getElementById('selectedGiftDisplay');
            
            if (!selectedGiftDisplay || selectedGiftDisplay.style.display === 'none') {
                alert('送信前にギフトを選択してください！');
                return;
            }
            
            const userName = getSavedUsername();
            if (!userName) {
                openUserNameModalForGift();
                return;
            }
            
            alert('ギフトを正常に送信しました！');
            bulletinModal.style.display = 'none';
        });
    }
    
    console.log('お祝い掲示板の初期化完了');
}

function initCustomMessage() {
    const customMessageBtn = document.getElementById('customMessageBtn');
    const customMessageModal = document.getElementById('customMessageModal');
    const closeCustomMessage = document.getElementById('closeCustomMessage');
    const submitCustomMessage = document.getElementById('submitCustomMessage');
    
    customMessageBtn.addEventListener('click', () => {
        const userName = getSavedUsername();
        if (userName && document.getElementById('senderNameInput')) {
            document.getElementById('senderNameInput').value = userName;
        }
        
        customMessageModal.style.display = 'flex';
    });
    
    closeCustomMessage.addEventListener('click', () => {
        customMessageModal.style.display = 'none';
    });
    
    customMessageModal.addEventListener('click', (e) => {
        if (e.target === customMessageModal) {
            customMessageModal.style.display = 'none';
        }
    });
    
    let senderNameInput = document.getElementById('senderNameInput');
    if (!senderNameInput) {
        senderNameInput = document.createElement('input');
        senderNameInput.id = 'senderNameInput';
        senderNameInput.type = 'text';
        senderNameInput.placeholder = 'あなたのお名前...';
        senderNameInput.style.width = '100%';
        senderNameInput.style.padding = '10px';
        senderNameInput.style.border = '2px solid #D4B08C';
        senderNameInput.style.borderRadius = '0';
        senderNameInput.style.marginBottom = '10px';
        senderNameInput.style.fontFamily = '\'Old Standard TT\', serif';
        senderNameInput.style.fontSize = '16px';
        senderNameInput.style.background = '#FFF9F3';
        senderNameInput.style.color = '#2C1810';
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.insertBefore(senderNameInput, modalContent.children[2]);
        
        const savedUserName = getSavedUsername();
        if (savedUserName) {
            senderNameInput.value = savedUserName;
        }
    }

    submitCustomMessage.addEventListener('click', async () => {
        const customMessageInput = document.getElementById('customMessageInput');
        const senderNameInput = document.getElementById('senderNameInput');
        const messageText = customMessageInput.value.trim();
        let senderName = senderNameInput.value.trim();
        
        if (!messageText) {
            alert('お祝いメッセージを入力してください！');
            return;
        }
        
        if (!senderName) {
            const savedUserName = getSavedUsername();
            if (savedUserName) {
                senderName = savedUserName;
            } else {
                senderName = '匿名';
            }
        } else {
            saveUsername(senderName);
        }
        
        const birthdayName = getCurrentBirthdayPerson();
        const saved = await saveCustomMessage(senderName, messageText, birthdayName);
        
        if (saved) {
            displayCustomMessage(`${messageText} - ${senderName}`);
            customMessageModal.style.display = 'none';
            customMessageInput.value = '';
        } else {
            alert('お祝いメッセージを保存できません。後でもう一度お試しください！');
        }
    });

    let recordBtn = document.getElementById('recordMessageBtn');
    if (!recordBtn) {
        recordBtn = document.createElement('button');
        recordBtn.id = 'recordMessageBtn';
        recordBtn.textContent = '🎤 お祝いメッセージを録音';
        recordBtn.style.padding = '10px 20px';
        recordBtn.style.background = '#854D27';
        recordBtn.style.color = '#FFF9F3';
        recordBtn.style.border = '2px solid #D4B08C';
        recordBtn.style.borderRadius = '0';
        recordBtn.style.cursor = 'pointer';
        recordBtn.style.fontSize = '1.1em';
        recordBtn.style.transition = 'all 0.3s';
        recordBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        recordBtn.style.textTransform = 'uppercase';
        recordBtn.style.letterSpacing = '1px';
        recordBtn.style.marginTop = '10px';
        recordBtn.addEventListener('click', () => {
            customMessageModal.style.display = 'none';
            openRecordMessageModal();
        });
        recordBtn.addEventListener('mouseover', () => {
            recordBtn.style.transform = 'translate(-2px, -2px)';
            recordBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        recordBtn.addEventListener('mouseout', () => {
            recordBtn.style.transform = 'none';
            recordBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(recordBtn);
    }

    let videoBtn = document.getElementById('videoMessageBtn');
    if (!videoBtn) {
        videoBtn = document.createElement('button');
        videoBtn.id = 'videoMessageBtn';
        videoBtn.textContent = '🎥 お祝いビデオ';
        videoBtn.style.padding = '10px 20px';
        videoBtn.style.background = '#854D27';
        videoBtn.style.color = '#FFF9F3';
        videoBtn.style.border = '2px solid #D4B08C';
        videoBtn.style.borderRadius = '0';
        videoBtn.style.cursor = 'pointer';
        videoBtn.style.fontSize = '1.1em';
        videoBtn.style.transition = 'all 0.3s';
        videoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        videoBtn.style.textTransform = 'uppercase';
        videoBtn.style.letterSpacing = '1px';
        videoBtn.style.marginTop = '10px';
        videoBtn.addEventListener('click', () => {
            customMessageModal.style.display = 'none';
            openVideoMessageModal();
        });
        videoBtn.addEventListener('mouseover', () => {
            videoBtn.style.transform = 'translate(-2px, -2px)';
            videoBtn.style.boxShadow = '6px 6px 0 #D4B08C';
        });
        videoBtn.addEventListener('mouseout', () => {
            videoBtn.style.transform = 'none';
            videoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        });
        const modalContent = customMessageModal.querySelector('.modal-content');
        modalContent.appendChild(videoBtn);
    }

    displaySavedAudioMessages();
}

function openRecordMessageModal() {
    let recordModal = document.getElementById('recordMessageModal');
    
    if (!recordModal) {
        recordModal = document.createElement('div');
        recordModal.id = 'recordMessageModal';
        recordModal.style.position = 'fixed';
        recordModal.style.top = '0';
        recordModal.style.left = '0';
        recordModal.style.width = '100%';
        recordModal.style.height = '100%';
        recordModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        recordModal.style.display = 'none';
        recordModal.style.justifyContent = 'center';
        recordModal.style.alignItems = 'center';
        recordModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            recordModal.style.display = 'none';
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        });
        
        const title = document.createElement('h2');
        title.textContent = 'お祝いメッセージを録音';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const recordControls = document.createElement('div');
        recordControls.style.display = 'flex';
        recordControls.style.justifyContent = 'center';
        recordControls.style.gap = '10px';
        recordControls.style.marginBottom = '20px';
        
        const recordBtn = document.createElement('button');
        recordBtn.id = 'recordBtn';
        recordBtn.textContent = '⏺️ 録音開始';
        recordBtn.style.padding = '10px 20px';
        recordBtn.style.background = '#854D27';
        recordBtn.style.color = '#FFF9F3';
        recordBtn.style.border = '2px solid #D4B08C';
        recordBtn.style.borderRadius = '0';
        recordBtn.style.cursor = 'pointer';
        recordBtn.style.fontSize = '1.1em';
        recordBtn.style.transition = 'all 0.3s';
        recordBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        recordBtn.addEventListener('click', toggleRecording);
        
        const statusText = document.createElement('div');
        statusText.id = 'recordingStatus';
        statusText.textContent = '未録音';
        statusText.style.marginTop = '10px';
        statusText.style.color = '#854D27';
        statusText.style.fontStyle = 'italic';
        
        const audioPreview = document.createElement('audio');
        audioPreview.id = 'audioPreview';
        audioPreview.controls = true;
        audioPreview.style.width = '100%';
        audioPreview.style.marginTop = '20px';
        audioPreview.style.display = 'none';
        
        const senderInput = document.createElement('input');
        senderInput.id = 'audioMessageSender';
        senderInput.type = 'text';
        senderInput.placeholder = 'あなたのお名前...';
        senderInput.style.width = '100%';
        senderInput.style.padding = '10px';
        senderInput.style.border = '2px solid #D4B08C';
        senderInput.style.borderRadius = '0';
        senderInput.style.marginTop = '20px';
        senderInput.style.fontFamily = '\'Old Standard TT\', serif';
        senderInput.style.fontSize = '16px';
        senderInput.style.background = '#FFF9F3';
        senderInput.style.color = '#2C1810';
        senderInput.style.display = 'none';
        
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveAudioBtn';
        saveBtn.textContent = '💾 お祝いメッセージを保存';
        saveBtn.style.padding = '10px 20px';
        saveBtn.style.background = '#854D27';
        saveBtn.style.color = '#FFF9F3';
        saveBtn.style.border = '2px solid #D4B08C';
        saveBtn.style.borderRadius = '0';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '1.1em';
        saveBtn.style.transition = 'all 0.3s';
        saveBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        saveBtn.style.marginTop = '20px';
        saveBtn.style.display = 'none';
        saveBtn.addEventListener('click', saveAudioMessage);
        
        recordControls.appendChild(recordBtn);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(recordControls);
        modalContent.appendChild(statusText);
        modalContent.appendChild(audioPreview);
        modalContent.appendChild(senderInput);
        modalContent.appendChild(saveBtn);
        
        recordModal.appendChild(modalContent);
        document.body.appendChild(recordModal);
    }
    
    const recordBtn = document.getElementById('recordBtn');
    const audioPreview = document.getElementById('audioPreview');
    const senderInput = document.getElementById('audioMessageSender');
    const saveBtn = document.getElementById('saveAudioBtn');
    const statusText = document.getElementById('recordingStatus');
    
    recordBtn.textContent = '⏺️ 録音開始';
    audioPreview.style.display = 'none';
    audioPreview.src = '';
    senderInput.style.display = 'none';
    senderInput.value = '';
    saveBtn.style.display = 'none';
    statusText.textContent = '未録音';
    statusText.style.color = '#854D27';
    
    recordModal.style.display = 'flex';
}



function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const audioPreview = document.getElementById('audioPreview');
    const statusText = document.getElementById('recordingStatus');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('お使いのブラウザは録音に対応していません！');
        return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioUrl = URL.createObjectURL(audioBlob);
                audioPreview.src = audioUrl;
                audioPreview.style.display = 'block';
                
                document.getElementById('audioMessageSender').style.display = 'block';
                document.getElementById('saveAudioBtn').style.display = 'block';
                
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            recordBtn.textContent = '⏹️ 録音停止';
            statusText.textContent = '⚫ 録音中...';
            statusText.style.color = '#ff4081';
        })
        .catch(error => {
            console.error('マイクにアクセスできません:', error);
            alert('マイクにアクセスできません。アクセス許可を確認してもう一度お試しください。');
        });
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        const recordBtn = document.getElementById('recordBtn');
        const statusText = document.getElementById('recordingStatus');
        
        recordBtn.textContent = '⏺️ 新しい録音';
        statusText.textContent = '✅ 録音完了';
        statusText.style.color = '#4CAF50';
    }
}

function saveAudioMessage() {
    const senderInput = document.getElementById('audioMessageSender');
    const senderName = senderInput.value.trim() || '匿名';
    
    if (!audioBlob) {
        alert('保存する録音がありません！');
        return;
    }
    
    const statusText = document.getElementById('recordingStatus');
    if (statusText) {
        statusText.textContent = '音声をアップロード中...';
        statusText.style.color = '#FFA500';
    }
    
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    saveAudioMessageToSupabase(audioBlob, senderName, birthdayPerson)
        .then(success => {
            if (success) {
        document.getElementById('recordMessageModal').style.display = 'none';
        alert('お祝い音声メッセージが正常に保存されました！');
        displaySavedAudioMessages();
            } else {
                if (statusText) {
                    statusText.textContent = '音声保存エラー';
                    statusText.style.color = '#ff4444';
                }
                alert('音声保存エラー');
            }
        })
        .catch(error => {
            console.error('音声保存エラー:', error);
            if (statusText) {
                statusText.textContent = '音声保存エラー';
                statusText.style.color = '#ff4444';
                statusText.style.color = '#FF0000';
            }
            alert('Lỗi khi lưu âm thanh: ' + error.message);
        });
}

function displaySavedAudioMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    getAudioMessages(birthdayPerson)
        .then(messages => {
            if (messages && messages.length > 0) {
        let audioBtn = document.getElementById('viewAudioMessagesBtn');
        
        if (!audioBtn && document.getElementById('customMessageDisplay')) {
            audioBtn = document.createElement('button');
            audioBtn.id = 'viewAudioMessagesBtn';
            audioBtn.textContent = '🔊 お祝いを聞く';
            audioBtn.style.padding = '10px 20px';
            audioBtn.style.background = '#854D27';
            audioBtn.style.color = '#FFF9F3';
            audioBtn.style.border = '2px solid #D4B08C';
            audioBtn.style.borderRadius = '0';
            audioBtn.style.cursor = 'pointer';
            audioBtn.style.fontSize = '1.1em';
            audioBtn.style.transition = 'all 0.3s';
            audioBtn.style.boxShadow = '4px 4px 0 #D4B08C';
            audioBtn.style.margin = '10px auto';
            audioBtn.style.display = 'block';
            
            audioBtn.addEventListener('click', () => {
                openAudioMessagesModal(birthdayPerson);
            });
            
            const customMessageDisplay = document.getElementById('customMessageDisplay');
            customMessageDisplay.appendChild(audioBtn);
        }
    }
        })
        .catch(error => {
            console.error('音声リスト取得エラー:', error);
        });
}

function openAudioMessagesModal(birthdayPerson) {
    let audioModal = document.getElementById('audioMessagesModal');
    
    if (!audioModal) {
        audioModal = document.createElement('div');
        audioModal.id = 'audioMessagesModal';
        audioModal.style.position = 'fixed';
        audioModal.style.top = '0';
        audioModal.style.left = '0';
        audioModal.style.width = '100%';
        audioModal.style.height = '100%';
        audioModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        audioModal.style.display = 'none';
        audioModal.style.justifyContent = 'center';
        audioModal.style.alignItems = 'center';
        audioModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            audioModal.style.display = 'none';
            document.querySelectorAll('audio').forEach(audio => audio.pause());
        });
        
        const title = document.createElement('h2');
        title.textContent = birthdayPerson ? `${birthdayPerson}へのお祝いメッセージ` : 'お誕生日お祝いメッセージ';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const messagesList = document.createElement('div');
        messagesList.id = 'audioMessagesList';
        messagesList.style.display = 'flex';
        messagesList.style.flexDirection = 'column';
        messagesList.style.gap = '15px';
        
        // Hiển thị thông báo đang tải
        const loadingMsg = document.createElement('p');
        loadingMsg.textContent = '音声メッセージを読み込み中...';
        loadingMsg.style.textAlign = 'center';
        loadingMsg.style.color = '#854D27';
        loadingMsg.id = 'audioLoadingMessage';
        messagesList.appendChild(loadingMsg);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(messagesList);
        
        audioModal.appendChild(modalContent);
        document.body.appendChild(audioModal);
    }
        
    audioModal.style.display = 'flex';
    
        const messagesList = document.getElementById('audioMessagesList');
    
    if (messagesList) {
        messagesList.innerHTML = '<p id="audioLoadingMessage" style="text-align: center; color: #854D27;">音声メッセージを読み込み中...</p>';
        
        getAudioMessages(birthdayPerson)
            .then(messages => {
                messagesList.innerHTML = '';
                
                if (!messages || messages.length === 0) {
                const noMessages = document.createElement('p');
                noMessages.textContent = 'まだお祝い音声メッセージがありません。';
                noMessages.style.textAlign = 'center';
                noMessages.style.fontStyle = 'italic';
                noMessages.style.color = '#854D27';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.style.background = '#F5E6D8';
                    messageItem.style.padding = '15px';
                    messageItem.style.borderLeft = '4px solid #D4B08C';
                    messageItem.style.borderRadius = '0 5px 5px 0';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.style.display = 'flex';
                    messageHeader.style.justifyContent = 'space-between';
                    messageHeader.style.marginBottom = '10px';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.style.fontWeight = 'bold';
                    senderName.style.color = '#2C1810';
                    
                    const timestamp = document.createElement('span');
                        timestamp.textContent = new Date(message.created_at).toLocaleString();
                    timestamp.style.fontSize = '0.8em';
                    timestamp.style.color = '#854D27';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                    const audioPlayer = document.createElement('audio');
                    audioPlayer.controls = true;
                    audioPlayer.style.width = '100%';
                        audioPlayer.src = message.audio_data;
                    
                    messageItem.appendChild(messageHeader);
                    messageItem.appendChild(audioPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
            })
            .catch(error => {
                messagesList.innerHTML = '';
                const errorMsg = document.createElement('p');
                errorMsg.textContent = '音声メッセージ読み込みエラー: ' + error.message;
                errorMsg.style.textAlign = 'center';
                errorMsg.style.color = 'red';
                messagesList.appendChild(errorMsg);
                console.error('音声メッセージ取得エラー:', error);
            });
    }
}

function playAudioMessage(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('音声再生できません:', error);
        alert('音声を再生できません。もう一度お試しください。');
    });
}

function displayCustomMessage(message) {
    const customMessageDisplay = document.getElementById('customMessageDisplay');
    if (customMessageDisplay) {
        customMessageDisplay.innerHTML = `
            <div class="message-bubble">
                <p>${message}</p>
            </div>
        `;
        customMessageDisplay.style.opacity = 1;
    }
}

// お祝いメッセージを表示
async function displaySavedCustomMessage() {
    try {
        // 誕生日のお祝いメッセージを表示する人を取得
        const birthdayPerson = getCurrentBirthdayPerson();
        
        // お祝いメッセージを取得
        const message = await getLatestCustomMessage(birthdayPerson);
        
        if (message) {
            displayCustomMessage(`${message.message} - ${message.sender}`);
        }
    } catch (error) {
        console.error('お祝いメッセージ表示エラー:', error);
        
        // ローカルストレージからメッセージを取得
        const savedMessage = localStorage.getItem('customBirthdayMessage');
        if (savedMessage) {
            displayCustomMessage(savedMessage);
        }
    }
}

// 誕生日のお祝いメッセージを表示する人を取得
function getCurrentBirthdayPerson() {
    // デフォルトは友達
    return localStorage.getItem('birthdayPerson') || '友達';
}

// ビデオメッセージモーダルを開く
function openVideoMessageModal() {
    let videoModal = document.getElementById('videoMessageModal');
    
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'videoMessageModal';
        videoModal.style.position = 'fixed';
        videoModal.style.top = '0';
        videoModal.style.left = '0';
        videoModal.style.width = '100%';
        videoModal.style.height = '100%';
        videoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        videoModal.style.display = 'none';
        videoModal.style.justifyContent = 'center';
        videoModal.style.alignItems = 'center';
        videoModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '90%';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            videoModal.style.display = 'none';
            
            // ビデオストリームを停止
            const videoPreview = document.getElementById('videoPreview');
            if (videoPreview.srcObject) {
                videoPreview.srcObject.getTracks().forEach(track => track.stop());
                videoPreview.srcObject = null;
            }
            
            // ビデオ録画を停止
            if (videoRecorder && videoRecorder.state === 'recording') {
                videoRecorder.stop();
            }
        });
        
        const title = document.createElement('h2');
        title.textContent = 'お祝いビデオを録画';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const videoContainer = document.createElement('div');
        videoContainer.style.marginBottom = '20px';
        
        const videoPreview = document.createElement('video');
        videoPreview.id = 'videoPreview';
        videoPreview.width = 540;
        videoPreview.height = 360;
        videoPreview.style.background = '#000';
        videoPreview.style.display = 'block';
        videoPreview.style.maxWidth = '100%';
        videoPreview.style.margin = '0 auto';
        videoPreview.autoplay = true;
        videoPreview.muted = true;
        
        const recordControls = document.createElement('div');
        recordControls.style.display = 'flex';
        recordControls.style.justifyContent = 'center';
        recordControls.style.gap = '10px';
        recordControls.style.marginTop = '20px';
        
        const startVideoBtn = document.createElement('button');
        startVideoBtn.id = 'startVideoBtn';
        startVideoBtn.textContent = '⏺️ 録画開始';
        startVideoBtn.style.padding = '10px 20px';
        startVideoBtn.style.background = '#854D27';
        startVideoBtn.style.color = '#FFF9F3';
        startVideoBtn.style.border = '2px solid #D4B08C';
        startVideoBtn.style.borderRadius = '0';
        startVideoBtn.style.cursor = 'pointer';
        startVideoBtn.style.fontSize = '1.1em';
        startVideoBtn.style.transition = 'all 0.3s';
        startVideoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        startVideoBtn.addEventListener('click', () => {
            const startButton = document.getElementById('startVideoBtn');
            const videoPreview = document.getElementById('videoPreview');
            const statusText = document.getElementById('videoRecordingStatus');
            
            if (startButton.textContent.includes('録画開始')) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    alert('お使いのブラウザはビデオ録画に対応していません！');
                    return;
                }
                
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    .then(stream => {
                        videoPreview.srcObject = stream;
                        
                        videoChunks = [];
                        videoRecorder = new MediaRecorder(stream, {
                            mimeType: 'video/webm;codecs=vp9,opus'
                        });
                        
                        videoRecorder.ondataavailable = event => {
                            if (event.data.size > 0) {
                                videoChunks.push(event.data);
                            }
                        };
                        
                        videoRecorder.onstop = () => {
                            videoBlob = new Blob(videoChunks, { type: 'video/webm' });
                            videoUrl = URL.createObjectURL(videoBlob);
                            
                            videoPreview.srcObject = null;
                            videoPreview.src = videoUrl;
                            videoPreview.muted = false;
                            videoPreview.play();
                            
                            document.getElementById('videoMessageSender').style.display = 'block';
                            document.getElementById('saveVideoBtn').style.display = 'block';
                        };
                        
                        videoRecorder.start();
                        startButton.textContent = '⏹️ 録画停止';
                        statusText.textContent = '⚫ ビデオ録画中...';
                        statusText.style.color = '#ff4081';
                    })
                    .catch(error => {
                        console.error('カメラにアクセスできません:', error);
                        alert('カメラにアクセスできません。アクセス許可を確認してもう一度お試しください。');
                    });
            } else {
                if (videoRecorder && videoRecorder.state === 'recording') {
                    videoRecorder.stop();
                    videoPreview.srcObject.getTracks().forEach(track => track.stop());
                    
                    startButton.textContent = '🔄 再録画';
                    statusText.textContent = '✅ ビデオ録画完了';
                    statusText.style.color = '#4CAF50';
                }
            }
        });
        
        const statusText = document.createElement('div');
        statusText.id = 'videoRecordingStatus';
        statusText.textContent = 'Chưa ghi video';
        statusText.style.marginTop = '10px';
        statusText.style.color = '#854D27';
        statusText.style.fontStyle = 'italic';
        statusText.style.textAlign = 'center';
        
        const senderInput = document.createElement('input');
        senderInput.id = 'videoMessageSender';
        senderInput.type = 'text';
        senderInput.placeholder = 'あなたのお名前...';
        senderInput.style.width = '100%';
        senderInput.style.padding = '10px';
        senderInput.style.border = '2px solid #D4B08C';
        senderInput.style.borderRadius = '0';
        senderInput.style.marginTop = '20px';
        senderInput.style.fontFamily = '\'Old Standard TT\', serif';
        senderInput.style.fontSize = '16px';
        senderInput.style.background = '#FFF9F3';
        senderInput.style.color = '#2C1810';
        senderInput.style.display = 'none';
        
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveVideoBtn';
        saveBtn.textContent = '💾 ビデオ保存';
        saveBtn.style.padding = '10px 20px';
        saveBtn.style.background = '#854D27';
        saveBtn.style.color = '#FFF9F3';
        saveBtn.style.border = '2px solid #D4B08C';
        saveBtn.style.borderRadius = '0';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '1.1em';
        saveBtn.style.transition = 'all 0.3s';
        saveBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        saveBtn.style.marginTop = '20px';
        saveBtn.style.display = 'none';
        saveBtn.addEventListener('click', () => {
            const senderName = document.getElementById('videoMessageSender').value.trim() || '匿名';
            const videoName = `${senderName}からのお祝いビデオ`;
            
            saveVideoMessage(videoBlob, videoName, senderName);
        });
        
        videoContainer.appendChild(videoPreview);
        recordControls.appendChild(startVideoBtn);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(videoContainer);
        modalContent.appendChild(recordControls);
        modalContent.appendChild(statusText);
        modalContent.appendChild(senderInput);
        modalContent.appendChild(saveBtn);
        
        videoModal.appendChild(modalContent);
        document.body.appendChild(videoModal);
    } else {
        const startButton = document.getElementById('startVideoBtn');
        const videoPreview = document.getElementById('videoPreview');
        const statusText = document.getElementById('videoRecordingStatus');
        const senderInput = document.getElementById('videoMessageSender');
        const saveBtn = document.getElementById('saveVideoBtn');
        
        startButton.textContent = '⏺️ 録画開始';
        videoPreview.srcObject = null;
        videoPreview.src = '';
        videoPreview.muted = true;
        statusText.textContent = '未録画';
        statusText.style.color = '#854D27';
        senderInput.style.display = 'none';
        senderInput.value = '';
        saveBtn.style.display = 'none';
    }
    
    videoModal.style.display = 'flex';
}

let videoRecorder;
let videoChunks = [];
let videoBlob;
let videoUrl;

function saveVideoMessage(videoData, videoName, senderName) {
    if (!videoData) {
        alert('保存するビデオがありません！');
        return;
    }
    
    if (videoData.size > 10 * 1024 * 1024) {
        alert('ビデオが大きすぎます。短いビデオを録画してください（10MB未満）。');
        return;
    }
    
    const statusText = document.getElementById('videoRecordingStatus');
    if (statusText) {
        statusText.textContent = 'ビデオをアップロード中...';
        statusText.style.color = '#FFA500';
    }
    
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    
    saveVideoMessageToSupabase(videoData, videoName, senderName, birthdayPerson)
        .then(success => {
            if (success) {
        document.getElementById('videoMessageModal').style.display = 'none';
        alert('お祝いビデオが正常に保存されました！');
        
        displaySavedVideoMessages();
            } else {
                if (statusText) {
                    statusText.textContent = 'ビデオ保存エラー！';
                    statusText.style.color = '#FF0000';
                }
                alert('ビデオを保存できません。後でもう一度お試しください。');
            }
        })
        .catch(error => {
            console.error('ビデオ保存エラー:', error);
            if (statusText) {
                statusText.textContent = 'ビデオ保存エラー！';
                statusText.style.color = '#FF0000';
            }
            alert('ビデオ保存エラー: ' + error.message);
        });
}

function displaySavedVideoMessages() {
    const birthdayPerson = localStorage.getItem('currentBirthday') || '共通';
    getVideoMessages(birthdayPerson)
        .then(messages => {
            if (messages && messages.length > 0) {
        let videoBtn = document.getElementById('viewVideoMessagesBtn');
        
        if (!videoBtn && document.getElementById('customMessageDisplay')) {
            videoBtn = document.createElement('button');
            videoBtn.id = 'viewVideoMessagesBtn';
            videoBtn.textContent = '🎥 お祝いビデオを見る';
            videoBtn.style.padding = '10px 20px';
            videoBtn.style.background = '#854D27';
            videoBtn.style.color = '#FFF9F3';
            videoBtn.style.border = '2px solid #D4B08C';
            videoBtn.style.borderRadius = '0';
            videoBtn.style.cursor = 'pointer';
            videoBtn.style.fontSize = '1.1em';
            videoBtn.style.transition = 'all 0.3s';
            videoBtn.style.boxShadow = '4px 4px 0 #D4B08C';
            videoBtn.style.margin = '10px auto';
            videoBtn.style.display = 'block';
            
            videoBtn.addEventListener('click', () => {
                openVideoMessagesModal(birthdayPerson);
            });
            
            const customMessageDisplay = document.getElementById('customMessageDisplay');
            customMessageDisplay.appendChild(videoBtn);
        }
    }
        })
        .catch(error => {
            console.error('ビデオリスト取得エラー:', error);
        });
}

function openVideoMessagesModal(birthdayPerson) {
    let videoModal = document.getElementById('videoMessagesModal');
    
    if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'videoMessagesModal';
        videoModal.style.position = 'fixed';
        videoModal.style.top = '0';
        videoModal.style.left = '0';
        videoModal.style.width = '100%';
        videoModal.style.height = '100%';
        videoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        videoModal.style.display = 'none';
        videoModal.style.justifyContent = 'center';
        videoModal.style.alignItems = 'center';
        videoModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '80%';
        modalContent.style.width = '800px';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            videoModal.style.display = 'none';
            document.querySelectorAll('video').forEach(video => video.pause());
        });
        
        const title = document.createElement('h2');
        title.textContent = birthdayPerson ? `${birthdayPerson}へのお祝いビデオ` : 'お祝いビデオ';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const messagesList = document.createElement('div');
        messagesList.id = 'videoMessagesList';
        messagesList.style.display = 'flex';
        messagesList.style.flexDirection = 'column';
        messagesList.style.gap = '20px';
        
        // Hiển thị thông báo đang tải
        const loadingMsg = document.createElement('p');
        loadingMsg.textContent = 'ビデオを読み込み中...';
        loadingMsg.style.textAlign = 'center';
        loadingMsg.style.color = '#854D27';
        loadingMsg.id = 'videoLoadingMessage';
        messagesList.appendChild(loadingMsg);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(messagesList);
        
        videoModal.appendChild(modalContent);
        document.body.appendChild(videoModal);
    }
        
    videoModal.style.display = 'flex';
    
    const messagesList = document.getElementById('videoMessagesList');
    
    if (messagesList) {
        messagesList.innerHTML = '<p id="videoLoadingMessage" style="text-align: center; color: #854D27;">ビデオを読み込み中...</p>';
        getVideoMessages(birthdayPerson)
            .then(messages => {
                messagesList.innerHTML = '';
                
                if (!messages || messages.length === 0) {
                const noMessages = document.createElement('p');
                noMessages.textContent = 'まだお祝いビデオがありません。';
                noMessages.style.textAlign = 'center';
                noMessages.style.fontStyle = 'italic';
                noMessages.style.color = '#854D27';
                messagesList.appendChild(noMessages);
            } else {
                messages.forEach((message, index) => {
                    const messageItem = document.createElement('div');
                    messageItem.style.background = '#F5E6D8';
                        messageItem.style.padding = '20px';
                    messageItem.style.borderLeft = '4px solid #D4B08C';
                    messageItem.style.borderRadius = '0 5px 5px 0';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.style.display = 'flex';
                    messageHeader.style.justifyContent = 'space-between';
                        messageHeader.style.marginBottom = '15px';
                    
                    const senderName = document.createElement('span');
                    senderName.textContent = message.sender;
                    senderName.style.fontWeight = 'bold';
                    senderName.style.color = '#2C1810';
                    
                    const timestamp = document.createElement('span');
                        timestamp.textContent = new Date(message.created_at).toLocaleString();
                    timestamp.style.fontSize = '0.8em';
                    timestamp.style.color = '#854D27';
                    
                    messageHeader.appendChild(senderName);
                    messageHeader.appendChild(timestamp);
                    
                        const videoTitle = document.createElement('h3');
                        videoTitle.textContent = message.video_name || `ビデオ #${index + 1}`;
                        videoTitle.style.margin = '0 0 10px 0';
                        videoTitle.style.color = '#854D27';
                    
                    const videoPlayer = document.createElement('video');
                    videoPlayer.controls = true;
                    videoPlayer.style.width = '100%';
                    videoPlayer.style.maxHeight = '400px';
                        videoPlayer.style.backgroundColor = '#000';
                        videoPlayer.src = message.video_url;
                        videoPlayer.preload = 'metadata';
                    
                    messageItem.appendChild(messageHeader);
                        messageItem.appendChild(videoTitle);
                    messageItem.appendChild(videoPlayer);
                    messagesList.appendChild(messageItem);
                });
            }
            })
            .catch(error => {
                messagesList.innerHTML = '';
                const errorMsg = document.createElement('p');
                errorMsg.textContent = 'ビデオ読み込みエラー: ' + error.message;
                errorMsg.style.textAlign = 'center';
                errorMsg.style.color = 'red';
                messagesList.appendChild(errorMsg);
                console.error('ビデオ取得エラー:', error);
            });
    }
}

function playVideoMessage(videoUrl) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.style.width = '100%';
    video.style.maxHeight = '80vh';
    
    const videoContainer = document.createElement('div');
    videoContainer.style.position = 'fixed';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    videoContainer.style.display = 'flex';
    videoContainer.style.justifyContent = 'center';
    videoContainer.style.alignItems = 'center';
    videoContainer.style.zIndex = '1100';
    
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '30px';
    closeBtn.style.fontSize = '40px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#fff';
    closeBtn.addEventListener('click', () => {
        video.pause();
        document.body.removeChild(videoContainer);
    });
    
    videoContainer.appendChild(video);
    videoContainer.appendChild(closeBtn);
    document.body.appendChild(videoContainer);
    
    video.play().catch(error => {
        console.error('ビデオ再生エラー:', error);
        alert('ビデオを再生できません。もう一度お試しください。');
    });
}

function initCommunityFeatures() {
    initBulletinBoard();
    
    initCustomMessage();
    
    setupChatRealtime();
    const container = document.querySelector('.container');
    
    if (container) {
        const chatButton = document.createElement('button');
        chatButton.id = 'openChatBtn';
        chatButton.textContent = '💬 グループチャット';
        chatButton.classList.add('feature-button');
        chatButton.style.position = 'fixed';
        chatButton.style.bottom = '20px';
        chatButton.style.right = '20px';
        chatButton.style.zIndex = '100';
        
        chatButton.addEventListener('click', checkUserNameAndOpenChat);
        
        document.body.appendChild(chatButton);
    }
}

function checkUserNameAndOpenChat() {
    const userName = localStorage.getItem('birthdayChatUserName');
    
    if (userName) {
        openChatRoomModal(userName);
    } else {
        openUserNameModal();
    }
}

function openUserNameModal() {
    let userNameModal = document.getElementById('userNameModal');
    
    if (!userNameModal) {
        userNameModal = document.createElement('div');
        userNameModal.id = 'userNameModal';
        userNameModal.style.position = 'fixed';
        userNameModal.style.top = '0';
        userNameModal.style.left = '0';
        userNameModal.style.width = '100%';
        userNameModal.style.height = '100%';
        userNameModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        userNameModal.style.display = 'none';
        userNameModal.style.justifyContent = 'center';
        userNameModal.style.alignItems = 'center';
        userNameModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            userNameModal.style.display = 'none';
        });
        
        const title = document.createElement('h2');
        title.textContent = 'Nhập Tên Của Bạn';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const userNameInput = document.createElement('input');
        userNameInput.id = 'chatUserNameInput';
        userNameInput.type = 'text';
        userNameInput.placeholder = 'Tên của bạn...';
        userNameInput.style.width = '100%';
        userNameInput.style.padding = '10px';
        userNameInput.style.border = '2px solid #D4B08C';
        userNameInput.style.borderRadius = '0';
        userNameInput.style.marginBottom = '20px';
        userNameInput.style.fontFamily = '\'Old Standard TT\', serif';
        userNameInput.style.fontSize = '16px';
        userNameInput.style.background = '#FFF9F3';
        userNameInput.style.color = '#2C1810';
        
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'チャットに参加';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.background = '#854D27';
        submitBtn.style.color = '#FFF9F3';
        submitBtn.style.border = '2px solid #D4B08C';
        submitBtn.style.borderRadius = '0';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.fontSize = '1.1em';
        submitBtn.style.transition = 'all 0.3s';
        submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        submitBtn.style.display = 'block';
        submitBtn.style.margin = '0 auto';
        
        submitBtn.addEventListener('click', () => {
            const userName = document.getElementById('chatUserNameInput').value.trim();
            
            if (userName) {
                saveUsername(userName);
                userNameModal.style.display = 'none';
                openChatRoomModal(userName);
            } else {
                alert('Vui lòng nhập tên của bạn!');
            }
        });
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(userNameInput);
        modalContent.appendChild(submitBtn);
        
        userNameModal.appendChild(modalContent);
        document.body.appendChild(userNameModal);
    }
    
    const userNameInput = document.getElementById('chatUserNameInput');
    if (userNameInput) {
        userNameInput.value = '';
    }
    
    userNameModal.style.display = 'flex';
}

function openChatRoomModal(userName) {
    let chatModal = document.getElementById('chatRoomModal');
    
    if (!chatModal) {
        chatModal = document.createElement('div');
        chatModal.id = 'chatRoomModal';
        chatModal.style.position = 'fixed';
        chatModal.style.bottom = '20px';
        chatModal.style.right = '20px';
        chatModal.style.width = '350px';
        chatModal.style.height = '500px';
        chatModal.style.backgroundColor = '#FFF9F3';
        chatModal.style.border = '3px solid #D4B08C';
        chatModal.style.boxShadow = '10px 10px 0 #D4B08C';
        chatModal.style.display = 'none';
        chatModal.style.flexDirection = 'column';
        chatModal.style.zIndex = '990';
        
        const chatHeader = document.createElement('div');
        chatHeader.style.background = '#854D27';
        chatHeader.style.color = '#FFF9F3';
        chatHeader.style.padding = '10px';
        chatHeader.style.display = 'flex';
        chatHeader.style.justifyContent = 'space-between';
        chatHeader.style.alignItems = 'center';
        
        const chatTitle = document.createElement('h3');
        chatTitle.textContent = '誕生日グループチャット';
        chatTitle.style.margin = '0';
        chatTitle.style.fontSize = '1.2em';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            chatModal.style.display = 'none';
        });
        
        const minimizeBtn = document.createElement('span');
        minimizeBtn.textContent = '_';
        minimizeBtn.style.fontSize = '24px';
        minimizeBtn.style.fontWeight = 'bold';
        minimizeBtn.style.cursor = 'pointer';
        minimizeBtn.style.marginRight = '10px';
        minimizeBtn.style.lineHeight = '18px';
        minimizeBtn.addEventListener('click', () => {
            if (chatContent.style.display === 'none') {
                chatContent.style.display = 'flex';
                chatInput.style.display = 'flex';
                chatModal.style.height = '500px';
            } else {
                chatContent.style.display = 'none';
                chatInput.style.display = 'none';
                chatModal.style.height = 'auto';
            }
        });
        
        const headerControls = document.createElement('div');
        headerControls.appendChild(minimizeBtn);
        headerControls.appendChild(closeBtn);
        
        chatHeader.appendChild(chatTitle);
        chatHeader.appendChild(headerControls);
        
        const chatContent = document.createElement('div');
        chatContent.id = 'chatMessages';
        chatContent.style.flex = '1';
        chatContent.style.padding = '10px';
        chatContent.style.overflowY = 'auto';
        chatContent.style.display = 'flex';
        chatContent.style.flexDirection = 'column';
        chatContent.style.gap = '10px';
        
        const chatInput = document.createElement('div');
        chatInput.style.display = 'flex';
        chatInput.style.padding = '10px';
        chatInput.style.borderTop = '2px solid #D4B08C';
        
        const messageInput = document.createElement('input');
        messageInput.id = 'chatMessageInput';
        messageInput.type = 'text';
        messageInput.placeholder = 'メッセージを入力...';
        messageInput.style.flex = '1';
        messageInput.style.padding = '10px';
        messageInput.style.border = '2px solid #D4B08C';
        messageInput.style.borderRight = 'none';
        messageInput.style.borderRadius = '0';
        messageInput.style.fontFamily = '\'Old Standard TT\', serif';
        messageInput.style.fontSize = '16px';
        messageInput.style.background = '#FFF9F3';
        messageInput.style.color = '#2C1810';
        
        const sendBtn = document.createElement('button');
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        sendBtn.style.padding = '10px 15px';
        sendBtn.style.background = '#854D27';
        sendBtn.style.color = '#FFF9F3';
        sendBtn.style.border = '2px solid #D4B08C';
        sendBtn.style.borderRadius = '0';
        sendBtn.style.cursor = 'pointer';
        sendBtn.style.fontSize = '1.1em';
        
        const sendMessage = () => {
            const messageText = messageInput.value.trim();
            
            if (messageText) {
                sendChatMessage(userName, messageText);
                messageInput.value = '';
            }
        };
        
        sendBtn.addEventListener('click', sendMessage);
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        messageInput.placeholder = 'Enter your message...';
        
        chatInput.appendChild(messageInput);
        chatInput.appendChild(sendBtn);
        
        chatModal.appendChild(chatHeader);
        chatModal.appendChild(chatContent);
        chatModal.appendChild(chatInput);
        
        document.body.appendChild(chatModal);
        
        loadChatHistory();
    }
    
    chatModal.style.display = 'flex';
}

async function loadChatHistory() {
    try {
    const chatMessages = document.getElementById('chatMessages');
    
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        if (messages && messages.length > 0) {
            const currentUserName = localStorage.getItem('birthdayChatUserName');
            
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.style.padding = '10px';
                messageDiv.style.borderRadius = '5px';
                messageDiv.style.maxWidth = '80%';
                messageDiv.style.wordBreak = 'break-word';
                messageDiv.style.marginBottom = '10px';
                
                if (msg.sender === currentUserName) {
                    messageDiv.style.alignSelf = 'flex-end';
                    messageDiv.style.background = '#D4B08C';
                    messageDiv.style.color = '#2C1810';
                } else {
                    messageDiv.style.alignSelf = 'flex-start';
                    messageDiv.style.background = '#F5E6D8';
                    messageDiv.style.color = '#2C1810';
                }
                
                const senderSpan = document.createElement('div');
                senderSpan.textContent = msg.sender;
                senderSpan.style.fontWeight = 'bold';
                senderSpan.style.marginBottom = '5px';
                senderSpan.style.fontSize = '0.9em';
                
                const timeSpan = document.createElement('div');
                const msgTime = new Date(msg.created_at);
                timeSpan.textContent = msgTime.toLocaleTimeString();
                timeSpan.style.fontSize = '0.7em';
                timeSpan.style.textAlign = 'right';
                timeSpan.style.marginTop = '5px';
                
                messageDiv.appendChild(senderSpan);
                messageDiv.appendChild(document.createTextNode(msg.text));
                messageDiv.appendChild(timeSpan);
                
                chatMessages.appendChild(messageDiv);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('Lỗi khi tải lịch sử chat:', error);
        

        const chatMessages = document.getElementById('chatMessages');
        const messagesData = localStorage.getItem('birthdayChatMessages');
        
        if (chatMessages && messagesData) {
            const messages = JSON.parse(messagesData);
            
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.style.padding = '10px';
                messageDiv.style.borderRadius = '5px';
                messageDiv.style.maxWidth = '80%';
                messageDiv.style.wordBreak = 'break-word';
                messageDiv.style.marginBottom = '10px';
                
                if (msg.sender === localStorage.getItem('birthdayChatUserName')) {
                    messageDiv.style.alignSelf = 'flex-end';
                    messageDiv.style.background = '#D4B08C';
                    messageDiv.style.color = '#2C1810';
                } else {
                    messageDiv.style.alignSelf = 'flex-start';
                    messageDiv.style.background = '#F5E6D8';
                    messageDiv.style.color = '#2C1810';
                }
                
                const senderSpan = document.createElement('div');
                senderSpan.textContent = msg.sender;
                senderSpan.style.fontWeight = 'bold';
                senderSpan.style.marginBottom = '5px';
                senderSpan.style.fontSize = '0.9em';
                
                const timeSpan = document.createElement('div');
                const msgTime = new Date(msg.created_at);
                timeSpan.textContent = msgTime.toLocaleTimeString();
                timeSpan.style.fontSize = '0.7em';
                timeSpan.style.textAlign = 'right';
                timeSpan.style.marginTop = '5px';
                
                messageDiv.appendChild(senderSpan);
                messageDiv.appendChild(document.createTextNode(msg.text));
                messageDiv.appendChild(timeSpan);
                
                chatMessages.appendChild(messageDiv);
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

async function sendChatMessage(sender, text) {
    try {
        const messageData = { 
            sender: sender,
            text: text,
            created_at: new Date().toISOString()
        };
        
        appendNewChatMessage(messageData);
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([messageData]);
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('メッセージ送信エラー:', error);
        const chatMessages = JSON.parse(localStorage.getItem('birthdayChatMessages') || '[]');
        chatMessages.push({
            sender: sender,
            text: text,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('birthdayChatMessages', JSON.stringify(chatMessages));
        
        return false;
    }
}

function setupChatRealtime() {
    try {
        const chatChannel = supabase
            .channel('public:chat_messages')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    appendNewChatMessage(payload.new);
                }
            )
            .subscribe();
            
        console.log('チャット用リアルタイムチャンネルを設定しました');
    } catch (error) {
        console.error('チャットリアルタイム設定エラー:', error);
    }
}

function appendNewChatMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const currentUserName = localStorage.getItem('birthdayChatUserName');
    
    const messageDiv = document.createElement('div');
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.maxWidth = '80%';
    messageDiv.style.wordBreak = 'break-word';
    messageDiv.style.marginBottom = '10px';
    
    if (message.sender === currentUserName) {
        messageDiv.style.alignSelf = 'flex-end';
        messageDiv.style.background = '#D4B08C';
        messageDiv.style.color = '#2C1810';
    } else {
        messageDiv.style.alignSelf = 'flex-start';
        messageDiv.style.background = '#F5E6D8';
        messageDiv.style.color = '#2C1810';
    }
    
    const senderSpan = document.createElement('div');
    senderSpan.textContent = message.sender;
    senderSpan.style.fontWeight = 'bold';
    senderSpan.style.marginBottom = '5px';
    senderSpan.style.fontSize = '0.9em';
    
    const timeSpan = document.createElement('div');
    const msgTime = new Date(message.created_at);
    timeSpan.textContent = msgTime.toLocaleTimeString();
    timeSpan.style.fontSize = '0.7em';
    timeSpan.style.textAlign = 'right';
    timeSpan.style.marginTop = '5px';
    
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(document.createTextNode(message.text));
    messageDiv.appendChild(timeSpan);
    
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function initInviteFriends() {
    const container = document.querySelector('.container');
    
    if (container) {
        const inviteButton = document.createElement('button');
        inviteButton.id = 'inviteFriendsBtn';
        inviteButton.textContent = '👥 友達を招待';
        inviteButton.classList.add('feature-button');
        inviteButton.style.position = 'fixed';
        inviteButton.style.bottom = '70px';
        inviteButton.style.right = '20px';
        inviteButton.style.zIndex = '100';
        
        inviteButton.addEventListener('click', openInviteModal);
        
        document.body.appendChild(inviteButton);
    }
}

function openInviteModal() {
    let inviteModal = document.getElementById('inviteModal');
    
    if (!inviteModal) {
        inviteModal = document.createElement('div');
        inviteModal.id = 'inviteModal';
        inviteModal.style.position = 'fixed';
        inviteModal.style.top = '0';
        inviteModal.style.left = '0';
        inviteModal.style.width = '100%';
        inviteModal.style.height = '100%';
        inviteModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        inviteModal.style.display = 'none';
        inviteModal.style.justifyContent = 'center';
        inviteModal.style.alignItems = 'center';
        inviteModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            inviteModal.style.display = 'none';
        });
        
        const title = document.createElement('h2');
        title.textContent = '友達を招待して参加してもらいましょう';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const description = document.createElement('p');
        const nextBirthdayPerson = localStorage.getItem('nextBirthdayPerson');
        const nextBirthdayDate = localStorage.getItem('nextBirthdayDate');
        
        let birthdayPersonName = '大切な人';
        let birthdayDateText = '';
        
        if (nextBirthdayPerson) {
            try {
                const person = JSON.parse(nextBirthdayPerson);
                birthdayPersonName = person.name || '大切な人';
            } catch (e) {
                console.error('誕生日情報読み込みエラー:', e);
            }
        }
        
        if (nextBirthdayDate) {
            try {
                const date = new Date(nextBirthdayDate);
                birthdayDateText = ` ${date.getMonth() + 1}月${date.getDate()}日に`;
            } catch (e) {
                console.error('誕生日読み込みエラー:', e);
            }
        }
        
        description.textContent = `友達を招待して${birthdayPersonName}の誕生日${birthdayDateText}一緒にお祝いしましょう！みんなで素敵な思い出を作り、心のこもったお祝いのメッセージを送りましょう。`;
        description.style.marginBottom = '20px';
        
        const linkSection = document.createElement('div');
        linkSection.style.marginBottom = '30px';
        
        const linkLabel = document.createElement('div');
        linkLabel.textContent = '招待リンク：';
        linkLabel.style.fontWeight = 'bold';
        linkLabel.style.marginBottom = '10px';
        
        const linkDisplay = document.createElement('div');
        linkDisplay.style.display = 'flex';
        linkDisplay.style.marginBottom = '10px';
        
        const linkInput = document.createElement('input');
        linkInput.id = 'inviteLinkInput';
        linkInput.type = 'text';
        linkInput.readOnly = true;
        linkInput.value = generateInviteLink();
        linkInput.style.flex = '1';
        linkInput.style.padding = '10px';
        linkInput.style.border = '2px solid #D4B08C';
        linkInput.style.borderRight = 'none';
        linkInput.style.borderRadius = '0';
        linkInput.style.fontFamily = '\'Old Standard TT\', serif';
        linkInput.style.fontSize = '14px';
        linkInput.style.background = '#FFF9F3';
        linkInput.style.color = '#2C1810';
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 コピー';
        copyBtn.style.padding = '10px 15px';
        copyBtn.style.background = '#854D27';
        copyBtn.style.color = '#FFF9F3';
        copyBtn.style.border = '2px solid #D4B08C';
        copyBtn.style.borderRadius = '0';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.fontSize = '0.9em';
        copyBtn.addEventListener('click', () => {
            linkInput.select();
            document.execCommand('copy');
            copyBtn.textContent = '✓ コピー完了';
            setTimeout(() => {
                copyBtn.textContent = '📋 コピー';
            }, 2000);
        });
        
        linkDisplay.appendChild(linkInput);
        linkDisplay.appendChild(copyBtn);
        
        const shareLabel = document.createElement('div');
        shareLabel.textContent = 'シェアする：';
        shareLabel.style.fontWeight = 'bold';
        shareLabel.style.marginBottom = '10px';
        shareLabel.style.marginTop = '20px';
        
        const socialShare = document.createElement('div');
        socialShare.style.display = 'flex';
        socialShare.style.gap = '10px';
        socialShare.style.marginBottom = '20px';
        
        const platforms = [
            { name: 'Facebook', icon: 'facebook-f', color: '#1877f2' },
            { name: 'Twitter', icon: 'x-twitter', color: '#000000' },
            { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366' }
        ];
        
        platforms.forEach(platform => {
            const shareBtn = document.createElement('button');
            shareBtn.innerHTML = `<i class="fab fa-${platform.icon}"></i>`;
            shareBtn.style.width = '40px';
            shareBtn.style.height = '40px';
            shareBtn.style.borderRadius = '50%';
            shareBtn.style.background = '#fff';
            shareBtn.style.border = `2px solid ${platform.color}`;
            shareBtn.style.color = platform.color;
            shareBtn.style.fontSize = '1.2em';
            shareBtn.style.cursor = 'pointer';
            shareBtn.style.display = 'flex';
            shareBtn.style.justifyContent = 'center';
            shareBtn.style.alignItems = 'center';
            shareBtn.title = `${platform.name}でシェア`;
            
            shareBtn.addEventListener('click', () => {
                const link = linkInput.value;
                let shareUrl = '';
                
                switch (platform.name) {
                    case 'Facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
                        break;
                    case 'Twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent('一緒に誕生日をお祝いしましょう！')}`;
                        break;
                    case 'WhatsApp':
                        shareUrl = `https://wa.me/?text=${encodeURIComponent('一緒に誕生日をお祝いしましょう！ ' + link)}`;
                        break;
                }
                
                window.open(shareUrl, '_blank');
            });
            
            socialShare.appendChild(shareBtn);
        });
        
        const emailSection = document.createElement('div');
        
        const emailLabel = document.createElement('div');
        emailLabel.textContent = 'メールで招待状を送る：';
        emailLabel.style.fontWeight = 'bold';
        emailLabel.style.marginBottom = '10px';
        
        const emailInput = document.createElement('input');
        emailInput.id = 'inviteEmailInput';
        emailInput.type = 'email';
        emailInput.placeholder = '受信者のメールアドレス...';
        emailInput.style.width = '100%';
        emailInput.style.padding = '10px';
        emailInput.style.border = '2px solid #D4B08C';
        emailInput.style.borderRadius = '0';
        emailInput.style.marginBottom = '10px';
        emailInput.style.fontFamily = '\'Old Standard TT\', serif';
        emailInput.style.fontSize = '16px';
        emailInput.style.background = '#FFF9F3';
        emailInput.style.color = '#2C1810';
        
        const messageInput = document.createElement('textarea');
        messageInput.id = 'inviteMessageInput';
        messageInput.placeholder = '個人メッセージ（任意）...';
        messageInput.style.width = '100%';
        messageInput.style.padding = '10px';
        messageInput.style.border = '2px solid #D4B08C';
        messageInput.style.borderRadius = '0';
        messageInput.style.marginBottom = '10px';
        messageInput.style.fontFamily = '\'Old Standard TT\', serif';
        messageInput.style.fontSize = '16px';
        messageInput.style.background = '#FFF9F3';
        messageInput.style.color = '#2C1810';
        messageInput.style.resize = 'vertical';
        messageInput.style.minHeight = '100px';
        
        const sendEmailBtn = document.createElement('button');
        sendEmailBtn.textContent = '📧 招待状を送る';
        sendEmailBtn.style.padding = '10px 20px';
        sendEmailBtn.style.background = '#854D27';
        sendEmailBtn.style.color = '#FFF9F3';
        sendEmailBtn.style.border = '2px solid #D4B08C';
        sendEmailBtn.style.borderRadius = '0';
        sendEmailBtn.style.cursor = 'pointer';
        sendEmailBtn.style.fontSize = '1.1em';
        sendEmailBtn.style.transition = 'all 0.3s';
        sendEmailBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        sendEmailBtn.style.display = 'block';
        sendEmailBtn.style.margin = '0 auto';
        
        sendEmailBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();
            
            if (email) {
                sendInviteEmail(email, message);
                emailInput.value = '';
                messageInput.value = '';
            } else {
                alert('受信者のメールアドレスを入力してください！');
            }
        });
        
        emailSection.appendChild(emailLabel);
        emailSection.appendChild(emailInput);
        emailSection.appendChild(messageInput);
        emailSection.appendChild(sendEmailBtn);
        
        linkSection.appendChild(linkLabel);
        linkSection.appendChild(linkDisplay);
        linkSection.appendChild(shareLabel);
        linkSection.appendChild(socialShare);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(linkSection);
        modalContent.appendChild(emailSection);
        
        inviteModal.appendChild(modalContent);
        document.body.appendChild(inviteModal);
    }
    
    inviteModal.style.display = 'flex';
}

function generateInviteLink() {
    return window.location.href;
}

function sendInviteEmail(email, message) {
    const link = generateInviteLink();
    const subject = '誕生日お祝いに参加しませんか';
    const defaultMessage = 'こんにちは！\n\n誕生日のお祝いに一緒に参加しませんか？下記のリンクをクリックして参加してください：\n\n';
    const fullMessage = defaultMessage + link + (message ? '\n\n' + message : '');
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.open(mailtoLink);
}

function openUserNameModalForGift() {
    let userNameModal = document.getElementById('userNameModal');
    
    if (!userNameModal) {
        userNameModal = document.createElement('div');
        userNameModal.id = 'userNameModal';
        userNameModal.style.position = 'fixed';
        userNameModal.style.top = '0';
        userNameModal.style.left = '0';
        userNameModal.style.width = '100%';
        userNameModal.style.height = '100%';
        userNameModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        userNameModal.style.display = 'none';
        userNameModal.style.justifyContent = 'center';
        userNameModal.style.alignItems = 'center';
        userNameModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            userNameModal.style.display = 'none';
        });
        
        const title = document.createElement('h2');
        title.textContent = 'あなたの名前を入力してください';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const userNameInput = document.createElement('input');
        userNameInput.id = 'chatUserNameInput';
        userNameInput.type = 'text';
        userNameInput.placeholder = 'あなたの名前...';
        userNameInput.style.width = '100%';
        userNameInput.style.padding = '10px';
        userNameInput.style.border = '2px solid #D4B08C';
        userNameInput.style.borderRadius = '0';
        userNameInput.style.marginBottom = '20px';
        userNameInput.style.fontFamily = '\'Old Standard TT\', serif';
        userNameInput.style.fontSize = '16px';
        userNameInput.style.background = '#FFF9F3';
        userNameInput.style.color = '#2C1810';
        
        const submitBtn = document.createElement('button');
        submitBtn.textContent = '確認';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.background = '#854D27';
        submitBtn.style.color = '#FFF9F3';
        submitBtn.style.border = '2px solid #D4B08C';
        submitBtn.style.borderRadius = '0';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.fontSize = '1.1em';
        submitBtn.style.transition = 'all 0.3s';
        submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        submitBtn.style.display = 'block';
        submitBtn.style.margin = '0 auto';
        
        submitBtn.addEventListener('click', () => {
            const userName = document.getElementById('chatUserNameInput').value.trim();
            
            if (userName) {
                saveUsername(userName);
                userNameModal.style.display = 'none';
                openVirtualGiftModal(userName);
            } else {
                alert('名前を入力してください！');
            }
        });
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(userNameInput);
        modalContent.appendChild(submitBtn);
        
        userNameModal.appendChild(modalContent);
        document.body.appendChild(userNameModal);
    }
    
    const userNameInput = document.getElementById('chatUserNameInput');
    if (userNameInput) {
        userNameInput.value = '';
    }
    
    userNameModal.style.display = 'flex';
}

function openVirtualGiftModal(userName) {
    const virtualGiftModal = document.getElementById('virtualGiftModal');
    const giftSender = document.getElementById('giftSender');
    
    if (virtualGiftModal) {
        if (giftSender && userName) {
            giftSender.value = userName;
        }
        
        virtualGiftModal.style.display = 'flex';
        
        loadGiftList();
    } else {
        console.error('ギフト選択モーダルが見つかりません');
    }
}

function openUserNameModalForBulletin() {
    let userNameModal = document.getElementById('userNameModal');
    
    if (!userNameModal) {
        userNameModal = document.createElement('div');
        userNameModal.id = 'userNameModal';
        userNameModal.style.position = 'fixed';
        userNameModal.style.top = '0';
        userNameModal.style.left = '0';
        userNameModal.style.width = '100%';
        userNameModal.style.height = '100%';
        userNameModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        userNameModal.style.display = 'none';
        userNameModal.style.justifyContent = 'center';
        userNameModal.style.alignItems = 'center';
        userNameModal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.style.background = '#FFF9F3';
        modalContent.style.padding = '30px';
        modalContent.style.border = '3px solid #D4B08C';
        modalContent.style.boxShadow = '10px 10px 0 #D4B08C';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.position = 'relative';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '20px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.color = '#854D27';
        closeBtn.addEventListener('click', () => {
            userNameModal.style.display = 'none';
        });
        
        const title = document.createElement('h2');
        title.textContent = 'あなたの名前を入力してください';
        title.style.color = '#854D27';
        title.style.marginBottom = '20px';
        title.style.fontFamily = '\'DM Serif Display\', serif';
        
        const userNameInput = document.createElement('input');
        userNameInput.id = 'chatUserNameInput';
        userNameInput.type = 'text';
        userNameInput.placeholder = 'あなたの名前...';
        userNameInput.style.width = '100%';
        userNameInput.style.padding = '10px';
        userNameInput.style.border = '2px solid #D4B08C';
        userNameInput.style.borderRadius = '0';
        userNameInput.style.marginBottom = '20px';
        userNameInput.style.fontFamily = '\'Old Standard TT\', serif';
        userNameInput.style.fontSize = '16px';
        userNameInput.style.background = '#FFF9F3';
        userNameInput.style.color = '#2C1810';
        
        const submitBtn = document.createElement('button');
        submitBtn.textContent = '掲示板に参加';
        submitBtn.style.padding = '10px 20px';
        submitBtn.style.background = '#854D27';
        submitBtn.style.color = '#FFF9F3';
        submitBtn.style.border = '2px solid #D4B08C';
        submitBtn.style.borderRadius = '0';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.fontSize = '1.1em';
        submitBtn.style.transition = 'all 0.3s';
        submitBtn.style.boxShadow = '4px 4px 0 #D4B08C';
        submitBtn.style.display = 'block';
        submitBtn.style.margin = '0 auto';
        
        submitBtn.addEventListener('click', () => {
            const userName = document.getElementById('chatUserNameInput').value.trim();
            
            if (userName) {
                saveUsername(userName);
                userNameModal.style.display = 'none';
                const bulletinModal = document.getElementById('bulletinBoardModal');
                if (bulletinModal) {
                    bulletinModal.style.display = 'flex';
                }
            } else {
                alert('名前を入力してください！');
            }
        });
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(userNameInput);
        modalContent.appendChild(submitBtn);
        
        userNameModal.appendChild(modalContent);
        document.body.appendChild(userNameModal);
    }
    
    const userNameInput = document.getElementById('chatUserNameInput');
    if (userNameInput) {
        userNameInput.value = '';
    }
    
    userNameModal.style.display = 'flex';
}
