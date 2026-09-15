# Mortgage Amortization Calculator

## Description

A modern, user-friendly web application built with **React.js**, **Next.js**, and **Tailwind CSS** to calculate and visualize mortgage amortization schedules. Users can input loan details or provide sample rows from an existing amortization table to generate a complete schedule, with support for dark mode and persistent state via local storage.

## Features

- **Loan Amortization Calculation**: Calculate a full amortization schedule based on loan amount, annual interest rate, and loan term.
- **Loan Types Support**: Choose between standard amortizing loans and interest-only loans with customizable interest-only durations and automatic term re-amortization or balloon payoff at maturity.
- **Variable / Adjustable Rates (ARM)**: Define scheduled interest rate adjustments at any month of the loan term, with automatic payment recalculation over remaining balances.
- **Real-Time Input Validation**: Immediate validation as you type with accessible inline error alerts, red boundary highlights, and localized guidance in English, Spanish, and French.
- **Optional Table Row Input**: Rebuild schedules by entering up to three rows from an existing amortization table.
- **Persistent State**: Form inputs, loan configurations, and calculated schedules are saved to local storage, restoring the last state on page reload.
- **Responsive Design**: Mobile-friendly interface with a colorful gradient theme using Tailwind CSS.
- **Dark Mode**: Toggle between light and dark themes, with preferences saved in local storage.
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
├── public/                     # Static assets (e.g., icon_calculator.png, icon_calculator.svg)
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── globals.css         # Global styles with Tailwind CSS
│   │   ├── layout.tsx          # Root layout with metadata and header/footer
│   │   ├── page.tsx            # Home page rendering LoanAmortizationCalculator
│   │   ├── Footer.tsx          # Footer component with theme toggle
│   │   ├── links.ts            # External links for footer
│   │   └── sitemap.ts          # Sitemap generator
│   ├── components/             # React components
│   │   └── LoanAmortizationCalculator.tsx # Main calculator component
│   └── utils/                  # TypeScript interfaces and localization
├── next.config.ts              # Next.js configuration (static export)
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── wrangler.toml               # Cloudflare Workers configuration
└── README.md                   # Project documentation


## Technologies Used

- Next.js (16.x): React framework configured for static export (`output: "export"`).
- React.js (19.x): Component-based UI library.
- Tailwind CSS (4.x): Utility-first CSS framework for modern styling.
- TypeScript: Static typing for JavaScript.
- Cloudflare Workers / Assets: Fast and globally distributed hosting via Wrangler.
- Local Storage: Browser API for persistent state.
- Geist Font: Modern typography via Next.js font optimization.


## Development & Deployment

### Local Development

Run the development server with Turbopack:
```bash
npm run dev
```

### Building for Production

Build the static site output to the `./out` directory:
```bash
npm run build
```

### Previewing with Cloudflare Wrangler

Test the static build locally using Wrangler's local development server:
```bash
npm run preview
```

### Deploying to Cloudflare

Deploy the application to Cloudflare Workers with static assets:
```bash
npm run deploy
```

> **Note on `keep_vars = true`**:
> The `wrangler.toml` configuration specifies `keep_vars = true`. This ensures that any environment variables or secrets defined in the Cloudflare Dashboard are preserved across deployments and not overwritten or deleted by Wrangler.

### Custom Domain Setup

To attach a custom domain (e.g., `loan-amortization-calculator.louisvolant.com`):
1. Navigate to the Worker in the **Cloudflare Dashboard**.
2. Go to **Settings > Domains & Routes**.
3. Add your custom domain. Cloudflare handles DNS records and SSL/TLS certificates automatically.


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
