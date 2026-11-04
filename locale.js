'use strict';
const webEnglish={
 '浏览器未能启动三维引擎。请更新 Chrome，选择均衡画质并关闭其他大应用后重试。':'The 3D engine could not start. Update Chrome, choose Balanced graphics and close other large apps before retrying.',
 'EZSVS · 入职第一天':'EZSVS · Your First Day',
 '入职第一天三维培训场景':'Your First Day: 3D safety training',
 'EZSVS · 守石人培训':'EZSVS · SITE TEAM INDUCTION',
 '入职第一天':'Your First Day',
 '先守住安全，再守好机房。':'Safety first. Reliable operations follow.',
 '跟随带教走进入场登记、机房巡检、变更作业和应急演练。':'Learn with your mentor: access registration, inspections, change control and emergency response.',
 '把二十条运维红线，用一次亲身经历记住。':'Experience the twenty safety red lines, one decision at a time.',
 '约 15 分钟':'About 15 minutes', '电脑 / 安卓平板':'PC / Android tablet', '本机自动存档':'Progress saved on this device',
 '学员姓名':'Trainee name','用于结业证书，可留空':'For the certificate; optional','请输入姓名':'Enter your name',
 '画质':'Graphics','自动 · 按设备选择':'Auto · Match this device','精细 · 更清晰的阴影与画面':'High · Sharper visuals and shadows','均衡 · 推荐安卓平板':'Balanced · Recommended for tablets',
 '进入培训 →':'Enter Training →','正在准备场景…':'Preparing the scene…',
 '首次进入需要加载素材；之后浏览器会尽量复用缓存。':'Assets download on first launch; the browser can reuse cached files later.',
 '培训记录保存在当前浏览器，换设备前请导出存档。':'Progress stays in this browser. Export it before changing devices.',
 '01 / 安全准入':'01 / SAFE ACCESS', '没授权不进':'No authorization? No entry.', '没审批不动':'No approval? No equipment work.', '拿不准，先停下来问。':'If unsure, stop and ask.',
 '网页工具':'Web tools','网页菜单':'Web Menu','全屏 / 退出全屏':'Enter / Exit Fullscreen','导出存档':'Export Progress','导入存档':'Import Progress','操作说明':'Controls & Help','保存并重新加载':'Save & Reload','存档只保存在此浏览器':'Progress is stored in this browser only',
 '电脑：WASD 或点地行走，右键拖动转视角，E 交谈 / 开门，G 前往目标，H 红线手册。':'PC: WASD or click to move. Right-drag to look. E to talk / open doors, G to guide you to the objective, H for the safety handbook.',
 '触屏：左下拖动行走，右侧空白处拖动转视角，点击人物交谈；靠近门后点击开门提示。建议横屏。':'Touch: drag bottom left to move, drag an empty area on the right to look, tap a person to talk. Approach a door and tap its prompt to open it. Landscape is recommended.',
 '游戏内手册可调音乐、音效并保存返回标题。清除浏览器数据会删除本机记录，请定期导出存档。':'The in-game handbook includes volume settings and Save & Return to Title. Clearing browser data removes local progress. Export a backup regularly.',
 '知道了':'Got It','浏览器暂不支持全屏，请使用横屏窗口。':'Fullscreen is unavailable. Please use a landscape window.',
 '存档为空或过大':'Progress file is empty or too large','存档校验失败':'Progress checksum failed','不是本游戏的有效存档':'This is not a valid progress file for this game',
 '存档已交给浏览器下载。':'Progress sent to the browser for download.','尚无有效培训存档，请先开始培训。':'No saved progress yet. Start the training first.',
 '存档过大':'Progress file is too large','导入后将恢复这份培训进度，并替换当前浏览器进度。继续吗？':'Import this progress and replace the progress in this browser?',
 '无法导入：':'Unable to import: ','已保存到本机 · ':'Saved on this device · ','浏览器未能保存进度。请导出存档，避免清理浏览器数据。':'The browser could not save progress. Export a backup and avoid clearing browser data.',
 '素材下载失败：':'Asset download failed: ','素材分片不完整，请重试':'Incomplete asset file. Please retry.','加载场景素材 ':'Loading scene assets ',
 '请通过本地预览服务或 GitHub Pages 链接打开，不能直接双击 HTML。':'Open through a local web server or GitHub Pages link, not by double-clicking the HTML file.',
 '此浏览器未启用 WebGL 2。请使用最新版 Chrome 或 Edge，并检查硬件加速。':'WebGL 2 is unavailable. Use an up-to-date Chrome or Edge browser with hardware acceleration enabled.',
 '准备图形引擎…':'Preparing graphics…','引擎加载失败，请检查网络后重试':'Engine download failed. Check the connection and retry.',
 '运行异常，请从网页菜单保存进度后重新加载。':'A runtime error occurred. Save progress from the Web Menu, then reload.',
 '正在展开场景与人物… ':'Preparing the scene and characters… ','无法进入：':'Unable to start: ',
 '\n可刷新重试；尚未开始的培训不会计入成绩。':'\nRefresh to retry. Training that has not started does not affect your results.', '重试加载':'Retry Loading',
 '切换语言会保存进度并重新加载，随后点击“继续上次培训”。':'Switching language saves progress and reloads. Choose Continue on the title screen.',
};
let webLanguage='zh';
try{webLanguage=localStorage.getItem('ezsvs-language')==='en'?'en':'zh';}catch(e){}
const urlLanguage=new URLSearchParams(location.search).get('lang');
if(urlLanguage==='en'||urlLanguage==='zh')webLanguage=urlLanguage;
function tr(text){return webLanguage==='en'?(webEnglish[text]??text):text;}
function applyWebLanguage(){
 document.documentElement.lang=webLanguage==='en'?'en':'zh-CN';document.title=tr('EZSVS · 入职第一天');
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));
 document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=tr(el.dataset.i18nPlaceholder));
 document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',tr(el.dataset.i18nAria)));
 document.getElementById('language').value=webLanguage;
 document.getElementById('switch-language').textContent=webLanguage==='en'?'切换为中文':'Switch to English';
}
applyWebLanguage();
