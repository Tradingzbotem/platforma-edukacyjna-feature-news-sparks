import 'server-only';
import { sql } from '@vercel/postgres';

/**
 * Check if a user has a specific feature flag enabled
 * @param userId - User ID to check
 * @param feature - Feature name (e.g., 'decision_lab')
 * @returns true if feature is enabled, false otherwise
 */
export async function hasFeature(userId: string, feature: string): Promise<boolean> {
  if (!userId || !feature) return false;

  try {
    // Ensure table exists (idempotent)
    await sql`
      CREATE TABLE IF NOT EXISTS user_feature_flags (
        user_id TEXT NOT NULL,
        feature TEXT NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, feature)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_feature_flags_user_id ON user_feature_flags (user_id)`;

    // Query for the feature flag
    const { rows } = await sql<{ enabled: boolean }>`
      SELECT enabled
      FROM user_feature_flags
      WHERE user_id = ${userId} AND feature = ${feature}
      LIMIT 1
    `;

    // If no row found, feature is disabled by default
    if (!rows || rows.length === 0) return false;

    return rows[0].enabled === true;
  } catch (error) {
    console.error('Error checking feature flag:', error);
    // Fail closed - if there's an error, assume feature is disabled
    return false;
  }
}
