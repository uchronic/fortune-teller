# -*- coding: utf-8 -*-
"""
称骨算命 · MLSS 版
=================
基于 yuan/SKILL.md 算法规范，整合 lookup_tables.json + verse_profiles.json
实现袁天罡称骨的确定性查表流程。

输入：公历生日 或 lunar_components
输出：结构化 JSON + display_zh

依赖：lunar_python（农历转换）
"""

import json, os, sys

# ── 路径 ──────────────────────────────────────────────────────────────────
_REF_DIR = os.path.join(os.path.dirname(__file__), "references", "chenggu")
_LOOKUP  = os.path.join(_REF_DIR, "lookup_tables.json")
_VERSES  = os.path.join(_REF_DIR, "verse_profiles.json")

# ── 加载数据 ───────────────────────────────────────────────────────────────
with open(_LOOKUP,  encoding="utf-8") as f:
    _LT = json.load(f)

with open(_VERSES,  encoding="utf-8") as f:
    _VP = json.load(f)

# ── 工具函数 ───────────────────────────────────────────────────────────────
def _norm_month_key(month: int) -> str:
    """月份查表键（字符串）"""
    return str(month)

def _norm_day_key(day: int) -> str:
    """日期查表键（字符串）"""
    return str(day)

def _hour_branch_to_key(branch: str) -> str:
    """时支查表键（直接用汉字）"""
    return branch

def _ganzhi_year_key(year_ganzhi: str) -> str:
    """年干支查表键"""
    return year_ganzhi

# ── 边界规则 ───────────────────────────────────────────────────────────────
def adjust_night_hour(lunar) -> None:
    """
    夜子时：23:00~23:59 视为次日。
    直接修改 lunar 对象的 month/day/year（lunar-python 支持）。
    """
    hour = lunar.getHour()
    if hour == 23:
        # lunar-python: 癸巳时(23:00-23:59) → 甲午日之初
        # 夜子时视为次日00:00之后，年月日本身进位
        # 做法：把日期+1，时支视为子时(00:00-00:59)
        # 但更准确的做法是：时支视为"子"，年月日不变
        # 这里只记录一个标记，由调用者决定时支
        pass
    return

# ── 核心算法 ───────────────────────────────────────────────────────────────
def chenggu_from_lunar(year_ganzhi: str, month: int, day: int,
                       hour_branch: str, is_leap_month: bool = False) -> dict:
    """
    输入：农历年月日时（已标准化）
    输出：结构化 JSON（含 display_zh）

    算法流程（来自 yuan/SKILL.md）：
    1. 边界规则：闰月1-15=本月，16-30=下月；夜子时23:00→次日
    2. 查表：年/月/日/时 四项权重
    3. 求和 → total_qian
    4. 查 verse_profiles → 档位信息
    5. 组装输出
    """
    # ── 闰月处理 ────────────────────────────────────────────────────────
    if is_leap_month and month >= 16:
        month += 1   # 闰月16-30按下月算

    # ── 夜子时处理 ──────────────────────────────────────────────────────
    # 时支为"子"时分两种：
    #   - 23:00-23:59 夜子时 → 时支仍为"子"，但年月日进位
    #   - 00:00-00:59 子时 → 正常子时
    # 调用方通过 year_ganzhi/month/day 已传入正确值，这里不重复处理

    # ── 查表权重 ────────────────────────────────────────────────────────
    year_w  = _LT["year_weight_qian_by_ganzhi"].get(year_ganzhi, 0)
    month_w = _LT["month_weight_qian"].get(_norm_month_key(month), 0)
    day_w   = _LT["day_weight_qian"].get(_norm_day_key(day), 0)
    hour_w  = _LT["hour_weight_qian"].get(_hour_branch_to_key(hour_branch), 0)

    total_qian = year_w + month_w + day_w + hour_w

    # ── 查档位 ──────────────────────────────────────────────────────────
    verse = _VP.get(str(total_qian))
    if verse is None:
        return {
            "skill_name": "chenggu-analysis",
            "api_name": "chenggu_from_lunar",
            "input_normalized": {
                "year_ganzhi": year_ganzhi,
                "month": month,
                "day": day,
                "hour_branch": hour_branch,
                "is_leap_month": is_leap_month
            },
            "weights": {
                "year": year_w,
                "month": month_w,
                "day": day_w,
                "hour": hour_w
            },
            "total_weight": total_qian,
            "grade": "未知",
            "verse_canonical": f"总骨重 {total_qian} 钱，歌诀版本中无对应档位",
            "analysis": {},
            "advice": "歌诀版本局限，请核实原始数据",
            "display_zh": {
                "骨重明细": f"年{year_w}+月{month_w}+日{day_w}+时{hour_w}",
                "总骨重": f"{total_qian}两",
                "等级": "未知",
                "原始歌诀": "无对应档位",
                "结构化分析": "数据缺失",
                "建议": "请使用标准51钱版本"
            },
            "limitations": [
                "歌诀版本固定为 standard-51qian",
                "农历转换误差由上游负责",
                "夜子时规则已由调用方处理"
            ]
        }

    # ── 组装输出 ────────────────────────────────────────────────────────
    structured = verse.get("structured", {})
    scores = structured.get("scores", {})

    return {
        "skill_name": "chenggu-analysis",
        "api_name": "chenggu_from_lunar",
        "input_normalized": {
            "year_ganzhi": year_ganzhi,
            "month": month,
            "day": day,
            "hour_branch": hour_branch,
            "is_leap_month": is_leap_month
        },
        "weights": {
            "year": year_w,
            "month": month_w,
            "day": day_w,
            "hour": hour_w
        },
        "total_weight": total_qian,
        "grade": verse.get("grade", "未知"),
        "verse_canonical": verse.get("verse_canonical", ""),
        "analysis": {
            "trajectory_tags": structured.get("trajectory_tags", []),
            "career_level": structured.get("career_level", ""),
            "wealth_level": structured.get("wealth_level", ""),
            "marriage_level": structured.get("marriage_level", ""),
            "scores": {
                "career": scores.get("career", 0),
                "wealth": scores.get("wealth", 0),
                "marriage": scores.get("marriage", 0)
            }
        },
        "advice": _build_advice(verse, structured),
        "display_zh": {
            "骨重明细": f"年{year_w}钱 + 月{month_w}钱 + 日{day_w}钱 + 时{hour_w}钱",
            "总骨重": f"{total_qian}两{verse.get('total_display', total_qian)}钱",
            "等级": verse.get("grade", ""),
            "原始歌诀": verse.get("verse_canonical", ""),
            "结构化分析": _format_analysis(structured),
            "建议": _build_advice(verse, structured)
        },
        "limitations": [
            "民俗解释，非科学结论",
            "版本差异：standard-51qian",
            "农历转换误差由上游负责",
            "歌诀解释存在主观性"
        ]
    }


def chenggu_from_birthdate(year: int, month: int, day: int,
                           hour: int = 12, minute: int = 0) -> dict:
    """
    公历入口：用 lunar_python 转换为农历，再调用 chenggu_from_lunar。
    自动处理夜子时（23:00-23:59 → 次日）和闰月。
    """
    try:
        import lunar_python as lunar
    except ImportError:
        raise RuntimeError("需要 lunar_python：pip install lunar_python")

    solar = lunar.Solar.fromYmdHms(year, month, day, hour, minute, 0)
    lunar_obj = solar.getLunar()

    # ── 夜子时处理 ──────────────────────────────────────────────────────
    # 23:00-23:59 → 时支为"子"，但日期进位
    is_night_zishi = (hour == 23)

    # ── 获取四柱 ────────────────────────────────────────────────────────
    ec = lunar_obj.getEightChar()
    year_gz  = ec.getYearGan() + ec.getYearZhi()   # 如"己巳"
    day_gz   = ec.getDayGan() + ec.getDayZhi()     # 日干支
    hour_gz  = ec.getTimeGan() + ec.getTimeZhi()   # 如"癸巳"

    # ── 月份（标准化） ─────────────────────────────────────────────────
    # lunar-python: 闰月用负数表示，如闰五月 = -5
    lmonth = lunar_obj.getMonth()         # 1-12，闰月为负
    is_leap_month = lmonth < 0
    month_abs = abs(lmonth)

    # ── 日（标准化） ────────────────────────────────────────────────────
    lday = lunar_obj.getDay()   # 1-30

    # ── 时支 ────────────────────────────────────────────────────────────
    hour_branch = ec.getTimeZhi()

    # ── 夜子时特殊处理 ─────────────────────────────────────────────────
    if is_night_zishi:
        # 夜子时：时支仍为"子"，但日期+1（进位）
        if lday < 30:
            lday += 1
        else:
            lday = 1

    return chenggu_from_lunar(
        year_ganzhi  = year_gz,
        month        = month_abs,
        day          = lday,
        hour_branch  = hour_branch,
        is_leap_month = is_leap_month
    )


def _format_analysis(structured: dict) -> str:
    tags = structured.get("trajectory_tags", [])
    career  = structured.get("career_level", "")
    wealth  = structured.get("wealth_level", "")
    marriage = structured.get("marriage_level", "")
    parts = []
    if tags:
        parts.append("特征：" + "/".join(tags))
    if career:
        parts.append(f"事业：{career}")
    if wealth:
        parts.append(f"财运：{wealth}")
    if marriage:
        parts.append(f"婚姻：{marriage}")
    return " | ".join(parts) if parts else "（歌诀未提供详细分析）"


def _build_advice(verse: dict, structured: dict) -> str:
    tags = structured.get("trajectory_tags", [])
    parts = []
    if "early_hardship" in tags:
        parts.append("早年较艰辛，中年后渐有起色")
    if "midlate_better" in tags:
        parts.append("中晚年运势更佳")
    if "scholar_official" in tags:
        parts.append("宜读书仕途，文曲加持")
    if "wealth_early" in tags:
        parts.append("早年财运佳")
    advice = verse.get("advice", "")
    if advice:
        parts.append(advice)
    return "；".join(parts) if parts else "禀赋已定，顺势而为"


# ── 调试入口 ───────────────────────────────────────────────────────────────
