import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";

export default eveChannel({
  auth: [
    localDev(),
    vercelOidc(),
    // Public access for browser requests — the customer bot is open to all visitors.
    none(),
  ],
});
