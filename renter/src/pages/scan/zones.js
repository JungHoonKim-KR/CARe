export const ZONES = [
  {
    id:          'rear-right',
    name:        'REAR RIGHT',
    label:       '우측 뒷바퀴',
    type:        'wheel',
    instruction: '<strong>우측 뒷바퀴</strong>를 원형 가이드에 맞춰주세요.<br>맞춰지면 자동 스캔이 시작됩니다.',
    icon:        '⬤',
    wheelSide:   'right',
  },
  {
    id:          'front-right',
    name:        'FRONT RIGHT',
    label:       '우측 앞바퀴',
    type:        'wheel',
    instruction: '<strong>우측 앞바퀴</strong>를 원형 가이드에 맞춰주세요.<br>맞춰지면 자동 스캔이 시작됩니다.',
    icon:        '⬤',
    wheelSide:   'right',
  },
  {
    id:          'front',
    name:        'FRONT',
    label:       '앞범퍼',
    type:        'plate',
    instruction: '<strong>번호판</strong>을 가이드 선에 맞춰주세요.<br>인식되면 자동으로 스캔이 시작됩니다.',
    icon:        '🚗',
  },
  {
    id:          'front-left',
    name:        'FRONT LEFT',
    label:       '좌측 앞바퀴',
    type:        'wheel',
    instruction: '<strong>좌측 앞바퀴</strong>를 원형 가이드에 맞춰주세요.<br>맞춰지면 자동 스캔이 시작됩니다.',
    icon:        '⬤',
    wheelSide:   'left',
  },
  {
    id:          'rear-left',
    name:        'REAR LEFT',
    label:       '좌측 뒷바퀴',
    type:        'wheel',
    instruction: '<strong>좌측 뒷바퀴</strong>를 원형 가이드에 맞춰주세요.<br>맞춰지면 자동 스캔이 시작됩니다.',
    icon:        '⬤',
    wheelSide:   'left',
  },
  {
    id:          'rear',
    name:        'REAR',
    label:       '뒷범퍼',
    type:        'plate',
    instruction: '<strong>번호판</strong>을 가이드 선에 맞춰주세요.<br>인식되면 자동으로 스캔이 시작됩니다.',
    icon:        '🚗',
  },
]
// mock 이전 흠집 기록 — 나중에 API 연결 시 제거
export const MOCK_HISTORY = {
  'rear-right':  [{ date:'2026.03.11', count:1 }],
  'front-right': [{ date:'2026.03.12', count:3 }, { date:'2026.02.20', count:1 }],
  'front':       [{ date:'2026.03.15', count:2 }, { date:'2026.03.10', count:1 }, { date:'2026.02.28', count:3 }],
  'front-left':  [{ date:'2026.03.16', count:1 }, { date:'2026.03.01', count:2 }],
  'rear-left':   [],
  'rear':        [{ date:'2026.03.14', count:1 }],
}

// mock 탐지 결과 — 나중에 실제 API 결과로 교체
export const MOCK_RESULTS = {
  'rear-right':  { hasDefect: false, count: 0 },
  'front-right': { hasDefect: true,  count: 3 },
  'front':       { hasDefect: true,  count: 2 },
  'front-left':  { hasDefect: true,  count: 1 },
  'rear-left':   { hasDefect: false, count: 0 },
  'rear':        { hasDefect: false, count: 0 },
}