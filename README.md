# Haoming Luo · Lab

独立的在线交互展示站。个人主页与科研开发项目分别维护。

- 网站：https://haoming-luo.github.io/haoming-lab/
- 结构实验室：https://haoming-luo.github.io/haoming-lab/structural-design/

## 项目边界

这里只保存公开网页和展示必要的数据、CAD 资源。不包含 Python 后端、有限元求解环境、训练程序、模型权重或科研工作目录。

AgentFEM × GINO 轻量化演示使用预计算结果：搜索在 48 个已保存候选中选择，手动调整匹配相近候选并同步参数；不在浏览器中重新运行 GINO 或有限元。完整开发与实时计算版本继续在原项目维护。

案例画廊保留来源链接和署名，第三方图片归各权利人所有，依赖相应来源网站可用。

## 更新与发布

`public/index.html` 与 `public/home.css` 是首页；`public/structural-design/` 是当前实验。新实验增加独立子目录并在首页添加入口。

使用 Node.js 22 或更新版本：

```sh
node tests/static-demo.mjs
node build.mjs
```

推送 main 后 GitHub Actions 自动测试并发布 `dist/`。只有 `public/` 的内容会成为网站；请勿把私密材料、密钥或未授权资源放进来。

以后绑定 lab.haoming-luo.com：在本仓库 Pages 设置域名并配置 DNS，保持个人主站记录不变。目前未绑定自定义域名。
