document.addEventListener("DOMContentLoaded", () => {
  // DARK MODE TOGGLE
  const darkToggle = document.getElementById("darkModeToggle");

  // Chart variables declared at the right scope level
  let balanceChart; // Highcharts instance for the balance graph
  let expenseChart; // Highcharts instance for the expense chart
  let landingChart; // Highcharts instance for the landing page chart

  // Check localStorage for dark mode preference on page load
  if (localStorage.getItem("darkMode") === "true") {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");
  }

  // Add event listener to toggle dark mode
  if (darkToggle) {
    darkToggle.addEventListener("click", (e) => {
      e.preventDefault();
      document.documentElement.classList.toggle("dark-mode");
      document.body.classList.toggle("dark-mode");

      // Update all chart themes
      if (balanceChart) updateChartTheme(balanceChart);
      if (expenseChart) updateChartTheme(expenseChart);
      if (landingChart) updateChartTheme(landingChart);

      // Save preference in localStorage
      localStorage.setItem(
        "darkMode",
        document.documentElement.classList.contains("dark-mode")
      );
    });
  }

  // Hamburger Menu Toggle
  const navbarToggle = document.querySelector(".navbar-toggle"); 
  const navLinks = document.querySelector(".nav-links"); 

  if (navbarToggle && navLinks) {
    navbarToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Export all transactions from localStorage as a CSV file
  function exportTransactionsCSV() {
    // Retrieve transactions (or an empty array if none exist)
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    if (!transactions.length) {
      alert("No transactions to export.");
      return;
    }

    // Create header row and join all rows with newlines
    const header = ["Date", "Type", "Category", "Amount"].join(",");
    const rows = transactions.map(
      (tx) => `${tx.date},${tx.type},${tx.category},${tx.amount}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");

    // Create a temporary link element and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Import transactions from CSV
  function importTransactionsFromCSV(csvData) {
    const rows = csvData.split("\n").slice(1); // Skip header row
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    rows.forEach((row) => {
      if (!row.trim()) return; // Skip empty lines
      const [date, type, category, amount] = row.split(",");
      if (date && type && category && amount) {
        transactions.push({
          date: date.trim(),
          type: type.trim(),
          category: category.trim(),
          amount: parseFloat(amount.trim()),
        });
      }
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("Transactions imported successfully!");
    loadTransactions(); // Refresh the table
  }

  // ThemeColors
  const graphColors = {
    income: "#6CBF43", // Green for income
    expense: "#E65050", // Red for expenses
    lightBackground: "#FFFFFF",
    darkBackground: "#1A202C",
    lightText: "#000000",
    darkText: "#F8F8F2",
    palette: ["#FA8D3E", "#F07171", "#695380", "#FFCC66", "#3B414A"],
  };

  // SERVICE WORKER REGISTRATION
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker Registered:", reg))
      .catch((err) => console.error("Service Worker Registration Failed:", err));
  }

  // LANDING PAGE CHART
  const landingChartEl = document.getElementById("landingChart");
  if (landingChartEl) {
    landingChart = Highcharts.chart("landingChart", {
      chart: { type: "column" },
      title: { text: "Income vs Expenses" },
      xAxis: {
        categories: ["Income", "Expenses"],
        crosshair: true,
      },
      yAxis: {
        title: { text: "Amount ($)" },
        min: 0,
      },
      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "top",
        x: 0,
        y: 20,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          stacking: null,
        },
      },
      series: [
        { name: "Income", data: [5000], color: "#6CBF43" },
        { name: "Expenses", data: [3000], color: "#E65050" },
      ],
    });

    // Apply theme
    updateChartTheme(landingChart);
  }

  // Retrieve transactions from localStorage or initialize as empty array
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let editingIndex = null;

  // Save transactions to localStorage
  function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  // Render transactions in the table
  function renderTransactions() {
    const tbody = document.getElementById("transactionsBody");
    if (!tbody) return; // Guard clause if not on the tracker page

    tbody.innerHTML = "";
    transactions.forEach((tx, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(tx.date).toLocaleDateString()}</td>
        <td style="color:${tx.type === "income" ? graphColors.income : graphColors.expense};">${tx.type}</td>
        <td>${tx.category}</td>
        <td>${parseFloat(tx.amount).toFixed(2)}</td>
        <td>
          <button class="edit-btn" data-index="${index}">Edit</button>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Attach event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        populateFormForEdit(idx);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        deleteTransaction(idx);
      });
    });
  }

  // Populate form for editing a transaction
  function populateFormForEdit(index) {
    const tx = transactions[index];
    const dateEl = document.getElementById("date");
    const typeEl = document.getElementById("type");
    const categoryEl = document.getElementById("category");
    const amountEl = document.getElementById("amount");
    const saveTransactionBtn = document.getElementById("saveTransaction");
    const cancelEditBtn = document.getElementById("cancelEdit");

    if (
      dateEl &&
      typeEl &&
      categoryEl &&
      amountEl &&
      saveTransactionBtn &&
      cancelEditBtn
    ) {
      dateEl.value = tx.date;
      typeEl.value = tx.type;
      categoryEl.value = tx.category;
      amountEl.value = tx.amount;
      editingIndex = index;
      saveTransactionBtn.innerText = "Update Transaction";
      cancelEditBtn.style.display = "inline-block";
    }
  }

  // Delete a transaction
  function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
    updateDashboard();
  }

  // Update dashboard charts and filters
  function updateDashboard() {
    const filterYearEl = document.getElementById("filterYear");
    const filterMonthEl = document.getElementById("filterMonth");
    if (!filterYearEl || !filterMonthEl) return; // Not on tracker page

    const filterYear = filterYearEl.value;
    const filterMonth = filterMonthEl.value;

    let filteredTx = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      let valid = true;
      if (filterYear) valid = valid && txDate.getFullYear() === parseInt(filterYear);
      if (filterMonth)
        valid = valid && txDate.getMonth() + 1 === parseInt(filterMonth);
      return valid;
    });

    // Group transactions by month
    let monthlyData = {};
    filteredTx.forEach((tx) => {
      const dateKey = `${new Date(tx.date).getFullYear()}-${String(
        new Date(tx.date).getMonth() + 1
      ).padStart(2, "0")}`; // Format: YYYY-MM
      if (!monthlyData[dateKey]) monthlyData[dateKey] = { income: 0, expense: 0 };
      if (tx.type === "income") monthlyData[dateKey].income += parseFloat(tx.amount);
      else monthlyData[dateKey].expense += parseFloat(tx.amount);
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();

    // Prepare income and expense data for the chart
    const incomeData = sortedMonths.map((month) => monthlyData[month].income);
    const expenseData = sortedMonths.map((month) => monthlyData[month].expense);

    // Update or create the balance graph
    const balanceChartEl = document.getElementById("balanceChart");
    if (balanceChartEl) {
      if (balanceChart) {
        balanceChart.series[0].setData(incomeData, true); // Update income data
        balanceChart.series[1].setData(expenseData, true); // Update expense data
        balanceChart.xAxis[0].setCategories(sortedMonths, true); // Update categories
        updateChartTheme(balanceChart); // Apply theme changes
      } else {
        balanceChart = Highcharts.chart("balanceChart", {
          chart: { type: "column" },
          title: { text: "Income vs Expenses" },
          xAxis: {
            categories: sortedMonths, // Months as categories
            title: { text: "Month" },
          },
          yAxis: {
            title: { text: "Amount ($)" },
            min: 0,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
            },
          },
          series: [
            {
              name: "Income",
              data: incomeData, // Income totals for each month
              color: graphColors.income,
            },
            {
              name: "Expenses",
              data: expenseData, // Expense totals for each month
              color: graphColors.expense,
            },
          ],
        });
        updateChartTheme(balanceChart); // Apply theme changes
      }
    }

    // Group expenses by category for expense chart
    let expenseByCategory = {};
    filteredTx.forEach((tx) => {
      if (tx.type === "expense") {
        if (!expenseByCategory[tx.category]) expenseByCategory[tx.category] = 0;
        expenseByCategory[tx.category] += parseFloat(tx.amount);
      }
    });

    const categoryData = Object.keys(expenseByCategory).map((cat) => ({
      name: cat,
      y: expenseByCategory[cat],
    }));

    // Update or create the expense chart
    const categoryChartEl = document.getElementById("categoryChart");
    if (categoryChartEl) {
      if (expenseChart) {
        expenseChart.series[0].setData(categoryData, true);
        updateChartTheme(expenseChart); // Apply theme changes
      } else {
        expenseChart = Highcharts.chart("categoryChart", {
          chart: { type: "pie" },
          title: { text: "Expenses by Category" },
          series: [{ name: "Expenses", colorByPoint: true, data: categoryData }],
        });
        updateChartTheme(expenseChart); // Apply theme changes
      }
    }
  }

  // Apply theme to charts based on current mode (light/dark)
  function updateChartTheme(chartInstance) {
    if (!chartInstance) return; // Safety first
    const isDarkMode = document.documentElement.classList.contains("dark-mode");
    chartInstance.update({
      chart: {
        backgroundColor: isDarkMode ? graphColors.darkBackground : graphColors.lightBackground,
      },
      title: {
        style: { color: isDarkMode ? graphColors.darkText : graphColors.lightText },
      },
      xAxis: {
        lineColor: isDarkMode ? graphColors.darkText : graphColors.lightText, // Axis line color
        tickColor: isDarkMode ? graphColors.darkText : graphColors.lightText, // Tick marks color
        labels: {
          style: {
            color: isDarkMode ? graphColors.darkText : graphColors.lightText,
          },
        },
        title: {
          style: {
            color: isDarkMode ? graphColors.darkText : graphColors.lightText,
          },
        },
      },
      yAxis: {
        lineColor: isDarkMode ? graphColors.darkText : graphColors.lightText, // Axis line color
        tickColor: isDarkMode ? graphColors.darkText : graphColors.lightText, // Tick marks color
        gridLineColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)", // Better grid line visibility
        labels: {
          style: { color: isDarkMode ? graphColors.darkText : graphColors.lightText },
        },
        title: {
          style: {
            color: isDarkMode ? graphColors.darkText : graphColors.lightText,
          },
        },
      },
      plotOptions: {
        series: {
          dataLabels: {
            style: { color: isDarkMode ? graphColors.darkText : graphColors.lightText },
          },
        },
      },
      legend: {
        itemStyle: { color: isDarkMode ? graphColors.darkText : graphColors.lightText },
      },
    });
  }

  // Handle transaction form submission
  const transactionForm = document.getElementById("transactionForm");
  if (transactionForm) {
    transactionForm.addEventListener("submit", (e) => {
      e.preventDefault();
        
      const dateVal = document.getElementById("date").value;
      const typeVal = document.getElementById("type").value;
      const categoryVal = document.getElementById("category").value;
      const amountVal = parseFloat(document.getElementById("amount").value);

      if (editingIndex !== null) {
        transactions[editingIndex] = {
          date: dateVal,
          type: typeVal,
          category: categoryVal,
          amount: amountVal,
        };
        editingIndex = null;
        document.getElementById("saveTransaction").innerText = "Add Transaction";
        document.getElementById("cancelEdit").style.display = "none";
      } else {
        transactions.push({
          date: dateVal,
          type: typeVal,
          category: categoryVal,
          amount: amountVal,
        });
      }

      // Calling functions
      saveTransactions();
      renderTransactions();
      updateDashboard();
      transactionForm.reset();
    });
  }

  // Cancel edit
  const cancelEditBtn = document.getElementById("cancelEdit");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      editingIndex = null;
      transactionForm.reset();
      document.getElementById("saveTransaction").innerText = "Add Transaction";
      document.getElementById("cancelEdit").style.display = "none";
    });
  }

  // Collapsible Transactions Section
    const transactionsHeader = document.getElementById('transactionsHeader');
  if (transactionsHeader) {
      transactionsHeader.addEventListener('click', () => {
        const tableContainer = document.querySelector('#transactionsTable');
      tableContainer.style.display =
          tableContainer.style.display === 'none' ? 'block' : 'none';
    });
  }

  // Filter inputs trigger dashboard updates
    const filterYearEl = document.getElementById('filterYear');
    const filterMonthEl = document.getElementById('filterMonth');
  if (filterYearEl) {
      filterYearEl.addEventListener('change', updateDashboard);
  }
  if (filterMonthEl) {
      filterMonthEl.addEventListener('change', updateDashboard);
  }

  // Event listener for Export CSV
  const exportCSVBtn = document.getElementById("exportCSV");
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener("click", exportTransactionsCSV);
  }

  // Import CSV functionality
  const importCSVButtonEl = document.getElementById("importCSVButton");
  const importCSVEl = document.getElementById("importCSV");
    
  if (importCSVButtonEl && importCSVEl) {
      importCSVButtonEl.addEventListener("click", function() {
      importCSVEl.click();
    });

      importCSVEl.addEventListener("change", function(event) {
      const file = event.target.files[0];
      if (!file) {
        alert("Please select a CSV file to import.");
        return;
      }
  
      const reader = new FileReader();
        reader.onload = function(e) {
        const csvData = e.target.result;
        importTransactionsFromCSV(csvData);
      };
      reader.readAsText(file);
    });
  }

  // Smooth Scrolling for Navigation Links
    document.querySelectorAll('.nav-link').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href'); // Get the href attribute

      // Check if the link is for smooth scrolling (starts with '#')
        if (href.startsWith('#')) {
        e.preventDefault(); // Prevent default behavior only for internal links
        const targetId = href.substring(1); // Remove the '#' to get the target ID
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the target
        }
      }
      // For external links (e.g., 'index.html', 'tracker.html'), do nothing
      // The browser will handle navigation automatically
    });
  });
  
    function updateTransactionTable() {
      renderTransactions();
      updateDashboard();
    }

  // Initial render on page load
  renderTransactions();
  updateDashboard();
});