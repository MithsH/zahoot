let stompClient = null;
let currentRoom = null;
let playerName = null;
let myScore = 0;

let currentQuestion = null;
let selectedOptionIndex = null;
let isAnswerLocked = false;
let questionTimer = null;
let knownPlayersCount = 0;

function showToast(message, type = 'success', icon = '✨') {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-card toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3500);
}

function connect(room, onConnectCallback) {
    const wsUrl = window.location.origin.includes('8080') ? '/quiz-websocket' : 'http://localhost:8080/quiz-websocket';
    const socket = new SockJS(wsUrl);
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {
        console.log(`Connected to room ${room}`);
        
        stompClient.subscribe(`/topic/${room}/question`, (msg) => {
            const question = JSON.parse(msg.body);
            showToast("🚀 New question pushed live!", "success", "🚀");
            showQuestion(question);
        });

        stompClient.subscribe(`/topic/${room}/leaderboard`, (msg) => {
            const players = JSON.parse(msg.body);
            updateLeaderboard(players);
        });

        stompClient.subscribe(`/topic/${room}/players`, (msg) => {
            const players = JSON.parse(msg.body);
            console.log("Players updated:", players);

            if (Array.isArray(players) && players.length > knownPlayersCount) {
                const newestPlayer = players[players.length - 1];
                if (newestPlayer && newestPlayer.name !== playerName) {
                    showToast(`🎮 ${newestPlayer.name} joined the room!`, "success", "🎮");
                }
                knownPlayersCount = players.length;
            }
            updateLeaderboard(players);
        });

        if (onConnectCallback) {
            onConnectCallback();
        }
    }, (error) => {
        console.error("STOMP connection error:", error);
        showToast("Could not connect to server. Ensure backend is running.", "error", "❌");
    });
}

function connectAsHost() {
    currentRoom = document.getElementById("roomCode").value.trim();
    if (!currentRoom) {
        showToast("Please enter a room code.", "warning", "⚠️");
        return;
    }
    connect(currentRoom, () => {
        showToast(`Connected to room '${currentRoom}' as Host!`, "success", "👑");
        const connectBtn = document.querySelector(".room-setup-box button");
        if (connectBtn) {
            connectBtn.innerText = "Connected!";
            connectBtn.style.background = "#00C853";
        }
    });
}

function sendStructuredQuestion() {
    if (!stompClient || !stompClient.connected) {
        showToast("Please enter a room code and connect as Host first.", "warning", "⚠️");
        return;
    }

    const questionText = document.getElementById("qtext").value.trim();
    const options = [
        document.getElementById("opt0").value.trim(),
        document.getElementById("opt1").value.trim(),
        document.getElementById("opt2").value.trim(),
        document.getElementById("opt3").value.trim()
    ];
    const correctOptionIndex = parseInt(document.getElementById("correctIndex").value);

    if (!questionText || options.some(opt => !opt) || isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > 3) {
        showToast("Please fill all question fields correctly.", "warning", "⚠️");
        return;
    }

    const question = {
        questionText,
        options,
        correctOptionIndex,
        durationSeconds: 15
    };

    stompClient.send(`/app/question/${currentRoom}`, {}, JSON.stringify(question));

    // Clear fields
    document.getElementById("qtext").value = "";
    options.forEach((_, i) => document.getElementById(`opt${i}`).value = "");
    document.getElementById("correctIndex").value = "";
    showToast("Question sent to all players!", "success", "🚀");
}

function joinRoom() {
    playerName = document.getElementById("playerName").value.trim();
    currentRoom = document.getElementById("roomCode").value.trim();

    if (!playerName || !currentRoom) {
        showToast("Please enter your name and room code.", "warning", "⚠️");
        return;
    }

    connect(currentRoom, () => {
        stompClient.send(`/app/join/${currentRoom}`, {}, JSON.stringify({ name: playerName }));

        showToast(`Joined room '${currentRoom}' successfully!`, "success", "🎉");

        const joinSec = document.getElementById("joinSection");
        const gameLayout = document.getElementById("gameLayout");
        
        if (joinSec) joinSec.style.display = "none";
        if (gameLayout) gameLayout.style.display = "grid";

        if (document.getElementById("displayName")) {
            document.getElementById("displayName").innerText = playerName;
        }
        if (document.getElementById("displayRoomCode")) {
            document.getElementById("displayRoomCode").innerText = currentRoom;
        }
    });
}

function showQuestion(question) {
    currentQuestion = question;
    selectedOptionIndex = null;
    isAnswerLocked = false;

    if (questionTimer) {
        clearInterval(questionTimer);
    }

    const qArea = document.getElementById("questionArea") || document.getElementById("gameLayout");
    if (qArea) qArea.style.display = qArea.classList.contains('game-layout') ? 'grid' : 'block';

    const qTextEl = document.getElementById("questionText");
    if (qTextEl) qTextEl.innerText = question.questionText;

    const banner = document.getElementById("statusBanner");
    if (banner) {
        banner.className = "answer-status-banner";
        banner.style.display = "none";
        banner.innerText = "";
    }

    const optionsDiv = document.getElementById("options");
    if (!optionsDiv) return;
    
    optionsDiv.innerHTML = "";

    question.options.forEach((opt, index) => {
        const card = document.createElement("div");
        card.className = "option-card";
        card.innerText = opt;
        card.setAttribute("data-index", index);
        
        card.onclick = () => selectOption(index, card, optionsDiv);
        
        optionsDiv.appendChild(card);
    });

    startQuestionTimer(question.durationSeconds || 15);
}

function selectOption(index, selectedCard, optionsDiv) {
    if (isAnswerLocked) return;

    isAnswerLocked = true;
    selectedOptionIndex = index;

    const allCards = optionsDiv.querySelectorAll(".option-card");
    allCards.forEach((c, i) => {
        if (i === index) {
            c.classList.add("selected");
        } else {
            c.classList.add("disabled");
        }
    });

    const banner = document.getElementById("statusBanner");
    if (banner) {
        banner.className = "answer-status-banner locked";
        banner.innerText = "🔒 Choice Locked! Points will be awarded when the timer finishes...";
    }

    if (stompClient && stompClient.connected && currentRoom && playerName) {
        stompClient.send(`/app/answer/${currentRoom}`, {}, JSON.stringify({
            name: playerName,
            answer: index
        }));
    }
}

function startQuestionTimer(duration) {
    let timeLeft = duration;
    const timerText = document.getElementById("timerSeconds");
    const timerBadge = document.getElementById("timerBadge");

    if (timerText) timerText.innerText = timeLeft;
    if (timerBadge) timerBadge.classList.remove("urgent");

    questionTimer = setInterval(() => {
        timeLeft--;
        if (timerText) timerText.innerText = timeLeft;

        if (timeLeft <= 5 && timerBadge) {
            timerBadge.classList.add("urgent");
        }

        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            onTimerTimeout();
        }
    }, 1000);
}

function onTimerTimeout() {
    const optionsDiv = document.getElementById("options");
    const banner = document.getElementById("statusBanner");

    isAnswerLocked = true;

    if (optionsDiv && currentQuestion) {
        const allCards = optionsDiv.querySelectorAll(".option-card");
        const correctIdx = currentQuestion.correctOptionIndex;

        allCards.forEach((card, idx) => {
            card.classList.add("disabled");
            if (idx === correctIdx) {
                card.classList.add("correct-reveal");
            } else if (selectedOptionIndex !== null && idx === selectedOptionIndex && idx !== correctIdx) {
                card.classList.remove("selected");
                card.classList.add("incorrect-selected");
            }
        });

        if (banner) {
            if (selectedOptionIndex === correctIdx) {
                banner.className = "answer-status-banner correct";
                banner.innerText = "🎉 Correct Answer! +100 Points Awarded!";
                showToast("🎉 Correct Answer! +100 Points!", "success", "🏆");
            } else if (selectedOptionIndex !== null) {
                banner.className = "answer-status-banner incorrect";
                banner.innerText = "❌ Incorrect! The correct answer is highlighted.";
                showToast("❌ Incorrect Answer!", "error", "❌");
            } else {
                banner.className = "answer-status-banner incorrect";
                banner.innerText = "⏰ Time's Up! No answer was selected.";
                showToast("⏰ Time's Up!", "warning", "⏳");
            }
        }
    }

    if (stompClient && stompClient.connected && currentRoom) {
        stompClient.send(`/app/evaluate/${currentRoom}`, {}, {});
    }
}

function updateLeaderboard(players) {
    const board = document.getElementById("leaderboard");
    if (!board || !Array.isArray(players)) return;
    board.innerHTML = "";

    const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

    sorted.forEach((p, idx) => {
        const li = document.createElement("li");
        const isMe = p.name === playerName;
        li.className = `leaderboard-item ${isMe ? 'is-me' : ''}`;

        const rankClass = idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : ''));
        
        li.innerHTML = `
            <div class="leaderboard-left">
                <span class="rank-pill ${rankClass}">${idx + 1}</span>
                <span class="lb-player-name">${escapeHtml(p.name)} ${isMe ? '(You)' : ''}</span>
            </div>
            <span class="lb-player-score">${p.score || 0} pts</span>
        `;
        board.appendChild(li);

        if (isMe && document.getElementById("playerScore")) {
            myScore = p.score || 0;
            document.getElementById("playerScore").innerText = myScore;
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
