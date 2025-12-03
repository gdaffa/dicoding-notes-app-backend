import Hapi from "@hapi/hapi";
import {
   httpGetNote,
   httpAddNote,
   httpChangeNote,
   httpDeleteNote
} from './handler.js';

const routes = {
   '/notes': {
      '{id}': {
         _GET: httpGetNote,
         _PUT: httpChangeNote,
         _DELETE: httpDeleteNote,
      },
      _GET: httpGetNote,
      _POST: httpAddNote
   }
};

/**
 * @type {Hapi.ServerRoute[]}
 */
const hapiRoutes = [];

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

parseRoutes(routes);

export default hapiRoutes;