import React, {
  useState,
  useEffect,
} from "react";


import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  LineChart,
  PieChart,
} from "react-native-chart-kit";

import AsyncStorage from
  "@react-native-async-storage/async-storage";


import {
  useTheme,
} from "../../context/ThemeContext";
// ============================================================
// API URL
// ============================================================

const API_BASE_URL =
  "https://expensebackend-tdxz.onrender.com";


// ============================================================
// TYPES
// ============================================================

type ReportSummary = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
};

type MonthlyItem = {
  month: string;
  amount: number;
};

type CategoryItem = {
  name: string;
  amount: number;
  color?: string;
};


// ============================================================
// SCREEN
// ============================================================

export default function ReportsScreen() {

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [
    searchText,
    setSearchText,
  ] = useState("");

  
   const {
    darkMode,
    colors,
    } = useTheme();

  // ==========================================================
  // FILTER
  // ==========================================================

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState("Today");


  // ==========================================================
  // FILTER MODAL
  // ==========================================================

  const [
    filterModalVisible,
    setFilterModalVisible,
  ] = useState(false);


const [customDateModalVisible, setCustomDateModalVisible] =
  useState(false);

const [fromDate, setFromDate] =
  useState<Date | null>(null);

const [toDate, setToDate] =
  useState<Date | null>(null);

const [datePickerMode, setDatePickerMode] =
  useState<"from" | "to">("from");

const [showDatePicker, setShowDatePicker] =
  useState(false);


// ==========================================================
  // REPORT
  // ==========================================================

  const [
    report,
    setReport,
  ] = useState<ReportSummary>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });


  // ==========================================================
  // MONTHLY DATA
  // ==========================================================

  const [
    monthlyData,
    setMonthlyData,
  ] = useState<MonthlyItem[]>([]);


  // ==========================================================
  // CATEGORY DATA
  // ==========================================================

  const [
    categoryData,
    setCategoryData,
  ] = useState<CategoryItem[]>([]);


  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================================
  // FILTERS
  // ==========================================================

  const filters = [
  "Today",
  "Week",
  "Month",
  "Year",
  "Custom Date",
];


  // ==========================================================
  // LOAD REPORT WHEN FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    if (selectedFilter === "Custom Date") {
      if (fromDate && toDate) {
        loadReport(fromDate, toDate);
      }
      return;
    }

    loadReport();
  }, [selectedFilter]);


  // ============================================================
  // LOAD REPORT
  // ============================================================


 const loadReport = async (
  customFromDate?: Date,
  customToDate?: Date,
  periodOverride?: string
) => {

  try {

    setLoading(true);

    console.log(
      "===================================="
    );

    console.log(
      "📊 LOADING REPORT"
    );

    const reportPeriod =
      periodOverride ||
      selectedFilter;

    console.log(
      "📊 PERIOD:",
      reportPeriod
    );

    // ======================================================
    // TOKEN
    // ======================================================

    const token =
      await AsyncStorage.getItem(
        "access_token"
      );

    console.log(
      "🔐 TOKEN:",
      token
        ? "AVAILABLE"
        : "NOT FOUND"
    );

    if (!token) {

      throw new Error(
        "Login token not found. Please login again."
      );

    }

    // ======================================================
    // DATE FORMAT
    // ======================================================

    const formatDate = (
      date: Date
    ) => {

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    // ======================================================
    // URL
    // ======================================================

    let url =
      `${API_BASE_URL}/reports/summary?period=${encodeURIComponent(
        reportPeriod
      )}`;

    // ======================================================
    // CUSTOM DATE
    // ======================================================

    if (
      reportPeriod === "Custom Date" &&
      customFromDate &&
      customToDate
    ) {

      const from =
        formatDate(
          customFromDate
        );

      const to =
        formatDate(
          customToDate
        );

      url +=
        `&fromDate=${encodeURIComponent(
          from
        )}` +
        `&toDate=${encodeURIComponent(
          to
        )}`;

      console.log(
        "📅 CUSTOM FROM:",
        from
      );

      console.log(
        "📅 CUSTOM TO:",
        to
      );

    }

    console.log(
      "📡 REPORT API:",
      url
    );

    // ======================================================
    // REQUEST
    // ======================================================

    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    console.log(
      "📥 REPORT STATUS:",
      response.status
    );

    // ======================================================
    // RESPONSE
    // ======================================================

    const responseText =
      await response.text();

    console.log(
      "📥 REPORT RESPONSE:",
      responseText
    );

    // ======================================================
    // JSON
    // ======================================================

    let result: any;

    try {

      result =
        JSON.parse(
          responseText
        );

    } catch {

      throw new Error(
        `Invalid server response: ${responseText}`
      );

    }

    // ======================================================
    // HTTP ERROR
    // ======================================================

    if (!response.ok) {

      throw new Error(
        result?.detail ||
        result?.message ||
        `Report request failed: ${response.status}`
      );

    }

    // ======================================================
    // API ERROR
    // ======================================================

    if (!result?.success) {

      throw new Error(
        result?.message ||
        "Unable to load report."
      );

    }

    // ======================================================
    // SUMMARY
    // ======================================================

    const summary =
      result.summary || {};

    setReport({

      total:
        Number(
          summary.total || 0
        ),

      approved:
        Number(
          summary.approved || 0
        ),

      pending:
        Number(
          summary.pending || 0
        ),

      rejected:
        Number(
          summary.rejected || 0
        ),

    });

    // ======================================================
    // MONTHLY
    // ======================================================

    const monthly =
      Array.isArray(
        result.monthly
      )
        ? result.monthly
        : [];

    setMonthlyData(
      monthly.map(
        (item: any) => ({

          month:
            String(
              item.month || ""
            ),

          amount:
            Number(
              item.amount || 0
            ),

        })
      )
    );

    // ======================================================
    // CATEGORIES
    // ======================================================

    const categories =
      Array.isArray(
        result.categories
      )
        ? result.categories
        : [];

    const defaultColors = [
      "#2563EB",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#14B8A6",
      "#F97316",
    ];

    setCategoryData(
      categories.map(
        (
          item: any,
          index: number
        ) => ({

          name:
            String(
              item.name ||
              "Others"
            ),

          amount:
            Number(
              item.amount || 0
            ),

          color:
            item.color ||
            defaultColors[
              index %
              defaultColors.length
            ],

        })
      )
    );

    // ======================================================
    // DEBUG
    // ======================================================

    console.log(
      "✅ REPORT LOADED"
    );

    console.log(
      "📊 SUMMARY:",
      summary
    );

    console.log(
      "📈 MONTHLY:",
      monthly
    );

    console.log(
      "🥧 CATEGORIES:",
      categories
    );

    if (
      reportPeriod === "Custom Date"
    ) {

      console.log(
        "📅 CUSTOM DATE RESULT:",
        {
          from:
            customFromDate
              ? formatDate(
                  customFromDate
                )
              : null,

          to:
            customToDate
              ? formatDate(
                  customToDate
                )
              : null,

          total:
            Number(
              summary.total || 0
            ),

          approved:
            Number(
              summary.approved || 0
            ),

          pending:
            Number(
              summary.pending || 0
            ),

          rejected:
            Number(
              summary.rejected || 0
            ),
        }
      );

    }

    console.log(
      "===================================="
    );

  } catch (error: any) {

    console.log(
      "❌ REPORT LOAD ERROR:",
      error
    );

    setReport({
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    });

    setMonthlyData([]);

    setCategoryData([]);

    Alert.alert(
      "Report Error",
      error?.message ||
      "Unable to load report."
    );

  } finally {

    setLoading(false);

  }

};
// ==========================================================
// LOAD REPORT WHEN FILTER CHANGES
// ==========================================================

useEffect(() => {

  // Custom Date is handled manually
  // after From Date + To Date are selected.
  if (
    selectedFilter === "Custom Date"
  ) {
    return;
  }

  loadReport(
    undefined,
    undefined,
    selectedFilter
  );

}, [selectedFilter]);


  // ==========================================================
  // SEARCH TEXT
  // ==========================================================

  const normalizedSearch =
    searchText
      .trim()
      .toLowerCase();


  // ==========================================================
  // FILTER CATEGORY DATA
  // ==========================================================

 const filteredCategories = categoryData.filter((item) => {

  if (!normalizedSearch) {
    return true;
  }

  return item.name
    .toLowerCase()
    .includes(normalizedSearch);

});
 


  // ==========================================================
  // PIE CHART DATA
  // ==========================================================
const pieData =
  filteredCategories.length > 0
    ? filteredCategories
        .map((item) => ({
          name:
            item.category ||
            item.name ||
            "Other",

          amount:
            Number(item.amount) || 0,

          color:
            item.color ||
            "#2563EB",

          legendFontColor:
            "#374151",

          legendFontSize: 13,
        }))
        .filter(
          (item) => item.amount > 0
        )
    : [
        {
          name: "No Data",
          amount: 1,
          color: "#D1D5DB",
          legendFontColor: "#6B7280",
          legendFontSize: 13,
        },
      ];
  // ==========================================================
  // SELECT FILTER
  // ==========================================================

  const selectFilter = (
    filter: string
  ) => {
    if (filter === "Custom Date") {
      setFilterModalVisible(false);
      setCustomDateModalVisible(true);
      return;
    }

    setSelectedFilter(filter);
    setFilterModalVisible(false);
  };

 // ==========================================================
  // LINE CHART DATA
  // ==========================================================


  // ============================================================
// CHART DATA
// ============================================================

const getChartTitle = () => {
  switch (selectedFilter) {
    case "Today":
      return "Daily Expense Analytics";

    case "Week":
      return "Weekly Expense Analytics";

    case "Month":
      return "Monthly Expense Analytics";

    case "Year":
      return "Yearly Expense Analytics";

    case "Custom Date":
      return "Custom Date Expense Analytics";

    default:
      return "Expense Analytics";
  }
};


const getChartSubtitle = () => {
  switch (selectedFilter) {
    case "Today":
      return "Today's expense report";

    case "Week":
      return "This week's expense report";

    case "Month":
      return "This month's expense report";

    case "Year":
      return "This year's expense report";

    case "Custom Date":
      return fromDate && toDate
        ? `${fromDate.toLocaleDateString("en-IN")} - ${toDate.toLocaleDateString("en-IN")}`
        : "Select a custom date range";

    default:
      return "Expense report";
  }
};


// ============================================================
// FILTER MONTHLY DATA
// ============================================================

const filteredMonthlyData =
  monthlyData.filter((item) => {

    if (!searchText.trim()) {
      return true;
    }

    return String(item.month)
      .toLowerCase()
      .includes(
        searchText
          .trim()
          .toLowerCase()
      );
  });


  // ============================================================
// CUSTOM DATE CHART DATA
// ============================================================

const customDateChartData =
  selectedFilter === "Custom Date" &&
  fromDate &&
  toDate
    ? [
        {
          month:
            `${fromDate.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            )} - ${toDate.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            )}`,

          amount:
            Number(
              report.total || 0
            ),
        },
      ]
    : [];

// ============================================================
// FINAL CHART DATA
// ============================================================

const chartData =
  selectedFilter === "Custom Date"
    ? customDateChartData
    : filteredMonthlyData;
// ============================================================
// LINE LABELS
// ============================================================

const lineLabels =
  chartData.length > 0
    ? chartData.map(
        (item) =>
          String(item.month)
      )
    : ["No Data"];

const lineValues =
  chartData.length > 0
    ? chartData.map(
        (item) => {

          const value =
            Number(item.amount);

          return Number.isFinite(value)
            ? value
            : 0;
        }
      )
    : [0];


// ============================================================
// LINE VALUES
// ============================================================




console.log(
  "📈 CHART FILTER:",
  selectedFilter
);

console.log(
  "📈 MONTHLY DATA:",
  monthlyData
);

console.log(
  "📈 FILTERED MONTHLY DATA:",
  filteredMonthlyData
);

console.log(
  "📈 LINE LABELS:",
  lineLabels
);

console.log(
  "📈 LINE VALUES:",
  lineValues
);


  // ==========================================================
  // SCREEN
  // ==========================================================

  return (

              <View
               style={[
               styles.container,
               {
               backgroundColor:
               colors.background,
               },
               ]}
             >
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{
      paddingBottom: 30,
    }}
   >


        {/* ==================================================
            HEADER
        ================================================== */}


        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.header,
            },
          ]}
        >

          <View>

            <Text
              style={styles.headerTitle}
            >
              Expense Reports
            </Text>

            <Text
              style={styles.subtitle}
            >
              {selectedFilter}
              {" "}
              Expense Analytics
            </Text>

          </View>


         
        </View>


        {/* ==================================================
            FILTER CHIPS
        ================================================== */}

<View
  style={{
    paddingHorizontal: 20,
    marginTop: 12,
  }}
>
  <TouchableOpacity
    onPress={() => setFilterModalVisible(true)}
    disabled={loading}
    activeOpacity={0.7}
    style={styles.filterButton}
  >
    <Ionicons
      name="options-outline"
      size={20}
      color="#2563EB"
    />

    <Text style={styles.filterButtonText}>
      {selectedFilter === "Custom Date"
        ? "Custom Date"
        : selectedFilter}
    </Text>

    <Ionicons
      name="chevron-down"
      size={18}
      color="#64748B"
    />
  </TouchableOpacity>
</View>

        {/* ==================================================
            SEARCH RESULT INFO
        ================================================== */}

        {searchText.trim().length > 0 && (

          <View
            style={
              styles.searchInfo
            }
          >

            <Ionicons
              name="search-outline"
              size={16}
              color="#2563EB"
            />

            <Text
              style={
                styles.searchInfoText
              }
            >
              Searching for "
              {searchText.trim()}
              "
            </Text>

          </View>

        )}


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <View
            style={
              styles.loadingContainer
            }
          >

            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading report...
            </Text>

          </View>

        )}


        {/* ==================================================
            SUMMARY
        ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Summary
        </Text>


        {/* ==================================================
            ROW 1
        ================================================== */}

        <View
          style={styles.cardRow}
        >


          {/* TOTAL */}

          <View
            style={styles.card}
          >

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    "#DBEAFE",
                },
              ]}
            >

              <MaterialCommunityIcons
                name="cash-multiple"
                size={28}
                color="#2563EB"
              />

            </View>


            <Text
              style={styles.cardLabel}
            >
              Total Expense
            </Text>


            <Text
              style={styles.cardValue}
            >

              ₹
              {report.total.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits:
                    2,
                  maximumFractionDigits:
                    2,
                }
              )}

            </Text>


            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    "#DBEAFE",
                },
              ]}
            >

              <Ionicons
                name="wallet-outline"
                size={12}
                color="#2563EB"
              />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      "#2563EB",
                  },
                ]}
              >
                Total
              </Text>

            </View>

          </View>


          {/* APPROVED */}

          <View
            style={styles.card}
          >

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    "#DCFCE7",
                },
              ]}
            >

              <MaterialCommunityIcons
                name="check-circle"
                size={28}
                color="#16A34A"
              />

            </View>


            <Text
              style={styles.cardLabel}
            >
              Approved
            </Text>


            <Text
              style={styles.cardValue}
            >

              ₹
              {report.approved.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits:
                    2,
                  maximumFractionDigits:
                    2,
                }
              )}

            </Text>


            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    "#DCFCE7",
                },
              ]}
            >

              <MaterialCommunityIcons
                name="check-circle"
                size={12}
                color="#16A34A"
              />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      "#16A34A",
                  },
                ]}
              >
                Approved
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================================
            ROW 2
        ================================================== */}

        <View
          style={styles.cardRow}
        >


          {/* PENDING */}

          <View
            style={styles.card}
          >

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    "#FEF3C7",
                },
              ]}
            >

              <MaterialCommunityIcons
                name="clock-outline"
                size={28}
                color="#D97706"
              />

            </View>


            <Text
              style={styles.cardLabel}
            >
              Pending
            </Text>


            <Text
              style={styles.cardValue}
            >

              ₹
              {report.pending.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits:
                    2,
                  maximumFractionDigits:
                    2,
                }
              )}

            </Text>


            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    "#FEF3C7",
                },
              ]}
            >

              <MaterialCommunityIcons
                name="clock-outline"
                size={12}
                color="#D97706"
              />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      "#D97706",
                  },
                ]}
              >
                Pending
              </Text>

            </View>

          </View>


          {/* REJECTED */}

          <View
            style={styles.card}
          >

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    "#FEE2E2",
                },
              ]}
            >

              <MaterialCommunityIcons
                name="close-circle"
                size={28}
                color="#DC2626"
              />

            </View>


            <Text
              style={styles.cardLabel}
            >
              Rejected
            </Text>


            <Text
              style={styles.cardValue}
            >

              ₹
              {report.rejected.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits:
                    2,
                  maximumFractionDigits:
                    2,
                }
              )}

            </Text>


            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    "#FEE2E2",
                },
              ]}
            >

              <MaterialCommunityIcons
                name="close-circle"
                size={12}
                color="#DC2626"
              />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      "#DC2626",
                  },
                ]}
              >
                Rejected
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================================
            MONTHLY EXPENSE ANALYTICS
        ================================================== */}

      <View style={styles.chartCard}>

  {/* =====================================================
      CHART HEADER
  ===================================================== */}

  <View style={styles.chartTitleRow}>

    {/* CHART ICON */}

    <View style={styles.chartIcon}>

      <MaterialCommunityIcons
        name="chart-line"
        size={22}
        color="#2563EB"
      />

    </View>

    {/* TITLE */}

    <View
      style={{
        marginLeft: 12,
        flex: 1,
      }}
    >

      <Text style={styles.chartTitle}>

        {getChartTitle()}

      </Text>

      <Text style={styles.chartSubtitle}>

        {getChartSubtitle()}

      </Text>

    </View>

  </View>


  {/* =====================================================
      LINE CHART
  ===================================================== */}

  <View
    style={{
      marginTop: 10,
      marginLeft: -10,
    }}
  >

    <LineChart

      data={{
        labels:
          lineLabels.length > 0
            ? lineLabels
            : ["No Data"],

        datasets: [
          {
            data:
              lineValues.length > 0
                ? lineValues
                : [0],

            strokeWidth: 3,
          },
        ],
      }}

      width={
        Dimensions.get("window").width - 50
      }

      height={240}

      fromZero={true}

      yAxisInterval={1}

      segments={5}

      bezier

      withDots={true}

      withShadow={false}

      withInnerLines={true}

      withOuterLines={false}

      yAxisLabel="₹"

      yAxisSuffix=""

      chartConfig={{

        backgroundGradientFrom:
          "#FFFFFF",

        backgroundGradientTo:
          "#FFFFFF",

        decimalPlaces: 0,

        color: (
          opacity = 1
        ) =>
          `rgba(37,99,235,${opacity})`,

        labelColor: () =>
          "#64748B",

        propsForLabels: {
          fontSize: 11,
          fontWeight: "500",
        },

        propsForDots: {

          r: "5",

          strokeWidth: "2",

          stroke:
            "#2563EB",
        },

        propsForBackgroundLines: {

          stroke:
            "#E5E7EB",

          strokeDasharray:
            "",
        },
      }}

      style={{
        marginTop: 10,
        borderRadius: 16,
      }}

    />

  </View>

</View>
        {/* ==================================================
            CATEGORY
        ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Expense Categories
        </Text>

<View style={styles.chartCard}>

  <View style={styles.chartHeader}>

    <View style={styles.chartTitleRow}>

      <View style={styles.chartIcon}>

        <MaterialCommunityIcons
          name="chart-pie"
          size={22}
          color="#10B981"
        />

      </View>

      <View
        style={{
          marginLeft: 12,
          flex: 1,
        }}
      >

        <Text style={styles.chartTitle}>
          Category Distribution
        </Text>

        <Text style={styles.chartSubtitle}>
          Expense by Category
        </Text>

      </View>

    </View>

  </View>

  <PieChart
    data={pieData}

    width={
      Dimensions.get("window").width - 70
    }

    height={220}

    accessor="amount"

    backgroundColor="transparent"

    paddingLeft="15"

    hasLegend={true}

    absolute

    chartConfig={{
      color: (
        opacity = 1
      ) =>
        `rgba(16,185,129,${opacity})`,
    }}

    style={{
      marginTop: 10,
    }}
  />

</View>
        {/* ==================================================
            NO SEARCH RESULTS
        ================================================== */}

        {searchText.trim().length > 0 &&
          filteredCategories.length === 0 &&
          filteredMonthlyData.length === 0 && (

            <View
              style={
                styles.noResults
              }
            >

              <Ionicons
                name="search-outline"
                size={40}
                color="#9CA3AF"
              />

              <Text
                style={
                  styles.noResultsTitle
                }
              >
                No matching reports
              </Text>

              <Text
                style={
                  styles.noResultsText
                }
              >
                Try another category,
                month, or search term.
              </Text>

            </View>

          )}

      </ScrollView>


    {/* ====================================================
        FILTER MODAL
    ==================================================== */}

    <Modal
      visible={filterModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() =>
        setFilterModalVisible(false)
      }
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() =>
          setFilterModalVisible(false)
        }
      >
        <View
          style={styles.filterModal}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                Report Filter
              </Text>

              <Text style={styles.modalSubtitle}>
                Select report period
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setFilterModalVisible(false)
              }
            >
              <Ionicons
                name="close"
                size={25}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          {filters.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.modalFilterItem,
                selectedFilter === item &&
                  styles.modalFilterItemActive,
              ]}
              onPress={() => {
                if (item === "Custom Date") {
                  setFilterModalVisible(false);
                  setCustomDateModalVisible(true);
                } else {
                  selectFilter(item);
                }
              }}
            >
              <View style={styles.modalFilterLeft}>
                <Ionicons
                  name={
                    item === "Today"
                      ? "today-outline"
                      : item === "Week"
                      ? "calendar-outline"
                      : item === "Month"
                      ? "calendar"
                      : item === "Year"
                      ? "calendar-number-outline"
                      : "calendar-clear-outline"
                  }
                  size={22}
                  color={
                    selectedFilter === item
                      ? "#2563EB"
                      : "#6B7280"
                  }
                />

                <Text
                  style={[
                    styles.modalFilterText,
                    selectedFilter === item &&
                      styles.modalFilterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </View>

              {selectedFilter === item && (
                <Ionicons
                  name="checkmark-circle"
                  size={23}
                  color="#2563EB"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>

    {/* ====================================================
        CUSTOM DATE MODAL
    ==================================================== */}

    <Modal
      visible={customDateModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setShowDatePicker(false);
        setCustomDateModalVisible(false);
      }}
    >
      <View style={styles.customDateOverlay}>
        <View style={styles.customDateModal}>
          <View style={styles.modalHandle} />

          <Text style={styles.customDateTitle}>
            Custom Date Range
          </Text>

          <Text style={styles.customDateSubtitle}>
            Select From Date and To Date
          </Text>

          <TouchableOpacity
            style={styles.dateSelector}
            activeOpacity={0.7}
            onPress={() => {
              setDatePickerMode("from");
              setShowDatePicker(true);
            }}
          >
            <View>
              <Text style={styles.dateLabel}>
                From Date
              </Text>

              <Text style={styles.dateValue}>
                {fromDate
                  ? fromDate.toLocaleDateString("en-IN")
                  : "Select date"}
              </Text>
            </View>

            <Ionicons
              name="calendar-outline"
              size={22}
              color="#2563EB"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateSelector}
            activeOpacity={0.7}
            onPress={() => {
              if (!fromDate) {
                Alert.alert(
                  "Select From Date",
                  "Please select the From Date first."
                );
                return;
              }

              setDatePickerMode("to");
              setShowDatePicker(true);
            }}
          >
            <View>
              <Text style={styles.dateLabel}>
                To Date
              </Text>

              <Text style={styles.dateValue}>
                {toDate
                  ? toDate.toLocaleDateString("en-IN")
                  : "Select date"}
              </Text>
            </View>

            <Ionicons
              name="calendar-outline"
              size={22}
              color="#2563EB"
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={
                datePickerMode === "from"
                  ? fromDate || new Date()
                  : toDate || fromDate || new Date()
              }
              mode="date"
              display="default"
              maximumDate={new Date()}
              minimumDate={
                datePickerMode === "to"
                  ? fromDate || undefined
                  : undefined
              }
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (event.type === "dismissed") {
                  return;
                }

                if (!selectedDate) {
                  return;
                }

                if (datePickerMode === "from") {
                  setFromDate(selectedDate);

                  if (
                    toDate &&
                    selectedDate > toDate
                  ) {
                    setToDate(null);
                  }
                } else {
                  setToDate(selectedDate);
                }
              }}
            />
          )}

          {fromDate && toDate && (
            <View style={styles.dateRangePreview}>
              <Ionicons
                name="calendar"
                size={18}
                color="#2563EB"
              />

              <Text style={styles.dateRangeText}>
                {fromDate.toLocaleDateString("en-IN")}
                {"  →  "}
                {toDate.toLocaleDateString("en-IN")}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.applyDateButton,
              (!fromDate || !toDate) &&
                styles.applyDateButtonDisabled,
            ]}
            disabled={!fromDate || !toDate}
            onPress={() => {
              if (!fromDate || !toDate) {
                return;
              }

              setSelectedFilter("Custom Date");
              setCustomDateModalVisible(false);
              setShowDatePicker(false);

              loadReport(
                fromDate,
                toDate
              );
            }}
          >
            <Text style={styles.applyDateText}>
              Apply Date Range
            </Text>
          </TouchableOpacity>

          <View style={styles.customDateActionRow}>

            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => {
                setFromDate(null);
                setToDate(null);
                setShowDatePicker(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearDateText}>
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelDateButton}
              onPress={() => {
                setShowDatePicker(false);
                setCustomDateModalVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelDateText}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
</View>
  );

}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

   
    container: {
      flex: 1,

      backgroundColor:
        "#F4F7FB",
    },

    // ========================================================
    // HEADER
    // ========================================================

  header: {
      backgroundColor:
        "#2563EB",

      paddingTop: 55,

      paddingBottom: 24,

      paddingHorizontal: 20,

      borderBottomLeftRadius:
        25,

      borderBottomRightRadius:
        25,
    },


    headerTitle: {
      color: "#FFFFFF",

      fontSize: 26,

      fontWeight: "bold",
    },


     headerSubtitle: {
      color:
        "rgba(255,255,255,0.8)",

      fontSize: 14,

      marginTop: 5,
    },


    title: {
      fontSize: 28,
      fontWeight:
        "bold",
      color:
        "#111827",
    },


    subtitle: {
      color:
        "#6B7280",
      marginTop: 5,
    },


    profile: {
      width: 55,
      height: 55,
      borderRadius: 30,
      backgroundColor:
        "#fff",
      justifyContent:
        "center",
      alignItems:
        "center",
      elevation: 3,
    },


    // ========================================================
    // SEARCH
    // ========================================================

    searchBox: {
  marginHorizontal: 20,
  marginTop: 16,
  height: 52,
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 15,
  borderWidth: 1,
  borderColor: "#E5E7EB",
},

input: {
  flex: 1,
  fontSize: 15,
  color: "#111827",
  marginLeft: 10,
  paddingVertical: 0,
},

clearButton: {
  padding: 4,
  marginRight: 5,
},

searchFilterButton: {
  width: 38,
  height: 38,
  borderRadius: 10,
  backgroundColor: "#EFF6FF",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 5,
},


searchInfo: {
  marginHorizontal: 20,
  marginTop: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  backgroundColor: "#EFF6FF",
  borderRadius: 10,
  flexDirection: "row",
  alignItems: "center",
},

searchInfoText: {
  fontSize: 13,
  fontWeight: "500",
  color: "#2563EB",
  marginLeft: 8,
  flex: 1,
},

    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        10,
    },


    loadingText: {
      marginTop:
        6,
      color:
        "#6B7280",
      fontSize: 13,
    },


    // ========================================================
    // SECTION
    // ========================================================

    sectionTitle: {
      fontSize: 20,
      fontWeight:
        "700",
      marginHorizontal:
        20,
      marginTop:
        10,
      marginBottom:
        15,
      color:
        "#111827",
    },


    // ========================================================
    // SUMMARY CARDS
    // ========================================================

    cardRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      marginHorizontal:
        20,
      marginBottom:
        15,
    },


    card: {
      width:
        "48%",
      backgroundColor:
        "#fff",
      borderRadius:
        18,
      padding:
        18,
      alignItems:
        "center",
      elevation: 3,
    },


    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 18,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom:
        16,
      elevation: 3,
      shadowColor:
        "#000",
      shadowOpacity:
        0.08,
      shadowRadius:
        8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },


    cardValue: {
      fontSize: 22,
      fontWeight:
        "bold",
      marginTop:
        10,
      color:
        "#111827",
    },


    cardLabel: {
      marginTop:
        5,
      color:
        "#6B7280",
    },


    badge: {
      alignSelf:
        "flex-start",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        10,
      paddingVertical:
        6,
      borderRadius:
        30,
      marginTop:
        12,
      marginLeft:
        20,
    },


    badgeText: {
      fontSize: 12,
      fontWeight:
        "700",
      marginLeft:
        4,
      textAlignVertical:
        "center",
    },


    // ========================================================
    // CHART CARD
    // ========================================================

    chartCard: {
      backgroundColor:
        "#FFF",
      marginHorizontal:
        20,
      marginBottom:
        20,
      borderRadius:
        24,
      padding:
        20,
      elevation: 5,
      shadowColor:
        "#000",
      shadowOpacity:
        0.08,
      shadowRadius:
        10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },


    chartHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },


    chartTitleRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },


    chartIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        "#DBEAFE",
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    chartTitle: {
      fontSize: 18,
      fontWeight:
        "800",
      color:
        "#111827",
    },


    chartSubtitle: {
      marginTop: 2,
      fontSize: 13,
      color:
        "#6B7280",
    },


    // ========================================================
    // NO RESULTS
    // ========================================================

    noResults: {
      marginHorizontal:
        20,
      marginBottom:
        20,
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        18,
      padding:
        30,
      alignItems:
        "center",
      elevation: 2,
    },


    noResultsTitle: {
      marginTop:
        10,
      fontSize: 17,
      fontWeight:
        "700",
      color:
        "#374151",
    },


    noResultsText: {
      marginTop:
        5,
      fontSize: 13,
      color:
        "#9CA3AF",
      textAlign:
        "center",
    },


    // ========================================================
    // MODAL
    // ========================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.45)",
      justifyContent:
        "flex-end",
    },


    filterModal: {
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius:
        28,
      borderTopRightRadius:
        28,
      paddingHorizontal:
        20,
      paddingTop:
        12,
      paddingBottom:
        30,
    },


    modalHandle: {
      width: 45,
      height: 5,
      borderRadius: 5,
      backgroundColor:
        "#D1D5DB",
      alignSelf:
        "center",
      marginBottom:
        20,
    },


    modalHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom:
        18,
    },


    modalTitle: {
      fontSize: 21,
      fontWeight:
        "800",
      color:
        "#111827",
    },


    modalSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color:
        "#6B7280",
    },


    modalFilterItem: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      paddingHorizontal:
        15,
      paddingVertical:
        15,
      borderRadius:
        14,
      marginBottom:
        8,
      backgroundColor:
        "#F9FAFB",
    },


    modalFilterItemActive: {
      backgroundColor:
        "#EFF6FF",
    },


    modalFilterLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },


    modalFilterText: {
      marginLeft:
        12,
      fontSize: 16,
      fontWeight:
        "600",
      color:
        "#374151",
    },


    modalFilterTextActive: {
      color:
        "#2563EB",
    },

    filterButton: {
  height: 48,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 12,
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",
},

filterButtonText: {
  flex: 1,
  marginLeft: 10,
  fontSize: 14,
  fontWeight: "600",
  color: "#1E293B",
},


customDateOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "flex-end",
},

customDateModal: {
  backgroundColor: "#FFFFFF",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 30,
  minHeight: 360,
},

customDateTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: "#111827",
  marginBottom: 6,
},

customDateSubtitle: {
  fontSize: 14,
  color: "#6B7280",
  marginBottom: 22,
},


dateSelector: {
  height: 68,
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  paddingHorizontal: 16,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

dateLabel: {
  fontSize: 12,
  fontWeight: "500",
  color: "#64748B",
  marginBottom: 4,
},

dateValue: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1E293B",
},

    dateRangePreview: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#EFF6FF",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 2,
      marginBottom: 4,
    },

    dateRangeText: {
      marginLeft: 8,
      fontSize: 13,
      fontWeight: "600",
      color: "#2563EB",
    },

applyDateButton: {
  height: 50,
  backgroundColor: "#2563EB",
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
},

applyDateButtonDisabled: {
  backgroundColor: "#CBD5E1",
},

applyDateText: {
  fontSize: 15,
  fontWeight: "700",
  color: "#FFFFFF",
},

customDateActionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginTop: 4,
},

clearDateButton: {
  flex: 1,
  height: 45,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#FFFFFF",
},

clearDateText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#64748B",
},

cancelDateButton: {
  height: 45,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 5,
},

cancelDateText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#64748B",
},
  });