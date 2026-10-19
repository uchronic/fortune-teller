# -*- coding: utf-8 -*-
"""
五行量化强度表 · MLSS 版
========================
源自 BaziEval (C++) 的天干强度表、地支藏干强度表、月令权重表。
用于八字身强弱量化分析。

数据来源：allanpk716/BaziEval/Bazi/BaziAlgorithm.cpp
         https://github.com/allanpk716/BaziEval
"""

# ── 十天干月令强度表 TianGan_MonthStrength[12][10] ──────────────────────
# 索引：0=甲, 1=乙, 2=丙, 3=丁, 4=戊, 5=己, 6=庚, 7=辛, 8=壬, 9=癸
# 每月一列，值越大天干越旺
TIAN_GAN_MONTH_STRENGTH = [
    #  正月  二月  三月  四月  五月  六月  七月  八月  九月  十月 冬月  腊月
    [1.2,  1.2,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.2,  1.2],  # 甲
    [1.06, 1.06, 1.0,  1.0,  1.1,  1.1,  1.14, 1.14, 1.1,  1.1 ],  # 乙
    [1.14, 1.14, 1.2,  1.2,  1.06, 1.06, 1.0,  1.0,  1.0,  1.0 ],  # 丙
    [1.2,  1.2,  1.2,  1.2,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0 ],  # 丁
    [1.1,  1.1,  1.06, 1.06, 1.1,  1.1,  1.1,  1.1,  1.04, 1.04],  # 戊
    [1.0,  1.0,  1.14, 1.14, 1.14, 1.14, 1.06, 1.06, 1.06, 1.06],  # 己
    [1.0,  1.0,  1.2,  1.2,  1.2,  1.2,  1.0,  1.0,  1.0,  1.0 ],  # 庚
    [1.04, 1.04, 1.1,  1.1,  1.16, 1.16, 1.1,  1.1,  1.0,  1.0 ],  # 辛
    [1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.2,  1.2,  1.2,  1.2 ],  # 壬
    [1.0,  1.0,  1.04, 1.04, 1.14, 1.14, 1.16, 1.16, 1.06, 1.06],  # 癸
]
# 月份索引：0=寅,1=卯,2=辰,3=巳,4=午,5=未,6=申,7=酉,8=戌,9=亥,10=子,11=丑
# （与月令地支顺序一致）

# ── 地支藏干强度表 DiZhi_HiddenStrength ─────────────────────────────────
# 每个地支对应的藏干及其在本气（月令）中的权重系数
# 格式：{地支: [(天干, 强度), ...]}
DIZHI_HIDDEN_STRENGTH = {
    "子": [("甲", 1.2),  ("癸", 1.0)],
    "丑": [("己", 0.36), ("癸", 0.33), ("辛", 0.3)],
    "寅": [("甲", 1.0),  ("丙", 1.0),  ("戊", 1.0)],
    "卯": [("乙", 1.2)],
    "辰": [("戊", 0.84), ("乙", 0.74), ("癸", 0.798)],
    "巳": [("丙", 1.2),  ("庚", 1.06), ("戊", 1.14)],
    "午": [("丁", 1.2),  ("己", 1.0)],
    "未": [("己", 0.7),  ("丁", 0.7),  ("乙", 0.84)],
    "申": [("庚", 1.0),  ("壬", 1.0),  ("戊", 1.06)],
    "酉": [("辛", 1.2)],
    "戌": [("戊", 0.84), ("辛", 0.73), ("丁", 0.72)],
    "亥": [("壬", 1.0),  ("甲", 1.14)],
}

# ── 地支主气强度（地利）ZhiMainStrength ─────────────────────────────────
# 每个地支的主气强度，按月份变化
# 索引：0=子, 1=丑, 2=寅, 3=卯, 4=辰, 5=巳, 6=午, 7=未, 8=申, 9=酉, 10=戌, 11=亥
# 纵列 = 月份（0=寅月, 1=卯月, ...11=丑月）
ZHI_MAIN_STRENGTH = [
    #  寅   卯   辰   巳   午   未   申   酉   戌   亥   子   丑
    [1.2,  1.1,  1.06, 1.0,  1.06, 1.06, 1.0,  1.0,  1.0,  1.0,  1.2,  1.2 ],  # 子
    [0.36, 0.33, 0.3,  0.3,  0.312, 0.318, 0.3,  0.3,  0.3,  0.36, 0.36, 0.318],  # 丑
    [1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0 ],  # 寅
    [0.5,  0.55, 0.53, 0.5,  0.55, 0.57, 0.6,  0.58, 0.5,  0.5,  0.5,  0.57],  # 卯
    [0.3,  0.3,  0.36, 0.36, 0.318, 0.342, 0.3,  0.3,  0.3,  0.342, 0.3,  0.342],  # 辰
    [1.2,  1.06, 1.14, 1.2,  1.06, 1.14, 1.2,  1.1,  1.0,  1.0,  1.0,  1.0 ],  # 巳
    [0.36, 0.318, 0.3,  0.3,  0.312, 0.3,  0.3,  0.3,  0.3,  0.36, 0.36, 0.3 ],  # 午
    [0.5,  0.55, 0.53, 0.5,  0.55, 0.57, 0.6,  0.58, 0.5,  0.5,  0.5,  0.57],  # 未
    [0.84, 0.742, 0.798, 0.84, 0.73, 0.7,  0.7,  0.728, 0.742, 0.84, 0.84, 0.73 ],  # 申
    [1.2,  1.06, 1.14, 1.2,  1.06, 1.14, 1.2,  1.1,  1.0,  1.0,  1.0,  1.0 ],  # 酉
    [0.7,  0.7,  0.84, 0.84, 0.742, 0.84, 0.84, 0.798, 0.7,  0.7,  0.728, 0.812],  # 戌
    [1.0,  1.14, 1.0,  1.0,  1.1,  1.06, 1.0,  1.1,  1.14, 1.2,  1.16, 1.0 ],  # 亥
]

# ── 天干序号映射 ─────────────────────────────────────────────────────────
TG = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DZ = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 月令地支索引（立春开始）
YUE_LING_IDX = {
    "寅": 0, "卯": 1, "辰": 2, "巳": 3, "午": 4, "未": 5,
    "申": 6, "酉": 7, "戌": 8, "亥": 9, "子": 10, "丑": 11
}


def tian_gan_strength(tg_char: str, yue_month_branch: str) -> float:
    """天干在某月令下的强度系数"""
    try:
        tg_idx = TG.index(tg_char)
        yue_idx = YUE_LING_IDX[yue_month_branch]
        return TIAN_GAN_MONTH_STRENGTH[tg_idx][yue_idx]
    except (ValueError, KeyError, IndexError):
        return 1.0  # 默认平


def dizhi_main_strength(dz_char: str, yue_month_branch: str) -> float:
    """地支主气在某月令下的强度系数"""
    try:
        dz_idx = DZ.index(dz_char)
        yue_idx = YUE_LING_IDX[yue_month_branch]
        return ZHI_MAIN_STRENGTH[dz_idx][yue_idx]
    except (ValueError, KeyError, IndexError):
        return 1.0


def dizhi_hidden_stem_strength(dz_char: str, hidden_tg: str,
                                yue_month_branch: str) -> float:
    """地支藏干在某月令下的强度系数"""
    try:
        entries = DIZHI_HIDDEN_STRENGTH[dz_char]
        for tg, strength in entries:
            if tg == hidden_tg:
                # 藏干强度 × 月令修正
                base = strength
                return base
        return 0.5  # 未查到给默认值
    except KeyError:
        return 0.5


def wuxing_strength_score(bazi_ganzhi: list,
                          yue_month_branch: str) -> dict:
    """
    计算八字五行强度评分。

    参数：
        bazi_ganzhi: [年干支, 月干支, 日干支, 时干支] 每项如"庚午"
        yue_month_branch: 月令地支，如"寅"

    返回：
        {
            "stem_scores": [甲分, 乙分, ...],
            "branch_scores": [子分, 丑分, ...],
            "total_scores": {"木":x, "火":y, "土":z, "金":w, "水":o},
            "strong_weak": "偏旺"|"偏弱"|"中和",
            "detail": [...]
        }
    """
    WUXING = {"甲": "木", "乙": "木", "丙": "火", "丁": "火",
               "戊": "土", "己": "土", "庚": "金", "辛": "金",
               "壬": "水", "癸": "水"}
    DZ_WUXING = {"子": "水", "丑": "土", "寅": "木", "卯": "木",
                  "辰": "土", "巳": "火", "午": "火", "未": "土",
                  "申": "金", "酉": "金", "戌": "土", "亥": "水"}

    # 天干强度
    stem_total = {}
    for gz in bazi_ganzhi:
        tg = gz[0]
        wx = WUXING[tg]
        s = tian_gan_strength(tg, yue_month_branch)
        stem_total[wx] = stem_total.get(wx, 0.0) + s

    # 地支强度（含主气+藏干）
    branch_total = {}
    for gz in bazi_ganzhi:
        dz = gz[1]
        # 主气
        wx = DZ_WUXING[dz]
        s = dizhi_main_strength(dz, yue_month_branch)
        branch_total[wx] = branch_total.get(wx, 0.0) + s
        # 藏干
        try:
            for hidden_tg, strength in DIZHI_HIDDEN_STRENGTH[dz]:
                hwx = WUXING[hidden_tg]
                branch_total[hwx] = branch_total.get(hwx, 0.0) + strength
        except KeyError:
            pass

    # 总分（天干+地支）
    total = {}
    for wx in ["木", "火", "土", "金", "水"]:
        total[wx] = stem_total.get(wx, 0.0) + branch_total.get(wx, 0.0)

    # 判断身强弱（简化：看日主五行得分）
    ri_gan = bazi_ganzhi[2][0]   # 日干
    ri_wx = WUXING[ri_gan]
    ri_score = total.get(ri_wx, 0.0)
    all_total = sum(total.values())
    ratio = ri_score / all_total if all_total > 0 else 0

    if ratio > 0.35:
        strong_weak = "偏旺"
    elif ratio < 0.18:
        strong_weak = "偏弱"
    else:
        strong_weak = "中和"

    detail = []
    for wx, v in total.items():
        bar = "█" * int(v * 3) if v > 0 else ""
        detail.append(f"{wx}:{v:.2f}{bar}")

    return {
        "stem_total": stem_total,
        "branch_total": branch_total,
        "total_scores": total,
        "day_stem": ri_gan,
        "day_element": ri_wx,
        "day_score": round(ri_score, 3),
        "ratio": round(ratio, 4),
        "strong_weak": strong_weak,
        "detail": detail
    }


# ── 调试入口 ───────────────────────────────────────────────────────────────
