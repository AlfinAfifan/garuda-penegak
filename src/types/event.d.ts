interface SessionUpdateEventDetail {
  accessToken: string;
}

interface WindowEventMap {
  "session-update": CustomEvent<SessionUpdateEventDetail>;
}
