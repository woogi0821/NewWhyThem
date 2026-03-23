// ============================================================
//  data.js — 공유 전기차 충전소 가짜 데이터
//  (공공데이터포털 전기차 충전소 API 응답 형식 모방)
// ============================================================

const EV_DATA = {

  // ── 충전소 목록 ──────────────────────────────────────────
  stations: [
    {
      id: 'ST001',
      name: '강남 테헤란로 충전소',
      address: '서울특별시 강남구 테헤란로 152',
      lat: 37.5007, lng: 127.0366,
      status: 'available',       // available | busy | full
      slots: { total: 8, available: 3, charging: 5 },
      chargers: [
        { type: '급속', kw: 100, count: 4 },
        { type: '완속', kw: 7,   count: 4 },
      ],
      operHours: '24시간',
      fee: '₩300/kWh',
      phone: '02-1234-5678',
      region: '강남구',
    },
    {
      id: 'ST002',
      name: '마포 상암 공영충전소',
      address: '서울특별시 마포구 상암동 1600',
      lat: 37.5735, lng: 126.8883,
      status: 'busy',
      slots: { total: 6, available: 1, charging: 5 },
      chargers: [
        { type: '급속', kw: 50, count: 3 },
        { type: '완속', kw: 7,  count: 3 },
      ],
      operHours: '06:00 ~ 24:00',
      fee: '₩250/kWh',
      phone: '02-2345-6789',
      region: '마포구',
    },
    {
      id: 'ST003',
      name: '서초 양재 EV 파크',
      address: '서울특별시 서초구 양재대로 340',
      lat: 37.4848, lng: 127.0343,
      status: 'available',
      slots: { total: 10, available: 5, charging: 5 },
      chargers: [
        { type: '급속', kw: 200, count: 5 },
        { type: '완속', kw: 11,  count: 5 },
      ],
      operHours: '24시간',
      fee: '₩320/kWh',
      phone: '02-3456-7890',
      region: '서초구',
    },
    {
      id: 'ST004',
      name: '송파 잠실 롯데타워',
      address: '서울특별시 송파구 올림픽로 300',
      lat: 37.5131, lng: 127.1028,
      status: 'full',
      slots: { total: 12, available: 0, charging: 12 },
      chargers: [
        { type: '완속', kw: 7, count: 12 },
      ],
      operHours: '10:00 ~ 22:00',
      fee: '₩280/kWh',
      phone: '02-4567-8901',
      region: '송파구',
    },
    {
      id: 'ST005',
      name: '종로 광화문 충전소',
      address: '서울특별시 종로구 세종대로 175',
      lat: 37.5745, lng: 126.9769,
      status: 'available',
      slots: { total: 8, available: 4, charging: 4 },
      chargers: [
        { type: '급속', kw: 50, count: 4 },
        { type: '완속', kw: 7,  count: 4 },
      ],
      operHours: '24시간',
      fee: '₩300/kWh',
      phone: '02-5678-9012',
      region: '종로구',
    },
    {
      id: 'ST006',
      name: '용산 이태원 충전소',
      address: '서울특별시 용산구 이태원로 177',
      lat: 37.5346, lng: 126.9946,
      status: 'busy',
      slots: { total: 6, available: 2, charging: 4 },
      chargers: [
        { type: '급속', kw: 100, count: 3 },
        { type: '완속', kw: 7,   count: 3 },
      ],
      operHours: '24시간',
      fee: '₩310/kWh',
      phone: '02-6789-0123',
      region: '용산구',
    },
    {
      id: 'ST007',
      name: '노원 중계 공공주차장',
      address: '서울특별시 노원구 중계로 180',
      lat: 37.6466, lng: 127.0726,
      status: 'available',
      slots: { total: 10, available: 7, charging: 3 },
      chargers: [
        { type: '급속', kw: 50, count: 5 },
        { type: '완속', kw: 7,  count: 5 },
      ],
      operHours: '24시간',
      fee: '₩270/kWh',
      phone: '02-7890-1234',
      region: '노원구',
    },
    {
      id: 'ST008',
      name: '은평 불광 EV 충전소',
      address: '서울특별시 은평구 불광로 10',
      lat: 37.6097, lng: 126.9303,
      status: 'available',
      slots: { total: 6, available: 3, charging: 3 },
      chargers: [
        { type: '급속', kw: 50, count: 3 },
        { type: '완속', kw: 7,  count: 3 },
      ],
      operHours: '07:00 ~ 23:00',
      fee: '₩290/kWh',
      phone: '02-8901-2345',
      region: '은평구',
    },
    {
      id: 'ST009',
      name: '성동 성수 스마트 충전',
      address: '서울특별시 성동구 성수이로 78',
      lat: 37.5445, lng: 127.0557,
      status: 'busy',
      slots: { total: 8, available: 1, charging: 7 },
      chargers: [
        { type: '급속', kw: 100, count: 4 },
        { type: '완속', kw: 11,  count: 4 },
      ],
      operHours: '24시간',
      fee: '₩300/kWh',
      phone: '02-9012-3456',
      region: '성동구',
    },
    {
      id: 'ST010',
      name: '중구 명동 지하 충전소',
      address: '서울특별시 중구 명동길 74',
      lat: 37.5636, lng: 126.9826,
      status: 'full',
      slots: { total: 6, available: 0, charging: 6 },
      chargers: [
        { type: '완속', kw: 7, count: 6 },
      ],
      operHours: '09:00 ~ 21:00',
      fee: '₩350/kWh',
      phone: '02-0123-4567',
      region: '중구',
    },
  ],

  // ── 예약 데이터 (로컬스토리지 초기값) ───────────────────
  reservations: [
    {
      id: 'RV001',
      stationId: 'ST001',
      stationName: '강남 테헤란로 충전소',
      date: '2025-06-15',
      timeSlot: '14:00 ~ 15:00',
      chargerType: '급속 100kW',
      status: 'confirmed',   // confirmed | pending | cancelled | completed
      vehicle: '테슬라 모델 3',
      estimatedFee: '₩9,000',
    },
    {
      id: 'RV002',
      stationId: 'ST003',
      stationName: '서초 양재 EV 파크',
      date: '2025-06-18',
      timeSlot: '10:00 ~ 11:00',
      chargerType: '급속 200kW',
      status: 'pending',
      vehicle: '현대 아이오닉 6',
      estimatedFee: '₩12,000',
    },
    {
      id: 'RV003',
      stationId: 'ST005',
      stationName: '종로 광화문 충전소',
      date: '2025-06-10',
      timeSlot: '09:00 ~ 10:00',
      chargerType: '급속 50kW',
      status: 'completed',
      vehicle: '테슬라 모델 3',
      estimatedFee: '₩7,500',
    },
    {
      id: 'RV004',
      stationId: 'ST002',
      stationName: '마포 상암 공영충전소',
      date: '2025-06-08',
      timeSlot: '16:00 ~ 17:00',
      chargerType: '급속 50kW',
      status: 'cancelled',
      vehicle: '현대 아이오닉 6',
      estimatedFee: '₩6,000',
    },
  ],

  // ── 사용자 정보 ──────────────────────────────────────────
  user: {
    id: 'USR001',
    name: '김민준',
    email: 'minjun.kim@example.com',
    phone: '010-1234-5678',
    vehicle: '테슬라 모델 3',
    memberSince: '2024-03-01',
    point: 3240,
    totalCharged: 18,       // 총 충전 횟수
    totalKwh: 342.5,        // 총 충전량
    savedCo2: 162.1,        // 절감 CO₂ (kg)
  },

  // ── 시간 슬롯 (예약 가능 시간) ──────────────────────────
  timeSlots: [
    '08:00 ~ 09:00', '09:00 ~ 10:00', '10:00 ~ 11:00', '11:00 ~ 12:00',
    '12:00 ~ 13:00', '13:00 ~ 14:00', '14:00 ~ 15:00', '15:00 ~ 16:00',
    '16:00 ~ 17:00', '17:00 ~ 18:00', '18:00 ~ 19:00', '19:00 ~ 20:00',
    '20:00 ~ 21:00', '21:00 ~ 22:00',
  ],

  // ── 지역 목록 ────────────────────────────────────────────
  regions: [
    '전체', '강남구', '마포구', '서초구', '송파구',
    '종로구', '용산구', '노원구', '은평구', '성동구', '중구',
  ],

  // ── 상태 설정 (UI용) ─────────────────────────────────────
  statusConfig: {
    available: { label: '여유 있음', badgeCls: 'badge-available', pinColor: '#00E676' },
    busy:      { label: '혼잡',     badgeCls: 'badge-charging',  pinColor: '#FFC107' },
    full:      { label: '만석',     badgeCls: 'badge-busy',      pinColor: '#FF5252' },
  },

  reservationStatusConfig: {
    confirmed:  { label: '예약 확정', cls: 'badge-available' },
    pending:    { label: '대기 중',   cls: 'badge-charging'  },
    completed:  { label: '완료',      cls: 'text-ev-muted border border-ev-border' },
    cancelled:  { label: '취소됨',    cls: 'badge-busy'      },
  },
};

// ── 헬퍼 함수들 ──────────────────────────────────────────────
const EVUtils = {

  // ID로 충전소 찾기
  getStation(id) {
    return EV_DATA.stations.find(s => s.id === id) || null;
  },

  // 지역으로 필터링
  filterByRegion(region) {
    if (region === '전체') return EV_DATA.stations;
    return EV_DATA.stations.filter(s => s.region === region);
  },

  // 상태로 필터링
  filterByStatus(status) {
    if (status === '전체') return EV_DATA.stations;
    return EV_DATA.stations.filter(s => s.status === status);
  },

  // 예약 가능한 충전소만
  getAvailable() {
    return EV_DATA.stations.filter(s => s.status !== 'full');
  },

  // 슬롯 점유율 (%)
  getOccupancyRate(station) {
    return Math.round((station.slots.charging / station.slots.total) * 100);
  },

  // 로컬스토리지에 예약 저장
  saveReservation(reservation) {
    const all = this.getLocalReservations();
    reservation.id = 'RV' + Date.now();
    all.unshift(reservation);
    localStorage.setItem('ev_reservations', JSON.stringify(all));
    return reservation;
  },

  // 로컬스토리지에서 예약 불러오기
  getLocalReservations() {
    const raw = localStorage.getItem('ev_reservations');
    return raw ? JSON.parse(raw) : EV_DATA.reservations;
  },

  // 예약 취소
  cancelReservation(id) {
    const all = this.getLocalReservations();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx].status = 'cancelled';
      localStorage.setItem('ev_reservations', JSON.stringify(all));
    }
    return all;
  },

  // 날짜 포맷 (YYYY-MM-DD → M월 D일)
  formatDate(dateStr) {
    const [, m, d] = dateStr.split('-');
    return `${parseInt(m)}월 ${parseInt(d)}일`;
  },
};
