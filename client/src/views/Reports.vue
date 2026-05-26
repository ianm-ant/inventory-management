<template>
  <div class="reports">
    <div class="page-header">
      <h2>{{ t("reports.title") }}</h2>
      <p>{{ t("reports.subtitle") }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t("reports.loading") }}</div>
    <div v-else-if="error" class="error">{{ t("reports.error") }}</div>
    <div v-else-if="quarterlyData.length === 0 && monthlyData.length === 0">
      <div class="card">
        <p>{{ t("reports.noData") }}</p>
      </div>
    </div>
    <div v-else>
      <!-- Quarterly Performance -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t("reports.quarterly.title") }}</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t("reports.quarterly.quarter") }}</th>
                <th>{{ t("reports.quarterly.totalOrders") }}</th>
                <th>{{ t("reports.quarterly.totalRevenue") }}</th>
                <th>{{ t("reports.quarterly.avgOrderValue") }}</th>
                <th>{{ t("reports.quarterly.fulfillmentRate") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in quarterlyData" :key="q.quarter">
                <td>
                  <strong>{{ q.quarter }}</strong>
                </td>
                <td>{{ q.total_orders.toLocaleString() }}</td>
                <td>{{ formatCurrency(q.total_revenue, currentCurrency) }}</td>
                <td>
                  {{ formatCurrency(q.avg_order_value, currentCurrency) }}
                </td>
                <td>
                  <span :class="getFulfillmentClass(q.fulfillment_rate)">
                    {{ q.fulfillment_rate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly Trends Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t("reports.monthlyTrend.title") }}</h3>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div
              v-for="bar in monthlyBars"
              :key="bar.month"
              class="bar-wrapper"
            >
              <div class="bar-container">
                <div
                  class="bar"
                  :style="{ height: bar.height + 'px' }"
                  :title="formatCurrency(bar.revenue, currentCurrency)"
                ></div>
              </div>
              <div class="bar-label">{{ formatMonth(bar.month) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month-over-Month Comparison -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t("reports.monthOverMonth.title") }}</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t("reports.monthOverMonth.month") }}</th>
                <th>{{ t("reports.monthOverMonth.orders") }}</th>
                <th>{{ t("reports.monthOverMonth.revenue") }}</th>
                <th>{{ t("reports.monthOverMonth.change") }}</th>
                <th>{{ t("reports.monthOverMonth.growthRate") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in monthlyComparison" :key="row.month">
                <td>
                  <strong>{{ formatMonth(row.month) }}</strong>
                </td>
                <td>{{ row.order_count.toLocaleString() }}</td>
                <td>{{ formatCurrency(row.revenue, currentCurrency) }}</td>
                <td>
                  <span v-if="row.change !== null" :class="row.changeClass">
                    {{ row.changeFormatted }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span v-if="row.change !== null" :class="row.changeClass">
                    {{ row.growthRate }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">
            {{ t("reports.summary.totalRevenueYtd") }}
          </div>
          <div class="stat-value">
            {{ formatCurrency(totalRevenue, currentCurrency) }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            {{ t("reports.summary.avgMonthlyRevenue") }}
          </div>
          <div class="stat-value">
            {{ formatCurrency(avgMonthlyRevenue, currentCurrency) }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">
            {{ t("reports.summary.totalOrdersYtd") }}
          </div>
          <div class="stat-value">{{ totalOrders.toLocaleString() }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t("reports.summary.bestQuarter") }}</div>
          <div class="stat-value">{{ bestQuarter }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useFilters } from "../composables/useFilters";
import { useI18n } from "../composables/useI18n";
import { api } from "../api";
import { formatCurrency } from "../utils/currency";

export default {
  name: "Reports",
  setup() {
    const { t, currentLocale, currentCurrency } = useI18n();
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      getCurrentFilters,
    } = useFilters();

    const loading = ref(true);
    const error = ref(null);
    const quarterlyData = ref([]);
    const monthlyData = ref([]);

    const loadData = async () => {
      loading.value = true;
      error.value = null;
      try {
        const filters = getCurrentFilters();
        const [quarterly, monthly] = await Promise.all([
          api.getQuarterlyReports(filters),
          api.getMonthlyTrends(filters),
        ]);
        quarterlyData.value = quarterly;
        monthlyData.value = monthly;
      } catch (err) {
        console.error("Failed to load reports:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    // Summary stats as computed properties
    const totalRevenue = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + m.revenue, 0),
    );

    const avgMonthlyRevenue = computed(() =>
      monthlyData.value.length > 0
        ? totalRevenue.value / monthlyData.value.length
        : 0,
    );

    const totalOrders = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + m.order_count, 0),
    );

    const bestQuarter = computed(() => {
      if (quarterlyData.value.length === 0) return "—";
      return quarterlyData.value.reduce(
        (best, q) => (q.total_revenue > best.total_revenue ? q : best),
        quarterlyData.value[0],
      ).quarter;
    });

    // O(n) bar height: compute max once, then map
    const maxRevenue = computed(() =>
      monthlyData.value.length > 0
        ? Math.max(...monthlyData.value.map((m) => m.revenue))
        : 0,
    );

    const monthlyBars = computed(() =>
      monthlyData.value.map((m) => ({
        ...m,
        height: maxRevenue.value > 0 ? (m.revenue / maxRevenue.value) * 200 : 0,
      })),
    );

    // Month-over-month comparison rows with precomputed change/class/growthRate
    const monthlyComparison = computed(() =>
      monthlyData.value.map((m, index) => {
        if (index === 0) {
          return {
            ...m,
            change: null,
            changeClass: "",
            changeFormatted: "",
            growthRate: "",
          };
        }
        const prev = monthlyData.value[index - 1];
        const change = m.revenue - prev.revenue;
        const changeClass =
          change > 0 ? "positive-change" : change < 0 ? "negative-change" : "";
        const changeFormatted =
          (change >= 0 ? "+" : "-") +
          formatCurrency(Math.abs(change), currentCurrency.value);
        const growthRate =
          prev.revenue === 0
            ? "N/A"
            : (change > 0 ? "+" : "") +
              ((change / prev.revenue) * 100).toFixed(1) +
              "%";
        return { ...m, change, changeClass, changeFormatted, growthRate };
      }),
    );

    const formatMonth = (monthStr) => {
      const parts = monthStr.split("-");
      if (parts.length !== 2) return monthStr;
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      if (isNaN(date.getTime())) return monthStr;
      return date.toLocaleDateString(
        currentLocale.value === "ja" ? "ja-JP" : "en-US",
        { year: "numeric", month: "short" },
      );
    };

    const getFulfillmentClass = (rate) => {
      if (rate >= 90) return "badge success";
      if (rate >= 75) return "badge warning";
      return "badge danger";
    };

    watch(
      [selectedPeriod, selectedLocation, selectedCategory, selectedStatus],
      loadData,
    );
    onMounted(loadData);

    return {
      t,
      currentCurrency,
      loading,
      error,
      quarterlyData,
      monthlyData,
      totalRevenue,
      avgMonthlyRevenue,
      totalOrders,
      bestQuarter,
      monthlyBars,
      monthlyComparison,
      formatCurrency,
      formatMonth,
      getFulfillmentClass,
    };
  },
};
</script>

<style scoped>
.reports {
  padding: 0;
}

.chart-container {
  padding: 2rem 1rem;
  min-height: 300px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 0.5rem;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  width: 100%;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  cursor: pointer;
}

.bar:hover {
  background: linear-gradient(to top, #2563eb, #3b82f6);
}

.bar-label {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  transform: rotate(-45deg);
  white-space: nowrap;
}

.positive-change {
  color: #16a34a;
  font-weight: 600;
}

.negative-change {
  color: #dc2626;
  font-weight: 600;
}
</style>
