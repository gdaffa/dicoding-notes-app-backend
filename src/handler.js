import Hapi from "@hapi/hapi";
import { randstr } from './utils.js';

// =============================================================================

/**
 * @type {Map<string, { title: string; tags: string[]; body: string; createdAt: string; updatedAt: string; }>}
 */
let notes = new Map();

// =============================================================================

/**
 * Get and transform `notes` from `Map` to list of `Object`. Each object contain
 * all note data, including key.
 */
function getNotesAsObject() {
   return [...notes].map(([ id, note ]) => ({ id, ...note }));
}

/**
 * Response generator shorthand.
 *
 * @param {Hapi.ResponseToolkit} h
 * @param {string} status
 * @param {number} code
 * @param {string} message
 * @param {object} data
 */
function sendResponse(h, status, code, message, data = {}) {
   let res = h.response({ status, code, message, ...data });
   res.code(code);
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
 * Handle HTTP request to get a single/all note(s).
 *
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
 * Handle HTTP request to add a new note.
 *
 * @type {Hapi.Lifecycle.Method}
 */
const httpAddNote = httpHandleError((req, h) => {
   let { title, tags, body } = req.payload;
   let currentDate           = (new Date()).toISOString();

   let id;
   do {
      id = randstr(16);
   } while(notes.has(id));

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
 * Handle HTTP request to edit a stored note.
 *
 * @type {Hapi.Lifecycle.Method}
 */
const httpEditNote = httpHandleError((req, h) => {
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
 * Handle HTTP request to delete a single note.
 *
 * @type {Hapi.Lifecycle.Method}
 */
const httpDeleteNote = httpHandleError((req, h) => {
   let { id } = req.params;
   if (notes.has(id)) {
      notes.delete(id);
   }
   return sendResponse(h, 'success', 200, 'Catatan berhasil dihapus.');
});

// =============================================================================

export {
   notes,
   httpGetNote,
   httpAddNote,
   httpEditNote,
   httpDeleteNote
};