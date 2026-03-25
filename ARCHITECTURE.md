# 🏗️ Technical Architecture

## 1. Domain-Driven Design

The system is organized around core financial domains:
- **User Management**: Authentication and profile handling.
- **Transaction Engine**: Processing income and expense records.
- **Budgeting System**: Category-based budget tracking and threshold monitoring.
- **AI Insights**: Intelligent analysis of financial patterns.

## 2. AI Integration Strategy

We utilize **Gemini 3 Flash** for real-time financial advisory.
- **Client-Side Generation**: AI calls are made from the frontend to leverage platform-managed API keys securely.
- **Contextual Analysis**: The model receives a snapshot of user transactions and budgets to provide personalized advice.
- **Structured Output**: Using JSON schemas to ensure AI responses are consistently formatted for the UI.

## 3. Security & Authentication

- **JWT (JSON Web Tokens)**: Stateless authentication using a stable server-side secret.
- **Protected Routes**: React context-based routing to prevent unauthorized access to financial data.
- **Sensitive Data Isolation**: Financial records are strictly scoped to the authenticated user ID.

## 4. Notification System

The `NotificationService` handles automated alerts:
- **Budget Breach**: Triggered when spending exceeds the set limit.
- **Warning Threshold**: Triggered when spending reaches 80% of a budget.
- **Simulated Email**: Logs alerts to the server console and persistent notification logs.

## 5. Data Flow

1. **User Action**: User adds a transaction or sets a budget.
2. **Backend Update**: Data is stored in the in-memory repository.
3. **Real-time Sync**: Dashboard views refresh to reflect the latest state.
4. **AI Analysis**: User triggers insight generation; frontend fetches data, calls Gemini, and saves results to the backend.
