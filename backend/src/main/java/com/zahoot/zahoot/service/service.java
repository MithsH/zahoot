package com.zahoot.zahoot.service;

import com.zahoot.zahoot.model.Player;
import com.zahoot.zahoot.model.Question;
import com.zahoot.zahoot.model.Room;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class service {

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    public Room getOrCreateRoom(String roomCode) {
        return rooms.computeIfAbsent(roomCode, code -> {
            Room room = new Room();
            room.setRoomCode(code);
            return room;
        });
    }

    public List<Player> addPlayerToRoom(String roomCode, Player player) {
        Room room = getOrCreateRoom(roomCode);
        room.getPlayers().add(player);
        return room.getPlayers();
    }

    public Question addQuestionToRoom(String roomCode, Question question) {
        Room room = getOrCreateRoom(roomCode);
        room.getQuestions().add(question);
        return question;
    }

    public void receiveAnswer(String roomCode, Map<String, String> answerData) {
        Room room = rooms.get(roomCode);
        if (room == null) return;

        String playerName = answerData.get("name");
        int selectedIndex = Integer.parseInt(answerData.get("answer"));

        List<Question> questions = room.getQuestions();
        if (questions.isEmpty()) return;

        Question currentQuestion = questions.get(questions.size() - 1);

        if (currentQuestion.getCorrectOptionIndex() == selectedIndex) {
            for (Player player : room.getPlayers()) {
                if (player.getName().equals(playerName)) {
                    player.setScore(player.getScore() + 1);
                }
            }
        }
    }

    public List<Player> getLeaderboard(String roomCode) {
        Room room = rooms.get(roomCode);
        if (room == null) return new ArrayList<>();

        List<Player> leaderboard = new ArrayList<>(room.getPlayers());
        leaderboard.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));
        return leaderboard;
    }
}