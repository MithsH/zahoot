package com.zahoot.zahoot.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class Question {
    private String questionText;
    private List<String> options;
    private int correctOptionIndex;



}
