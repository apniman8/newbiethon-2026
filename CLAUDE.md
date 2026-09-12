# 프로젝트: Easy Transfer — 서울역 실내 길찾기

모노레포. `backend/`(Java 21 + Spring Boot, 기존 구현 완료)와 `frontend/`(이번 작업 범위). 이 문서와 `docs/*.md`는 **frontend 작업**을 기준으로 작성됐다.

## 화면 흐름
`OriginInput` → `DestinationInput` → `Loading` → `Guide` → `Arrived` (선형, 분기 없음). 안내 화면은 턴바이턴이 아니라 **체크리스트**다(`docs/ADR.md` ADR-015). 상세는 `docs/ARCHITECTURE.md` "화면 흐름" 참조.

## 기술 스택 (frontend/)
- Expo (React Native), TypeScript
- 네비게이션: `@react-navigation/native` + `@react-navigation/native-stack`
- 지도/경로 렌더링: `react-native-svg`
- 스타일링: RN `StyleSheet` + `src/theme/tokens.ts` 상수 (CSS-in-JS 라이브러리 도입하지 않음)
- 상태 관리: 전역 라이브러리 없이 화면 로컬 state + React Navigation route params

## 아키텍처 규칙
- CRITICAL: 화면 컴포넌트(`src/screens/`)는 데이터를 직접 fetch하지 않는다. 항상 `src/data/routeService.ts`를 통해서만 places/route 데이터를 가져온다 — fixture와 실제 API를 교체 가능하게 유지하기 위함.
- CRITICAL: 프론트는 `contracts/v1.2`를 따른다. enum 값(`route-enums-v1.2.md`)을 임의로 확장하거나 변형하지 않으며, `WHEELCHAIR` 프로필은 어떤 화면에도 노출하지 않는다.
- CRITICAL: 경로 좌표는 API가 주는 정규화 값(`imageX`/`imageY`, `geometry`)만 쓴다. 프론트에 좌표 테이블을 다시 만들지 않는다(`docs/ADR.md` ADR-014). 역 안내도 이미지가 없는 동안에도 지도처럼 보이는 가짜 배경을 그리지 않는다.
- CRITICAL: 색상 hex를 컴포넌트에 직접 하드코딩하지 않는다. `src/theme/tokens.ts`의 상수를 참조한다.
- CRITICAL: `routeService.ts`는 일반 `Error`가 아니라 `src/data/errors.ts`의 `RouteServiceError`(`kind: 'NETWORK'|'NOT_FOUND'|'INVALID_REQUEST'|'SERVER_ERROR'`)만 던진다. 화면은 이 `kind`를 분기해 `ErrorState`로 보여준다 — "네트워크 끊김"과 "경로 없음"과 "서버 오류"를 같은 문구로 뭉뚱그리지 않는다(`docs/ADR.md` ADR-007, `docs/PRD.md` "데이터 로딩 실패").
- CRITICAL: 세그먼트를 펼친 체크리스트 항목이 0개인 응답은 유효하다. 이 배열을 가드 없이 인덱싱해 크래시를 유발하지 않는다 — `GuideScreen`이 마운트 시 확인하고 즉시 `Arrived`로 리다이렉트한다(`docs/ADR.md` ADR-009). 조건부 리다이렉트는 반드시 모든 훅 호출 뒤에 두어 Rules of Hooks를 지킨다(`docs/ARCHITECTURE.md` "훅 순서").
- CRITICAL: 출발지·도착지는 목록에서 고르게 하지 않고 자유 텍스트로 입력받는다 — 픽리스트 UI로 되돌리지 않는다(`docs/ADR.md` ADR-012). 도착지 텍스트는 `Loading` 화면에서 `src/utils/matchPlace.ts`로 알려진 장소와 매칭하고, 매칭 실패는 `RouteServiceError('NOT_FOUND')`로 처리한다.
- CRITICAL: 출발지 입력값(역 이름 + 출구 번호)은 표시용 `originLabel`일 뿐이다. 실제 라우팅 요청의 `startPlaceId`는 항상 `FIXED_START_PLACE_ID`로 고정한다 — 출발지 텍스트를 검증하거나 매칭 로직에 연결하지 않는다(`docs/ADR.md` ADR-013).
- CRITICAL: 세그먼트를 직접 순회하는 코드는 `src/utils/routeSteps.ts` 하나로 유지한다. 화면은 거기서 나온 평평한 `GuideStep[]`만 다룬다 — 화면 컴포넌트에서 `segments`/`edges`를 직접 파고들지 않는다.
- CRITICAL: 지시문·도착 지점 설명 등 가변 길이 텍스트가 들어가는 영역은 항상 스크롤 가능해야 한다 — 긴 텍스트 때문에 버튼이 화면 밖으로 밀려나는 것을 금지한다. 입력 화면은 `KeyboardAvoidingView`도 함께 쓴다.
- 컴포넌트는 `src/components/`, 화면은 `src/screens/`, 타입은 `src/types/`, 목데이터·데이터 서비스는 `src/data/`에 둔다.
- 이번 MVP는 다국어 전환을 지원하지 않는다(`docs/ADR.md` ADR-005) — 텍스트는 영문으로 직접 작성해도 된다. 별도 i18n 사전 레이어를 만들지 않는다.
- 안내 화면에서 항목을 하나라도 체크한 뒤에는 뒤로가기/스와이프 이탈 시 확인 다이얼로그를 띄운다(`docs/ADR.md` ADR-010). 도착 후 "Plan another transfer"는 `navigation.reset`으로 안내 화면들을 스택에서 완전히 제거한다(ADR-011).

## 필독 문서
작업 전 반드시 `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/ADR.md`, `docs/UI_GUIDE.md`를 읽고 제품·아키텍처·디자인 의도를 파악한다.

## 명령어 (frontend/ 안에서 실행)
```bash
npm run start    # Expo 개발 서버 (Expo Go로 스캔)
npm run android  # Android 에뮬레이터/기기
npm run ios      # iOS 시뮬레이터 (macOS 전용)
npm run web      # 웹 프리뷰 (보조 확인용, 배포 타깃 아님)
```
