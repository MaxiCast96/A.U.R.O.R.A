import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  goToFirstPage,
  goToPreviousPage,
  goToNextPage,
  goToLastPage,
  pageSize,
  setPageSize
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-3 sm:gap-4 pb-4 sm:pb-6">
      <div className="flex items-center gap-2">
        <span className="text-gray-700 text-xs sm:text-sm">Mostrar</span>
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="border border-cyan-500 rounded py-1 px-2 text-xs sm:text-sm"
        >
          {[5, 10, 15, 20].map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        <span className="text-gray-700 text-xs sm:text-sm">por página</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={goToFirstPage} disabled={currentPage === 0} className="px-2 sm:px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors text-xs sm:text-sm">{"<<"}</button>
        <button onClick={goToPreviousPage} disabled={currentPage === 0} className="px-2 sm:px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors text-xs sm:text-sm">{"<"}</button>
        <span className="text-gray-700 font-medium text-xs sm:text-sm px-2">Página {currentPage + 1} de {totalPages}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="px-2 sm:px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors text-xs sm:text-sm">{">"}</button>
        <button onClick={goToLastPage} disabled={currentPage === totalPages - 1} className="px-2 sm:px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors text-xs sm:text-sm">{">>"}</button>
      </div>
    </div>
  );
};

export default Pagination;