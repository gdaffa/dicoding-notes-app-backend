import Hapi from "@hapi/hapi";
import { randstr } from './utils.js';

/**
 * @type {Map<string, { title: string; tags: string[]; body: string; createdAt: string; updatedAt: string; }>}
 */
let notes = new Map();

function getNotesAsObject() {
   return [...notes].map(([ id, note ]) => ({ id, ...note }));
}

/**
 * @param {Hapi.ResponseToolkit} h
 * @param {string} status
 * @param {number} code
 * @param {message} message
 * @param {object} options
 */
function sendResponse(h, status, code, message, options = null) {
   let res = { status, code, message, ...options };
   h.response().code(code);
   return res;
}

/**
 * Wrapper for http function with try catch handler.
 *
 * @param {Hapi.Lifecycle.Method} func
 */
function httpHandleError(func) {
   /**
    * @type {Hapi.Lifecycle.Method}
    */
   return function(req, h) {
      try {
         return func(req, h);
      } catch (err) {
         let env = process.env.NODE_ENV ?? 'production';
         if (env === 'development') {
            console.error(`[INTERNAL ERROR] ${req.url.pathname} -`, err);
         }

         let message = env === 'development'
            ? `${err.name}: ${err.message}`
            : 'Internal server error.';
         return sendResponse(h, 'failed', 500, message);
      }
   }
}

/**
 * @type {Hapi.Lifecycle.Method}
 */
const httpGetNote = httpHandleError((req, h) => {
   let { id } = req.params;
   let data;

   if (id == undefined) {
      data = { notes: getNotesAsObject()};
   }
   else {
      if (!notes.has(id)) {
         let message = `Catatan dengan id ${id} tidak ditemukan.`
         return sendResponse(h, 'success', 400, message);
      }
      data = { note: { id, ...notes.get(id) } };
   }

   data = { data };
   return sendResponse(h, 'success', 200, 'Catatan berhasil diambil.', data);
});

/**
 * @type {Hapi.Lifecycle.Method}
 */
const httpAddNote = httpHandleError((req, h) => {
   let { title, tags, body } = req.payload;
   let currentDate           = (new Date()).toISOString();

   let id;
   do {
      id = randstr(16);
   } while(!notes.has(id));

   let newNote = {
      title, tags, body,
      createdAt : currentDate,
      updatedAt : currentDate
   }
   notes.set(id, newNote);

   let data = { data: { noteId: id } };
   return sendResponse(h, 'created', 201, 'Catatan berhasil dibuat.', data);
});

/**
 * @type {Hapi.Lifecycle.Method}
 */
const httpChangeNote = httpHandleError((req, h) => {
   let { id } = req.params;
   let { title, tags, body } = req.payload;

   if (!notes.has(id)) {
      let message = `Catatan dengan id ${id} tidak ditemukan.`
      return sendResponse(h, 'success', 400, message);
   }

   let note    = notes.get(id);
   let newNote = {
      title, tags, body,
      updatedAt : (new Date()).toISOString()
   }
   Object.assign(note, newNote);

   return sendResponse(h, 'success', 200, 'Catatan berhasil diubah.');
});

/**
 * @type {Hapi.Lifecycle.Method}
 */
const httpDeleteNote = httpHandleError((req, h) => {
   let { id } = req.params;
   if (notes.has(id)) {
      notes.delete(id);
   }
   return sendResponse(h, 'success', 200, 'Catatan berhasil dihapus.');
});

export {
   notes,
   httpGetNote,
   httpAddNote,
   httpChangeNote,
   httpDeleteNote
};