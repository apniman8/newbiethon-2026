# Newbiethon 2026 Backend

해커톤에서 기능 개발을 바로 시작할 수 있도록 준비한 Spring Boot 백엔드 템플릿입니다.
현재는 `Sample` 도메인의 CRUD를 예제로 제공하며, 실제 서비스 기획이 확정되면 이 구조를 기준으로 도메인 API를 추가합니다.

## 바로가기

- API Base URL: <https://newbiethon-2026.onrender.com>
- Swagger UI: <https://newbiethon-2026.onrender.com/swagger-ui/index.html>
- 서버 상태 확인: <https://newbiethon-2026.onrender.com/actuator/health>
- OpenAPI JSON: <https://newbiethon-2026.onrender.com/v3/api-docs>

> Base URL의 `/`에는 화면이 없습니다. 접속했을 때 `API_NOT_FOUND`가 나오는 것은 정상이며, 서버 상태는 `/actuator/health`에서 확인해 주세요.

## 현재 제공되는 것

- PostgreSQL과 연결된 Sample 생성·조회·수정·삭제 API
- Swagger 기반 API 문서 및 브라우저 테스트
- 요청값 검증
- 일관된 오류 응답
- 프론트엔드 연동을 위한 CORS 설정
- Render 배포 및 Health Check

이 저장소의 `Sample`은 실제 서비스 도메인이 아니라 범용 예제입니다. 기획이 확정되면 `Sample`을 참고해 필요한 도메인과 API를 추가합니다.

현재 Sample API에는 로그인이나 권한 검사가 없습니다. 인터넷에서 접근 가능한 공용 테스트 API이며, 모든 팀원이 같은 데이터를 조회하고 변경하므로 개인정보나 민감정보를 입력하면 안 됩니다.

## 역할별로 알아야 할 내용

### 기획

기획 단계에서는 화면보다 먼저 아래 내용을 정리해 백엔드와 프론트에 공유해 주세요.

- 사용자가 저장하고 조회해야 하는 데이터
- 필수값과 선택값
- 글자 수, 수량, 날짜 등 입력 제한
- 목록 정렬 및 검색·필터 조건
- 생성·수정·삭제가 가능한 조건
- 로그인 또는 권한별로 달라지는 동작
- 데이터가 없거나 요청이 실패했을 때의 동작

API 요청이 필요할 때는 다음 형식으로 전달하면 빠르게 구현할 수 있습니다.

```text
기능: 할 일 생성
메서드/주소: POST /api/tasks
필수 입력: title
선택 입력: description, dueDate
성공 결과: 생성된 할 일 반환
실패 조건: title 누락, 존재하지 않는 사용자
목록 규칙: 최신 생성순
```

### 디자인

각 화면은 정상 상태만이 아니라 다음 상태도 함께 정의해 주세요.

- Loading: 최초 요청 및 저장 중
- Empty: 목록이 비어 있을 때
- Validation error: 입력값이 잘못됐을 때
- Not found: 대상 데이터가 이미 없거나 잘못된 주소일 때
- Server error: 일시적인 서버 오류가 발생했을 때
- Success: 생성·수정·삭제가 완료됐을 때의 피드백

백엔드 오류는 항상 `code`, `message` 형태로 내려오므로 사용자에게는 `message`를 보여주고, 필요하면 `code`별 전용 화면이나 안내를 설계할 수 있습니다.

```json
{
  "code": "VALIDATION_ERROR",
  "message": "제목은 필수입니다."
}
```

### 프론트엔드

백엔드와 PostgreSQL을 로컬에서 실행할 필요가 없습니다. 배포된 API를 호출하면 됩니다. DB 접속정보나 백엔드용 `.env`도 필요하지 않습니다.

Vite를 사용한다면 프론트엔드 환경변수에 Base URL을 등록하세요.

```env
VITE_API_BASE_URL=https://newbiethon-2026.onrender.com
```

환경변수 파일은 저장소에 커밋하지 말고 `.env.example`에는 값의 형식만 남겨 주세요.

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const response = await fetch(`${API_BASE_URL}/api/samples`);

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}

const samples = await response.json();
```

프론트엔드가 배포된 뒤 브라우저에 CORS 오류가 나타나면, 프론트 배포 주소를 백엔드 담당자에게 알려 주세요. 백엔드의 허용 Origin 목록에 해당 주소를 추가해야 합니다.

## Sample API

Base path는 `/api/samples`입니다. 가장 최신에 생성된 항목이 목록의 앞에 옵니다.

| 기능 | Method | Path | 성공 상태 | 응답 |
|---|---|---|---:|---|
| 생성 | `POST` | `/api/samples` | `201` | 생성된 Sample |
| 전체 조회 | `GET` | `/api/samples` | `200` | Sample 배열 |
| 단건 조회 | `GET` | `/api/samples/{id}` | `200` | Sample 하나 |
| 일부 수정 | `PATCH` | `/api/samples/{id}` | `200` | 수정된 Sample |
| 삭제 | `DELETE` | `/api/samples/{id}` | `204` | 본문 없음 |

### 생성

```http
POST /api/samples
Content-Type: application/json
```

```json
{
  "title": "해커톤 준비",
  "content": "Swagger와 CRUD를 준비합니다."
}
```

검증 규칙:

- `title`: 필수, 공백만 입력 불가, 최대 100자
- `content`: 선택, 최대 5,000자

### 조회 응답

```json
{
  "id": 1,
  "title": "해커톤 준비",
  "content": "Swagger와 CRUD를 준비합니다.",
  "createdAt": "2026-09-11T15:00:00",
  "updatedAt": "2026-09-11T16:00:00"
}
```

전체 조회 결과가 없으면 오류가 아니라 빈 배열을 반환합니다.

```json
[]
```

### 수정

`PATCH`이므로 변경할 필드만 보내면 됩니다. 보내지 않은 필드는 기존 값을 유지합니다.

```http
PATCH /api/samples/1
Content-Type: application/json
```

```json
{
  "title": "해커톤 준비 완료"
}
```

- `title`: 선택, 전달한다면 공백만 입력 불가, 최대 100자
- `content`: 선택, 최대 5,000자

## 오류 처리

모든 오류 응답은 다음 형식을 사용합니다.

```json
{
  "code": "SAMPLE_NOT_FOUND",
  "message": "Sample을 찾을 수 없습니다."
}
```

| HTTP 상태 | code | 의미 | 프론트 권장 처리 |
|---:|---|---|---|
| `400` | `VALIDATION_ERROR` | 입력값 검증 실패 | `message`를 입력창 주변 또는 알림으로 표시 |
| `400` | `INVALID_REQUEST` | JSON 형식, 타입 등이 잘못됨 | 요청값 확인 안내 |
| `404` | `SAMPLE_NOT_FOUND` | 해당 Sample이 없음 | 목록으로 이동하거나 새로고침 안내 |
| `404` | `API_NOT_FOUND` | 존재하지 않는 API 주소 | 프론트 API 경로 확인 |
| `500` | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 | 재시도 안내 후 백엔드 담당자에게 전달 |

프론트에서는 HTTP 상태만 확인하지 말고 오류 본문의 `code`도 함께 분기해 주세요.

## 협업 규칙

- API의 최신 규격은 Swagger를 기준으로 확인합니다.
- 프론트에서 Base URL을 코드 여러 곳에 직접 적지 않고 환경변수 한 곳에서 관리합니다.
- API 필드명이나 응답 구조를 변경해야 한다면 프론트 사용 여부를 먼저 확인합니다.
- 버그를 전달할 때 요청 Method, URL, Request Body, Response Status와 Body를 함께 남깁니다.
- DB 비밀번호와 Render 환경변수는 채팅, README, 이슈, 프론트 코드에 공유하지 않습니다.
- 배포 서버의 데이터는 팀이 함께 사용하므로 테스트 데이터에는 개인정보나 민감정보를 넣지 않습니다.

버그 제보 예시:

```text
발생 시각: 2026-09-11 18:30 KST
Method/URL: PATCH /api/samples/1
Request Body: { "title": "수정 제목" }
Status: 500
Response Body: { "code": "INTERNAL_SERVER_ERROR", "message": "서버 내부 오류가 발생했습니다." }
재현 과정: 목록에서 첫 번째 항목을 선택한 뒤 저장 버튼 클릭
```

## Render 무료 서버 사용 시 참고

무료 서버는 한동안 요청이 없으면 잠들 수 있습니다. 이 경우 첫 요청이 평소보다 오래 걸릴 수 있으니 약 1분 기다린 뒤 다시 시도해 주세요.

발표 직전에는 아래 주소를 한 번 열어 서버를 깨워 둡니다.

<https://newbiethon-2026.onrender.com/actuator/health>

정상 응답:

```json
{
  "status": "UP"
}
```

## 기술 구성

- Java 21
- Spring Boot 4
- Spring Data JPA
- PostgreSQL
- Spring Validation
- Springdoc OpenAPI / Swagger UI
- Docker
- Render
