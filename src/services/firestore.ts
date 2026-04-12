import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Workout, WeightLog, MealLog, DailyMetrics, UserConfig } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

// User Management
export const createUserProfile = async (uid: string, username: string) => {
  const path = 'users';
  try {
    await setDoc(doc(db, path, uid), {
      uid,
      username: username.toLowerCase(),
      displayName: username,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

// Workouts
export const subscribeWorkouts = (userId: string, callback: (workouts: Workout[]) => void) => {
  const path = `users/${userId}/workouts`;
  const q = query(collection(db, path));
  return onSnapshot(q, (snapshot) => {
    const workouts = snapshot.docs.map(doc => doc.data() as Workout);
    callback(workouts);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const saveWorkout = async (workout: Workout) => {
  const path = `users/${workout.userId}/workouts`;
  try {
    await setDoc(doc(db, path, workout.id), workout);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteWorkout = async (userId: string, id: string) => {
  const path = `users/${userId}/workouts`;
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Weight Logs
export const subscribeWeightLogs = (userId: string, callback: (logs: WeightLog[]) => void) => {
  const path = `users/${userId}/weightLogs`;
  const q = query(collection(db, path));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => doc.data() as WeightLog);
    callback(logs);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const saveWeightLog = async (log: WeightLog) => {
  const path = `users/${log.userId}/weightLogs`;
  try {
    await setDoc(doc(db, path, log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Meal Logs
export const subscribeMealLogs = (userId: string, callback: (logs: MealLog[]) => void) => {
  const path = `users/${userId}/mealLogs`;
  const q = query(collection(db, path));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => doc.data() as MealLog);
    callback(logs);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const saveMealLog = async (log: MealLog) => {
  const path = `users/${log.userId}/mealLogs`;
  try {
    await setDoc(doc(db, path, log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Daily Metrics
export const subscribeDailyMetrics = (userId: string, callback: (metrics: DailyMetrics[]) => void) => {
  const path = `users/${userId}/dailyMetrics`;
  const q = query(collection(db, path));
  return onSnapshot(q, (snapshot) => {
    const metrics = snapshot.docs.map(doc => doc.data() as DailyMetrics);
    callback(metrics);
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const saveDailyMetrics = async (metrics: DailyMetrics) => {
  const path = `users/${metrics.userId}/dailyMetrics`;
  try {
    await setDoc(doc(db, path, metrics.id), metrics);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// User Config
export const subscribeUserConfig = (userId: string, callback: (config: UserConfig | null) => void) => {
  const path = `users/${userId}/config/settings`;
  return onSnapshot(doc(db, path), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserConfig);
    } else {
      callback(null);
    }
  }, (error) => handleFirestoreError(error, OperationType.GET, path));
};

export const saveUserConfig = async (config: UserConfig) => {
  const path = `users/${config.uid}/config/settings`;
  try {
    await setDoc(doc(db, path), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
