"use client";
import { Pokemon, Generations } from "@smogon/calc";
import React, { useState, useEffect } from "react";
import {
  calcStatsMinMax,
  calcNature,
  calcH,
  calcABCDS,
  calcEIv,
  transEIV,
  calcHIvGen1,
} from "@/app/utils/poke-calculate.js";
import { PokeNatures } from "../types/poke-natures";

const YourComponent = () => {
  const [gen, setGen] = useState(9);
  const [lv, setLevel] = useState(50);
  const [dvexp, setDvExp] = useState({
    h: {
      exp: 252,
      dv: 31,
    },
    a: {
      exp: 0,
      dv: 0,
    },
    b: {
      exp: 0,
      dv: 0,
    },
    c: {
      exp: 0,
      dv: 0,
    },
    d: {
      exp: 0,
      dv: 0,
    },
    s: {
      exp: 0,
      dv: 0,
    },
  });
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
    calcStatsMinMax(base, lv, nature, gen),
  );

  useEffect(() => {
    function1();
  }, [eiv, lv, nature, base, gen]);

  const function1 = () => {
    let stats_res = { ...stats };
    const bases = ["h", "a", "b", "c", "d", "s"];
    // 1,2세대인 경우 성격 삭제
    const affect = calcNature(nature);
    for (let b of bases) {
      if (b == "h") {
        stats_res[b] = calcH(base[b], lv, eiv[b].ev, eiv[b].iv);
      } else {
        stats_res[b] = calcABCDS(
          base[b],
          lv,
          eiv[b].ev,
          eiv[b].iv,
          affect[b],
          gen,
        );
      }
    }
    setInput2(stats_res);

    const minmax = calcStatsMinMax(base, lv, nature, gen);
    setMinMax(minmax);

    // temp

    const gens = Generations.get(gen);
    const pokemon = new Pokemon(9, "Koraidon", {
      level: lv,
      baseStats: {
        hp: base.h,
        atk: base.a,
        def: base.b,
        spa: base.c,
        spd: base.d,
        spe: base.s,
      },
      ivs: {
        hp: eiv.h.iv,
        atk: eiv.a.iv,
        def: eiv.b.iv,
        spa: eiv.c.iv,
        spd: eiv.d.iv,
        spe: eiv.s.iv,
      },
      evs: {
        hp: eiv.h.ev,
        atk: eiv.a.ev,
        def: eiv.b.ev,
        spa: eiv.c.ev,
        spd: eiv.d.ev,
        spe: eiv.s.ev,
      },
      nature: nature,
    });
    console.log(pokemon);
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
    const dvExp = transEIV(res, gen);
    setDvExp(dvExp);
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
    setInput1(calcEIv(res, base, lv, nature, gen).stats);
  };

  const handleInputChangeNature = (event) => {
    setNature(event.target.value);
    const minmax = calcStatsMinMax(base, lv, event.target.value, gen);
    setMinMax(minmax);
  };

  const handleInputChangelv = (event) => {
    let level = parseInt(event.target.value, 10);
    if (level > 100) {
      level = 100;
    } else if (level < 1) {
      level = 1;
    }
    setLevel(level);
  };

  const handleInputChangeDvExp = (event) => {
    const id = event.target.id.split("/");
    const min = 0;
    const max = id[1] === "dv" ? 15 : 65535;
    let value = parseInt(event.target.value, 10);
    let res = { ...dvexp };

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    } else {
    }
    res[id[0]][id[1]] = value;

    if (id[0] === "c") {
      res["d"][id[1]] = value;
    }

    res["h"]["dv"] = calcHIvGen1(res);
    const eiv = transEIV(res, gen);
    setInput1(eiv);
    setDvExp(res);
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
      {gen > 2 && (
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
              {PokeNatures.map((option, index) => (
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
      )}
      {gen < 3 && (
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
            {gen > 1 && (
              <input
                type="number"
                id="d"
                value={stats.d}
                min={statsMinMax.d.min}
                max={statsMinMax.d.max}
                onChange={handleInputChange2}
                onBlur={handleInputChange}
              />
            )}
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
              id="h/dv"
              value={dvexp.h.dv}
              min="0"
              max="15"
              readOnly
            />
            <input
              type="number"
              id="a/dv"
              value={dvexp.a.dv}
              min="0"
              max="15"
              onChange={handleInputChangeDvExp}
            />
            <input
              type="number"
              id="b/dv"
              value={dvexp.b.dv}
              min="0"
              max="15"
              onChange={handleInputChangeDvExp}
            />
            <input
              type="number"
              id="c/dv"
              value={dvexp.c.dv}
              min="0"
              max="15"
              onChange={handleInputChangeDvExp}
            />
            {gen > 1 && (
              <input
                type="number"
                id="d/dv"
                value={dvexp.d.dv}
                min="0"
                max="15"
                readOnly
              />
            )}
            <input
              type="number"
              id="s/dv"
              value={dvexp.s.dv}
              min="0"
              max="15"
              onChange={handleInputChangeDvExp}
            />
          </div>
          <div className="m-auto space-x-6 text-sm">
            ev
            <input
              id="h/exp"
              type="number"
              value={dvexp.h.exp}
              min="0"
              max="65535"
              onChange={handleInputChangeDvExp}
            />
            <input
              id="a/exp"
              type="number"
              value={dvexp.a.exp}
              min="0"
              max="65535"
              onChange={handleInputChangeDvExp}
            />
            <input
              id="b/exp"
              type="number"
              value={dvexp.b.exp}
              min="0"
              max="65535"
              onChange={handleInputChangeDvExp}
            />
            <input
              id="c/exp"
              type="number"
              value={dvexp.c.exp}
              min="0"
              max="65535"
              onChange={handleInputChangeDvExp}
            />
            {gen > 1 && (
              <input
                id="d/exp"
                type="number"
                value={dvexp.d.exp}
                min="0"
                max="65535"
                readOnly
              />
            )}
            <input
              id="s/exp"
              type="number"
              value={dvexp.s.exp}
              min="0"
              max="65535"
              onChange={handleInputChangeDvExp}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YourComponent;
