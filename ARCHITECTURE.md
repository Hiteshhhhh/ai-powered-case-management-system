# 🏗️ Technical Architecture

## 1. Clean Architecture Pattern

The system follows the **Clean Architecture** (Onion Architecture) pattern to ensure high maintainability and testability.

### Layers:
- **Domain Layer**: Contains core entities (Ticket, User, SLA), Enums, and Domain logic. It has zero dependencies on other layers.
- **Application Layer**: Contains Business Logic, Services, DTOs, and CQRS patterns (MediatR).
- **Infrastructure Layer**: Implements external concerns like Database Access (EF Core), File Storage (Azure Blob), and AI Clients.
- **API Layer**: The entry point (Controllers) handling HTTP requests, JWT validation, and Swagger documentation.

## 2. AI Integration Strategy

We use a **Prompt Engineering** approach with LLMs (GPT-4 or Gemini) to process unstructured ticket data.

- **Classification**: LLM analyzes text to return a structured JSON object containing Category, Priority, and Department.
- **Summarization**: Generates a one-sentence "TL;DR" for quick agent scanning.
- **Sentiment Analysis**: Detects customer frustration levels to prioritize "Negative" sentiment tickets.
- **Semantic Search**: (Planned) Uses Vector Embeddings to detect duplicate tickets before they are created.

## 3. Notification System

The `NotificationService` is designed as a decoupled component that can be swapped between SMTP, SendGrid, or Azure Email Service.

### Key Events:
- `OnTicketCreated`: Notifies Customer (Confirmation) and Admin (Alert).
- `OnAssignment`: Notifies Agent (New Task).
- `OnSLABreach`: Notifies Admin (Escalation).

## 4. Database Design

The schema is normalized to **3rd Normal Form (3NF)** to ensure data integrity.
- **Audit Logging**: Every ticket change is tracked in `TicketHistory`.
- **SLA Config**: Dynamic rules that can be adjusted without code changes.
- **Indexing**: Optimized for common queries (Status, Priority, CustomerId).

## 5. Scalability

- **Stateless API**: Allows horizontal scaling behind a Load Balancer.
- **Background Jobs**: Email sending and SLA checks are handled by background workers (Azure Functions) to prevent blocking the main request thread.
- **Caching**: (Optional) Redis caching for frequently accessed dashboard stats.
