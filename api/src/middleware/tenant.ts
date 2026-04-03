import { HttpRequest } from "@azure/functions";

export function getTenantContext(request: HttpRequest) {
    // In production, this extracts from JWT claims (Microsoft Entra ID)
    // For now, we'll use a header for development
    const schoolId = request.headers.get('x-school-id');
    if (!schoolId) throw new Error("Unauthorized: No school context");
    return { schoolId };
}
