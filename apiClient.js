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
     * Converts "true"/"false" strings to actual booleans
     * @param {Object} data - The request body data
     * @returns {Object} - The normalized data
     */
    normalizeBooleans(data) {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === "true") {
                result[key] = true;
            } else if (value === "false") {
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
     * @param {Object} data - The request body data (for POST, PUT, etc.)
     * @returns {Promise<any>} - The response data
     */
    async request(method, endpoint = '', data = null) {
        const url = this.baseUrl + endpoint;
        const fetchOptions = { method };
        if (data) {
            fetchOptions.headers = { 'Content-Type': 'application/json' };
            fetchOptions.body = JSON.stringify(this.normalizeBooleans(data));
        }

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            throw new RequestError(`${response.status} - ${await response.text()}`);
        }

        if (response.status === 204) {
            return null;
        }
        const type = response.headers.get('content-type') || '';
        return type.includes('application/json')
            ? await response.json()
            : await response.text();
    }

    /**
     * Make a GET request
     * @param {string} endpoint - The API endpoint
     * @returns {Promise<any>} - The response data
     */
    async get(endpoint = '') {
        return this.request('GET', endpoint);
    }

    /**
     * Make a POST request
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The request body data
     * @returns {Promise<any>} - The response data
     */
    async post(endpoint = '', data = null) {
        return this.request('POST', endpoint, data);
    }

    /**
     * Make a PUT request
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The request body data
     * @returns {Promise<any>} - The response data
     */
    async put(endpoint = '', data) {
        return this.request('PUT', endpoint, data);
    }

    /**
     * Make a PATCH request
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The request body data
     * @returns {Promise<any>} - The response data
     */
    async patch(endpoint = '', data) {
        return this.request('PATCH', endpoint, data);
    }

    /**
     * Make a DELETE request
     * @param {string} endpoint - The API endpoint
     * @returns {Promise<any>} - The response data
     */
    async delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}
