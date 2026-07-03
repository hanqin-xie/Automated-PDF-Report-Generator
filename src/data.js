const fs = require("fs/promises");

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function buildDelta(current, previous, suffix = "") {
  const safeCurrent = Number(current || 0);
  const safePrevious = Number(previous || 0);
  const delta = safeCurrent - safePrevious;
  const prefix = delta >= 0 ? "+" : "";

  return {
    deltaClass: delta >= 0 ? "positive" : "negative",
    deltaText: `${prefix}${delta.toFixed(2)}${suffix} vs last week`
  };
}

async function loadWeeklyMetrics(pool, sqlPath) {
  const query = await fs.readFile(sqlPath, "utf8");
  const result = await pool.query(query);
  const row = result.rows[0] || {};

  return {
    totalSales: Number(row.total_sales || 0),
    previousTotalSales: Number(row.previous_total_sales || 0),
    newUsers: Number(row.new_users || 0),
    orderCount: Number(row.order_count || 0),
    previousNewUsers: Number(row.previous_new_users || 0),
    churnRate: Number(row.churn_rate || 0),
    previousChurnRate: Number(row.previous_churn_rate || 0)
  };
}

async function loadDailySalesTrend(pool, sqlPath) {
  const query = await fs.readFile(sqlPath, "utf8");
  const result = await pool.query(query);

  return {
    labels: result.rows.map((row) => row.label),
    values: result.rows.map((row) => Number(row.value || 0))
  };
}

async function loadTopAccounts(pool, sqlPath) {
  const query = await fs.readFile(sqlPath, "utf8");
  const result = await pool.query(query);

  return result.rows.map((row) => ({
    name: row.name,
    orders: Number(row.orders || 0),
    region: row.region,
    revenue: formatCurrency(row.revenue)
  }));
}

function buildReportViewModel(metrics, trend, topAccounts, companyName, reportRange) {
  const salesDelta = buildDelta(metrics.totalSales, metrics.previousTotalSales);
  const userDelta = buildDelta(metrics.newUsers, metrics.previousNewUsers);
  const churnDelta = buildDelta(metrics.churnRate, metrics.previousChurnRate, " pts");
  const averageOrderValue = metrics.orderCount > 0
    ? metrics.totalSales / metrics.orderCount
    : 0;

  return {
    chartDataJson: JSON.stringify(trend),
    companyName,
    kpis: [
      {
        label: "Total Sales",
        value: formatCurrency(metrics.totalSales),
        deltaClass: salesDelta.deltaClass,
        deltaText: salesDelta.deltaText
      },
      {
        label: "New Users",
        value: metrics.newUsers.toLocaleString("en-US"),
        deltaClass: userDelta.deltaClass,
        deltaText: userDelta.deltaText
      },
      {
        label: "Churn Rate",
        value: formatPercent(metrics.churnRate),
        deltaClass: churnDelta.deltaClass,
        deltaText: churnDelta.deltaText
      },
      {
        label: "Avg Order Value",
        value: formatCurrency(averageOrderValue),
        deltaClass: "positive",
        deltaText: `${metrics.orderCount.toLocaleString("en-US")} orders included this week`
      }
    ],
    reportRange,
    reportTitle: "Weekly Business Performance Report",
    summaryPoints: [
      `Weekly sales closed at ${formatCurrency(metrics.totalSales)}, compared with ${formatCurrency(metrics.previousTotalSales)} in the previous week.`,
      `${metrics.newUsers.toLocaleString("en-US")} new users signed up this week, which helps quantify acquisition momentum.`,
      `Customer churn finished at ${formatPercent(metrics.churnRate)}. Review cancellation drivers if churn remains elevated for multiple weeks.`
    ],
    topAccounts
  };
}

module.exports = {
  buildReportViewModel,
  loadDailySalesTrend,
  loadTopAccounts,
  loadWeeklyMetrics
};
