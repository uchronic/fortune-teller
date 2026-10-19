"""
倪海夏三纪体系 — Python 调用模块

基于 TypeScript 源文件转换而来。包含倪海夏传记、三纪体系导航和关键知识点。

使用：
    from nihai_bridge import (
        NI_HAIXIA_BIO,
        SANJI_CATEGORIES,
        TIANJI_OVERVIEW,
        RENJI_OVERVIEW,
        DIJI_OVERVIEW,
        TIANJI_QUOTES,
    )
"""

# ─── 倪海夏传记精简版 ──────────────────────────────────────

NI_HAIXIA_BIO = {
    'name': '倪海厦',
    'nameVariant': '倪海夏',
    'alias': '梵宇龙',
    'birth': '1954年1月1日',
    'death': '2012年1月31日',
    'birthPlace': '台北市',
    'ancestry': '浙江瑞安',
    'title': '美国汉唐中医学院创办人',
    'titleSummary': '命、相、卜、山、医 五术兼备之旷世奇人',
    'titles': [
        '美国汉唐中医学院院长',
        '美国加州中医药大学博士指导教授',
        '佛罗里达州卫生署中医委员会最高委员（2000-2003）',
        '经方派现代继承者',
        '天纪、人纪教学体系创立者',
    ],
    'teachers': [
        {'name': '周左宇', 'subject': '针灸', 'period': '1977-1981'},
        {'name': '徐济民', 'subject': '针灸', 'period': '1970s'},
    ],
    'corePhilosophy': [
        '大道至简——飞星飞来飞去太复杂，不搞这个',
        '命宫为本，三方为用',
        '人事努力+地理调整 > 先天命运（2/3 > 1/3）',
        '中医是物理医学，从物理角度分析人体',
        '辨证不辨病——中医看的是证型而非病名',
        '经方一剂知，二剂已',
        '算命就是一个讨论果的哲学',
        '文字只是船，真理才是彼岸',
    ],
    'timeline': [
        {'year': '1954', 'event': '出生于台北市，祖籍浙江瑞安'},
        {'year': '1970s', 'event': '高中时以《医宗金鉴》治愈二姐月经痛，立志习医'},
        {'year': '1978', 'event': '军旅服役马祖军医部，获"马祖神医"称号'},
        {'year': '1988', 'event': '在台北开办"天文地理班"，传授紫微斗数和阳宅风水'},
        {'year': '1994', 'event': '完成《天纪》系列著作录制，共24集'},
        {'year': '1995', 'event': '创办汉唐中医学院'},
        {'year': '2004', 'event': '在台北开设《人纪》中医教学班'},
        {'year': '2005', 'event': '《人纪》系列教学DVD出版'},
        {'year': '2007', 'event': '开始撰写《地纪》'},
        {'year': '2012', 'event': '1月31日因心肺衰竭在台北辞世，享年59岁'},
    ],
    'publications': {
        'originalBooks8': ['黄帝内经素问', '黄帝内经', '神农本草经', '针灸', '伤寒论', '金匮', '人间道', '天机道·地脉道'],
        'hantangFormulas': '汉唐100方',
        'classicFormulas': '259个经典配方',
        'totalVideoHours': '200+小时',
    },
}

# ─── 三纪导航 ─────────────────────────────────────────────

SANJI_CATEGORIES = [
    {'key': 'tianji', 'name': '天纪', 'nameEn': 'Tian Ji', 'meaning': '上知天文', 'color': '#d4a843'},
    {'key': 'diji', 'name': '地纪', 'nameEn': 'Di Ji', 'meaning': '下知地理', 'color': '#6b8a5e'},
    {'key': 'renji', 'name': '人纪', 'nameEn': 'Ren Ji', 'meaning': '中知人事', 'color': '#8b6b9e'},
]

# ─── 天纪概览 ─────────────────────────────────────────────

TIANJI_OVERVIEW = {
    'name': '天纪',
    'meaning': '上知天文',
    'recordYear': 1994,
    'episodes': 24,
    'hdEpisodes': 83,
    'totalHours': 48,
    'lectureBooks': ['天机道', '人间道', '地脉道', '64卦易图'],
    'schools': ['三合派（紫微斗数）', '象数派（易经）', '九星派（堪舆）', '河洛数理派（推命）'],
    'modules': [
        {
            'id': 'tj-ziwei',
            'name': '紫微斗数',
            'nameEn': 'Zi Wei Dou Shu',
            'subtitle': '三合派 · 倪师正宗体系',
            'description': '以紫微星为主轴，十四主星配十二宫位，结合四化星推演人生格局。倪师主张「大道至简」，以三合派为正宗。',
            'school': '三合派',
            'lessons': '天纪视频前半部分（约24小时）',
            'keywords': ['紫微斗数', '三合派', '十四主星', '十二宫位', '四化星', '大限', '流年'],
        },
        {
            'id': 'tj-yijing',
            'name': '易经六十四卦',
            'nameEn': 'Yi Jing 64 Hexagrams',
            'subtitle': '象数派 · 断易天机',
            'description': '倪师以《断易天机》为底本，自创图示法讲解六十四卦。前一小时讲命学，后一小时讲易经。',
            'school': '象数派',
            'lessons': '天纪视频后半部分（约24小时）',
            'keywords': ['易经', '六十四卦', '八卦', '象数派', '占卜', '断易天机'],
        },
        {
            'id': 'tj-kanyu',
            'name': '堪舆学',
            'nameEn': 'Kan Yu Xue',
            'subtitle': '九星派 · 杨救贫流派',
            'description': '涵盖阳宅风水与阴宅选择，以九星派为正宗，讲解三吉六秀、八煞黄泉等核心理论。',
            'school': '九星派（杨救贫流派）',
            'lessons': '天纪视频第18-21集',
            'keywords': ['堪舆', '风水', '阳宅', '阴宅', '九星派', '杨救贫', '八煞黄泉'],
        },
        {
            'id': 'tj-tuiming',
            'name': '推命学',
            'nameEn': 'Tui Ming Xue',
            'subtitle': '河洛数理派 · 子平法',
            'description': '以子平法排列的易经推命术，结合河洛数理派理论。',
            'school': '河洛数理派',
            'keywords': ['推命', '八字', '子平法', '河洛数理', '四柱'],
        },
        {
            'id': 'tj-mianxiang',
            'name': '面相学',
            'nameEn': 'Mian Xiang Xue',
            'subtitle': '五形论 · 命相同参',
            'description': '以「五形论」为核心，倪师强调命相同参会提高准确率。',
            'school': '五形面相',
            'keywords': ['面相', '五形论', '木火土金水', '命相同参'],
        },
        {
            'id': 'tj-cezi',
            'name': '测字术',
            'nameEn': 'Ce Zi Shu',
            'subtitle': '拆字法 · 会意法',
            'description': '通过分析文字的笔画、结构、含义来推断吉凶。',
            'keywords': ['测字', '拆字法', '会意法'],
        },
    ],
}

# ─── 人纪概览 ─────────────────────────────────────────────

RENJI_OVERVIEW = {
    'name': '人纪',
    'meaning': '中知人事',
    'completionYear': '2004-2005',
    'totalLessons': '150+集',
    'learningOrder': ['针灸大成', '黄帝内经', '神农本草经', '伤寒论', '金匮要略'],
    'corePhilosophy': '中医是物理医学，辨证不辨病，经方一剂知二剂已',
    'stats': {
        'acuExperienceCount': 215,
        'transNeedlingCount': 31,
        'hantangFormulaCount': 100,
        'classicFormulaCount': 259,
    },
    'modules': [
        {
            'id': 'rj-zhenjiu',
            'name': '针灸大成',
            'nameEn': 'Zhen Jiu Da Cheng',
            'subtitle': '人纪第一课 · 经络穴位',
            'lessons': '44集（每集约44分钟）',
            'keywords': ['针灸', '经络', '穴位', '十二正经', '奇经八脉'],
        },
        {
            'id': 'rj-neijing',
            'name': '黄帝内经',
            'nameEn': 'Huang Di Nei Jing',
            'subtitle': '人纪第二课 · 中医理论根基',
            'lessons': '20集（每集约1小时）',
            'keywords': ['黄帝内经', '素问', '灵枢', '阴阳', '五行', '脏腑'],
        },
        {
            'id': 'rj-bencao',
            'name': '神农本草经',
            'nameEn': 'Shen Nong Ben Cao Jing',
            'subtitle': '人纪第三课 · 药物学根基',
            'lessons': '46集（每集约1小时）',
            'keywords': ['神农本草经', '中药', '本草', '上品', '中品', '下品'],
        },
        {
            'id': 'rj-shanghan',
            'name': '伤寒论',
            'nameEn': 'Shang Han Lun',
            'subtitle': '人纪第四课 · 辨证论治典范',
            'lessons': '伤寒论原版DVD（每集约2小时）',
            'keywords': ['伤寒论', '张仲景', '六经辨证', '经方', '桂枝汤', '麻黄汤'],
        },
        {
            'id': 'rj-jingui',
            'name': '金匮要略',
            'nameEn': 'Jin Gui Yao Lue',
            'subtitle': '人纪第五课 · 杂病诊治大成',
            'lessons': '20集（每集约1小时）',
            'keywords': ['金匮要略', '张仲景', '杂病', '痰饮', '水气'],
        },
    ],
}

# ─── 地纪概览 ─────────────────────────────────────────────

DIJI_OVERVIEW = {
    'name': '地纪',
    'meaning': '下知地理',
    'status': '倪师未竟之业',
    'note': '倪海厦原计划60岁后著述地纪，2012年辞世，仅留下构想和理论基础',
    'startYear': 2007,
    'existingContent': '天纪课程中堪舆学部分 + 后人整理遗稿',
    'modules': [
        {
            'id': 'dj-guojiadili',
            'name': '国家地理志',
            'subtitle': '倪师未竟之业 · 遗稿研读',
            'description': '倪师计划以风水地理知识解读各国地理环境对国民性格、物产资源、国运兴衰的影响。',
            'keywords': ['国家地理', '风水', '地理志', '国运', '物产'],
        },
        {
            'id': 'dj-kanyu-theory',
            'name': '堪舆理论基础',
            'subtitle': '天纪堪舆学 · 理论整理',
            'description': '整理自天纪课程中的堪舆学理论部分，作为地纪的理论基础。',
            'school': '九星派（杨救贫流派）',
            'keywords': ['堪舆', '风水理论', '峦头', '理气', '阳宅'],
        },
    ],
}

# ─── 倪师天纪核心语录 ────────────────────────────────────

TIANJI_QUOTES = [
    {'text': '文字只是协助诸位到达真理的彼岸，千万不要三个月以后，怎么还是扛着船在马路上跑', 'topic': '学习态度'},
    {'text': '大道至简——飞星飞来飞去太复杂，不搞这个', 'topic': '紫微斗数'},
    {'text': '命宫为本，三方为用——命宫主星决定基本格局，三方决定用武之地', 'topic': '紫微斗数'},
    {'text': '最怕的是七杀临身，七杀临身的人一辈子多败少成', 'topic': '紫微斗数'},
    {'text': '官禄宫最喜欢权星入进来', 'topic': '紫微斗数'},
    {'text': '算命就是一个讨论果的哲学', 'topic': '命学哲理'},
    {'text': '命是天注定的，运掌握在我们自己手上', 'topic': '命学哲理'},
    {'text': '祸福无门，咎由自取', 'topic': '命学哲理'},
    {'text': '越纯越贵——五形越纯正的面相类型越贵', 'topic': '面相'},
    {'text': '南人北相、北人南相是贵相的重要标志', 'topic': '面相'},
    {'text': '人事的努力加上地理上的调整，一定能大于先天的命运', 'topic': '堪舆'},
    {'text': '好的风水地方要有鱼虾龟——生气充沛的标志', 'topic': '堪舆'},
    {'text': '八煞黄泉是坟墓和阳宅立向的绝对禁忌', 'topic': '堪舆'},
    {'text': '唯有紫微斗数可以把天文和地理两个融合在一起', 'topic': '紫微斗数'},
    {'text': '如果读了易经，越弄越复杂，就是没有读通易经', 'topic': '易经'},
    {'text': '不疑何卜——只有有疑虑时才占卜', 'topic': '易经'},
    {'text': '我不希望这些中华文化失传，所以就教了许多学生', 'topic': '传承'},
]


def get_sanji_category(key: str) -> dict | None:
    """按 key 查询三纪分类。

    Args:
        key: 'tianji', 'diji', 或 'renji'

    Returns:
        分类字典，不存在则返回 None
    """
    for cat in SANJI_CATEGORIES:
        if cat['key'] == key:
            return cat
    return None


def get_quotes_by_topic(topic: str) -> list[dict]:
    """按主题筛选倪师语录。

    Args:
        topic: 主题关键词（如 '紫微斗数'、'堪舆'、'面相' 等）

    Returns:
        匹配的语录列表
    """
    return [q for q in TIANJI_QUOTES if q['topic'] == topic]


def search_quotes(keyword: str) -> list[dict]:
    """关键词搜索倪师语录。

    Args:
        keyword: 搜索关键词

    Returns:
        匹配的语录列表（文本中包含关键词）
    """
    return [q for q in TIANJI_QUOTES if keyword in q['text']]
