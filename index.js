import Hapi from "@hapi/hapi";
import routes from "./src/routes.js";

const [HOST, PORT] = ['localhost', 5000]

async function init() {
   const server = Hapi.server({
      host: HOST,
      port: PORT,
   });

   server.route(routes);
   await server.start();
   console.log(`Listening to ${server.info.uri}`);
}

init();