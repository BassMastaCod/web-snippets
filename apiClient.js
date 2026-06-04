/**
 * Base API Client class
 * Provides generic methods for making API requests
 */

export class RequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RequestError';
    }
}

export class ApiClient {
    /**
     * Create a new API client
     * @param {string} baseUrl - The base URL for all API requests
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Normalize boolean strings in the payload
     * Converts 'true'/'false' strings to actual booleans
     * @param {Object} data - The request body data
     * @returns {Object} - The normalized data
     */
    normalizeBooleans(data) {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === 'true') {
                result[key] = true;
            } else if (value === 'false') {
                result[key] = false;
            } else {
                result[key] = value;
            }
        }
        return result;
    }

    /**
     * Make an API request with standardized error handling
     * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, etc.)
     * @param {string} endpoint - The API endpoint (will be appended to baseUrl)
     * @param {?Object} data - The request body data (for POST, PUT, etc.)
     * @param {Object} extraHeaders - Custom headers to include in the request
     * @param {Object} extraOptions - Additional options for fetch
     * @param {?function} onSuccess - Callback function to call with the successful response
     *
     * @returns {Promise<any>} - The response data
     */
    async request(method, endpoint = '', data = null, extraHeaders = {}, extraOptions = {}, onSuccess) {
        const url = this.baseUrl + endpoint;
        const fetchOptions = { method, headers: extraHeaders, ...extraOptions };
        if (data) {
            if (data instanceof FormData) {
                fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                fetchOptions.body = data;
            } else if (typeof data === 'string') {
                fetchOptions.headers['Content-Type'] = 'text/plain';
                fetchOptions.body = data;
            } else {
                fetchOptions.headers['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify(this.normalizeBooleans(data));
            }
        }

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            throw new RequestError(`${response.status} - ${await response.text()}`);
        }

        if (onSuccess) {
            return await onSuccess(response);
        } else if (response.status === 204) {
            return null;
        } else {
            const type = response.headers.get('content-type') || '';
            return type.includes('application/json')
                ? await response.json()
                : await response.text();
        }
    }

    /**
     * Make a GET request
     * @param {string} [endpoint] - The API endpoint
     * @param {Object} [headers] - Custom headers to include in the request
     * @returns {Promise<any>} - The response data
     */
    async get(endpoint, headers) {
        return this.request('GET', endpoint, null, headers);
    }

    /**
     * Make a POST request
     * @param {string} [endpoint] - The API endpoint
     * @param {Object} [data] - The request body data
     * @param {Object} [headers] - Custom headers to include in the request
     * @returns {Promise<any>} - The response data
     */
    async post(endpoint, data, headers) {
        return this.request('POST', endpoint, data, headers);
    }

    /**
     * Make a PUT request
     * @param {string} [endpoint] - The API endpoint
     * @param {Object} [data] - The request body data
     * @param {Object} [headers] - Custom headers to include in the request
     * @returns {Promise<any>} - The response data
     */
    async put(endpoint, data, headers) {
        return this.request('PUT', endpoint, data, headers);
    }

    /**
     * Make a PATCH request
     * @param {string} [endpoint] - The API endpoint
     * @param {Object} [data] - The request body data
     * @param {Object} [headers] - Custom headers to include in the request
     * @returns {Promise<any>} - The response data
     */
    async patch(endpoint, data, headers) {
        return this.request('PATCH', endpoint, data, headers);
    }

    /**
     * Make a DELETE request
     * @param {string} [endpoint] - The API endpoint
     * @param {Object} [headers] - Custom headers to include in the request
     * @returns {Promise<any>} - The response data
     */
    async delete(endpoint, headers) {
        return this.request('DELETE', endpoint, null, headers);
    }

    /**
     * Make a HEAD request
     * @param {string} [endpoint] - The API endpoint
     * @param {Object} [headers] - Custom headers to include in the request
     * @returns {Promise<any>} - The response data
     */
    async head(endpoint, headers) {
        return this.request('HEAD', endpoint, null, headers);
    }
}

/**
 * An API client that automatically authenticates each request using an HTTP Only Cookie.
 */
export class SessionClient extends ApiClient {
    async request(method, endpoint, data, extraHeaders, extraOptions, onSuccess) {
        return super.request(method, endpoint, data, extraHeaders, {
            credentials: 'include',
            ...extraOptions,
        }, onSuccess);
    }
}

/**
 * Resolves a relative path against the document's <base> href.
 *
 * This allows applications to work correctly when deployed under
 * a dynamic or nested base path (e.g., "/", "/app/v2/").
 *
 * The <base> tag must be defined under the <head> tag.
 * This is automatically done for you if using FastPWA.
 *
 * Examples:
 *   <base href="/dev/">
 *   withBase("/api/sessions") → "/dev/api/sessions"
 *
 * @param {string} path - A relative or absolute path to resolve.
 * @returns {string} A fully resolved URL string based on the <base> tag.
 */
export function withBase(path) {
    const base = document.querySelector('base')?.getAttribute('href') || '/';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return base + cleanPath;
}

export function fetchWithBase(path, options) {
    return fetch(withBase(path), options);
}
