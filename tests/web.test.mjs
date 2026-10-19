import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
async function moduleFrom(file) {
  const source=stripTypeScriptTypes(readFileSync(new URL(file,import.meta.url),'utf8'));
  return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
const {arrangeLiuyao,palaceFor}=await moduleFrom('../src/utils/liuyao.ts');
const {toMlssChart}=await moduleFrom('../src/utils/ziwei-adapter.ts');
test('all 64 hexagrams belong to one palace with valid world and response',()=>{
  for(let bits=0;bits<64;bits++) {
    const p=palaceFor(bits);assert.ok(p.world>=1&&p.world<=6);
    const r=arrangeLiuyao(Array.from({length:6},(_,i)=>bits&(1<<i)?7:8),'甲');
    assert.equal(r.rows.filter(r=>r.world).length,1);assert.equal(r.rows.filter(r=>r.response).length,1);
  }
});
test('pure Qian na-jia and six spirits',()=>{
  const r=arrangeLiuyao([7,7,7,7,7,7],'甲');
  assert.deepEqual(r.rows.map(r=>r.stem+r.branch),['甲子','甲寅','甲辰','壬午','壬申','壬戌']);
  assert.deepEqual(r.rows.map(r=>r.god),['青龙','朱雀','勾陈','腾蛇','白虎','玄武']);
  assert.equal(r.rows[5].world,true);assert.equal(r.rows[2].response,true);
});
test('year mutagens use birth year stem, never first palace stem',()=>{
  const p={name:'命宫',earthlyBranch:'申',heavenlyStem:'戊',majorStars:[{name:'紫微',brightness:'庙'}],minorStars:[],adjectiveStars:[],decadal:{range:[3,12]}};
  const r=toMlssChart({chineseDate:'庚午 戊寅 庚戌 壬午',palaces:[p],earthlyBranchOfSoulPalace:'申',earthlyBranchOfBodyPalace:'戌',fiveElementsClass:'水二局'},{year:1990,month:2,day:14,hour:12,gender:'male'});
  assert.equal(r.nianGanSiHua.stemName,'庚');assert.equal(r.nianGanSiHua.lu,'太阳');assert.equal(r.nianGanSiHua.ji,'天同');
});
