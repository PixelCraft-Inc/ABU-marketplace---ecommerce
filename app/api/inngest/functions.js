import { inngest } from "./client";
import prisma from "@/lib/prisma";

// Helper to extract email
async function getEmail(data) {
  if (!data) return null;
  if (data.email_addresses && data.email_addresses.length > 0) {
    return data.email_addresses[0].email_address;
  }
  if (data.primary_email_address_id && data.email_addresses) {
    const found = data.email_addresses.find(e => e.id === data.primary_email_address_id);
    if (found) return found.email_address;
  }
  if (data.email) return data.email;
  return null;
}

// CREATE USER
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "user.created" },
  async ({ event, step }) => {
    const data = event.data;
    const email = await getEmail(data);

    if (!email) {
      console.log("No email in payload for user.created", data);
      return { success: false, reason: "no email" };
    }

    const existing = await prisma.user.findUnique({ where: { id: data.id } });
    if (existing) {
      console.log("User already exists, skipping create", data.id);
      return { success: true, userId: data.id };
    }

    const user = await prisma.user.create({
      data: {
        id: data.id,
        email,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
        lastName: data.last_name || null,
        image: data.image_url || data.profile_image_url || null,
      }
    });

    console.log("Created user", user.id);
    return { success: true, userId: user.id };
  }
);

// UPDATE USER
export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "user.updated" },
  async ({ event }) => {
    const data = event.data;
    const email = await getEmail(data);

    const updateData = {};
    if (email) updateData.email = email;
    if (data.first_name || data.last_name) updateData.name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    if (data.image_url || data.profile_image_url) updateData.image = data.image_url || data.profile_image_url;
    if (data.last_name !== undefined) updateData.lastName = data.last_name;

    if (Object.keys(updateData).length === 0) {
      return { success: true, reason: "no changes" };
    }

    try {
      const updated = await prisma.user.update({ where: { id: data.id }, data: updateData });
      console.log("Updated user", updated.id);
      return { success: true, userId: updated.id };
    } catch (err) {
      console.error("Error updating user", err);
      throw err;
    }
  }
);

// DELETE USER
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "user.deleted" },
  async ({ event }) => {
    const id = event.data.id;
    try {
      await prisma.user.delete({ where: { id } });
      console.log("Deleted user", id);
      return { success: true, userId: id };
    } catch (err) {
      if (err.code === 'P2025') {
        console.log("User not found when deleting", id);
        return { success: true, userId: id };
      }
      console.error("Error deleting user", err);
      throw err;
    }
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];
