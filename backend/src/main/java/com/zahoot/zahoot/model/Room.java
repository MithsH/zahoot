package com.zahoot.zahoot.model;


import lombok.Data;

import java.util.ArrayList;
import java.util.List;


@Data
public class Room {
    private String roomCode;
    private List<Player> players = new ArrayList<>();
    private List<Question> questions = new ArrayList<>();

}




