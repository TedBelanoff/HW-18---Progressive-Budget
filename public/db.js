//This was all repurposed from Unit 17 Ex 26

let db;
// Create "budget" database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // Create Object Store
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // Check connection status
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // Create Transcation
  const transaction = db.transaction(["pending"], "readwrite");

  // Define Object Store
  const store = transaction.objectStore("pending");

  // Add record to store
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  // Access Object Store
  const store = transaction.objectStore("pending");
  // Write Full Object Store
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // Open/Create transaction
        const transaction = db.transaction(["pending"], "readwrite");

        // Access Object Store
        const store = transaction.objectStore("pending");

        // Clear Store
        store.clear();
      });
    }
  };
}

// If app comes back online, begin checking/posting process
window.addEventListener("online", checkDatabase);
