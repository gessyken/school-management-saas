import { useState } from "react";
// usePagination.js or inside your component
export const usePagination = (data, itemsPerPage) => {
    const [currentPage, setCurrentPage] = useState(1);
    if (itemsPerPage === "all")
        itemsPerPage = data.length
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const currentData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return {
        currentPage,
        totalPages,
        currentData,
        goToNextPage,
        goToPreviousPage,
        goToPage,
    };
};
