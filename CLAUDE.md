# weilu.chat 个人作品网站

React + Vite + TypeScript 项目。

## 本地开发

### 启动本地预览
npm run dev
启动后访问 http://localhost:5173 查看效果

### 构建检查
npm run build
npm run preview
构建后访问 http://localhost:4173 预览正式版效果

## 项目结构
- src/          源代码
- dist/         构建产物（不要手动修改）
- energy/       产品图片/视频素材（已在COS上）
- works/        作品集视频/GIF（已在COS上）
- cos_upload.py 上传脚本

## 部署到腾讯云COS

### 一键部署
npm run build && python cos_upload.py

### 分步执行
npm run build        # 构建
python cos_upload.py # 上传到COS

## 部署信息
- 托管平台：腾讯云 COS 香港节点
- Bucket：weilu-design-1405746396
- Region：ap-hongkong
- 网站地址：https://weilu.chat

## 注意事项
- 每次修改代码后需要重新 build 再上传
- cos_upload.py 的 SecretId/SecretKey 已配置好，不要提交到 git
- 素材文件体积大，上传需要耐心等待
