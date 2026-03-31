// =============================================
//  ChargeNow v3.0 — EV Charging System
//  app.js
// =============================================

// ---- API 설정 ----
const KAKAO_KEY = "5cc1f47f2bb48afc9e7ef7f4c698644b";
const EV_KEY    = "6ebd5febab70800594860d7682eab328c14df15b1e1dfac30a7a011942ee6c3f";

// ---- 지도 상태 ----
let kakaoMap = null;
let evMarkers = [];
let evAllData = [];
let currentMapFilter = "all";
let mapPs = null;           // Places 서비스
const geocoder_global = { instance: null };

const zcodeMap = {
  "서울특별시":"11","부산광역시":"26","대구광역시":"27","인천광역시":"28",
  "광주광역시":"29","대전광역시":"30","울산광역시":"31","세종특별자치시":"36",
  "경기도":"41","강원도":"42","충청북도":"43","충청남도":"44",
  "전라북도":"45","전라남도":"46","경상북도":"47","경상남도":"48","제주특별자치도":"50"
};

function loadKakaoMapScript(key) {
  if (window.kakao && kakao.maps) {
    if (currentView === "map") initKakaoMap();
    initHeroMiniMap();
  }
}

// ---- 홈 미니맵 ----
let heroMiniMap = null;

function initHeroMiniMap() {
  if (!window.kakao || !kakao.maps) return;
  const container = document.getElementById("heroMiniMap");
  if (!container || heroMiniMap) return;

  heroMiniMap = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.5013, 127.0397),
    level: 6,
    draggable: false,
    scrollwheel: false,
    disableDoubleClickZoom: true
  });

  const loading = document.getElementById("heroMiniMapLoading");
  if (loading) { loading.style.opacity = "0"; setTimeout(() => { loading.style.display = "none"; }, 400); }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const myPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      heroMiniMap.setCenter(myPos);
      new kakao.maps.CustomOverlay({
        map: heroMiniMap, position: myPos, zIndex: 10,
        content: '<div style="width:14px;height:14px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(59,130,246,0.25)"></div>'
      });
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(pos.coords.longitude, pos.coords.latitude, (result, status) => {
        if (status !== kakao.maps.services.Status.OK) return;
        const regionName = result[0].address_name.split(" ")[0];
        const zcode = zcodeMap[regionName] || "11";
        fetchHeroEVMarkers(zcode, myPos);
      });
    }, () => addHeroDummyMarkers());
  } else {
    addHeroDummyMarkers();
  }

  kakao.maps.event.addListener(heroMiniMap, "click", () => navigateTo("stations"));
}

function fetchHeroEVMarkers(zcode, centerPos) {
  const url = "https://apis.data.go.kr/B552584/EvCharger/getChargerInfo?serviceKey=" + EV_KEY + "&numOfRows=50&pageNo=1&zcode=" + zcode;
  fetch(url).then(r => r.text()).then(xml => {
    const doc   = new DOMParser().parseFromString(xml, "text/xml");
    const items = Array.from(doc.getElementsByTagName("item"));
    const colorMap = { "2": "#22c55e", "3": "#ef4444" };
    items
      .map(item => ({
        lat:  parseFloat(item.getElementsByTagName("lat")[0].textContent),
        lng:  parseFloat(item.getElementsByTagName("lng")[0].textContent),
        stat: item.getElementsByTagName("stat")[0].textContent
      }))
      .filter(d => getEvDistance(centerPos.getLat(), centerPos.getLng(), d.lat, d.lng) < 2000)
      .slice(0, 15)
      .forEach(d => {
        const color = colorMap[d.stat] || "#94a3b8";
        new kakao.maps.CustomOverlay({
          map: heroMiniMap,
          position: new kakao.maps.LatLng(d.lat, d.lng),
          zIndex: 5,
          content: '<div style="width:10px;height:10px;background:' + color + ';border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer"></div>'
        });
      });
  }).catch(() => addHeroDummyMarkers());
}

function addHeroDummyMarkers() {
  if (!heroMiniMap) return;
  const colorMap = { available: "#22c55e", busy: "#f59e0b", full: "#ef4444" };
  const geocoder = new kakao.maps.services.Geocoder();
  STATIONS.forEach(s => {
    geocoder.addressSearch(s.address, (result, status) => {
      if (status !== kakao.maps.services.Status.OK) return;
      const color = colorMap[s.status] || "#94a3b8";
      new kakao.maps.CustomOverlay({
        map: heroMiniMap,
        position: new kakao.maps.LatLng(result[0].y, result[0].x),
        zIndex: 5,
        content: '<div style="width:10px;height:10px;background:' + color + ';border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>'
      });
    });
  });
}

function initKakaoMap() {
  if (!window.kakao || !kakao.maps) return;
  if (kakaoMap) return;
  const container = document.getElementById("kakaoMap");
  if (!container) return;

  kakaoMap = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.5013, 127.0397),
    level: 5
  });

  geocoder_global.instance = new kakao.maps.services.Geocoder();
  mapPs = new kakao.maps.services.Places();

  // ✅ 휠 스크롤 충돌 해결
  // 드래그/클릭은 항상 활성, 휠 줌만 제어
  kakaoMap.setZoomable(true);   // 줌/드래그 항상 허용
  kakaoMap.setDraggable(true);  // 드래그 항상 허용

  const mapDiv = document.getElementById("kakaoMap");

  // 휠 이벤트 가로채기 — 페이지 스크롤 방지 후 지도 줌으로 처리
  mapDiv.addEventListener("wheel", (e) => {
    e.preventDefault(); // 페이지 스크롤 방지
    const level = kakaoMap.getLevel();
    kakaoMap.setLevel(e.deltaY > 0 ? level + 1 : level - 1, { animate: true });
  }, { passive: false });

  // 내 위치로 이동
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const myPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      kakaoMap.setCenter(myPos);
      new kakao.maps.CustomOverlay({
        map: kakaoMap, position: myPos, zIndex: 10,
        content: '<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(59,130,246,0.25)"></div>'
      });
    });
  }

  // 지도 이동 끝날 때 해당 지역 충전소 갱신
  kakao.maps.event.addListener(kakaoMap, "idle", updateEVByMapCenter);
  updateEVByMapCenter();
}

let scrollHintTimer = null;
function showScrollHint() {
  const el = document.getElementById("mapScrollHint");
  if (!el) return;
  el.style.opacity = "1";
  clearTimeout(scrollHintTimer);
  scrollHintTimer = setTimeout(() => { el.style.opacity = "0"; }, 1800);
}
function hideScrollHint() {
  const el = document.getElementById("mapScrollHint");
  if (el) el.style.opacity = "0";
}

// ✅ 검색창
function searchMapPlace() {
  const keyword = (document.getElementById("mapSearchInput").value || "").trim();
  if (!keyword) { showToast("⚠️ 검색어를 입력해주세요", "error"); return; }
  if (!mapPs) { showToast("⚠️ 지도를 먼저 열어주세요", "error"); return; }
  mapPs.keywordSearch(keyword, (data, status) => {
    if (status === kakao.maps.services.Status.OK) {
      kakaoMap.setCenter(new kakao.maps.LatLng(data[0].y, data[0].x));
      kakaoMap.setLevel(5);
      closeMapCard();
    } else {
      showToast("🔍 검색 결과가 없습니다", "error");
    }
  });
}

function updateEVByMapCenter() {
  if (!kakaoMap || !geocoder_global.instance) return;
  const center = kakaoMap.getCenter();
  geocoder_global.instance.coord2RegionCode(center.getLng(), center.getLat(), (result, status) => {
    if (status !== kakao.maps.services.Status.OK) return;
    const regionName = result[0].address_name.split(" ")[0];
    const zcode = zcodeMap[regionName] || "11";
    fetchEVStations(zcode, regionName);
  });
}

function fetchEVStations(zcode, regionName) {
  const url = "https://apis.data.go.kr/B552584/EvCharger/getChargerInfo?serviceKey=" + EV_KEY + "&numOfRows=300&pageNo=1&zcode=" + (zcode || "11");
  fetch(url)
    .then(res => res.text())
    .then(xml => {
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const items = doc.getElementsByTagName("item");
      evAllData = Array.from(items).map(item => ({
        lat:    parseFloat(item.getElementsByTagName("lat")[0].textContent),
        lng:    parseFloat(item.getElementsByTagName("lng")[0].textContent),
        name:   item.getElementsByTagName("statNm")[0].textContent,
        stat:   item.getElementsByTagName("stat")[0].textContent,
        isFast: item.getElementsByTagName("chgerType")[0].textContent !== "02",
        addr:   item.getElementsByTagName("addr")[0].textContent,
        id:     item.getElementsByTagName("statId")[0].textContent
      }));
      displayEVMarkers(regionName);
    })
    .catch(() => showToast("⚠️ 충전소 데이터를 불러오지 못했습니다", "error"));
}

function displayEVMarkers(regionName) {
  evMarkers.forEach(m => m.setMap(null));
  evMarkers = [];
  if (!kakaoMap) return;

  const center = kakaoMap.getCenter();
  const radius = 3000;

  if (window._evCircle) window._evCircle.setMap(null);
  window._evCircle = new kakao.maps.Circle({
    center, radius,
    strokeWeight: 2.5, strokeColor: "#3B82F6", strokeOpacity: 0.7,
    fillColor: "#3B82F6", fillOpacity: 0.08
  });
  window._evCircle.setMap(kakaoMap);

  const filtered = evAllData.filter(d => {
    const dist = getEvDistance(center.getLat(), center.getLng(), d.lat, d.lng);
    if (dist > radius) return false;
    if (currentMapFilter === "fast") return d.isFast;
    if (currentMapFilter === "slow") return !d.isFast;
    return true;
  });

  filtered.forEach(d => {
    const statInfo = getEvStatInfo(d.stat);
    // ✅ 개선된 마커 디자인: 핀 모양 + 이름 + 상태색
    const shortName = d.name.length > 10 ? d.name.substring(0, 10) + "…" : d.name;
    const encoded = encodeURIComponent(JSON.stringify(d));
    const markerHtml =
      '<div onclick="openMapCard(\'' + encoded + '\')" ' +
      'style="cursor:pointer;display:flex;flex-direction:column;align-items:center;transform:translateX(-50%)">' +
        '<div style="background:' + statInfo.color + ';color:white;padding:5px 10px;' +
        'border-radius:10px;font-size:0.7rem;font-weight:700;white-space:nowrap;' +
        'box-shadow:0 3px 10px rgba(0,0,0,0.2);border:2px solid white;' +
        'display:flex;align-items:center;gap:5px">' +
          '<span>' + (d.isFast ? "⚡" : "🔌") + '</span>' +
          '<span>' + shortName + '</span>' +
        '</div>' +
        '<div style="width:2px;height:8px;background:' + statInfo.color + ';margin:0 auto"></div>' +
        '<div style="width:6px;height:6px;background:' + statInfo.color + ';border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>' +
      '</div>';

    const overlay = new kakao.maps.CustomOverlay({
      map: kakaoMap,
      position: new kakao.maps.LatLng(d.lat, d.lng),
      zIndex: 5,
      content: markerHtml,
      yAnchor: 1
    });
    evMarkers.push(overlay);
  });

  const logEl = document.getElementById("mapInfoLog");
  if (logEl) logEl.textContent = (regionName || "") + " 반경 3km · " + filtered.length + "개 충전소";

  // 사이드바 카운트 업데이트
  const countEl = document.getElementById("nvCountText");
  if (countEl) countEl.textContent = "반경 3km 내 충전소 " + filtered.length + "개";

  // 사이드바 리스트 렌더링
  renderNvList(filtered);
}

// ✅ 마커 클릭 → 카드 + 거리 표시
// 현재 열린 카드의 충전소 데이터 저장
let _currentCardData = null;

function openMapCard(encoded) {
  const d = JSON.parse(decodeURIComponent(encoded));
  _currentCardData = d;
  const card = document.getElementById("mapStationCard");
  const statInfo = getEvStatInfo(d.stat);

  document.getElementById("card-name").textContent = d.name;
  document.getElementById("card-addr").textContent = "📍 " + d.addr;
  document.getElementById("card-type").textContent = d.isFast ? "⚡ 급속" : "🔌 완속";

  const statEl = document.getElementById("card-stat");
  statEl.textContent = statInfo.label;
  statEl.style.background = statInfo.bg;
  statEl.style.color = statInfo.color;

  // 거리 계산
  if (kakaoMap) {
    const center = kakaoMap.getCenter();
    const dist = getEvDistance(center.getLat(), center.getLng(), d.lat, d.lng);
    document.getElementById("card-dist").textContent = (dist / 1000).toFixed(2) + " km";
  }

  // 길찾기
  document.getElementById("card-navi-btn").onclick = () => {
    window.open("https://map.kakao.com/link/search/" + encodeURIComponent(d.addr), "_blank");
  };

  // 예약하기 버튼 상태
  const reserveBtn = document.getElementById("card-reserve-btn");
  if (d.stat === "3") {
    // 충전 중 — 비활성화
    reserveBtn.disabled = true;
    reserveBtn.style.opacity = "0.45";
    reserveBtn.style.cursor = "not-allowed";
    reserveBtn.textContent = "⛔ 충전 중";
  } else {
    reserveBtn.disabled = false;
    reserveBtn.style.opacity = "1";
    reserveBtn.style.cursor = "pointer";
    reserveBtn.textContent = "⚡ 예약하기";
  }

  card.style.display = "block";
  if (kakaoMap) kakaoMap.panTo(new kakao.maps.LatLng(d.lat, d.lng));
}

// 예약하기 버튼 클릭 — API 데이터로 직접 예약 모달 생성
function handleMapReserve() {
  if (!_currentCardData) return;
  const d = _currentCardData;

  if (d.stat === "3") {
    showToast("⛔ 현재 충전 중인 충전소입니다", "error");
    return;
  }

  // STATIONS 배열에서 먼저 매칭 시도
  let matched = STATIONS.find(s => s.name === d.name);
  if (!matched) {
    matched = STATIONS.find(s =>
      d.name.includes(s.name.substring(0, 4)) ||
      s.name.includes(d.name.substring(0, 4))
    );
  }

  if (matched) {
    // 매칭 성공 — 기존 상세 모달 사용
    closeMapCard();
    openStationModal(matched.id);
  } else {
    // 매칭 실패 — API 데이터로 직접 예약 모달 생성
    closeMapCard();
    openEvApiModal(d);
  }
}

// API 충전소 데이터로 예약 모달 직접 생성
function openEvApiModal(d) {
  const typeLabel = d.isFast ? "급속" : "완속";
  const feeLabel  = d.isFast ? "급속 300원/kWh" : "완속 240원/kWh";

  // currentStation을 API 데이터 기반으로 임시 생성
  currentStation = {
    id: "ev_" + d.id,
    name: d.name,
    address: d.addr,
    hours: "24시간",
    fee: feeLabel,
    chargers: [
      { id: 1, type: typeLabel + " 충전기", status: d.stat === "2" ? "free" : "busy" }
    ]
  };
  selectedCharger = null; selectedDate = null; selectedTime = null;
  updateStepIndicator(1);

  const today = new Date();
  const dates = Array.from({length:5}, (_,i) => {
    const dt = new Date(today); dt.setDate(today.getDate()+i); return dt;
  });
  const times = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
  const takenTimes = ["10:00","14:00","18:00"];

  const chargerHTML = currentStation.chargers.map(c => {
    const disabled = c.status !== "free" ? "disabled" : "";
    const labelMap = { free:"이용 가능", busy:"사용 중" };
    return `<div class="charger-item ${disabled}" onclick="selectCharger(this, ${c.id}, '${c.type}')">
      <div class="ci-left"><span class="ci-num">#${c.id}</span><span class="ci-type">${c.type}</span></div>
      <span class="ci-status ${c.status === 'free' ? 'free' : 'busy-s'}">${labelMap[c.status]}</span>
    </div>`;
  }).join("");

  const dateHTML = dates.map((dt,i) => {
    const label = i===0 ? "오늘" : i===1 ? "내일" : `${dt.getMonth()+1}/${dt.getDate()}`;
    const val   = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    return `<button class="date-btn" data-val="${val}" onclick="selectDate(this)">${label}</button>`;
  }).join("");

  const timeHTML = times.map(t => {
    const taken = takenTimes.includes(t) ? "taken" : "";
    return `<div class="time-slot ${taken}" onclick="selectTime(this, '${t}')">${t}</div>`;
  }).join("");

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-station-name">⚡ ${currentStation.name}</div>
    <div class="modal-station-addr">📍 ${currentStation.address} · 🕐 ${currentStation.hours}</div>
    <div class="modal-fee-badge">💰 ${currentStation.fee}</div>
    <div class="modal-section">
      <div class="modal-section-title">
        <span style="background:var(--primary);color:white;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:900">1</span>
        충전기 선택
      </div>
      <div class="charger-list">${chargerHTML}</div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">
        <span style="background:var(--border);color:var(--text-sub);border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:900" id="step2num">2</span>
        날짜 선택
      </div>
      <div class="date-picker">${dateHTML}</div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">
        <span style="background:var(--border);color:var(--text-sub);border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:900" id="step3num">3</span>
        시간 선택
        <span style="font-weight:400;font-size:0.75rem;color:var(--text-sub)">(취소선: 예약 불가)</span>
      </div>
      <div class="time-grid">${timeHTML}</div>
    </div>
    <button class="modal-confirm-btn" id="confirmBtn" onclick="confirmReservation()" disabled>충전기를 먼저 선택하세요</button>
  `;

  document.querySelectorAll(".modal-tab").forEach((t,i) => t.classList.toggle("active", i===0));
  document.getElementById("modalTabReserve").style.display = "block";
  document.getElementById("modalTabInfo").style.display    = "none";
  document.getElementById("modalTabReview").style.display  = "none";
  document.getElementById("modalOverlay").classList.add("open");
}


// ---- 사이드바 리스트 렌더링 ----
function renderNvList(dataList) {
  const container = document.getElementById("nvStationList");
  if (!container) return;
  if (!dataList || dataList.length === 0) {
    container.innerHTML = '<div style="padding:40px 20px;text-align:center;color:var(--text-sub);font-size:0.85rem">주변에 충전소가 없습니다</div>';
    return;
  }
  const center = kakaoMap ? kakaoMap.getCenter() : null;
  container.innerHTML = dataList.map((d, i) => {
    const statInfo = getEvStatInfo(d.stat);
    const typeLabel = d.isFast ? "⚡ 급속" : "🔌 완속";
    const iconClass = d.stat === "2" ? "available" : d.stat === "3" ? "busy" : "full";
    const tagClass  = d.stat === "2" ? "avail"     : d.stat === "3" ? "busy"  : "full";
    const icon      = d.stat === "2" ? "⚡" : d.stat === "3" ? "🔋" : "❌";
    const dist = center ? (getEvDistance(center.getLat(), center.getLng(), d.lat, d.lng) / 1000).toFixed(1) + "km" : "";
    const encoded = encodeURIComponent(JSON.stringify(d));
    return '<div class="nv-list-item" id="nv-item-' + i + '" onclick="selectNvItem(' + i + ',&quot;' + encoded + '&quot;)">' +
      '<div class="nv-item-icon ' + iconClass + '">' + icon + '</div>' +
      '<div class="nv-item-body">' +
        '<div class="nv-item-name">' + d.name + '</div>' +
        '<div class="nv-item-addr">' + d.addr + '</div>' +
        '<div class="nv-item-tags">' +
          '<span class="nv-item-tag ' + tagClass + '">' + statInfo.label + '</span>' +
          '<span class="nv-item-tag type">' + typeLabel + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="nv-item-dist">' + dist + '</div>' +
    '</div>';
  }).join("");
}

let _lastNvList = [];
function selectNvItem(idx, encoded) {
  // 리스트 아이템 하이라이트
  document.querySelectorAll(".nv-list-item").forEach(el => el.classList.remove("active"));
  const el = document.getElementById("nv-item-" + idx);
  if (el) { el.classList.add("active"); el.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  // 카드 열기
  openMapCard(encoded);
}

function closeMapCard() {
  document.getElementById("mapStationCard").style.display = "none";
}

// ✅ 리스트 카드 클릭 → 지도 탭으로 이동 후 해당 위치 포커스
function focusStationOnMap(stationId) {
  const s = STATIONS.find(x => x.id === stationId);
  if (!s) return;
  switchView("map");
  // 지도가 초기화될 시간을 주고 이동
  setTimeout(() => {
    if (!kakaoMap) { initKakaoMap(); return; }
    const geocoder = geocoder_global.instance;
    if (!geocoder) return;
    geocoder.addressSearch(s.address, (result, status) => {
      if (status !== kakao.maps.services.Status.OK) return;
      kakaoMap.setCenter(new kakao.maps.LatLng(result[0].y, result[0].x));
      kakaoMap.setLevel(4);
    });
  }, 300);
}

function getEvStatInfo(stat) {
  if (stat === "2") return { label:"충전 가능", color:"#16a34a", bg:"#dcfce7" };
  if (stat === "3") return { label:"충전 중",   color:"#dc2626", bg:"#fee2e2" };
  return                   { label:"확인불가",  color:"#64748b", bg:"#f1f5f9" };
}

function getEvDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1000;
}

function setMapFilter(type, btn) {
  currentMapFilter = type;
  // nv-chip (data-mf) active 동기화
  document.querySelectorAll(".nv-chip[data-mf]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  filterStations();
  closeMapCard();
}

function goToMyLocation() {
  if (!navigator.geolocation || !kakaoMap) return;
  navigator.geolocation.getCurrentPosition(pos => {
    kakaoMap.panTo(new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
  }, () => showToast("⚠️ 위치 정보를 가져올 수 없습니다", "error"));
}
// ---- DATA ----
const STATIONS = [
  { id:1, name:"강남 테헤란로점", region:"강남", address:"서울 강남구 테헤란로 152", dist:"0.3km", status:"available", mapX:"55%", mapY:"45%",
    chargers:[{id:1,type:"급속 50kW",status:"free"},{id:2,type:"급속 50kW",status:"busy"},{id:3,type:"급속 100kW",status:"free"},{id:4,type:"완속 7kW",status:"free"},{id:5,type:"완속 7kW",status:"reserved"},{id:6,type:"급속 50kW",status:"free"}],
    available:4, total:6, types:["급속","완속"], hours:"24시간", fee:"급속 300원/kWh · 완속 240원/kWh", avgChargeMin:35 },
  { id:2, name:"서초 반포점", region:"서초", address:"서울 서초구 반포대로 58", dist:"0.8km", status:"busy", mapX:"42%", mapY:"60%",
    chargers:[{id:1,type:"급속 50kW",status:"busy"},{id:2,type:"급속 50kW",status:"busy"},{id:3,type:"급속 50kW",status:"free"},{id:4,type:"완속 7kW",status:"busy"}],
    available:1, total:4, types:["급속","완속"], hours:"06:00 ~ 24:00", fee:"급속 310원/kWh", avgChargeMin:40 },
  { id:3, name:"송파 잠실점", region:"송파", address:"서울 송파구 올림픽로 300", dist:"1.2km", status:"available", mapX:"75%", mapY:"55%",
    chargers:[{id:1,type:"급속 100kW",status:"free"},{id:2,type:"급속 100kW",status:"busy"},{id:3,type:"급속 50kW",status:"free"},{id:4,type:"완속 7kW",status:"free"},{id:5,type:"완속 7kW",status:"reserved"}],
    available:3, total:5, types:["급속","완속"], hours:"24시간", fee:"급속 300원/kWh · 완속 240원/kWh", avgChargeMin:30 },
  { id:4, name:"마포 홍대점", region:"마포", address:"서울 마포구 양화로 188", dist:"2.1km", status:"full", mapX:"22%", mapY:"35%",
    chargers:[{id:1,type:"급속 50kW",status:"busy"},{id:2,type:"급속 50kW",status:"busy"},{id:3,type:"완속 7kW",status:"busy"},{id:4,type:"완속 7kW",status:"busy"}],
    available:0, total:4, types:["급속","완속"], hours:"07:00 ~ 23:00", fee:"급속 320원/kWh · 완속 250원/kWh", avgChargeMin:45 },
  { id:5, name:"영등포 타임스퀘어점", region:"영등포", address:"서울 영등포구 영중로 15", dist:"3.0km", status:"available", mapX:"18%", mapY:"62%",
    chargers:[{id:1,type:"급속 100kW",status:"free"},{id:2,type:"급속 100kW",status:"free"},{id:3,type:"급속 50kW",status:"busy"},{id:4,type:"완속 7kW",status:"free"},{id:5,type:"완속 7kW",status:"free"},{id:6,type:"완속 7kW",status:"reserved"}],
    available:4, total:6, types:["급속","완속"], hours:"24시간", fee:"급속 295원/kWh · 완속 235원/kWh", avgChargeMin:32 },
  { id:6, name:"강남 코엑스점", region:"강남", address:"서울 강남구 영동대로 513", dist:"1.5km", status:"available", mapX:"60%", mapY:"30%",
    chargers:[{id:1,type:"급속 200kW",status:"free"},{id:2,type:"급속 200kW",status:"free"},{id:3,type:"급속 50kW",status:"busy"},{id:4,type:"급속 50kW",status:"free"},{id:5,type:"완속 7kW",status:"reserved"}],
    available:3, total:5, types:["급속","완속"], hours:"24시간", fee:"급속 280원/kWh · 완속 230원/kWh", avgChargeMin:28 },
  { id:7, name:"서초 양재점", region:"서초", address:"서울 서초구 강남대로 465", dist:"2.4km", status:"busy", mapX:"48%", mapY:"78%",
    chargers:[{id:1,type:"급속 50kW",status:"busy"},{id:2,type:"급속 50kW",status:"busy"},{id:3,type:"급속 50kW",status:"free"},{id:4,type:"완속 7kW",status:"free"}],
    available:2, total:4, types:["급속"], hours:"06:00 ~ 24:00", fee:"급속 310원/kWh", avgChargeMin:38 },
  { id:8, name:"마포 공덕점", region:"마포", address:"서울 마포구 마포대로 92", dist:"2.8km", status:"available", mapX:"30%", mapY:"48%",
    chargers:[{id:1,type:"급속 50kW",status:"free"},{id:2,type:"급속 50kW",status:"free"},{id:3,type:"완속 7kW",status:"free"}],
    available:3, total:3, types:["급속","완속"], hours:"24시간", fee:"급속 300원/kWh · 완속 240원/kWh", avgChargeMin:33 },
];

const CHART_DATA = {
  week:   { labels:["월","화","수","목","금","토","일"], data:[12,8,15,6,18,22,10], cost:[3600,2400,4500,1800,5400,6600,3000] },
  month:  { labels:["1주","2주","3주","4주"], data:[28,35,22,41], cost:[8400,10500,6600,12300] },
  "3month":{ labels:["1월","2월","3월"], data:[85,92,107], cost:[25500,27600,32100] }
};

// ---- STATE ----
let selectedCharger = null, selectedDate = null, selectedTime = null, currentStation = null;
let currentView = "list", chartInstance = null, isLoggedIn = false;
let favorites = new Set(); // 즐겨찾기 충전소 id Set
let calcRate = 300; // 현재 선택된 요금(원/kWh)

// 로그인 사용자 정보
let currentUser = { name:"홍길동", email:"hong@example.com" };

// 예약 목록 (동적으로 관리)
let reservations = [
  { id:"r1", stationName:"강남 테헤란로점", address:"서울 강남구 테헤란로 152",
    date:"2025.03.24 (월)", time:"14:00 ~ 15:30", chargerType:"급속 50kW", chargerId:3, status:"upcoming" },
  { id:"r2", stationName:"송파 잠실점", address:"서울 송파구 올림픽로 300",
    date:"2025.03.26 (수)", time:"10:00 ~ 11:00", chargerType:"급속 100kW", chargerId:1, status:"upcoming" }
];
// 필터 상태 — 각 그룹 다중 선택 지원 (Set 사용)
const chipState = {
  status: new Set(["all"]),
  type:   new Set(["all"]),
  region: new Set(["all"])
};

// ---- INIT ----
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupHamburger();
  animateCounters();
  setTimeout(() => {
    document.getElementById("skeletonGrid").style.display = "none";
    const grid = document.getElementById("stationGrid");
    grid.style.display = "grid";
    renderStations(STATIONS);
  }, 800);
  // 알림 패널 외부 클릭 닫기
  document.addEventListener("click", (e) => {
    const wrap = document.querySelector(".notif-wrap");
    if (wrap && !wrap.contains(e.target)) {
      document.getElementById("notifPanel").classList.remove("open");
    }
  });

  // API 자동 로드
  loadKakaoMapScript(KAKAO_KEY);
});

// ---- NAV ----
function setupNav() {
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
}

function navigateTo(page) {
  if (page === 'stations') {
    // 충전소 찾기 진입 시 지도 초기화
    setTimeout(() => {
      if (!kakaoMap && window.kakao && kakao.maps) initKakaoMap();
    }, 100);
  }
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const target = document.getElementById("page-" + page);
  if (target) target.classList.add("active");
  const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (navLink) navLink.classList.add("active");
  window.scrollTo({ top:0, behavior:"smooth" });
  if (page === "mypage") { setTimeout(() => renderChart("month"), 100); updateMypageUser(); renderFavorites(); setTimeout(updateCalc, 50); }
  if (page === "reservations") renderReservations();
  if (page === "support") initSupportPage();
}

// ---- HAMBURGER ----
function setupHamburger() {
  document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebarOverlay").classList.add("open");
    document.getElementById("hamburger").classList.add("open");
  });
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("open");
  document.getElementById("hamburger").classList.remove("open");
}
function sidebarNav(el) {
  el.preventDefault ? el.preventDefault() : null;
  closeSidebar();
  navigateTo(el.dataset.page);
  return false;
}

// ---- COUNTER ----
function animateCounters() {
  document.querySelectorAll(".stat-num").forEach(el => {
    const target = parseInt(el.dataset.target);
    let cur = 0;
    const step = target / 55;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur);
      if (cur >= target) clearInterval(timer);
    }, 18);
  });
}

// ---- QUICK SEARCH ----
function quickSearch(q) {
  document.getElementById("heroSearch").value = q;
  goToStations();
}
function goToStations() {
  const q = document.getElementById("heroSearch").value;
  if (q) document.getElementById("stationSearch").value = q;
  navigateTo("stations");
  filterStations();
}

// ---- VIEW TOGGLE ----

// ---- 사이드바 토글 ----
function toggleNvSidebar() {
  const sb     = document.getElementById("nvSidebar");
  const layout = sb.closest(".nv-layout");
  sb.classList.toggle("collapsed");
  layout.classList.toggle("sidebar-collapsed");
  // 지도 리사이즈 (사이드바 애니메이션 끝난 후)
  setTimeout(() => { if (kakaoMap) kakao.maps.event.trigger(kakaoMap, "resize"); }, 320);
}

function switchView(v) {
  currentView = v;
  // 네이버 스타일에서는 탭 전환 불필요 — 지도 항상 표시
  // 하위 호환용으로 유지
}


// ---- 대기시간 계산 ----
function getWaitInfo(station) {
  const busy = station.chargers.filter(c => c.status === "busy" || c.status === "reserved").length;
  const free = station.available;
  if (free > 0) return { label: "바로 이용 가능", cls: "wait-ok" };
  // 전부 사용 중이면 대기 예상시간 계산
  // 평균 남은 시간 = avgChargeMin의 절반(랜덤하게 진행 중이라 가정)
  const avg = station.avgChargeMin || 35;
  const waitMin = Math.round(avg * (0.3 + Math.random() * 0.5)); // 30~80% 진행 중 가정
  if (waitMin <= 10) return { label: `약 ${waitMin}분 대기`, cls: "wait-soon" };
  if (waitMin <= 25) return { label: `약 ${waitMin}분 대기`, cls: "wait-mid" };
  return { label: `약 ${waitMin}분 이상 대기`, cls: "wait-long" };
}

// ---- RENDER STATIONS ----
function renderStations(list) {
  const grid = document.getElementById("stationGrid");
  const counterEl = document.getElementById("stationCount");
  if (counterEl) counterEl.textContent = list.length > 0 ? `총 ${list.length}개 충전소` : "";
  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔌</span>
        <h3>검색 결과가 없어요</h3>
        <p>다른 지역이나 조건으로 다시 검색해보세요</p>
        <button class="btn-reserve" style="display:inline-block;width:auto;padding:9px 24px" onclick="resetFilters()">필터 초기화</button>
      </div>`;
    return;
  }
  grid.innerHTML = list.map(s => {
    const slotHTML = s.chargers.map(c => {
      const cls = c.status === "free" ? "free" : c.status === "reserved" ? "reserved" : "occupied";
      const label = c.status === "free" ? "✓" : c.status === "reserved" ? "R" : "✕";
      return `<div class="slot ${cls}" title="${c.type} · ${cls === 'free' ? '이용가능' : cls === 'reserved' ? '예약됨' : '사용중'}">${label}</div>`;
    }).join("");
    const badgeLabel = s.status === "available" ? "이용 가능" : s.status === "busy" ? "혼잡" : "만석";
    return `
    <div class="station-card ${s.status}" onclick="openStationModal(${s.id})">
      <div class="sc-header">
        <h3>${s.name}</h3>
        <span class="sc-badge ${s.status}">${badgeLabel}</span>
      </div>
      <p class="sc-addr">📍 ${s.address}</p>
      <div class="sc-slots">${slotHTML}</div>
      <div class="sc-meta">
        <span>📡 ${s.available}/${s.total} 가능</span>
        <span>⚡ ${s.types.join(" · ")}</span>
        <span>🕐 ${s.hours}</span>
        <span>📍 ${s.dist}</span>
      </div>
      <div class="sc-wait ${getWaitInfo(s).cls}">${getWaitInfo(s).label}</div>
      <div class="sc-actions">
        <button class="btn-reserve" ${s.status === "full" ? "disabled" : ""} onclick="event.stopPropagation(); openStationModal(${s.id})">
          ${s.status === "full" ? "⛔ 만석" : "⚡ 예약하기"}
        </button>
        <button class="btn-navi" onclick="event.stopPropagation(); focusStationOnMap(${s.id})" title="지도에서 보기">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </button>
        <button class="btn-heart ${favorites.has(s.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${s.id})" title="즐겨찾기">
          ${favorites.has(s.id) ? '♥' : '♡'}
        </button>
      </div>
    </div>`;
  }).join("");
}

// ---- MAP PINS ----
function renderMapPins(list) {
  const container = document.getElementById("mapPins");
  container.innerHTML = list.map(s => `
    <div class="map-pin" style="left:${s.mapX};top:${s.mapY}" onclick="showMapInfo(${s.id})" title="${s.name}">
      <div class="map-pin-inner">
        <div class="map-pin-bubble ${s.status}">${s.available}/${s.total}</div>
        <div class="map-pin-tail ${s.status}"></div>
      </div>
    </div>`).join("");
}

function showMapInfo(id) {
  const s = STATIONS.find(x => x.id === id);
  const info = document.getElementById("mapStationInfo");
  info.style.display = "flex";
  const badgeLabel = s.status === "available" ? "이용 가능" : s.status === "busy" ? "혼잡" : "만석";
  info.innerHTML = `
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <strong style="font-size:1rem">${s.name}</strong>
        <span class="sc-badge ${s.status}" style="padding:2px 8px;font-size:0.68rem">${badgeLabel}</span>
      </div>
      <p style="font-size:0.82rem;color:var(--text-sub)">📍 ${s.address} · ⚡ ${s.available}/${s.total} 가능</p>
    </div>
    <button class="btn-reserve" style="width:auto;padding:9px 20px;white-space:nowrap"
      ${s.status === "full" ? "disabled" : ""} onclick="openStationModal(${s.id})">
      ${s.status === "full" ? "만석" : "예약하기"}
    </button>`;
}

// ---- CHIP FILTER ----
function setChip(el) {
  const group = el.dataset.group;
  const val   = el.dataset.val;
  const set   = chipState[group];

  if (val === "all") {
    set.clear();
    set.add("all");
  } else {
    set.delete("all");
    if (set.has(val)) {
      set.delete(val);
      if (set.size === 0) set.add("all");
    } else {
      set.add(val);
    }
  }

  // nv-chip active 클래스 동기화
  document.querySelectorAll(`.nv-chip[data-group="${group}"]`).forEach(c => {
    c.classList.toggle("active", set.has(c.dataset.val));
  });

  updateNvActiveTags();
  filterStations();
}

// 선택된 필터 태그 + 초기화 버튼 표시 (사이드바용)
const NV_CHIP_LABELS = {
  status: { available:"이용 가능", busy:"혼잡", full:"만석" },
  type:   { "급속":"급속", "완속":"완속" }
};

function updateNvActiveTags() {
  const wrap    = document.getElementById("nvActiveFilterWrap");
  const tagWrap = document.getElementById("nvActiveTags");
  if (!wrap || !tagWrap) return;

  const tags = [];
  // 충전 속도 (mapFilter)
  if (currentMapFilter !== "all") {
    tags.push({ type:"mf", label: currentMapFilter === "fast" ? "⚡ 급속" : "🔌 완속", val: currentMapFilter });
  }
  // 이용 상태
  ["status"].forEach(group => {
    const set = chipState[group];
    if (!(set.has("all") && set.size === 1)) {
      set.forEach(val => {
        if (val !== "all") tags.push({ type:"chip", group, val, label: NV_CHIP_LABELS[group][val] || val });
      });
    }
  });

  // 검색어
  const q = (document.getElementById("stationSearch")?.value || "").trim();
  if (q) tags.push({ type:"search", label: `"${q}"` });

  wrap.style.display = tags.length ? "flex" : "none";
  tagWrap.innerHTML = tags.map(t => {
    if (t.type === "mf")     return `<span class="nv-active-tag"><span>${t.label}</span><button onclick="clearMfFilter()">✕</button></span>`;
    if (t.type === "chip")   return `<span class="nv-active-tag"><span>${t.label}</span><button onclick="removeNvChip('${t.group}','${t.val}')">✕</button></span>`;
    if (t.type === "search") return `<span class="nv-active-tag"><span>${t.label}</span><button onclick="clearSearch()">✕</button></span>`;
    return "";
  }).join("");
}

function clearMfFilter() {
  currentMapFilter = "all";
  document.querySelectorAll(".nv-chip[data-mf]").forEach(b => b.classList.toggle("active", b.dataset.mf === "all"));
  filterStations();
}

function removeNvChip(group, val) {
  const set = chipState[group];
  set.delete(val);
  if (set.size === 0) set.add("all");
  document.querySelectorAll(`.nv-chip[data-group="${group}"]`).forEach(c => {
    c.classList.toggle("active", set.has(c.dataset.val));
  });
  updateNvActiveTags();
  filterStations();
}

// ---- FILTER ----
// 검색창 버튼 / 엔터로 실행
function doSearch() {
  const q = (document.getElementById("stationSearch")?.value || "").trim();
  const clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.classList.toggle("visible", q.length > 0);
  // 지도 장소 검색 (검색어가 있으면 카카오맵도 이동)
  if (q && mapPs) searchMapPlace();
  filterStations();
}

function filterStations() {
  const q = (document.getElementById("stationSearch")?.value || "").toLowerCase();
  const clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.classList.toggle("visible", q.length > 0);
  updateNvActiveTags();

  const filtered = STATIONS.filter(s => {
    const matchQ      = !q || s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.region.includes(q) || s.hours.includes(q);
    const matchStatus = chipState.status.has("all") || chipState.status.has(s.status);
    // 충전 속도는 currentMapFilter로 통합
    const matchType   = currentMapFilter === "all" ||
                        (currentMapFilter === "fast" && s.types.includes("급속")) ||
                        (currentMapFilter === "slow" && s.types.includes("완속"));
    return matchQ && matchStatus && matchType;
  });
  renderStations(filtered);
  renderMapPins(filtered);
  // 지도 마커도 필터 반영
  if (evAllData.length) displayEVMarkers();
}

function clearSearch() {
  document.getElementById("stationSearch").value = "";
  const clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.classList.remove("visible");
  filterStations();
}

function resetFilters() {
  // 검색창
  document.getElementById("stationSearch").value = "";
  const clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.classList.remove("visible");
  // chipState 초기화
  chipState.status = new Set(["all"]);
  chipState.type   = new Set(["all"]);
  chipState.region = new Set(["all"]);
  // 충전 속도 필터 초기화
  currentMapFilter = "all";
  // 칩 UI 동기화
  document.querySelectorAll(".nv-chip[data-group]").forEach(c => {
    c.classList.toggle("active", c.dataset.val === "all");
  });
  document.querySelectorAll(".nv-chip[data-mf]").forEach(b => {
    b.classList.toggle("active", b.dataset.mf === "all");
  });
  updateNvActiveTags();
  renderStations(STATIONS);
  renderMapPins(STATIONS);
  if (evAllData.length) displayEVMarkers();
}

// ---- MODAL (예약) ----
function openStationModal(id) {
  // 로그인 여부 관계없이 모달 열림 — 확정 버튼에서 로그인 체크
  currentStation = STATIONS.find(s => s.id === id);
  if (!currentStation) return;
  selectedCharger = null; selectedDate = null; selectedTime = null;
  updateStepIndicator(1);

  const today = new Date();
  const dates = Array.from({length:5}, (_,i) => { const d = new Date(today); d.setDate(today.getDate()+i); return d; });
  const times = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
  const takenTimes = ["10:00","11:00","14:00","18:00"];

  const chargerHTML = currentStation.chargers.map(c => {
    const statusMap = { free:"free", busy:"busy-s", reserved:"busy-s" };
    const labelMap  = { free:"이용 가능", busy:"사용 중", reserved:"예약됨" };
    const disabled  = c.status !== "free" ? "disabled" : "";
    return `<div class="charger-item ${disabled}" onclick="selectCharger(this, ${c.id}, '${c.type}')">
      <div class="ci-left"><span class="ci-num">#${c.id}</span><span class="ci-type">${c.type}</span></div>
      <span class="ci-status ${statusMap[c.status]}">${labelMap[c.status]}</span>
    </div>`;
  }).join("");

  const dateHTML = dates.map((d,i) => {
    const label = i===0 ? "오늘" : i===1 ? "내일" : `${d.getMonth()+1}/${d.getDate()}`;
    const val   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return `<button class="date-btn" data-val="${val}" onclick="selectDate(this)">${label}</button>`;
  }).join("");

  const timeHTML = times.map(t => {
    const taken = takenTimes.includes(t) ? "taken" : "";
    return `<div class="time-slot ${taken}" onclick="selectTime(this, '${t}')">${t}</div>`;
  }).join("");

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-station-name">⚡ ${currentStation.name}</div>
    <div class="modal-station-addr">📍 ${currentStation.address} · 🕐 ${currentStation.hours}</div>
    <div class="modal-fee-badge">💰 ${currentStation.fee}</div>
    <div class="modal-section">
      <div class="modal-section-title">
        <span style="background:var(--primary);color:white;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:900">1</span>
        충전기 선택
      </div>
      <div class="charger-list">${chargerHTML}</div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">
        <span style="background:var(--border);color:var(--text-sub);border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:900" id="step2num">2</span>
        날짜 선택
      </div>
      <div class="date-picker">${dateHTML}</div>
    </div>
    <div class="modal-section">
      <div class="modal-section-title">
        <span style="background:var(--border);color:var(--text-sub);border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:900" id="step3num">3</span>
        시간 선택
        <span style="font-weight:400;font-size:0.75rem;color:var(--text-sub)">(취소선: 예약 불가)</span>
      </div>
      <div class="time-grid">${timeHTML}</div>
    </div>
    <button class="modal-confirm-btn" id="confirmBtn" onclick="confirmReservation()" disabled>충전기를 먼저 선택하세요</button>
  `;
  // 탭 초기화 (예약하기 탭으로)
  document.querySelectorAll(".modal-tab").forEach((t,i) => t.classList.toggle("active", i===0));
  document.getElementById("modalTabReserve").style.display = "block";
  document.getElementById("modalTabInfo").style.display    = "none";
  document.getElementById("modalTabReview").style.display  = "none";
  document.getElementById("modalOverlay").classList.add("open");

  // 모바일 아코디언 (600px 이하)
  if (window.innerWidth <= 600) {
    requestAnimationFrame(() => {
      document.querySelectorAll(".modal-section").forEach(section => {
        const titleEl = section.querySelector(".modal-section-title");
        const bodyEl  = section.querySelector(".charger-list, .date-picker, .time-grid");
        if (!titleEl || !bodyEl) return;
        // body를 div.modal-section-body로 감싸기
        const bodyWrap = document.createElement("div");
        bodyWrap.className = "modal-section-body";
        bodyWrap.style.maxHeight = bodyEl.scrollHeight + "px";
        bodyEl.parentNode.insertBefore(bodyWrap, bodyEl);
        bodyWrap.appendChild(bodyEl);
        titleEl.style.cursor = "pointer";
        titleEl.addEventListener("click", () => {
          const collapsed = bodyWrap.classList.toggle("collapsed");
          titleEl.classList.toggle("collapsed", collapsed);
          bodyWrap.style.maxHeight = collapsed ? "0" : bodyWrap.scrollHeight + "px";
        });
      });
    });
  }

}

function updateStepIndicator(active) {
  document.querySelectorAll(".step-item").forEach((el, i) => {
    el.classList.toggle("active", i+1 === active);
    el.classList.toggle("done", i+1 < active);
  });
  document.querySelectorAll(".step-line").forEach((el, i) => {
    el.classList.toggle("done", i+1 < active);
  });
}

function selectCharger(el, id, type) {
  if (el.classList.contains("disabled")) return;
  document.querySelectorAll(".charger-item").forEach(e => e.classList.remove("selected"));
  el.classList.add("selected");
  selectedCharger = { id, type };
  updateStepIndicator(2);
  const s2 = document.getElementById("step2num");
  if (s2) { s2.style.background = "var(--primary)"; s2.style.color = "white"; }
  updateConfirmBtn();
}
function selectDate(el) {
  document.querySelectorAll(".date-btn").forEach(e => e.classList.remove("selected"));
  el.classList.add("selected");
  selectedDate = el.dataset.val;
  if (selectedCharger) updateStepIndicator(3);
  const s3 = document.getElementById("step3num");
  if (s3 && selectedCharger) { s3.style.background = "var(--primary)"; s3.style.color = "white"; }
  updateConfirmBtn();
}
function selectTime(el, t) {
  if (el.classList.contains("taken")) return;
  document.querySelectorAll(".time-slot").forEach(e => e.classList.remove("selected"));
  el.classList.add("selected");
  selectedTime = t;
  updateConfirmBtn();
}
function updateConfirmBtn() {
  const btn = document.getElementById("confirmBtn");
  if (!btn) return;
  if (selectedCharger && selectedDate && selectedTime) {
    btn.disabled = false;
    btn.textContent = `✅ 충전기 #${selectedCharger.id} · ${selectedDate.slice(5)} · ${selectedTime} 예약 확정`;
  } else {
    btn.disabled = true;
    const missing = [];
    if (!selectedCharger) missing.push("충전기");
    if (!selectedDate)    missing.push("날짜");
    if (!selectedTime)    missing.push("시간");
    btn.textContent = missing.join(", ") + "을(를) 선택하세요";
  }
}
function confirmReservation() {
  if (!selectedCharger || !selectedDate || !selectedTime) return;

  // 비로그인 시: 토스트 + 로그인 모달 (예약 모달은 뒤에 유지됨)
  if (!isLoggedIn) {
    showToast("🔐 로그인이 필요합니다", "error");
    setTimeout(() => openLoginModal(), 400);
    return;
  }

  const newRes = {
    id: "r" + Date.now(),
    stationName: currentStation.name,
    address: currentStation.address,
    date: formatDateLabel(selectedDate),
    time: selectedTime + " ~ " + addOneHour(selectedTime),
    chargerType: selectedCharger.type,
    chargerId: selectedCharger.id,
    status: "upcoming"
  };
  reservations.unshift(newRes);
  const upcomingCount = reservations.filter(r => r.status === "upcoming").length;
  document.querySelectorAll(".nav-badge").forEach(b => b.textContent = upcomingCount);
  closeModal();
  showToast(`✅ ${currentStation.name} 충전기 #${selectedCharger.id} 예약 완료!`, "success");
  setTimeout(() => navigateTo("reservations"), 1200);
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const days = ["일","월","화","수","목","금","토"];
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} (${days[d.getDay()]})`;
}
function addOneHour(timeStr) {
  const [h,m] = timeStr.split(":").map(Number);
  return `${String((h+1)%24).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

// ---- RES TABS ----
function switchResTab(tab, btn) {
  document.querySelectorAll(".res-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  ["upcoming","ongoing","done"].forEach(t => {
    document.getElementById("res-" + t).classList.toggle("hidden", t !== tab);
  });
}


// ---- 예약 목록 렌더링 ----
function renderReservations() {
  const upcoming = reservations.filter(r => r.status === "upcoming");
  const done     = reservations.filter(r => r.status === "done");

  const upcomingEl = document.getElementById("res-upcoming");
  if (upcomingEl) {
    if (!upcoming.length) {
      upcomingEl.innerHTML = `<div class="res-empty">
        <span class="res-empty-icon">📅</span>
        <h3>예정된 예약이 없어요</h3>
        <p>충전소를 검색하고 원하는 시간에 예약해보세요</p>
        <button class="btn-reserve" style="display:inline-block;width:auto;padding:9px 24px;margin-top:0.5rem" onclick="navigateTo('stations')">충전소 찾기</button>
      </div>`;
    } else {
      upcomingEl.innerHTML = upcoming.map(r => `
        <div class="res-card" data-res-id="${r.id}">
          <div class="res-card-accent" style="background:var(--primary)"></div>
          <div class="res-card-left">
            <div class="res-status upcoming">예약 확정</div>
            <h3>${r.stationName}</h3>
            <p class="res-addr">📍 ${r.address}</p>
            <div class="res-meta">
              <span>📅 ${r.date}</span>
              <span>🕐 ${r.time}</span>
              <span>⚡ ${r.chargerType}</span>
            </div>
          </div>
          <div class="res-card-right">
            <div class="res-charger">충전기 #${r.chargerId}</div>
            <button class="btn-cancel" onclick="cancelReservation(this)">예약 취소</button>
          </div>
        </div>`).join("");
    }
  }

  const tabCount = document.querySelector(".res-tab:first-child .tab-count");
  if (tabCount) tabCount.textContent = upcoming.length;

  const doneEl = document.getElementById("res-done");
  if (doneEl) {
    if (!done.length) {
      doneEl.innerHTML = `<div class="res-empty">
        <span class="res-empty-icon">✅</span>
        <h3>완료된 예약이 없어요</h3>
        <p>충전을 완료하면 이곳에 이력이 쌓여요</p>
      </div>`;
    } else {
      doneEl.innerHTML = done.map(r => `
        <div class="res-card" data-res-id="${r.id}">
          <div class="res-card-accent" style="background:var(--text-light)"></div>
          <div class="res-card-left">
            <div class="res-status done-status">✓ 충전 완료</div>
            <h3>${r.stationName}</h3>
            <p class="res-addr">📍 ${r.address}</p>
            <div class="res-meta"><span>📅 ${r.date}</span><span>⚡ ${r.chargerType}</span></div>
          </div>
          <div class="res-card-right">
            <div class="res-cost">충전 요금<strong>₩ ${(Math.floor(Math.random()*8+3)*1000).toLocaleString()}</strong></div>
            <button class="btn-review">⭐ 리뷰 작성</button>
          </div>
        </div>`).join("");
    }
  }
}

// ---- CANCEL ----
function cancelReservation(btn) {
  if (!confirm("정말 예약을 취소할까요?")) return;
  const card = btn.closest(".res-card");
  const resId = card.dataset.resId;
  reservations = reservations.filter(r => r.id !== resId);

  card.style.transition = "all 0.35s ease";
  card.style.opacity = "0";
  card.style.transform = "translateX(20px)";
  setTimeout(() => {
    card.style.maxHeight = card.offsetHeight + "px";
    requestAnimationFrame(() => {
      card.style.maxHeight = "0";
      card.style.padding = "0";
      card.style.margin = "0";
      card.style.overflow = "hidden";
      setTimeout(() => {
        card.remove();
        // 남은 카드 없으면 빈 상태 표시
        const upcomingEl = document.getElementById("res-upcoming");
        if (upcomingEl && !upcomingEl.querySelector(".res-card")) {
          upcomingEl.innerHTML = `<div class="res-empty">
            <span class="res-empty-icon">📅</span>
            <h3>예정된 예약이 없어요</h3>
            <p>충전소를 검색하고 원하는 시간에 예약해보세요</p>
            <button class="btn-reserve" style="display:inline-block;width:auto;padding:9px 24px;margin-top:0.5rem" onclick="navigateTo('stations')">충전소 찾기</button>
          </div>`;
        }
        const upcomingCount = reservations.filter(r => r.status === "upcoming").length;
        const tabCount = document.querySelector(".res-tab:first-child .tab-count");
        if (tabCount) tabCount.textContent = upcomingCount;
        document.querySelectorAll(".nav-badge").forEach(b => b.textContent = upcomingCount || 0);
      }, 350);
    });
  }, 300);
  showToast("🗑️ 예약이 취소되었습니다", "error");
}



// ---- 모달 탭 전환 ----
function switchModalTab(tab, btn) {
  document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("modalTabReserve").style.display = tab === "reserve" ? "block" : "none";
  document.getElementById("modalTabInfo").style.display    = tab === "info"    ? "block" : "none";
  document.getElementById("modalTabReview").style.display  = tab === "review"  ? "block" : "none";

  if (tab === "info" && currentStation) renderModalInfo();
  if (tab === "review" && currentStation) renderModalReview();
}

function renderModalInfo() {
  const s = currentStation;
  document.getElementById("modalInfoContent").innerHTML = `
    <div style="padding:0.4rem 0">
      <div class="modal-station-name">⚡ ${s.name}</div>
      <div class="modal-station-addr">📍 ${s.address}</div>
    </div>
    <div class="info-section">
      <div class="info-row"><span class="info-label">운영시간</span><span>🕐 ${s.hours}</span></div>
      <div class="info-row"><span class="info-label">충전 요금</span><span>💰 ${s.fee}</span></div>
      <div class="info-row"><span class="info-label">총 충전기</span><span>⚡ ${s.total}대 (급속+완속)</span></div>
      <div class="info-row"><span class="info-label">현재 가용</span><span style="color:var(--primary);font-weight:700">${s.available}/${s.total}대 이용 가능</span></div>
    </div>
    <div class="info-section">
      <div class="info-section-title">편의시설</div>
      <div class="facility-chips">
        <span class="facility-chip">🅿️ 주차 가능</span>
        <span class="facility-chip">🚻 화장실</span>
        <span class="facility-chip">☕ 카페 인근</span>
        <span class="facility-chip">🛒 편의점</span>
      </div>
    </div>
    <div class="info-section">
      <div class="info-section-title">충전기 현황</div>
      <div class="charger-info-list">
        ${s.chargers.map(c => {
          const stMap = { free:"이용 가능", busy:"사용 중", reserved:"예약됨" };
          const clMap = { free:"ci-status free", busy:"ci-status busy-s", reserved:"ci-status busy-s" };
          return `<div class="charger-item" style="cursor:default">
            <div class="ci-left"><span class="ci-num">#${c.id}</span><span class="ci-type">${c.type}</span></div>
            <span class="${clMap[c.status]}">${stMap[c.status]}</span>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

const SAMPLE_REVIEWS = [
  { name:"김지수", rating:5, date:"2025.03.20", text:"대기 없이 바로 충전할 수 있어서 너무 좋았어요! 충전 속도도 빠르고 주차 공간도 넓어요." },
  { name:"이민준", rating:4, date:"2025.03.18", text:"앱 연동이 잘 되어서 편리했습니다. 다음에도 이용할 것 같아요." },
  { name:"박서연", rating:5, date:"2025.03.15", text:"예약 시스템 덕분에 기다리지 않고 바로 충전했어요. 주변 카페도 있어서 여유롭게 기다렸습니다." },
  { name:"최현우", rating:3, date:"2025.03.10", text:"충전기 상태는 좋은데 안내 표지가 조금 부족한 것 같아요. 그래도 전반적으로 만족합니다." }
];

function renderModalReview() {
  const avg = (SAMPLE_REVIEWS.reduce((s,r)=>s+r.rating,0)/SAMPLE_REVIEWS.length).toFixed(1);
  const stars = n => "★".repeat(n) + "☆".repeat(5-n);
  document.getElementById("modalReviewContent").innerHTML = `
    <div class="review-summary">
      <div class="review-avg">${avg}</div>
      <div>
        <div class="review-stars">${stars(Math.round(avg))}</div>
        <div class="review-count">리뷰 ${SAMPLE_REVIEWS.length}개</div>
      </div>
    </div>
    <div class="review-list">
      ${SAMPLE_REVIEWS.map(r => `
        <div class="review-item">
          <div class="review-header">
            <span class="review-name">${r.name}</span>
            <span class="review-stars-sm">${stars(r.rating)}</span>
            <span class="review-date">${r.date}</span>
          </div>
          <p class="review-text">${r.text}</p>
        </div>`).join("")}
    </div>
  `;
}


// ---- 배터리 위젯 ----
const batteryState = { pct: 78, range: 342, charging: false };

function initBatteryWidget() {
  updateBatteryWidget();
  // 충전 중일 때 3초마다 % 증가 시뮬레이션
  setInterval(() => {
    if (batteryState.charging && batteryState.pct < 100) {
      batteryState.pct = Math.min(batteryState.pct + 0.5, 100);
      batteryState.range = Math.round(batteryState.pct * 4.4);
      updateBatteryWidget();
    }
  }, 3000);
}

function updateBatteryWidget() {
  const pct = Math.round(batteryState.pct);
  const range = batteryState.range;
  const charging = batteryState.charging;

  // 색상 결정
  const fillColor = pct >= 60 ? '#3B82F6' : pct >= 30 ? '#F59E0B' : '#EF4444';

  // 마이페이지 위젯
  const fillEl  = document.getElementById('batteryFill');
  const pctEl   = document.getElementById('batteryPct');
  const rangeEl = document.getElementById('batteryRange');
  const statEl  = document.getElementById('batteryStatus');
  if (fillEl)  { fillEl.style.width = pct + '%'; fillEl.style.background = fillColor; }
  if (pctEl)   pctEl.textContent = pct + '%';
  if (rangeEl) rangeEl.innerHTML = '🚗 주행가능 <strong>' + range + ' km</strong>';
  if (statEl)  statEl.innerHTML  = charging
    ? '<span class="bw-status-dot charging"></span>충전 중'
    : '<span class="bw-status-dot idle"></span>대기 중';

  // 홈 미니 위젯
  const evFill  = document.getElementById('evBatteryFill');
  const evPct   = document.getElementById('evBatteryPct');
  const evRange = document.getElementById('evBatteryRange');
  if (evFill)  { evFill.style.width = pct + '%'; evFill.style.background = fillColor; }
  if (evPct)   evPct.textContent = pct + '%';
  if (evRange) evRange.textContent = range + ' km';
}

// ---- 마이페이지 유저 정보 연동 ----
function updateMypageUser() {
  const nameEl  = document.querySelector("#page-mypage .profile-info h2");
  const emailEl = document.querySelector("#page-mypage .profile-info p");
  if (nameEl)  nameEl.innerHTML = `${currentUser.name} 님 <span class="welcome-emoji">👋</span>`;
  if (emailEl) emailEl.textContent = `${currentUser.email} · 010-1234-5678`;
}


// ---- 즐겨찾기 ----
function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast("즐겨찾기에서 제거되었습니다", "");
  } else {
    favorites.add(id);
    showToast("⭐ 즐겨찾기에 추가되었습니다!", "success");
  }
  // 충전소 목록 페이지면 카드 하트 버튼 즉시 업데이트
  const grid = document.getElementById("stationGrid");
  if (grid && grid.style.display !== "none") {
    filterStations();
  }
  // 마이페이지 즐겨찾기 목록 업데이트
  renderFavorites();
}

function renderFavorites() {
  const listEl = document.getElementById("favStationList");
  const badgeEl = document.getElementById("favCountBadge");
  if (!listEl) return;
  const favList = STATIONS.filter(s => favorites.has(s.id));
  if (badgeEl) badgeEl.textContent = favList.length + "개";
  if (!favList.length) {
    listEl.innerHTML = `<div class="fav-empty"><span>💛</span><p>충전소 카드의 ♡ 버튼을 눌러<br>자주 가는 충전소를 저장해보세요</p></div>`;
    return;
  }
  listEl.innerHTML = favList.map(s => {
    const waitInfo = getWaitInfo(s);
    const badgeLabel = s.status === "available" ? "이용 가능" : s.status === "busy" ? "혼잡" : "만석";
    return `
    <div class="fav-card">
      <div class="fav-card-left">
        <div class="fav-card-header">
          <strong>${s.name}</strong>
          <span class="sc-badge ${s.status}" style="font-size:0.68rem;padding:2px 8px">${badgeLabel}</span>
        </div>
        <p class="fav-card-addr">📍 ${s.address}</p>
        <div class="fav-card-meta">
          <span>📡 ${s.available}/${s.total} 가능</span>
          <span class="sc-wait ${waitInfo.cls}" style="display:inline-flex;padding:2px 8px;font-size:0.72rem">${waitInfo.label}</span>
        </div>
      </div>
      <div class="fav-card-right">
        <button class="btn-reserve" style="padding:7px 14px;font-size:0.82rem;width:auto" onclick="openStationModal(${s.id})">예약</button>
        <button class="btn-navi" onclick="openNavi(${s.id})" title="길 찾기" style="width:34px;height:34px;border-radius:8px">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </button>
        <button class="btn-heart active" onclick="toggleFavorite(${s.id})" style="width:34px;height:34px;border-radius:8px">♥</button>
      </div>
    </div>`;
  }).join("");
}

// ---- 길 찾기 (카카오맵) ----
function openNavi(id) {
  const s = STATIONS.find(x => x.id === id);
  if (!s) return;
  // 카카오맵 키워드 검색 URL
  const query = encodeURIComponent(s.address);
  const url = `https://map.kakao.com/link/search/${query}`;
  window.open(url, "_blank");
}

// ---- 요금 계산기 ----
function setCalcType(el, rate) {
  calcRate = rate;
  document.querySelectorAll(".calc-type-btn").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
  updateCalc();
}

function updateCalc() {
  const timeMin  = parseInt(document.getElementById("calcTime")?.value || 30);
  const battery  = parseInt(document.getElementById("calcBattery")?.value || 30);
  const labelEl  = document.getElementById("calcTimeLabel");
  const kwhEl    = document.getElementById("calcKwh");
  const costEl   = document.getElementById("calcCost");
  const afterEl  = document.getElementById("calcAfter");

  if (labelEl) labelEl.textContent = timeMin >= 60 ? `${Math.floor(timeMin/60)}시간${timeMin%60 ? ' '+timeMin%60+'분' : ''}` : `${timeMin}분`;

  // 충전량 계산 (선택 타입에 따라 kW 다름)
  const kw = calcRate === 240 ? 7 : calcRate === 280 ? 100 : 50;
  const kwh = Math.round(kw * (timeMin / 60) * 10) / 10;
  const cost = Math.round(kwh * calcRate / 10) * 10;

  // 배터리 용량 77.4kWh 기준
  const afterPct = Math.min(100, Math.round(battery + (kwh / 77.4) * 100));

  if (kwhEl)   kwhEl.textContent  = `${kwh} kWh`;
  if (costEl)  costEl.textContent = `₩ ${cost.toLocaleString()}`;
  if (afterEl) afterEl.textContent = `${afterPct}%`;
}

// ---- CHART ----
function renderChart(period) {
  const canvas = document.getElementById("chargeChart");
  if (!canvas) return;
  const d = CHART_DATA[period];
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: d.labels,
      datasets: [
        {
          label: "충전량 (kWh)",
          data: d.data,
          backgroundColor: "rgba(59,130,246,0.7)",
          borderColor: "#1D4ED8",
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: "y"
        },
        {
          label: "요금 (원)",
          data: d.cost,
          type: "line",
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245,158,11,0.07)",
          borderWidth: 2,
          pointBackgroundColor: "#F59E0B",
          pointRadius: 4,
          tension: 0.4,
          fill: true,
          yAxisID: "y2"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position:"top", labels:{ font:{ family:"'Noto Sans KR',sans-serif", size:11 }, usePointStyle:true, boxWidth:8 } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label === "요금 (원)" ? `₩${ctx.parsed.y.toLocaleString()}` : `${ctx.parsed.y} kWh` } }
      },
      scales: {
        y:  { position:"left",  ticks:{ font:{size:10}, callback: v => v+" kWh" }, grid:{ color:"rgba(0,0,0,0.04)" } },
        y2: { position:"right", ticks:{ font:{size:10}, callback: v => "₩"+v.toLocaleString() }, grid:{ display:false } },
        x:  { ticks:{ font:{ family:"'Noto Sans KR',sans-serif", size:11 } }, grid:{ display:false } }
      }
    }
  });
}

// ---- 알림 패널 ----
function toggleNotifPanel() {
  document.getElementById("notifPanel").classList.toggle("open");
}
function markAllRead() {
  document.querySelectorAll(".notif-item.unread").forEach(el => el.classList.remove("unread"));
  document.querySelectorAll(".notif-unread-dot").forEach(el => el.remove());
  document.getElementById("notifDot").style.display = "none";
  showToast("✅ 모든 알림을 읽었습니다", "success");
}


// ---- 로그인 안내 상단 배너 ----
let bannerTimer = null;
function showLoginBanner() {
  const banner = document.getElementById("loginBanner");
  if (!banner) return;
  banner.classList.add("show");
  // 5초 후 자동으로 닫힘
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => banner.classList.remove("show"), 5000);
}
function closeBanner() {
  const banner = document.getElementById("loginBanner");
  if (banner) banner.classList.remove("show");
  clearTimeout(bannerTimer);
}
// 하위 호환
function openLoginPrompt() { showLoginBanner(); }
function closeLoginPrompt() { closeBanner(); }
// ---- 로그인 MODAL ----
function openLoginModal() {
  showLogin(null);
  document.getElementById("loginOverlay").classList.add("open");
}
function closeLoginModal() {
  document.getElementById("loginOverlay").classList.remove("open");
  document.getElementById("loginError").style.display = "none";
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPw").value = "";
}
function showSignup(e) {
  if (e) e.preventDefault();
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("termsForm").style.display = "block";
  resetTerms();
}

function resetTerms() {
  ["checkAll","check1","check2","check3","check4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("checked");
  });
  const btn = document.getElementById("termsNextBtn");
  if (btn) { btn.disabled = true; btn.style.opacity = "0.45"; btn.style.cursor = "not-allowed"; }
}

function toggleTerm(id) {
  const el = document.getElementById(id);
  el.classList.toggle("checked");
  syncAllCheck();
  updateTermsNextBtn();
}

function toggleAllTerms() {
  const allEl = document.getElementById("checkAll");
  const isChecked = allEl.classList.contains("checked");
  ["checkAll","check1","check2","check3","check4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) isChecked ? el.classList.remove("checked") : el.classList.add("checked");
  });
  updateTermsNextBtn();
}

function syncAllCheck() {
  const allChecked = ["check1","check2","check3","check4"].every(id =>
    document.getElementById(id).classList.contains("checked")
  );
  const allEl = document.getElementById("checkAll");
  allChecked ? allEl.classList.add("checked") : allEl.classList.remove("checked");
}

function updateTermsNextBtn() {
  const required = ["check1","check2"].every(id =>
    document.getElementById(id).classList.contains("checked")
  );
  const btn = document.getElementById("termsNextBtn");
  if (btn) {
    btn.disabled = !required;
    btn.style.opacity = required ? "1" : "0.45";
    btn.style.cursor = required ? "pointer" : "not-allowed";
  }
}

function proceedToSignup() {
  document.getElementById("termsForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
}

function showTermsDetail(e, name) {
  e.preventDefault();
  const contents = {
    "이용약관": `
      <h4 style="color:var(--text);font-size:0.92rem;margin-bottom:10px">제1조 (목적)</h4>
      <p>이 약관은 ChargeNow(이하 "회사")가 제공하는 전기차 충전 예약 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">제2조 (정의)</h4>
      <p>"서비스"란 회사가 제공하는 전기차 충전소 탐색, 예약, 결제 및 관련 부가 서비스 일체를 말합니다.<br>"이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">제3조 (약관의 효력)</h4>
      <p>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다. 회사는 필요한 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 개정할 수 있습니다.</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">제4조 (서비스의 이용)</h4>
      <p>이용자는 서비스 이용 시 관련 법령과 본 약관을 준수하여야 합니다. 타인의 정보를 도용하거나 부정한 방법으로 서비스를 이용하는 행위는 금지됩니다.</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">제5조 (면책조항)</h4>
      <p>회사는 천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다. 충전기 고장, 네트워크 오류 등 부득이한 사정으로 인한 예약 취소 시 사전 통보 후 환불 처리합니다.</p>
    `,
    "개인정보 수집 및 이용": `
      <h4 style="color:var(--text);font-size:0.92rem;margin-bottom:10px">수집하는 개인정보 항목</h4>
      <p><b>필수항목:</b> 이름, 이메일 주소, 비밀번호, 휴대폰 번호<br><b>선택항목:</b> 차량 정보(차종, 배터리 용량), 결제 수단</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">개인정보의 수집·이용 목적</h4>
      <p>· 회원 가입 및 본인 확인<br>· 충전소 예약 및 결제 처리<br>· 서비스 이용 내역 조회 및 고객 지원<br>· 법령상 의무 이행</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">개인정보의 보유·이용 기간</h4>
      <p>회원 탈퇴 시까지 보유하며, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 보관합니다.<br>· 전자상거래 기록: 5년<br>· 로그인 기록: 3개월</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">개인정보 제3자 제공</h4>
      <p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.</p>
    `,
    "위치기반 서비스": `
      <h4 style="color:var(--text);font-size:0.92rem;margin-bottom:10px">서비스 내용</h4>
      <p>ChargeNow는 이용자의 현재 위치를 기반으로 가까운 충전소를 탐색하고 실시간 이용 현황을 제공하는 위치기반 서비스를 제공합니다.</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">위치정보 수집 항목</h4>
      <p>· GPS 위치 정보 (위도·경도)<br>· 이동 경로 (충전소 도착 예측에 활용)</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">이용 목적</h4>
      <p>· 주변 충전소 탐색 및 거리 표시<br>· 길 안내 서비스 연동<br>· 충전소 혼잡도 예측</p>
      <h4 style="color:var(--text);font-size:0.92rem;margin:14px 0 8px">보유 기간</h4>
      <p>위치 정보는 서비스 제공 목적 달성 즉시 파기하며, 별도 저장하지 않습니다. 단, 이용 통계를 위해 비식별화된 정보는 최대 1년간 보관할 수 있습니다.</p>
    `
  };

  const layer = document.getElementById("termsDetailLayer");
  document.getElementById("termsDetailTitle").textContent = name;
  document.getElementById("termsDetailBody").innerHTML = contents[name] || "<p>내용을 불러올 수 없습니다.</p>";
  layer.style.display = "flex";
}

function closeTermsDetail() {
  document.getElementById("termsDetailLayer").style.display = "none";
}
function showLogin(e) {
  if (e) e.preventDefault();
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("termsForm").style.display = "none";
}

// 로그인 제출 — 데모: 아무 이메일/비번이라도 형식만 맞으면 통과
function submitLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pw    = document.getElementById("loginPw").value;
  const errEl = document.getElementById("loginError");
  if (!email || !pw) {
    errEl.style.display = "block";
    errEl.textContent = "이메일과 비밀번호를 입력해주세요";
    return;
  }
  if (!email.includes("@") || pw.length < 4) {
    errEl.style.display = "block";
    errEl.textContent = "아이디 또는 비밀번호가 올바르지 않습니다";
    return;
  }
  errEl.style.display = "none";
  currentUser = { name:"홍길동", email };
  closeLoginModal();
  isLoggedIn = true;
  applyLoginState();
  showToast(`👋 ${currentUser.name} 님, 환영합니다!`, "success");
  afterLogin();
}

function checkPwMatch() {
  const pw = document.getElementById("signupPw").value;
  const confirm = document.getElementById("signupPwConfirm").value;
  const msg = document.getElementById("pwMatchMsg");
  if (!confirm) { msg.textContent = ""; msg.className = "pw-match-msg"; return; }
  if (pw === confirm) {
    msg.textContent = "✓ 비밀번호가 일치합니다";
    msg.className = "pw-match-msg match";
  } else {
    msg.textContent = "✕ 비밀번호가 일치하지 않습니다";
    msg.className = "pw-match-msg no-match";
  }
}

function submitSignup() {
  const name  = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pw    = document.getElementById("signupPw").value;
  const pwConfirm = document.getElementById("signupPwConfirm").value;
  if (!name || !email || !pw || pw.length < 8) {
    showToast("⚠️ 모든 항목을 올바르게 입력해주세요", "error");
    return;
  }
  if (pw !== pwConfirm) {
    showToast("⚠️ 비밀번호가 일치하지 않습니다", "error");
    return;
  }
  currentUser = { name, email };
  closeLoginModal();
  isLoggedIn = true;
  applyLoginState();
  showToast(`🎉 ${name} 님, 가입을 환영합니다!`, "success");
  afterLogin();
}

function socialLogin(provider) {
  currentUser = { name:"홍길동", email:"hong@kakao.com" };
  closeLoginModal();
  isLoggedIn = true;
  applyLoginState();
  showToast(`👋 ${provider} 로그인 완료! ${currentUser.name} 님 환영합니다`, "success");
  afterLogin();
}

// 로그인 완료 후 처리 — 현재 화면 유지, 예약 모달이 열려 있었으면 복원
function afterLogin() {
  if (currentStation) {
    // 예약 모달이 열려 있던 상태에서 로그인했다면 다시 표시
    document.getElementById("modalOverlay").classList.add("open");
  }
  // 마이페이지로 이동하지 않음
}

// ---- 로그인 상태 적용 ----
function applyLoginState() {
  // 홈 배터리 미니 — 로그인 시 표시
  const evMini = document.getElementById("evBatteryMini");
  if (evMini) evMini.style.display = isLoggedIn ? "flex" : "none";
  if (isLoggedIn) { initBatteryWidget(); }

  document.querySelectorAll(".nav-auth-item, .sidebar-auth-item").forEach(el => {
    el.style.display = isLoggedIn ? "" : "none";
  });

  // 상단 nav 로그인 버튼
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.textContent = isLoggedIn ? "로그아웃" : "로그인";
    loginBtn.style.background = isLoggedIn ? "var(--bg)" : "var(--primary)";
    loginBtn.style.color      = isLoggedIn ? "var(--text-sub)" : "white";
    loginBtn.style.border     = isLoggedIn ? "1.5px solid var(--border)" : "none";
  }

  // 사이드바 — 로그인 카드 ↔ 프로필 카드 전환
  const loginCard   = document.getElementById("sidebarLoginCard");
  const profileCard = document.getElementById("sidebarProfileCard");
  if (loginCard)   loginCard.style.display   = isLoggedIn ? "none" : "block";
  if (profileCard) profileCard.style.display = isLoggedIn ? "flex"  : "none";

  // 사이드바 프로필 이름/이메일 업데이트
  const nameEl  = document.getElementById("sidebarUserName");
  const emailEl = document.getElementById("sidebarUserEmail");
  if (nameEl)  nameEl.textContent  = currentUser.name;
  if (emailEl) emailEl.textContent = currentUser.email;

  if (!isLoggedIn) {
    const active = document.querySelector(".page.active");
    if (active && (active.id === "page-reservations" || active.id === "page-mypage")) {
      navigateTo("home");
    }
  }
  // 고객센터 1:1 문의 탭 로그인 상태 갱신
  updateInquiryLoginState();
}

function toggleLogin() {
  if (isLoggedIn) {
    // 로그아웃
    isLoggedIn = false;
    applyLoginState();
    showToast("로그아웃 되었습니다", "");
  } else {
    // 로그인 모달 열기
    openLoginModal();
  }
}
function toggleLoginFromSidebar() {
  closeSidebar();
  // 로그인 상태면 로그아웃, 아니면 로그인 모달
  if (isLoggedIn) {
    isLoggedIn = false;
    applyLoginState();
    showToast("로그아웃 되었습니다", "");
  } else {
    openLoginModal();
  }
}

// ---- 고객센터 ----

let currentSupportTab = 'notice';
let selectedInquiryType = '예약 문의';

function initSupportPage() {
  // 탭 초기화 (항상 공지사항 탭으로 시작)
  switchSupportTab('notice', document.querySelector('#supportTabs .res-tab'));
  // 1:1 문의 로그인 상태 반영
  updateInquiryLoginState();
}

function switchSupportTab(tab, btn) {
  currentSupportTab = tab;
  document.querySelectorAll('#supportTabs .res-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  ['notice', 'faq', 'inquiry'].forEach(t => {
    const el = document.getElementById('support-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'inquiry') updateInquiryLoginState();
}

function updateInquiryLoginState() {
  const loginRequired = document.getElementById('inquiryLoginRequired');
  const formWrap      = document.getElementById('inquiryFormWrap');
  if (!loginRequired || !formWrap) return;
  if (isLoggedIn) {
    loginRequired.style.display = 'none';
    formWrap.style.display = 'block';
    // 이메일 자동 입력
    const emailInput = document.getElementById('inquiryEmail');
    if (emailInput && currentUser.email) emailInput.value = currentUser.email;
  } else {
    loginRequired.style.display = 'flex';
    formWrap.style.display = 'none';
  }
}

// 공지사항 아코디언
function toggleNotice(el) {
  const body = el.querySelector('.notice-body');
  const arrow = el.querySelector('.notice-arrow');
  const isOpen = el.classList.contains('open');
  // 다른 열린 항목 닫기
  document.querySelectorAll('.notice-item.open').forEach(item => {
    item.classList.remove('open');
    item.querySelector('.notice-body').style.maxHeight = '0';
    item.querySelector('.notice-arrow').textContent = '▾';
  });
  if (!isOpen) {
    el.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
    arrow.textContent = '▴';
  }
}

// FAQ 아코디언
function toggleFaq(el) {
  const answer = el.querySelector('.faq-answer');
  const arrow  = el.querySelector('.faq-arrow');
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(item => {
    item.classList.remove('open');
    item.querySelector('.faq-answer').style.maxHeight = '0';
    item.querySelector('.faq-arrow').textContent = '▾';
  });
  if (!isOpen) {
    el.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    arrow.textContent = '▴';
  }
}

// FAQ 카테고리 필터
function filterFaq(cat, btn) {
  document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.faq-item').forEach(item => {
    item.style.display = (cat === 'all' || item.dataset.cat === cat) ? 'block' : 'none';
    // 필터 변경 시 열린 항목 닫기
    item.classList.remove('open');
    const ans = item.querySelector('.faq-answer');
    if (ans) ans.style.maxHeight = '0';
    const arr = item.querySelector('.faq-arrow');
    if (arr) arr.textContent = '▾';
  });
}

// 1:1 문의 유형 선택
function selectInquiryType(btn) {
  document.querySelectorAll('.inquiry-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedInquiryType = btn.textContent;
}

// 1:1 문의 제출
function submitInquiry() {
  const title   = (document.getElementById('inquiryTitle')?.value || '').trim();
  const content = (document.getElementById('inquiryContent')?.value || '').trim();
  const email   = (document.getElementById('inquiryEmail')?.value || '').trim();
  if (!title)   { showToast('⚠️ 문의 제목을 입력해주세요', 'error'); return; }
  if (!content) { showToast('⚠️ 문의 내용을 입력해주세요', 'error'); return; }
  if (!email || !email.includes('@')) { showToast('⚠️ 올바른 이메일 주소를 입력해주세요', 'error'); return; }

  // 문의 내역 리스트에 새 항목 추가
  const list = document.getElementById('inquiryHistoryList');
  if (list) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
    const newItem = document.createElement('div');
    newItem.className = 'inquiry-history-item new-inquiry';
    newItem.innerHTML = `
      <div class="inquiry-history-top">
        <span class="inquiry-status pending">답변 대기</span>
        <span class="inquiry-history-type">${selectedInquiryType}</span>
        <span class="inquiry-history-date">${dateStr}</span>
      </div>
      <div class="inquiry-history-title">${title}</div>
    `;
    list.insertBefore(newItem, list.firstChild);
  }

  // 폼 초기화
  document.getElementById('inquiryTitle').value = '';
  document.getElementById('inquiryContent').value = '';
  document.querySelectorAll('.inquiry-type-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  selectedInquiryType = '예약 문의';

  showToast('✅ 문의가 접수되었습니다. 빠르게 답변드리겠습니다!', 'success');

  // 내역 섹션으로 스크롤
  setTimeout(() => {
    document.getElementById('inquiryHistory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}

// ---- TOAST ----
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast " + type;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}

// ---- EVENTS ----
document.getElementById("loginBtn").addEventListener("click", toggleLogin);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
    closeLoginModal();
    closeLoginPrompt();
    document.getElementById("notifPanel").classList.remove("open");
  }
});