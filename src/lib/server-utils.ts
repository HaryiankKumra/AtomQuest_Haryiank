// Server-side progress score computation (same logic as Python backend)
export function computeProgressScore(
  uomType: string,
  target: number,
  achievement: number | null | undefined
): number | null {
  if (achievement === null || achievement === undefined) return null;

  let score: number;
  switch (uomType) {
    case 'min':
      score = target === 0 ? 100 : (achievement / target) * 100;
      break;
    case 'max':
      score = achievement === 0 ? 100 : (target / achievement) * 100;
      break;
    case 'zero_based':
      score = achievement === 0 ? 100 : 0;
      break;
    case 'timeline':
      score = target === 0 ? 100 : Math.max(0, ((target - achievement) / target) * 100);
      break;
    default:
      score = 0;
  }
  return Math.round(Math.min(score, 150) * 100) / 100;
}

export function logAudit(
  db: any,
  userId: string | null,
  entityType: string,
  entityId: string,
  action: string,
  oldValues: any,
  newValues: any
) {
  return db
    .from('audit_logs')
    .insert({ user_id: userId, entity_type: entityType, entity_id: entityId, action, old_values: oldValues, new_values: newValues });
}

export async function createNotification(
  db: any,
  userId: string,
  title: string,
  body: string
) {
  return db.from('notifications').insert({ user_id: userId, title, body });
}
