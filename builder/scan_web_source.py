import os,sys
root=sys.argv[1];blocked={'.exe','.dll','.com','.bat','.cmd','.ps1','.sh','.so','.dylib','.jar','.class','.apk','.aab','.msi'};count=0;total=0
for base,dirs,files in os.walk(root):
 dirs[:]=[d for d in dirs if d not in {'.git','node_modules'}]
 for name in files:
  count+=1;path=os.path.join(base,name);total+=os.path.getsize(path);ext=os.path.splitext(name)[1].lower()
  if ext in blocked: raise SystemExit(f'Blocked executable/binary file: {os.path.relpath(path,root)}')
  if count>10000: raise SystemExit('Source contains more than 10,000 files')
  if total>300*1024*1024: raise SystemExit('Source exceeds 300 MB after extraction')
print(f'Source scan passed: {count} files, {total/1024/1024:.1f} MB')
