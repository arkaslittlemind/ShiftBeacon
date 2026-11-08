import { renderHook, waitFor } from "@testing-library/react";
import { act, createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./use-geolocation";

type WatchCallbacks = {
  success: PositionCallback;
  error: PositionErrorCallback;
};

function installGeolocation() {
  const callbacks: Partial<WatchCallbacks> = {};
  const geolocation = {
    watchPosition: vi.fn((success: PositionCallback, error: PositionErrorCallback) => {
      callbacks.success = success;
      callbacks.error = error;
      return 7;
    }),
    clearWatch: vi.fn(),
  };
  Object.defineProperty(navigator, "geolocation", { value: geolocation, configurable: true });
  return { geolocation, callbacks };
}

function removeGeolocation() {
  Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true });
}

function StatusProbe() {
  return createElement("span", { "data-status": useGeolocation().status });
}

afterEach(() => {
  removeGeolocation();
  document.body.innerHTML = "";
});

describe("useGeolocation", () => {
  // The F-16 regression: Node's `navigator` has no geolocation and the
  // browser's does, so a hook that reads it during render hydrates with a
  // different state than the server rendered.
  it("hydrates server HTML rendered without geolocation, with no mismatch", async () => {
    removeGeolocation();
    const html = renderToString(createElement(StatusProbe));
    expect(html).toContain('data-status="idle"');

    installGeolocation();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, createElement(StatusProbe), { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector("span")?.getAttribute("data-status")).toBe("prompting");
    act(() => root?.unmount());
  });

  it("reports unsupported when the browser has no geolocation", () => {
    removeGeolocation();

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe("unsupported");
    expect(result.current.error).toMatch(/doesn't support location/);
  });

  it("reports prompting until the browser answers", () => {
    installGeolocation();

    const { result } = renderHook(() => useGeolocation());

    expect(result.current).toEqual({ status: "prompting", coords: null, error: null });
  });

  it("reports granted with coordinates when a position arrives", async () => {
    const { callbacks } = installGeolocation();
    const { result } = renderHook(() => useGeolocation());

    act(() => callbacks.success!({ coords: { latitude: 51.5, longitude: -0.12 } } as GeolocationPosition));

    await waitFor(() =>
      expect(result.current).toEqual({
        status: "granted",
        coords: { latitude: 51.5, longitude: -0.12 },
        error: null,
      })
    );
  });

  it("reports denied when the user refuses permission", async () => {
    const { callbacks } = installGeolocation();
    const { result } = renderHook(() => useGeolocation());

    act(() => callbacks.error!({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError));

    await waitFor(() => expect(result.current.status).toBe("denied"));
  });

  it("clears the watch on unmount", () => {
    const { geolocation } = installGeolocation();
    const { unmount } = renderHook(() => useGeolocation());

    unmount();

    expect(geolocation.clearWatch).toHaveBeenCalledWith(7);
  });
});
