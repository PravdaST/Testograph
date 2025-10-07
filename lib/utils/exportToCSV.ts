/**
 * Export data to CSV file
 * @param data Array of objects to export
 * @param filename Name of the CSV file (without .csv extension)
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle null/undefined
          if (value === null || value === undefined) return '';
          // Handle objects/arrays - stringify them
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          // Handle strings with commas or quotes - escape them
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export text content to a text file
 * @param content Text content to export
 * @param filename Name of the file (without extension)
 * @param extension File extension (default: 'txt')
 */
export function exportToTextFile(
  content: string,
  filename: string,
  extension: string = 'txt'
): void {
  if (!content) {
    console.warn('No content to export');
    return;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.${extension}`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Format data for CSV export by flattening nested objects
 * @param data Array of objects with potentially nested data
 * @param flatten Whether to flatten nested objects
 */
export function prepareDataForExport<T extends Record<string, any>>(
  data: T[],
  flatten: boolean = true
): Record<string, any>[] {
  if (!flatten) return data;

  return data.map((item) => {
    const flattened: Record<string, any> = {};

    Object.entries(item).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Flatten nested objects
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          flattened[`${key}_${nestedKey}`] = nestedValue;
        });
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[key] = value.join(', ');
      } else {
        flattened[key] = value;
      }
    });

    return flattened;
  });
}
