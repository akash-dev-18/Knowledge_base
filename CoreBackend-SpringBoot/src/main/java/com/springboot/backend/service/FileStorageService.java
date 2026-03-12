package com.springboot.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload.dir}")
    private String uploadDir;

    public String save(MultipartFile file) {
        try {

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }


            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);


            Files.copy(file.getInputStream(), filePath);


            return filePath.toString();

        } catch (IOException e) {
            throw new RuntimeException("File save failed: " + e.getMessage());
        }
    }

    public void delete(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
            throw new RuntimeException("File delete failed: " + e.getMessage());
        }
    }
}