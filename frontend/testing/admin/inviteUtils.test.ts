import { describe, it, expect } from "vitest";
import { parseEmailList, parseInviteCsv } from "@/features/admin/utils/inviteUtils";

describe("invite utils", () => {
    it("parses email lists with dedupe and invalids", () => {
        const result = parseEmailList("ONE@example.com, bad-email\nTwo@example.com one@example.com");

        expect(result.emails).toEqual(["one@example.com", "two@example.com"]);
        expect(result.invalid).toEqual(["bad-email"]);
    });

    it("parses CSV rows with email header", () => {
        const csv = "email,name\nuser@example.com,User\nbad-email,Bad\nsecond@example.com,Second\n";
        const result = parseInviteCsv(csv);

        expect(result.emails).toEqual(["user@example.com", "second@example.com"]);
        expect(result.invalid).toEqual(["bad-email"]);
        expect(result.hasHeader).toBe(true);
        expect(result.rowCount).toBe(3);
    });
});
