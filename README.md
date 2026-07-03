# 自动 PDF 报告生成器

这是一个基于 Node.js 的自动化周报系统，用于：

- 从 PostgreSQL 提取每周业务指标
- 用 Handlebars 渲染带图表和表格的 HTML 报告
- 用 Puppeteer 生成高质量 PDF
- 用 SendGrid 把 PDF 作为附件发送给管理层或客户

## 技术栈

- PostgreSQL
- Handlebars
- Puppeteer
- SendGrid

## 项目结构

```text
.
├── assets/
│   └── report.css
├── output/
├── sql/
│   ├── daily_sales_trend.sql
│   ├── top_accounts.sql
│   └── weekly_summary.sql
├── src/
│   ├── config.js
│   ├── data.js
│   ├── db.js
│   ├── generatePdf.js
│   ├── index.js
│   ├── renderHtml.js
│   └── sendEmail.js
└── templates/
    └── weekly-report.hbs
```

## 安装

本机需要先安装 Node.js 20+。

```bash
npm install
cp .env.example .env
```

这个项目默认支持 `mock` 数据模式，所以即使没有真实业务表结构也可以直接跑通。

然后复制并按需调整 `.env`：

- `DATA_SOURCE=mock`：使用内置演示数据，适合作品集项目
- `DATA_SOURCE=postgres`：连接 PostgreSQL 跑真实 SQL
- `SEND_EMAIL=false`：只生成 HTML/PDF，不调用 SendGrid
- `SEND_EMAIL=true`：开启邮件发送，同时需要填写 SendGrid 配置

## 运行

生成 PDF，但不发邮件：

```bash
npm run generate
```

仅发送最近一次生成的 PDF：

```bash
npm run send
```

生成并发送：

```bash
npm start
```

如果 `.env` 中保持 `SEND_EMAIL=false`，`npm start` 也会只生成报告，不会真正发邮件。

## 定时调度

如果你想每周一自动发送，可以用 `crontab`：

```bash
0 9 * * 1 cd /Users/hanqin/Desktop/Automated-PDF-Report-Generator && /usr/local/bin/node src/index.js >> /tmp/weekly-report.log 2>&1
```

上面的例子表示每周一上午 9:00 运行。请根据你的 Node 安装路径调整命令。

## SQL 说明

示例 SQL 位于：

- [sql/weekly_summary.sql](/Users/hanqin/Desktop/Automated-PDF-Report-Generator/sql/weekly_summary.sql)
- [sql/daily_sales_trend.sql](/Users/hanqin/Desktop/Automated-PDF-Report-Generator/sql/daily_sales_trend.sql)
- [sql/top_accounts.sql](/Users/hanqin/Desktop/Automated-PDF-Report-Generator/sql/top_accounts.sql)

如果你未来接入真实数据库，需要根据自己的真实表结构修改下面几个来源：

- `orders`
- `users`
- `subscriptions`
- `accounts`

## 输出目录

生成后的文件会写入 `output/`：

- `weekly-report.html`
- `weekly-report.pdf`

## 后续可扩展方向

- 按不同客户生成不同版本的 PDF
- 增加更多图表和 KPI 卡片
- 接入 CI/CD 或云函数定时运行
- 为邮件正文增加简短经营摘要
