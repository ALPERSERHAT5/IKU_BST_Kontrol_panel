import { PrismaClient } from '@prisma/client';
import { generateTicketNumber } from '../utils/ticketNumber.js';

const prisma = new PrismaClient();

const ARCHIVE_DAYS = 10;

export async function createTicket({ userId, roomId, roomCode, problemTypeId, customProblem, description }) {
  if (!problemTypeId && !customProblem) {
    const err = new Error('Lütfen bir sorun türü seçin.');
    err.status = 400;
    throw err;
  }

  let room = null;
  if (roomId) {
    room = await prisma.room.findUnique({ where: { id: roomId } });
  } else if (roomCode) {
    room = await prisma.room.findUnique({ where: { roomCode } });
  }

  if (!room) {
    const err = new Error('Sınıf bulunamadı. Lütfen geçerli bir sınıf seçin.');
    err.status = 400;
    throw err;
  }

  const ticketNumber = await generateTicketNumber();

  return prisma.ticket.create({
    data: {
      ticketNumber,
      userId,
      roomId: room.id,
      problemTypeId: problemTypeId || null,
      customProblem: customProblem || null,
      description: description || null,
      status: 'pending',
    },
    include: { room: true, problemType: true, user: true },
  });
}

export async function getMyTickets(userId) {
  return prisma.ticket.findMany({
    where: { userId },
    include: { room: true, problemType: true, assignedAdmin: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllTickets({ status, search }) {
  const where = {};

  // Arşivde silinmesi gerekenleri gösterme
  where.OR = [
    { archiveDeleteAt: null },
    { archiveDeleteAt: { gt: new Date() } },
  ];

  if (status && status !== 'all') {
    where.status = status;
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { ticketNumber: { contains: search } },
          { room: { roomCode: { contains: search } } },
          { problemType: { name: { contains: search } } },
          { customProblem: { contains: search } },
        ],
      },
    ];
  }

  return prisma.ticket.findMany({
    where,
    include: { room: true, problemType: true, user: true, assignedAdmin: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function assignTicket(ticketId, adminId) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    const err = new Error('Talep bulunamadı.');
    err.status = 404;
    throw err;
  }
  if (ticket.status !== 'pending') {
    const err = new Error('Bu talep zaten bir personel tarafından alınmış.');
    err.status = 409;
    throw err;
  }

  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'in_progress',
      assignedAdminId: adminId,
      assignedAt: new Date(),
    },
    include: { room: true, problemType: true, user: true, assignedAdmin: true },
  });
}

export async function completeTicket(ticketId, adminId, solution) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    const err = new Error('Talep bulunamadı.');
    err.status = 404;
    throw err;
  }
  if (ticket.status !== 'in_progress') {
    const err = new Error('Sadece işlemde olan talepler tamamlanabilir.');
    err.status = 409;
    throw err;
  }
  if (ticket.assignedAdminId !== adminId) {
    const err = new Error('Bu görevi yalnızca üzerine alan personel tamamlayabilir.');
    err.status = 403;
    throw err;
  }

  const now = new Date();
  const archiveDeleteAt = new Date(now.getTime() + ARCHIVE_DAYS * 24 * 60 * 60 * 1000);

  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'completed',
      completedAt: now,
      solution: solution || null,
      archiveDeleteAt,
    },
    include: { room: true, problemType: true, user: true, assignedAdmin: true },
  });
}

export async function cancelTicket(ticketId) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'cancelled' },
  });
}

export async function getTicketStats() {
  const [pending, inProgress, completedToday, totalActive] = await Promise.all([
    prisma.ticket.count({ where: { status: 'pending' } }),
    prisma.ticket.count({ where: { status: 'in_progress' } }),
    prisma.ticket.count({
      where: {
        status: 'completed',
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.ticket.count({
      where: {
        status: { in: ['pending', 'in_progress'] },
      },
    }),
  ]);

  return { pending, inProgress, completedToday, totalActive };
}

export async function getMyAssignedTickets(adminId) {
  return prisma.ticket.findMany({
    where: { assignedAdminId: adminId, status: 'in_progress' },
    include: { room: true, problemType: true, user: true },
    orderBy: { assignedAt: 'desc' },
  });
}

export async function getArchivedTickets() {
  return prisma.ticket.findMany({
    where: { status: 'completed', archiveDeleteAt: { gt: new Date() } },
    include: { room: true, problemType: true, user: true, assignedAdmin: true },
    orderBy: { completedAt: 'desc' },
  });
}