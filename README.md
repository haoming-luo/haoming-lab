# Haoming Luo · Lab

独立的在线交互展示站。个人主页与科研开发项目分别维护。

- 网站：https://lab.haoming-luo.com/
- 结构实验室：https://lab.haoming-luo.com/structural-design/
- 原 GitHub Pages 地址：https://haoming-luo.github.io/haoming-lab/（绑定后跳转到自定义域名）

## 项目边界

这里只保存公开网页和展示必要的数据、CAD 资源。不包含 Python 后端、有限元求解环境、训练程序、模型权重或科研工作目录。

AgentFEM × GINO 轻量化演示使用预计算结果：搜索在 48 个已保存候选中选择，手动调整匹配相近候选并同步参数；不在浏览器中重新运行 GINO 或有限元。完整开发与实时计算版本继续在原项目维护。

案例画廊保留来源链接和署名，第三方图片归各权利人所有，依赖相应来源网站可用。

## 加载策略

在线版首先读取约 37 KB 的候选索引。云图与 CAD 为独立、内容寻址的 gzip 资源，按需下载并在本次访问内复用；没有后端推理。几何参数和结果值保持原始记录，不做插值或降精度。直接双击 file:// 不属于此在线项目的运行方式，离线单文件版仍在原目录保留。

## 更新与发布

`public/index.html` 与 `public/home.css` 是首页；`public/structural-design/` 是当前实验。新实验增加独立子目录并在首页添加入口。

使用 Node.js 22 或更新版本：

```sh
node tests/static-demo.mjs
node build.mjs
```

推送 main 后 GitHub Actions 自动测试并发布 `dist/`。只有 `public/` 的内容会成为网站；请勿把私密材料、密钥或未授权资源放进来。

## 域名配置

2026-09-12 已在本仓库 GitHub Pages 设置中绑定 `lab.haoming-luo.com`。
Cloudflare DNS 新增 `CNAME lab → haoming-luo.github.io`，仅 DNS，TTL 自动。
主站 `@`、`www` 及 GitLab 验证记录保持不变。
此项目使用 Actions 发布，自定义域名以仓库 Pages 设置为准，无需 CNAME 文件。
