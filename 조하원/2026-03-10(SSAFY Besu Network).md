# SSAFY Blockchain DApp

SSAFY Besu 네트워크에서 ERC-20 토큰을 전송하는 DApp입니다.

---

## 사전 준비 (필수 설치)

| 도구 | 용도 | 설치 확인 |
|------|------|-----------|
| [Node.js 18+](https://nodejs.org) | 프론트엔드 실행 | `node -v` |
| [Java 17+](https://adoptium.net) | 백엔드 실행 | `java -version` |
| [MetaMask 브라우저 확장](https://metamask.io) | 지갑 연결 | Chrome/Edge 확장 프로그램 |

---

## Step 1. MetaMask 지갑 준비

### 1-1. MetaMask 설치 및 계정 생성
1. Chrome 웹 스토어에서 **MetaMask** 설치
2. "새 지갑 만들기" → 비밀번호 설정 → 니모닉 백업
3. 계정을 **2개** 만들어 둔다 (송신자, 수신자)
   - 오른쪽 상단 원형 아이콘 클릭 → "계정 추가"

### 1-2. SSAFY 네트워크 추가
MetaMask → 네트워크 선택 → "네트워크 추가" → 아래 정보 입력:

| 항목 | 값 |
|------|-----|
| 네트워크 이름 | SSAFY Besu Network |
| RPC URL | `https://rpc.ssafy-blockchain.com` |
| 체인 ID | `31221` |
| 통화 심볼 | `ETH` |

> **참고**: 프론트엔드에서 "SSAFY 네트워크로 전환" 버튼을 누르면 자동으로 추가됩니다.

---

## Step 2. 스마트 컨트랙트 배포 (Remix IDE)

> 배포는 한 번만 하면 됩니다. 나온 컨트랙트 주소를 Step 3, 4에서 사용합니다.

### 2-1. Remix에서 컨트랙트 열기
1. [https://remix.ethereum.org](https://remix.ethereum.org) 접속
2. 왼쪽 파일 탐색기에서 `contracts/` 폴더 아래에 `SSAFYToken.sol` 파일 생성
3. 이 프로젝트의 `contracts/SSAFYToken.sol` 내용 전체 붙여넣기

### 2-2. 컴파일
1. 왼쪽 사이드바 **Solidity Compiler** 탭 클릭
2. 컴파일러 버전: `0.8.20` 이상 선택
3. **"Advanced Configurations"** 펼치기 → **EVM Version**: `paris` 또는 `cancun` 선택
   > **주의**: 기본값 `osaka`는 SSAFY Besu 네트워크에서 지원하지 않아 배포 실패합니다.
4. **"Compile SSAFYToken.sol"** 클릭
5. 초록색 체크 표시 확인

### 2-3. 배포
1. 왼쪽 사이드바 **Deploy & run transactions** 탭 클릭
2. **Environment**: `Injected Provider - MetaMask` 선택
3. MetaMask 팝업에서 **연결 허용**
4. 화면에 `Chain ID: 31221` 표시되는지 확인 (SSAFY 네트워크 확인)
5. `initialSupply` 입력란에 `1000000` 입력 (= 100만 토큰)
6. **Deploy** 버튼 클릭 → MetaMask 팝업에서 **확인**

### 2-4. 컨트랙트 주소 복사
- 하단 **Deployed Contracts** 섹션에 배포된 주소가 나타납니다
- 주소 옆 복사 버튼 클릭 → **이 주소를 반드시 메모해 두세요**
  ```
  예시: 0xAbCd1234...
  ```

---

## Step 3. 프론트엔드 실행

```bash
# 1. 프론트엔드 폴더로 이동
cd frontend

# 2. 패키지 설치
npm install

# 3. 환경변수 파일 생성
# .env.example을 복사해서 .env 파일을 만든다
copy .env.example .env        # Windows CMD
# cp .env.example .env        # Mac / Linux / Git Bash

# 4. .env 파일을 메모장으로 열어 컨트랙트 주소 입력
# VITE_TOKEN_CONTRACT_ADDRESS=0x여기에_Step2에서_복사한_주소_입력

# 5. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

### 화면 사용 방법
1. **"MetaMask 연결"** 버튼 클릭 → MetaMask에서 허용
2. SSAFY 네트워크가 아니면 **"SSAFY 네트워크로 전환"** 클릭
3. ETH 잔액, 토큰 잔액 확인
4. 수신자 주소와 수량 입력 후 **"SSFT 전송"** 클릭 → MetaMask 승인

---

## Step 4. 백엔드 실행

```bash
# 1. 백엔드 폴더로 이동
cd backend

# 2-A. Windows PowerShell
$env:TOKEN_CONTRACT_ADDRESS = "0x여기에_Step2에서_복사한_주소_입력"
./mvnw spring-boot:run

# 2-B. Windows CMD
set TOKEN_CONTRACT_ADDRESS=0x여기에_Step2에서_복사한_주소_입력
mvnw spring-boot:run

# 2-C. Mac / Linux
TOKEN_CONTRACT_ADDRESS=0x여기에_Step2에서_복사한_주소_입력 ./mvnw spring-boot:run
```

서버가 뜨면 [http://localhost:8080](http://localhost:8080) 에서 API 사용 가능

### 백엔드 API 확인

```bash
# 네트워크 정보 확인
curl http://localhost:8080/api/blockchain/network

# 특정 주소 잔액 조회 (주소는 본인 MetaMask 주소로 변경)
curl http://localhost:8080/api/blockchain/balance/0x본인주소

# 트랜잭션 조회 (프론트에서 전송 후 나온 txHash 사용)
curl http://localhost:8080/api/blockchain/tx/0x트랜잭션해시

# 트랜잭션 영수증 (성공/실패 여부 확인)
curl http://localhost:8080/api/blockchain/receipt/0x트랜잭션해시
```

---

## 설정 파일 정리

### `frontend/.env`
```env
# Step 2에서 Remix로 배포한 SSAFYToken 컨트랙트 주소
VITE_TOKEN_CONTRACT_ADDRESS=0x배포된_컨트랙트_주소
```

### `backend/src/main/resources/application.yml`
```yaml
blockchain:
  rpc-url: https://rpc.ssafy-blockchain.com  # 변경 불필요
  chain-id: 31221                             # 변경 불필요
  token-contract-address: ${TOKEN_CONTRACT_ADDRESS}  # 환경변수로 주입
```

---

## 트러블슈팅

| 문제 | 해결 방법 |
|------|-----------|
| MetaMask 팝업이 안 뜸 | 브라우저 확장 아이콘 클릭 후 잠금 해제 |
| Remix에서 `Chain ID: 31221`이 안 보임 | MetaMask에서 SSAFY 네트워크로 전환 후 Remix 새로고침 |
| 배포 시 "가스비 계산 오류" / `CALL_EXCEPTION` | Solidity Compiler → Advanced Configurations → EVM Version을 `paris` 또는 `cancun`으로 변경 후 재컴파일 |
| MetaMask ETH 잔액이 0인데 배포/전송 가능한가? | **가능합니다.** SSAFY Besu 네트워크는 수수료가 0으로 설정되어 ETH 없이 트랜잭션 실행 가능 |
| 토큰 잔액이 0 | Step 2에서 배포한 계정이 곧 토큰 보유자 → 해당 계정으로 MetaMask 전환 |
| `VITE_TOKEN_CONTRACT_ADDRESS` 관련 오류 | `.env` 파일 생성 여부 확인, 서버 재시작 (`npm run dev` 다시) |
| 백엔드 `java: command not found` | Java 17 설치 후 환경변수(JAVA_HOME) 설정 |
| 백엔드 잔액이 0으로 나옴 | `TOKEN_CONTRACT_ADDRESS` 환경변수가 올바르게 설정됐는지 확인 |

---

## 프로젝트 구조

```
blockchain-pre/
├── contracts/
│   └── SSAFYToken.sol            # ERC-20 토큰 스마트 컨트랙트 (Solidity)
│
├── frontend/                     # React + Vite + ethers.js
│   ├── .env.example              # 환경변수 예시 (→ .env 복사해서 사용)
│   └── src/
│       ├── App.tsx               # 메인 화면
│       ├── components/
│       │   ├── WalletConnect.tsx # MetaMask 연결 UI
│       │   ├── TokenBalance.tsx  # 잔액 표시
│       │   └── TokenTransfer.tsx # 토큰 전송 폼
│       ├── hooks/
│       │   └── useWallet.ts      # 지갑 상태 관리
│       └── utils/
│           ├── constants.ts      # 네트워크 설정, ABI
│           └── web3.ts           # MetaMask 연결/잔액/전송 함수
│
└── backend/                      # Spring Boot + Web3j
    └── src/main/
        ├── java/com/ssafy/blockchain/
        │   ├── controller/       # REST API
        │   ├── service/          # 비즈니스 로직 (eth_call 등)
        │   ├── config/           # Web3j, CORS 설정
        │   └── dto/              # 응답 데이터 클래스
        └── resources/
            └── application.yml   # 서버/블록체인 설정
```