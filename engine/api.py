"""JSON interface shared by the browser worker and native regression tests."""
import datetime
import json
from pathlib import Path
import sys
from functools import lru_cache

ROOT = Path(__file__).parent
for folder in ['mlss', 'qimen']:
    sys.path.insert(0, str(ROOT/folder))
import ephem_compat
sys.modules['ephem'] = ephem_compat
import jieqi
# A single chart repeatedly asks for the same solar terms and pillars.
# These functions are read-only to their callers; bound the cross-chart cache.
for _name in ['get_jieqi_start_date','get_before_jieqi_start_date','get_next_jieqi_start_date','jq','gangzhi','gangzhi1','lunar_date_d']:
    setattr(jieqi, _name, lru_cache(maxsize=128)(getattr(jieqi,_name)))
from lunar_python import Solar, Lunar
from wuxing_quantify import wuxing_strength_score
from chenggu import chenggu_from_birthdate
from meihua_shichen_qigua import qigua

def solar_for(data):
    year, month, day, hour, minute = [int(data.get(k, 0)) for k in ['year','month','day','hour','minute']]
    if not 1900 <= year <= 2100 or not 0 <= hour <= 23 or not 0 <= minute <= 59:
        raise ValueError('请输入 1900–2100 年之间的日期和有效时分')
    if data.get('calendar') == 'lunar':
        return Lunar.fromYmdHms(year, -month if data.get('leapMonth') else month, day, hour, minute, 0).getSolar()
    datetime.datetime(year, month, day, hour, minute)
    return Solar.fromYmdHms(year, month, day, hour, minute, 0)

def birth(data):
    solar = solar_for(data)
    lunar = solar.getLunar()
    ec = lunar.getEightChar()
    ec.setSect(int(data.get('sect', 2)))
    names = ['Year','Month','Day','Time']
    columns = []
    for name in names:
        call = lambda suffix: getattr(ec, 'get'+name+suffix)()
        columns.append({'ganzhi':call(''), 'nayin':call('NaYin'), 'hidden':call('HideGan'),
                        'shishen':call('ShiShenGan'), 'hiddenShishen':call('ShiShenZhi'),
                        'stage':call('DiShi'), 'kongwang':call('XunKong')})
    pillars = [p['ganzhi'] for p in columns]
    yun = ec.getYun(1 if data.get('gender') == 'male' else 0)
    return {'pillars':columns, 'lunar':lunar.toString(), 'solar':solar.toYmdHms(),
            'effectiveInput':{'year':solar.getYear(),'month':solar.getMonth(),'day':solar.getDay(),
                              'hour':solar.getHour(),'minute':solar.getMinute(),'gender':data.get('gender','male')},
            'wuxing':wuxing_strength_score(pillars, pillars[1][1]),
            'minggong':ec.getMingGong(), 'shengong':ec.getShenGong(), 'taiyuan':ec.getTaiYuan(),
            'yun':{'years':yun.getStartYear(),'months':yun.getStartMonth(),'days':yun.getStartDay(),
                   'forward':yun.isForward(),'startDate':yun.getStartSolar().toYmd(),
                   'cycles':[{'ganzhi':d.getGanZhi(),'startAge':d.getStartAge(),'endAge':d.getEndAge(),
                              'startYear':d.getStartYear(),'endYear':d.getEndYear()}
                             for d in yun.getDaYun() if d.getGanZhi()]},
            'chenggu':chenggu_from_birthdate(solar.getYear(),solar.getMonth(),solar.getDay(),solar.getHour(),solar.getMinute())}

def calendar(data):
    lunar = solar_for(data).getLunar()
    times = []
    for time in lunar.getTimes():
        times.append({'ganzhi':time.getGanZhi(),'range':time.getMinHm()+'–'+time.getMaxHm(),
                      'god':time.getTianShen(),'luck':time.getTianShenLuck(),
                      'yi':time.getYi(),'ji':time.getJi(),'chong':time.getChongDesc()})
    return {'lunar':lunar.toString(),'ganzhi':lunar.getYearInGanZhiExact()+' '+lunar.getMonthInGanZhiExact()+' '+lunar.getDayInGanZhi(),
            'yi':lunar.getDayYi(),'ji':lunar.getDayJi(),'chong':lunar.getDayChongDesc(),
            'sha':lunar.getDaySha(),'times':times}

def ziwei(data):
    from patterns_bridge import detect_patterns
    from heming_bridge import get_heming_knowledge
    chart = data['chart']
    spouse = next((p for p in chart['palaces'] if p['name'].replace('宫','') == '夫妻'), {})
    spouse_notes = [{'star':s['name'],'knowledge':get_heming_knowledge(s['name'])}
                    for s in spouse.get('stars',[]) if s['type']=='major' and get_heming_knowledge(s['name'])]
    return {'patterns':detect_patterns(chart),'spouse':spouse_notes}

def classics(data):
    from classics_bridge import search_classics, ALL_BOOKS, get_total_paragraphs
    query = str(data.get('query','')).strip()[:100]
    return {'books':[{'title':b.get('title',b.get('name','')),'slug':b.get('slug','')} for b in ALL_BOOKS],
            'total':get_total_paragraphs(),'hits':search_classics(query, 15) if query else []}

def compatibility(data):
    a, b = birth(data['a']), birth(data['b'])
    ga, gb = a['pillars'][2]['ganzhi'], b['pillars'][2]['ganzhi']
    elements = dict(zip('甲乙丙丁戊己庚辛壬癸','木木火火土土金金水水'))
    production = dict(zip('木火土金水','火土金水木'))
    control = dict(zip('木土水火金','土水火金木'))
    wa, wb = elements[ga[0]], elements[gb[0]]
    relation = '五行相同' if wa==wb else ('甲方生乙方' if production[wa]==wb else '乙方生甲方' if production[wb]==wa else '甲方克乙方' if control[wa]==wb else '乙方克甲方')
    pair = set([ga[1],gb[1]])
    he = ['子丑','寅亥','卯戌','辰酉','巳申','午未']
    chong = ['子午','丑未','寅申','卯酉','辰戌','巳亥']
    day_relation = '六合' if any(pair==set(p) for p in he) else '六冲' if any(pair==set(p) for p in chong) else '不构成六合或六冲'
    return {'a':a,'b':b,'dayStems':[ga,gb],'elements':[wa,wb],'relation':relation,'dayRelation':day_relation,
            'notes':['比较双方五行分布、日干关系与日支关系，再结合各自大运看阶段差异。',
                     '合盘展示传统命理中的关系结构，不以单一生肖或分数替代对具体相处的判断。']}

def dispatch(action, data):
    if action=='birth': return birth(data)
    if action=='calendar': return calendar(data)
    if action=='ziwei': return ziwei(data)
    if action=='classics': return classics(data)
    if action=='compatibility': return compatibility(data)
    if action=='meihua':
        s=solar_for(data)
        return qigua(s.getYear(),s.getMonth(),s.getDay(),s.getHour(),s.getMinute())
    if action=='qimen':
        import kinqimen
        s=solar_for(data)
        return kinqimen.Qimen(s.getYear(),s.getMonth(),s.getDay(),s.getHour(),s.getMinute()).pan(1)
    raise ValueError('未知的计算项目')

def handle_json(action, payload):
    return json.dumps(dispatch(action, json.loads(payload)), ensure_ascii=False, default=str)
