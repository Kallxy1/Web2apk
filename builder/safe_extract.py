import os,sys,zipfile,shutil
src,dst=sys.argv[1],sys.argv[2]
os.makedirs(dst,exist_ok=True)
with zipfile.ZipFile(src) as z:
    for info in z.infolist():
        target=os.path.realpath(os.path.join(dst,info.filename))
        if not target.startswith(os.path.realpath(dst)+os.sep): raise ValueError("Unsafe ZIP path")
        if info.file_size>100*1024*1024: raise ValueError("A file is too large")
    if sum(i.file_size for i in z.infolist())>250*1024*1024: raise ValueError("Extracted ZIP exceeds 250 MB")
    z.extractall(dst)
# Accept ZIPs containing either index.html at root or one wrapping directory.
if not os.path.isfile(os.path.join(dst,"index.html")):
    entries=[x for x in os.listdir(dst) if x!='__MACOSX']
    if len(entries)==1 and os.path.isdir(os.path.join(dst,entries[0])) and os.path.isfile(os.path.join(dst,entries[0],"index.html")):
        inner=os.path.join(dst,entries[0]); tmp=dst+"_flat";shutil.move(inner,tmp);shutil.rmtree(dst);shutil.move(tmp,dst)
if not os.path.isfile(os.path.join(dst,"index.html")): raise ValueError("index.html tidak ditemukan pada root ZIP")
