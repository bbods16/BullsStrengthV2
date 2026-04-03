import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { executeQuery } from "../lib/db";
import { getAuthContext } from "../middleware/auth";

export async function analyticsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);
        const isSqlite = process.env.DB_TYPE === 'sqlite';

        const athleteId = request.query.get('athleteId');
        if (!athleteId) return { status: 400, body: "athleteId is required" };

        if (request.method === 'GET') {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - 30);
            const dateStr = dateLimit.toISOString().split('T')[0];

            let query = '';
            if (isSqlite) {
                query = `
                    SELECT date, dailyLoad, acuteLoad, chronicLoad, acwr
                    FROM LoadSummary
                    WHERE athleteId = @athleteId
                    AND schoolId = @schoolId
                    AND date >= @dateLimit
                    ORDER BY date ASC
                `;
            } else {
                query = `
                    SELECT date, dailyLoad, acuteLoad, chronicLoad, acwr
                    FROM LoadSummary
                    WHERE athleteId = @athleteId
                    AND schoolId = @schoolId
                    AND date > DATEADD(day, -30, SYSDATETIMEOFFSET())
                    ORDER BY date ASC
                `;
            }

            const result = await executeQuery(query, { athleteId, schoolId, dateLimit: dateStr });
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
