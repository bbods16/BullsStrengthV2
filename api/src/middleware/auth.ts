import { HttpRequest } from "@azure/functions";

export interface UserContext {
    id: string;
    schoolId: string;
    email: string;
    role: string;
}

export function getAuthContext(request: HttpRequest): UserContext {
    const principalHeader = request.headers.get('x-ms-client-principal');
    
    if (!principalHeader) {
        // Fallback for local development if headers are provided manually
        const email = request.headers.get('x-user-email') || 'brysonbo@buffalo.edu';
        const schoolId = email.split('@')[0];
        return {
            id: request.headers.get('x-user-id') || 'dev-id',
            schoolId,
            email,
            role: request.headers.get('x-user-role') || 'Coach'
        };
    }

    try {
        const principal = JSON.parse(Buffer.from(principalHeader, 'base64').toString('utf-8'));
        const email = principal.userDetails;
        const schoolId = email.split('@')[0];

        return {
            id: principal.userId,
            schoolId,
            email,
            role: principal.userRoles.includes('admin') ? 'Admin' : 'Coach'
        };
    } catch (err) {
        throw new Error("Invalid authentication principal");
    }
}
