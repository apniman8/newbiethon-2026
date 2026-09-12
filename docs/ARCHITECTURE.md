# 아키텍처 (frontend/)

이 저장소는 백엔드(`backend/`, Java 21 + Spring Boot)와 프론트엔드(`frontend/`, Expo + React Native + TypeScript)를 함께 담은 모노레포다. 이 문서는 **frontend/** 범위만 다룬다.

## 디렉토리 구조
```
frontend/
├── App.tsx                 # 앱 진입점, NavigationContainer 마운트
├── index.ts                # Expo 엔트리 (registerRootComponent)
├── app.json                # Expo 앱 설정
└── src/
    ├── screens/             # OriginInput, DestinationInput, Loading, TurnByTurn, Arrived
    ├── components/          # 화면에서 재사용하는 UI 조각 (TextField, MapPane, NavButton 등)
    ├── navigation/           # React Navigation 스택 정의, 라우트 파라미터 타입
    ├── theme/                # tokens.ts — 색상·타이포·간격·radius 상수 (fig-tokens.css 기반)
    ├── data/                 # 데이터 계층
    │   ├── fixtures/          # contracts/v1.1 고정 JSON의 로컬 사본 (목데이터)
    │   ├── nodeCoordinates.ts # 노드ID → 지도 원본 이미지 픽셀 좌표 (프론트 자체 관리)
    │   ├── errors.ts          # RouteServiceError — 타입화된 에러 (아래 "에러 모델" 참조)
    │   ├── constants.ts       # MAP_ID, FIXED_START_PLACE_ID
    │   └── routeService.ts   # places/route 조회 함수 — fixture 또는 실제 API를 동일 인터페이스로 반환
    ├── utils/
    │   └── matchPlace.ts      # 자유 입력된 도착지 텍스트를 알려진 장소와 매칭 (아래 "목적지 매칭" 참조)
    ├── types/                # contracts/v1.1 스키마를 그대로 반영한 TS 타입
    ├── hooks/                # 화면 간 공유되는 로직 (카메라 프레이밍, 모션 감소, 느린 로딩 힌트)
    └── assets/               # seoul-station-map.png 등 번들 이미지
```

## 화면 흐름
```
OriginInput        (출발지 텍스트 + 출구 번호 입력)
  → DestinationInput (도착지 텍스트 입력 + 프로필 선택, 출발지 요약 표시)
    → Loading         (도착지 매칭 + 경로 조회)
      → TurnByTurn      (지도 + 스텝별 안내) ─┬─ steps.length === 0 → Arrived로 즉시 대체
                                              └─ 마지막 스텝 "I'm here" → Arrived
        → Arrived         ("Plan another transfer" → OriginInput으로 스택 리셋)
```
`OriginInput`과 `DestinationInput`은 입력값 검증(비어있지 않은지)만 하고 네트워크 요청을 하지 않는다 — 실제 데이터 조회와 실패 처리는 전부 `Loading` 화면에 모여 있다.

## 데이터 흐름
```
LoadingScreen 마운트
  → routeService.getPlaces(mapId)                         → PlacesResponse
  → utils/matchPlace.resolveDestination(places, query)     → Place | null
      null이면 RouteServiceError('NOT_FOUND')를 던지고 종료
  → routeService.getRoute({ mapId, startPlaceId: FIXED_START_PLACE_ID, destinationPlaceId, profile })
                                                            → RouteResponse
  → navigation.replace('TurnByTurn', { route, originLabel })
```
`routeService`는 fixture와 실제 API를 같은 함수 시그니처(`Promise<PlacesResponse>`, `Promise<RouteResponse>`)로 감싸므로, 화면 컴포넌트는 데이터 출처를 알 필요가 없다. 전환은 `routeService.ts` 내부 구현만 바꾸면 된다.

## 목적지 매칭
`OriginInput`/`DestinationInput`은 목록이 아니라 자유 텍스트를 받으므로(`docs/PRD.md` "출발지·도착지 입력 방식"), 실제 `placeId`로 바꿔주는 단계가 필요하다. `src/utils/matchPlace.ts`의 `resolveDestination(places, query)`가 이 역할을 한다: `selectableAsDestination`인 장소 중 `displayName` → `description` 순으로 대소문자 무시 부분 문자열 일치를 찾는다. 매치가 없으면 `null`을 반환하고, `LoadingScreen`은 이를 `RouteServiceError('NOT_FOUND')`로 변환해 기존 에러 UX(`ErrorState`)를 그대로 재사용한다.

출발지는 매칭하지 않는다 — Phase 0 백엔드가 지원하는 시작 지점은 `FIXED_START_PLACE_ID` 하나뿐이라(`docs/ADR.md` ADR-013), 사용자가 입력한 출발지 텍스트(+ 출구 번호)는 `originLabel` 문자열로만 조합해 화면에 표시한다.

## 네비게이션 / 상태 관리
- 5개 화면은 선형 플로우이므로 `@react-navigation/native-stack` 하나로 충분하다. 전역 상태 라이브러리(Redux 등)는 도입하지 않는다.
- 화면 간 전달값(`originQuery`, `originExitNumber`, `destinationQuery`, `profile`, 조회된 `RouteResponse`, 조합된 `originLabel`)은 React Navigation의 route params로 다음 화면에 넘긴다. 타입은 `src/navigation/types.ts`의 `RootStackParamList`.
- 각 화면 내부의 순수 UI 상태(입력 텍스트, 포커스, 토글 등)는 `useState`로 충분하다.
- 턴바이턴 화면의 지도 카메라 값(zoom/cx/cy)은 현재 스텝의 좌표에서 매 렌더마다 순수 함수로 계산한다(`useMemo`) — 별도 상태로 들고 있지 않는다.

## 지도 렌더링
- 원본 이미지 1장(`src/assets/seoul-station-map.png`, 1575×800)을 `View`에 절대 배치하고, `react-native-svg`로 동일 크기 오버레이(`Svg viewBox="0 0 1575 800"`)를 겹친다.
- 좌표는 항상 원본 이미지 픽셀 좌표로 관리한다(`src/data/nodeCoordinates.ts`).
- 카메라 팬/줌은 레이어 `View`의 `transform: [{translateX}, {translateY}, {scale}]`로 구현하고, 현재 구간(마지막 두 좌표) 기준으로 매 스텝 재계산한다. 상세 공식은 `docs/UI_GUIDE.md`의 지도 렌더링 규칙 참조.
- `contracts/v1.1/node-image-key-v1.1.json`(노드별 개별 webp 이미지 매핑)은 이번 MVP에서 사용하지 않는다 — 이유는 `docs/ADR.md` ADR-003 참조.

## 타입
- `src/types/`는 `contracts/v1.1/route-contract-v1.1.json`, `places-contract-v1.1.json`, `route-enums-v1.1.md`를 그대로 TS로 옮긴 것이다. 계약이 바뀌면(`v1.2` 등) 이 폴더만 갱신한다.

## 에러 모델
"네트워크 끊김"과 "경로 없음"과 "서버 500"은 사용자에게 완전히 다른 메시지여야 한다(`docs/PRD.md` "데이터 로딩 실패" 표). 이를 위해 `routeService.ts`는 일반 `Error`가 아니라 아래 타입화된 에러만 던진다.

```ts
// src/data/errors.ts
export type RouteServiceErrorKind = 'NETWORK' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'SERVER_ERROR';

export class RouteServiceError extends Error {
  constructor(public readonly kind: RouteServiceErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'RouteServiceError';
  }
}
```

- `fetch` 자체가 실패(오프라인, 타임아웃, DNS 등 `TypeError`)하면 `NETWORK`.
- HTTP `404`는 `NOT_FOUND`, `400`/`422`는 `INVALID_REQUEST`, `5xx`는 `SERVER_ERROR`로 매핑한다.
- 도착지 텍스트가 알려진 장소와 매칭되지 않는 경우(`matchPlace.resolveDestination`이 `null`)도 `LoadingScreen`이 직접 `RouteServiceError('NOT_FOUND')`를 던져 같은 경로로 처리한다 — 매칭 실패와 백엔드의 "경로 없음"을 사용자 입장에서 구분할 이유가 없다.
- 화면은 항상 `catch (e) { if (e instanceof RouteServiceError) ... }`로 `kind`를 분기해 `ErrorState` 컴포넌트에 넘긴다. `kind`별 문구는 화면 로직이 아니라 `ErrorState` 내부의 매핑 테이블 하나로 관리한다(중복 방지).

## 화면 상태 머신
`LoadingScreen`은 아래 상태만 갖는다(성공 시 화면 자체를 벗어나 `TurnByTurn`으로 교체되므로 "ready" 상태가 없다):
```ts
// errorKind === null 이면 loading, 아니면 error
type LoadingState = { errorKind: RouteServiceErrorKind | null };
```
- `errorKind === null` → 스피너 + "Finding your way" (8초 초과 시 "Still looking…" 보조 문구, `docs/PRD.md` 참고).
- `errorKind !== null` → `ErrorState`가 kind에 맞는 문구·버튼(Retry 또는 "Choose a different destination")을 결정한다.

`OriginInput`/`DestinationInput`은 네트워크 요청이 없으므로 상태 머신이 필요 없다 — 입력값과 "계속하기 가능 여부(non-empty)"만 로컬 state로 관리한다.

`useEffect` 기반 fetch는 항상 "이 effect가 마지막으로 실행된 것인지" 가드한다(취소 플래그) — 사용자가 재시도를 빠르게 두 번 트리거하는 등으로 이전 요청이 늦게 응답해 최신 상태를 덮어쓰는 레이스 컨디션을 막기 위함이다.

## 방어적 가드 (크래시 방지)
- **빈 스텝 경로**: `RouteResponse.steps.length === 0`는 유효한 응답이다(출발지=도착지 등). 이제 경로 미리보기 화면이 없으므로, `TurnByTurnScreen`이 마운트 시점에 이 조건을 감지해 `navigation.replace('Arrived', { route })`로 즉시 대체한다 — 직접 재진입/뒤로가기 등 어떤 경로로 이 화면에 도달해도 빈 배열을 인덱싱해 죽는 일이 없어야 한다. React Hooks 규칙상 이 가드는 모든 훅 호출 **이후에** 조건부 반환으로 처리한다(하단 "훅 순서" 참고).
- **좌표 테이블 미스**: `nodeCoordinates.ts`의 `getNodeCoordinate`는 실패를 침묵으로 감추지 않는다. 반환 타입은 `[number, number] | null`이며, 미스 시 `null`을 반환한다. `MapPane`은 현재 구간의 두 점 중 하나라도 `null`이면 지도 대신 회색 placeholder(`docs/UI_GUIDE.md` "지도 로드 실패" 참조)를 그리고, 지시문·랜드마크 콜아웃은 평소대로 렌더링한다.
- **이미지 로드 실패**: `MapPane`의 `<Image>`는 `onError`를 반드시 연결하고, 에러 시 동일한 회색 placeholder로 전환한다(좌표 미스와 같은 폴백 UI 재사용).
- **긴 텍스트 오버플로우**: 스크롤 가능한 콘텐츠(지시문, 랜드마크 설명)는 항상 `ScrollView`로 감싸고, 하단 액션 버튼(다음/이전/CTA)은 스크롤 영역 밖의 고정 `View`에 둔다. 어떤 화면도 콘텐츠 길이 때문에 버튼이 화면 밖으로 밀려나면 안 된다. 입력 화면(`OriginInput`/`DestinationInput`)은 추가로 `KeyboardAvoidingView`로 감싸 소프트 키보드가 입력 필드·버튼을 가리지 않게 한다.
- **안내 중 이탈 확인**: `TurnByTurnScreen`은 `navigation.addListener('beforeRemove', ...)`로 하드웨어 back/스와이프를 가로채, `stepIndex > 0`일 때만 확인 다이얼로그를 띄운다. 첫 스텝(`stepIndex === 0`)에서는 그대로 나가게 둔다.
- **도착 후 스택 정리**: `ArrivedScreen`의 "Plan another transfer"는 `navigation.popToTop()`이 아니라 `navigation.reset({ index: 0, routes: [{ name: 'OriginInput' }] })`을 쓴다 — 종료된 안내 화면들이 back 스택에 남아 사용자가 실수로 되돌아가는 일을 막는다.
- **훅 순서**: `TurnByTurnScreen`처럼 "특정 조건이면 이 화면을 그리지 않고 리다이렉트"하는 화면은, 모든 `useState`/`useEffect`/`useMemo` 호출을 조건 분기보다 먼저 배치하고 조건부 `return`은 그 뒤에 둔다. 조건부 반환을 훅 호출 사이에 넣으면 렌더마다 훅 호출 개수가 달라져 React가 에러를 던진다.
