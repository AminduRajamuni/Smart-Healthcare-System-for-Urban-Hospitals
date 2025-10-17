// Pure utility to generate an SVG path for a simple line chart
// Width and height are kept aligned with the viewBox used in ManagerDashboard
export function buildLineChartPath(values) {
  if (!Array.isArray(values) || values.length === 0) return '';
  const maxVal = Math.max(...values, 1);
  const width = 600;
  const height = 180;
  const stepX = width / Math.max(values.length - 1, 1);

  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - (value / maxVal) * height;
    return `${x},${y}`;
  });

  return `M ${points[0]} L ${points.slice(1).join(' ')}`;
}


