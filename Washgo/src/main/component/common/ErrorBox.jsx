export default function ErrorBox({ currentError }) {
  return (
    <div className="my-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm text-center">
      <i className="fas fa-exclamation-circle mr-2"></i>
      <strong>Error:</strong> {currentError}
    </div>
  );
}
