'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Log error for debugging
    console.error('Application error:', error);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
            <p className="text-red-500 mb-4">{error.message || 'An unexpected error occurred'}</p>
            {error.digest && (
                <p className="text-sm text-gray-500 mb-4">Error ID: {error.digest}</p>
            )}
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Try again
            </button>
        </div>
    );
} 