
---

# PennyTrack

PennyTrack is a personal expense management application designed to help users track their income and expenses effectively. With an intuitive user interface, PennyTrack enables users to monitor their financial health and make informed decisions about their spending habits.

This project is part of the **Web Development** course in the **BSc in Computer Science** program at [**OPIT**](https://www.opit.com/).

## Live Demo

PennyTrack is hosted on GitHub Pages. You can access the live version here:  
🔗 [PennyTrack Live](https://josemariasava-opit.github.io/PennyTrack/index.html)

## Features

### Core Features
- **Expense Tracking**: Add, edit, and delete expenses to keep an accurate record of your spending.
- **Income Tracking**: Record various income sources to monitor your earnings.
- **Categorization**: Organize transactions into categories for better analysis.
- **Financial Insights**: Gain insights into your spending patterns through visual charts and graphs.
- **LocalStorage Support**: All user data is stored in the browser's **LocalStorage**, ensuring persistence between sessions without requiring a backend.

### Enhanced Features
- **Dark Mode**: Toggle between light and dark themes for a personalized user experience.
- **CSV Import/Export**: Easily import and export transactions as CSV files for backup or sharing purposes.
- **Smooth Scrolling**: Smooth navigation between sections for a seamless user experience.
- **Dynamic Charts**:
  - **Income vs Expenses**: Visualize monthly income and expenses in a clean bar chart.
  - **Expenses by Category**: Analyze spending habits with a pie chart that groups expenses by category.
- **Customizable Filters**: Filter transactions by year and month to focus on specific time periods.
- **Formspree Integration**: A contact form integrated with Formspree allows users to send feedback or inquiries directly from the app.

### Additional Features
- **Responsive Design**: The app is optimized for both desktop and mobile devices.
- **Service Worker**: Offline support and improved performance using a service worker.
- **Highcharts Library**: Interactive and visually appealing charts powered by Highcharts.
- **Theme Customization**: Dynamic theming ensures charts and UI elements adapt to light or dark mode.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Storage**: LocalStorage (no backend required)
- **Charts**: Highcharts (for dynamic and interactive visualizations)
- **Form Handling**: Formspree (for contact form submissions)
- **Offline Support**: Service Worker (via `/sw.js`)
- **Dependencies**:
  - Font Awesome (for icons like GitHub in the footer)
  - Highcharts (for financial charts)

## How to Use

1. **Add Transactions**:
   - Navigate to the "Tracker" page.
   - Fill out the form with the transaction details (date, type, category, amount).
   - Click "Add Transaction" to save it.

2. **Edit/Delete Transactions**:
   - Use the "Edit" button to modify existing transactions.
   - Use the "Delete" button to remove unwanted transactions.

3. **Filter Data**:
   - Use the filter options (year and month) to view transactions for specific periods.
   - The charts will dynamically update based on your selection.

4. **Export/Import Transactions**:
   - Click "Export CSV" to download your transactions as a CSV file.
   - Use the "Import CSV" button to upload a CSV file and add bulk transactions.

5. **Contact Us**:
   - Use the contact form on the "About" page to send feedback or inquiries. Messages are sent via Formspree.

6. **Toggle Dark Mode**:
   - Use the toggle switch in the header to switch between light and dark themes.

## Formspree Integration

The contact form is integrated with **Formspree**, a service that allows you to handle form submissions without a backend. To set up Formspree for your own deployment:

1. Go to [Formspree](https://formspree.io/) and create an account.
2. Create a new form and copy the endpoint URL.
3. Replace the `action` attribute of the `<form>` element in the `contactForm` section with your Formspree endpoint URL.

Example:
```html
<form id="contactForm" action="https://formspree.io/f/your-formspree-endpoint" method="POST">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <textarea name="message" placeholder="Your Message" required></textarea>
  <button type="submit">Send</button>
</form>
```

## Contribution Instructions

We welcome contributions from the community! If you'd like to contribute to PennyTrack, please follow these steps:

1. **Fork the Repository**:
   - Click the "Fork" button on the top-right corner of this repository to create a copy under your GitHub account.

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/PennyTrack.git
   cd PennyTrack
   ```

3. **Set Up the Upstream Remote**:
   - Add the original repository as the upstream remote to keep your fork in sync:
   ```bash
   git remote add upstream https://github.com/josemariasava-opit/PennyTrack.git
   ```

4. **Create a New Branch**:
   - Always create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   - Use descriptive branch names like `feature/add-dark-mode` or `bugfix/fix-chart-rendering`.

5. **Make Your Changes**:
   - Implement your changes or fixes. Ensure your code adheres to the project's coding standards.

6. **Test Your Changes**:
   - Test your changes locally to ensure everything works as expected.
   - Open the `index.html` file in your browser to verify functionality.

7. **Commit and Push Your Changes**:
   ```bash
   git add .
   git commit -m "Add a concise commit message describing your changes"
   git push origin feature/your-feature-name
   ```

8. **Submit a Pull Request (PR)**:
   - Go to your forked repository on GitHub and click "Compare & pull request."
   - Provide a clear title and description for your PR, explaining the changes you made and why they are necessary.
   - Submit the PR for review.

9. **Respond to Feedback**:
   - Be open to feedback from the maintainers. Make any requested changes and push them to your branch.

## Future Enhancements

- **Backend Integration**: Add a backend for cloud storage and multi-device synchronization.
- **Authentication**: Implement user login and registration for personalized accounts.
- **Advanced Analytics**: Provide more detailed reports and predictive insights.
