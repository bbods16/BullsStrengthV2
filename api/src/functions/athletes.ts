import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../lib/db";
import { getAuthContext } from "../middleware/auth";
import { athleteSchema } from "@weightroom/shared-validation";

export async function athletesHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);
        const pool = await getDbConnection();

        if (request.method === 'GET') {
            const result = await pool.request()
                .input('schoolId', schoolId)
                .query('SELECT * FROM Athletes WHERE schoolId = @schoolId ORDER BY lastName, firstName');
            
            return { jsonBody: result.recordset };
        }

        if (request.method === 'POST') {
            const body = await request.json();
            const validated = athleteSchema.parse(body);
            
            await pool.request()
                .input('schoolId', schoolId)
                .input('firstName', validated.firstName)
                .input('lastName', validated.lastName)
                .input('sport', validated.sport)
                .input('team', validated.team)
                .query(`
                    INSERT INTO Athletes (schoolId, firstName, lastName, sport, team) 
                    VALUES (@schoolId, @firstName, @lastName, @sport, @team)
                `);
            
            return { status: 201, body: "Athlete created successfully" };
        }

        return { status: 405, body: "Method Not Allowed" };
    } catch (error: any) {
        context.error(`Error in athletes function: ${error.message}`);
        if (error.name === 'ZodError') {
            return { status: 400, jsonBody: { error: "Validation failed", details: error.errors } };
        }
        return { status: error.message.includes("Unauthorized") ? 401 : 500, body: error.message };
    }
}

app.http('athletes', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: athletesHandler
});
