# Git 历史清理执行检查清单

**执行时间:** 2026-07-15
**仓库:** tohnee.ai
**泄露密钥:** Gemini API Key (AIzaSyCCW7kHZHDiPtn2JaM0MWmXOTKArV1x8CU)
**受影响提交:** 3 个（包含一个 stash 自动提交）

---

## 第一步：已自动完成 ✅

### 1.1 密钥清理状态

| 检查项 | 状态 | 验证命令 |
|--------|------|----------|
| git-filter-repo 安装 | ✅ | `git-filter-repo --version` (a40bce548d2c) |
| 工作区 stash 保护 | ✅ | 执行前已 `git stash push -u`（后续被 filter-repo 重写） |
| 历史 Key 替换为 REDACTED | ✅ | `git log --all -S "AIzaSyCCW7kHZHDiPtn2JaM0MWmXOTKArV1x8CU"` 返回空 |
| 备份分支创建 | ✅ | `backup/pre-filter-20260715-063922` |
| reflog 过期 + gc | ✅ | 脚本已自动执行 |

### 1.2 新历史提交列表（重写后）

```
d4977f8 (HEAD -> main, backup/pre-filter-20260715-063922) chore: add clean-history script
0910f58 fix: Cloudflare Pages deployment - _redirects SPA routing + wrangler.toml
c54520c fix: remove invalid pages_build_output_dir from wrangler.toml for Cloudflare Pages compat
61c00cc Add .omc/ and .trae/ to .gitignore
230594a Smart base path detection for GitHub Pages + custom domain support
97112f9 Add GitHub Pages deployment with SPA routing support
0a09dc7 Add GitHub Actions deploy workflow for Cloudflare Pages
c40ad23 Init tohnee.ai personal website
```

**注意:** 所有 commit hash 已变更（重写历史的正常结果），原始 remote 上的旧 hash 将不匹配。

---

## 第二步：你必须手动完成（按顺序执行） ⚠️

### 2.1 【立即】吊销泄露的 Gemini API Key

这是最高优先级，即使历史已清理也必须执行：

1. 访问 [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. 找到 Key `AIzaSyCCW7kHZHDiPtn2JaM0MWmXOTKArV1x8CU`
3. 点击 **删除** 或 **吊销**
4. 检查 Key 使用日志确认无异常调用
5. 生成新 Key 并妥善保存（切勿写入代码）

**检查项：**
- [ ] 旧 Key 已在 Google Cloud 控制台吊销
- [ ] 已确认吊销时间之后无异常 API 调用费用
- [ ] 新 Key 已生成并存放在安全位置（密码管理器）

---

### 2.2 【配置 MiniMax Key】配置 Cloudflare Pages Secret

`/api/chat` 边缘函数需要 MiniMax API Key 才能工作：

```bash
# 安装 wrangler（如未安装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 设置 Secret（会提示输入 Key）
wrangler pages secret put MINIMAX_API_KEY --project-name=tohnee-ai
```

**检查项：**
- [ ] MiniMax API Key 已通过 `wrangler pages secret put` 配置
- [ ] Cloudflare Pages 环境变量面板可看到 `MINIMAX_API_KEY` 已加密存储

---

### 2.3 【重要】强制推送重写后的历史到远程

因为历史被重写（commit hash 变化），必须 force push：

```bash
# filter-repo 已自动移除 origin，先重新添加
git remote add origin https://github.com/tohnee/tohnee.ai.git

# 验证远程地址
git remote -v

# 强制推送所有分支和标签
git push origin --force --all
git push origin --force --tags
```

**警告:** 这会覆盖远程历史，操作前确认团队已获知。

**检查项：**
- [ ] 已通知所有协作者历史已重写
- [ ] `git push origin --force --all` 执行成功
- [ ] GitHub 网页上查看历史，确认 Key 不在任何提交中
  - 验证方法：在 GitHub 搜索仓库中的 `AIzaSyCCW7kHZHDiPtn2JaM0MWmXOTKArV1x8CU` 应无结果
- [ ] `git push origin --force --tags` 执行成功

---

### 2.4 【通知团队】协作者本地仓库处理

所有其他协作者必须重新 clone 或执行硬重置：

**协作者必须执行以下操作之一：**

**选项 A（推荐，最干净）：**
```bash
# 备份本地未推送改动
mv tohnee.ai tohnee.ai-old-backup

# 重新 clone
git clone https://github.com/tohnee/tohnee.ai.git
```

**选项 B（保留本地改动）：**
```bash
git fetch origin
git checkout main
git reset --hard origin/main
# 清理旧引用
git reflog expire --expire=now --all
git gc --prune=now
```

**检查项：**
- [ ] 已通知所有协作者
- [ ] 协作者已完成重新 clone 或硬重置
- [ ] 确认无协作者将旧历史 push 回远程

---

### 2.5 【环境变量】本地开发 Key 管理

新的 Gemini API Key 永远不要写回代码：

**方法 1：Shell 环境变量（推荐）**
```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
export GEMINI_API_KEY="your-new-key-here"

# 执行脚本时自动读取
./generate_images.sh
```

**方法 2：.env 文件（已被 .gitignore 保护）**
```bash
# 创建 .env 文件（.gitignore 中 *.local 已保护，但建议加 .env 到 .gitignore）
echo "GEMINI_API_KEY=your-new-key-here" > .env
echo ".env" >> .gitignore

# 使用前 source
source .env && ./generate_images.sh
```

**检查项：**
- [ ] 新 Gemini Key 通过环境变量注入，未写入任何代码文件
- [ ] `.env` 已加入 `.gitignore`（如使用该方案）
- [ ] `grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git` 返回空结果

---

## 第三步：验证新功能工作正常

### 3.1 本地验证

```bash
# 安装依赖（@cloudflare/workers-types 是新添加的）
npm install

# 1. TypeScript 编译
npm run build
# 预期：✓ built in Xs，BUILD_EXIT: 0

# 2. Lint
npm run lint
# 预期：0 errors, 0 warnings

# 3. Functions 类型检查
npm run typecheck:functions
# 预期：无错误输出

# 4. 启动 dev server
npm run dev
```

**检查项：**
- [ ] `npm run build` 成功
- [ ] `npm run lint` 通过（0 errors）
- [ ] `npm run typecheck:functions` 通过
- [ ] `npm run dev` 启动无报错
- [ ] 浏览器访问 `/search` 输入 "agi" 能返回搜索结果
- [ ] 搜索推荐词（Popular Searches / Browse by Type）点击可搜索

### 3.2 `/api/chat` 本地开发说明

Vite dev server 不会自动运行 Cloudflare Functions。本地测试聊天接口有两种方案：

**方案 A：使用 wrangler pages dev（推荐）**
```bash
npx wrangler pages dev dist --compatibility-date=2026-05-01
```
这会同时提供静态资源和 Functions，端口 8788。

**方案 B：部署到 Cloudflare Pages Preview 测试**
```bash
# 推送到分支后 Cloudflare 会自动构建 preview
# 或手动部署：
npm run deploy
```

**检查项：**
- [ ] Preview 部署成功后，`/try` 页面聊天功能正常
- [ ] 浏览器 DevTools Network 面板看到请求发送到 `/api/chat`，无 MiniMax Key 暴露
- [ ] 隐私提示条（"Server-side proxied"）可见

---

## 第四步：清理备份（确认无误后执行）

确认一切正常工作至少 24 小时后，删除备份分支：

```bash
git branch -D backup/pre-filter-20260715-063922
git push origin --delete backup/pre-filter-20260715-063922  # 如果已推送到远程
```

**检查项：**
- [ ] 生产环境运行正常 24 小时以上
- [ ] 所有团队成员已切换到新历史
- [ ] 备份分支已删除（本地 + 远程）

---

## 附加安全建议

### GitHub 密钥扫描

建议在 GitHub 仓库启用 Secret Scanning：
1. Settings → Code security and analysis
2. 开启 **Secret scanning** 和 **Push protection**
3. 这样未来任何密钥被意外提交时会被自动阻止

### 已修复的安全问题

| 问题 | 修复状态 | 文件 |
|------|---------|------|
| Gemini Key 在 shell 脚本中硬编码 | ✅ 已移除，改用环境变量 | `generate_images.sh`, `generate_images_fast.sh` |
| MiniMax Key 存 localStorage 并直传第三方 | ✅ 改为边缘函数代理，Key 仅存 Cloudflare Secret | `src/pages/Try.tsx`, `functions/api/chat.ts` |
| Try 页面无隐私声明 | ✅ 已添加隐私提示条 | `src/pages/Try.tsx` |
| Search 页面静态占位无功能 | ✅ 实现客户端全文搜索 | `src/pages/Search.tsx`, `src/data/searchIndex.ts` |

---

## 快速验证命令合集

一键运行所有验证：

```bash
echo "=== 1. 检查无 Key 残留 ==="
grep -r "AIzaSyCCW7kHZHDiPtn2JaM0MWmXOTKArV1x8CU" . --exclude-dir=node_modules --exclude-dir=.git && echo "❌ 发现 Key" || echo "✅ 无 Key 残留"

echo ""
echo "=== 2. Git 历史无 Key ==="
git log --all -S "AIzaSyCCW7kHZHDiPtn2JaM0MWmXOTKArV1x8CU" --oneline | grep -q . && echo "❌ 历史含 Key" || echo "✅ 历史干净"

echo ""
echo "=== 3. Build ==="
npm run build > /dev/null 2>&1 && echo "✅ Build 成功" || echo "❌ Build 失败"

echo ""
echo "=== 4. Lint ==="
npm run lint > /dev/null 2>&1 && echo "✅ Lint 通过" || echo "❌ Lint 有错误"
```
