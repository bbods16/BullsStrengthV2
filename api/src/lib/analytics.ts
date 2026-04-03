import * as sql from 'mssql';
import { getDbConnection } from './db';

export async function calculateACWR(athleteId: string, schoolId: string, date: string) {
    const pool = await getDbConnection();
    
    // 1. Fetch sessions for the last 28 days
    const result = await pool.request()
        .input('athleteId', athleteId)
        .input('schoolId', schoolId)
        .input('targetDate', date)
        .query(`
            SELECT date, sessionLoad 
            FROM Sessions 
            WHERE athleteId = @athleteId 
            AND schoolId = @schoolId
            AND date <= @targetDate
            AND date > DATEADD(day, -28, @targetDate)
            ORDER BY date DESC
        `);

    const sessions = result.recordset;
    
    // 2. Calculate Acute Load (last 7 days)
    const acuteLoad = sessions
        .filter(s => new Date(s.date) > new Date(new Date(date).getTime() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum, s) => sum + (s.sessionLoad || 0), 0);

    // 3. Calculate Chronic Load (average of 4 weeks)
    // Simple rolling average model
    const total28DayLoad = sessions.reduce((sum, s) => sum + (s.sessionLoad || 0), 0);
    const chronicLoad = total28DayLoad / 4; // Average weekly load over 28 days

    // 4. Calculate ACWR
    const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;

    // 5. Calculate Daily Load for the target date
    const dailyLoad = sessions
        .filter(s => new Date(s.date).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0])
        .reduce((sum, s) => sum + (s.sessionLoad || 0), 0);

    // 6. Save Load Summary
    await pool.request()
        .input('athleteId', athleteId)
        .input('schoolId', schoolId)
        .input('date', date)
        .input('dailyLoad', dailyLoad)
        .input('acuteLoad', acuteLoad)
        .input('chronicLoad', chronicLoad)
        .input('acwr', acwr)
        .query(`
            IF EXISTS (SELECT 1 FROM LoadSummary WHERE athleteId = @athleteId AND date = @date)
                UPDATE LoadSummary SET 
                    dailyLoad = @dailyLoad, 
                    acuteLoad = @acuteLoad, 
                    chronicLoad = @chronicLoad, 
                    acwr = @acwr
                WHERE athleteId = @athleteId AND date = @date
            ELSE
                INSERT INTO LoadSummary (athleteId, schoolId, date, dailyLoad, acuteLoad, chronicLoad, acwr)
                VALUES (@athleteId, @schoolId, @date, @dailyLoad, @acuteLoad, @chronicLoad, @acwr)
        `);

    // 7. Trigger Alerts
    if (acwr > 1.5) {
        await createAlert(athleteId, schoolId, 'ACWR_SPIKE', 'DANGER', `Critical load spike detected: ACWR ${acwr.toFixed(2)}`);
    } else if (acwr > 1.3) {
        await createAlert(athleteId, schoolId, 'ACWR_SPIKE', 'CAUTION', `Elevated load detected: ACWR ${acwr.toFixed(2)}`);
    }

    return { acuteLoad, chronicLoad, acwr };
}

async function createAlert(athleteId: string, schoolId: string, type: string, severity: string, message: string) {
    const pool = await getDbConnection();
    await pool.request()
        .input('athleteId', athleteId)
        .input('schoolId', schoolId)
        .input('type', type)
        .input('severity', severity)
        .input('message', message)
        .query(`
            INSERT INTO Alerts (athleteId, schoolId, alertType, severity, message)
            VALUES (@athleteId, @schoolId, @type, @severity, @message)
        `);
}
