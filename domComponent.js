export class DomComponent {
    static className;
    element;

    invokeStatic(methodName, ...args) {
        return this.constructor[methodName](...args);
    }

    static create(...args) {
        const element = this.createElement(...args);
        const dom = new this(element);
        if (!element.classList.contains(this.className)) {
            element.classList.add(this.className)
        }
        if (!element.id) {
            element.id = this.className + dom.generateId(...args);
        }
        dom.init(...args);
        dom.registerEventListeners(...args);
        return dom;
    }

    static createElement(...args) {
        throw new Error('Not implemented');
    }

    init(...args) {
        throw new Error('Not implemented');
    }

    registerEventListeners(...args) {
        throw new Error('Not implemented');
    }

    static of(id) {
        return this.newOrNull(document.getElementById(`${this.className}${id}`));
    }

    static ofEvent(event) {
        return this.newOrNull(event.target);
    }

    static newOrNull(element) {
        try {
            return new this(element);
        } catch {
            return null;
        }
    }

    constructor(element) {
        this.element = element.closest(`.${this.constructor.className}`);
        if (!this.element) {
            throw new Error(`Element ${element} is not a ${this.constructor.className}`);
        }
    }

    /**
     * Detach the component's root element from the DOM.
     */
    detach() {
        this.element?.remove();
    }

    /**
     * Get the prefix of the path to allow for dynamic endpoint reference.
     */
    getPathPrefix() {
        return document.querySelector('meta[name=path-prefix]').content;
    }

    /**
     * Set a dataset attribute.
     */
    setData(key, value) {
        this.element.dataset[key] = value;
    }

    /**
     * Get a dataset attribute.
     */
    getData(key) {
        return this.element.dataset[key];
    }

    /**
     * Add a CSS class.
     */
    setClass(className) {
        this.element.classList.add(className);
    }

    /**
     * Remove a CSS class.
     */
    unsetClass(className) {
        this.element.classList.remove(className);
    }

    /**
     * Check for a CSS class.
     */
    hasClass(className) {
        return this.element.classList.contains(className);
    }

    /**
     * Generates a unique ID for the element.
     *
     * This will be a random UUID unless overridden with something more meaningful.
     */
    generateId(...args) {
        return crypto.randomUUID();
    }

    /**
     * Get the ID associated with the element.
     */
    getId() {
        return parseInt(this.element.id.slice(this.constructor.className.length));
    }
}

export function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}
