import * as sql from 'mssql';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const settingsPath = path.resolve(__dirname, '../api/local.settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const env = settings.Values;

async function initSQLite() {
    const dbPath = path.resolve(__dirname, env.DB_SQLITE_PATH || './weightroom.db');
    console.log(`Initializing SQLite database at: ${dbPath}`);
    
    // Remove existing db if needed for fresh start
    // if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = new Database(dbPath);
    const schemaPath = path.resolve(__dirname, './schema.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log("Creating SQLite schema...");
    db.exec(schema);

    console.log("Seeding initial SQLite data...");
    const schoolId = uuidv4();
    
    const insertSchool = db.prepare('INSERT OR IGNORE INTO Schools (id, name, slug) VALUES (?, ?, ?)');
    insertSchool.run(schoolId, 'University at Buffalo', 'ub');

    // Get the ID of the 'ub' school (either the new one or existing)
    const school = db.prepare('SELECT id FROM Schools WHERE slug = ?').get('ub') as any;
    const finalSchoolId = school.id;

    const insertAthlete = db.prepare('INSERT OR IGNORE INTO Athletes (id, schoolId, firstName, lastName, sport, team, statusTag) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertAthlete.run(uuidv4(), finalSchoolId, 'Bryson', 'Bodner', 'Throws', 'Buffalo Track', 'GREEN');
    insertAthlete.run(uuidv4(), finalSchoolId, 'John', 'Doe', 'Football', 'Bulls Football', 'YELLOW');

    console.log("SQLite database initialized and seeded successfully!");
    db.close();
}

async function initMSSQL() {
    const config: sql.config = {
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        server: env.DB_SERVER,
        database: env.DB_NAME,
        options: { encrypt: true, trustServerCertificate: true }
    };

    try {
        console.log(`Connecting to SQL Server: ${env.DB_SERVER}...`);
        const pool = await sql.connect(config);
        const schema = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf8');
        await pool.request().query(schema);
        // ... (existing seed logic)
        console.log("MSSQL initialized.");
        await pool.close();
    } catch (err) {
        console.error("MSSQL failed:", err);
    }
}

if (env.DB_TYPE === 'sqlite') {
    initSQLite();
} else {
    initMSSQL();
}
