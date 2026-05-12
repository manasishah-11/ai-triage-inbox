import { useEffect } from "react";
import { useInboxStore } from "@store/useInboxStore";
import InboxTabs from "@components/inbox/InboxTabs";

function Inbox() {
  const items = useInboxStore((s) => s.items);

  useEffect(() => {
    void useInboxStore.getState().loadInboxItems();
  }, []);

  return <InboxTabs items={items} />;
}

export default Inbox;
