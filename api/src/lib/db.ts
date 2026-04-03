import * as sql from 'mssql';
import Database from 'better-sqlite3';
import * as path from 'path';

const isSqlite = process.env.DB_TYPE === 'sqlite';

const mssqlConfig: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || '',
    database: process.env.DB_NAME,
    options: {
        encrypt: process.env.DB_TRUST_CERT !== 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
    }
};

let sqliteInstance: any = null;

export async function getDbConnection() {
    if (isSqlite) {
        if (!sqliteInstance) {
            const dbPath = path.resolve(__dirname, process.env.DB_SQLITE_PATH || '../../database/weightroom.db');
            sqliteInstance = new Database(dbPath);
        }
        return sqliteInstance;
    } else {
        if (sql.globalConnection && sql.globalConnection.connected) {
            return sql.globalConnection;
        }
        return await sql.connect(mssqlConfig);
    }
}

/**
 * Simple query helper to bridge MSSQL and SQLite for basic cases
 */
export async function executeQuery(query: string, params: Record<string, any> = {}) {
    const db = await getDbConnection();
    
    if (isSqlite) {
        // Map @param to ?
        let sqliteQuery = query;
        const values: any[] = [];
        const paramNames = Object.keys(params).sort((a, b) => b.length - a.length); // Longest first to avoid partial match issues
        
        for (const name of paramNames) {
            sqliteQuery = sqliteQuery.replace(new RegExp(`@${name}`, 'g'), '?');
            values.push(params[name]);
        }
        
        const stmt = db.prepare(sqliteQuery);
        if (query.trim().toUpperCase().startsWith('SELECT')) {
            return { recordset: stmt.all(...values) };
        } else {
            const info = stmt.run(...values);
            return { recordset: [], rowsAffected: [info.changes] };
        }
    } else {
        const request = db.request();
        for (const [name, value] of Object.entries(params)) {
            request.input(name, value);
        }
        return await request.query(query);
    }
}
