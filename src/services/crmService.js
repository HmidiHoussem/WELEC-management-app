import { db } from '../config/firebase';
import { collection, adddoc, getdocs, doc, deleteDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';

// Helper alias for modern Firestore syntax
import { collection as col, addDoc as add, getDocs as get, deleteDoc as del, doc as document, query as qry, where as whr } from 'firebase/firestore';

// --- CONTACTS CRUD (Clients, Suppliers, Partners) ---

export async function getContactsByType(contactType) {
  try {
    const q = qry(col(db, 'contacts'), whr('type', '==', contactType));
    const snapshot = await get(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addContact(contactData) {
  try {
    const docRef = await add(col(db, 'contacts'), {
      ...contactData,
      totalOutstandingBalance: contactData.totalOutstandingBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: error.message };
  }
}

export async function deleteContact(contactId) {
  try {
    await del(document(db, 'contacts', contactId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// --- JOB LOGS SUB-COLLECTION CRUD ---

export async function getJobLogs(contactId) {
  try {
    const snapshot = await get(col(db, `contacts/${contactId}/jobLogs`));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addJobLog(contactId, jobData) {
  try {
    const docRef = await add(col(db, `contacts/${contactId}/jobLogs`), {
      ...jobData,
      clientId: contactId,
      date: jobData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}