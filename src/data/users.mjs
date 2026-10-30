// Demo accounts. Passwords are hashed when the server starts.
export const SEED_USERS = [
  { id: 'u-1001', email: 'murka@plosia.dev', name: 'Maria Murlykina', password: 'meow1234' },
  { id: 'u-1002', email: 'barsik@plosia.dev', name: 'Boris Barsikov', password: 'meow1234' },
  { id: 'u-1003', email: 'sonya@plosia.dev', name: 'Sofia Pushistaya', password: 'meow1234' },
  { id: 'u-1004', email: 'qa@plosia.dev', name: 'Test Customer', password: 'qa123456' },
  { id: 'u-1005', email: 'locked@plosia.dev', name: 'Locked Cat', password: 'meow1234', lockedUntil: '2099-01-01T00:00:00Z' },
];
