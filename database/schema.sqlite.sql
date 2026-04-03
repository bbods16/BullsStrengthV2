-- Schools Table
CREATE TABLE Schools (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Athletes Table
CREATE TABLE Athletes (
    id TEXT PRIMARY KEY,
    schoolId TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    sport TEXT,
    team TEXT,
    statusTag TEXT DEFAULT 'GREEN',
    height REAL,
    weight REAL,
    trainingAge INTEGER,
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);

-- Wellness Entries
CREATE TABLE WellnessEntries (
    id TEXT PRIMARY KEY,
    athleteId TEXT NOT NULL,
    schoolId TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    sleepHours REAL,
    sleepQuality INTEGER,
    soreness INTEGER,
    fatigue INTEGER,
    stress INTEGER,
    illness INTEGER DEFAULT 0,
    pain INTEGER DEFAULT 0,
    wellnessScore INTEGER,
    FOREIGN KEY (athleteId) REFERENCES Athletes(id),
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);

-- Sessions Table
CREATE TABLE Sessions (
    id TEXT PRIMARY KEY,
    schoolId TEXT NOT NULL,
    athleteId TEXT NOT NULL,
    date TEXT NOT NULL,
    durationMin INTEGER NOT NULL,
    sessionType TEXT NOT NULL,
    sessionRPE INTEGER,
    sessionLoad INTEGER,
    notes TEXT,
    FOREIGN KEY (schoolId) REFERENCES Schools(id),
    FOREIGN KEY (athleteId) REFERENCES Athletes(id)
);

-- Exercise Log
CREATE TABLE ExerciseLog (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    exerciseName TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight REAL NOT NULL,
    volumeLoad REAL,
    rpe INTEGER,
    FOREIGN KEY (sessionId) REFERENCES Sessions(id)
);

-- Load Summary
CREATE TABLE LoadSummary (
    id TEXT PRIMARY KEY,
    athleteId TEXT NOT NULL,
    schoolId TEXT NOT NULL,
    date TEXT NOT NULL,
    dailyLoad INTEGER NOT NULL,
    acuteLoad REAL NOT NULL,
    chronicLoad REAL NOT NULL,
    acwr REAL NOT NULL,
    FOREIGN KEY (athleteId) REFERENCES Athletes(id),
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);

-- Alerts
CREATE TABLE Alerts (
    id TEXT PRIMARY KEY,
    athleteId TEXT NOT NULL,
    schoolId TEXT NOT NULL,
    alertType TEXT NOT NULL, 
    severity TEXT NOT NULL,
    message TEXT,
    triggeredAt TEXT DEFAULT CURRENT_TIMESTAMP,
    isResolved INTEGER DEFAULT 0,
    FOREIGN KEY (athleteId) REFERENCES Athletes(id),
    FOREIGN KEY (schoolId) REFERENCES Schools(id)
);
