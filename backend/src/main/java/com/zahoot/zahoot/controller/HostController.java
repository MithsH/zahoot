package com.zahoot.zahoot.controller;

import com.zahoot.zahoot.model.Question;
import com.zahoot.zahoot.model.Room;
import com.zahoot.zahoot.service.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
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
