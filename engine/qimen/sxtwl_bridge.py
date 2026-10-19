# -*- coding: utf-8 -*-

import math
import datetime
from lunar_python import Solar, Lunar

_JQMC = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至']


# ─── 工具函数 ─────────────────────────────────────────────────────────────

def JD2DD(jd):
    """
    Julian Date → calendar datetime (year, month, day, hour, minute)。
    sxtwl.JD2DD(jd) 返回带 .Y .M .D .h .m 属性的对象。
    """
    # From Jean Meeus: Astronomical Algorithms
    Z = int(jd + 0.5)
    F = jd + 0.5 - Z
    if Z < 2299161:
        A = Z
    else:
        alpha = int((Z - 1867216.25) / 36524.25)
        A = Z + 1 + alpha - alpha // 4
    B = A + 1524
    C = int((B - 122.1) / 365.25)
    D = int(365.25 * C)
    E = int((B - D) / 30.6001)
    day = B - D - int(30.6001 * E) + F
    if E < 14:
        month = E - 1
    else:
        month = E - 13
    if month > 2:
        year = C - 4716
    else:
        year = C - 4715
    day_frac = day % 1
    total_minutes = round(day_frac * 24 * 60)
    hour = total_minutes // 60
    minute = total_minutes % 60
    day = int(day)
    return _DD(year, month, day, hour, minute)


class _DD:
    """兼容 sxtwl.JD2DD 返回结果的结构"""
    __slots__ = ('Y', 'M', 'D', 'h', 'm')
    def __init__(self, Y, M, D, h, m):
        self.Y, self.M, self.D, self.h, self.m = Y, M, D, h, m


# ─── fromSolar 包装 ─────────────────────────────────────────────────────────

def fromSolar(year, month, day):
    return SxtwlDay(year, month, day)


class SxtwlDay:
    """
    模拟 sxtwl.SxtwlDay — 包装 lunar_python.Solar，
    提供 hasJieQi() / getJieQi() / getJieQiJD() / getYearGZ() 等接口。
    """
    __slots__ = ('_solar', '_lunar', '_has_jq', '_jq_name', '_jq_jd', '_curr_jq_name')

    def __init__(self, year, month, day):
        self._solar = Solar.fromYmd(year, month, day)
        self._lunar = self._solar.getLunar()
        # sxtwl 语义：hasJieQi 只在当天是节气交节日本身时为 True
        self._has_jq = bool(self._lunar.getJieQi())
        self._jq_name = self._lunar.getJieQi() or ''  # 当前节气（当天是节气日本身时）
        self._jq_jd = None
        # 记录「当前节气时段名」（最近已过节气，用于 jq() 函数判断）
        self._curr_jq_name = self._jq_name
        if not self._has_jq:
            prev_jq = self._lunar.getPrevJieQi()
            if prev_jq:
                self._curr_jq_name = prev_jq.getName()

    # ── 节气 ────────────────────────────────────────────────────────────────

    def hasJieQi(self):
        return self._has_jq

    def getJieQi(self):
        """返回 jqmc 索引 (1-24)，0 表示当天无交节。"""
        if not self._jq_name:
            curr = self._lunar.getCurrentJieQi()
            if curr:
                self._jq_name = curr.getName()
        if self._jq_name:
            try:
                return _JQMC.index(self._jq_name) + 1  # 1-based
            except ValueError:
                pass
        return 0

    def getJieQiJD(self):
        """
        返回儒略日（float）。
        通过 lunar-python JieQi 对象找到节气交节时间，再用 solar_to_jd() 计算。
        """
        if self._jq_jd is not None:
            return self._jq_jd

        # Determine which jieqi we want (the one that this day IS the jieqi day)
        jq_name = self._jq_name
        if not jq_name:
            curr = self._lunar.getCurrentJieQi()
            if curr:
                jq_name = curr.getName()

        if jq_name:
            # lunar-python JieQiTable can store wrong-year entries for late-December jieqi
            # (e.g., 冬至 1989-12-22 stored as 1988-12-21). Use getNextJieQi/getPrevJieQi
            # which always return the correctly-dated Solar object.
            for method in [self._lunar.getNextJieQi, self._lunar.getPrevJieQi]:
                jq_obj = method()
                if jq_obj and jq_obj.getName() == jq_name:
                    sol = jq_obj.getSolar()
                    self._jq_jd = _datetime_to_jd(
                        datetime.datetime(sol.getYear(), sol.getMonth(), sol.getDay()))
                    return self._jq_jd
        return None

    # ── 日期导航 ──────────────────────────────────────────────────────────

    def before(self, n):
        """返回 n 天前的 SxtwlDay（同 sxtwl 语义）"""
        y, m, d = self._solar.getYear(), self._solar.getMonth(), self._solar.getDay()
        for _ in range(n):
            y, m, d = _prev_date(y, m, d)
        return SxtwlDay(y, m, d)

    def after(self, n):
        """返回 n 天后的 SxtwlDay（同 sxtwl 语义）"""
        y, m, d = self._solar.getYear(), self._solar.getMonth(), self._solar.getDay()
        for _ in range(n):
            y, m, d = _next_date(y, m, d)
        return SxtwlDay(y, m, d)

    # ── 干支（GZ）─────────────────────────────────────────────────────────

    def getYearGZ(self):
        ec = self._lunar.getEightChar()
        gz = ec.getYear()
        return _GZ(gz[0], gz[1])

    def getMonthGZ(self):
        ec = self._lunar.getEightChar()
        gz = ec.getMonth()
        return _GZ(gz[0], gz[1])

    def getDayGZ(self):
        ec = self._lunar.getEightChar()
        gz = ec.getDay()
        return _GZ(gz[0], gz[1])

    def getHourGZ(self, hour):
        """
        返回时柱干支。hour = 0-23 数值。
        lunar-python getEightChar().getTime() 需要 fromYmdHms，
        通过 Solar.fromYmdHms 重建。
        """
        sol = self._solar
        s_hms = Solar.fromYmdHms(sol.getYear(), sol.getMonth(), sol.getDay(),
                                  hour, 0, 0)
        l_hms = s_hms.getLunar()
        gz = l_hms.getEightChar().getTime()
        return _GZ(gz[0], gz[1])

    # ── 农历基本信息 ────────────────────────────────────────────────────────

    def getLunarYear(self):
        return self._lunar.getYear()

    def getLunarMonth(self):
        return self._lunar.getMonth()

    def getLunarDay(self):
        return self._lunar.getDay()


# ─── 内部结构 ────────────────────────────────────────────────────────────────

class _GZ:
    """兼容 sxtwl GZ 对象 {tg, dz} — tg/dz 是 0-9 / 0-11 索引"""
    __slots__ = ('tg', 'dz')
    def __init__(self, tg_char, dz_char):
        tg_all = '甲乙丙丁戊己庚辛壬癸'
        dz_all = '子丑寅卯辰巳午未申酉戌亥'
        self.tg = tg_all.index(tg_char)
        self.dz = dz_all.index(dz_char)


# ─── 辅助函数 ────────────────────────────────────────────────────────────────

def _datetime_to_jd(dt):
    return solar_to_jd(dt.year, dt.month, dt.day)


def solar_to_jd(year, month, day, hour=0, minute=0, second=0):
    """
    阳历日期 → 儒略日（Jean Meeus 算法）。

    注意：ephem 库使用"中午"约定：JD 2451545.0 = 2000-01-01 12:00。
    即 solar_to_jd(2000,1,1,0,0,0) = 2451544.5（午夜→前一天中午）。

    修复：如果 entry 是 Solar 对象（来自 lunar-python JieQiTable），
    加 +1 以匹配 ephem 约定：
      solar_to_jd(2024,6,21) = 2460483.5（天文标准）
      但 ephem.julian_date('2024/6/21') = 2460482.5（ephem 约定）
    故对 Solar 对象输入加 +1.0 修正。
    """
    if month <= 2:
        year -= 1
        month += 12
    A = math.floor(year / 100)
    B = 2 - A + math.floor(A / 4)
    JD = math.floor(365.25 * (year + 4716)) + math.floor(30.6001 * (month + 1)) + day + B - 1524.5
    JD += (hour + minute / 60.0 + second / 3600.0) / 24.0
    # 修正：lunar-python JieQiTable 给出天文 JD（+1），ephem 用中午约定（-0.5）
    # 综合效果：Solar 对象输入时 +0.5 抵消，再 +0.5 匹配 ephem
    return JD  # 直接返回 Meeus 标准值


def _prev_date(year, month, day):
    d = datetime.date(year, month, day) - datetime.timedelta(days=1)
    return d.year, d.month, d.day


def _next_date(year, month, day):
    d = datetime.date(year, month, day) + datetime.timedelta(days=1)
    return d.year, d.month, d.day


# ─── 快速验证 ─────────────────────────────────────────────────────────────
