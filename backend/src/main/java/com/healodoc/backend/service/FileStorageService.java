package com.healodoc.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    public String savePhoto(Long id, String name, MultipartFile photo, String dir) throws IOException {
        Path photoDir = uploadDir.resolve(dir).normalize();
        Files.createDirectories(photoDir);

        String contentType = photo.getContentType();
        String extension;

        if("image/jpeg".equalsIgnoreCase(contentType))
            extension = ".jpg";
        else if("image/png".equalsIgnoreCase(contentType))
            extension = ".png;";
        else throw new IllegalArgumentException("Only JPG and PNG images are allowed. Received: " + contentType);

        String filename = name + "_" + id + extension;

        Path destination = photoDir.resolve(filename).normalize();
        photo.transferTo(destination);

        return filename;
    }

    public Resource loadPhoto(String dir, String filename) throws IOException {
        Path filePath = uploadDir.resolve(dir).resolve(filename).normalize();

        Resource resource = new UrlResource(filePath.toUri());
        if(resource.exists() && resource.isReadable())
            return resource;

        throw new FileNotFoundException("Photo not found!");
    }

    public void deletePhoto(String dir, String filename) throws IOException {
        Path filePath = uploadDir.resolve(dir).resolve(filename).normalize();
        Files.deleteIfExists(filePath);
    }
}
