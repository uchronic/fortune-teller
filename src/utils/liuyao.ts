// 京房八宫、纳甲与六亲；爻的数组顺序始终为初爻至上爻。
const gua=['坤','震','坎','兑','艮','离','巽','乾']
const elements:Record<string,string>={坤:'土',震:'木',坎:'水',兑:'金',艮:'土',离:'火',巽:'木',乾:'金'}
const branches:Record<string,string>={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'}
const najia:Record<string,[string,string,string,string]>={乾:['甲','子寅辰','壬','午申戌'],坤:['乙','未巳卯','癸','丑亥酉'],震:['庚','子寅辰','庚','午申戌'],巽:['辛','丑亥酉','辛','未巳卯'],坎:['戊','寅辰午','戊','申戌子'],离:['己','卯丑亥','己','酉未巳'],艮:['丙','辰午申','丙','戌子寅'],兑:['丁','巳卯丑','丁','亥酉未']}
const birth:Record<string,string>={木:'火',火:'土',土:'金',金:'水',水:'木'}, control:Record<string,string>={木:'土',土:'水',水:'火',火:'金',金:'木'}
export function palaceFor(bits:number) {
  const masks=[0,1,3,7,15,31,23,16], worlds=[6,1,2,3,4,5,4,3]
  for(let g=0;g<8;g++)for(let index=0;index<8;index++)if(((g|(g<<3))^masks[index])===bits)return {name:gua[g],world:worlds[index],generation:['本宫','一世','二世','三世','四世','五世','游魂','归魂'][index]}
  throw new Error('无效卦象')
}
export function arrangeLiuyao(lines:number[],dayGan:string) {
  if(lines.length!==6||lines.some(n=>![6,7,8,9].includes(n)))throw new Error('需要六个有效爻值')
  const bits=lines.reduce((total,n,i)=>total|((n%2)<<i),0), palace=palaceFor(bits), home=elements[palace.name]
  const gods=['青龙','朱雀','勾陈','腾蛇','白虎','玄武'], godStart:Record<string,number>={甲:0,乙:0,丙:1,丁:1,戊:2,己:3,庚:4,辛:4,壬:5,癸:5}
  const rows=lines.map((value,index)=>{
    const triple=gua[index<3?(bits&7):(bits>>3)], entry=najia[triple], branch=entry[index<3?1:3][index%3], wx=branches[branch]
    const kin=wx===home?'兄弟':birth[wx]===home?'父母':birth[home]===wx?'子孙':control[home]===wx?'妻财':'官鬼'
    return {value,stem:entry[index<3?0:2],branch,element:wx,kin,god:gods[((godStart[dayGan]??0)+index)%6],world:index+1===palace.world,response:index+1===(palace.world<=3?palace.world+3:palace.world-3)}
  })
  return {palace,rows}
}
