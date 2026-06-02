export const formatDate = (value) => {
    if (!value)
        return "";

    return new Date(value).toLocaleDateString("vi-VN");
};
