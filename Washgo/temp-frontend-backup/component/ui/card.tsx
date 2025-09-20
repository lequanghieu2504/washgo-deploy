// components/ui/card.tsx
import React from "react";

// --- Card Component ---

interface CardProps {
  children: React.ReactNode;
  className?: string; // Allow passing additional classes for customization
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  // Adjusted rounding, shadow, padding, and added a subtle border
  <div
    className={`
      bg-white shadow-lg rounded-lg border border-gray-200 p-6 
      ${className} 
    `}
  >
    {children}
  </div>
);


// --- Card Header (Optional but common) ---

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => (
    // Often used for titles, potentially with a bottom border
    <div className={`mb-4 pb-3 border-b border-gray-200 ${className}`}>
        {children}
    </div>
);


// --- Card Title (Optional but common) ---

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
    // You might add props for heading level (h2, h3, etc.)
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => (
    // Style for a title within the header or card
    <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>
        {children}
    </h3>
);


// --- Card Content Component ---

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  // Removed default margin-top, assuming Card padding is sufficient.
  // Add padding/margin here if specific content needs it.
  <div className={`${className}`}>
    {children}
  </div>
);


// --- Card Footer (Optional but common) ---

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = "" }) => (
    // Often used for action buttons, potentially with a top border
    <div className={`mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3 ${className}`}>
        {children}
    </div>
);


// Optional: Export all components for easier import
// export { Card, CardHeader, CardTitle, CardContent, CardFooter };
// Optional: Export the props types if needed elsewhere
// export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps, CardFooterProps };