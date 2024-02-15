"use client";
import { Pokemon, Generations } from "@smogon/calc";
import React, { useState, useEffect } from "react";

const gens = Generations.get(2);
const pokemon = new Pokemon(gens, "Abra", {
  level: 100,
  gender: "F",
  ivs: { atk: 31, def: 31 },
});
console.log(pokemon);

const natures = [
  "Hardy",
  "Lonely",
  "Adamant",
  "Naughty",
  "Brave",
  "Bold",
  "Docile",
  "Impish",
  "Lax",
  "Relaxed",
  "Modest",
  "Mild",
  "Bashful",
  "Rash",
  "Quiet",
  "Calm",
  "Gentle",
  "Careful",
  "Quirky",
  "Sassy",
  "Timid",
  "Hasty",
  "Jolly",
  "Naive",
  "Serious",
];

function calcNature(nature) {
  const stats = ["a", "b", "c", "d", "s"];
  let res = { a: 1, b: 1, c: 1, d: 1, s: 1 };
  const index = natures.findIndex((element) => element == nature);
  Math.floor(index / 5) != index % 5 &&
    ((res[stats[Math.floor(index / 5)]] = 1.1), (res[stats[index % 5]] = 0.9));
  return res;
}

function calcH(base, lv, ev, iv) {
  return Math.floor(((2 * base + iv + ev / 4 + 100) * lv) / 100 + 10);
}

function calcABCDS(base, lv, ev, iv, a) {
  return Math.floor((((2 * base + iv + ev / 4) * lv) / 100 + 5) * a);
}

function calcRevH(stats, base, lv, iv = 0) {
  iv = ((stats - 10) * 100) / lv - 100 - iv - 2 * base;
  return iv > 0 ? iv : 0;
}

function calcRevABCDS(stats, base, lv, a, iv = 0) {
  iv = Math.ceil(((stats / a - 5) / lv) * 100 - iv - 2 * base);
  return iv > 0 ? iv : 0;
}

function calcEIv(stats, base, lv, nature) {
  let res = {};
  let totalev = 0;
  let message = "success";

  const affect = calcNature(nature);
  for (const b in base) {
    res[b] = {};
    if (b == "h") {
      if (stats[b] <= calcH(base[b], lv, 0, 31)) {
        res[b]["iv"] = calcRevH(stats[b], base[b], lv);
        res[b]["ev"] = 0;
      } else {
        res[b]["ev"] = 4 * calcRevH(stats[b], base[b], lv, 31);
        res[b]["iv"] = 31;
      }
    } else {
      if (stats[b] <= calcABCDS(base[b], lv, 0, 31, affect[b])) {
        res[b]["iv"] = calcRevABCDS(stats[b], base[b], lv, affect[b]);
        res[b]["ev"] = 0;
      } else {
        res[b]["ev"] = 4 * calcRevABCDS(stats[b], base[b], lv, affect[b], 31);
        res[b]["iv"] = 31;
      }
    }
    totalev += res[b]["ev"];
    if (res[b]["ev"] > 255) {
      message = "not exist pokemon";
    }
  }

  if (totalev > 510 && message == "success") {
    message = "ev > 510";
  }

  return { message: message, stats: res };
}

function calcStatsMinMax(base, lv, nature) {
  let res = {};
  const affect = calcNature(nature);
  for (const b in base) {
    res[b] = {};
    if (b == "h") {
      res[b]["min"] = calcH(base[b], lv, 0, 0);
      res[b]["max"] = calcH(base[b], lv, 252, 31);
    } else {
      res[b]["min"] = calcABCDS(base[b], lv, 0, 0, affect[b]);
      res[b]["max"] = calcABCDS(base[b], lv, 252, 31, affect[b]);
    }
  }

  return res;
}

function calcHIvGen1(ivs) {
  let res = 0;
  const stats = ["s", "c", "b", "a"];

  for (const b in ivs) {
    res[b] = {};
    if (b != "h" && b != "d") {
      const squared = stats.findIndex((element) => element == b);
      ivs[b] % 2 == 1 && (res += Math.pow(2, squared));
    }
  }

  return res;
}

const YourComponent = () => {
  const [gen, setGen] = useState(9);
  const [lv, setLevel] = useState(50);
  const [eiv, setInput1] = useState({
    h: {
      ev: 252,
      iv: 31,
    },
    a: {
      iv: 0,
      ev: 0,
    },
    b: {
      iv: 0,
      ev: 0,
    },
    c: {
      iv: 0,
      ev: 0,
    },
    d: {
      iv: 0,
      ev: 0,
    },
    s: {
      iv: 0,
      ev: 0,
    },
  });
  const [nature, setNature] = useState("Adamant");
  const [stats, setInput2] = useState({
    h: 100,
    a: 135,
    b: 115,
    c: 85,
    d: 100,
    s: 135,
  });
  const [base, setBase] = useState({
    h: 100,
    a: 135,
    b: 115,
    c: 85,
    d: 100,
    s: 135,
  });

  const [statsMinMax, setMinMax] = useState(
    calcStatsMinMax(base, lv, gen < 3 ? "" : nature)
  );

  useEffect(() => {
    function1();
  }, [eiv, lv, nature, base]);

  const function1 = () => {
    let stats_res = { ...stats };
    const bases = ["h", "a", "b", "c", "d", "s"];
    // 1,2세대인 경우 성격 삭제
    const affect = calcNature(gen < 3 ? "" : nature);
    for (let b of bases) {
      if (b == "h") {
        stats_res[b] = calcH(base[b], lv, eiv[b].ev, eiv[b].iv);
      } else {
        stats_res[b] = calcABCDS(base[b], lv, eiv[b].ev, eiv[b].iv, affect[b]);
      }
    }
    setInput2(stats_res);
  };

  const handleInputChangeEIv = (event) => {
    const id = event.target.id.split("/");
    const min = 0;
    const max = id[1] === "iv" ? 31 : 255;
    let value = parseInt(event.target.value, 10);
    let res = { ...eiv };

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    } else {
    }
    res[id[0]][id[1]] = value;
    setInput1(res);
  };

  const handleInputChange2 = (event) => {
    const id = event.target.id;
    let value = parseInt(event.target.value, 10);
    let res = { ...stats };
    res[id] = parseInt(value, 10);
    setInput2(res);
  };

  const handleInputChangeBase = (event) => {
    const id = event.target.id;
    let value = parseInt(event.target.value, 10);
    let res = { ...base };
    if (value < 0) {
      value = 0;
    }
    res[id] = value;

    setBase(res);
  };

  const handleInputChange = (event) => {
    const id = event.target.id;
    let value = parseInt(event.target.value, 10);
    const min = parseInt(event.target.min, 10);
    const max = parseInt(event.target.max, 10);
    let res = { ...stats };
    if (value < min) {
      res[id] = parseInt(min, 10);
    } else if (value > max) {
      res[id] = parseInt(max, 10);
    } else {
      res[id] = parseInt(value, 10);
    }
    setInput2(res);
    setInput1(calcEIv(res, base, lv, gen < 3 ? "" : nature).stats);
  };

  const handleInputChangeNature = (event) => {
    setNature(event.target.value);
    const minmax = calcStatsMinMax(base, lv, gen < 3 ? "" : event.target.value);
    setMinMax(minmax);
  };

  const handleInputChangelv = (event) => {
    let level = event.target.value;
    if (level > 100) {
      level = 100;
    } else if (level < 1) {
      level = 1;
    }
    setLevel(level);
    const minmax = calcStatsMinMax(base, level, gen < 3 ? "" : nature);
    setMinMax(minmax);
  };

  const handleInputChangeGen = (event) => {
    setGen(parseInt(event.target.value, 10));
  };

  return (
    <div className="m-auto flex min-h-screen flex-col  space-y-2 text-sm">
      <div className=" mx-auto flex min-h-16 min-w-16 flex-col bg-gray-400 text-sm">
        <div className="m-auto space-x-6 text-sm">
          GEN
          <input
            type="number"
            value={gen}
            min="1"
            max="9"
            onChange={handleInputChangeGen}
          />
        </div>
      </div>
      <div className="mx-auto flex min-h-96  flex-col bg-gray-400 text-sm">
        <ui>
          - 1,2세대 선택 시 input 변경 시키기
          <li>1세대면 HABCS, 2세대면 HABCDS 출력하기</li>
          <li>iv(dv) 계산 적용하기</li>
          <li>2세대 C,D의 iv(dv),ev(exp) 값 연동할 수 있게 하기</li>
        </ui>
        <p>- 1,2세대 능력치 계산/ 역산</p>
        <p>-이벤트 핸들러, 함수명 좀 이쁘게</p>
        <ui>
          - useState 개선.{" "}
          <li>
            현재는 eiv, base, state 분리되어있지만 smogon calc에서 사용할 수
            있는 형태로 묶어야 할 듯
          </li>
          <li>6개의 슬롯을 동시에 관리 가능하게</li>
        </ui>

        <div className="m-auto space-x-6 text-sm">
          base
          <input
            type="number"
            id="h"
            value={base.h}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="a"
            value={base.a}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="b"
            value={base.b}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="c"
            value={base.c}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="d"
            value={base.d}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="s"
            value={base.s}
            min="0"
            onChange={handleInputChangeBase}
          />
        </div>
        <div className="m-auto text-sm">
          lv
          <input
            type="number"
            id="LV"
            min="1"
            max="100"
            placeholder="LV"
            value={lv}
            onChange={handleInputChangelv}
          />
          Nature
          <select value={nature} onChange={handleInputChangeNature}>
            <option value="">Choose an option</option>
            {natures.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="m-auto space-x-6 text-sm">
          stats
          <input
            type="number"
            id="h"
            value={stats.h}
            min={statsMinMax.h.min}
            max={statsMinMax.h.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="a"
            value={stats.a}
            min={statsMinMax.a.min}
            max={statsMinMax.a.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="b"
            value={stats.b}
            min={statsMinMax.b.min}
            max={statsMinMax.b.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="c"
            value={stats.c}
            min={statsMinMax.c.min}
            max={statsMinMax.c.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="d"
            value={stats.d}
            min={statsMinMax.d.min}
            max={statsMinMax.d.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="s"
            value={stats.s}
            min={statsMinMax.s.min}
            max={statsMinMax.s.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
        </div>
        <div className="m-auto space-x-6 text-sm">
          iv
          <input
            type="number"
            id="h/iv"
            value={eiv.h.iv}
            min="0"
            max="31"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="a/iv"
            value={eiv.a.iv}
            min="0"
            max="31"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="b/iv"
            value={eiv.b.iv}
            min="0"
            max="31"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="c/iv"
            value={eiv.c.iv}
            min="0"
            max="31"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="d/iv"
            value={eiv.d.iv}
            min="0"
            max="31"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="s/iv"
            value={eiv.s.iv}
            min="0"
            max="31"
            onChange={handleInputChangeEIv}
          />
        </div>
        <div className="m-auto space-x-6 text-sm">
          ev
          <input
            id="h/ev"
            type="number"
            value={eiv.h.ev}
            min="0"
            max="255"
            step="4"
            onChange={handleInputChangeEIv}
          />
          <input
            id="a/ev"
            type="number"
            value={eiv.a.ev}
            min="0"
            max="255"
            step="4"
            onChange={handleInputChangeEIv}
          />
          <input
            id="b/ev"
            type="number"
            value={eiv.b.ev}
            min="0"
            max="255"
            step="4"
            onChange={handleInputChangeEIv}
          />
          <input
            id="c/ev"
            type="number"
            value={eiv.c.ev}
            min="0"
            max="255"
            step="4"
            onChange={handleInputChangeEIv}
          />
          <input
            id="d/ev"
            type="number"
            value={eiv.d.ev}
            min="0"
            max="255"
            step="4"
            onChange={handleInputChangeEIv}
          />
          <input
            id="s/ev"
            type="number"
            value={eiv.s.ev}
            min="0"
            max="255"
            step="4"
            onChange={handleInputChangeEIv}
          />
        </div>
      </div>
      <div className="mx-auto flex min-h-80  flex-col bg-gray-400 text-sm">
        <div className="m-auto space-x-6 text-sm">
          base
          <input
            type="number"
            id="h"
            value={base.h}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="a"
            value={base.a}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="b"
            value={base.b}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input
            type="number"
            id="c"
            value={base.c}
            min="0"
            onChange={handleInputChangeBase}
          />
          <input type="number" id="d" value={base.d} min="0" readOnly />
          <input
            type="number"
            id="s"
            value={base.s}
            min="0"
            onChange={handleInputChangeBase}
          />
        </div>
        <div className="m-auto text-sm">
          lv
          <input
            type="number"
            id="LV"
            min="1"
            max="100"
            placeholder="LV"
            value={lv}
            onChange={handleInputChangelv}
          />
        </div>
        <div className="m-auto space-x-6 text-sm">
          stats
          <input
            type="number"
            id="h"
            value={stats.h}
            min={statsMinMax.h.min}
            max={statsMinMax.h.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="a"
            value={stats.a}
            min={statsMinMax.a.min}
            max={statsMinMax.a.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="b"
            value={stats.b}
            min={statsMinMax.b.min}
            max={statsMinMax.b.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="c"
            value={stats.c}
            min={statsMinMax.c.min}
            max={statsMinMax.c.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="d"
            value={stats.d}
            min={statsMinMax.d.min}
            max={statsMinMax.d.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
          <input
            type="number"
            id="s"
            value={stats.s}
            min={statsMinMax.s.min}
            max={statsMinMax.s.max}
            onChange={handleInputChange2}
            onBlur={handleInputChange}
          />
        </div>
        <div className="m-auto space-x-6 text-sm">
          iv
          <input
            type="number"
            id="h/iv"
            value={eiv.h.iv}
            min="0"
            max="15"
            readOnly
          />
          <input
            type="number"
            id="a/iv"
            value={eiv.a.iv}
            min="0"
            max="15"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="b/iv"
            value={eiv.b.iv}
            min="0"
            max="15"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="c/iv"
            value={eiv.c.iv}
            min="0"
            max="15"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="d/iv"
            value={eiv.d.iv}
            min="0"
            max="15"
            onChange={handleInputChangeEIv}
          />
          <input
            type="number"
            id="s/iv"
            value={eiv.s.iv}
            min="0"
            max="15"
            onChange={handleInputChangeEIv}
          />
        </div>
        <div className="m-auto space-x-6 text-sm">
          ev
          <input
            id="h/ev"
            type="number"
            value={eiv.h.ev}
            min="0"
            max="65535"
            onChange={handleInputChangeEIv}
          />
          <input
            id="a/ev"
            type="number"
            value={eiv.a.ev}
            min="0"
            max="65535"
            onChange={handleInputChangeEIv}
          />
          <input
            id="b/ev"
            type="number"
            value={eiv.b.ev}
            min="0"
            max="65535"
            onChange={handleInputChangeEIv}
          />
          <input
            id="c/ev"
            type="number"
            value={eiv.c.ev}
            min="0"
            max="65535"
            onChange={handleInputChangeEIv}
          />
          <input
            id="d/ev"
            type="number"
            value={eiv.d.ev}
            min="0"
            max="65535"
            onChange={handleInputChangeEIv}
          />
          <input
            id="s/ev"
            type="number"
            value={eiv.s.ev}
            min="0"
            max="65535"
            onChange={handleInputChangeEIv}
          />
        </div>
      </div>
    </div>
  );
};

export default YourComponent;
