export class DomComponent {
    static className;
    element;

    invokeStatic(methodName, ...args) {
        return this.constructor[methodName](...args);
    }

    static create(...args) {
        const element = this.createElement(...args);
        if (!element.classList.contains(this.className)) {
            element.classList.add(this.className);
        }
        const dom = new this(element);
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
        return this.element.id.slice(this.constructor.className.length);
    }
}

export const Draggable = Base => class extends Base {
    static create(...args) {
        const dom = super.create(...args);
        dom.element.draggable = true;
        dom.registerDragEventListeners();
        return dom;
    }

    registerDragEventListeners() {
        this.element.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.element.addEventListener('dragover', this.handleDragOver.bind(this));
        this.element.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.element.addEventListener('drop', this.handleDrop.bind(this));
        this.element.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    handleDragStart(e) {
        this.setClass('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('id', this.getId());
        e.dataTransfer.setData('text/html', this.element.outerHTML);
        e.dataTransfer.setDragImage(this.element, 0, 0);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!this.hasClass('dragging')) {
            this.setClass('drag-over');
        }
    }

    handleDragLeave(e) {
        if (!this.element.contains(e.relatedTarget)) {
            this.unsetClass('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const dragged = this.constructor.of(e.dataTransfer.getData('id'));
        if (dragged !== this) {
            this.onDrop(e, dragged);
            this.unsetClass('drag-over');
        }
    }

    onDrop(e, dragged) {
        throw new Error('Not implemented');
    }

    handleDragEnd(e) {
        this.unsetClass('dragging');
        document.querySelectorAll('.drag-over').forEach(item => {
            item.classList.remove('drag-over');
        });
    }
};

export function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}
