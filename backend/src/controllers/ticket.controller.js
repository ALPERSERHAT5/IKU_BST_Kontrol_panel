import * as ticketService from '../services/ticket.service.js';

export async function create(req, res, next) {
  try {
    const ticket = await ticketService.createTicket({
      userId: req.user.id,
      ...req.body,
    });
    res.status(201).json({ ticket });
  } catch (e) { next(e); }
}

export async function myTickets(req, res, next) {
  try {
    const tickets = await ticketService.getMyTickets(req.user.id);
    res.json({ tickets });
  } catch (e) { next(e); }
}

export async function listAll(req, res, next) {
  try {
    const { status, search } = req.query;
    const tickets = await ticketService.getAllTickets({ status, search });
    res.json({ tickets });
  } catch (e) { next(e); }
}

export async function assign(req, res, next) {
  try {
    const ticket = await ticketService.assignTicket(req.params.id, req.user.id);
    res.json({ ticket });
  } catch (e) { next(e); }
}

export async function complete(req, res, next) {
  try {
    const { solution } = req.body;
    const ticket = await ticketService.completeTicket(req.params.id, req.user.id, solution);
    res.json({ ticket });
  } catch (e) { next(e); }
}

export async function cancel(req, res, next) {
  try {
    const ticket = await ticketService.cancelTicket(req.params.id);
    res.json({ ticket });
  } catch (e) { next(e); }
}

export async function stats(req, res, next) {
  try {
    const s = await ticketService.getTicketStats();
    res.json(s);
  } catch (e) { next(e); }
}

export async function myAssigned(req, res, next) {
  try {
    const tickets = await ticketService.getMyAssignedTickets(req.user.id);
    res.json({ tickets });
  } catch (e) { next(e); }
}

export async function archived(req, res, next) {
  try {
    const tickets = await ticketService.getArchivedTickets();
    res.json({ tickets });
  } catch (e) { next(e); }
}