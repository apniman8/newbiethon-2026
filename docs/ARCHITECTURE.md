# 아키텍처 (frontend/)

이 저장소는 백엔드(`backend/`, Java 21 + Spring Boot)와 프론트엔드(`frontend/`, Expo + React Native + TypeScript)를 함께 담은 모노레포다. 이 문서는 **frontend/** 범위만 다룬다.

## 디렉토리 구조
```
frontend/
├── App.tsx                 # 앱 진입점, NavigationContainer 마운트
├── index.ts                # Expo 엔트리 (registerRootComponent)
├── app.json                # Expo 앱 설정
└── src/
    ├── screens/             # OriginInput, DestinationInput, Loading, Guide, Arrived
    ├── components/          # 화면에서 재사용하는 UI 조각 (PlaceSelector, MapPane, GuideStepCard 등)
    ├── navigation/           # React Navigation 스택 정의, 라우트 파라미터 타입
    ├── theme/                # tokens.ts — 색상·타이포·간격·radius 상수 (fig-tokens.css 기반)
    ├── data/                 # 데이터 계층
    │   ├── fixtures/          # contracts/v1.2 고정 JSON의 로컬 사본 (목데이터)
    │   ├── errors.ts          # RouteServiceError — 타입화된 에러 (아래 "에러 모델" 참조)
    │   ├── constants.ts       # 현재 지원하는 MAP_ID
    │   └── routeService.ts   # 실제 백엔드 places/route API 호출 경계
    ├── utils/
    │   └── routeSteps.ts      # v1.2 세그먼트를 체크리스트 항목 목록으로 펼침 (ADR-015)
    ├── types/                # contracts/v1.2 스키마를 그대로 반영한 TS 타입
    └── hooks/                # 화면 간 공유되는 로직 (모션 감소, 느린 로딩 힌트)
```

## 화면 흐름
```
OriginInput        (GET places 결과에서 출발지 선택)
  → DestinationInput (GET places 결과에서 도착지 + 프로필 선택)
    → Loading         (선택한 placeId로 경로 조회)
      → Guide           (경로 전체 체크리스트) ─┬─ 항목 0개 → Arrived로 즉시 대체
                                                └─ 마지막 항목 체크 → Arrived
        → Arrived         ("Plan another transfer" → OriginInput으로 스택 리셋)
```
`OriginInput`과 `DestinationInput`은 `usePlaces`를 통해 실제 백엔드 장소 목록을 조회한다. 각각 `selectableAsStart`, `selectableAsDestination`으로 선택지를 제한하고 같은 장소는 도착지 목록에서 제외한다.

## 데이터 흐름
```
OriginInput / DestinationInput 마운트
  → usePlaces(mapId)
  → routeService.getPlaces(mapId)                         → PlacesResponse
  → 사용자가 출발지·도착지 Place 선택
LoadingScreen 마운트
  → routeService.getRoute({ mapId, startPlaceId, destinationPlaceId, profile })
                                                            → RouteResponse
  → navigation.replace('Guide', { route, originLabel })
```
`routeService`는 `EXPO_PUBLIC_API_BASE_URL`(기본값 `http://localhost:8080`)의 실제 API만 호출한다. 장소 조회와 경로 조회는 모두 `RouteServiceError`로 실패 종류를 정규화한다.

## 장소 선택
`PlaceSelector`는 백엔드가 반환한 안정적인 `placeId`를 radio-card UI로 선택한다. 텍스트 매칭 단계가 없으므로 한글·오타·중복 부분 문자열 문제를 만들지 않으며, 표시 이름과 ID를 navigation params로 다음 화면에 전달한다. API 조회 중에는 로딩 상태를, 실패하면 재시도 UI를 표시한다.

## 네비게이션 / 상태 관리
- 5개 화면은 선형 플로우이므로 `@react-navigation/native-stack` 하나로 충분하다. 전역 상태 라이브러리(Redux 등)는 도입하지 않는다.
- 화면 간 전달값(`originPlaceId`, `originDisplayName`, `destinationPlaceId`, `destinationDisplayName`, `profile`, 조회된 `RouteResponse`)은 React Navigation의 route params로 다음 화면에 넘긴다. 타입은 `src/navigation/types.ts`의 `RootStackParamList`.
- 각 화면 내부의 순수 UI 상태(입력 텍스트, 포커스, 토글 등)는 `useState`로 충분하다.
- 안내 화면은 `doneCount`(체크한 항목 수) 하나만 상태로 들고, 현재 항목·남은 거리·진행률은 전부 거기서 파생시킨다.

## 지도 렌더링
- 좌표는 전부 API가 내려준다: 노드는 `imageX`/`imageY`, 엣지는 `geometry[]`, 둘 다 **해당 지도 이미지 기준 0~1 정규화 값**이다(`docs/ADR.md` ADR-014). 프론트에는 좌표 테이블이 없다.
- `MapPane`은 현재 항목의 `geometry`를 굵게, 같은 세그먼트의 나머지 엣지를 흐리게 그린다. `viewBox`는 세그먼트 전체의 바운딩 박스에 여백을 더해 계산하므로 항목이 바뀌면 자연스럽게 그 구간으로 확대된다 — 별도 카메라 로직이 필요 없다.
- 정규화 좌표를 그대로 쓰면 지도 이미지의 가로세로비가 무시되어 형태가 찌그러진다. `mapImages[].intrinsicWidth/Height`에서 구한 `mapAspect`를 x에 곱해 원래 비율로 되돌린 뒤 그린다.
- 지도 이미지는 `src/assets/mapImages.ts`가 `assetKey`로 매핑한다. 등록된 지도는 SVG 좌표계 `x 0..mapAspect, y 0..1`에 배경으로 깔리고, 없는 지도(`seoul-arex-exploded`)는 배경 없이 경로만 그린다. 가로세로비는 계약 선언값이 아니라 **번들 파일의 실제 크기**에서 계산한다(`docs/ADR.md` ADR-016).

## 타입
- `src/types/`는 `contracts/v1.2/route-contract-v1.2.json`, `places-contract-v1.2.json`, `route-enums-v1.2.md`를 그대로 TS로 옮긴 것이다. 계약이 바뀌면 이 폴더만 갱신한다.
- `RouteSegment`는 `segmentType`으로 갈라지는 판별 유니온(`MapSegment` | `TransitionSegment`)이다. 세그먼트를 직접 순회하는 코드는 `src/utils/routeSteps.ts` 하나뿐이고, 화면은 거기서 나온 평평한 `GuideStep[]`만 본다.

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
- 화면은 항상 `catch (e) { if (e instanceof RouteServiceError) ... }`로 `kind`를 분기해 `ErrorState` 컴포넌트에 넘긴다. `kind`별 문구는 화면 로직이 아니라 `ErrorState` 내부의 매핑 테이블 하나로 관리한다(중복 방지).

## 화면 상태 머신
`LoadingScreen`은 아래 상태만 갖는다(성공 시 화면 자체를 벗어나 `Guide`로 교체되므로 "ready" 상태가 없다):
```ts
// errorKind === null 이면 loading, 아니면 error
type LoadingState = { errorKind: RouteServiceErrorKind | null };
```
- `errorKind === null` → 스피너 + "Finding your way" (8초 초과 시 "Still looking…" 보조 문구, `docs/PRD.md` 참고).
- `errorKind !== null` → `ErrorState`가 kind에 맞는 문구·버튼(Retry 또는 "Choose a different destination")을 결정한다.

`OriginInput`/`DestinationInput`은 네트워크 요청이 없으므로 상태 머신이 필요 없다 — 입력값과 "계속하기 가능 여부(non-empty)"만 로컬 state로 관리한다.

`useEffect` 기반 fetch는 항상 "이 effect가 마지막으로 실행된 것인지" 가드한다(취소 플래그) — 사용자가 재시도를 빠르게 두 번 트리거하는 등으로 이전 요청이 늦게 응답해 최신 상태를 덮어쓰는 레이스 컨디션을 막기 위함이다.

## 방어적 가드 (크래시 방지)
- **항목 0개 경로**: 세그먼트를 펼친 결과가 비어 있는 응답은 유효하다(출발지=도착지 등). `GuideScreen`이 마운트 시점에 감지해 `navigation.replace('Arrived', { route })`로 즉시 대체한다 — 어떤 경로로 이 화면에 도달해도 빈 배열을 인덱싱해 죽는 일이 없어야 한다. React Hooks 규칙상 이 가드는 모든 훅 호출 **이후에** 조건부 반환으로 처리한다(하단 "훅 순서" 참고).
- **지도 없이도 성립하는 안내**: 지도는 보조 수단이다. 배경 이미지가 없는 지금도, 좌표가 이상하더라도, 각 항목의 지시문과 도착 노드 설명만으로 안내가 성립해야 한다 — 지도 영역은 없어도 되는 요소로 취급하고 텍스트를 먼저 배치한다.
- **긴 텍스트 오버플로우**: 체크리스트 전체가 `ScrollView` 안에 있고, 현재 항목의 CTA는 그 카드 안에 있다. 항목이 길어져도 버튼이 잘리지 않으며, 항목이 바뀌면 현재 카드 위치로 자동 스크롤한다. 입력 화면(`OriginInput`/`DestinationInput`)은 `KeyboardAvoidingView`로 감싸 소프트 키보드가 입력 필드·버튼을 가리지 않게 한다.
- **안내 중 이탈 확인**: `GuideScreen`은 `navigation.addListener('beforeRemove', ...)`로 하드웨어 back/스와이프를 가로채, 체크한 항목이 하나라도 있을 때만 확인 다이얼로그를 띄운다. 최신 값을 읽어야 하므로 리스너는 `doneCount`를 ref로 참조한다(리스너를 매번 재등록하지 않기 위함).
- **도착 후 스택 정리**: `ArrivedScreen`의 "Plan another transfer"는 `navigation.popToTop()`이 아니라 `navigation.reset({ index: 0, routes: [{ name: 'OriginInput' }] })`을 쓴다 — 종료된 안내 화면들이 back 스택에 남아 사용자가 실수로 되돌아가는 일을 막는다.
- **훅 순서**: `GuideScreen`처럼 "특정 조건이면 이 화면을 그리지 않고 리다이렉트"하는 화면은, 모든 `useState`/`useEffect`/`useMemo` 호출을 조건 분기보다 먼저 배치하고 조건부 `return`은 그 뒤에 둔다. 조건부 반환을 훅 호출 사이에 넣으면 렌더마다 훅 호출 개수가 달라져 React가 에러를 던진다.
