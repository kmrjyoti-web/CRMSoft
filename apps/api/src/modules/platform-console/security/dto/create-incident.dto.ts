export class CreateIncidentDto {
  title: string;
  severity: string; // P1 | P2 | P3 | P4
  description: string;
  affectedService: string;
}
