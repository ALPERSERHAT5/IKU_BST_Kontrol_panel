import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function generateTicketNumber() {
  const year = new Date().getFullYear();
  const prefix = `BST-${year}-`;

  const last = await prisma.ticket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: 'desc' },
  });

  let next = 1;
  if (last) {
    const num = parseInt(last.ticketNumber.replace(prefix, ''), 10);
    next = num + 1;
  }
  return `${prefix}${String(next).padStart(5, '0')}`;
}