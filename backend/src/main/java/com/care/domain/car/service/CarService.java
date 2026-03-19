package com.care.domain.car.service;

import com.care.domain.car.controller.dto.request.CarRegisterRequest;
import com.care.domain.car.controller.dto.response.CarImageResponse;
import com.care.domain.car.controller.dto.response.CarListResponse;
import com.care.domain.car.controller.dto.response.CarRegisterResponse;
import com.care.domain.car.controller.dto.response.RenterCarResponse;
import com.care.domain.car.entity.CarImage;
import com.care.domain.car.entity.CarImage.Side;
import com.care.domain.car.entity.CarModel;
import com.care.domain.car.entity.OwnedCar;
import com.care.domain.car.event.CarRegisteredEvent;
import com.care.domain.car.exception.CarErrorCode;
import com.care.domain.car.repository.CarImageRepository;
import com.care.domain.car.repository.CarModelRepository;
import com.care.domain.car.repository.OwnedCarRepository;
import com.care.domain.company.entity.Company;
import com.care.domain.company.exception.CompanyErrorCode;
import com.care.domain.company.repository.CompanyRepository;
import com.care.global.exception.BusinessException;
import com.care.global.ipfs.PinataService;
import com.care.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarService {

    private final OwnedCarRepository ownedCarRepository;
    private final CarImageRepository carImageRepository;
    private final CompanyRepository companyRepository;
    private final CarModelRepository carModelRepository;
    private final S3Service s3Service;
    private final PinataService pinataService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 차량 등록
     * 1) side별 이미지 S3 + IPFS 업로드 ({modelName}/{carId}/{side}.jpg)
     * 2) OwnedCar DB 저장 (PENDING) + CarImage 4개 저장
     * 3) CarRegisteredEvent 발행 → 비동기로 NFT 민팅
     */
    @Transactional
    public CarRegisterResponse registerCar(String companyId, CarRegisterRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException(CompanyErrorCode.COMPANY_NOT_FOUND));

        CarModel carModel = carModelRepository.findById(request.modelId())
                .orElseThrow(() -> new BusinessException(CarErrorCode.CAR_MODEL_NOT_FOUND));

        String carId = UUID.randomUUID().toString();
        String modelFolder = carModel.getModelName().replace(" ", "-");

        // side → MultipartFile 매핑
        Map<Side, MultipartFile> sideImages = new LinkedHashMap<>();
        sideImages.put(Side.FRONT, request.frontImage());
        sideImages.put(Side.REAR,  request.rearImage());
        sideImages.put(Side.LEFT,  request.leftImage());
        sideImages.put(Side.RIGHT, request.rightImage());

        // 1. OwnedCar 저장 (PENDING)
        OwnedCar car = OwnedCar.create(carId, company, carModel, request.plateNumber());
        ownedCarRepository.save(car);

        // 2. side별 S3 + IPFS 업로드 → CarImage 저장
        Map<Side, String> s3Urls = new LinkedHashMap<>();
        Map<String, String> ipfsCids = new LinkedHashMap<>();

        for (Map.Entry<Side, MultipartFile> entry : sideImages.entrySet()) {
            Side side = entry.getKey();
            MultipartFile file = entry.getValue();

            String s3Key = modelFolder + "/" + carId + "/" + side.name() + ".jpg";
            String s3Url = s3Service.uploadToKey(file, s3Key);
            log.info("[CarService] S3 업로드 완료 | side: {}, url: {}", side, s3Url);

            String ipfsCid = pinataService.uploadImage(file, "car-" + carId + "-" + side.name());
            log.info("[CarService] IPFS 업로드 완료 | side: {}, cid: {}", side, ipfsCid);

            carImageRepository.save(CarImage.create(UUID.randomUUID().toString(), car, side, s3Url, ipfsCid));

            s3Urls.put(side, s3Url);
            ipfsCids.put(side.name(), ipfsCid);
        }

        log.info("[CarService] 차량 저장 완료 | carId: {}", carId);

        // 3. 이벤트 발행 (트랜잭션 커밋 후 비동기 NFT 민팅)
        eventPublisher.publishEvent(new CarRegisteredEvent(
                carId,
                company.getWalletAddress(),
                car.getPlateNumber(),
                carModel.getBrand(),
                carModel.getModelName(),
                carModel.getFuelType(),
                ipfsCids
        ));

        return CarRegisterResponse.of(car, s3Urls);
    }

    /**
     * 렌터 차량 목록 조회 (브랜드, 공항 필터)
     */
    @Transactional(readOnly = true)
    public List<RenterCarResponse> getRenterCarList(String brand, String airportCode) {
        return ownedCarRepository.findActiveCarsByFilter(brand, airportCode).stream()
                .map(car -> {
                    String frontImageUrl = carImageRepository
                            .findByCarCarIdAndSide(car.getCarId(), Side.FRONT)
                            .map(CarImage::getS3Url)
                            .orElse(null);
                    return RenterCarResponse.of(car, frontImageUrl);
                })
                .toList();
    }

    /**
     * 회사 차량 목록 조회
     */
    @Transactional(readOnly = true)
    public List<CarListResponse> getCarList(String companyId) {
        return ownedCarRepository.findByCompanyCompanyId(companyId).stream()
                .map(car -> {
                    String frontImageUrl = carImageRepository
                            .findByCarCarIdAndSide(car.getCarId(), Side.FRONT)
                            .map(CarImage::getS3Url)
                            .orElse(null);
                    return CarListResponse.of(car, frontImageUrl);
                })
                .toList();
    }

    /**
     * 특정 차량의 이미지 목록 조회 (S3 URL + IPFS CID)
     */
    @Transactional(readOnly = true)
    public List<CarImageResponse> getCarImages(String companyId, String carId) {
        OwnedCar car = ownedCarRepository.findById(carId)
                .orElseThrow(() -> new BusinessException(CarErrorCode.CAR_NOT_FOUND));

        if (!car.getCompany().getCompanyId().equals(companyId)) {
            throw new BusinessException(CarErrorCode.CAR_NOT_OWNED_BY_COMPANY);
        }

        return carImageRepository.findByCarCarId(carId).stream()
                .map(CarImageResponse::from)
                .toList();
    }
}
