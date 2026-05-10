import InboxList from "@components/inbox/InboxList";
import items from "../mockData.json";

function Inbox() {
  return <InboxList items={items} />;
}

export default Inbox;
