"""Date-only compatibility for kinqimen: no astronomical positions are simulated.

The audited jieqi.py uses ephem only for Date normalization and tuple(), including
overflowing month-end dates. Solar terms still come from frozen lunar-python.
"""
import datetime
import re

EPOCH = datetime.datetime(1899, 12, 31, 12)

class Date:
    def __init__(self, value):
        if isinstance(value, (float, int)):
            self.value = EPOCH + datetime.timedelta(days=value)
        elif isinstance(value, Date):
            self.value = value.value
        else:
            y, m, d, h, mi, s = map(float, re.split(r'[/ :]', str(value)))
            self.value = datetime.datetime(int(y), int(m), 1) + datetime.timedelta(days=d-1, hours=h, minutes=mi, seconds=s)

    def __float__(self):
        return (self.value-EPOCH).total_seconds()/86400

    def __round__(self, places=0):
        return round(float(self), places)

    def tuple(self):
        d = self.value
        return (d.year, d.month, d.day, d.hour, d.minute, d.second+d.microsecond/1e6)
