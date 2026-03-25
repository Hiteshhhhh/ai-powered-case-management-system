-- ===============================================================
-- AI-Powered Financial Advisor Database Schema
-- Target: SQL Server / PostgreSQL
-- ===============================================================

-- 1. Users Table
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'User', -- Admin, User
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE()
);

-- 2. Transactions Table
CREATE TABLE Transactions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Amount DECIMAL(18, 2) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- Income, Expense
    Category NVARCHAR(100) NOT NULL, -- Salary, Rent, Dining, etc.
    Description NVARCHAR(500) NULL,
    Date DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE()
);

-- 3. Budgets Table
CREATE TABLE Budgets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Category NVARCHAR(100) NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    Period NVARCHAR(50) NOT NULL DEFAULT 'Monthly' -- Monthly, Yearly
);

-- 4. AIInsights Table
CREATE TABLE AIInsights (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Content NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- Recommendation, Alert, Strategy
    Timestamp DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE()
);

-- 5. NotificationLogs Table
CREATE TABLE NotificationLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Recipient NVARCHAR(256) NOT NULL,
    Subject NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Timestamp DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE()
);

-- ===============================================================
-- Indexes for Performance
-- ===============================================================
CREATE INDEX IX_Transactions_UserId ON Transactions(UserId);
CREATE INDEX IX_Transactions_Date ON Transactions(Date);
CREATE INDEX IX_Budgets_UserId ON Budgets(UserId);
CREATE INDEX IX_AIInsights_UserId ON AIInsights(UserId);
