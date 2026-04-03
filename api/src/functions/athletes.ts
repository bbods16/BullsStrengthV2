import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { executeQuery } from "../lib/db";
import { getAuthContext } from "../middleware/auth";
import { athleteSchema } from "@weightroom/shared-validation";
import { v4 as uuidv4 } from 'uuid';

export async function athletesHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const { schoolId } = getAuthContext(request);

        if (request.method === 'GET') {
            const result = await executeQuery(
                'SELECT * FROM Athletes WHERE schoolId = @schoolId ORDER BY lastName, firstName',
                { schoolId }
            );
            return { jsonBody: result.recordset };
        }

        if (request.method === 'POST') {
            const body = await request.json();
            const validated = athleteSchema.parse(body);
            const id = uuidv4();
            
            await executeQuery(
                `INSERT INTO Athletes (id, schoolId, firstName, lastName, sport, team) 
                 VALUES (@id, @schoolId, @firstName, @lastName, @sport, @team)`,
                { 
                    id, 
                    schoolId, 
                    firstName: validated.firstName, 
                    lastName: validated.lastName, 
                    sport: validated.sport, 
                    team: validated.team 
                }
            );
            
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
