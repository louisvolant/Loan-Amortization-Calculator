# Mortgage Amortization Calculator

## Description

A modern, user-friendly web application built with **React.js**, **Next.js**, and **Tailwind CSS** to calculate and visualize mortgage amortization schedules. Users can input loan details or provide sample rows from an existing amortization table to generate a complete schedule, with support for dark mode and persistent state via local storage.

## Features

- **Loan Amortization Calculation**: Calculate a full amortization schedule based on loan amount, annual interest rate, and loan term.
- **Optional Table Row Input**: Rebuild schedules by entering up to three rows from an existing amortization table.
- **Persistent State**: Form inputs and calculated schedules are saved to local storage, restoring the last state on page reload.
- **Responsive Design**: Mobile-friendly interface with a colorful gradient theme using Tailwind CSS.
- **Dark Mode**: Toggle between light and dark themes, with preferences saved in local storage.
- **Error Handling**: Validates inputs and displays clear error messages for invalid data.
- **Extensible**: Built with modern Next.js and React, ready for additional features like CSV export or chart visualization.

## Usage

**Enter Loan Details:**
- Input the loan amount (€), annual interest rate (%), and loan term (years) in the form.

- Example: Loan Amount: 100,000, Interest Rate: 3.6, Loan Term: 20.

**Optional: Add Amortization Table Rows:**
- Provide up to three rows from an existing amortization table (Month, Payment, Interest, Principal, Remaining Balance).

- Example row: Month: 1, Payment: 586.86, Interest: 300.00, Principal: 286.86, Remaining Balance: 99,713.14.

- Click “Add Row” to include additional rows (max 3).

**Calculate Schedule:**
- Click “Calculate Amortization Schedule” to generate the table.

- The schedule displays each month’s payment, interest, principal, and remaining balance.

**Persistence:**
- Form inputs and the calculated schedule are automatically saved to local storage.

- Refresh the page to restore the last state.

**Toggle Theme:**
- Use the footer’s “Switch to Dark/Light Mode” button to change themes.



### Project Structure

mortgage-amortization-calculator/
├── public/                     # Static assets (e.g., icon_mortgage.png, icon_mortgage.svg)
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── globals.css         # Global styles with Tailwind CSS
│   │   ├── layout.tsx          # Root layout with metadata and header/footer
│   │   ├── page.tsx            # Home page rendering LoanAmortizationCalculator
│   │   ├── Footer.tsx          # Footer component with theme toggle
│   │   └── links.ts            # External links for footer
│   ├── components/             # React components
│   │   └── LoanAmortizationCalculator.tsx # Main calculator component
├── package.json                # Project dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation


## Technologies Used

- Next.js (15.x): React framework for server-side rendering and static site generation.
- React.js (19.x): Component-based UI library.
- Tailwind CSS (3.x): Utility-first CSS framework for styling.
- TypeScript: Static typing for JavaScript.
- Local Storage: Browser API for persistent state.
- Geist Font: Modern typography via Next.js font optimization.


## Building for Production

To create a production build, run:
```bash
npm run build
```

## Type Checking

Before pushing your changes, it's recommended to run type checking to catch any TypeScript errors:
```bash
npm run build
# then
npx tsc --noEmit
# or
node --no-warnings node_modules/.bin/tsc --noEmit
# or
npx --no-warnings tsc --noEmit
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
