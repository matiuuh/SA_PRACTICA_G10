import { TicketHistoryItem } from './ticket-history.interface';

export interface TicketDocument {
  filename: string;
  contentType: string;
  content: Buffer;
}

export interface TicketDocumentGenerator {
  generate(ticket: TicketHistoryItem): Promise<TicketDocument>;
}

export const TICKET_DOCUMENT_GENERATOR = Symbol(
  'TICKET_DOCUMENT_GENERATOR',
);
