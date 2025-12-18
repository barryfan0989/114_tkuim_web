import { getCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export async function createParticipant({ name, email, phone, interests = [], ownerId, status = 'pending' }) {
  const collection = getCollection('participants');
  
  const doc = {
    name,
    email,
    phone,
    interests,
    ownerId: new ObjectId(ownerId),
    status,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function listParticipants() {
  const collection = getCollection('participants');
  return collection.find({}).toArray();
}

export async function listParticipantsByOwner(ownerId) {
  const collection = getCollection('participants');
  return collection.find({ ownerId: new ObjectId(ownerId) }).toArray();
}

export async function getParticipant(id) {
  const collection = getCollection('participants');
  
  try {
    return collection.findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

export async function updateParticipant(id, updates) {
  const collection = getCollection('participants');

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

export async function deleteParticipant(id) {
  const collection = getCollection('participants');

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

export async function findByEmail(email) {
  const collection = getCollection('participants');
  return collection.findOne({ email });
}

export function serializeParticipant(participant) {
  if (!participant) return null;

  return {
    id: participant._id?.toString?.(),
    name: participant.name,
    email: participant.email,
    phone: participant.phone,
    interests: participant.interests || [],
    status: participant.status,
    ownerId: participant.ownerId?.toString?.(),
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt
  };
}
