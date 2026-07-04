//Enthält die API-Endpunkte für Notes backend
import { z } from "zod";
import { encryptNote, decryptNote } from "./crypto.js";
import { createNote, getNoteById, listNotes } from "./db.js";

const verifyNote = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  passphrase: z.string().min(1),
});

const decryptVerify = z.object({
  passphrase: z.string().min(1),
});

export async function routes(app) {
  app.get("/", async () => {
    return listNotes();
  });

  app.post("/", async (request, reply) => {
    const parsed = verifyNote.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: "error in request body" });
    }

    const { title, content, passphrase } = parsed.data;
    const encrypted = await encryptNote(content, passphrase);

    const note = await createNote({
      title,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      salt: encrypted.salt
    });

    return reply.code(201).send(note);
  });

  app.post("/:id", async (request, reply) => {                  
    const parsed = decryptVerify.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: "error in request body" });
    }

    const note = await getNoteById(request.params.id);

    if (!note) {
      return reply.code(404).send({ error: "Note not found" });
    }

    try {
      const content = await decryptNote(note, parsed.data.passphrase);
      return {
        id: note.id,
        title: note.title,
        content,
      };
    } catch {
      return reply.code(403).send({ error: "wrong decryption key" });
    }
  });
}
