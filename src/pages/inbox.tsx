import { useEffect } from "react";
import { useInboxStore } from "@store/useInboxStore";
import InboxList from "@components/inbox/InboxList";
import itemsFromJSON from "@mocks/mockInboxData.json";

function Inbox() {
  const items = useInboxStore((s) => s.items);
  const setItems = useInboxStore((s) => s.setItems);

  useEffect(() => {
    if (items.length === 0) {
      setItems(itemsFromJSON);
    }
  }, [items.length, setItems]);

  return <InboxList items={items} />;
}

export default Inbox;
