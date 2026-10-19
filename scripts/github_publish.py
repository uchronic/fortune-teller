"""Publish checked source using an existing Git credential; never persist or print it.

Not invoked by the site or CI. Run only after local checks and review.
"""
import argparse
import base64
import json
import os
from pathlib import Path
import subprocess
import urllib.request
import urllib.error

ROOT=Path(__file__).resolve().parents[1]
REPO='uchronic/fortune-teller'
BASE='https://api.github.com/repos/'+REPO
parser=argparse.ArgumentParser()
parser.add_argument('--publish',action='store_true')
parser.add_argument('--status',action='store_true')
parser.add_argument('--configure-pages',action='store_true')
parser.add_argument('--expected',default='449739b143f34f54c5bf84fe421fa42bee8780d8')
args=parser.parse_args()
token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
if not token:
    env={**os.environ,'GCM_INTERACTIVE':'never'}
    credential=subprocess.run(['git','credential','fill'],input='protocol=https\nhost=github.com\n\n',text=True,capture_output=True,env=env,timeout=20)
    token=dict(line.split('=',1) for line in credential.stdout.splitlines() if '=' in line).get('password')
if not token: raise SystemExit('No existing GitHub write credential found.')
def api(path,method='GET',data=None):
    req=urllib.request.Request(BASE+path,method=method,data=json.dumps(data).encode() if data is not None else None,
        headers={'Authorization':'Bearer '+token,'User-Agent':'mlss-release','Accept':'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'})
    try:
        with urllib.request.urlopen(req,timeout=60) as response:
            body=response.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        # GitHub's error body does not contain the credential; print no request headers.
        raise RuntimeError(f'GitHub {method} {path}: HTTP {exc.code}: {exc.read().decode()[:500]}') from None
if args.status:
    runs=api('/actions/runs?per_page=3')['workflow_runs']
    print(json.dumps([{'id':r['id'],'sha':r['head_sha'],'status':r['status'],'conclusion':r['conclusion'],'url':r['html_url']} for r in runs]))
    print(json.dumps({'pages':api('/pages')}))
    raise SystemExit()
if args.configure_pages:
    current=api('/pages')
    (ROOT/'.git'/'pages-before.json').write_text(json.dumps(current),encoding='utf-8')
    if current.get('build_type')!='workflow': api('/pages','PUT',{'build_type':'workflow'})
    if api('').get('default_branch')!='main': api('','PATCH',{'default_branch':'main'})
    print('GitHub Pages configured for validated Actions deployment.')
    raise SystemExit()
branch=api('/branches/main')
head=branch['commit']['sha']
if head!=args.expected: raise SystemExit('Source branch changed; review the new head before publishing: '+head)
paths=subprocess.check_output(['git','ls-files','--cached','-z'],cwd=ROOT).decode().split('\0')
entries=[]
for name in filter(None,paths):
    file=ROOT/name
    raw=file.read_bytes()
    if name.endswith('.zip'):
        if not args.publish: continue
        blob=api('/git/blobs','POST',{'content':base64.b64encode(raw).decode(),'encoding':'base64'})
        entries.append({'path':name,'mode':'100644','type':'blob','sha':blob['sha']})
    else:
        text=raw.decode('utf-8-sig')
        if any(s in text for s in ['192.168.'+'1.', '用户'+'本人']):
            raise SystemExit('Private content must be removed before publishing: '+name)
        entries.append({'path':name,'mode':'100644','type':'blob','content':text})
print(json.dumps({'base':head,'source_files':len(paths)-1,'public_tree_entries':len(entries)}))
if not args.publish: raise SystemExit('Dry run only; add --publish after checks pass.')
tree=api('/git/trees','POST',{'base_tree':branch['commit']['commit']['tree']['sha'],'tree':entries})
commit=api('/git/commits','POST',{'message':'Align web tools with MLSS 1.5: shared local algorithms, new tools and validated Pages deployment','tree':tree['sha'],'parents':[head]})
if api('/branches/main')['commit']['sha']!=head: raise SystemExit('Concurrent branch update detected; commit prepared but not published.')
api('/git/refs/heads/main','PATCH',{'sha':commit['sha'],'force':False})
(ROOT/'.git'/'published-main').write_text(commit['sha'])
print(json.dumps({'published':commit['sha'],'url':commit['html_url']}))
