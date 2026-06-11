import toast from 'react-hot-toast';

/**
 * Normalizes FastAPI / API error payloads into a user-facing string.
 */
export function getApiErrorMessage(detail, fallback = 'Something went wrong. Please try again.') {
  if (detail == null || detail === '') return fallback;
  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((err) => {
        if (typeof err === 'string') return err;
        if (err?.msg) {
          const field = err.loc?.length ? err.loc[err.loc.length - 1] : null;
          return field ? `${field}: ${err.msg}` : err.msg;
        }
        return null;
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join(' ') : fallback;
  }

  if (typeof detail === 'object') {
    if (detail.msg) return detail.msg;
    if (detail.message) return detail.message;
  }

  return fallback;
}

/**
 * Safely parses a fetch Response body as JSON.
 */
export async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('The server returned an unexpected response. Please try again later.');
  }
}

/**
 * Shows the first validation error via toast for consistent UI feedback.
 */
export function showValidationError(errors) {
  const firstMessage = Object.values(errors).find(Boolean);
  if (firstMessage) toast.error(firstMessage);
}
