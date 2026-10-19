import type { BirthInput } from './fortune'
const stems = [...'甲乙丙丁戊己庚辛壬癸']
const branches = [...'子丑寅卯辰巳午未申酉戌亥']
const sihua = [
  ['廉贞','破军','武曲','太阳'],['天机','天梁','紫微','太阴'],['天同','天机','文昌','廉贞'],
  ['太阴','天同','天机','巨门'],['贪狼','太阴','右弼','天机'],['武曲','贪狼','天梁','文曲'],
  ['太阳','武曲','太阴','天同'],['巨门','太阳','文曲','文昌'],['天梁','紫微','左辅','武曲'],['破军','巨门','太阴','贪狼'],
]
const sha = new Set(['擎羊','陀罗','火星','铃星','地空','地劫','天空','旬空','截路','大耗','天使','天伤'])
const lucky = new Set(['文昌','文曲','左辅','右弼','天魁','天钺','禄存','天马','天官','天福','天才','天寿','三台','八座','恩光','天贵','台辅','龙池','凤阁','红鸾','天喜','孤辰','寡宿'])
export function toMlssChart(astrolabe: any, input: BirthInput) {
  const age = new Date().getFullYear() - input.year
  const palaces = astrolabe.palaces.map((p: any) => ({
    branch: branches.indexOf(p.earthlyBranch), stem: stems.indexOf(p.heavenlyStem), name: p.name,
    stars: [...(p.majorStars || []).map((s: any) => ({name:s.name,type:'major',
      brightness:['庙','旺'].includes(s.brightness)?'bright':['陷','不'].includes(s.brightness)?'dim':'normal',siHua:s.mutagen})),
      ...(p.minorStars || []).map((s: any) => ({name:s.name,type:sha.has(s.name)?'sha':lucky.has(s.name)?'lucky':'minor',siHua:s.mutagen})),
      ...(p.adjectiveStars || []).map((s: any) => ({name:s.name,type:'minor',siHua:s.mutagen}))],
    daXianAge:p.decadal?.range, isMingGong:p.name==='命宫',isShenGong:!!p.isBodyPalace,
    isCurrentDaXian:p.decadal?.range && age>=p.decadal.range[0] && age<=p.decadal.range[1],
  }))
  const stem = stems.indexOf(astrolabe.chineseDate[0])
  const values = sihua[stem]
  return {birthInfo:{...input,hour:Math.floor((input.hour+1)/2)%12},palaces,
    mingGongBranch:branches.indexOf(astrolabe.earthlyBranchOfSoulPalace),
    shenGongBranch:branches.indexOf(astrolabe.earthlyBranchOfBodyPalace),
    wuxingJuName:astrolabe.fiveElementsClass,
    ziweiPos:palaces.find((p:any)=>p.stars.some((s:any)=>s.name==='紫微'))?.branch,
    currentAge:age, nianGanSiHua:{stemIndex:stem,stemName:stems[stem],lu:values[0],quan:values[1],ke:values[2],ji:values[3]},
  }
}
