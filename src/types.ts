export type InboxItem = {
  id: string;
  received_at: string;
  sender: { name: string; email: string };
  subject: string;
  status: "New" | "In Progress" | "Done" | (string & {});
  priority: "P1" | "P2" | "P3" | (string & {});
  body: string;
};
