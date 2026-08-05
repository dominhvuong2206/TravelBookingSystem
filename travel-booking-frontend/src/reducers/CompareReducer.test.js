import CompareReducer from "./CompareReducer";

describe("CompareReducer", () => {
    test("adds and removes a service", () => {
        const service = { id: 1, name: "Da Lat tour" };
        const added = CompareReducer([], { type: "ADD", payload: service });

        expect(added).toEqual([service]);
        expect(CompareReducer(added, { type: "REMOVE", payload: 1 })).toEqual([]);
    });

    test("does not add the same service twice", () => {
        const service = { id: 1 };
        const current = [service];

        expect(CompareReducer(current, { type: "ADD", payload: service })).toBe(current);
    });

    test("limits comparison to four services", () => {
        const current = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

        expect(CompareReducer(current, { type: "ADD", payload: { id: 5 } })).toBe(current);
    });

    test("clears all services", () => {
        expect(CompareReducer([{ id: 1 }], { type: "CLEAR" })).toEqual([]);
    });

    test("returns current state for an unknown action", () => {
        const current = [{ id: 1 }];

        expect(CompareReducer(current, { type: "UNKNOWN" })).toBe(current);
    });
});
