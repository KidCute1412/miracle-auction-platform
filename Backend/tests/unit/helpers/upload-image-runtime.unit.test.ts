import { tmpdir } from "node:os";
import { isAbsolute } from "node:path";
import { describe, expect, it } from "vitest";
import { uploadDir } from "../../../src/helpers/uploadImage.helper.ts";

describe("upload temporary directory", () => {
  it("uses an absolute writable temporary path independent of bundle location", () => {
    expect(isAbsolute(uploadDir)).toBe(true);
    expect(uploadDir.startsWith(tmpdir())).toBe(true);
  });
});
