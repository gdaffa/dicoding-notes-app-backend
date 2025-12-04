import Hapi from "@hapi/hapi";
import {
   httpGetNote,
   httpAddNote,
   httpEditNote,
   httpDeleteNote
} from './handler.js';

// =============================================================================

const routes = {
   '/notes' : {
      '{id}' : {
         _GET    : httpGetNote,
         _PUT    : httpEditNote,
         _DELETE : httpDeleteNote,
      },
      _GET  : httpGetNote,
      _POST : httpAddNote
   }
};

/**
 * @type {Hapi.ServerRoute[]}
 */
const hapiRoutes = [];

// =============================================================================

/**
 * Route parser for object like `{'/path': {'_METHOD': func}}` to
 * `{path: '/path', method: 'METHOD', handler: func}` type.
 *
 * This used for parse `routes` constant and push the parsed route to
 * `hapiRoutes` that both defined in `routes.js` file.
 *
 * @param {object} routes
 */
function parseRoutes(routes) {
   for (let path in routes) {
      let routesChild = routes[path];

      for (let method in routesChild) {
         // if `method` is not a method, create a new route to `base_path/path`
         if (method[0] != '_') {
            let newRoutes = {};
            newRoutes[`${path}/${method}`] = routesChild[method];
            parseRoutes(newRoutes);
            continue;
         }

         // if it is, parse into `Hapi.ServerRoute` type and add to hapiRoutes
         let route = {
            method  : method.slice(1),
            path    : path,
            handler : routesChild[method]
         }
         hapiRoutes.push(route);
      }
   }
}

// =============================================================================

parseRoutes(routes);

// =============================================================================

export default hapiRoutes;