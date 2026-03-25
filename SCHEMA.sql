-- ===============================================================
-- AI-Powered Smart Case / Ticket Assistant Database Schema
-- Target: SQL Server
-- ===============================================================

-- 1. Roles Table
CREATE TABLE Roles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE -- Admin, Agent, Customer
);

-- 2. Departments Table
CREATE TABLE Departments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE
);

-- 3. Users Table
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    RoleId INT NOT NULL FOREIGN KEY REFERENCES Roles(Id),
    DepartmentId INT NULL FOREIGN KEY REFERENCES Departments(Id),
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1
);

-- 4. Tickets Table
CREATE TABLE Tickets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(500) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(50) NOT NULL, -- Open, InProgress, Resolved, Closed
    Priority NVARCHAR(50) NOT NULL, -- Low, Medium, High, Critical
    Category NVARCHAR(100) NOT NULL, -- Bug, Feature, Complaint, Question
    Sentiment NVARCHAR(50) NULL, -- Positive, Neutral, Negative
    Summary NVARCHAR(MAX) NULL, -- AI Generated
    
    CustomerId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    AssignedAgentId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    DepartmentId INT NULL FOREIGN KEY REFERENCES Departments(Id),
    
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    SLADueDate DATETIMEOFFSET NOT NULL,
    IsEscalated BIT NOT NULL DEFAULT 0
);

-- 5. TicketHistory Table (Audit Log for Ticket Changes)
CREATE TABLE TicketHistory (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    TicketId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Tickets(Id),
    Action NVARCHAR(100) NOT NULL, -- StatusChange, Assignment, CommentAdded, AIAnalysis
    PerformedBy UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Timestamp DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    Notes NVARCHAR(MAX) NULL
);

-- 6. Comments Table
CREATE TABLE Comments (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    TicketId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Tickets(Id),
    UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    IsInternal BIT NOT NULL DEFAULT 0 -- Only agents/admins can see internal comments
);

-- 7. Attachments Table
CREATE TABLE Attachments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TicketId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Tickets(Id),
    FileName NVARCHAR(255) NOT NULL,
    FileUrl NVARCHAR(MAX) NOT NULL, -- Azure Blob Storage URL
    FileSize BIGINT NOT NULL,
    UploadedBy UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    UploadedAt DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE()
);

-- 8. SLAConfig Table
CREATE TABLE SLAConfig (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Priority NVARCHAR(50) NOT NULL UNIQUE,
    ResolutionTimeHours INT NOT NULL,
    ResponseTimeHours INT NOT NULL
);

-- 9. AuditLogs Table (System-wide Audit)
CREATE TABLE AuditLogs (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    UserId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    Action NVARCHAR(100) NOT NULL,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NOT NULL,
    Timestamp DATETIMEOFFSET NOT NULL DEFAULT GETUTCDATE(),
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(MAX) NULL
);

-- ===============================================================
-- Indexes for Performance
-- ===============================================================
CREATE INDEX IX_Tickets_Status ON Tickets(Status);
CREATE INDEX IX_Tickets_Priority ON Tickets(Priority);
CREATE INDEX IX_Tickets_CustomerId ON Tickets(CustomerId);
CREATE INDEX IX_Tickets_AssignedAgentId ON Tickets(AssignedAgentId);
CREATE INDEX IX_TicketHistory_TicketId ON TicketHistory(TicketId);
CREATE INDEX IX_Comments_TicketId ON Comments(TicketId);
