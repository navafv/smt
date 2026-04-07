export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
