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
| `inverseBackground` | `#1B1C1E` | 어두운 면이 필요한 곳 (현재 화면들에서는 미사용) |
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
| 현재 항목 헤드라인 ("Walk · 65 m") | 24 / 700, letterSpacing -0.5 | 안내 화면에서 가장 큰 텍스트 |
| 항목 지시문 (`instruction`) | 16 / 400, lineHeight 23 | `labelNeutral` |
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

### 04 · Guide (핵심 화면)
경로 전체가 세로 체크리스트로 펼쳐진다. 라이트 배경(`background`) — 이전 턴바이턴 안은 다크였지만, 체크리스트는 완료/현재/예정 세 상태를 대비로 구분해야 해서 라이트가 맞다.
- 상단바: 닫기 버튼(36 원형, `fillAlternative`) + 목적지("To {destination}", 15/700) + 진행 메타("2 of 7 done · 137 m left", 12/500 `labelAlternative`). 아래 1px `lineNormalNormal` 구분선.
- **완료 항목**: `fillAlternative` 배경, radius 14, 26px `statusPositive` 원에 흰 체크, 지시문은 `labelAlternative` + 취소선, 메타 한 줄.
- **현재 항목(유일하게 펼쳐진 카드)**: 흰 배경, radius 16, **2px `primary` 보더**. 48px `primary` 아이콘 타일(이동수단 아이콘) + "STEP n — NOW"(12/700 `primary`) + 헤드라인("Walk · 65 m", 24/700) → 지시문(16/400 `labelNeutral`) → "WHEN YOU GET THERE" 콜아웃(`calloutBackground`, radius 12) → 지도 패널(높이 140) → `PrimaryButton`("Done — I'm here", 마지막 항목은 "I've arrived").
- **예정 항목**: 투명 배경 + 1px `lineNormalNormal` 보더, 번호 배지(26px, 1.5px `#D7DBE2` 보더), 지시문 `labelStrong`.
- 항목 간 간격 10, 목록 패딩 20.
- 항목이 바뀌면 현재 카드 위치로 자동 스크롤한다.

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
좌표는 API가 정규화 값(0~1)으로 내려준다(`docs/ADR.md` ADR-014). **역 안내도 이미지 파일은 아직 저장소에 없으므로 현재는 배경 없이 경로 형태만 그린다** — 지도가 아니라 "이 구간이 어떤 모양인지"를 보여주는 다이어그램이다.

1. 패널은 카드 폭에 맞춰 늘어나고 높이만 고정(기본 140), radius 12, 배경 `fillAlternative`, `overflow: hidden`.
2. `viewBox`는 **현재 세그먼트 전체**의 바운딩 박스 + 여백(8% + 0.04)으로 잡는다. 항목이 바뀌면 그 구간으로 자연스럽게 확대된다 — 별도 카메라 로직 없음.
3. 정규화 x에 `mapAspect`(= `intrinsicWidth / intrinsicHeight`)를 곱해 원래 비율로 되돌린 뒤 그린다. 안 하면 형태가 찌그러진다.
4. 직선 구간은 한 축의 길이가 0이므로, 바운딩 박스의 가로·세로에 최소값(0.12)을 둔다.
5. 선 두께는 viewBox 단위라 확대될수록 얇아 보인다 — `unit`(박스 크기 ÷ 패널 높이)에 배수를 곱해 화면상 두께를 일정하게 맞춘다.

### 오버레이 요소 스펙
| 요소 | 스펙 |
|------|------|
| 같은 세그먼트의 다른 구간 | stroke `lineNormalNormal`, `unit × 9` |
| 현재 구간 외곽선 | stroke `background`(흰색), `unit × 11` |
| 현재 구간 본선 | stroke `primary`, `unit × 6`, dasharray `14 11`, 1.1s 무한 흐름 |
| 구간 시작점 | r `unit × 5`, 흰 채움 + `primary` 테두리 |
| 구간 끝점 | r `unit × 8`, `primary` 채움 + 흰 테두리 |
| 층 배지 | 패널 좌상단, 흰 pill, 12/700 `labelNeutral` |
| 모션 감소 | OS "동작 줄이기" 설정 시 대시 흐름을 정지한다 |

## 접근성 · 예외 처리
- 본문 대비 4.5:1 이상 유지. 보조 텍스트를 스펙에 적힌 값보다 더 연하게 낮추지 않는다.
- 스크린리더: 현재 항목이 바뀔 때마다 새 지시문을 안내한다(RN에서는 `AccessibilityInfo.announceForAccessibility`).
- 지도는 보조 수단이다 — 배경 이미지가 없는 현재 상태에서도 지시문과 도착 지점 설명만으로 안내가 성립해야 한다.
- API 오류(경로 없음 / 잘못된 placeId / 서버 오류)는 원인별로 구분된 메시지와 재시도 버튼을 제공한다.

## 에러·엣지 상태
전체 시나리오 목록은 `docs/PRD.md` "에러·엣지 케이스 요구사항", 데이터 계층 규칙은 `docs/ARCHITECTURE.md` "에러 모델"·"방어적 가드" 참조. 여기서는 그 상태들의 **비주얼**만 규정한다.

### ErrorState (전체 화면 대체형 — Loading 화면 전용)
콘텐츠 영역 중앙에 세로 정렬. 카드나 보더 없이 배경과 톤을 맞춘다(모든 화면이 라이트 배경이다).

| kind | 아이콘/톤 | 제목 | 버튼 |
|---|---|---|---|
| `NETWORK` | 회색 원 안 와이파이-슬래시 글리프 | "You appear to be offline." | Retry (primary) |
| `NOT_FOUND` | 회색 원 안 지도-핀 글리프 | 입력한 도착지 텍스트가 알려진 장소와 매칭되지 않은 경우 포함, "We couldn't find a route to {destination}." | "Choose a different destination" (outline, Destination input 화면으로 돌아가 재입력) — Retry 버튼은 넣지 않는다 |
| `INVALID_REQUEST` | 회색 원 안 느낌표 글리프 | "Something's off with this request." | "Choose a different destination" (outline) |
| `SERVER_ERROR` | 회색 원 안 느낌표 글리프 | "Something went wrong on our end." | Retry (primary) |

- 아이콘 원: 56×56, 배경 `fillAlternative`, 글리프는 `labelAlternative` 색.
- 제목: 16/600, `labelStrong`, 최대 2줄, 중앙 정렬.
- 버튼 폭은 콘텐츠에 맞추고(화면 전체 폭 아님, `maxWidth: 280`) 중앙 정렬. `Retry`는 `PrimaryButton` 재사용, "Choose a different destination"은 `SecondaryButton`(도착 화면의 "Report a wrong turn"과 동일 컴포넌트) 재사용.

### 지도 배경이 없는 현재 상태
- 역 안내도 이미지가 저장소에 들어오기 전까지, 지도 패널은 배경 없이 경로 형태만 그린다. 별도의 "unavailable" 문구는 두지 않는다 — 경로 다이어그램 자체는 진짜 좌표라 유효한 정보다.
- 다만 이것을 역 안내도처럼 보이게 꾸미지 않는다. 배경은 중립 `fillAlternative`로 두고, 지도처럼 읽히는 장식(건물 윤곽, 가짜 통로)을 그리지 않는다.
- 이미지가 확보되면 같은 정규화 좌표계 위에 배경으로 깔면 된다(`docs/ADR.md` ADR-014).

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
| 375px | iPhone SE / 최소 지원 폭 | 긴 지시문·도착 지점 설명이 있어도 현재 항목의 완료 버튼이 가려지지 않는다 |
| 390px | 기준 목업 (iPhone 14) | 1:1 비교 기준 |
| 428px | iPhone Pro Max급 | 지도 패널(고정 358px)이 좌우 여백과 함께 자연스럽게 중앙 정렬된다 |

## 컴포넌트 매핑 (spec props → RN 컴포넌트)
| 컴포넌트 | props | 비고 |
|----------|-------|------|
| `TextField` | `label, value, onChangeText, placeholder?, keyboardType?, autoFocus?` | 01/02 화면 입력창, "공용 입력 컴포넌트" 절 참조 |
| `ScreenTopBar` | `title, onBack?` | 02 화면 상단바(뒤로가기 + 제목) |
| `ProfileSwitcher` | `value, onChange` | 02 화면 Standard / With luggage 세그먼트 |
| `MapPane` | `geometry, segmentGeometry, mapAspect, floorLabel, height?` | 위 "MapPane" 절 참조 |
| `MovementIcon` | `movementType, size?, color?` | 이동수단 아이콘 6종 (v1.2에 회전 방향이 없어 화살표를 대체) |
| `GuideStepCard` | `step, index, isLast, onDone` | 04 화면의 현재 항목 카드 |
| `GuideStepRow` | `step, index, state: 'done' \| 'upcoming'` | 04 화면의 접힌 항목 |
| `ArrivalSummaryList` | `walkedMeters, durationSeconds, nextTrainMinutes` | 05 화면 요약 리스트 |
| `ErrorState` | `kind: RouteServiceErrorKind, destination?, onRetry?, onChooseDifferent?` | 03 · Loading 화면 전용, "에러·엣지 상태" 절 표 참조 |
| `PrimaryButton` / `SecondaryButton` | `label, onPress, disabled?` | 전 화면 공용 CTA / 아웃라인 버튼 |
