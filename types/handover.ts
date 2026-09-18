export type HandoverDigest = {
  summary: string;
  keyPoints: string[];
  flags: string[];
};

// Three states on purpose: "the vendor is down" is a value the UI has to
// render, not an exception a call site can forget to catch.
export type HandoverDigestResult =
  | { status: "ok"; date: string; digest: HandoverDigest; generatedAt: Date }
  | { status: "empty" }
  | { status: "unavailable" };
