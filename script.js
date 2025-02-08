document.addEventListener("DOMContentLoaded", () => {
  // DARK MODE TOGGLE
  const darkToggle = document.getElementById("darkModeToggle");
  
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
      updateChartTheme(balanceChart)
      updateChartTheme(expenseChart)
      
      // Save preference in localStorage
      localStorage.setItem(
        "darkMode",
        document.documentElement.classList.contains("dark-mode")
      );
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
  const rows = transactions.map(tx => `${tx.date},${tx.type},${tx.category},${tx.amount}`);
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
  
  function importTransactionsFromCSV(csvData) {
    const rows = csvData.split("\n").slice(1); // Skip header row
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    rows.forEach(row => {
        if (!row.trim()) return; // Skip empty lines

        const [date, type, category, amount] = row.split(",");
        if (date && type && category && amount) {
            transactions.push({
                date: date.trim(),
                type: type.trim(),
                category: category.trim(),
                amount: parseFloat(amount.trim())
            });
        }
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("Transactions imported successfully!");
    loadTransactions(); // Refresh the table
}

    // ThemeColors
    const ayuColors = {
      income: "#A6E22E", // Green for income
      expense: "#F92672", // Red for expenses
      lightBackground: "#FFFFFF",
      darkBackground: "#1A202C",
      lightText: "#000000",
      darkText: "#F8F8F2",
      palette: ["#66D9EF", "#A6E22E", "#F92672", "#FD971F", "#AE81FF"]
    };

  // SERVICE WORKER REGISTRATION
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => console.log("Service Worker Registered:", reg))
      .catch((err) => console.error("Service Worker Registration Failed:", err));
  }

  // LANDING PAGE CHART (Chart.js)
  const landingChartEl = document.getElementById("landingChart");
  if (landingChartEl) {
    const ctxLanding = landingChartEl.getContext("2d");
    new Chart(ctxLanding, {
      type: "bar",
      data: {
        labels: ["Income", "Expenses"],
        datasets: [
          {
            label: "Sample Data",
            data: [5000, 3000],
            backgroundColor: [
              getComputedStyle(document.documentElement)
                .getPropertyValue("--success")
                .trim() || "#48bb78",
              getComputedStyle(document.documentElement)
                .getPropertyValue("--error")
                .trim() || "#f56565",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        responsiveAnimationDuration: 0,
      },
    });
  }

  // Retrieve transactions from localStorage or initialize as empty array
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let editingIndex = null;
  let balanceChart; // Highcharts instance for the balance graph
  let expenseChart; // Highcharts instance for the expense chart

  // Save transactions to localStorage
  function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  // Render transactions in the table
  function renderTransactions() {
    const tbody = document.getElementById("transactionsBody");
    tbody.innerHTML = "";
    transactions.forEach((tx, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(tx.date).toLocaleDateString()}</td>
        <td style="color:${tx.type === "income" ? ayuColors.income : ayuColors.expense};">${tx.type}</td>
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

  function populateFormForEdit(index) {
    const tx = transactions[index];
    document.getElementById("date").value = tx.date;
    document.getElementById("type").value = tx.type;
    document.getElementById("category").value = tx.category;
    document.getElementById("amount").value = tx.amount;
    editingIndex = index;
    document.getElementById("saveTransaction").innerText = "Update Transaction";
    document.getElementById("cancelEdit").style.display = "inline-block";
  }

  function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
    updateDashboard();
  }

  // Dashboard update:
  // – Filter transactions by year and month from filter inputs.
  // – Update balance graph and expense chart based on filtered data.
  function updateDashboard() {
    const filterYear = document.getElementById("filterYear").value;
    const filterMonth = document.getElementById("filterMonth").value;

    let filteredTx = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      let valid = true;
      if (filterYear) valid = valid && txDate.getFullYear() === parseInt(filterYear);
      if (filterMonth) valid = valid && txDate.getMonth() + 1 === parseInt(filterMonth);
      return valid;
    });

    // Calculate income and expense totals by date for balance graph
    let balanceData = {};
    filteredTx.forEach((tx) => {
      const dateKey = new Date(tx.date).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!balanceData[dateKey]) balanceData[dateKey] = { income: 0, expense: 0 };
      if (tx.type === "income") balanceData[dateKey].income += parseFloat(tx.amount);
      else balanceData[dateKey].expense += parseFloat(tx.amount);
    });

    const dates = Object.keys(balanceData).sort();
    const incomeData = dates.map((date) => balanceData[date].income);
    const expenseData = dates.map((date) => balanceData[date].expense);

    // Update or create the balance graph
    if (balanceChart) {
      balanceChart.series[0].setData(incomeData, true);
      balanceChart.series[1].setData(expenseData, true);
      balanceChart.xAxis[0].setCategories(dates, true);
      updateChartTheme(balanceChart); // Apply theme changes
    } else {
      balanceChart = Highcharts.chart('balanceChart', {
        chart: {type: 'column'},
        title: { text: 'Income vs Expenses' },
        xAxis: { categories: incomeData},
        yAxis: { title: { text: 'Amount ($)'} },
        series: [
          {
            name: 'Income', data: incomeData,
            color: ayuColors.income
          },
          {
            name: 'Expenses', data: expenseData,
            color: ayuColors.expense
          },
        ]
      });
      updateChartTheme(balanceChart); // Apply theme changes
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
      y: expenseByCategory[cat]
    }));

    // Update or create the expense chart
    if (expenseChart) {
      expenseChart.series[0].setData(categoryData, true);
      updateChartTheme(expenseChart); // Apply theme changes
    } else {
      expenseChart = Highcharts.chart('categoryChart', {
        chart: { type: 'pie' },
        title: { text: 'Expenses by Category' },
        series: [{ name: 'Expenses', colorByPoint: true, data: categoryData }]
      });
      updateChartTheme(expenseChart); // Apply theme changes
    }
  }
   // Apply Ayu theme to charts based on current mode (light/dark)
   function updateChartTheme(chartInstance) {
    const isDarkMode = document.documentElement.classList.contains("dark-mode");
    
    chartInstance.update({
      chart: {
        backgroundColor: isDarkMode ? ayuColors.darkBackground : ayuColors.lightBackground,
        style: {
          color: isDarkMode ? ayuColors.darkText : ayuColors.lightText,
          lineColor: isDarkMode ? ayuColors.darkText : ayuColors.lightText,
         }
      },
      title: { style: { color: isDarkMode ? ayuColors.darkText : ayuColors.lightText } },
      xAxis: {
        labels: {
          style: {
            color: isDarkMode ? ayuColors.darkText : ayuColors.lightText,
       } } },
      yAxis: { labels: { style: { color: isDarkMode ? ayuColors.darkText : ayuColors.lightText } } },
    });
  }

  // Handle transaction form submission
  const transactionForm = document.getElementById("transactionForm");
  transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const dateVal = document.getElementById("date").value;
    const typeVal = document.getElementById("type").value;
    const categoryVal = document.getElementById("category").value;
    const amountVal = parseFloat(document.getElementById("amount").value);

    if (editingIndex !== null) {
      transactions[editingIndex] = { date: dateVal, type: typeVal, category: categoryVal, amount: amountVal };
      editingIndex = null;
      document.getElementById("saveTransaction").innerText = "Add Transaction";
      document.getElementById("cancelEdit").style.display = "none";
    } else {
      transactions.push({ date: dateVal, type: typeVal, category: categoryVal, amount: amountVal });
    }
    
    saveTransactions();
    renderTransactions();
    updateDashboard();
    
    transactionForm.reset();
  });

  // Cancel edit
  document.getElementById("cancelEdit").addEventListener("click", () => {
    editingIndex = null;
    transactionForm.reset();
    
    document.getElementById("saveTransaction").innerText = "Add Transaction";
    document.getElementById("cancelEdit").style.display = "none";
  });

  // Collapsible Transactions Section
  const transactionsHeader = document.getElementById('transactionsHeader');
  transactionsHeader.addEventListener('click', () => {
     const tableContainer = document.querySelector('#transactionsTable');
     tableContainer.style.display =
       tableContainer.style.display === 'none' ? 'block' : 'none';
   });

   // Filter inputs trigger dashboard updates
   document.getElementById('filterYear').addEventListener('change', updateDashboard);
   document.getElementById('filterMonth').addEventListener('change', updateDashboard);

  // event Listener for Export CSV 
  document.getElementById("exportCSV").addEventListener("click", exportTransactionsCSV);
  document.addEventListener("DOMContentLoaded", () => {
    // Find the button element
    const exportBtn = document.getElementById("exportCSV");
  
    // Attach event listener if the button exists
    if (exportBtn) {
      exportBtn.addEventListener("click", exportTransactionsCSV);
    }
  });

  document.getElementById("importCSVButton").addEventListener("click", function () {
    document.getElementById("importCSV").click();
});

document.getElementById("importCSV").addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) {
        alert("Please select a CSV file to import.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;
        importTransactionsFromCSV(csvData); // ✅ Call the function to process CSV
    };
    reader.readAsText(file);
});

function importTransactionsFromCSV(csvData) {
    const rows = csvData.trim().split("\n").slice(1); // Skip the header row
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    rows.forEach(row => {
        const values = row.split(",").map(value => value.trim()); // Trim spaces

        if (values.length < 4) return; // Ensure correct column count

        const [date, type, category, amount] = values;
        if (date && type && category && !isNaN(amount)) {
            transactions.push({
                date,
                type,
                category,
                amount: parseFloat(amount)
            });
        }
    });

    localStorage.setItem("transactions", JSON.stringify(transactions)); // ✅ Save to localStorage
    alert("CSV imported successfully!");
    updateTransactionTable(); // ✅ Refresh UI (Ensure this function exists)
}


  
   // Initial render on page load
   renderTransactions();
   updateDashboard();
});
