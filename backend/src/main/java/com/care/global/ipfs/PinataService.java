package com.care.global.ipfs;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PinataService {

    private static final String PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    private static final String GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

    @Value("${pinata.jwt}")
    private String jwt;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 파일을 IPFS에 업로드하고 CID 반환
     * @param file      업로드할 파일
     * @param folder    폴더 경로 (예: "cars/car-001")
     * @return 디렉토리 CID (folder/filename 형태로 접근 가능)
     */
    public String upload(MultipartFile file, String folder) {
        String boundary = UUID.randomUUID().toString();
        String fileName = file.getOriginalFilename();
        String filePath = folder + "/" + fileName;
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        try {
            byte[] fileBytes = file.getBytes();

            // file part
            String filePart = "--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"file\"; filename=\"" + filePath + "\"\r\n"
                    + "Content-Type: " + contentType + "\r\n\r\n";

            // pinataOptions part (wrapWithDirectory: true → 폴더 구조 생성)
            String optionsPart = "\r\n--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"pinataOptions\"\r\n"
                    + "Content-Type: application/json\r\n\r\n"
                    + "{\"wrapWithDirectory\":true}";

            // pinataMetadata part
            String metaPart = "\r\n--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"pinataMetadata\"\r\n"
                    + "Content-Type: application/json\r\n\r\n"
                    + "{\"name\":\"" + folder + "\"}"
                    + "\r\n--" + boundary + "--\r\n";

            byte[] startBytes = filePart.getBytes();
            byte[] endBytes = (optionsPart + metaPart).getBytes();
            byte[] body = new byte[startBytes.length + fileBytes.length + endBytes.length];
            System.arraycopy(startBytes, 0, body, 0, startBytes.length);
            System.arraycopy(fileBytes, 0, body, startBytes.length, fileBytes.length);
            System.arraycopy(endBytes, 0, body, startBytes.length + fileBytes.length, endBytes.length);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PINATA_URL))
                    .header("Authorization", "Bearer " + jwt)
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Pinata 업로드 실패 [" + response.statusCode() + "]: " + response.body());
            }

            JsonNode json = objectMapper.readTree(response.body());
            return json.get("IpfsHash").asText();

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("IPFS 업로드 실패: " + filePath, e);
        }
    }

    /**
     * 이미지 파일을 IPFS에 직접 업로드하고 파일 CID 반환 (wrapWithDirectory: false)
     * NFT 메타데이터의 image 필드에 사용
     */
    public String uploadImage(MultipartFile file, String name) {
        String boundary = UUID.randomUUID().toString();
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        try {
            byte[] fileBytes = file.getBytes();

            String filePart = "--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getOriginalFilename() + "\"\r\n"
                    + "Content-Type: " + contentType + "\r\n\r\n";

            String endPart = "\r\n--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"pinataMetadata\"\r\n"
                    + "Content-Type: application/json\r\n\r\n"
                    + "{\"name\":\"" + name + "\"}"
                    + "\r\n--" + boundary + "--\r\n";

            byte[] startBytes = filePart.getBytes();
            byte[] endBytes = endPart.getBytes();
            byte[] body = new byte[startBytes.length + fileBytes.length + endBytes.length];
            System.arraycopy(startBytes, 0, body, 0, startBytes.length);
            System.arraycopy(fileBytes, 0, body, startBytes.length, fileBytes.length);
            System.arraycopy(endBytes, 0, body, startBytes.length + fileBytes.length, endBytes.length);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PINATA_URL))
                    .header("Authorization", "Bearer " + jwt)
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Pinata 이미지 업로드 실패 [" + response.statusCode() + "]: " + response.body());
            }

            JsonNode json = objectMapper.readTree(response.body());
            return json.get("IpfsHash").asText();

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("IPFS 이미지 업로드 실패", e);
        }
    }

    /**
     * CID로 게이트웨이 URL 반환
     * @param cid       디렉토리 CID
     * @param fileName  파일명
     */
    public String toUrl(String cid, String fileName) {
        return GATEWAY_URL + cid + "/" + fileName;
    }

    /**
     * CID만으로 게이트웨이 URL 반환 (단일 파일 CID)
     */
    public String toUrl(String cid) {
        return GATEWAY_URL + cid;
    }

    /**
     * JSON 메타데이터를 IPFS에 업로드하고 CID 반환
     * Pinata endpoint: POST /pinning/pinJSONToIPFS
     *
     * @param json  업로드할 JSON 문자열
     * @param name  Pinata 핀 이름
     * @return IPFS CID
     */
    public String uploadJson(String json, String name) {
        try {
            String body = "{\"pinataContent\":" + json
                    + ",\"pinataMetadata\":{\"name\":\"" + name + "\"}"
                    + ",\"pinataOptions\":{\"cidVersion\":0}}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.pinata.cloud/pinning/pinJSONToIPFS"))
                    .header("Authorization", "Bearer " + jwt)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Pinata JSON 업로드 실패 [" + response.statusCode() + "]: " + response.body());
            }

            JsonNode jsonNode = objectMapper.readTree(response.body());
            return jsonNode.get("IpfsHash").asText();

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("IPFS JSON 업로드 실패", e);
        }
    }
}
