import serviceAccount from "../firebase-service-account.json";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export { admin };
