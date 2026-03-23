package com.care.global.ipfs;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class PinataServiceTest {

    @Autowired
    private PinataService pinataService;

    @Test
    void IPFS_폴더구조_업로드_테스트() throws Exception {
        InputStream is = getClass().getResourceAsStream("/img.png");
        MockMultipartFile file = new MockMultipartFile("img.png", "img.png", "image/png", is);

        String folder = "test/character/짱구";
        String cid = pinataService.upload(file, folder);
        String url = pinataService.toUrl(cid, "img.png");

        System.out.println("CID  : " + cid);
        System.out.println("URL  : " + url);
        // 폴더 구조: ipfs://{cid}/test/character/짱구/img.png
        System.out.println("FULL : " + pinataService.toUrl(cid, folder + "/img.png"));

        assertThat(cid).isNotBlank();
        assertThat(url).startsWith("https://gateway.pinata.cloud/ipfs/");
    }
}
