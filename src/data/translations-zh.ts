// Reviewed Simplified Chinese translations of each approved corpus chunk
// (src/data/corpus.ts), keyed by chunk id. Used in demo/offline mode so the
// Translate button reflects the *actual* content just explained, instead of
// a generic placeholder. Terminology (力矩/支点/顺时针/逆时针/牛顿·米) follows
// Cambridge/IB Chinese-medium physics usage — the same register as HK/SG
// international-school materials, which is slightly different phrasing from
// mainland PRC textbooks (which more often use 杠杆平衡条件/动力臂/阻力臂 for
// levers). Worth a native-speaker sign-off before this goes to real students.
export const ZH_TRANSLATIONS: Record<string, string> = {
  // Previously this mixed two Chinese terms for "pivot" (支点 / 转动点) in one
  // sentence — grammatically valid but ambiguous, and exactly the kind of
  // construction that garbles on back-translation. Fixed to use 支点
  // consistently throughout (matching the GLOSSARY entry for "pivot"), and
  // to mirror each English sentence 1:1 instead of merging clauses.
  "m-def":
    "力的转动效应叫做力矩。力矩的大小取决于所施加的力，以及这个力到支点的距离。" +
    "力矩 = 力 × 到支点的垂直距离。力的单位是牛顿（N），距离的单位是米（m），所以力矩的单位是牛顿·米（Nm）。",
  "m-principle":
    "力矩原理指出：当物体处于平衡状态时，绕支点的顺时针力矩总和，等于绕同一支点的逆时针力矩总和。",
  "m-seesaw":
    "拉姆（Ram）的体重是200牛顿，坐在跷跷板支点左侧1.5米处。西亚姆（Shyam）坐在支点右侧1.0米处。" +
    "要使跷跷板保持平衡，顺时针力矩必须等于逆时针力矩：F₁×d₁ = F₂×d₂。" +
    "所以 200×1.5 = F₂×1.0，解得 F₂ = 300。西亚姆的体重是300牛顿。",
  "m-rearrange":
    "已知力矩为42牛顿·米，力到支点的距离为7厘米，求这个力的大小。公式：力矩 = 力 × 距离，所以 力 = 力矩 ÷ 距离。" +
    "力矩 = 42牛顿·米，距离 = 7厘米 = 0.07米，力 = 42 ÷ 0.07 = 600牛顿。注意：计算前一定要先把距离换算成米。",
  "m-net":
    "当有多个力同时作用时，净力矩等于同方向力矩相加，减去相反方向的力矩。" +
    "例如：(1米×6牛顿) − (2米×3牛顿) = 0牛顿·米，横梁保持平衡。" +
    "又如：(2米×4牛顿) − (1米×6牛顿) = 2牛顿·米，方向为逆时针。",
  "m-ws7-lever":
    "一个70牛顿的力使杠杆绕支点P转动，力到支点P的距离是0.4米。力矩 = 70 × 0.4 = 28牛顿·米，方向为顺时针。" +
    "作答时务必写出公式、计算过程、单位（牛顿·米）和方向（顺时针或逆时针）。",
  "m-ws7-rock":
    "人产生的力矩 = 600 × 0.5 = 300牛顿·米，方向为逆时针。石头产生的力矩 = 1800 × 0.2 = 360牛顿·米，方向为顺时针。" +
    "人产生的力矩比石头小，所以逆时针力矩总和小于顺时针力矩总和（杠杆没有保持平衡）。",
};
