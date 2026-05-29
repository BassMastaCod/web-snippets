import {SessionClient} from 'https://bassmastacod.github.io/web-snippets/apiClient.js';

/**
 * Generic base API class that provides standard CRUD operations
 * Extends SessionClient with common patterns found across API services
 */
export class FastControllerApi extends SessionClient {
    /**
     * Find records with optional criteria, ordering, and pagination
     * @param {Object} criteria - Search criteria as key-value pairs
     * @param {string} xOrderBy - Field to order by (prefix with ! for descending)
     * @param {number} xPerPage - Number of items per page
     * @param {number} xPage - Page number (1 for first page)
     */
    async find(criteria = {}, xOrderBy, xPerPage, xPage) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(criteria)) {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value);
            }
        }

        const headers = {};
        if (xPage) {
            headers['x-page'] = xPage.toString();
        }
        if (xPerPage) {
            headers['x-per-page'] = xPerPage.toString();
        }
        if (xOrderBy) {
            headers['x-order'] = xOrderBy;
        }

        let queryStart = ''
        let query = searchParams.toString();
        if (query) {
            queryStart = this.baseUrl.includes('?') ? '&' : '?';
        }

        return this.get(queryStart + query, headers);
    }

    /**
     * Create a new record
     * @param {Object} data - Data to create
     */
    async create(data) {
        return this.post('', data);
    }

    /**
     * Upsert (create or update) a record
     * @param {Object} data - Data to upsert
     */
    async upsert(data) {
        return this.put('', data);
    }

    /**
     * Fetch a single record by primary key
     * @param {string|number} pk - Primary key value
     */
    async fetch(pk) {
        return this.get(`/${pk}`);
    }

    /**
     * Update a record (full update)
     * @param {string|number} pk - Primary key value
     * @param {Object} data - Data to update (must contain primary key)
     */
    async update(pk, data) {
        return this.put(`/${pk}`, data);
    }

    /**
     * Modify a record (partial update)
     * @param {string|number} pk - Primary key value
     * @param {Object} partialData - Partial data to update
     */
    async modify(pk, partialData) {
        return this.patch(`/${pk}`, partialData);
    }

    /**
     * Remove a record
     * @param {string|number} pk - Primary key value
     */
    async remove(pk) {
        return this.delete(`/${pk}`);
    }

    /**
     * Rename/change primary key of a record
     * @param {string|number} pk - Current primary key value
     * @param {string|number} newPk - New primary key value
     */
    async rename(pk, newPk) {
        return this.post(`/${pk}/rename`, newPk);
    }

    /**
     * Merge two records into one
     * @param {string|number} sourcePk - Primary key value of the source record
     * @param {string|number} destPk - Primary key value of the destination record
     */
    async merge(sourcePk, destPk) {
        return this.post(`/${sourcePk}/merge/${destPk}`);
    }

    /**
     * Get all records (alias for find with no criteria)
     */
    async all() {
        return this.find();
    }

    /**
     * Get a specific page of records
     * @param {number} pageNumber - Page number (1 for first page)
     * @param {Object} criteria - Search criteria as key-value pairs
     * @param {number} perPage - Number of items per page
     * @param {string} orderBy - Field to order by (prefix with ! for descending)
     */
    async getPage(pageNumber, criteria = {}, perPage = 20, orderBy) {
        return this.find(criteria, baseQuery, orderBy, perPage, pageNumber);
    }

    /**
     * Get a single item (first result) from the query
     * @param {Object} criteria - Search criteria as key-value pairs
     * @param {string} orderBy - Field to order by (prefix with ! for descending)
     */
    async getSingle(criteria = {}, orderBy) {
        const results = await this.find(criteria, orderBy, 1);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
    }

    /**
     * Find records with a limited number of results
     * @param {Object} criteria - Search criteria as key-value pairs
     * @param {number} limit - Limit on the number of results per page
     * @param {string} orderBy - Field to order by (prefix with ! for descending)
     */
    async limitFind(criteria = {}, limit, orderBy) {
        return this.find(criteria, baseQuery, orderBy, limit, 1);
    }
}
