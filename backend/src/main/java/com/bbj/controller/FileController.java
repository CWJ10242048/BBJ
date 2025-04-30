package com.bbj.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class FileController {

    @GetMapping("/export/syllabus")
    public ResponseEntity<Resource> exportSyllabus() throws IOException {
        // 模拟2秒延迟
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 文件路径（相对路径，指向项目根目录下的 result 文件夹）
        String filePath = System.getProperty("user.dir") + File.separator + "result" + File.separator + "机器学习课程大纲.docx";
        File file = new File(filePath);
        
        // 检查文件是否存在
        if (!file.exists()) {
            throw new RuntimeException("文件不存在");
        }

        // 创建FileSystemResource
        FileSystemResource resource = new FileSystemResource(file);

        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "机器学习课程大纲.docx");

        // 返回文件
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }

    @GetMapping("/export/lessonplan")
    public ResponseEntity<Resource> exportLessonPlan() throws IOException {
        // 模拟2秒延迟
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 文件路径（相对路径，指向项目根目录下的 result 文件夹）
        String filePath = System.getProperty("user.dir") + File.separator + "result" + File.separator + "机器学习线性回归教案.docx";
        File file = new File(filePath);
        
        // 检查文件是否存在
        if (!file.exists()) {
            throw new RuntimeException("文件不存在");
        }

        // 创建FileSystemResource
        FileSystemResource resource = new FileSystemResource(file);

        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "机器学习线性回归教案.docx");

        // 返回文件
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }

    @GetMapping("/export/interaction")
    public ResponseEntity<Resource> exportInteraction() throws IOException {
        // 模拟2秒延迟
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 文件路径（相对路径，指向项目根目录下的 result 文件夹）
        String filePath = System.getProperty("user.dir") + File.separator + "result" + File.separator + "机器学习互动环节设计.docx";
        File file = new File(filePath);
        
        // 检查文件是否存在
        if (!file.exists()) {
            throw new RuntimeException("文件不存在");
        }

        // 创建FileSystemResource
        FileSystemResource resource = new FileSystemResource(file);

        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "机器学习互动环节设计.docx");

        // 返回文件
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }

    @GetMapping("/export/ppt")
    public ResponseEntity<Resource> exportPPT() throws IOException {
        // 模拟2秒延迟
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 文件路径（相对路径，指向项目根目录下的 result 文件夹）
        String filePath = System.getProperty("user.dir") + File.separator + "result" + File.separator + "机器学习线性回归PPT.pptx";
        File file = new File(filePath);
        
        // 检查文件是否存在
        if (!file.exists()) {
            throw new RuntimeException("文件不存在");
        }

        // 创建FileSystemResource
        FileSystemResource resource = new FileSystemResource(file);

        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "机器学习线性回归PPT.pptx");

        // 返回文件
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }

    @GetMapping("/export/graphic")
    public ResponseEntity<Resource> exportGraphic() throws IOException {
        // 模拟2秒延迟
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 文件路径（相对路径，指向项目根目录下的 result 文件夹）
        String filePath = System.getProperty("user.dir") + File.separator + "result" + File.separator + "二叉树.jpg";
        File file = new File(filePath);

        // 检查文件是否存在
        if (!file.exists()) {
            throw new RuntimeException("文件不存在");
        }

        // 创建FileSystemResource
        FileSystemResource resource = new FileSystemResource(file);

        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "二叉树.jpg");

        // 返回文件
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }

    @GetMapping("/export/question")
    public ResponseEntity<Resource> exportQuestion() throws IOException {
        // 模拟2秒延迟
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 文件路径（相对路径，指向项目根目录下的 result 文件夹）
        String filePath = System.getProperty("user.dir") + File.separator + "result" + File.separator + "机器学习习题整卷.docx";
        File file = new File(filePath);

        // 检查文件是否存在
        if (!file.exists()) {
            throw new RuntimeException("文件不存在");
        }

        // 创建FileSystemResource
        FileSystemResource resource = new FileSystemResource(file);

        // 设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "机器学习习题整卷.docx");

        // 返回文件
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }
} 