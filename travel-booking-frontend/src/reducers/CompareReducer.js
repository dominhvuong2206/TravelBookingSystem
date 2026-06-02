const MAX_COMPARE_ITEMS = 4;

const CompareReducer = (current, action) => {
    switch (action.type) {
        case "ADD": {
            const service = action.payload;
            if (current.find(item => item.id === service.id))
                return current;
            if (current.length >= MAX_COMPARE_ITEMS)
                return current;
            return [...current, service];
        }
        case "REMOVE":
            return current.filter(item => item.id !== action.payload);
        case "CLEAR":
            return [];
        default:
            return current;
    }
};

export default CompareReducer;
