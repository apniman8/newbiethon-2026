# UI 디자인 가이드 — Easy Transfer (모바일)

기준 자료: Claude Design 핸드오프 `Easy Transfer App.dc.html`(390×844 모바일 플로우, 확정) + `components/fig-tokens.css`(색상 소스) + `Frontend Spec.dc.html`(지도 렌더링·접근성 규칙, 플랫폼 무관하게 재사용). 출발지·도착지 자유 입력 화면과 로딩 화면은 이 목업에 없던 화면으로, 위 자료의 토큰·타이포·컴포넌트 스타일을 그대로 재사용해 새로 정의했다(`docs/ADR.md` ADR-012, ADR-013).

## 디자인 원칙
1. 내비게이션 도구다. 마케팅 화면이 아니다 — 다음에 뭘 해야 하는지(방향·거리·층)가 화면에서 가장 큰 글자여야 한다.
2. 지도는 보조 수단이다. 지도가 안 뜨거나 로드에 실패해도 텍스트 지시문만으로 안내가 성립해야 한다.
3. 걷는 중에 한 손으로, 짧게 훑어보고 이해할 수 있어야 한다 — 문장은 짧게, 핵심 동작(직진/좌회전/계단)을 문장 맨 앞에.

## AI 슬롭 안티패턴 — 하지 마라
| 금지 사항 | 이유 |
|-----------|------|
| blur/glass morphism 배경 | AI 템플릿의 가장 흔한 징후 |
| 그라디언트 텍스트 | AI가 만든 SaaS 랜딩의 1번 특징 |
| "Powered by AI" 류 배지 | 기능이 아니라 장식 |
| 네온 글로우 box-shadow 애니메이션 | 실내 길찾기 도구와 무관한 장식 |
| 보라/인디고를 브랜드 포인트 컬러로 사용 | "AI = 보라색" 클리셰. 이 앱의 포인트는 blue(`--primary-normal`)다 |
| 모든 카드에 동일한 큰 radius를 습관적으로 적용 | radius는 아래 표의 값만 쓴다 |
| 배경 gradient orb / blur 원 장식 | 지도·지시문 가독성을 해친다 |

## 색상 (`components/fig-tokens.css` 라이트 모드 값)
| 토큰 | 값 | 용도 |
|------|------|------|
| `primary` | `#3366FF` | 주요 버튼, 선택 상태, 진행 인디케이터, 현위치 마커·경로 |
| `primaryStrong` | `#2B54D6` | 주요 버튼 pressed/hover |
| `labelStrong` | `#111418` | 제목, 최우선 텍스트 |
| `labelNeutral` | `#4B5563` | 본문 |
| `labelAlternative` | `#6B7280` | 보조 텍스트, 캡션 |
| `fillAlternative` | `rgba(112,115,124,0.05)` ≈ `#F2F4F7` | 리스트 아이템 배경, 비활성 트랙 |
| `fillNormal` | `rgba(112,115,124,0.08)` | pressed 배경 |
| `lineNormalNormal` | `#E8EBF0` | 구분선, 카드 보더 |
| `background` | `#FFFFFF` | 화면 배경 |
| `inverseBackground` | `#1B1C1E` | 경로 요약 히어로 카드, 턴바이턴 화면 배경(다크) |
| `calloutBackground` | `#EBF2FF` | 안내 콜아웃 배경 (primary 8% 톤) |
| `routeOverlay` | `#E8352B` | (레거시) 지도 위 경로선 — 실제 확정 목업은 `primary` 블루 경로선을 쓴다. `MapPane`은 `primary`를 기본값으로 하고 색은 상수화해 둔다 |
| `statusPositive` | `#00BF40` | 도착 화면 체크 아이콘 |

새 hex를 하드코딩하지 말고 `frontend/src/theme/tokens.ts`의 상수를 참조한다.

## 타이포그래피
서체는 Pretendard 기준(폰트 파일 확보 전까지는 시스템 폰트로 폴백). 아래는 RN `StyleSheet` 기준값이다.

| 용도 | 크기/굵기 | 비고 |
|------|-----------|------|
| 화면 제목 (예: "Where are you heading?") | 28 / 700, lineHeight 35 | letterSpacing 약간 음수 |
| 섹션 라벨 (예: "FROM", "Platforms inside the gates") | 13 / 600, letterSpacing 0.4, uppercase | `labelAlternative` 색 |
| 리스트 본문 | 15~16 / 600 | `labelStrong` |
| 보조 설명 | 13 / 400 | `labelAlternative` |
| 턴바이턴 지시문 (`instruction`) | 20 / 600, lineHeight 28 | 화면에서 가장 눈에 띄는 텍스트 다음으로 큼 |
| 버튼 라벨 | 17 / 700 | |
| 캡션 (층 배지, 진행 라벨) | 12 / 600~700 | |
| 최소 본문 크기 | 12 | 이보다 작게 쓰지 않는다 |

## 화면별 스펙 (390×844 레퍼런스, 실제는 기기 세이프에어리어에 맞춰 유동)

### 01 · Origin input
- 상단: 진행 라벨("STEP 1 OF 2", primary, 13/600) + 2줄 타이틀("Where are you starting from?") + 보조 설명(14/400, `labelNeutral`, "Type a station or entrance name — you can paste it too.").
- 뒤로가기 버튼 없음 — 플로우의 첫 화면.
- `TextField` × 2: "Starting point"(자유 텍스트), "Exit number (optional)"(숫자 키패드). 스펙은 아래 "TextField" 절 참조.
- 하단 CTA: "Continue", 높이 56, radius 14, `primary` 배경, 흰 글자 17/700, pressed 시 `primaryStrong`. Starting point가 비어 있으면 비활성(opacity .45).
- 소프트 키보드에 가리지 않도록 `KeyboardAvoidingView`로 감싼다(iOS는 `padding` 동작).

### 02 · Destination input
- 상단바: `ScreenTopBar`("Destination" + 뒤로가기, 아래 절 참조).
- 진행 라벨("STEP 2 OF 2") + 2줄 타이틀("Where are you heading?").
- FROM 요약 카드: `fillAlternative` 배경, radius 16, padding 16, 점 마커(●, primary) + 라벨(11/600, uppercase, `labelAlternative`, "FROM") + 값(15/600, 앞 화면에서 입력한 `originQuery`(+ `· Exit {n}`)).
- `TextField` × 1: "Destination"(자유 텍스트, `autoFocus`).
- 프로필 선택(Standard / With luggage): 라벨("Traveling with luggage?", 13/600 uppercase `labelAlternative`) + `ProfileSwitcher` segment pill, 선택 시 `labelStrong` 배경 + 흰 글자, radius 12, 높이 44, `flex:1`로 균등 분할.
- 하단 CTA: "Find my way", Origin input과 동일 버튼 스펙. Destination이 비어 있으면 비활성.

### 03 · Loading (경로 연결)
- 상단바 없음 — 전체 화면 중앙 정렬 콘텐츠.
- 로딩 중: 큰 `ActivityIndicator`(`primary` 색) + 제목("Finding your way", 18/700, `labelStrong`) + 부제("{origin} → {destination}", 14/500, `labelNeutral`, 중앙 정렬).
- 8초 초과 시: 부제 아래 13/400 `labelAlternative`로 "Still looking for a route…" 추가.
- 실패 시: 로딩 UI 전체를 `ErrorState`로 교체(아래 "에러·엣지 상태" 참조) — 레이아웃 점프를 굳이 막을 필요는 없다(화면이 완전히 바뀌는 것이 맞다).
- 최소 노출 시간을 인위적으로 늘리지 않는다 — 빠르게 성공하면 그대로 다음 화면으로 넘어간다.

### 04 · Turn-by-turn (핵심 화면)
- 배경은 다크(`#0F1115`) — 지도·안내에 집중.
- 상단 진행 트랙: 스텝 수만큼 `flex:1` bar, 지난/현재 `primary`, 이후 `rgba(255,255,255,.18)`.
- 지도 패널: `MapPane` 참고. radius 20, 배경 `#171A20`, `overflow:hidden`.
- 지시 블록: 52×52 방향 아이콘 타일(`primary` 배경, radius 16, 글자 26/700) + 이동수단 라벨(12/700, uppercase, `rgba(255,255,255,.5)`) + 거리(20/700, 흰색) → 지시문(20/600, 흰색) → 랜드마크 콜아웃(`rgba(255,255,255,.07)` 배경, radius 14, 타입 배지 + 이름(14/600) + 설명(13, `rgba(255,255,255,.62)`)).
- 하단 버튼 행: 이전(56×56 정사각, `rgba(255,255,255,.12)` 배경) + 다음(`flex:1`, `primary` 배경). 마지막 스텝의 다음 버튼 라벨은 "I'm here"로 바뀐다.

### 05 · Arrived
- 상단 72×72 원형 체크 아이콘(`statusPositive` 배경, 흰 체크).
- 제목(32/700) + 설명(16, `labelNeutral`).
- 요약 리스트(Walked / Took / Next train): 각 행 `fillAlternative` 배경, 좌우 space-between, 얇은 `lineNormalNormal` 구분선으로 분리된 하나의 radius 16 그룹.
- 버튼 2개: primary CTA("Plan another transfer") + secondary outline 버튼("Report a wrong turn", `border: 1px solid lineNormalNormal`, 투명 배경).

## 공용 입력 컴포넌트

### TextField
- 레이블: 13/600, letterSpacing 0.4, uppercase, `labelAlternative` — 입력창 위에 배치.
- 입력창: 높이 52, radius 12(`radius.lg`), 배경 `background`, 기본 보더 1px `lineNormalNormal`. 포커스 시 보더 2px `primary`로 강조(두께가 바뀌므로 레이아웃이 흔들리지 않도록 보더만 굵어지게 한다, 외곽 크기는 고정).
- 텍스트: 16/500, `labelStrong`. placeholder는 `labelAlternative`.
- 숫자 입력(출구 번호)은 `keyboardType="number-pad"`를 쓰되, 형식을 강제 검증하지 않는다(`docs/PRD.md` 참조).

### ScreenTopBar
- 뒤로가기 버튼: 36×36 원형, 배경 `fillAlternative`, 글리프 `‹`(18px, `labelNeutral`).
- 제목: 17/700, `labelStrong`, 뒤로가기 버튼과 12px 간격.
- 첫 화면(Origin input)에는 뒤로가기가 없으므로 이 컴포넌트를 쓰지 않는다.

## MapPane — 지도 렌더링 규칙
지도는 공공데이터 역이용안내도 원본 이미지 **1장**(`src/assets/seoul-station-map.png`, 1575×800)을 쓰고, 스텝마다 그 이미지를 확대·이동(카메라 팬)해서 현재 구간만 보여준다. **스텝별 이미지 파일을 따로 만들지 않는다.**

1. 지도 패널은 `overflow:hidden`인 고정 크기 `View`(예: 358×360)이고, 내부에 원본 크기 레이어를 절대 배치한다.
2. 레이어 안에 `<Image>`와 동일 크기의 `react-native-svg` `<Svg viewBox="0 0 1575 800">` 오버레이를 겹친다. 좌표는 항상 **원본 이미지 픽셀 좌표**로 관리한다(`src/data/nodeCoordinates.ts`).
3. 레이어의 `transform`에 `translateX`, `translateY`, `scale`를 적용하고 전환은 `Animated.timing`(약 500ms, easeInOut)으로 부드럽게 잇는다.
4. 현위치 펄스 원은 스케일이 걸린 좌표계 안에서 크기가 함께 늘어나지 않도록 주의한다(RN에서는 별도 `Animated.Value`로 반경을 독립 애니메이션).
5. 카메라 계산은 **현재 구간(마지막 두 좌표)** 기준으로 한다 — 전체 경로가 아니라 지금 지나는 구간이 패널 안에 들어와야 현위치 마커가 잘리지 않는다.

```ts
const VIEW_W = 358, VIEW_H = 360, PAD = 72; // PAD = 현위치 헤일로 여백

function camera(points: [number, number][]) {
  const [a, b] = points.slice(-2);
  const minX = Math.min(a[0], b[0]), maxX = Math.max(a[0], b[0]);
  const minY = Math.min(a[1], b[1]), maxY = Math.max(a[1], b[1]);
  const zoom = Math.max(1, Math.min(2.6,
    (VIEW_W - PAD * 2) / Math.max(maxX - minX, 40),
    (VIEW_H - PAD * 2) / Math.max(maxY - minY, 40)));
  return { zoom, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}
```

### 오버레이 요소 스펙
| 요소 | 스펙 |
|------|------|
| 경로 외곽선 | stroke `#FFFFFF` (투명도 .9), width 13, round cap/join |
| 경로 본선 | stroke `primary`, width 7, dasharray `16 14`, 1.1s 무한 흐름 애니메이션 |
| 진행 화살촉 | 구간 끝점에 12px 삼각형, 구간 각도로 회전 |
| 현위치 | r=9 채움 + 흰 테두리 4, 아래 r=20 헤일로(1.6s 펄스, opacity .26) |
| 층 배지 | 패널 상단 좌측, `rgba(15,17,21,.78)` 배경 pill |
| 모션 감소 | OS 수준 "동작 줄이기" 설정 시 대시 흐름·펄스·팬 트랜지션을 정지한다 |

## 접근성 · 예외 처리
- 본문 대비 4.5:1 이상 유지. 보조 텍스트를 스펙에 적힌 값보다 더 연하게 낮추지 않는다.
- 스크린리더: 각 화면 전환/스텝 전환 시 새 지시문을 안내한다(RN에서는 `AccessibilityInfo.announceForAccessibility`).
- 지도 로드 실패 시 회색 placeholder + 텍스트 지시문만으로 안내가 성립해야 한다.
- API 오류(경로 없음 / 잘못된 placeId / 서버 오류)는 원인별로 구분된 메시지와 재시도 버튼을 제공한다.

## 에러·엣지 상태
전체 시나리오 목록은 `docs/PRD.md` "에러·엣지 케이스 요구사항", 데이터 계층 규칙은 `docs/ARCHITECTURE.md` "에러 모델"·"방어적 가드" 참조. 여기서는 그 상태들의 **비주얼**만 규정한다.

### ErrorState (전체 화면 대체형 — Loading 화면 전용)
콘텐츠 영역 중앙에 세로 정렬. 카드나 보더 없이 배경과 톤을 맞춘다(라이트 배경 기준 — 턴바이턴 다크 화면에는 아직 진입하지 않은 시점이라 발생하지 않는다).

| kind | 아이콘/톤 | 제목 | 버튼 |
|---|---|---|---|
| `NETWORK` | 회색 원 안 와이파이-슬래시 글리프 | "You appear to be offline." | Retry (primary) |
| `NOT_FOUND` | 회색 원 안 지도-핀 글리프 | 입력한 도착지 텍스트가 알려진 장소와 매칭되지 않은 경우 포함, "We couldn't find a route to {destination}." | "Choose a different destination" (outline, Destination input 화면으로 돌아가 재입력) — Retry 버튼은 넣지 않는다 |
| `INVALID_REQUEST` | 회색 원 안 느낌표 글리프 | "Something's off with this request." | "Choose a different destination" (outline) |
| `SERVER_ERROR` | 회색 원 안 느낌표 글리프 | "Something went wrong on our end." | Retry (primary) |

- 아이콘 원: 56×56, 배경 `fillAlternative`, 글리프는 `labelAlternative` 색.
- 제목: 16/600, `labelStrong`, 최대 2줄, 중앙 정렬.
- 버튼 폭은 콘텐츠에 맞추고(화면 전체 폭 아님, `maxWidth: 280`) 중앙 정렬. `Retry`는 `PrimaryButton` 재사용, "Choose a different destination"은 `SecondaryButton`(도착 화면의 "Report a wrong turn"과 동일 컴포넌트) 재사용.

### MapPane 플레이스홀더 (좌표 미스 / 이미지 로드 실패 공용)
- 지도 패널과 동일한 크기(358×360)와 radius(20)를 유지해 레이아웃 점프가 없게 한다.
- 배경 `#171A20`(턴바이턴 다크 배경과 동일 톤), 중앙에 지도 아이콘 글리프(28px, `rgba(255,255,255,.35)`) + 그 아래 13/500 `rgba(255,255,255,.55)`로 "Map unavailable for this step".
- 층 배지(B1/B2 등)는 평소처럼 좌상단에 계속 표시한다 — 지도 이미지만 대체되고 층 정보는 유지.
- 이 상태에서도 `GuidanceHeader`/`LandmarkCallout`은 평소와 동일하게 렌더링된다(텍스트만으로 안내 성립 원칙).

### "안내 이탈" 확인 다이얼로그
- 네이티브 `Alert`(플랫폼 기본 다이얼로그)를 사용한다 — 커스텀 모달을 새로 만들지 않는다.
- 제목: "Leave this guide?" / 본문: "Your progress won't be saved." / 버튼: "Cancel"(기본, 취소 유지) · "Leave"(destructive 스타일, 이탈).
- `stepIndex === 0`에서는 이 다이얼로그를 띄우지 않고 즉시 이탈시킨다(`docs/ARCHITECTURE.md` "방어적 가드" 참조).

### 로딩 표시
Origin/Destination input은 네트워크 요청이 없어 로딩 상태 자체가 없다. 실제 네트워크 대기는 03 · Loading 화면 하나로 모여 있으므로, 그 화면의 중앙 `ActivityIndicator` + 텍스트 스펙(위 "03 · Loading" 절)이 유일한 로딩 표현이다 — 화면별 스켈레톤을 별도로 만들지 않는다.

### 화면 크기 테스트 매트릭스
아래 3개 폭에서 가로 스크롤 없이, 하단 버튼이 항상 화면 안에 보여야 한다.

| 폭 | 대표 기기 | 특히 확인할 것 |
|---|---|---|
| 375px | iPhone SE / 최소 지원 폭 | 긴 지시문·랜드마크 설명이 있어도 Next/Prev 버튼이 가려지지 않는다 |
| 390px | 기준 목업 (iPhone 14) | 1:1 비교 기준 |
| 428px | iPhone Pro Max급 | 지도 패널(고정 358px)이 좌우 여백과 함께 자연스럽게 중앙 정렬된다 |

## 컴포넌트 매핑 (spec props → RN 컴포넌트)
| 컴포넌트 | props | 비고 |
|----------|-------|------|
| `TextField` | `label, value, onChangeText, placeholder?, keyboardType?, autoFocus?` | 01/02 화면 입력창, "공용 입력 컴포넌트" 절 참조 |
| `ScreenTopBar` | `title, onBack?` | 02 화면 상단바(뒤로가기 + 제목) |
| `ProfileSwitcher` | `value, onChange` | 02 화면 Standard / With luggage 세그먼트 |
| `ProgressTrack` | `current, total` | 04 화면 상단 진행 바 |
| `MapPane` | `points: (Point \| null)[], floorLabel` | 위 "MapPane" 절 참조. `null`이 섞이면 placeholder로 전환 |
| `GuidanceHeader` | `step, stepNumber, totalSteps` | 04 화면 지시 블록 |
| `LandmarkCallout` | `landmark` | 04 화면 랜드마크 카드 |
| `NavButton` | `variant: 'prev' \| 'next' \| 'finish', disabled` | 04 화면 하단 버튼, 마지막 스텝에서 finish로 전환 |
| `ArrivalSummaryList` | `walkedMeters, durationSeconds, nextTrainMinutes` | 05 화면 요약 리스트 |
| `ErrorState` | `kind: RouteServiceErrorKind, destination?, onRetry?, onChooseDifferent?` | 03 · Loading 화면 전용, "에러·엣지 상태" 절 표 참조 |
| `PrimaryButton` / `SecondaryButton` | `label, onPress, disabled?` | 전 화면 공용 CTA / 아웃라인 버튼 |
