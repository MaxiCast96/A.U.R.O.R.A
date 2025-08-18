import { useState, useMemo, useEffect } from 'react';

export const usePagination = (data, initialPageSize = 5) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Asegurar que data sea un arreglo para evitar errores (e.g., cuando la API devuelve un objeto)
  const arr = Array.isArray(data) ? data : [];
  const arrLength = arr.length;

  const totalPages = Math.ceil(arrLength / pageSize);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return arr.slice(start, start + pageSize);
  }, [arr, currentPage, pageSize]);

  // Reset to first page if data or page size changes
  useEffect(() => {
    setCurrentPage(0);
  }, [arrLength, pageSize]);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));
  const goToFirstPage = () => setCurrentPage(0);
  const goToLastPage = () => setCurrentPage(totalPages > 0 ? totalPages - 1 : 0);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    pageSize,
    setPageSize
  };
};