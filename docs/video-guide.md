# 演示视频录制指南（最长 15 分钟）

评分要求原文（PDF Deliverables → Demo video）：

> "In your video (max of 15 minutes), demonstrate your understanding of the concepts and code
> development by addressing these key questions."
>
> 1. **Database and API architecture** — 解释数据库 schema 怎么支撑这个慈善活动案例，RESTful 端点怎么给首页/搜索/详情三个页面取数。可以展示 schema/SQL 文件、过一遍 Node/Express 的 API 逻辑、用浏览器或 Postman 测一个关键端点（比如搜索筛选）。
> 2. **Data flow** — 解释网站怎么和 API 交互，从发起请求、到收到响应、再到渲染到页面上。可以展示发请求的代码、接收响应的代码、渲染成 HTML 的代码。
> 3. **Website functionality demo** — 演示首页、搜索页、详情页的实际操作，重点是搜索里的数据筛选和校验。
>
> "Upload your video to your SCU OneDrive and create a sharable link to it."

视频建议**用英文讲**（这是 SCU 的课，评分老师是英文母语）。下面每段都给了可以直接念的英文台词，中文部分是给你的操作提示。

---

## 第一部分：录之前的准备（15 分钟）

### 1. 把环境跑起来

1. 双击 `D:\PROG2002-A2\start-everything.bat`
2. 等它自动打开浏览器 <http://localhost:3000/>，确认首页有活动卡片
3. **那个黑色 MySQL 窗口不要关**

### 2. 把要展示的窗口提前开好（录制时直接切，不用来回找）

按这个顺序打开，录的时候一个一个切：

| 序号 | 窗口 | 开到哪儿 |
|---|---|---|
| ① | VS Code，打开 `D:\PROG2002-A2` | 依次打开这几个标签页：`database/charityevents-db.sql`、`api/event_db.js`、`api/server.js`、`api/routes/events.js`、`clientside/js/api.js`、`clientside/js/home.js` |
| ② | 浏览器 <http://localhost:3000/> | 首页 |
| ③ | 浏览器 <http://localhost:3000/search.html> | 搜索页（另开一个标签） |
| ④ | 浏览器 <http://localhost:3000/event.html?id=5> | 详情页（另开一个标签） |
| ⑤ | Postman | 空白就行，录的时候新建请求 |
| ⑥ | 这份脚本（打印出来或者放手机上看） | — |

### 3. 两个能明显加分的小设置

- **VS Code 字号调大**：`Ctrl` + `+` 连按几次，让代码在 1080p 录制下也能看清。评分老师看不清代码等于白讲。
- **Postman 字号**：Settings（齿轮）→ Font Size 调到 16–18。

### 4. 关掉干扰项

- 退出微信/QQ（弹窗会录进去）
- 关掉系统通知：Windows 设置 → 系统 → 通知 → 打开"专注助手/勿扰"

---

## 第二部分：OBS 录制设置（机器上已装好）

OBS 装在 `C:\Program Files\obs-studio\bin\64bit\obs64.exe`（也可以开始菜单搜 "OBS Studio"）。

### 第一次打开要做的配置

1. **启动 OBS**，弹出"自动配置向导" → 选 **"只录制，不直播"**（Optimize just for recording）→ 下一步到底。

2. **设置 → 输出**（Output）
   - 录制格式：**mp4**
   - 视频编码器：如果有 NVIDIA 显卡选 **Hardware (NVENC)**；没有就选 **Software (x264)**
   - 音频编码器：**AAC**
   - 视频比特率：6000–10000 Kbps（1080p 的话）

3. **设置 → 视频**（Video）
   - 输出分辨率（Output/Scaled）：**1920x1080**（文件会比较大；想省事选 1280x720 也够用）
   - 帧率：**30 fps**

4. **设置 → 音频**（Audio）
   - 麦克风（Mic/Auxiliary Audio）：选你的耳机麦或笔记本麦克风
   - 桌面音频（Desktop Audio）：默认即可
   - **录完后一定要确认麦克风有电平跳动**（OBS 主界面底部混音器里有绿色条在动）

5. **添加画面来源**：主界面"来源"（Sources）点 **+** → **显示器采集**（Display Capture）→ 确定 → 选你的主显示器 → 确定。
   > 如果黑屏（笔记本常见），改用 **窗口采集**（Window Capture），然后手动选要录的窗口。缺点是切换窗口时要改设置，所以优先用显示器采集。

6. **麦克风音量**：主界面混音器里，说话时看麦克风那条是不是在黄绿区间。太红会爆音。
   - 可以点麦克风旁边的齿轮 → 高级音频属性 → 给麦克风加一个 **"噪声抑制"** 滤镜（Filters → + → Noise Suppression），能去掉风扇声。

7. **先录 30 秒测试**：点"开始录制" → 随便说两句、切一下窗口 → "停止录制" → 去 **文件 → 显示录制文件** 打开看一遍，确认：有声音、画面清晰、代码看得清。
   **这一步别省**，录完 15 分钟才发现没声音是最惨的。

### 正式录制

- 点 **开始录制**，然后**先在镜头前停 2 秒**再说第一句话（方便后期剪掉开头）
- 讲错了**不要停**，停顿两秒从上一句重说一遍，后期剪掉即可（比反复重录省时间）
- 鼠标移动**慢一点**，划过关键代码时停一下
- 结尾说完停 2 秒再点 **停止录制**

---

## 第三部分：15 分钟逐段脚本

> 时间轴是建议值。宁可**讲完 13 分钟也不要超 15 分钟**——超时会被扣分。

---

### 0:00 – 0:40　开场

**画面**：浏览器首页，或 VS Code

**台词**（照念即可，括号里替换成你自己的信息）：

> "Hello, my name is (你的名字), student ID (你的学号). This is my demonstration video for
> PROG2002 Web Development II, Assessment 2 — the Charity Events website.
>
> In the next fifteen minutes I will cover three things. First, the backend architecture —
> how I designed the MySQL database and the RESTful API. Second, the data flow — how the
> website talks to that API and renders the response. And third, a live demo of the three
> pages, with a focus on search filtering and validation.
>
> Just to state the constraints up front: I used Node.js and Express for the server only.
> There is no templating engine — no EJS or Pug — and the client side uses no framework at
> all. It is plain HTML, CSS and vanilla JavaScript with fetch and the DOM."

---

### 0:40 – 5:30　第 1 段：数据库与 API 架构（ULO3: Plan & design）

**画面 0:40–2:00**：切到 VS Code 的 `database/charityevents-db.sql`

边滚动边讲：

> "This is the single SQL file that builds the whole database. It creates `charityevents_db`
> with three tables.
>
> `organisations` — the charities running the events. `categories` — the event type,
> which is what the search dropdown is built from. And `events` — one row per event.
>
> The two relationships are here: `events.organisation_id` references `organisations`,
> and `events.category_id` references `categories`. Both are real foreign keys, so an
> event cannot exist without a valid organiser and category.
>
> The reason I split the category into its own table instead of storing a text label on
> every event row is that the search page needs a dropdown of categories. If the labels
> lived on the events table I would have to scan every event and de-duplicate them, and
> renaming a category would mean updating many rows. This way the dropdown is one simple
> query, and there is one place to change a name."

滚到 events 表定义，指出字段：

> "On the events table, `event_date` is what decides upcoming versus past — I compare it
> against `CURDATE()` inside the SQL rather than in JavaScript, so the home page and the
> search page can never disagree.
>
> `goal_amount` and `raised_amount` are stored separately rather than storing a percentage.
> The percentage is *derived* — that is a calculated value, and storing it would risk it
> going stale. The API works it out when it builds the response.
>
> And `status` — this is how the requirement about suspended events is met. Let me show you
> that in a moment."

**画面 2:00–3:00**：切到 Postman，新建请求

操作：点 `+` 新标签 → GET → 输入 `http://localhost:3000/api/events` → Send

> "Here is the endpoint the home page calls. Note it only returns upcoming events —
> today is the third of October, so everything before that is excluded.
>
> Now let me try to fetch the suspended event directly by its id."

操作：把 URL 改成 `http://localhost:3000/api/events/13` → Send

> "Event 13 exists in the database — I can prove that in a second — but the API returns
> 404 Not Found. That is deliberate: the filter is in the SQL `WHERE` clause, not in the
> front-end JavaScript. So even if someone types the id into the URL by hand, the event
> cannot be reached. Hiding it only in the browser would be a security-through-obscurity
> mistake."

（可选，加分）切到终端或 Workbench 执行 `SELECT event_id, name, status FROM events WHERE status='suspended';` 证明 13 号确实存在。

**画面 3:00–4:30**：切到 VS Code 的 `api/server.js` 和 `api/routes/events.js`

> "This is `server.js`. Express is doing two jobs and nothing else — mounting the route
> modules under `/api`, and serving the `clientside` folder as static files. There is no
> `app.set('view engine', ...)` anywhere, because every page is a real `.html` file.
>
> In `routes/events.js`, these are the four endpoints:
>
> `GET /api/events` for the home page,
> `GET /api/events/past` for the finished events,
> `GET /api/events/:id` for the detail page,
> and `GET /api/events` with query parameters for search.
>
> The important design decision is the search one. I did **not** create a separate URL for
> every filter — no `/events/by-date` or `/events/by-location`. A filter is not a new
> resource; it is a different view of the same resource. So `date`, `location` and
> `category` are query parameters on the same URL, and any one, two or three of them can
> be combined. That is what makes it RESTful.
>
> Every value is bound with a `?` placeholder — nothing is concatenated into the SQL
> string, which is what protects against SQL injection."

**画面 4:30–5:30**：回到 Postman，演示搜索端点

操作 1：`http://localhost:3000/api/events?location=Robina` → Send

> "Searching for Robina returns two events — the concert in November and the auction in
> February. Both are in the Robina suburb."

操作 2：`http://localhost:3000/api/events?category=2&date=2026-12-05` → Send

> "Now a combined query — category 2 is Gala Dinner, and the date is the fifth of
> December. One result, the White Coat Ball."

操作 3：`http://localhost:3000/api/events?category=abc` → Send

> "And if I pass something that isn't a number, the API returns 400 Bad Request with a
> clear message instead of crashing or returning everything. Validation belongs on the
> server, because the client can always be bypassed."

---

### 5:30 – 9:00　第 2 段：数据流（ULO1 Apply & ULO3 Develop）

**画面 5:30–7:00**：切到 `clientside/js/api.js`

> "All three pages share this file. `fetchJSON` is my wrapper around `fetch`. `fetch` returns
> a promise, so I await it, check `response.ok`, and only then parse the JSON. If the
> server returns 404 or 400 I throw an error with the message the API sent, so the page
> can show the server's own explanation rather than a generic failure.
>
> Centralising this means every page handles errors the same way, and the base URL lives in
> one place."

**画面 7:00–8:00**：切到 `clientside/js/home.js`

> "This is the home page. It needs two lists at once — upcoming and past — so it fires
> both requests and waits with `Promise.all`. They run in parallel rather than one after
> the other, so the page is ready sooner.
>
> Then each event object goes into `renderEventGrid`, which calls `createEventCard` for
> every row — that is where the data becomes pixels."

**画面 8:00–9:00**：切回 `api.js` 里的 `buildEventCard`，然后打开浏览器 DevTools

> "In `createEventCard` I am not using `innerHTML` with a template string. Every element is
> created with `document.createElement`, text goes in through `textContent`, and the card
> is assembled piece by piece. That matters for two reasons: it is safe — event data coming
> from the database can never be interpreted as HTML — and it is the DOM manipulation the
> unit asks us to demonstrate.
>
> Let me show you the whole round trip live."

操作：浏览器首页 → `F12` → Network 标签 → `Ctrl+R` 刷新 → 点 `events` 那条请求

> "Here is the request the page made, and here is the JSON the server sent back. You can
> see `progress_percentage` has been calculated for me, the category is nested with its
> image path, and `is_past` is already worked out. On the right, that same JSON is now
> these cards on the page — that is the complete flow: request, response, DOM."

---

### 9:00 – 13:30　第 3 段：功能演示（ULO3: Complete dynamic website）

**画面 9:00–10:00**：首页

> "The home page. The organisation introduction at the top is static HTML — that content
> does not change, so there is no reason to fetch it. Everything below comes from the API.
>
> Upcoming events first. Each card links to the detail page with the id in the query
> string — `event.html?id=5`. Using a query string rather than local storage means the
> link works if you bookmark it, share it, or open it in a new tab.
>
> Scroll down — past events. These are pulled from `/api/events/past`, and they are styled
> de-saturated so you can tell at a glance which ones have already happened."

**画面 10:00–12:30**：搜索页（**这段是重点，讲慢一点**）

操作 1：什么都不填，直接点 Search

> "Submitting with nothing selected returns the full upcoming list. That's intentional —
> an empty form means 'no filters', not 'no results'."

操作 2：只选 Category = Fun Run → Search

> "One filter on its own. Two results — the Twilight 10K in October and the New Year Turtle
> Run in January. The June fun run is not here because it has already happened."

操作 3：加上 Location = Robina → Search

> "Now two conditions combined — but there are no fun runs in Robina, so zero results, and
> the page tells me that instead of just showing a blank area, along with a hint about
> widening the search."

操作 4：点 **Clear Filters**

> "Clear Filters resets the form and reloads the full list — that's the DOM manipulation
> requirement. Note it also clears the results message."

操作 5：只填 Date = 2026-11-07 → Search

> "A date on its own. One result — the Coastal Food Festival on the seventh of November.
> The date filter matches that exact day, not everything after it, which is what you want
> when you are looking for something to attend."

操作 6：故意触发校验 —— 把 Date 改成一个过去的日期（比如 2020-01-01）→ Search

> "And here is the validation. The date is rejected **before** any request is sent, and the
> message explains why: pick today or a future date, because finished events are listed on
> the home page. I validate on the client for a fast response, and the API validates again
> on the server — client-side validation is for the user's convenience, server-side
> validation is for correctness."

操作 7：点 Clear Filters → 选 Category = Charity Concert → Search → 点进一个详情页

**画面 12:30–13:30**：详情页

> "The detail page read the id from the URL, requested that one event, and filled in the
> hero, the facts panel and the fundraising progress bar. The progress bar is derived from
> `raised_amount` over `goal_amount` — I stored the two amounts, not the percentage.
>
> And the Register button — clicking it opens a modal with the registration fields and the
> 'This feature is currently under construction' message, as the brief specifies. The
> fields are disabled so it is obvious this is a placeholder, and Assessment 3 is where it
> becomes real."

（加分）在地址栏把 id 改成 13 → 回车 → 显示 not found

> "And the suspended event — the page handles the 404 gracefully rather than showing a
> broken layout."

---

### 13:30 – 14:30　收尾

> "To summarise. Three tables in third normal form with foreign keys, four GET-only
> endpoints with filtering done through query parameters and all values parameterised, and
> three pages of plain HTML, CSS and vanilla JavaScript that build everything with
> `document.createElement`.
>
> Two problems worth mentioning from the build. The first was dates: I originally
> serialised them with `toISOString()`, which converts to UTC, so every event in UTC+8
> showed one day earlier than it should. I fixed it by formatting the date from the local
> `getFullYear`, `getMonth` and `getDate` values instead. The second was that MySQL returns
> `DECIMAL` columns as strings, so arithmetic on the fundraising figures produced string
> concatenation rather than a sum — I set `decimalNumbers: true` on the connection pool to
> fix that properly.
>
> Thank you for watching."

---

## 第四部分：上传到 SCU OneDrive 并生成分享链接

1. 浏览器打开 <https://office.com> → 用**学校账号**（`xxx@scu.edu.au`，不是个人微软账号）登录
2. 点左上角的 **应用启动器**（九宫格）→ **OneDrive**
3. 进入 **My files**，点 **上传 → 文件**，选中你录好的 mp4
   - 如果文件超过几百 MB、上传慢，可以先压缩：OBS 录完的文件用"照片"应用或者 HandBrake 转一下；或者录制时把分辨率设为 720p
4. 上传完成后，**鼠标悬停**在那个视频上 → 点**三个点**（`...`）→ **共享**（Share）
   - 或者选中文件 → 顶部 **共享** 按钮
5. 在弹出面板里点 **"复制链接"** 下方的小齿轮 / **链接设置**（Link settings）
6. 权限改成下面**其中一个**：
   - **"Anyone with the link"（知道链接的任何人）** ← 最省事，老师一定能打开
   - 或 **"People in Southern Cross University with the link"（组织内任何人可查看）** ← 更安全，但要求老师用学校账号登录
   - 勾选 **"Allow editing" 不要勾**
7. 点 **应用** → **复制链接**
8. **务必自己验证**：把链接粘到**无痕窗口**（或者发给同学）打开，确认能直接播放、不需要登录
   - 打不开 = 交上去等于没交，这一步不能省
9. 把这个链接填进 Blackboard 的提交框（PDF 说交 "A video file/link"）

### 如果 Blackboard 要求传文件而不是链接

有些老师的提交框只收文件。那就把 mp4 直接上传（注意 Blackboard 通常有文件大小上限，一般 250MB–1GB）。720p / 15 分钟大概 300–600MB，如果超限，用 OBS 重新导出时把分辨率调成 1280x720、比特率调到 2500 Kbps，能压到 200MB 以内。

---

## 最后检查清单

录完、传完，对照打勾：

- [ ] 时长 **≤ 15 分钟**（超了一定扣分）
- [ ] 声音清晰，没有爆音，环境安静
- [ ] 代码在视频里看得清（字号够大）
- [ ] 三段要求都讲到了：**数据库/API 架构**、**数据流**、**三页功能演示**
- [ ] 明确演示了 **Postman 或浏览器测 API**（PDF 原文要求的）
- [ ] 明确演示了 **搜索筛选 + 校验**（PDF 特别点名的）
- [ ] 提到了技术约束（无框架、无模板引擎）
- [ ] 视频链接无痕窗口能直接打开
- [ ] GitHub 仓库链接也填了（见 `docs/github-setup.md`）

---

## 一个提醒

PDF 里写了这句：

> "You may be required to attend an interview to explain your code and demonstrate your understanding."

也就是说老师**可能会单独找你现场问代码**。所以视频里讲到的每一处，你自己要知道在哪个文件的哪一行。建议录完视频后，把下面几个位置再过一遍：

| 可能被问 | 在哪 |
|---|---|
| 外键怎么建的 | `database/charityevents-db.sql` 的 `events` 表定义 |
| 搜索怎么拼 SQL 的 | `api/routes/events.js` 的 `readCriteria` 和 `GET /` 里拼 `where` 数组那一段 |
| suspended 在哪过滤的 | `api/routes/events.js` 里 SQL 的 `e.status = 'active'` |
| fetch 在哪、错误怎么处理 | `clientside/js/api.js` 的 `fetchJSON` |
| 卡片怎么生成的 | `clientside/js/api.js` 的 `createEventCard` / `renderEventGrid` |
| 搜索的客户端校验在哪 | `clientside/js/search.js` 的 `readForm` |
| 详情页怎么拿 id 的 | `clientside/js/event.js` 开头的 `URLSearchParams` |
