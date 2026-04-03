import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../lib/db";
import { getAuthContext } from "../middleware/auth";
import { sessionLogSchema } from "@weightroom/shared-validation";
import { calculateACWR } from "../lib/analytics";
import * as sql from 'mssql';

export async function sessionsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);
        const pool = await getDbConnection();

        if (request.method === 'POST') {
            const body = await request.json();
            const validated = sessionLogSchema.parse(body);
            
            // Session Load calculation: RPE * Duration
            const sessionLoad = validated.sessionRPE * validated.durationMin;

            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // 1. Insert Session
                const sessionResult = await transaction.request()
                    .input('schoolId', schoolId)
                    .input('athleteId', validated.athleteId)
                    .input('date', validated.date)
                    .input('durationMin', validated.durationMin)
                    .input('sessionType', validated.sessionType)
                    .input('sessionRPE', validated.sessionRPE)
                    .input('sessionLoad', sessionLoad)
                    .input('notes', validated.notes)
                    .query(`
                        INSERT INTO Sessions (schoolId, athleteId, date, durationMin, sessionType, sessionRPE, sessionLoad, notes)
                        OUTPUT INSERTED.id
                        VALUES (@schoolId, @athleteId, @date, @durationMin, @sessionType, @sessionRPE, @sessionLoad, @notes)
                    `);

                const sessionId = sessionResult.recordset[0].id;

                // 2. Insert Exercise Logs
                if (validated.exercises && validated.exercises.length > 0) {
                    for (const ex of validated.exercises) {
                        await transaction.request()
                            .input('sessionId', sessionId)
                            .input('exerciseName', ex.exerciseName)
                            .input('sets', ex.sets)
                            .input('reps', ex.reps)
                            .input('weight', ex.weight)
                            .input('rpe', ex.rpe)
                            .query(`
                                INSERT INTO ExerciseLog (sessionId, exerciseName, sets, reps, weight, rpe)
                                VALUES (@sessionId, @exerciseName, @sets, @reps, @weight, @rpe)
                            `);
                    }
                }

                await transaction.commit();

                // 3. Trigger Analytics (ACWR) - can be async but for MVP we run it here
                await calculateACWR(validated.athleteId, schoolId, validated.date);

                return { status: 201, jsonBody: { sessionId, message: "Session logged and analytics updated" } };
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        }

        if (request.method === 'GET') {
            const athleteId = request.query.get('athleteId');
            if (!athleteId) return { status: 400, body: "athleteId is required" };

            const result = await pool.request()
                .input('athleteId', athleteId)
                .input('schoolId', schoolId)
                .query('SELECT * FROM Sessions WHERE athleteId = @athleteId AND schoolId = @schoolId ORDER BY date DESC');
            
            return { jsonBody: result.recordset };
        }

        return { status: 405, body: "Method Not Allowed" };
    } catch (error: any) {
        context.error(`Error in sessions function: ${error.message}`);
        if (error.name === 'ZodError') {
            return { status: 400, jsonBody: { error: "Validation failed", details: error.errors } };
        }
        return { status: error.message.includes("Unauthorized") ? 401 : 500, body: error.message };
    }
}

app.http('sessions', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: sessionsHandler
});
