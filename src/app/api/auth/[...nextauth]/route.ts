// WHY: Auth.js needs this URL (/api/auth/...) to handle login and logout.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
