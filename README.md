# OC Visual Novel AI — GitHub Pages 部署包

这个文件夹已经包含：
- `index.html`
- `app.webmanifest`
- `sw.js`
- `icons/`
- `.nojekyll`

## 部署到 GitHub Pages
1. 新建一个 GitHub 仓库。
2. 把这个文件夹里的所有文件上传到仓库根目录。
3. 在仓库设置里打开 **Pages**。
4. Publishing source 选择 **Deploy from a branch**。
5. Branch 选择 **main**，Folder 选择 **/root**。
6. 等待 GitHub Pages 构建完成。

## iPhone 桌面全屏
1. 用 Safari 打开部署后的网址。
2. 点“分享”。
3. 选“添加到主屏幕”。
4. 从桌面图标进入时，会尽量以独立 Web App 的形式打开。

## 更新
- 直接覆盖仓库里的 `index.html`、`app.webmanifest`、`sw.js` 和 `icons/` 即可。
- 如果桌面图标还显示旧内容，删除桌面图标后重新添加，或在 Safari 里强制刷新一次。
