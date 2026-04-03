import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../lib/db";
import { getAuthContext } from "../middleware/auth";
import { wellnessSchema } from "@weightroom/shared-validation";

export async function wellnessHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);
        const pool = await getDbConnection();

        if (request.method === 'GET') {
            const athleteId = request.query.get('athleteId');
            let query = 'SELECT * FROM WellnessEntries WHERE schoolId = @schoolId';
            
            const req = pool.request().input('schoolId', schoolId);
            
            if (athleteId) {
                query += ' AND athleteId = @athleteId';
                req.input('athleteId', athleteId);
            }
            
            query += ' ORDER BY date DESC';
            const result = await req.query(query);
            return { jsonBody: result.recordset };
        }

        if (request.method === 'POST') {
            const body = await request.json();
            const validated = wellnessSchema.parse(body);
            
            await pool.request()
                .input('schoolId', schoolId)
                .input('athleteId', validated.athleteId)
                .input('sleepHours', validated.sleepHours)
                .input('sleepQuality', validated.sleepQuality)
                .input('soreness', validated.soreness)
                .input('fatigue', validated.fatigue)
                .input('stress', validated.stress)
                .input('illness', validated.illness)
                .input('pain', validated.pain)
                .query(`
                    INSERT INTO WellnessEntries (
                        schoolId, athleteId, sleepHours, sleepQuality, 
                        soreness, fatigue, stress, illness, pain
                    ) 
                    VALUES (
                        @schoolId, @athleteId, @sleepHours, @sleepQuality, 
                        @soreness, @fatigue, @stress, @illness, @pain
                    )
                `);
            
            return { status: 201, body: "Wellness entry recorded" };
        }

        return { status: 405, body: "Method Not Allowed" };
    } catch (error: any) {
        context.error(`Error in wellness function: ${error.message}`);
        if (error.name === 'ZodError') {
            return { status: 400, jsonBody: { error: "Validation failed", details: error.errors } };
        }
        return { status: error.message.includes("Unauthorized") ? 401 : 500, body: error.message };
    }
}

app.http('wellness', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wellnessHandler
});
