import {
    clearAuthSession,
    getLoginRedirect,
    getStoredUser,
    hasRole,
    isActive,
    isApproved,
    normalizeRole,
} from "./authUtils";

describe("authUtils", () => {
    beforeEach(() => localStorage.clear());

    test("reads a valid stored user", () => {
        const user = { username: "customer", userRole: "ROLE_CUSTOMER" };
        localStorage.setItem("user", JSON.stringify(user));

        expect(getStoredUser()).toEqual(user);
    });

    test("removes malformed stored user data", () => {
        localStorage.setItem("user", "not-json");

        expect(getStoredUser()).toBeNull();
        expect(localStorage.getItem("user")).toBeNull();
    });

    test("clears the stored authentication session", () => {
        localStorage.setItem("token", "stale-token");
        localStorage.setItem("user", JSON.stringify({ username: "provider" }));

        clearAuthSession();

        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("user")).toBeNull();
    });
    test("normalizes and compares roles", () => {
        expect(normalizeRole({ role: "ADMIN" })).toBe("ROLE_ADMIN");
        expect(normalizeRole({ userRole: "ROLE_PROVIDER" })).toBe("ROLE_PROVIDER");
        expect(hasRole({ role: "CUSTOMER" }, "ROLE_CUSTOMER")).toBe(true);
        expect(hasRole({ role: "CUSTOMER" }, "ADMIN")).toBe(false);
    });

    test.each([true, 1, "true", "1"])("recognizes active value %p", (active) => {
        expect(isActive({ active })).toBe(true);
    });

    test.each([true, 1, "true", "1"])("recognizes approved value %p", (approved) => {
        expect(isApproved({ approved })).toBe(true);
    });

    test("rejects inactive and unapproved values", () => {
        expect(isActive({ active: false })).toBe(false);
        expect(isApproved({ approved: 0 })).toBe(false);
    });

    test("builds an encoded login redirect", () => {
        expect(getLoginRedirect("/provider/services/1?tab=bookings"))
            .toBe("/login?next=%2Fprovider%2Fservices%2F1%3Ftab%3Dbookings");
    });
});
