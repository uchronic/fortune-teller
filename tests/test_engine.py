import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'engine'))
from api import dispatch

SAMPLE={'year':1990,'month':2,'day':14,'hour':12,'minute':0,'gender':'male'}
class ParityTests(unittest.TestCase):
    def test_birth_matches_frozen_hermes_reference(self):
        r=dispatch('birth', SAMPLE)
        self.assertEqual([p['ganzhi'] for p in r['pillars']], ['庚午','戊寅','庚戌','壬午'])
        self.assertEqual(r['wuxing']['strong_weak'], '偏弱')
        self.assertEqual(r['wuxing']['ratio'], .1684)
        self.assertEqual([r['yun'][k] for k in ['years','months','days']], [6,6,20])
        self.assertEqual(r['yun']['cycles'][0]['startAge'], 7)
        self.assertEqual(r['chenggu']['total_weight'], 30)

    def test_invalid_dates_rejected(self):
        for bad in [{'month':2,'day':30},{'hour':24},{'minute':60},{'year':1899}]:
            with self.assertRaises((ValueError,Exception)):
                dispatch('birth', {**SAMPLE,**bad})

    def test_lunar_input_matches_solar(self):
        r=dispatch('birth', {**SAMPLE,'calendar':'lunar','month':1,'day':19})
        self.assertEqual([p['ganzhi'] for p in r['pillars']], ['庚午','戊寅','庚戌','壬午'])

    def test_midnight_conventions_and_minutes(self):
        early=dispatch('birth',{**SAMPLE,'hour':0,'minute':30})
        late0=dispatch('birth',{**SAMPLE,'hour':23,'sect':2})
        late1=dispatch('birth',{**SAMPLE,'hour':23,'sect':1})
        self.assertNotEqual(late0['pillars'][2]['ganzhi'],late1['pillars'][2]['ganzhi'])
        self.assertIn('00:30',early['solar'])

    def test_meihua_reference(self):
        r=dispatch('meihua',{'year':2026,'month':9,'day':17,'hour':15,'minute':23})
        self.assertTrue(r['本卦'].startswith('水山蹇'))
        self.assertTrue(r['互卦'].startswith('火水未济'))
        self.assertTrue(r['变卦'].startswith('水火既济'))
        self.assertEqual(r['动爻'],'第1爻')

    def test_qimen_reference_and_month_end(self):
        r=dispatch('qimen',{'year':2024,'month':6,'day':15,'hour':14,'minute':30})
        self.assertEqual(r['排局'],'陽遁六局上')
        self.assertEqual(r['干支'],'甲辰年庚午月庚戌日癸未時')
        for month,day in [(1,31),(2,28),(12,31)]:
            r=dispatch('qimen',{'year':2026,'month':month,'day':day,'hour':23,'minute':30})
            self.assertTrue(r['排局'])

    def test_calendar_and_classics(self):
        r=dispatch('calendar',{'year':2026,'month':10,'day':19,'hour':12})
        self.assertGreaterEqual(len(r['times']),12)
        self.assertTrue(any(t['luck']=='吉' for t in r['times']))
        hits=dispatch('classics',{'query':'紫微'})
        self.assertEqual(hits['total'],75)
        self.assertTrue(hits['hits'][0]['book_title'])

    def test_compatibility(self):
        r=dispatch('compatibility',{'a':SAMPLE,'b':{**SAMPLE,'gender':'female'}})
        self.assertEqual(r['relation'],'五行相同')
        self.assertTrue(r['a']['yun']['forward'])
        self.assertFalse(r['b']['yun']['forward'])

if __name__=='__main__': unittest.main(verbosity=2)
