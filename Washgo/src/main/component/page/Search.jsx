import React, { useState, useEffect } from "react"; // Added React import
import { useLocation, useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const [carwashes, setCarwashes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleItems, setVisibleItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [fetchError, setFetchError] = useState(null); // Add error state
  const query = new URLSearchParams(location.search).get("q");

  const getData = async () => {
    if (!query) {
        setCarwashes([]); // Clear results if query is empty
        return;
    }

    const accessToken = localStorage.getItem("accessToken");
    setIsLoading(true); // Start loading
    setFetchError(null); // Clear previous errors

    try {
      const response = await fetch(
        // Ensure query parameter is properly encoded
        `http://localhost:8080/api/carwashes?name=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
         let errorMsg = `Failed to fetch car washes: ${response.status}`;
         try {
             const errorData = await response.text();
             errorMsg += ` - ${errorData}`;
         } catch (e) {/* Ignore */}
         throw new Error(errorMsg);
      }

      const data = await response.json();
      setCarwashes(Array.isArray(data) ? data : []); // Ensure data is an array
      setCurrentPage(1); // Reset to first page on new search
    } catch (err) {
      console.error("Fetch carwashes error:", err);
      setFetchError(err.message || "Failed to fetch search results.");
      setCarwashes([]); // Clear data on error
    } finally {
        setIsLoading(false); // Stop loading
    }
  };

  // Fetch data when the search query changes
  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Dependency array includes query

  // Update visible items when current page or carwashes data changes
  useEffect(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    // No need for setTimeout unless you intentionally want a delay
    setVisibleItems(carwashes.slice(start, end));
  }, [currentPage, carwashes]);

  const totalPages = Math.ceil(carwashes.length / ITEMS_PER_PAGE);

  // Navigate to carwash detail page
  const handleCarwashClick = (id) => {
    navigate(`/carwash/${id}`);
  };

  // Navigate pagination
  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
          // Optional: Scroll to top when changing page
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };


  return (
    // Main container with padding
    <div className="p-6 lg:p-8 min-h-[calc(100vh-theme_header_height)]"> {/* Adjust min-height based on layout */}
       {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
        Search Results {query && <span className="text-gray-600 font-normal">for "{query}"</span>}
      </h1>

        {/* Loading State */}
        {isLoading && (
            <div className="text-center py-10">
                <i className="fas fa-spinner fa-spin text-3xl text-[#cc0000]"></i>
                <p className="mt-2 text-gray-600">Loading results...</p>
            </div>
        )}

        {/* Error State */}
        {fetchError && !isLoading && (
             <div className="text-center text-red-600 my-10 p-6 bg-red-50 rounded-lg border border-dashed border-red-300">
                <i className="fas fa-exclamation-triangle mr-2 text-xl"></i>
                <p className="font-semibold">Could not load results.</p>
                <p className="text-sm">{fetchError}</p>
             </div>
        )}

      {/* Results List - Only show if not loading, no error, and results exist */}
      {!isLoading && !fetchError && carwashes.length > 0 && (
        <>
          <ul className="space-y-3 mb-8"> {/* Added space between items */}
            {visibleItems.map((item) => (
              <li
                key={item.id}
                // Enhanced styling for list items - like cards
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer transition duration-150 ease-in-out hover:shadow-md hover:border-[#cc0000] hover:bg-red-50"
                onClick={() => handleCarwashClick(item.id)}
                title={`View details for ${item.carwashName}`} // Add title for accessibility
              >
                {/* Display more info if available */}
                <p className="font-medium text-gray-800">{item.carwashName || "Unnamed Carwash"}</p>
                {item.location && <p className="text-sm text-gray-500 mt-1">{item.location}</p>}
                {/* Add rating or other details if available */}
                 {item.average_rating && (
                     <div className="flex items-center mt-1">
                        <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
                        <span className="text-xs font-medium text-gray-600">{item.average_rating}</span>
                     </div>
                 )}
              </li>
            ))}
          </ul>

          {/* Pagination Controls - Only show if more than one page */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                 // Consistent button styling, primary color on hover/focus
                className="px-3 py-1 rounded-md text-sm font-medium transition duration-150 ease-in-out bg-gray-200 text-gray-700 enabled:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#cc0000]"
              >
                 <i className="fas fa-chevron-left mr-1 text-xs"></i> Prev
              </button>

              {/* Page Indicator */}
              <span className="px-4 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                 // Consistent button styling, primary color on hover/focus
                 className="px-3 py-1 rounded-md text-sm font-medium transition duration-150 ease-in-out bg-gray-200 text-gray-700 enabled:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#cc0000]"
              >
                Next <i className="fas fa-chevron-right ml-1 text-xs"></i>
              </button>
            </div>
          )}
        </>
      )}

       {/* No Results Message */}
       {!isLoading && !fetchError && carwashes.length === 0 && query && (
         <div className="text-center text-gray-500 mt-10 p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
             <i className="fas fa-search mr-2 text-lg text-gray-400"></i>
            No results found for "{query}". Try a different search term.
         </div>
       )}
       {/* Initial state message if query is empty */}
       {!isLoading && !fetchError && !query && (
          <div className="text-center text-gray-500 mt-10 p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <i className="fas fa-search mr-2 text-lg text-gray-400"></i>
              Enter a search term in the header to find car washes.
          </div>
       )}

    </div>
  );
}

export default Search;