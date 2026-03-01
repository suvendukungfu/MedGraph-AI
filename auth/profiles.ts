export type UserRole = 'admin' | 'doctor' | 'patient' | 'caretaker';

export interface UserProfileMapping {
    email: string;
    role: UserRole;
    name: string;
    tenantId: string;
}

/**
 * Predefined user profiles that determine roles upon identity verification.
 */
export const existingProfiles: UserProfileMapping[] = [
    {
        email: "puna.vashu@adypu.edu.in",
        role: "admin",
        name: "Punarvashu",
        tenantId: "global-admin"
    },
    {
        email: "dr.chen@clinic.com",
        role: "doctor",
        name: "Dr. Avery Chen",
        tenantId: "clinic-alpha"
    },
    {
        email: "raj.patel@example.com",
        role: "patient",
        name: "Raj Patel",
        tenantId: "clinic-alpha"
    },
    {
        email: "caretaker@example.com",
        role: "caretaker",
        name: "Caretaker User",
        tenantId: "clinic-alpha"
    }
];

/**
 * Find a profile by email.
 */
export function getProfileByEmail(email: string): UserProfileMapping | null {
    return existingProfiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
}
