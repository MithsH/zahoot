package com.zahoot.zahoot.controller;

import com.zahoot.zahoot.model.Question;
import com.zahoot.zahoot.model.Room;
import com.zahoot.zahoot.service.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import com.zahoot.zahoot.model.Player;

import java.util.List;
import java.util.Map;

@Controller
public class controller {
    @Autowired
    private service quizService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/join/{roomCode}")
    @SendTo("/topic/{roomCode}/players")
    public List<Player> join(@DestinationVariable String roomCode, @Payload Player player) {
        return quizService.addPlayerToRoom(roomCode, player);
    }

    @MessageMapping("/question/{roomCode}")
    @SendTo("/topic/{roomCode}/question")
    public Question sendQuestion(@DestinationVariable String roomCode, @Payload Question question) {
        return quizService.addQuestionToRoom(roomCode, question);
    }

    @MessageMapping("/answer/{roomCode}")
    public void receiveAnswer(@DestinationVariable String roomCode, @Payload Map<String, String> answer) {
        quizService.receiveAnswer(roomCode, answer);
        List<Player> leaderboard = quizService.getLeaderboard(roomCode);
        messagingTemplate.convertAndSend("/topic/" + roomCode + "/leaderboard", leaderboard);
    }
}
