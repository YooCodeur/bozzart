// @bozzart/shared — validation barrel
//
// DRY convention: Zod schemas shared between web and mobile (form
// validation, API payload validation) live here. Derive TS types from
// schemas using `z.infer<typeof Schema>`. Import from
// "@bozzart/shared/validation".

import { z } from 'zod';

/**
 * Sample schema — replace / extend as real schemas are migrated in.
 */
export const EmailSchema = z.string().email();
export type Email = z.infer<typeof EmailSchema>;
