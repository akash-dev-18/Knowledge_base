package com.springboot.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.file.Path;

@Component
@RequiredArgsConstructor
public class FastApiClient {

    @Value("${fastapi.url}")
    private String fastapiUrl;

    private final RestClient restClient = RestClient.create();


    public void processDocument(String documentId, Path filePath) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(filePath));

        restClient.post()
                .uri(fastapiUrl + "/documents/" + documentId)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }


    public void deleteDocument(String documentId) {
        restClient.delete()
                .uri(fastapiUrl + "/documents/" + documentId)
                .retrieve()
                .toBodilessEntity();
    }
}