# Routing

## Quick Start

### Register a New Route

1. To register a new route, you need to create a new page class that extends the `Page` class. This class should be located in the `templates/js/pages/` directory.

```javascript
import { Page } from '../core/Page.js';

export class ExamplePage extends Page {
  constructor() {
    super('example.html');
  }
}
```

The `super` constructor specifies the HTML template file that will be used to render this page route. The template file should be located in the `templates/js/templates/` directory. [Learn More](#page-classes)

2. Then, you need to register the new route in the `Router` class. This class is defined in `templates/js/core/Router.js`:

```javascript
import { Router } from './core/Router.js';

const router = new Router();
router.registerRoute('/example', new ExamplePage());
```

## Backend Routing

The backend of this project is built using Django, which handles routing through the `urls.py` files. This file is located in `transcendence/urls.py` and contains the following routes:

- **Admin Route**: The path `'admin/'` is routed to Django's admin site.
- **API Routes**: The path `'api/'` includes routes from the registered routers, which handle API endpoints for user, authentication and other functionalities.
- **Catch-All Route**: The `re_path(r'^.*$', index, name='index')` is used to direct all other requests to the `index` view, which serves the SPA. This is crucial for handling frontend routing in a single-page application.

## Frontend Routing

The frontend routing is managed by a custom JavaScript `Router` class, which handles navigation between different pages without reloading the entire page. This is typical for SPAs to provide a seamless user experience.

### Router Class

The `Router` class is defined in `templates/js/core/Router.js`:

- **Initialization**: The router is initialized with a root element and sets up event listeners for `DOMContentLoaded` and `popstate` events to manage navigation.
- **Navigation Links**: The `populateNavigationLinks` method adds click event listeners to all anchor tags to prevent default behavior and use the router's `navigate` method instead.
- **Route Handling**: The `handleRoute` method updates the main content based on the current path and mounts the appropriate page component.
- **Route Registration**: Routes are registered with their corresponding page instances, allowing the router to know which component to render for each path.

### Page Classes

Each page in the SPA is represented by a class extending a base `Page` class. These classes are responsible for fetching and rendering their respective templates.

#### Examples

- **Home Page**: Defined in `templates/js/pages/home.js`

```javascript
import { Page } from '../core/Page.js';

export class HomePage extends Page {
  constructor() {
    super('home.html');
  }

  // Override mount to add custom behavior
  async mount(container) {
    await super.mount(container);
    // Add any page-specific initialization here
    return true;
  }
}
```
