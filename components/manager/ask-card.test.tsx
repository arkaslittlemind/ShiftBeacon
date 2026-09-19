import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AskCard } from "./ask-card";
import { ASK_LIMIT_PER_HOUR, QUESTION_MAX_LENGTH } from "@/types/ask";

const STARTERS = [
  "Who worked the most hours in the last 7 days, and how many?",
  "What did staff write in their shift notes on 2026-09-18?",
];

function jsonResponse(body: unknown, status: number, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), { status, headers });
}

function stubFetch(response: Response | Promise<Response>) {
  const fetchMock = vi.fn().mockReturnValue(Promise.resolve(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestedQuestion(fetchMock: ReturnType<typeof vi.fn>): string {
  const init = fetchMock.mock.calls[0][1] as RequestInit;
  return JSON.parse(init.body as string).question;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AskCard", () => {
  it("renders every starter and the limit note when idle", () => {
    render(<AskCard starterQuestions={STARTERS} />);

    for (const question of STARTERS) {
      expect(screen.getByRole("button", { name: question })).toBeEnabled();
    }
    expect(
      screen.getByText(
        new RegExp(`cover the last 7 days.*${ASK_LIMIT_PER_HOUR} questions an hour`, "i")
      )
    ).toBeInTheDocument();
  });

  it("sends the exact starter question when a chip is clicked", async () => {
    const fetchMock = stubFetch(
      jsonResponse({ data: { answer: "Staff 1.", answeredAt: "2026-09-19T10:30:00.000Z" } }, 200)
    );

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[1] }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/manager/ask");
    expect(requestedQuestion(fetchMock)).toBe(STARTERS[1]);
    await waitFor(() => expect(screen.getByText("Staff 1.")).toBeInTheDocument());
  });

  it("submits the typed question", async () => {
    const fetchMock = stubFetch(
      jsonResponse({ data: { answer: "Ok.", answeredAt: "2026-09-19T10:30:00.000Z" } }, 200)
    );

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.type(screen.getByLabelText(/ask a question/i), "Who was late?");
    await user.click(screen.getByRole("button", { name: "Ask" }));

    expect(requestedQuestion(fetchMock)).toBe("Who was late?");
  });

  it("cannot submit an empty or blank question", async () => {
    const fetchMock = stubFetch(jsonResponse({}, 200));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    const button = screen.getByRole("button", { name: "Ask" });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/ask a question/i), "   ");
    expect(button).toBeDisabled();
    await user.click(button);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("limits the input to the question length and shows what is left", async () => {
    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    const input = screen.getByLabelText(/ask a question/i);

    expect(input).toHaveAttribute("maxlength", String(QUESTION_MAX_LENGTH));
    await user.type(input, "abcde");
    expect(screen.getByText(`${QUESTION_MAX_LENGTH - 5} characters left`)).toBeInTheDocument();
  });

  it("disables the controls and makes one request while loading", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    expect(screen.getByRole("button", { name: "Asking..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: STARTERS[1] })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/answering/i);
    await user.click(screen.getByRole("button", { name: STARTERS[1] }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(
      jsonResponse({ data: { answer: "Done.", answeredAt: "2026-09-19T10:30:00.000Z" } }, 200)
    );
    await waitFor(() => expect(screen.getByText("Done.")).toBeInTheDocument());
  });

  it("ignores a second submit fired while a request is in flight", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.type(screen.getByLabelText(/ask a question/i), "Who was late?");
    const form = screen.getByLabelText(/ask a question/i).closest("form") as HTMLFormElement;

    // Two submits in one tick, before React can re-render the disabled state,
    // which a disabled button alone cannot stop.
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(
      jsonResponse({ data: { answer: "Done.", answeredAt: "2026-09-19T10:30:00.000Z" } }, 200)
    );
    await waitFor(() => expect(screen.getByText("Done.")).toBeInTheDocument());
  });

  it("allows another question once the first has finished", async () => {
    const fetchMock = stubFetch(
      jsonResponse({ data: { answer: "Ok.", answeredAt: "2026-09-19T10:30:00.000Z" } }, 200)
    );
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse({ data: { answer: "Ok.", answeredAt: "2026-09-19T10:30:00.000Z" } }, 200)
      )
    );

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));
    await screen.findByText("Ok.");
    await user.click(screen.getByRole("button", { name: STARTERS[1] }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("shows the unavailable copy when answeredAt is not a date", async () => {
    stubFetch(jsonResponse({ data: { answer: "Ok.", answeredAt: "not a date" } }, 200));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/unavailable right now/i);
    expect(screen.queryByText(/invalid date/i)).toBeNull();
  });

  it("renders an answer as plain text with its time and the AI note", async () => {
    stubFetch(
      jsonResponse(
        { data: { answer: "<b>x</b> worked 12 hours.", answeredAt: "2026-09-19T10:30:00.000Z" } },
        200
      )
    );

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    const answer = await screen.findByText("<b>x</b> worked 12 hours.");
    expect(answer.querySelector("b")).toBeNull();
    expect(screen.getByText(/answered at \d{1,2}:\d{2}/i)).toBeInTheDocument();
    expect(screen.getByText(/check anything you plan to act on/i)).toBeInTheDocument();
  });

  it("shows the server's reason for an invalid question in an alert", async () => {
    stubFetch(jsonResponse({ error: { message: "Keep your question shorter." } }, 400));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.type(screen.getByLabelText(/ask a question/i), "Who?");
    await user.click(screen.getByRole("button", { name: "Ask" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Keep your question shorter.");
    const input = screen.getByLabelText(/ask a question/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
    expect(input).toBeEnabled();
  });

  it.each([
    [1, 1],
    [60, 1],
    [61, 2],
    [1234, 21],
  ])("rounds Retry-After %is up to %i minutes and locks the controls", async (seconds, minutes) => {
    stubFetch(
      jsonResponse({ error: { message: "limited" } }, 429, { "Retry-After": String(seconds) })
    );

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      new RegExp(`try again in ${minutes} minute${minutes === 1 ? "" : "s"}`, "i")
    );
    expect(screen.getByRole("button", { name: STARTERS[1] })).toBeDisabled();
    expect(screen.getByLabelText(/ask a question/i)).toBeDisabled();
  });

  it("falls back to one minute when Retry-After is missing", async () => {
    stubFetch(jsonResponse({ error: { message: "limited" } }, 429));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/try again in 1 minute\b/i);
  });

  it.each([503, 500, 401])("shows the unavailable copy for a %i", async (status) => {
    stubFetch(jsonResponse({ error: { message: "nope" } }, status));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/unavailable right now/i);
    expect(screen.getByRole("button", { name: STARTERS[0] })).toBeEnabled();
  });

  it("shows the unavailable copy for a non-JSON gateway timeout", async () => {
    stubFetch(new Response("<html>Gateway Timeout</html>", { status: 504 }));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/unavailable right now/i);
  });

  it("shows the unavailable copy when a 200 body is not an answer", async () => {
    stubFetch(new Response("<html>oops</html>", { status: 200 }));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/unavailable right now/i);
  });

  it("shows the unavailable copy when the request fails outright", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const user = userEvent.setup();
    render(<AskCard starterQuestions={STARTERS} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/unavailable right now/i);
  });
});
