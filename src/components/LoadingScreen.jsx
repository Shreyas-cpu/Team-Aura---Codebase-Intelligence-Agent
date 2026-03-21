export default function LoadingScreen({ message = "Loading dependencies..." }) {
  return (
    <div className="loading-screen">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
