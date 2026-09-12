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
    ├── components/          # 화면에서 재사용하는 UI 조각 (TextField, MapPane, GuideStepCard 등)
    ├── navigation/           # React Navigation 스택 정의, 라우트 파라미터 타입
    ├── theme/                # tokens.ts — 색상·타이포·간격·radius 상수 (fig-tokens.css 기반)
    ├── data/                 # 데이터 계층
    │   ├── fixtures/          # contracts/v1.2 고정 JSON의 로컬 사본 (목데이터)
    │   ├── errors.ts          # RouteServiceError — 타입화된 에러 (아래 "에러 모델" 참조)
    │   ├── constants.ts       # MAP_ID, FIXED_START_PLACE_ID
    │   └── routeService.ts   # places/route 조회 함수 — fixture 또는 실제 API를 동일 인터페이스로 반환
    ├── utils/
    │   ├── matchPlace.ts      # 자유 입력된 도착지 텍스트를 알려진 장소와 매칭 (아래 "목적지 매칭" 참조)
    │   └── routeSteps.ts      # v1.2 세그먼트를 체크리스트 항목 목록으로 펼침 (ADR-015)
    ├── types/                # contracts/v1.2 스키마를 그대로 반영한 TS 타입
    └── hooks/                # 화면 간 공유되는 로직 (모션 감소, 느린 로딩 힌트)
```

## 화면 흐름
```
OriginInput        (출발지 텍스트 + 출구 번호 입력)
  → DestinationInput (도착지 텍스트 입력 + 프로필 선택, 출발지 요약 표시)
    → Loading         (도착지 매칭 + 경로 조회)
      → Guide           (경로 전체 체크리스트) ─┬─ 항목 0개 → Arrived로 즉시 대체
                                                └─ 마지막 항목 체크 → Arrived
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
  → navigation.replace('Guide', { route, originLabel })
```
`routeService`는 fixture와 실제 API를 같은 함수 시그니처(`Promise<PlacesResponse>`, `Promise<RouteResponse>`)로 감싸므로, 화면 컴포넌트는 데이터 출처를 알 필요가 없다. 전환은 `routeService.ts` 내부 구현만 바꾸면 된다.

## 목적지 매칭
`OriginInput`/`DestinationInput`은 목록이 아니라 자유 텍스트를 받으므로(`docs/PRD.md` "출발지·도착지 입력 방식"), 실제 `placeId`로 바꿔주는 단계가 필요하다. `src/utils/matchPlace.ts`의 `resolveDestination(places, query)`가 이 역할을 한다: `selectableAsDestination`인 장소 중 `displayName` → `description` 순으로 대소문자 무시 부분 문자열 일치를 찾는다. 매치가 없으면 `null`을 반환하고, `LoadingScreen`은 이를 `RouteServiceError('NOT_FOUND')`로 변환해 기존 에러 UX(`ErrorState`)를 그대로 재사용한다.

출발지는 매칭하지 않는다 — Phase 0 백엔드가 지원하는 시작 지점은 `FIXED_START_PLACE_ID` 하나뿐이라(`docs/ADR.md` ADR-013), 사용자가 입력한 출발지 텍스트(+ 출구 번호)는 `originLabel` 문자열로만 조합해 화면에 표시한다.

## 네비게이션 / 상태 관리
- 5개 화면은 선형 플로우이므로 `@react-navigation/native-stack` 하나로 충분하다. 전역 상태 라이브러리(Redux 등)는 도입하지 않는다.
- 화면 간 전달값(`originQuery`, `originExitNumber`, `destinationQuery`, `profile`, 조회된 `RouteResponse`, 조합된 `originLabel`)은 React Navigation의 route params로 다음 화면에 넘긴다. 타입은 `src/navigation/types.ts`의 `RootStackParamList`.
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
- 도착지 텍스트가 알려진 장소와 매칭되지 않는 경우(`matchPlace.resolveDestination`이 `null`)도 `LoadingScreen`이 직접 `RouteServiceError('NOT_FOUND')`를 던져 같은 경로로 처리한다 — 매칭 실패와 백엔드의 "경로 없음"을 사용자 입장에서 구분할 이유가 없다.
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
