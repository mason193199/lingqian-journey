export const BUILD_GUIDES=[
 {name:'雷電連鎖',core:'桃木劍＋金雷＋震',relic:'雷公令',effect:'第三擊落雷與受限額外跳躍',weakness:'需要近身；落雷不是無限連鎖'},
 {name:'火焰爆炸',core:'靈符＋火＋離',relic:'朱砂印',effect:'分裂疊燃，滿層符爆與四向散符',weakness:'需累積命中；移動單體不總吃滿'},
 {name:'冰凍控制',core:'靈杖＋水＋坎',relic:'玄冰玉',effect:'冰陣累積凍結，凍死碎冰追擊',weakness:'耗靈力、短蓄力；Boss有抗控'},
 {name:'撞牆擊退',core:'桃木劍／青嶽',relic:'桃木印',effect:'撞牆震波破甲；配雷劍可雷爆',weakness:'要把敵人引到邊界，中央較弱'},
 {name:'召喚靈獸',core:'白璃＋百靈朝命',relic:'招靈鈴',effect:'有限靈獸集火齊射',weakness:'總數三隻、存在時間有限'},
 {name:'暴擊追影',core:'桃木劍＋乾卦',relic:'陰陽玉',effect:'有效暴擊後三秒內衝刺追加破甲影斬',weakness:'需暴擊與閃避時機；不與震卦雷劍共存'},
 {name:'中毒持續',core:'木行＋紅綾／靈符',relic:'五帝錢',effect:'中毒敵人死亡向兩名鄰敵傳毒',weakness:'三層上限；Boss抵抗持續傷害'},
 {name:'護盾反擊',core:'玄墨＋震山印',relic:'陰陽玉',effect:'護盾消失時破甲震退',weakness:'要管理煞氣／護盾；觸發有冷卻'}
];
export function buildGuideMarkup(){return `<details class="build-guide"><summary>八種流派 · 配方、強項與代價</summary><div class="build-guide-grid">${BUILD_GUIDES.map(v=>`<article><h3>${v.name}</h3><p>${v.core} · ${v.relic}</p><p>${v.effect}</p><small>${v.weakness}</small></article>`).join('')}</div><p>普通命籤只定五行；祭壇每次只調整一項。選祭壇會放棄同層法器、恢復或事件。</p></details>`;}
