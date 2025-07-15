let stompClient = null;
let currentRoom = null;
let playerName = null;

function connect(room) {
    const socket = new SockJS('http://localhost:8080/quiz-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/${room}/question`, (msg) => {
            const question = JSON.parse(msg.body);

            if (document.getElementById("questionArea")) {
                showQuestion(question); // 
            }
        });

        stompClient.subscribe(`/topic/${room}/leaderboard`, (msg) => {
            const players = JSON.parse(msg.body);
            if (document.getElementById("leaderboard")) {
                updateLeaderboard(players);
            }
        });

        stompClient.subscribe(`/topic/${room}/players`, (msg) => {
            console.log("Players joined:", JSON.parse(msg.body));
        });
    });
}

function connectAsHost() {
    currentRoom = document.getElementById("roomCode").value.trim();
    if (!currentRoom) {
        alert("Please enter a room code.");
        return;
    }
    connect(currentRoom);
}

function sendStructuredQuestion() {
    const questionText = document.getElementById("qtext").value.trim();
    const options = [
        document.getElementById("opt0").value.trim(),
        document.getElementById("opt1").value.trim(),
        document.getElementById("opt2").value.trim(),
        document.getElementById("opt3").value.trim()
    ];
    const correctOptionIndex = parseInt(document.getElementById("correctIndex").value);

    if (!questionText || options.some(opt => !opt) || isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > 3) {
        alert("Please fill all question fields correctly.");
        return;
    }

    const question = {
        questionText,
        options,
        correctOptionIndex
    };

    stompClient.send(`/app/question/${currentRoom}`, {}, JSON.stringify(question));

    // Clear fields after sending
    document.getElementById("qtext").value = "";
    options.forEach((_, i) => document.getElementById(`opt${i}`).value = "");
    document.getElementById("correctIndex").value = "";
}

function joinRoom() {
    playerName = document.getElementById("playerName").value.trim();
    currentRoom = document.getElementById("roomCode").value.trim();

    if (!playerName || !currentRoom) {
        alert("Enter name and room code.");
        return;
    }

    connect(currentRoom);

    setTimeout(() => {
        stompClient.send(`/app/join/${currentRoom}`, {}, JSON.stringify({ name: playerName }));
    }, 500);
}

function showQuestion(question) {
    document.getElementById("questionArea").style.display = "block";
    document.getElementById("questionText").innerText = question.questionText;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    question.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "option-button";
        btn.onclick = () => sendAnswer(index);
        optionsDiv.appendChild(btn);
    });
}

function sendAnswer(index) {
    stompClient.send(`/app/answer/${currentRoom}`, {}, JSON.stringify({
        name: playerName,
        answer: index
    }));
}

function updateLeaderboard(players) {
    const board = document.getElementById("leaderboard");
    board.innerHTML = "";
    players.forEach(p => {
        const li = document.createElement("li");
        li.innerText = `${p.name}: ${p.score}`;
        board.appendChild(li);
    });
}
