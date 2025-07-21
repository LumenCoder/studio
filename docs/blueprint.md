# **App Name**: Taco Vision

## Core Features:

- User Authentication: Secure user authentication with username and 4-digit PIN.
- Inventory Input & Display: Enter, modify, and display real-time stock levels. Each item includes: Name, Amount in stock, Minimum threshold, Restock recommendation, Category.
- Predictive Inventory Analysis Tool: Leverage past entries and sales data to anticipate future inventory needs based on the day of the week and sales patterns. Flags potential shortages or overstocking.
- Automated Scheduling Alerts: Automated alerts on Mondays and Thursdays. Offers smart ordering suggestions based on inventory trends, comparing current levels against predicted demand.
- Budget Oversight: Set and monitor weekly/monthly budgets. Tracks expenditure per item and sends alerts when approaching or exceeding the budget.
- Immutable Audit Logs: Keep immutable records of every modification, noting the user, timestamp, item, and action taken. This data is stored in a flat file, JSON, or a simple database like SQLite or Firebase.
- Sleek Interface: A clean and contemporary interface offering both light and dark themes, animated transitions, and responsiveness on both mobile and desktop.

## Style Guidelines:

- For the primary color, a vibrant, appetizing HSL value of 26, 90%, 50% will translate to a corresponding hex code of #F05D23.
- The background color utilizes an analogous HSL value of 26, 20%, 90% - resulting in a softened hex value of #E8D9D3.
- As an accent, an HSL value of 56, 70%, 40% (a yellow color, which sits about 30 degrees to the 'left' on the color wheel, in relation to our orange primary) gives an RGB hex value of #B8911E.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern, machined, objective, neutral look; suitable for headlines or body text.
- Crisp, modern icons to represent inventory items and categories, ensuring quick visual identification.
- A clean, efficient layout prioritizing key metrics and easy data entry for daily inventory management.
- Subtle, purposeful animations to guide the user and provide feedback on interactions, enhancing the user experience.