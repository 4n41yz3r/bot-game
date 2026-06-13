import { describe, expect, it } from "vitest";

import { shouldInstallTestApi } from "../../src/ui/testApi";

describe("test API", () => {
  it("is disabled by default", () => {
    expect(shouldInstallTestApi(new URL("https://example.test/"))).toBe(false);
  });

  it("is enabled by an explicit query flag", () => {
    expect(shouldInstallTestApi(new URL("https://example.test/?testApi=1"))).toBe(
      true
    );
  });
});
