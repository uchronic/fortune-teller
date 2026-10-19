#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
梅花易数·时间（时辰）起卦 —— 完整三卦推导（本卦/互卦/变卦/体用/动爻）

用法：
    python meihua_shichen_qigua.py                    # 用当前时间起卦
    python meihua_shichen_qigua.py 2026 9 17 15 23    # 指定公历年月日时分起卦

依赖：lunar_python
    import lunar_python as lunar   # 模块名是 lunar_python，不是 lunar
    from lunar_python import Solar

⚠️ 已知坑（2026-09-17 修正）：
    - 爻象必须自下而上读。兑卦「上缺」= [阳,阳,阴] = [1,1,0]，不是 [0,1,1]；
      巽卦「下断」= [阴,阳,阳] = [0,1,1]，不是 [1,1,0]。搞反会导致含兑/巽的卦排错。
    - 口诀：乾三连111 / 兑上缺110 / 离中虚101 / 震仰盂100 /
            巽下断011 / 坎中满010 / 艮覆碗001 / 坤六断000
"""
import sys
from datetime import datetime
from lunar_python import Solar

ZHI_ORDER = {'子':1,'丑':2,'寅':3,'卯':4,'辰':5,'巳':6,'午':7,'未':8,'申':9,'酉':10,'戌':11,'亥':12}
# 先天八卦数：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8
GUA_MAP = {1:('乾','☰','天','金'), 2:('兑','☱','泽','金'), 3:('离','☲','火','火'),
           4:('震','☳','雷','木'), 5:('巽','☴','风','木'), 6:('坎','☵','水','水'),
           7:('艮','☶','山','土'), 8:('坤','☷','地','土')}
# 卦爻象（自下而上，1阳0阴）
GUA_YAO = {'乾':[1,1,1],'兑':[1,1,0],'离':[1,0,1],'震':[1,0,0],
           '巽':[0,1,1],'坎':[0,1,0],'艮':[0,0,1],'坤':[0,0,0]}
GUA64 = {
 ('乾','乾'):'乾为天',('乾','兑'):'天泽履',('乾','离'):'天火同人',('乾','震'):'天雷无妄',
 ('乾','巽'):'天风姤',('乾','坎'):'天水讼',('乾','艮'):'天山遁',('乾','坤'):'天地否',
 ('兑','乾'):'泽天夬',('兑','兑'):'兑为泽',('兑','离'):'泽火革',('兑','震'):'泽雷随',
 ('兑','巽'):'泽风大过',('兑','坎'):'泽水困',('兑','艮'):'泽山咸',('兑','坤'):'泽地萃',
 ('离','乾'):'火天大有',('离','兑'):'火泽睽',('离','离'):'离为火',('离','震'):'火雷噬嗑',
 ('离','巽'):'火风鼎',('离','坎'):'火水未济',('离','艮'):'火山旅',('离','坤'):'火地晋',
 ('震','乾'):'雷天大壮',('震','兑'):'雷泽归妹',('震','离'):'雷火丰',('震','震'):'震为雷',
 ('震','巽'):'雷风恒',('震','坎'):'雷水解',('震','艮'):'雷山小过',('震','坤'):'雷地豫',
 ('巽','乾'):'风天小畜',('巽','兑'):'风泽中孚',('巽','离'):'风火家人',('巽','震'):'风雷益',
 ('巽','巽'):'巽为风',('巽','坎'):'风水涣',('巽','艮'):'风山渐',('巽','坤'):'风地观',
 ('坎','乾'):'水天需',('坎','兑'):'水泽节',('坎','离'):'水火既济',('坎','震'):'水雷屯',
 ('坎','巽'):'水风井',('坎','坎'):'坎为水',('坎','艮'):'水山蹇',('坎','坤'):'水地比',
 ('艮','乾'):'山天大畜',('艮','兑'):'山泽损',('艮','离'):'山火贲',('艮','震'):'山雷颐',
 ('艮','巽'):'山风蛊',('艮','坎'):'山水蒙',('艮','艮'):'艮为山',('艮','坤'):'山地剥',
 ('坤','乾'):'地天泰',('坤','兑'):'地泽临',('坤','离'):'地火明夷',('坤','震'):'地雷复',
 ('坤','巽'):'地风升',('坤','坎'):'地水师',('坤','艮'):'地山谦',('坤','坤'):'坤为地',
}

def yao_to_gua(yao):
    for name, y in GUA_YAO.items():
        if y == yao:
            return name
    return None

def qigua(y, mo, d, h, mi):
    s = Solar.fromYmdHms(y, mo, d, h, mi, 0)
    l = s.getLunar()
    ec = l.getEightChar()
    year_zhi = ec.getYear()[-1]
    time_zhi = ec.getTime()[-1]
    n_year = ZHI_ORDER[year_zhi]
    n_month = l.getMonth()      # 农历月
    n_day = l.getDay()          # 农历日
    n_hour = ZHI_ORDER[time_zhi]

    sum_shang = n_year + n_month + n_day
    sum_xia = n_year + n_month + n_day + n_hour
    shang = sum_shang % 8 or 8   # 0 → 坤8
    xia = sum_xia % 8 or 8
    dong = sum_xia % 6 or 6      # 0 → 第6爻

    sg = GUA_MAP[shang]; xg = GUA_MAP[xia]
    six = GUA_YAO[xg[0]] + GUA_YAO[sg[0]]   # 六爻自下而上：下卦(初二三) + 上卦(四五上)

    # 互卦：下互 = 二三四爻，上互 = 三四五爻
    hu_low = yao_to_gua([six[1], six[2], six[3]])
    hu_up  = yao_to_gua([six[2], six[3], six[4]])
    # 变卦：动爻阴阳互变
    changed = list(six); changed[dong-1] = 1 - changed[dong-1]
    bian_low = yao_to_gua(changed[0:3]); bian_up = yao_to_gua(changed[3:6])

    # 体用：动爻在1-3(下卦)→用=下、体=上；动爻在4-6(上卦)→用=上、体=下
    if dong <= 3:
        ti, yong = sg, xg
    else:
        ti, yong = xg, sg

    name_to_gua = {v[0]: v for v in GUA_MAP.values()}
    hl = name_to_gua[hu_low]; hu = name_to_gua[hu_up]
    bl = name_to_gua[bian_low]; bu = name_to_gua[bian_up]

    return {
        '四柱': f"{ec.getYear()} {ec.getMonth()} {ec.getDay()} {ec.getTime()}",
        '农历': f"{l.getYearInChinese()}年{l.getMonthInChinese()}月{l.getDayInChinese()}",
        '取数': f"年支{n_year} 月{n_month} 日{n_day} 时支{n_hour}",
        '本卦': f"{GUA64[(sg[0], xg[0])]}（上{sg[2]}{sg[1]} 下{xg[2]}{xg[1]}）",
        '互卦': f"{GUA64[(hu_up, hu_low)]}（上{hu[2]}{hu[1]} 下{hl[2]}{hl[1]}）",
        '变卦': f"{GUA64[(bian_up, bian_low)]}（上{bu[2]}{bu[1]} 下{bl[2]}{bl[1]}）",
        '动爻': f"第{dong}爻",
        '体卦': f"{ti[0]}{ti[1]}（{ti[2]}，五行{ti[3]}）",
        '用卦': f"{yong[0]}{yong[1]}（{yong[2]}，五行{yong[3]}）",
        '体用': f"体{ti[3]} vs 用{yong[3]}",
    }

def main():
    args = sys.argv[1:]
    if len(args) >= 5:
        y, mo, d, h, mi = (int(x) for x in args[:5])
    else:
        n = datetime.now(); y, mo, d, h, mi = n.year, n.month, n.day, n.hour, n.minute
    for k, v in qigua(y, mo, d, h, mi).items():
        print(f"{k}: {v}")
