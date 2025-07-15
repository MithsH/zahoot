package com.zahoot.zahoot.controller;

import com.zahoot.zahoot.model.Question;
import com.zahoot.zahoot.model.Room;
import com.zahoot.zahoot.service.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Controller
public class HostController {
    @Autowired
    private service quizService;

    @PostMapping("/room/{roomCode}/question")
    public Question addQuestion(@PathVariable String roomCode, @RequestBody Question question) {
        return quizService.addQuestionToRoom(roomCode, question);
    }

    @GetMapping("/room/{roomCode}")
    public Room getRoom(@PathVariable String roomCode) {
        return quizService.getOrCreateRoom(roomCode);
    }

    @GetMapping("/room/{roomCode}/leaderboard")
    public List<?> getLeaderboard(@PathVariable String roomCode) {
        return quizService.getLeaderboard(roomCode);
    }
}

