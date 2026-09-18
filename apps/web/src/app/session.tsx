import {
  configureApi,
  endpoints,
  type ApiRole,
  type SessionResponse,
} from "@/lib/api";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const key = "internhub.session";
type Stored = Pick<SessionResponse, "accessToken" | "activeRole" | "user">;
type Session = Stored & { ready: boolean };
type SessionContextValue = Session & {
  signIn: (email: string, password: string, role?: ApiRole) => Promise<void>;
  signOut: () => Promise<void>;
  changeRole: (role: ApiRole) => Promise<void>;
};
const SessionContext = createContext<SessionContextValue | null>(null);

function read(): Stored | null {
  try {
    const value = sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as Stored) : null;
  } catch {
    return null;
  }
}
function write(value: Stored | null) {
  if (value) sessionStorage.setItem(key, JSON.stringify(value));
  else sessionStorage.removeItem(key);
}

export function SessionProvider({
  children,
  client,
}: {
  children: ReactNode;
  client: QueryClient;
}) {
  const [session, setSession] = useState<Session>(() => ({
    ...(read() ?? {
      accessToken: "",
      activeRole: "STUDENT" as ApiRole,
      user: { id: "", email: "", fullName: "", roles: [] },
    }),
    ready: false,
  }));
  const clear = () => {
    write(null);
    client.clear();
    setSession({
      accessToken: "",
      activeRole: "STUDENT",
      user: { id: "", email: "", fullName: "", roles: [] },
      ready: true,
    });
  };
  useEffect(() => {
    configureApi({
      getToken: () => session.accessToken,
      onUnauthorized: clear,
    });
    if (!session.accessToken) {
      setSession((value) => ({ ...value, ready: true }));
      return;
    }
    endpoints
      .me()
      .then((me) =>
        setSession((value) => ({
          ...value,
          activeRole: me.activeRole,
          user: { ...value.user, id: me.id, roles: me.roles },
          ready: true,
        })),
      )
      .catch(clear);
  }, [session.accessToken]);
  const value = useMemo<SessionContextValue>(
    () => ({
      ...session,
      signIn: async (email, password, role) => {
        const next = await endpoints.signIn(email, password, role);
        const stored: Stored = {
          accessToken: next.accessToken,
          activeRole: next.activeRole,
          user: next.user,
        };
        write(stored);
        client.clear();
        setSession({ ...stored, ready: true });
      },
      signOut: async () => {
        try {
          await endpoints.signOut();
        } finally {
          clear();
        }
      },
      changeRole: async (role) => {
        const next = await endpoints.setActiveRole(role);
        const stored: Stored = {
          accessToken: next.accessToken,
          activeRole: next.activeRole,
          user: session.user,
        };
        write(stored);
        client.clear();
        setSession({ ...stored, ready: true });
      },
    }),
    [session, client],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("SessionProvider is required");
  return value;
}
export function useApiQueryClient() {
  return useQueryClient();
}
