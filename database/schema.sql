-- Schools Table (Tenants)
CREATE TABLE Schools (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    slug NVARCHAR(100) UNIQUE NOT NULL,
    createdAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Athletes Table
CREATE TABLE Athletes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    schoolId UNIQUEIDENTIFIER NOT NULL,
    firstName NVARCHAR(100) NOT NULL,
    lastName NVARCHAR(100) NOT NULL,
    sport NVARCHAR(100),
    team NVARCHAR(100),
    statusTag NVARCHAR(20) DEFAULT 'GREEN',
    height FLOAT,
    weight FLOAT,
    trainingAge INT,
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);

CREATE INDEX IX_Athletes_SchoolId ON Athletes(schoolId);

-- Wellness Entries
CREATE TABLE WellnessEntries (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    athleteId UNIQUEIDENTIFIER NOT NULL,
    schoolId UNIQUEIDENTIFIER NOT NULL,
    date DATE NOT NULL DEFAULT CAST(SYSDATETIMEOFFSET() AS DATE),
    sleepHours FLOAT,
    sleepQuality INT, -- 1-10
    soreness INT, -- 1-10
    fatigue INT, -- 1-10
    stress INT, -- 1-10
    illness BIT DEFAULT 0,
    pain BIT DEFAULT 0,
    wellnessScore AS (sleepQuality + soreness + fatigue + stress),
    FOREIGN KEY (athleteId) REFERENCES Athletes(id),
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);

CREATE INDEX IX_WellnessEntries_SchoolId ON WellnessEntries(schoolId);
CREATE INDEX IX_WellnessEntries_AthleteId_Date ON WellnessEntries(athleteId, date);

-- Users Table
CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    schoolId UNIQUEIDENTIFIER NOT NULL,
    entraOid NVARCHAR(255) UNIQUE,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL,
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);

CREATE INDEX IX_Users_SchoolId ON Users(schoolId);

-- Sessions Table
CREATE TABLE Sessions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    schoolId UNIQUEIDENTIFIER NOT NULL,
    athleteId UNIQUEIDENTIFIER NOT NULL,
    date DATETIMEOFFSET NOT NULL,
    durationMin INT NOT NULL,
    sessionType NVARCHAR(50) NOT NULL,
    sessionRPE INT,
    sessionLoad INT,
    coachId UNIQUEIDENTIFIER,
    notes NVARCHAR(MAX),
    FOREIGN KEY (schoolId) REFERENCES Schools(id),
    FOREIGN KEY (athleteId) REFERENCES Athletes(id),
    FOREIGN KEY (coachId) REFERENCES Users(id)
);

CREATE INDEX IX_Sessions_SchoolId ON Sessions(schoolId);
CREATE INDEX IX_Sessions_AthleteId ON Sessions(athleteId);

-- Exercise Log (Individual movements within a session)
CREATE TABLE ExerciseLog (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    sessionId UNIQUEIDENTIFIER NOT NULL,
    exerciseName NVARCHAR(255) NOT NULL,
    sets INT NOT NULL,
    reps INT NOT NULL,
    weight FLOAT NOT NULL,
    volumeLoad AS (sets * reps * weight),
    rpe INT,
    restPeriod INT,
    FOREIGN KEY (sessionId) REFERENCES Sessions(id)
);

-- Load Summary (Pre-computed analytics)
CREATE TABLE LoadSummary (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    athleteId UNIQUEIDENTIFIER NOT NULL,
    schoolId UNIQUEIDENTIFIER NOT NULL,
    date DATE NOT NULL,
    dailyLoad INT NOT NULL,
    acuteLoad FLOAT NOT NULL, -- 7-day sum
    chronicLoad FLOAT NOT NULL, -- 28-day avg of weekly loads
    acwr FLOAT NOT NULL,
    FOREIGN KEY (athleteId) REFERENCES Athletes(id),
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);

CREATE INDEX IX_LoadSummary_AthleteId_Date ON LoadSummary(athleteId, date);

-- Alerts
CREATE TABLE Alerts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    athleteId UNIQUEIDENTIFIER NOT NULL,
    schoolId UNIQUEIDENTIFIER NOT NULL,
    alertType NVARCHAR(50) NOT NULL, -- 'ACWR_SPIKE', 'WELLNESS_RED', etc.
    severity NVARCHAR(20) NOT NULL, -- 'CAUTION', 'DANGER'
    message NVARCHAR(MAX),
    triggeredAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    isResolved BIT DEFAULT 0,
    FOREIGN KEY (athleteId) REFERENCES Athletes(id),
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);
