"""
紫微斗数格局检测引擎
基于倪海夏《天纪》体系 + TypeScript patterns.ts 完整移植
"""

from __future__ import annotations
from typing import Any

SHA_HARD = ['擎羊', '陀罗', '火星', '铃星']
SHA_KONG = ['地空', '地劫']
SHA_NAMES = SHA_HARD + SHA_KONG
ZUO_YOU = ['左辅', '右弼']
CHANG_QU = ['文昌', '文曲']
KUI_YUE = ['天魁', '天钺']
BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

# ─── 辅助函数 ───

def _get_stars(p: dict) -> list[dict]:
    return p.get('stars', [])

def _major_names(p: dict) -> list[str]:
    return [s['name'] for s in _get_stars(p) if s.get('type') == 'major']

def _has_star(p: dict, name: str) -> bool:
    return any(s['name'] == name for s in _get_stars(p))

def _find_star(p: dict, name: str) -> dict | None:
    for s in _get_stars(p):
        if s['name'] == name:
            return s
    return None

def _find_star_palace(chart: dict, name: str) -> dict | None:
    for p in chart['palaces']:
        if _has_star(p, name):
            return p
    return None

def _get_palace_by_branch(chart: dict, branch: int) -> dict | None:
    b = (branch % 12 + 12) % 12
    for p in chart['palaces']:
        if p['branch'] == b:
            return p
    return None

def _sha_count(p: dict, lst: list[str] | None = None) -> int:
    lst = lst or SHA_HARD
    return sum(1 for s in _get_stars(p) if s['name'] in lst)

def _has_sha(p: dict, lst: list[str] | None = None) -> bool:
    lst = lst or SHA_NAMES
    return any(s['name'] in lst for s in _get_stars(p))

def _san_fang_branches(m: int) -> list[int]:
    return [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12]

def _san_fang_palaces(chart: dict) -> list[dict]:
    m = chart['mingGongBranch']
    bset = set(_san_fang_branches(m))
    return [p for p in chart['palaces'] if p['branch'] in bset]

def _is_in_san_fang(chart: dict, branch: int) -> bool:
    return branch in _san_fang_branches(chart['mingGongBranch'])

def _san_fang_all_stars(chart: dict) -> set[str]:
    s = set()
    for p in _san_fang_palaces(chart):
        for star in _get_stars(p):
            s.add(star['name'])
    return s

def _san_fang_sha_count(chart: dict, lst: list[str] | None = None) -> int:
    lst = lst or SHA_HARD
    return sum(_sha_count(p, lst) for p in _san_fang_palaces(chart))

def _dui_gong(chart: dict, branch: int) -> dict | None:
    return _get_palace_by_branch(chart, (branch + 6) % 12)

def _jia_palaces(chart: dict, branch: int) -> dict:
    return {
        'prev': _get_palace_by_branch(chart, (branch + 11) % 12),
        'next': _get_palace_by_branch(chart, (branch + 1) % 12),
    }

def _is_bright(p: dict, name: str) -> bool:
    s = _find_star(p, name)
    return s is not None and s.get('brightness') == 'bright'

def _is_dim(p: dict, name: str) -> bool:
    s = _find_star(p, name)
    return s is not None and s.get('brightness') == 'dim'

def _get_sihua(p: dict, name: str) -> Any:
    s = _find_star(p, name)
    return s.get('siHua') if s else None

# ─── 格局结果结构 ───
PATTERN_TEMPLATE = {
    'name': '',
    'level': 'neutral',
    'description': '',
    'palaces': [],
    'conditions': {'required': [], 'bonus': [], 'breaking': []},
    'source': '',
}

# ═════════════════ 上格（顶级格局）═════════════════

def _detect_junchen_qinghui(chart: dict, ming: dict, patterns: list):
    """君臣庆会：紫微入命 + 左右同会三方"""
    if not _has_star(ming, '紫微'):
        return
    sf = _san_fang_all_stars(chart)
    if '左辅' not in sf or '右弼' not in sf:
        return
    required = ['紫微入命', '左辅右弼同会三方四正']
    bonus = []
    breaking = []
    if '文昌' in sf or '文曲' in sf:
        bonus.append('再会文昌或文曲')
    if '天魁' in sf or '天钺' in sf:
        bonus.append('魁钺贵人加照')
    if _get_sihua(ming, '紫微') == '权':
        bonus.append('紫微化权')
    if _san_fang_sha_count(chart, SHA_KONG) >= 2:
        breaking.append('地空地劫双夹会照（紫微忌空劫）')
    patterns.append({
        'name': '君臣庆会',
        'level': 'good' if breaking else 'excellent',
        'description': '紫微入命，左辅右弼同会，帝王得贤臣辅佐，主大富大贵、统御之命。一生贵人不绝，宜走政商高位、跨界领袖之途。',
        'palaces': ['命宫'],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·君臣庆会格》',
    })


def _detect_zifu(chart: dict, ming: dict, patterns: list):
    """紫府同宫：紫微+天府同宫（限寅申）"""
    zi = _find_star_palace(chart, '紫微')
    fu = _find_star_palace(chart, '天府')
    if not zi or not fu or zi['branch'] != fu['branch']:
        return
    in_ming = zi['branch'] == chart['mingGongBranch']
    required = ['紫微天府同入命宫'] if in_ming else ['紫微天府同宫（不在命宫，会照减力）']
    bonus = []
    breaking = []
    sf = _san_fang_all_stars(chart)
    if '左辅' in sf and '右弼' in sf:
        bonus.append('左辅右弼同会')
    if '文昌' in sf or '文曲' in sf:
        bonus.append('再会昌曲')
    if _has_sha(zi, SHA_KONG):
        breaking.append('紫府宫坐空劫（破紫府之贵气）')
    if _sha_count(zi, SHA_HARD) >= 2:
        breaking.append('紫府宫见双煞同坐')
    patterns.append({
        'name': '紫府同宫',
        'level': 'excellent' if (in_ming and not breaking) else 'good',
        'description': ('紫微天府同入命宫，帝相并临，尊贵之命。主品行端正、衣食无忧、'
                        '有领导才能，宜担任要职。需要左右辅弼来配合方为完整大格。'
                        if in_ming else
                        '紫微天府同宫但未坐命，主一生有贵人贵气依托，但本身不一定大富贵。'),
        'palaces': [zi['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·紫府同宫格》',
    })


def _detect_fuxiang_chaoyuan(chart: dict, ming: dict, patterns: list):
    """府相朝垣：天府天相分守三方四正"""
    fu = _find_star_palace(chart, '天府')
    xiang = _find_star_palace(chart, '天相')
    if not fu or not xiang:
        return
    if not _is_in_san_fang(chart, fu['branch']) or not _is_in_san_fang(chart, xiang['branch']):
        return
    if fu['branch'] == chart['mingGongBranch'] and xiang['branch'] == chart['mingGongBranch']:
        return
    if fu['branch'] == xiang['branch']:
        return
    required = ['天府坐命三方', '天相坐命三方', '两星不同宫']
    bonus = []
    breaking = []
    if _has_star(ming, '禄存') or _get_sihua(ming, '禄') == '禄':
        bonus.append('命宫见禄')
    if '左辅' in _san_fang_all_stars(chart):
        bonus.append('再会左辅')
    if _has_sha(ming, SHA_HARD):
        breaking.append('命宫坐煞星')
    if _san_fang_sha_count(chart, SHA_HARD) >= 3:
        breaking.append('三方四正煞星过多')
    patterns.append({
        'name': '府相朝垣',
        'level': 'good' if breaking else 'excellent',
        'description': '天府天相分守命宫三方四正，文武并济、权印双辉。古书云"府相朝垣千钟食禄"，常见于政界、企业管理者。',
        'palaces': [fu['name'], xiang['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·府相朝垣格》',
    })


def _detect_yangliang_changlu(chart: dict, ming: dict, patterns: list):
    """阳梁昌禄：太阳+天梁+文昌+禄存会命"""
    sf = _san_fang_all_stars(chart)
    if not all(x in sf for x in ['太阳', '天梁', '文昌', '禄存']):
        return
    sun = _find_star_palace(chart, '太阳')
    liang = _find_star_palace(chart, '天梁')
    required = ['太阳会命宫三方', '天梁会命宫三方', '文昌会命宫三方', '禄存会命宫三方']
    bonus = []
    breaking = []
    if sun and _is_bright(sun, '太阳'):
        bonus.append('太阳庙旺')
    if liang and _is_bright(liang, '天梁'):
        bonus.append('天梁庙旺')
    if '化科' in sf:
        bonus.append('再会化科')
    if sun and _is_dim(sun, '太阳'):
        breaking.append('太阳落陷（阳梁失辉）')
    if _san_fang_sha_count(chart, SHA_HARD) >= 2:
        breaking.append('三方煞重')
    patterns.append({
        'name': '阳梁昌禄',
        'level': 'good' if breaking else 'excellent',
        'description': '太阳、天梁、文昌、禄存四星齐会命宫三方，号称"科举之星"，主清贵显达、考运极佳。',
        'palaces': [sun['name'] if sun else '', (liang['name'] if liang else '')],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·阳梁昌禄格》',
    })


def _detect_huotan_lingtan(chart: dict, ming: dict, patterns: list):
    """火贪格 / 铃贪格"""
    tan = _find_star_palace(chart, '贪狼')
    if not tan or not _is_in_san_fang(chart, tan['branch']):
        return
    huo = _find_star_palace(chart, '火星')
    ling = _find_star_palace(chart, '铃星')
    for shaname, shap in [('火星', huo), ('铃星', ling)]:
        if not shap:
            continue
        same = tan['branch'] == shap['branch']
        trine = (tan['branch'] + 4) % 12 == shap['branch'] or (tan['branch'] + 8) % 12 == shap['branch']
        oppose = (tan['branch'] + 6) % 12 == shap['branch']
        if not (same or trine or oppose):
            continue
        required = [
            f'贪狼{"同宫" if same else "会照"}{shaname}',
            '贪狼会照命宫三方',
        ]
        bonus = []
        breaking = []
        if _is_bright(tan, '贪狼'):
            bonus.append('贪狼庙旺')
        sh = _get_sihua(tan, '贪狼')
        if sh in ('禄', '权'):
            bonus.append('贪狼化禄/化权')
        if _has_sha(tan, ['擎羊', '陀罗']):
            breaking.append('贪狼宫又见羊陀（破横发之力）')
        if _has_sha(tan, SHA_KONG):
            breaking.append('贪狼遇空劫（财来财去）')
        patterns.append({
            'name': '火贪格' if shaname == '火星' else '铃贪格',
            'level': 'good' if breaking else 'excellent',
            'description': f'贪狼遇{shaname}{"同宫" if same else "三方会照"}，主突发横财、突如其来的机遇。',
            'palaces': [tan['name'], shap['name']],
            'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
            'source': '《紫微斗数骨髓赋》',
        })


def _detect_wutan(chart: dict, ming: dict, patterns: list):
    """武贪格：武曲+贪狼同宫或对照"""
    wu = _find_star_palace(chart, '武曲')
    tan = _find_star_palace(chart, '贪狼')
    if not wu or not tan:
        return
    same = wu['branch'] == tan['branch']
    oppose = (wu['branch'] + 6) % 12 == tan['branch']
    if not (same or oppose):
        return
    if not _is_in_san_fang(chart, wu['branch']) and not _is_in_san_fang(chart, tan['branch']):
        return
    required = [
        '武曲贪狼同宫（丑/未）' if same else '武曲贪狼对宫拱照',
        '会照命宫三方',
    ]
    bonus = []
    breaking = []
    sf = _san_fang_all_stars(chart)
    if '火星' in sf or '铃星' in sf:
        bonus.append('再遇火星/铃星（火贪/铃贪叠加）')
    if _get_sihua(wu, '武曲') == '禄':
        bonus.append('武曲化禄')
    if _has_sha(wu, ['擎羊', '陀罗']):
        breaking.append('武贪宫见羊陀')
    if _has_sha(wu, SHA_KONG):
        breaking.append('武贪宫遇空劫')
    patterns.append({
        'name': '武贪格',
        'level': 'good' if breaking else 'excellent',
        'description': '武曲贪狼会命，古书云"武贪不发少年人"——三十岁后方能厚积薄发。主中年以后大富大贵。',
        'palaces': [wu['name'], tan['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数骨髓赋》',
    })


def _detect_shapolang(chart: dict, ming: dict, patterns: list):
    """杀破狼：七杀破军贪狼三方齐聚"""
    sf = _san_fang_all_stars(chart)
    has = [s for s in ['七杀', '破军', '贪狼'] if s in sf]
    if len(has) < 3:
        return
    required = ['七杀、破军、贪狼三星齐入命宫三方四正']
    bonus = []
    breaking = []
    sf_set = sf
    if '化禄' in sf_set or '化权' in sf_set:
        bonus.append('三方有化禄或化权（动得有力）')
    if '左辅' in sf_set and '右弼' in sf_set:
        bonus.append('辅弼同会（变动中得贵人）')
    if _san_fang_sha_count(chart, SHA_HARD) >= 3:
        breaking.append('煞星过重（动而无成）')
    if _has_sha(ming, SHA_KONG):
        breaking.append('命坐空劫（动得辛苦）')
    patterns.append({
        'name': '杀破狼',
        'level': 'caution' if breaking else 'good',
        'description': '七杀、破军、贪狼三星会命，开创闯荡之命格。一生变动多、不甘平凡，宜创业、军警、业务、销售。',
        'palaces': ['命宫', '财帛', '官禄', '迁移'],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·杀破狼》',
    })


def _detect_jiyue_tongliang(chart: dict, ming: dict, patterns: list):
    """机月同梁：天机太阴天同天梁四星齐入"""
    sf = _san_fang_all_stars(chart)
    has = [s for s in ['天机', '太阴', '天同', '天梁'] if s in sf]
    if len(has) < 4:
        return
    required = ['天机、太阴、天同、天梁四星齐入命宫三方四正']
    bonus = []
    breaking = []
    if '文昌' in sf or '文曲' in sf:
        bonus.append('再会昌曲')
    if '化科' in sf:
        bonus.append('再会化科')
    if _san_fang_sha_count(chart, SHA_HARD) >= 3:
        breaking.append('煞星过多（机月同梁忌煞）')
    if _has_sha(ming, SHA_HARD):
        breaking.append('命宫坐煞')
    patterns.append({
        'name': '机月同梁',
        'level': 'good' if breaking else 'excellent',
        'description': '天机太阴天同天梁四星齐入命迁财官，文质彬彬、聪慧善谋。最适合公职、学术、文艺、医疗、服务等需稳定累积的行业。',
        'palaces': ['命宫', '财帛', '官禄', '迁移'],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·机月同梁格》',
    })
# ═════════════════ 中格 ═══════════════════════

def _detect_lianxiang(chart: dict, patterns: list):
    """廉贞天相格"""
    lian = _find_star_palace(chart, '廉贞')
    xiang = _find_star_palace(chart, '天相')
    if not lian or not xiang or lian['branch'] != xiang['branch']:
        return
    in_ming = lian['branch'] == chart['mingGongBranch']
    required = ['廉贞天相同宫']
    bonus = []
    breaking = []
    if _has_star(lian, '禄存') or _get_sihua(lian, '廉贞') == '禄':
        bonus.append('见禄存或廉贞化禄')
    if '左辅' in _san_fang_all_stars(chart):
        bonus.append('左辅会照')
    if _has_sha(lian, ['擎羊']):
        breaking.append('廉相宫坐擎羊（廉杀羊倾向）')
    if _get_sihua(lian, '廉贞') == '忌':
        breaking.append('廉贞化忌')
    patterns.append({
        'name': '廉贞天相格',
        'level': 'caution' if breaking else ('good' if in_ming else 'neutral'),
        'description': '廉贞天相同宫，印绶格局，主秉公处事、清廉之名。怕见擎羊化忌，则反主官非。',
        'palaces': [lian['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书》',
    })


def _detect_wuqisha(chart: dict, patterns: list):
    """武曲七杀同宫"""
    wu = _find_star_palace(chart, '武曲')
    qi = _find_star_palace(chart, '七杀')
    if not wu or not qi or wu['branch'] != qi['branch']:
        return
    in_ming = wu['branch'] == chart['mingGongBranch']
    required = ['武曲七杀同宫']
    bonus = []
    breaking = []
    if _get_sihua(wu, '武曲') == '权':
        bonus.append('武曲化权')
    if _get_sihua(wu, '武曲') == '禄':
        bonus.append('武曲化禄')
    if _get_sihua(wu, '武曲') == '忌':
        breaking.append('武曲化忌（武曲化忌为财劫之兆）')
    if _has_sha(wu, ['擎羊', '陀罗', '火星', '铃星']):
        breaking.append('武杀宫煞星过多')
    patterns.append({
        'name': '武曲七杀',
        'level': 'caution' if breaking else ('excellent' if in_ming else 'good'),
        'description': '武曲七杀同宫，将星配财星，主果决刚毅、理财能力强，适合金融、军警、创业。',
        'palaces': [wu['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书》',
    })


def _detect_tongliang(chart: dict, patterns: list):
    """天同天梁格"""
    tong = _find_star_palace(chart, '天同')
    liang = _find_star_palace(chart, '天梁')
    if not tong or not liang or tong['branch'] != liang['branch']:
        return
    required = ['天同天梁同宫']
    bonus = []
    breaking = []
    if '文昌' in _san_fang_all_stars(chart):
        bonus.append('文昌会照')
    if _get_sihua(tong, '天同') == '禄':
        bonus.append('天同化禄')
    if _has_sha(tong, SHA_HARD):
        breaking.append('煞星同坐')
    patterns.append({
        'name': '天同天梁格',
        'level': 'neutral' if breaking else 'good',
        'description': '天同天梁同宫，福星与荫星共会，主宽厚和善、乐于助人。但偏温和保守，难成大富大贵之局。',
        'palaces': [tong['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书》',
    })


def _detect_riyue_tonggong(chart: dict, patterns: list):
    """日月同宫：太阳太阴丑或未同宫"""
    sun = _find_star_palace(chart, '太阳')
    moon = _find_star_palace(chart, '太阴')
    if not sun or not moon or sun['branch'] != moon['branch']:
        return
    if sun['branch'] not in (1, 7):
        return
    in_ming = sun['branch'] == chart['mingGongBranch']
    required = [f'太阳太阴同入{BRANCH_NAMES[sun["branch"]]}宫']
    bonus = []
    breaking = []
    if sun['branch'] == 7:
        bonus.append('未宫日月同辉（古书云未宫日月双美）')
    sf = _san_fang_all_stars(chart)
    if '文昌' in sf and '文曲' in sf:
        bonus.append('昌曲会照')
    if _has_sha(sun, SHA_HARD):
        breaking.append('日月宫煞星同坐')
    patterns.append({
        'name': '日月同宫',
        'level': 'good' if breaking else ('excellent' if in_ming else 'good'),
        'description': f'太阳太阴于{BRANCH_NAMES[sun["branch"]]}宫同宫，阴阳平衡，文武兼备。{("未宫日月双美尤佳。" if sun["branch"] == 7 else "丑宫日月同宫力量较平。")}',
        'palaces': ['命宫' if in_ming else sun['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书》',
    })


def _detect_riyue_jiaming(chart: dict, patterns: list):
    """日月夹命"""
    jia = _jia_palaces(chart, chart['mingGongBranch'])
    prev, nxt = jia['prev'], jia['next']
    if not prev or not nxt:
        return
    ok = (_has_star(prev, '太阳') and _has_star(nxt, '太阴')) or \
         (_has_star(prev, '太阴') and _has_star(nxt, '太阳'))
    if not ok:
        return
    sun_p = prev if _has_star(prev, '太阳') else nxt
    moon_p = prev if _has_star(prev, '太阴') else nxt
    required = ['太阳太阴分居命宫前后两宫']
    bonus = []
    breaking = []
    if _is_bright(sun_p, '太阳'):
        bonus.append('太阳庙旺')
    if _is_bright(moon_p, '太阴'):
        bonus.append('太阴庙旺')
    if _is_dim(sun_p, '太阳') or _is_dim(moon_p, '太阴'):
        breaking.append('日月落陷（夹命无光）')
    patterns.append({
        'name': '日月夹命',
        'level': 'good' if breaking else 'excellent',
        'description': '太阳太阴分居命宫两侧夹照，光明磊落，一生贵人相助。男主官贵，女主旺夫兴家。',
        'palaces': [sun_p['name'], moon_p['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·日月夹命》',
    })


def _detect_juri_tonggong(chart: dict, patterns: list):
    """巨日同宫：巨门太阳同入寅或申"""
    ju = _find_star_palace(chart, '巨门')
    sun = _find_star_palace(chart, '太阳')
    if not ju or not sun or ju['branch'] != sun['branch']:
        return
    if ju['branch'] not in (2, 8):
        return
    in_ming = ju['branch'] == chart['mingGongBranch']
    required = [f'巨门太阳同入{BRANCH_NAMES[ju["branch"]]}宫']
    bonus = []
    breaking = []
    if ju['branch'] == 2:
        bonus.append('寅宫太阳庙旺，巨门得日光化解是非')
    if _get_sihua(ju, '巨门') in ('禄', '权'):
        bonus.append('巨门化禄/化权（口才生财）')
    if _get_sihua(ju, '巨门') == '忌':
        breaking.append('巨门化忌（口舌官非）')
    if ju['branch'] == 8:
        breaking.append('申宫太阳偏西，巨门暗曜更显')
    patterns.append({
        'name': '巨日同宫',
        'level': 'caution' if breaking else ('excellent' if (in_ming and ju['branch'] == 2) else 'good'),
        'description': f'巨门太阳同{BRANCH_NAMES[ju["branch"]]}宫，太阳化解巨门暗曜，主以口才、传媒、外语、专业立业。',
        'palaces': [ju['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书·巨日同宫》',
    })


def _detect_shizhong_yinyu(chart: dict, ming: dict, patterns: list):
    """石中隐玉：巨门入命于子午宫"""
    if not _has_star(ming, '巨门'):
        return
    if ming['branch'] not in (0, 6):
        return
    required = [f'巨门入命于{BRANCH_NAMES[ming["branch"]]}宫']
    bonus = []
    breaking = []
    if _get_sihua(ming, '巨门') in ('禄', '权'):
        bonus.append('巨门化禄/化权')
    if '文昌' in _san_fang_all_stars(chart):
        bonus.append('文昌会照（石中隐玉得明）')
    if _get_sihua(ming, '巨门') == '忌':
        breaking.append('巨门化忌（玉藏深泥）')
    if _has_sha(ming, SHA_HARD):
        breaking.append('命坐煞星')
    patterns.append({
        'name': '石中隐玉',
        'level': 'caution' if breaking else 'excellent',
        'description': '巨门坐命子午，外表平凡而内蕴才学。早年默默无闻、中年方显贵气，宜走专业、研究、口才、传媒。',
        'palaces': ['命宫'],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数骨髓赋·石中隐玉》',
    })


def _detect_mingzhu_chuhai(chart: dict, ming: dict, patterns: list):
    """明珠出海：命宫在未空宫，对宫丑宫日月同宫"""
    if ming['branch'] != 7:
        return
    if len(_major_names(ming)) > 0:
        return
    dui = _dui_gong(chart, ming['branch'])
    if not dui:
        return
    if not _has_star(dui, '太阳') or not _has_star(dui, '太阴'):
        return
    required = ['命宫在未为空宫', '对宫丑宫为太阳太阴同度']
    bonus = []
    breaking = []
    sf = _san_fang_all_stars(chart)
    if '文昌' in sf or '文曲' in sf:
        bonus.append('再会昌曲')
    if '左辅' in sf or '右弼' in sf:
        bonus.append('辅弼相助')
    if _san_fang_sha_count(chart, SHA_HARD) >= 2:
        breaking.append('煞星会照（珠光黯淡）')
    patterns.append({
        'name': '明珠出海',
        'level': 'good' if breaking else 'excellent',
        'description': '命未空宫，对宫丑宫日月同辉拱照，号"明珠出海"。主出生平凡、后天努力出头，主大富大贵。',
        'palaces': ['命宫', dui['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全集·明珠出海》',
    })


def _detect_ziwei_in_ming(chart: dict, ming: dict, patterns: list):
    """紫微独坐入命"""
    if not _has_star(ming, '紫微') or _has_star(ming, '天府'):
        return
    required = ['紫微独坐命宫（无天府同坐）']
    bonus = []
    breaking = []
    sf = _san_fang_all_stars(chart)
    if '左辅' in sf and '右弼' in sf:
        bonus.append('左辅右弼同会')
    if '文昌' in sf and '文曲' in sf:
        bonus.append('文昌文曲同会')
    if '左辅' not in sf and '右弼' not in sf:
        breaking.append('无辅弼（孤君无臣）')
    if _has_sha(ming, SHA_KONG):
        breaking.append('紫微遇空劫（古书最忌）')
    patterns.append({
        'name': '紫微入命',
        'level': 'caution' if breaking else ('excellent' if bonus else 'good'),
        'description': '紫微独坐命宫，帝王之星，自尊心强、有领导魅力。但最忌"在野孤君"——若无左右辅弼相会，反成孤高自傲。',
        'palaces': ['命宫'],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': breaking},
        'source': '《紫微斗数全书》',
    })
# ═════════════════ 助力格 ═══════════════════════

def _detect_fubi_jiaming(chart: dict, patterns: list):
    """辅弼夹命"""
    jia = _jia_palaces(chart, chart['mingGongBranch'])
    prev, nxt = jia['prev'], jia['next']
    if not prev or not nxt:
        return
    ok = (_has_star(prev, '左辅') and _has_star(nxt, '右弼')) or \
         (_has_star(prev, '右弼') and _has_star(nxt, '左辅'))
    if not ok:
        return
    required = ['左辅右弼分居命宫前后两宫']
    bonus = []
    if '天魁' in _san_fang_all_stars(chart) or '天钺' in _san_fang_all_stars(chart):
        bonus.append('再会魁钺')
    patterns.append({
        'name': '辅弼夹命',
        'level': 'excellent',
        'description': '左辅右弼夹命，一生贵人不断、逢凶化吉。适合走仕途、大企业管理。古书云"左辅右弼，终身福厚"。',
        'palaces': ['命宫', prev['name'], nxt['name']],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': []},
        'source': '《紫微斗数全书·辅弼夹命》',
    })


def _detect_changqu_jiaming(chart: dict, patterns: list):
    """昌曲夹命"""
    jia = _jia_palaces(chart, chart['mingGongBranch'])
    prev, nxt = jia['prev'], jia['next']
    if not prev or not nxt:
        return
    ok = (_has_star(prev, '文昌') and _has_star(nxt, '文曲')) or \
         (_has_star(prev, '文曲') and _has_star(nxt, '文昌'))
    if not ok:
        return
    patterns.append({
        'name': '昌曲夹命',
        'level': 'excellent',
        'description': '文昌文曲夹命宫，主聪明俊秀、文采斐然，宜走文教、学术、艺术、写作。古书云"昌曲夹命主科甲"，最利考运。',
        'palaces': ['命宫', prev['name'], nxt['name']],
        'conditions': {'required': ['文昌文曲分居命宫前后两宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书》',
    })


def _detect_kuiyue_jiaming(chart: dict, patterns: list):
    """魁钺夹命"""
    jia = _jia_palaces(chart, chart['mingGongBranch'])
    prev, nxt = jia['prev'], jia['next']
    if not prev or not nxt:
        return
    ok = (_has_star(prev, '天魁') and _has_star(nxt, '天钺')) or \
         (_has_star(prev, '天钺') and _has_star(nxt, '天魁'))
    if not ok:
        return
    patterns.append({
        'name': '魁钺夹命',
        'level': 'good',
        'description': '天魁天钺夹命，一生贵人提携。考试、求职、关键时刻常有意外贵人相助。',
        'palaces': ['命宫', prev['name'], nxt['name']],
        'conditions': {'required': ['天魁天钺分居命宫前后两宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书》',
    })


def _detect_shuanglu_chaoyuan(chart: dict, ming: dict, patterns: list):
    """双禄朝垣：化禄+禄存同会三方"""
    san_fang = _san_fang_palaces(chart)
    hualu = any(s.get('siHua') == '禄' for p in san_fang for s in p.get('stars', []))
    lucun = any(_has_star(p, '禄存') for p in san_fang)
    if not hualu or not lucun:
        return
    cond = {'required': ['化禄会照三方四正', '禄存会照三方四正'], 'bonus': [], 'breaking': []}
    if _has_sha(ming, SHA_KONG):
        cond['breaking'] = ['命坐空劫（双禄遇空，财来财去）']
    patterns.append({
        'name': '双禄朝垣',
        'level': 'excellent',
        'description': '化禄、禄存同会命宫三方四正，财源涌动、衣食丰足。古书云"双禄朝垣，富比陶朱"。',
        'palaces': [p['name'] for p in san_fang],
        'conditions': cond,
        'source': '《紫微斗数全书·双禄朝垣》',
    })


def _detect_sanqi_jiahui(chart: dict, patterns: list):
    """三奇加会：化禄化权化科同会三方"""
    sfp = _san_fang_palaces(chart)
    lu = any(s.get('siHua') == '禄' for p in sfp for s in p.get('stars', []))
    quan = any(s.get('siHua') == '权' for p in sfp for s in p.get('stars', []))
    ke = any(s.get('siHua') == '科' for p in sfp for s in p.get('stars', []))
    if not (lu and quan and ke):
        return
    patterns.append({
        'name': '三奇加会',
        'level': 'excellent',
        'description': '化禄、化权、化科三吉化齐会命宫三方四正，号称"三奇加会"。主一生功名、财富、贵人三全。',
        'palaces': [p['name'] for p in sfp],
        'conditions': {'required': ['化禄、化权、化科三吉化齐会命宫三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·三奇加会》',
    })


def _detect_hualu_ruming(chart: dict, ming: dict, patterns: list):
    """化禄入命"""
    hualu = None
    for s in ming.get('stars', []):
        if s.get('siHua') == '禄' and s.get('type') == 'major':
            hualu = s
            break
    if not hualu:
        return
    star_name = hualu['name']
    extra = ''
    if star_name == '武曲':
        extra = '武曲化禄属正财，宜实业、金融。'
    elif star_name == '太阴':
        extra = '太阴化禄属阴财、不动产。'
    elif star_name == '贪狼':
        extra = '贪狼化禄属人脉财、桃花财。'
    patterns.append({
        'name': f'{star_name}化禄入命',
        'level': 'good',
        'description': f'{star_name}化禄坐命，主生财顺利、人缘佳、机缘多。{extra}',
        'palaces': ['命宫'],
        'conditions': {'required': [f'{star_name}化禄坐命宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书》',
    })


# ═════════════════ 恶格 ═══════════════════════

def _detect_huaji_rumingqian(chart: dict, patterns: list):
    """化忌入命/迁"""
    qian_branch = (chart['mingGongBranch'] + 6) % 12
    for palace in chart['palaces']:
        if palace['branch'] not in (chart['mingGongBranch'], qian_branch):
            continue
        ji = None
        for s in palace.get('stars', []):
            if s.get('siHua') == '忌' and s.get('type') == 'major':
                ji = s
                break
        if not ji:
            continue
        in_ming = palace['branch'] == chart['mingGongBranch']
        patterns.append({
            'name': f'{ji["name"]}化忌入{"命" if in_ming else "迁"}',
            'level': 'caution',
            'description': (
                f'{ji["name"]}化忌坐命宫，需留意自身固执、心理障碍或健康隐患，凡事退一步思考。'
                if in_ming else
                f'{ji["name"]}化忌坐迁移宫，外出、远行、人际关系易有波折，宜守不宜动。'
            ),
            'palaces': [palace['name']],
            'conditions': {'required': [f'{ji["name"]}化忌坐{"命" if in_ming else "迁"}宫'], 'bonus': [], 'breaking': []},
            'source': '《紫微斗数全书》',
        })


def _detect_yangtuo_jiaji(chart: dict, patterns: list):
    """羊陀夹忌"""
    for palace in chart['palaces']:
        ji = None
        for s in palace.get('stars', []):
            if s.get('siHua') == '忌':
                ji = s
                break
        if not ji:
            continue
        if palace['branch'] != chart['mingGongBranch']:
            continue
        jia = _jia_palaces(chart, palace['branch'])
        prev, nxt = jia['prev'], jia['next']
        if not prev or not nxt:
            continue
        ok = (_has_star(prev, '擎羊') and _has_star(nxt, '陀罗')) or \
             (_has_star(prev, '陀罗') and _has_star(nxt, '擎羊'))
        if not ok:
            continue
        patterns.append({
            'name': '羊陀夹忌',
            'level': 'caution',
            'description': '化忌坐命，左右擎羊陀罗夹命，古书云"羊陀夹忌为败局"，主一生劳碌奔波、坎坷不顺。需以德行修养化解。',
            'palaces': ['命宫', prev['name'], nxt['name']],
            'conditions': {'required': ['化忌坐命', '擎羊陀罗分居命宫前后两宫'], 'bonus': [], 'breaking': []},
            'source': '《紫微斗数骨髓赋·羊陀夹忌》',
        })
        return


def _detect_huoling_jiaming(chart: dict, patterns: list):
    """火铃夹命"""
    jia = _jia_palaces(chart, chart['mingGongBranch'])
    prev, nxt = jia['prev'], jia['next']
    if not prev or not nxt:
        return
    ok = (_has_star(prev, '火星') and _has_star(nxt, '铃星')) or \
         (_has_star(prev, '铃星') and _has_star(nxt, '火星'))
    if not ok:
        return
    patterns.append({
        'name': '火铃夹命',
        'level': 'caution',
        'description': '火星铃星分居命宫前后两宫夹命，主性急、易冲动、突发意外或纠纷。需培养耐性、避免冲动决策。',
        'palaces': ['命宫', prev['name'], nxt['name']],
        'conditions': {'required': ['火星铃星分居命宫前后两宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书》',
    })


def _detect_kongjie_jiaming(chart: dict, patterns: list):
    """空劫夹命"""
    jia = _jia_palaces(chart, chart['mingGongBranch'])
    prev, nxt = jia['prev'], jia['next']
    if not prev or not nxt:
        return
    ok = (_has_star(prev, '地空') and _has_star(nxt, '地劫')) or \
         (_has_star(prev, '地劫') and _has_star(nxt, '地空'))
    if not ok:
        return
    patterns.append({
        'name': '空劫夹命',
        'level': 'caution',
        'description': '地空地劫夹命，主财来财去、思想脱俗、易遁入宗教哲学。宜技艺、宗教、研究等不重物质之业。',
        'palaces': ['命宫', prev['name'], nxt['name']],
        'conditions': {'required': ['地空地劫分居命宫前后两宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书》',
    })


def _detect_lianshayang(chart: dict, patterns: list):
    """廉杀羊"""
    sf = _san_fang_all_stars(chart)
    if not all(x in sf for x in ['廉贞', '七杀', '擎羊']):
        return
    patterns.append({
        'name': '廉杀羊',
        'level': 'caution',
        'description': '廉贞、七杀、擎羊三星会照命宫三方，古书警示之凶格。主血光、官非、意外。本命有此格不必惊慌，但流年大限再触发时需特别谨慎。',
        'palaces': ['命宫'],
        'conditions': {'required': ['廉贞、七杀、擎羊三星会照三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·廉杀羊》',
    })


def _detect_juhuoyang(chart: dict, patterns: list):
    """巨火羊"""
    sf = _san_fang_all_stars(chart)
    if not all(x in sf for x in ['巨门', '火星', '擎羊']):
        return
    patterns.append({
        'name': '巨火羊',
        'level': 'caution',
        'description': '巨门、火星、擎羊三星会照，古书云"巨火羊，终身缢死"——古时凶格。现代意为：易因口舌、激烈冲突而招大祸。需修身养性、慎言慎行。',
        'palaces': ['命宫'],
        'conditions': {'required': ['巨门、火星、擎羊三星会照三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数骨髓赋·巨火羊》',
    })


def _detect_lingchang_tuowu(chart: dict, patterns: list):
    """铃昌陀武"""
    sf = _san_fang_all_stars(chart)
    if not all(x in sf for x in ['铃星', '文昌', '陀罗', '武曲']):
        return
    patterns.append({
        'name': '铃昌陀武',
        'level': 'caution',
        'description': '铃星、文昌、陀罗、武曲四星齐会，古书云"铃昌陀武，限至投河"。本命有此组合不必恐慌，但流年大限触发时需警觉重大决策、情绪起伏。',
        'palaces': ['命宫'],
        'conditions': {'required': ['铃星、文昌、陀罗、武曲四星会照三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数骨髓赋·铃昌陀武》',
    })


def _detect_matou_daijian(chart: dict, ming: dict, patterns: list):
    """马头带箭：擎羊在午宫坐命"""
    if ming['branch'] != 6:
        return
    if not _has_star(ming, '擎羊'):
        return
    required = ['擎羊于午宫坐命']
    bonus = []
    sf = _san_fang_all_stars(chart)
    if '七杀' in sf or '破军' in sf:
        bonus.append('再会七杀或破军（武职大贵）')
    if '天魁' in sf or '天钺' in sf:
        bonus.append('魁钺加照')
    patterns.append({
        'name': '马头带箭',
        'level': 'good' if bonus else 'caution',
        'description': '擎羊于午宫坐命，号"马头带箭"。主刚毅果决、有冲杀之力，宜军警武职、运动员、外科医师。需配合杀破狼或贵人方为大格。',
        'palaces': ['命宫'],
        'conditions': {'required': required, 'bonus': bonus, 'breaking': []},
        'source': '《紫微斗数骨髓赋·马头带箭》',
    })


# ═════════════════ 基础格局 ═══════════════════════

def _detect_lucun_shoushen(chart: dict, patterns: list):
    """禄存守身/守命"""
    lucun_p = _find_star_palace(chart, '禄存')
    if not lucun_p:
        return
    in_ming = lucun_p['branch'] == chart['mingGongBranch']
    in_shen = lucun_p['branch'] == chart['shenGongBranch']
    if not in_ming and not in_shen:
        return
    patterns.append({
        'name': '禄存守命' if in_ming else '禄存守身',
        'level': 'good',
        'description': ('禄存坐命，主一生衣食无忧、财禄稳定。性格保守，善积累，但羊陀夹禄须防小人。'
                        if in_ming else
                        '禄存入身宫，主中年后财源稳定、得禄自享。倪师说「禄存入身，财气近身」。'),
        'palaces': ['命宫' if in_ming else '身宫'],
        'conditions': {'required': ['禄存入命宫' if in_ming else '禄存入身宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·禄存星》',
    })


def _detect_tianma_ruming(chart: dict, patterns: list):
    """天马入命/迁移"""
    tianma_p = _find_star_palace(chart, '天马')
    if not tianma_p:
        return
    in_ming = tianma_p['branch'] == chart['mingGongBranch']
    in_qian = tianma_p['branch'] == (chart['mingGongBranch'] + 6) % 12
    if not in_ming and not in_qian:
        return
    patterns.append({
        'name': '天马入命' if in_ming else '天马在迁',
        'level': 'neutral',
        'description': ('天马坐命，主一生奔波、动中得财，宜走商旅、外勤、跨界发展。'
                        if in_ming else
                        '天马在迁移宫，主外出有利、远行得财，宜异乡发展。'),
        'palaces': [tianma_p['name']],
        'conditions': {'required': ['天马入命宫' if in_ming else '天马入迁移宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·天马星》',
    })


def _detect_hualu_rucai(chart: dict, patterns: list):
    """化禄入财"""
    cai = None
    for p in chart['palaces']:
        if p['name'] == '财帛':
            cai = p
            break
    if not cai:
        return
    lu = None
    for s in cai.get('stars', []):
        if s.get('type') == 'major' and s.get('siHua') == '禄':
            lu = s
            break
    if not lu:
        return
    patterns.append({
        'name': '化禄入财',
        'level': 'good',
        'description': f'{lu["name"]}化禄入财帛宫，主财源畅通、收入稳定。倪师讲化禄是「正财」象征。',
        'palaces': ['财帛'],
        'conditions': {'required': [f'{lu["name"]}化禄入财帛宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·四化论》',
    })


def _detect_huaquan_ruguan(chart: dict, patterns: list):
    """化权入官"""
    guan = None
    for p in chart['palaces']:
        if p['name'] == '官禄':
            guan = p
            break
    if not guan:
        return
    quan = None
    for s in guan.get('stars', []):
        if s.get('type') == 'major' and s.get('siHua') == '权':
            quan = s
            break
    if not quan:
        return
    patterns.append({
        'name': '化权入官',
        'level': 'good',
        'description': f'{quan["name"]}化权入官禄宫，主事业有掌控力、能担当独当一面的职位。宜走管理或技术权威路线。',
        'palaces': ['官禄'],
        'conditions': {'required': [f'{quan["name"]}化权入官禄宫'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·四化论》',
    })


def _detect_huake_rumingshen(chart: dict, patterns: list):
    """化科入命/身"""
    ming = None
    shen = None
    for p in chart['palaces']:
        if p['branch'] == chart['mingGongBranch']:
            ming = p
        if p['branch'] == chart['shenGongBranch']:
            shen = p
    targets = [x for x in [ming, shen] if x]
    for p in targets:
        ke = None
        for s in p.get('stars', []):
            if s.get('type') == 'major' and s.get('siHua') == '科':
                ke = s
                break
        if not ke:
            continue
        is_m = p['branch'] == chart['mingGongBranch']
        patterns.append({
            'name': '化科入命' if is_m else '化科入身',
            'level': 'good',
            'description': f'{ke["name"]}化科入{"命" if is_m else "身"}宫，主名声、文书、学术运。化科是「贵人星」，宜从事教育、研究、咨询、文创等"以名取利"的方向。',
            'palaces': ['命宫' if is_m else '身宫'],
            'conditions': {'required': [f'{ke["name"]}化科入{"命" if is_m else "身"}宫'], 'bonus': [], 'breaking': []},
            'source': '《紫微斗数全书·四化论》',
        })
        return


def _detect_jiyue_tongliang_partial(chart: dict, ming: dict, patterns: list):
    """机月同梁三星会（降级版）"""
    sf = _san_fang_all_stars(chart)
    has = [s for s in ['天机', '太阴', '天同', '天梁'] if s in sf]
    if len(has) != 3:
        return
    missing = [s for s in ['天机', '太阴', '天同', '天梁'] if s not in sf]
    patterns.append({
        'name': '机月同梁三星会',
        'level': 'neutral',
        'description': f'三方四正会齐{"、".join(has)}，差{"、".join(missing)}未会。机月同梁不全格，仍宜公职、教研、医疗、服务等稳定行业。',
        'palaces': ['命宫'],
        'conditions': {'required': [f'三方四正会{"、".join(has)}（机月同梁缺{"、".join(missing)}）'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·机月同梁格》（降级版）',
    })


def _detect_changqu_tonghui(chart: dict, patterns: list):
    """昌曲同会"""
    sf = _san_fang_all_stars(chart)
    if '文昌' not in sf or '文曲' not in sf:
        return
    ming = None
    for p in chart['palaces']:
        if p['branch'] == chart['mingGongBranch']:
            ming = p
            break
    in_ming = ming is not None and _has_star(ming, '文昌') and _has_star(ming, '文曲')
    patterns.append({
        'name': '昌曲坐命' if in_ming else '昌曲同会',
        'level': 'good',
        'description': ('文昌文曲同入命宫，主聪明俊秀、文采斐然，宜文学、教育、写作、咨询。最忌化忌——昌曲化忌主文书契约暗亏。'
                        if in_ming else
                        '文昌文曲同会三方四正，主才华横溢、口才文笔俱佳。宜走需要表达与文采的行业。'),
        'palaces': ['命宫'],
        'conditions': {'required': ['文昌、文曲同会命宫三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·文星论》',
    })


def _detect_fubi_tonghui(chart: dict, patterns: list):
    """辅弼同会"""
    sf = _san_fang_all_stars(chart)
    if '左辅' not in sf or '右弼' not in sf:
        return
    patterns.append({
        'name': '辅弼同会',
        'level': 'good',
        'description': '左辅右弼同会命宫三方四正，主一生贵人不绝、人缘极佳。最宜领导岗位与团队合作型工作。',
        'palaces': ['命宫'],
        'conditions': {'required': ['左辅、右弼同会命宫三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·辅弼论》',
    })


def _detect_kuiyue_tonghui(chart: dict, patterns: list):
    """魁钺同会"""
    sf = _san_fang_all_stars(chart)
    if '天魁' not in sf or '天钺' not in sf:
        return
    patterns.append({
        'name': '魁钺同会',
        'level': 'good',
        'description': '天魁天钺同会命宫三方四正，主"天乙贵人"加持，关键时刻总有贵人提携。',
        'palaces': ['命宫'],
        'conditions': {'required': ['天魁、天钺同会命宫三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·魁钺论》',
    })


def _detect_kequan_shuanghui(chart: dict, patterns: list):
    """科权双会"""
    sfp = _san_fang_palaces(chart)
    has_ke = any(s.get('type') == 'major' and s.get('siHua') == '科' for p in sfp for s in p.get('stars', []))
    has_quan = any(s.get('type') == 'major' and s.get('siHua') == '权' for p in sfp for s in p.get('stars', []))
    if not has_ke or not has_quan:
        return
    patterns.append({
        'name': '科权双会',
        'level': 'good',
        'description': '化科 + 化权 同会三方四正，主名权双美——既有学识/名声（科），又有掌控力（权），宜走"专业权威"路线（如医生、律师、教授、技术骨干）。',
        'palaces': ['命宫'],
        'conditions': {'required': ['化科、化权同会命宫三方四正'], 'bonus': [], 'breaking': []},
        'source': '《紫微斗数全书·四化会照》',
    })
# ═════════════════ 主入口 ═══════════════════════

def detect_patterns(chart: dict) -> list[dict]:
    """对命盘执行全部格局检测，返回匹配的格局列表"""
    patterns: list[dict] = []
    ming = None
    for p in chart.get('palaces', []):
        if p.get('isMingGong'):
            ming = p
            break
    if ming is None:
        # fallback: 按 branch 查找
        for p in chart.get('palaces', []):
            if p['branch'] == chart.get('mingGongBranch'):
                ming = p
                break
    if not ming:
        return patterns

    # 上格
    _detect_junchen_qinghui(chart, ming, patterns)
    _detect_zifu(chart, ming, patterns)
    _detect_fuxiang_chaoyuan(chart, ming, patterns)
    _detect_yangliang_changlu(chart, ming, patterns)
    _detect_huotan_lingtan(chart, ming, patterns)
    _detect_wutan(chart, ming, patterns)
    _detect_shapolang(chart, ming, patterns)
    _detect_jiyue_tongliang(chart, ming, patterns)

    # 中格
    _detect_lianxiang(chart, patterns)
    _detect_wuqisha(chart, patterns)
    _detect_tongliang(chart, patterns)
    _detect_riyue_tonggong(chart, patterns)
    _detect_riyue_jiaming(chart, patterns)
    _detect_juri_tonggong(chart, patterns)
    _detect_shizhong_yinyu(chart, ming, patterns)
    _detect_mingzhu_chuhai(chart, ming, patterns)
    _detect_ziwei_in_ming(chart, ming, patterns)

    # 助力格
    _detect_fubi_jiaming(chart, patterns)
    _detect_changqu_jiaming(chart, patterns)
    _detect_kuiyue_jiaming(chart, patterns)
    _detect_shuanglu_chaoyuan(chart, ming, patterns)
    _detect_sanqi_jiahui(chart, patterns)
    _detect_hualu_ruming(chart, ming, patterns)

    # 恶格
    _detect_huaji_rumingqian(chart, patterns)
    _detect_yangtuo_jiaji(chart, patterns)
    _detect_huoling_jiaming(chart, patterns)
    _detect_kongjie_jiaming(chart, patterns)
    _detect_lianshayang(chart, patterns)
    _detect_juhuoyang(chart, patterns)
    _detect_lingchang_tuowu(chart, patterns)
    _detect_matou_daijian(chart, ming, patterns)

    # 基础格局
    _detect_lucun_shoushen(chart, patterns)
    _detect_tianma_ruming(chart, patterns)
    _detect_hualu_rucai(chart, patterns)
    _detect_huaquan_ruguan(chart, patterns)
    _detect_huake_rumingshen(chart, patterns)
    _detect_jiyue_tongliang_partial(chart, ming, patterns)
    _detect_changqu_tonghui(chart, patterns)
    _detect_fubi_tonghui(chart, patterns)
    _detect_kuiyue_tonghui(chart, patterns)
    _detect_kequan_shuanghui(chart, patterns)

    return patterns
