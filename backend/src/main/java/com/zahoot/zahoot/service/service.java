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
    // RoomCode -> (PlayerName -> SelectedOptionIndex)
    private final Map<String, Map<String, Integer>> roomAnswers = new ConcurrentHashMap<>();

    public Room getOrCreateRoom(String roomCode) {
        return rooms.computeIfAbsent(roomCode, code -> {
            Room room = new Room();
            room.setRoomCode(code);
            return room;
        });
    }

    public List<Player> addPlayerToRoom(String roomCode, Player player) {
        Room room = getOrCreateRoom(roomCode);
        // Check if player already exists
        boolean exists = room.getPlayers().stream().anyMatch(p -> p.getName().equalsIgnoreCase(player.getName()));
        if (!exists) {
            room.getPlayers().add(player);
        }
        return room.getPlayers();
    }

    public Question addQuestionToRoom(String roomCode, Question question) {
        Room room = getOrCreateRoom(roomCode);
        room.getQuestions().add(question);
        // Reset answers for new question
        roomAnswers.put(roomCode, new ConcurrentHashMap<>());
        return question;
    }

    public void registerAnswer(String roomCode, String playerName, int selectedIndex) {
        Room room = rooms.get(roomCode);
        if (room == null) return;

        Map<String, Integer> answers = roomAnswers.computeIfAbsent(roomCode, k -> new ConcurrentHashMap<>());
        // Lock answer: only record first answer from player
        answers.putIfAbsent(playerName, selectedIndex);
    }

    public List<Player> evaluateAndGetLeaderboard(String roomCode) {
        Room room = rooms.get(roomCode);
        if (room == null) return new ArrayList<>();

        List<Question> questions = room.getQuestions();
        if (!questions.isEmpty()) {
            Question currentQuestion = questions.get(questions.size() - 1);
            int correctIndex = currentQuestion.getCorrectOptionIndex();
            Map<String, Integer> answers = roomAnswers.getOrDefault(roomCode, new ConcurrentHashMap<>());

            for (Player player : room.getPlayers()) {
                Integer playerAnswer = answers.get(player.getName());
                if (playerAnswer != null && playerAnswer == correctIndex) {
                    player.setScore(player.getScore() + 100);
                }
            }
            // Clear answers for this evaluated question
            answers.clear();
        }

        return getLeaderboard(roomCode);
    }

    public List<Player> getLeaderboard(String roomCode) {
        Room room = rooms.get(roomCode);
        if (room == null) return new ArrayList<>();

        List<Player> leaderboard = new ArrayList<>(room.getPlayers());
        leaderboard.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));
        return leaderboard;
    }
}