import Hapi from "@hapi/hapi";

const routes = {
   '/': {
      _GET: () => ({status: 'GET Success'}),
      _POST: () => ({status: 'POST Success'})
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