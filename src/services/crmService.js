import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

// --- CONTACTS CRUD (Clients, Suppliers, Partners) ---

export async function getContactsByType(contactType) {
  try {
    const q = query(
      collection(db, "contacts"),
      where("type", "==", contactType),
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    return { success: true, data };
  } catch (error) {
    console.error("Error getting contacts:", error);
    return { success: false, error: error.message };
  }
}

// export async function addContact(contactData) {
//   try {
//     const docRef = await addDoc(collection(db, "contacts"), {
//       ...contactData,
//       totalOutstandingBalance: contactData.totalOutstandingBalance || 0,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error("Error adding contact:", error);
//     return { success: false, error: error.message };
//   }
// }
export async function addContact(contactData) {
  try {
    // Clean up object to remove any undefined fields (Firestore doesn't allow undefined)
    const cleanedData = Object.fromEntries(
      Object.entries(contactData).filter(
        ([_, v]) => v !== undefined && v !== null,
      ),
    );

    const docRef = await addDoc(collection(db, "contacts"), {
      ...cleanedData,
      totalOutstandingBalance: cleanedData.totalOutstandingBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding contact:", error);
    return { success: false, error: error.message };
  }
}

export async function updateContact(contactId, updatedData) {
  try {
    const docRef = doc(db, "contacts", contactId);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating contact:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteContact(contactId) {
  try {
    const docRef = doc(db, "contacts", contactId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { success: false, error: error.message };
  }
}

// --- JOB LOGS SUB-COLLECTION CRUD ---

export async function getJobLogs(contactId) {
  try {
    const snapshot = await getDocs(
      collection(db, `contacts/${contactId}/jobLogs`),
    );
    const data = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    return { success: true, data };
  } catch (error) {
    console.error("Error getting job logs:", error);
    return { success: false, error: error.message };
  }
}

export async function addJobLog(contactId, jobData) {
  try {
    const docRef = await addDoc(
      collection(db, `contacts/${contactId}/jobLogs`),
      {
        ...jobData,
        clientId: contactId,
        date: jobData.date || new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding job log:", error);
    return { success: false, error: error.message };
  }
}

export async function updateJobLog(contactId, jobId, updatedJobData) {
  try {
    const jobDocRef = doc(db, `contacts/${contactId}/jobLogs`, jobId);
    await updateDoc(jobDocRef, {
      ...updatedJobData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating job log:", error);
    return { success: false, error: error.message };
  }
}

// --- SUPPLIER RECEIPTS SUB-COLLECTION CRUD ---

export async function getSupplierReceipts(supplierId) {
  try {
    const snapshot = await getDocs(
      collection(db, `contacts/${supplierId}/receipts`),
    );
    const data = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    return { success: true, data };
  } catch (error) {
    console.error("Error getting receipts:", error);
    return { success: false, error: error.message };
  }
}

export async function addSupplierReceipt(supplierId, receiptData) {
  try {
    const docRef = await addDoc(
      collection(db, `contacts/${supplierId}/receipts`),
      {
        ...receiptData,
        supplierId,
        date: receiptData.date || new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding receipt:", error);
    return { success: false, error: error.message };
  }
}


// 

export async function updateSupplierReceipt(supplierId, receiptId, updatedReceiptData) {
  try {
    const receiptDocRef = doc(db, `contacts/${supplierId}/receipts`, receiptId);
    await updateDoc(receiptDocRef, {
      ...updatedReceiptData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating receipt:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSupplierReceipt(supplierId, receiptId) {
  try {
    const receiptDocRef = doc(db, `contacts/${supplierId}/receipts`, receiptId);
    await deleteDoc(receiptDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return { success: false, error: error.message };
  }
}

// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "../config/firebase";

// // Helper alias for modern Firestore syntax
// import {
//   addDoc as add,
//   collection as col,
//   deleteDoc as del,
//   doc as document,
//   getDocs as get,
//   query as qry,
//   where as whr,
// } from "firebase/firestore";

// // --- CONTACTS CRUD (Clients, Suppliers, Partners) ---

// export async function getContactsByType(contactType) {
//   try {
//     const q = qry(col(db, "contacts"), whr("type", "==", contactType));
//     const snapshot = await get(q);
//     const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return { success: true, data };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// export async function addContact(contactData) {
//   try {
//     const docRef = await add(col(db, "contacts"), {
//       ...contactData,
//       totalOutstandingBalance: contactData.totalOutstandingBalance || 0,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     return { success: error.message };
//   }
// }

// export async function deleteContact(contactId) {
//   try {
//     await del(document(db, "contacts", contactId));
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// // --- JOB LOGS SUB-COLLECTION CRUD ---

// export async function getJobLogs(contactId) {
//   try {
//     const snapshot = await get(col(db, `contacts/${contactId}/jobLogs`));
//     const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return { success: true, data };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// export async function addJobLog(contactId, jobData) {
//   try {
//     const docRef = await add(col(db, `contacts/${contactId}/jobLogs`), {
//       ...jobData,
//       clientId: contactId,
//       date: jobData.date || new Date().toISOString().split("T")[0],
//       createdAt: new Date().toISOString(),
//     });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// export async function updateContact(contactId, updatedData) {
//   try {
//     const docRef = doc(db, "contacts", contactId);
//     await updateDoc(docRef, {
//       ...updatedData,
//       updatedAt: new Date().toISOString(),
//     });
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// export async function updateJobLog(contactId, jobId, updatedJobData) {
//   try {
//     const jobDocRef = doc(db, `contacts/${contactId}/jobLogs`, jobId);
//     await updateDoc(jobDocRef, {
//       ...updatedJobData,
//       updatedAt: new Date().toISOString(),
//     });
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// // --- SUPPLIER RECEIPTS SUB-COLLECTION CRUD ---

// export async function getSupplierReceipts(supplierId) {
//   try {
//     const snapshot = await get(col(db, `contacts/${supplierId}/receipts`));
//     const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return { success: true, data };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }

// export async function addSupplierReceipt(supplierId, receiptData) {
//   try {
//     const docRef = await add(col(db, `contacts/${supplierId}/receipts`), {
//       ...receiptData,
//       supplierId,
//       date: receiptData.date || new Date().toISOString().split("T")[0],
//       createdAt: new Date().toISOString(),
//     });
//     return { success: true, id: docRef.id };
//   } catch (error) {
//     return { success: error.message };
//   }
// }
