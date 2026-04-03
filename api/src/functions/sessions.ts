import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection, executeQuery } from "../lib/db";
import { getAuthContext } from "../middleware/auth";
import { sessionLogSchema } from "@weightroom/shared-validation";
import { calculateACWR } from "../lib/analytics";
import * as sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

export async function sessionsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);
        const isSqlite = process.env.DB_TYPE === 'sqlite';

        if (request.method === 'POST') {
            const body = await request.json();
            const validated = sessionLogSchema.parse(body);
            const sessionLoad = (validated.sessionRPE || 0) * (validated.durationMin || 0);
            const sessionId = uuidv4();

            if (isSqlite) {
                const db = await getDbConnection();
                const transaction = db.transaction(() => {
                    db.prepare(`
                        INSERT INTO Sessions (id, schoolId, athleteId, date, durationMin, sessionType, sessionRPE, sessionLoad, notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).run(sessionId, schoolId, validated.athleteId, validated.date, validated.durationMin, validated.sessionType, validated.sessionRPE, sessionLoad, validated.notes);

                    if (validated.exercises && validated.exercises.length > 0) {
                        const insertEx = db.prepare(`
                            INSERT INTO ExerciseLog (id, sessionId, exerciseName, sets, reps, weight, rpe)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `);
                        for (const ex of validated.exercises) {
                            insertEx.run(uuidv4(), sessionId, ex.exerciseName, ex.sets, ex.reps, ex.weight, ex.rpe);
                        }
                    }
                });
                transaction();
            } else {
                const pool = await getDbConnection();
                const transaction = new sql.Transaction(pool);
                await transaction.begin();
                try {
                    await transaction.request()
                        .input('id', sessionId)
                        .input('schoolId', schoolId)
                        .input('athleteId', validated.athleteId)
                        .input('date', validated.date)
                        .input('durationMin', validated.durationMin)
                        .input('sessionType', validated.sessionType)
                        .input('sessionRPE', validated.sessionRPE)
                        .input('sessionLoad', sessionLoad)
                        .input('notes', validated.notes)
                        .query(`INSERT INTO Sessions (id, schoolId, athleteId, date, durationMin, sessionType, sessionRPE, sessionLoad, notes) VALUES (@id, @schoolId, @athleteId, @date, @durationMin, @sessionType, @sessionRPE, @sessionLoad, @notes)`);

                    if (validated.exercises && validated.exercises.length > 0) {
                        for (const ex of validated.exercises) {
                            await transaction.request()
                                .input('id', uuidv4())
                                .input('sessionId', sessionId)
                                .input('exerciseName', ex.exerciseName)
                                .input('sets', ex.sets)
                                .input('reps', ex.reps)
                                .input('weight', ex.weight)
                                .input('rpe', ex.rpe)
                                .query(`INSERT INTO ExerciseLog (id, sessionId, exerciseName, sets, reps, weight, rpe) VALUES (@id, @sessionId, @exerciseName, @sets, @reps, @weight, @rpe)`);
                        }
                    }
                    await transaction.commit();
                } catch (err) {
                    await transaction.rollback();
                    throw err;
                }
            }

            await calculateACWR(validated.athleteId, schoolId, validated.date);
            return { status: 201, jsonBody: { sessionId, message: "Session logged" } };
        }

        if (request.method === 'GET') {
            const athleteId = request.query.get('athleteId');
            if (!athleteId) return { status: 400, body: "athleteId is required" };

            const result = await executeQuery(
                'SELECT * FROM Sessions WHERE athleteId = @athleteId AND schoolId = @schoolId ORDER BY date DESC',
                { athleteId, schoolId }
            );
            return { jsonBody: result.recordset };
        }

        return { status: 405, body: "Method Not Allowed" };
    } catch (error: any) {
        context.error(`Error in sessions function: ${error.message}`);
        return { status: 500, body: error.message };
    }
}

app.http('sessions', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: sessionsHandler
});
