package com.bbj.repository;

import com.bbj.entity.HistoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoryRecordRepository extends JpaRepository<HistoryRecord, Long> {
    // 根据类型查找
    List<HistoryRecord> findByType(String type);
    
    // 根据类型查找并按时间倒序排序
    @Query("SELECT h FROM HistoryRecord h WHERE h.type = ?1 ORDER BY h.time DESC")
    List<HistoryRecord> findByTypeOrderByTimeDesc(String type);
    
    // 查找所有记录并按时间倒序排序
    @Query("SELECT h FROM HistoryRecord h ORDER BY h.time DESC")
    List<HistoryRecord> findAllOrderByTimeDesc();
} 