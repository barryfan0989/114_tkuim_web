import { getCollection } from '../db.js';

export async function findUserByEmail(email) {
  const collection = getCollection('users');
  return collection.findOne({ email });
}

export async function findUserById(id) {
  const collection = getCollection('users');
  const { ObjectId } = await import('mongodb');
  
  try {
    return collection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

export async function createUser({ email, passwordHash, role = 'student' }) {
  const collection = getCollection('users');
  const doc = { 
    email, 
    passwordHash, 
    role, 
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function listUsers() {
  const collection = getCollection('users');
  return collection.find({}).toArray();
}

export async function updateUser(id, updates) {
  const collection = getCollection('users');
  const { ObjectId } = await import('mongodb');
  
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  } catch {
    return false;
  }
}

export async function deleteUser(id) {
  const collection = getCollection('users');
  const { ObjectId } = await import('mongodb');
  
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

export async function userExists(email) {
  const user = await findUserByEmail(email);
  return !!user;
}
