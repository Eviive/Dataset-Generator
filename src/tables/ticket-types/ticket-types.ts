import { GeneratorFunction } from "../../types/types.js";
import { generateStatements } from "../../utils/statementUtils.js";

import ticketTypes from "./ticket-types.json" assert { type: "json" }

export const generateTicketTypes: GeneratorFunction = async fd => {
	
	await generateStatements(fd, "Ticket Types", ticketTypes, async t => `
		INSERT INTO tickettypes (ticket_type_name) VALUES ('${t}');
	`);
};