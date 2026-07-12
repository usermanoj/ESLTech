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

  // Distance-Time Graphs — terminology kept consistent throughout: 距离-时间图
  // (distance-time graph), x轴/y轴 (x-/y-axis), 静止 (stationary), 斜率
  // (gradient), 匀速 (steady/uniform speed).
  "dt-def":
    "匀速指物体在每一段相等的时间内移动相等的距离。例如，10米/秒的匀速表示汽车每秒钟移动10米。",
  "dt-axes":
    "在距离-时间图中，时间是自变量，画在x轴（横轴）上。距离是因变量——它随时间变化——画在y轴（纵轴）上。" +
    "画图前，必须为每条轴选定并写出比例尺（例如，x轴 1厘米 = 1秒，y轴 1厘米 = 10米），并清楚标注两条轴。",
  "dt-stationary":
    "静止（不移动）物体的距离-时间图是一条与x轴平行的水平线，因为它离参考点的距离不会随时间改变。" +
    "例如，一辆停在离路灯50米处的汽车，从0秒到5秒，距离始终保持在50米。",
  "dt-uniform-table":
    "以10米/秒匀速运动的物体，距离每秒增加10米：时间（秒）：0, 1, 2, 3, 4, 5 → 距离（米）：0, 10, 20, 30, 40, 50。" +
    "任意两点之间的速度都用同样的方法计算：(10−0)米 / (1−0)秒 = 10米/秒，(20−10)米 / (2−1)秒 = 10米/秒。",
  "dt-gradient":
    "距离-时间图的斜率代表物体的速度。线越陡，速度越快；线越平（水平线）表示物体静止。",
  "dt-gradient-example":
    "要计算距离-时间图上A、B两点之间的斜率（速度）：斜率 = (y2 − y1) / (x2 − x1)。" +
    "若距离从50米变为150米，时间从1秒变为3秒：斜率 = (150 − 50)米 / (3 − 1)秒 = 100 / 2 = 50米/秒。" +
    "距离-时间图的斜率代表运动物体的速度。",
  "dt-journey":
    "任务：为以下行程画出距离-时间图——我用10秒走了5米，停下休息10秒，然后又用5秒走了5米。" +
    "第一段和最后一段是斜线（表示移动），中间一段是水平线（表示静止休息）。",
  "dt-ws2-cyclist":
    "一名工人骑自行车从家到工厂，距离200米，用时1分40秒（100秒）。速度 = 距离 / 时间 = 200 / 100 = 2米/秒。",
};
