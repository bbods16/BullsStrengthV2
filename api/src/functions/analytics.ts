import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../lib/db";
import { getAuthContext } from "../middleware/auth";

export async function analyticsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);
        const pool = await getDbConnection();

        const athleteId = request.query.get('athleteId');
        if (!athleteId) return { status: 400, body: "athleteId is required" };

        if (request.method === 'GET') {
            // Fetch the last 30 days of load summaries for charting
            const result = await pool.request()
                .input('athleteId', athleteId)
                .input('schoolId', schoolId)
                .query(`
                    SELECT date, dailyLoad, acuteLoad, chronicLoad, acwr
                    FROM LoadSummary
                    WHERE athleteId = @athleteId
                    AND schoolId = @schoolId
                    AND date > DATEADD(day, -30, SYSDATETIMEOFFSET())
                    ORDER BY date ASC
                `);
            
            return { jsonBody: result.recordset };
        }

        return { status: 405, body: "Method Not Allowed" };
    } catch (error: any) {
        context.error(`Error in analytics function: ${error.message}`);
        return { status: error.message.includes("Unauthorized") ? 401 : 500, body: error.message };
    }
}

app.http('analytics', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: analyticsHandler
});
