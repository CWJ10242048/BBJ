package com.bbj.controller;

import com.bbj.entity.HistoryRecord;
import com.bbj.repository.HistoryRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    @Autowired
    private HistoryRecordRepository historyRecordRepository;

    @GetMapping("/records")
    public List<HistoryRecord> getAllHistoryRecords() {
        return historyRecordRepository.findAllOrderByTimeDesc();
    }

    @GetMapping("/records/{type}")
    public List<HistoryRecord> getHistoryRecordsByType(@PathVariable String type) {
        return historyRecordRepository.findByTypeOrderByTimeDesc(type);
    }

    @DeleteMapping("/records/{id}")
    public ResponseEntity<?> deleteHistoryRecord(@PathVariable Long id) {
        try {
            historyRecordRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("删除失败：" + e.getMessage());
        }
    }
} 