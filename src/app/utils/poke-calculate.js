import { PokeNaturesIndex } from "@/app/types/poke-natures";

/*
 * @param {string} nature
 * 성격에 따른 스탯 증감률 객체를 반환
 * { a: 공격, b: 방어, c: 특공, d: 특방, s: 스피드 }
 * 1세대, 2세대는 성격이 없음, 3세대부터 성격이 존재
 * 성격은 25개, 성격은 2개의 스탯에 각각 10% 증가, 10% 감소
 */
export function calcNature(nature) {
  const stats = ["a", "b", "c", "d", "s"];
  let res = { a: 1, b: 1, c: 1, d: 1, s: 1 };

  // default
  if (!PokeNaturesIndex[nature]) {
    return res;
  }

  const index = PokeNaturesIndex[nature];

  // 0, 6, 12, 18, 24는 보정치 없음
  // 5 단위로 증가 스탯이 바뀜
  Math.floor(index / 5) != index % 5 &&
    ((res[stats[Math.floor(index / 5)]] = 1.1), (res[stats[index % 5]] = 0.9));

  return res;
}

/*
 * @param {number} base: 종족값
 * @param {number} lv: 레벨
 * @param {number} ev: 노력치
 * @param {number} iv: 개체값
 * @return {number} h
 * 체력 계산식
 * 체력 = ((2 * 종족값 + 개체값 + 노력치 / 4 + 100) * 레벨 / 100) + 10
 */
export function calcH(base, lv, ev, iv) {
  // 인수들이 숫자인지 확인
  if (
    typeof base !== "number" ||
    typeof lv !== "number" ||
    typeof ev !== "number" ||
    typeof iv !== "number"
  ) {
    return;
  }

  return Math.floor(((2 * base + iv + ev / 4 + 100) * lv) / 100 + 10);
}

/*
 * @param {number} base: 종족값
 * @param {number} lv: 레벨
 * @param {number} ev: 노력치
 * @param {number} iv: 개체값
 * @param {number} a: 성격 보정치
 * @return {number} a, b, c, d, s
 * 체력 이외의 스탯 계산식
 */
export function calcABCDS(base, lv, ev, iv, a) {
  // 인수들이 숫자인지 확인
  if (
    typeof base !== "number" ||
    typeof lv !== "number" ||
    typeof ev !== "number" ||
    typeof iv !== "number" ||
    typeof a !== "number"
  ) {
    return;
  }
  return Math.floor((((2 * base + iv + ev / 4) * lv) / 100 + 5) * a);
}

/*
 * @param {number} stats
 * @param {number} base
 * @param {number} lv
 * @param {number} iv
 * @return {number} iv
 * 체력 역산
 */
export function calcRevH(stats, base, lv, iv = 0) {
  // 인수들이 숫자인지 확인
  if (
    typeof stats !== "number" ||
    typeof base !== "number" ||
    typeof lv !== "number" ||
    typeof iv !== "number"
  ) {
    return;
  }
  iv = ((stats - 10) * 100) / lv - 100 - iv - 2 * base;
  return iv > 0 ? iv : 0;
}

/*
 * @param {number} stats
 * @param {number} base
 * @param {number} lv
 * @param {number} a: 성격 보정치
 * @param {number} iv
 * @return {number} iv
 * 체력 이외의 스탯 역산
 */
export function calcRevABCDS(stats, base, lv, a, iv = 0) {
  // 인수들이 숫자인지 확인
  if (
    typeof stats !== "number" ||
    typeof base !== "number" ||
    typeof lv !== "number" ||
    typeof a !== "number" ||
    typeof iv !== "number"
  ) {
    return;
  }
  iv = Math.ceil(((stats / a - 5) / lv) * 100 - iv - 2 * base);
  return iv > 0 ? iv : 0;
}

/*
 * @param {object} stats rawStats, { h: number, a: number, b: number, c: number, d: number, s: number }
 * @param {object} base: species.baseStats, { h: number, a: number, b: number, c: number, d: number, s: number }
 * @param {number} lv
 * @param {string} nature
 * @return {object} { message: string, stats: object { h: number, a: number, b: number, c: number, d: number, s: number } }
 * 3세대 이상의 스탯 계산식
 */
export function calcEIv(stats, base, lv, nature = "Serious") {
  // 성격이 없는 경우 무보정 성격으로 설정
  const correctNature = PokeNaturesIndex[nature] ? nature : "Serious";

  let res = {};
  let totalev = 0;
  let message = "success";

  // lv가 숫자인지 확인, 1~100 사이의 숫자인지 확인
  if (typeof lv !== "number" || lv < 1 || lv > 100) {
    return;
  }

  const affect = calcNature(correctNature);

  // baseStats의 property를 순회하며 스탯 계산
  for (const b in base) {
    // base[b], stats[b]가 숫자인지 확인
    if (typeof base[b] !== "number" || typeof stats[b] !== "number") {
      return;
    }
    // res[b] 초기화
    res[b] = {};

    if (b == "h") {
      // 체력
      if (stats[b] <= calcH(base[b], lv, 0, 31)) {
        // rawStats이 계산된 스탯보다 작은 경우
        // 개체값은 0으로 설정 후 개체치 역산, 노력치 0
        res[b]["iv"] = calcRevH(stats[b], base[b], lv);
        res[b]["ev"] = 0;
      } else {
        // rawStats이 계산된 스탯보다 큰 경우
        // 개체값은 31으로 설정 후 노력치 역산, 개체치 31
        res[b]["ev"] = 4 * calcRevH(stats[b], base[b], lv, 31);
        res[b]["iv"] = 31;
      }
    } else {
      // 체력 이외의 스탯
      if (stats[b] <= calcABCDS(base[b], lv, 0, 31, affect[b])) {
        // rawStats이 계산된 스탯보다 작은 경우
        // 개체값은 0으로 설정 후 개체치 역산, 노력치 0
        res[b]["iv"] = calcRevABCDS(stats[b], base[b], lv, affect[b]);
        res[b]["ev"] = 0;
      } else {
        // rawStats이 계산된 스탯보다 큰 경우
        // 개체값은 31으로 설정 후 노력치 역산, 개체치 31
        res[b]["ev"] = 4 * calcRevABCDS(stats[b], base[b], lv, affect[b], 31);
        res[b]["iv"] = 31;
      }
    }
    // 노력치의 합계 계산
    totalev += res[b]["ev"];

    // 한 스탯의 노력치가 255를 넘는 경우
    if (res[b]["ev"] > 255) {
      message = "not exist pokemon";
    }
  }

  // 노력치의 합계가 510을 넘는 경우 메시지 변경
  if (totalev > 510 && message == "success") {
    message = "ev > 510";
  }

  return { message: message, stats: res };
}

/*
 * @param {object} base
 * @param {number} lv
 * @param {string} nature
 * @return {object} {
 * h: { min: number, max: number },
 * a: { min: number, max: number },
 * b: { min: number, max: number },
 * c: { min: number, max: number },
 * d: { min: number, max: number },
 * s: { min: number, max: number } }
 * 최소, 최대 스탯 계산, 3세대 이상의 계산식
 */
export function calcStatsMinMax(base, lv, nature = "Serious") {
  // 성격이 없는 경우 무보정 성격으로 설정
  const correctNature = PokeNaturesIndex[nature] ? nature : "Serious";
  let res = {};

  const affect = calcNature(correctNature);
  for (const b in base) {
    // base[b], lv 유효성 검사
    if (
      typeof base[b] !== "number" ||
      base[b] < 0 ||
      typeof lv !== "number" ||
      lv < 1
    ) {
      return;
    }

    // baseStats object 속성을 순회하며 스탯 계산
    res[b] = {};
    if (b == "h") {
      // 체력
      res[b]["min"] = calcH(base[b], lv, 0, 0);
      res[b]["max"] = calcH(base[b], lv, 252, 31);
    } else {
      // 체력 이외의 스탯
      res[b]["min"] = calcABCDS(base[b], lv, 0, 0, affect[b]);
      res[b]["max"] = calcABCDS(base[b], lv, 252, 31, affect[b]);
    }
  }

  return res;
}

/*
 * @param {object} ivs
 * @return {number} res
 * 1세대, 2세대의 HIv 계산식
 */
export function calcHIvGen1(ivs) {
  let res = 0;
  // const stats = ["s", "c", "b", "a"];
  const stats = {
    s: 0,
    c: 1,
    b: 2,
    a: 3,
  };

  for (const b in ivs) {
    res[b] = {};
    if (b != "h" && b != "d") {
      const squared = stats[b];
      ivs[b] % 2 == 1 && (res += Math.pow(2, squared));
    }
  }

  return res;
}
