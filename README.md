# Zahoot! - Real-Time Interactive Quiz Game

**Zahoot!** is a modern, real-time multiplayer quiz platform inspired by Kahoot! Built with **Java Spring Boot**, **WebSockets (STOMP)**, and a modern **Cosmic Space UI** featuring glassmorphism visuals, side leaderboards, 2x2 question option grids, and instant live player synchronization.

---

## ✨ Features

- 🌌 **Cosmic Space Theme**: Dark space background (`#090714`), glassmorphic panels, animated background stars, and glowing typography.
- ⚡ **Real-Time WebSockets**: Powered by Spring Boot WebSocket & STOMP protocol via SockJS for instant message broadcasting across rooms.
- 👑 **Host Control Center**:
  - Create rooms and host live quiz sessions.
  - Build structured 4-choice questions with answer keys.
  - Push live questions instantly to all connected players (`🚀 Push Question Live`).
- 🎮 **Interactive Player Experience**:
  - **🚀 Rocket Score Badge**: Floating rocket icon with glowing score display (`#FFD700`).
  - **🏆 Live Leaderboard**: Real-time sorted player ranking list with medal badges (`1st`, `2nd`, `3rd`).
  - **2x2 Options Grid**: Responsive 4-card choice layout.
  - **Vibrant Card Pop-Out**: Selected choice elevates with a 3D tilted active animation (`rotate(-3deg) scale(1.08)`), neon green gradient fill, and glow shadow.
- ⏱️ **Countdown Timer & Answer Locking**:
  - **15-Second Question Timer**: Automatic countdown with urgent pulse effects during final 5 seconds.
  - **Single-Choice Locking**: Selecting an answer locks the option (`🔒 Choice Locked!`) to prevent changing choices.
  - **Timed Points Evaluation**: Points (+100 pts) are awarded **only after the timer reaches zero**, revealing the correct answer card in green (`✓`) and broadcasting updated leaderboards.
- 🔔 **Floating Toast Cards**:
  - Modern top-center toast notifications for host connection (`👑`), player joins (`🎮`), question broadcasts (`🚀`), and answer results (`🏆`).

---

## 🛠️ Tech Stack

### **Backend**
- **Java 17**
- **Spring Boot 3.5.3** (Web, WebSockets, Messaging)
- **STOMP / SockJS** Message Broker
- **Lombok**
- **Apache Maven**

### **Frontend**
- **HTML5 & Vanilla JavaScript (ES6)**
- **SockJS-client & Stomp.js**
- **Vanilla CSS3** (Glassmorphism, CSS Grid, 3D Transforms, Custom Animations)
- **Google Fonts** (*Outfit* & *Inter*)

---

## 📁 Project Structure

```text
zahoot/
└── backend/
    ├── src/
    │   └── main/
    │       ├── java/com/zahoot/zahoot/
    │       │   ├── controller/
    │       │   │   ├── controller.java        # STOMP WebSocket Messaging (Join, Question, Answer, Evaluate)
    │       │   │   └── HostController.java    # REST API endpoints for Rooms & Leaderboard
    │       │   ├── model/
    │       │   │   ├── Player.java            # Player model (Name, Score, Session)
    │       │   │   ├── Question.java          # Question model (Text, Options, CorrectIndex, Duration)
    │       │   │   └── Room.java              # Room model (Code, Player List, Questions)
    │       │   ├── service/
    │       │   │   └── service.java           # Room management, answer registration & score calculation
    │       │   ├── webconfig.java             # WebSocket & STOMP endpoint registration
    │       │   └── ZahootApplication.java    # Spring Boot Main Application
    │       │
    │       └── resources/
    │           ├── application.properties
    │           └── static/                     # Single Source of Truth for Web Client
    │               ├── css/
    │               │   ├── styles.css          # Space theme, 2x2 grid, cards & toast notification styles
    │               │   └── host.css            # Host dashboard specific layout
    │               ├── js/
    │               │   └── app.js              # Client WebSocket logic, timer & UI state management
    │               ├── index.html              # Landing page (Join / Host selection)
    │               ├── host.html               # Host Control Panel
    │               └── player.html             # Player Live Quiz View
    ├── pom.xml
    └── mvnw / mvnw.cmd
```

---

## 🚀 Getting Started

### Prerequisites
- **JDK 17** or higher installed.
- **Maven** (or use the included `./mvnw` wrapper).

### Installation & Execution

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/zahoot.git
   cd zahoot
   ```

2. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

3. **Run the Spring Boot Application**:
   - On Windows (PowerShell / CMD):
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   - On Linux / macOS:
     ```bash
     ./mvnw spring-boot:run
     ```

4. **Access the Application**:
   Once the server starts on `http://localhost:8080`:
   - 🏠 **Landing Page**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
   - 👑 **Host Dashboard**: [http://localhost:8080/host.html](http://localhost:8080/host.html)
   - 🎮 **Player View**: [http://localhost:8080/player.html](http://localhost:8080/player.html)

---

## 🎮 How to Play

1. Open **Host Dashboard** (`host.html`), enter a Room Code (e.g. `ROOM1`), and click **Connect as Host**.
2. Open **Player View** (`player.html`) in another tab/window (or invite friends), enter a name (e.g. `Alex`) and the Room Code `ROOM1`, then click **Join Game**.
3. The Host types a question, fills 4 grid choices, specifies the correct option index (`0-3`), and clicks **🚀 Push Question Live**.
4. All players see the question with a **15-second countdown timer**. Players click their choice to lock in their answer.
5. When time expires, the correct answer is revealed, points (+100 pts) are awarded, and the **Live Leaderboard** refreshes automatically!



