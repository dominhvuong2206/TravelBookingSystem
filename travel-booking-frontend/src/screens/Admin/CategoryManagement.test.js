import { toSlug } from "./CategoryManagement";

describe("toSlug", () => {
    test("normalizes Vietnamese category names", () => {
        expect(toSlug("Địa điểm & Trải nghiệm")).toBe("dia-diem-trai-nghiem");
    });

    test("removes extra separators and keeps numbers", () => {
        expect(toSlug("  Tour--Cao Cấp 2026  ")).toBe("tour-cao-cap-2026");
    });
});