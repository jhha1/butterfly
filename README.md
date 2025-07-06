# Butterfly

Butterfly는 NestJS 기반의 실시간 게임 서버로, 멀티플레이어 게임을 위한 로비, 매칭, 실시간 플레이 기능을 만들고 있습니다.

## 시스템 아키텍처

### 서비스 구성 (Monorepo)

- **game-server**: gRPC 서버 (추후 클라이언트와 통신방식을 restful api로 변경 예정. body 포맷만 protobuf 사용예정)
  - 사용자 인증 및 로그인
  - 로비 관리 및 플레이어 매칭
  - 게임 룸 생성 및 관리

- **realtime-server** : WebSocket 서버
  - 실시간 게임 플레이
  - 게임 룸 상태 동기화
  - 플레이어 간 통신

- **common**: 공통 라이브러리
  - JWT 기반 인증
  - Redis 캐시 관리
  - 데이터베이스 연결

### 데이터 저장소

- **MySQL**: 사용자 계정, 플레이어 정보
- **Redis**: 세션 관리, 게임 룸 상태

### MSA 
- **game-server** 와 **realtime-server** 는 별도로 떠있으며, 추후 k8s 클러스터에서 네임스페이스로 구분하여 MSA로 구성해보고자 함 (공부목적)
- grpc 통신 (현재 unary 방식이라 streaming으로 변경해야함) 

## ⚠️ 현재 상태 및 알려진 이슈

### 🚧 개발 중인 기능
- 기본 게임 플레이 로직 구현 중
- 매칭 알고리즘 개선 필요
- 에러 처리 및 예외 상황 대응 강화

### 🐛 알려진 문제점
- 일부 테스트가 불안정함 
- 기본 플레이 로직 확인단계로, 트래픽이나 초저지연 레이턴시를 위한 설계는 아직 고려되지 않음
- WebSocket 연결 해제 시 정리 로직 미완성

### 📋 TODO
- [ ] 기본 게임 플레이 로직 완성
- [ ] 많은 트래픽 + 멀티 리전 유저 혐동 플레이 고려 개선
- [ ] 부하 테스트 및 성능 최적화
- [ ] 로그 시스템 구축
- [ ] 모니터링 시스템 추가
- [ ] 배포 자동화 구축
- [ ] k8s helm, terraform 


## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 로컬 인프라 시작

```bash
# MySQL과 Redis 컨테이너 시작
docker-compose -f environments/local/docker-compose.yml up -d
```

### 3. 데이터베이스 스키마 마이그레이션

```bash
# 마이그레이션 실행
pnpm run migration:run:game
```

### 4. 서버 실행

```bash
# 터미널 1: game-server 시작 (gRPC 서버)
pnpm run start:game:dev

# 터미널 2: realtime-server 시작 (WebSocket 서버)
pnpm run start:rt:dev
```

---

