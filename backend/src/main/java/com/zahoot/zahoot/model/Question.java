package com.zahoot.zahoot.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Question {
    private String questionText;
    private List<String> options;
    private int correctOptionIndex;
    private int durationSeconds = 15;
}
