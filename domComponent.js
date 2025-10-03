export class DomComponent {
    static className;
    element;

    invokeStatic(methodName, ...args) {
        return this.constructor[methodName](...args);
    }

    static create(...args) {
        const element = this.createElement(...args);
        const dom = new this(element);
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
     * Get the ID associated with the element.
     */
    getId() {
        return parseInt(this.element.id.slice(this.constructor.className.length));
    }
}
