import * as sql from 'mssql';
import { executeQuery, getDbConnection } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function calculateACWR(athleteId: string, schoolId: string, date: string) {
    const isSqlite = process.env.DB_TYPE === 'sqlite';
    const dateLimit = new Date(new Date(date).getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = '';
    if (isSqlite) {
        query = `
            SELECT date, sessionLoad 
            FROM Sessions 
            WHERE athleteId = @athleteId 
            AND schoolId = @schoolId
            AND date <= @targetDate
            AND date > @dateLimit
            ORDER BY date DESC
        `;
    } else {
        query = `
            SELECT date, sessionLoad 
            FROM Sessions 
            WHERE athleteId = @athleteId 
            AND schoolId = @schoolId
            AND date <= @targetDate
            AND date > DATEADD(day, -28, @targetDate)
            ORDER BY date DESC
        `;
    }

    const result = await executeQuery(query, { athleteId, schoolId, targetDate: date, dateLimit });
    const sessions = result.recordset;
    
    // 2. Calculate Acute Load (last 7 days)
    const acuteLimit = new Date(new Date(date).getTime() - 7 * 24 * 60 * 60 * 1000);
    const acuteLoad = sessions
        .filter(s => new Date(s.date) > acuteLimit)
        .reduce((sum, s) => sum + (s.sessionLoad || 0), 0);

    // 3. Calculate Chronic Load (average of 4 weeks)
    const total28DayLoad = sessions.reduce((sum, s) => sum + (s.sessionLoad || 0), 0);
    const chronicLoad = total28DayLoad / 4;

    // 4. Calculate ACWR
    const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;

    // 5. Calculate Daily Load
    const targetDateOnly = new Date(date).toISOString().split('T')[0];
    const dailyLoad = sessions
        .filter(s => new Date(s.date).toISOString().split('T')[0] === targetDateOnly)
        .reduce((sum, s) => sum + (s.sessionLoad || 0), 0);

    // 6. Save Load Summary
    if (isSqlite) {
        const db = await getDbConnection();
        const existing = db.prepare('SELECT id FROM LoadSummary WHERE athleteId = ? AND date = ?').get(athleteId, targetDateOnly);
        
        if (existing) {
            db.prepare(`
                UPDATE LoadSummary SET 
                    dailyLoad = ?, acuteLoad = ?, chronicLoad = ?, acwr = ?
                WHERE id = ?
            `).run(dailyLoad, acuteLoad, chronicLoad, acwr, existing.id);
        } else {
            db.prepare(`
                INSERT INTO LoadSummary (id, athleteId, schoolId, date, dailyLoad, acuteLoad, chronicLoad, acwr)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(uuidv4(), athleteId, schoolId, targetDateOnly, dailyLoad, acuteLoad, chronicLoad, acwr);
        }
    } else {
        await executeQuery(`
            IF EXISTS (SELECT 1 FROM LoadSummary WHERE athleteId = @athleteId AND date = @date)
                UPDATE LoadSummary SET 
                    dailyLoad = @dailyLoad, acuteLoad = @acuteLoad, chronicLoad = @chronicLoad, acwr = @acwr
                WHERE athleteId = @athleteId AND date = @date
            ELSE
                INSERT INTO LoadSummary (id, athleteId, schoolId, date, dailyLoad, acuteLoad, chronicLoad, acwr)
                VALUES (@id, @athleteId, @schoolId, @date, @dailyLoad, @acuteLoad, @chronicLoad, @acwr)
        `, {
            id: uuidv4(),
            athleteId,
            schoolId,
            date: targetDateOnly,
            dailyLoad,
            acuteLoad,
            chronicLoad,
            acwr
        });
    }

    // 7. Trigger Alerts
    if (acwr > 1.5) {
        await createAlert(athleteId, schoolId, 'ACWR_SPIKE', 'DANGER', `Critical load spike detected: ACWR ${acwr.toFixed(2)}`);
    } else if (acwr > 1.3) {
        await createAlert(athleteId, schoolId, 'ACWR_SPIKE', 'CAUTION', `Elevated load detected: ACWR ${acwr.toFixed(2)}`);
    }

    return { acuteLoad, chronicLoad, acwr };
}

async function createAlert(athleteId: string, schoolId: string, type: string, severity: string, message: string) {
    await executeQuery(`
        INSERT INTO Alerts (id, athleteId, schoolId, alertType, severity, message)
        VALUES (@id, @athleteId, @schoolId, @type, @severity, @message)
    `, {
        id: uuidv4(),
        athleteId,
        schoolId,
        type,
        severity,
        message
    });
}
