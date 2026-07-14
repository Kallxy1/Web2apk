import fs from "node:fs";import path from "node:path";
const root=process.env.WORK_DIR;if(!root)throw new Error("WORK_DIR missing");
const values={
 "__PACKAGE_NAME__":process.env.PACKAGE_NAME,
 "__VERSION_CODE__":process.env.VERSION_CODE,
 "__VERSION_NAME__":process.env.VERSION_NAME,
 "__ORIENTATION__":process.env.ORIENTATION,
 "__THEME_COLOR__":process.env.THEME_COLOR,
 "__APP_NAME__":xml(process.env.APP_NAME||"Web App"),
 "__START_URL__":java(process.env.MODE==="zip"?"file:///android_asset/www/index.html":process.env.SOURCE||""),
 "__ALLOW_FILE__":process.env.MODE==="zip"?"true":"false"
};
function xml(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
function java(s){return s.replaceAll("\\","\\\\").replaceAll('"','\\"');}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(java|gradle|xml)$/.test(p)){let t=fs.readFileSync(p,"utf8");for(const [a,b] of Object.entries(values)){if(b==null)throw new Error(`Missing value for ${a}`);t=t.replaceAll(a,b);}fs.writeFileSync(p,t);}}}
walk(root);
