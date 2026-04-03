import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { executeQuery } from "../lib/db";
import { getAuthContext } from "../middleware/auth";
import { wellnessSchema } from "@weightroom/shared-validation";
import { v4 as uuidv4 } from 'uuid';

export async function wellnessHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);

        if (request.method === 'GET') {
            const athleteId = request.query.get('athleteId');
            let query = 'SELECT * FROM WellnessEntries WHERE schoolId = @schoolId';
            const params: any = { schoolId };
            
            if (athleteId) {
                query += ' AND athleteId = @athleteId';
                params.athleteId = athleteId;
            }
            
            query += ' ORDER BY date DESC';
            const result = await executeQuery(query, params);
            return { jsonBody: result.recordset };
        }

        if (request.method === 'POST') {
            const body = await request.json();
            const validated = wellnessSchema.parse(body);
            const id = uuidv4();
            
            await executeQuery(`
                INSERT INTO WellnessEntries (
                    id, schoolId, athleteId, sleepHours, sleepQuality, 
                    soreness, fatigue, stress, illness, pain
                ) 
                VALUES (
                    @id, @schoolId, @athleteId, @sleepHours, @sleepQuality, 
                    @soreness, @fatigue, @stress, @illness, @pain
                )
            `, {
                id,
                schoolId,
                athleteId: validated.athleteId,
                sleepHours: validated.sleepHours,
                sleepQuality: validated.sleepQuality,
                soreness: validated.soreness,
                fatigue: validated.fatigue,
                stress: validated.stress,
                illness: validated.illness ? 1 : 0,
                pain: validated.pain ? 1 : 0
            });
            
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
