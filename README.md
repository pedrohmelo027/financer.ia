# 🧠 AI-Powered Personal Financial Advisor

> An intelligent financial agent powered by AI (Google Gemini) that cross-references your expenses with your life goals to generate highly personalized advice. Built with FastAPI, Next.js, and PostgreSQL, featuring application-level cryptography to ensure data privacy without sacrificing analytical performance.

---

## 📖 Project Overview

Most financial trackers only show you pie charts and bar graphs. This project goes a step further by acting as a **hyper-personalized financial advisor**. By understanding your hobbies, life goals, and daily expenses, the AI agent provides actionable insights—such as suggesting budget reallocations to fund your next trip without cutting down on your favorite hobbies.

### ✨ Key Features

*   **Context-Aware AI Analysis:** The AI doesn't just read numbers; it reads *you*. It analyzes spending patterns against your encrypted life goals and hobbies.
*   **Privacy-First Design:** Sensitive textual data (purchase descriptions, personal goals) is encrypted at the application level before reaching the database.
*   **Interactive Dashboard:** A clean, responsive UI built with Next.js to track monthly incomes, expenses, and payment methods.
*   **Categorized Tracking:** Easily visualize where your money goes via dynamic Recharts graphics.

---

## 🏗️ Architecture & Engineering Highlights

This project was built to demonstrate modern architectural patterns and security best practices:

### 1. Context Injection (Personalized RAG)
Instead of sending raw numbers to the LLM, the backend acts as an orchestrator. It fetches the user's decrypted behavioral profile (hobbies, goals) and aggregates the monthly financial data. This unified context is injected into the Gemini API, transforming a generic AI into a personalized consultant.

### 2. Hybrid Database Cryptography (Security vs. Performance)
To ensure maximum privacy without killing database performance, the system uses a hybrid approach:
*   **Symmetric Encryption (Fernet):** Personally Identifiable Information (PII) and sensitive texts (purchase descriptions, goals) are encrypted in Python before saving to PostgreSQL.
*   **Plaintext Aggregation:** Numerical values (`amount`, `date`, `category`) are stored in plaintext tied only to an anonymous `UUID`. This allows PostgreSQL to execute rapid mathematical calculations (`SUM`, `GROUP BY`) for dashboard charts in milliseconds.

### 3. Fully Decoupled Architecture
*   **Frontend:** Handles state, routing, and UI rendering (React/Next.js).
*   **Backend:** Acts as an API gateway, handling database ORM, data encryption/decryption, and LLM orchestration (Python/FastAPI). 
*   *Advantage:* The backend API can be easily reused for a future mobile app (e.g., React Native) without any code changes.

---

## 🛠️ Tech Stack

**Frontend**
*   [Next.js 14](https://nextjs.org/) (App Router)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/) (Styling)
*   [Recharts](https://recharts.org/) (Data Visualization)
*   [Axios](https://axios-http.com/) (HTTP Client)

**Backend**
*   [Python 3.10+](https://www.python.org/)
*   [FastAPI](https://fastapi.tiangolo.com/) (Web Framework)
*   [SQLAlchemy](https://www.sqlalchemy.org/) (ORM)
*   [Cryptography](https://cryptography.io/en/latest/) (Fernet Symmetric Encryption)
*   [Google Generative AI](https://ai.google.dev/) (Gemini LLM Integration)

**Database & Infrastructure**
*   [PostgreSQL](https://www.postgresql.org/) (Relational Database)
*   UUIDv4 for secure primary keys.

---

## 🗄️ Database Entity-Relationship

```mermaid
erDiagram
    USERS ||--o{ PAYMENT_METHODS : "registers"
    USERS ||--o{ TRANSACTIONS : "makes"
    PAYMENT_METHODS ||--o{ TRANSACTIONS : "used in"

    USERS {
        UUID id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password_hash
        TEXT hobbies "🔒 Encrypted"
        TEXT goals "🔒 Encrypted"
        TIMESTAMP created_at
    }

    PAYMENT_METHODS {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        VARCHAR type
        TIMESTAMP created_at
    }

    TRANSACTIONS {
        UUID id PK
        UUID user_id FK
        UUID payment_method_id FK
        VARCHAR type
        DECIMAL amount "Cleartext for SUM()"
        DATE transaction_date
        VARCHAR category
        TEXT description "🔒 Encrypted"
    }
