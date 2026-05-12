import { useEffect } from "react";
import { useInboxStore } from "@store/useInboxStore";
import InboxList from "@components/inbox/InboxList";

function Inbox() {
  const items = useInboxStore((s) => s.items);

  useEffect(() => {
    void useInboxStore.getState().loadInboxItems();
  }, []);

  return <InboxList items={items} />;
}

export default Inbox;
