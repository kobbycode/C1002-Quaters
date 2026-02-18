import { SiteConfig } from '../types';

/**
 * Centralized logic to determine if a user has administrative privileges.
 * 
 * Logic:
 * 1. Check if email ends with the priority domain @c1002quarters.com
 * 2. Check if email is explicitly listed in the site configuration's admin list
 */
export const isUserAdmin = (email: string | null | undefined, config?: SiteConfig): boolean => {
    if (!email) return false;

    const emailLower = email.trim().toLowerCase();

    // Domain-based check (Priority)
    // Support both .com and .com.gh domains used in the project
    if (emailLower.endsWith('@c1002quarters.com') || emailLower.endsWith('@c1002quarters.com.gh')) {
        return true;
    }

    // Config-based check (Flexible)
    if (config?.adminEmails && config.adminEmails.length > 0) {
        const isListed = config.adminEmails.some(adminEmail => adminEmail.trim().toLowerCase() === emailLower);
        if (isListed) return true;
    }

    // Legacy/Fallback check
    if (emailLower === 'admin@quarters.com') {
        return true;
    }

    return false;
};
