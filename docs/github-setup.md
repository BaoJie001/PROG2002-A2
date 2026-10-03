# GitHub 仓库搭建步骤（PROG2002 A2）

评分要求原文：

> "You must create a repository on GitHub to store your project work with all files and documents.
> You must show your work progress by regularly committing your project. In each commit, you need
> to provide a clear explanation of what changes you have made. **Failing to show the correct work
> progress will cause the assignment to fail.**"
>
> "Ensure you protect your GitHub so that other students will not be able to see that.
> You may invite your marker to be a collaborator. Ensure it is accessible."

所以要做三件事：① 建**私有**仓库并推送 ② 让评分老师能访问 ③ 提交历史要能看出推进过程。

---

## 第 0 步：确认你已经有 GitHub 账号

- 有 → 跳到第 1 步。
- 没有 → 打开 <https://github.com/signup>，用学校邮箱注册，用户名建议用真名或学号（评分老师会看到，别用奇怪的昵称）。

当前 Git 全局身份已配置成：

```
user.name  = BaoJie001
user.email = 1822675871@qq.com
```

**重要**：如果 GitHub 账号绑定的邮箱不是 `1822675871@qq.com`，提交在 GitHub 上不会关联到你的头像（显示成陌生人）。两个办法，选一个：

- 去 GitHub → Settings → Emails → Add email address，把 `1822675871@qq.com` 加进去并验证；
- 或者改本地配置（把邮箱换成你 GitHub 的登录邮箱）：

  ```bat
  git config --global user.email "你的GitHub邮箱"
  ```

  注意：改了之后**只对以后的新提交生效**，已经提交的 13 个 commit 保持原样（这没关系）。

---

## 第 1 步：登录 GitHub（命令行方式，推荐）

1. 在 `D:\PROG2002-A2` 文件夹里**右键 → Open Git Bash here**（或者打开任意终端 `cd D:/PROG2002-A2`）。
   > 如果你用的是这轮对话之前就开着的终端，`gh` 命令可能还识别不了，关掉重开一个。

2. 输入：

   ```bat
   gh auth login
   ```

3. 接下来会**一连串提问**，用方向键选、回车确认，按下面这样选：

   | 屏幕上的问题 | 你选什么 |
   |---|---|
   | `What account do you want to log into?` | **GitHub.com** |
   | `What is your preferred protocol for Git operations?` | **HTTPS** |
   | `Authenticate Git with your GitHub credentials?` | **Yes** |
   | `How would you like to authenticate GitHub CLI?` | **Login with a web browser** |

4. 屏幕会显示**一次性验证码**，长这样：

   ```
   ! First copy your one-time code: A1B2-C3D4
   Press Enter to open github.com in your browser...
   ```

   先**记下这个码**（`A1B2-C3D4` 这种），然后回车。

5. 浏览器自动打开 GitHub 的设备激活页 → 粘贴刚才那个码 → 点 **Continue** → 点绿色的 **Authorize GitHub CLI**。

6. 回到终端，看到下面这句就成功了：

   ```
   ✓ Logged in as 你的用户名
   ```

7. 验证一下：

   ```bat
   gh auth status
   ```

---

## 第 2 步：创建私有仓库并推送

在同一个终端里执行：

```bat
gh repo create PROG2002-A2 --private --source=. --remote=origin --push
```

逐段解释这条命令：

- `PROG2002-A2` 仓库名（可以改，比如 `prog2002-a2-charity-events`）
- `--private` **关键**：别人看不到，满足"protect your GitHub"
- `--source=.` 用当前目录（也就是 `D:\PROG2002-A2`）的内容
- `--remote=origin` 自动把远端地址配好
- `--push` 建完立刻把本地 13 个 commit 推上去

成功的样子：

```
✓ Created repository 你的用户名/PROG2002-A2 on GitHub
✓ Added remote https://github.com/你的用户名/PROG2002-A2.git
✓ Pushed commits to https://github.com/你的用户名/PROG2002-A2.git
```

### 如果报错

- `repository already exists` → 换个名字，或去 GitHub 网页删掉同名仓库。
- `HTTP 403` / 权限错误 → 重新 `gh auth login`，或者确认账号通过了邮箱验证。
- 提示 `Git: authentication failed` → 执行 `gh auth refresh`，或者 `git config --global credential.helper manager` 后重试。

---

## 第 3 步：邀请评分老师（marker）成为协作者

这一步**必须做**，否则老师打不开你的私有仓库，等于没交。

### 图形界面（推荐）

1. 浏览器打开 `https://github.com/你的用户名/PROG2002-A2`
2. 点 **Settings**（仓库右上角标签页，不是头像那个）
3. 左侧栏 **Collaborators**（可能要先输入密码确认）
4. 点 **Add people**
5. 输入老师的 **GitHub 用户名或邮箱** → 搜到后点他
6. 角色（Role）选 **Write**（默认就是这个，够用了）→ 点 **Add 用户名 to this repository**

> 老师的 GitHub 用户名哪里来？Blackboard 上的作业说明、老师发的邮件、或者课程群里问。如果实在找不到，**直接问老师**。如果老师没给，也可以退一步：把仓库改成 public——但那样其他学生能看到你的代码，有学术诚信风险，**优先用邀请协作者的方式**。

### 命令行替代方案

```bat
gh api repos/你的用户名/PROG2002-A2/collaborators/老师的GitHub用户名 -X PUT -f permission=write
```

---

## 第 4 步：拿到链接并确认能打开

你的提交链接就是：

```
https://github.com/你的用户名/PROG2002-A2
```

**必须自己验证一遍**（PDF 里明确写 "Ensure it is accessible"）：

1. 浏览器**退出你的 GitHub 账号**（或用无痕窗口），打开这个链接。
   - 如果你是私有仓库且没登录 → 应该看到 404，这是**正常的**（说明保护生效了）。
2. 然后**登录你自己的账号**再打开 → 能看到全部文件。
3. 想确认老师那边能不能看到，最靠谱的办法是**用手机流量 + 无痕窗口登录老师账号**太麻烦——简单做法是：请一个同学把他的 GitHub 用户名告诉你，你邀请他当 collaborator，让他试着打开，能打开就说明配置没问题。

检查清单（打开仓库主页后确认这些都在）：

- [ ] 13 个 commit 都在（`main` 分支）
- [ ] `clientside/`、`api/`、`database/`、`docs/` 四个目录都在
- [ ] **`api/.env` 不在**（这个文件被 `.gitignore` 排除了，正确）
- [ ] `api/.env.example` 在（告诉别人怎么配数据库）
- [ ] 点任意一个 HTML 文件，中文和 emoji 显示正常不乱码

---

## 第 5 步：以后怎么继续提交（展示"工作进展"）

**这一步关系到是否挂科**。评分老师会点开 commit 历史看，期望看到"分阶段、有说明"的推进，而不是一个 commit 塞完所有东西。

目前已经有 13 个 commit，逻辑顺序是：

```
1  chore: initialise project structure and install server dependencies
2  feat(db): create charityevents_db schema with organisations, categories and events
3  feat(api): add MySQL connection pool and the Express server
4  feat(api): add RESTful endpoints for listing, searching and event details
5  feat(api): add categories endpoint for the search dropdown
6  feat(client): add hand-written stylesheet and shared API helper
7  feat(client): add home page with upcoming and past events
8  feat(client): add search page with date, location and category filters
9  feat(client): add event detail page driven by the id query string
10 feat(client): add category banner images and past-event styling
11 docs: add project report covering analysis, design and API testing
12 docs: update README with run instructions and add one-click startup
13 chore: package the two submission zip archives
```

以后每改一点东西就提交一次，三条命令：

```bat
git add -A
git commit -m "简短标题" -m "详细说明改了什么、为什么改"
git push
```

举几个真实场景的写法：

```bat
git commit -m "fix(client): show a message when a search returns nothing" -m "Empty results used to leave the list area blank. The page now renders a 'No events match' panel and repeats the filters used."
```

```bat
git commit -m "docs: fill in section C of the project report"
```

**建议**：如果离截止还有几天，每天哪怕只改一点（改个错别字、调个间距、补一句报告），也提交一次。commit 时间有跨度，"持续进展"这件事就更有说服力。

---

## 备选方案：用 GitHub Desktop（图形界面，已安装）

命令行搞不定就用这个，机器上已经装了（`C:\Users\包杰\AppData\Local\GitHubDesktop`）。

1. 打开 **GitHub Desktop**
2. `File → Add local repository` → 选 `D:\PROG2002-A2`
3. 如果提示 "not a git repository" 说明路径选错了
4. 右上角 **Publish repository**
   - Name: `PROG2002-A2`
   - **勾选 Keep this code private** ← 关键
   - 点 Publish
5. 之后改动：左下角写 Summary（标题）和 Description（详细说明）→ **Commit to main** → 右上角 **Push origin**

---

## 最后：把链接填进 Blackboard

PDF 的 Deliverables 要求交 4 样东西：

| 交什么 | 你现在的状态 |
|---|---|
| Project documentation（项目报告） | `docs/project-report.md`，需要把内容填进学校给的报告模板 |
| `用户名A2-clientside.zip` | `submission/PROG2002-A2-clientside.zip`（记得改名） |
| `用户名A2-api.zip` | `submission/PROG2002-A2-api.zip`（记得改名） |
| GitHub 仓库链接 | 本文件第 4 步那个链接 |
| 视频链接 | 见 `docs/video-guide.md` |
