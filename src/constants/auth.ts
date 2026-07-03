export const ADMIN_EMAILS = [
  'fetanetdarioglu@gmail.com',
  'resenlegal@gmail.com'
];

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
