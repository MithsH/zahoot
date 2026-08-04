package com.zahoot.zahoot.controller;

import com.zahoot.zahoot.model.Player;
import com.zahoot.zahoot.model.Question;
import com.zahoot.zahoot.service.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class controller {
    @Autowired
    private service quizService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/join/{roomCode}")
    public void join(@DestinationVariable String roomCode, @Payload Player player) {
        System.out.println("Player joined: " + player.getName() + " in room: " + roomCode);
        List<Player> players = quizService.addPlayerToRoom(roomCode, player);
        messagingTemplate.convertAndSend("/topic/" + roomCode + "/players", players);
        messagingTemplate.convertAndSend("/topic/" + roomCode + "/leaderboard", players);
    }

    @MessageMapping("/question/{roomCode}")
    @SendTo("/topic/{roomCode}/question")
    public Question sendQuestion(@DestinationVariable String roomCode, @Payload Question question) {
        return quizService.addQuestionToRoom(roomCode, question);
    }

    @MessageMapping("/answer/{roomCode}")
    public void receiveAnswer(@DestinationVariable String roomCode, @Payload Map<String, Object> answer) {
        String name = (String) answer.get("name");
        int answerIndex = Integer.parseInt(answer.get("answer").toString());
        quizService.registerAnswer(roomCode, name, answerIndex);
    }

    @MessageMapping("/evaluate/{roomCode}")
    public void evaluateResults(@DestinationVariable String roomCode) {
        List<Player> leaderboard = quizService.evaluateAndGetLeaderboard(roomCode);
        messagingTemplate.convertAndSend("/topic/" + roomCode + "/leaderboard", leaderboard);
        messagingTemplate.convertAndSend("/topic/" + roomCode + "/players", leaderboard);
    }
}
