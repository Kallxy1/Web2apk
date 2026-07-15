import os,sys,zipfile,stat
src,dst=sys.argv[1],sys.argv[2];root=os.path.realpath(dst);os.makedirs(dst,exist_ok=True)
with zipfile.ZipFile(src) as z:
 infos=z.infolist()
 if len(infos)>15000: raise ValueError('Project contains too many files')
 if sum(i.file_size for i in infos)>750*1024*1024: raise ValueError('Extracted project exceeds 750 MB')
 for i in infos:
  target=os.path.realpath(os.path.join(dst,i.filename))
  if not target.startswith(root+os.sep): raise ValueError('Unsafe ZIP path')
  if stat.S_ISLNK(i.external_attr>>16): raise ValueError('Symbolic links are not allowed')
  if i.file_size>250*1024*1024: raise ValueError('A project file is too large')
 z.extractall(dst)
entries=[x for x in os.listdir(dst) if x!='__MACOSX']
if len(entries)==1 and os.path.isdir(os.path.join(dst,entries[0])):
 inner=os.path.join(dst,entries[0])
 if os.path.exists(os.path.join(inner,'settings.gradle')) or os.path.exists(os.path.join(inner,'settings.gradle.kts')):
  for name in os.listdir(inner): os.rename(os.path.join(inner,name),os.path.join(dst,name))
  os.rmdir(inner)
if not (os.path.isfile(os.path.join(dst,'settings.gradle')) or os.path.isfile(os.path.join(dst,'settings.gradle.kts'))): raise ValueError('settings.gradle(.kts) not found at project root')
if not os.path.isfile(os.path.join(dst,'gradlew')): raise ValueError('Gradle wrapper (gradlew) is required')
