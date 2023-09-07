/*
Singleton class that grants global access to the backbone view: views/shared/Page.js
This is an interim work around as we transition from an inheritance architecture
to a compositional architecture. See SPL-186763 for more information.
*/
class PageViewSingleton {
    constructor() {
        this.pageView = undefined;
    }

    // Set pageView once and freeze the Object
    setPageView = (pageView) => {
        if (!this.pageView) {
            this.pageView = pageView;
            Object.freeze(this);
        }
    }

    getPageView = () => (this.pageView);
}

const singleton = new PageViewSingleton();
export default singleton;