import { inngest } from "./client";
import prisma from "@/lib/prisma";

// CREATE USER
export const syncUserCreation = inngest.createFunction(
  { id: "clerk-user-create" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email_addresses[0].email_address,
        name: `${user.first_name} ${user.last_name}`,
        lastName: user.last_name,
        image: user.image_url,
      },
    });

    return "User created in DB.";
  }
);

// UPDATE USER
export const syncUserUpdation = inngest.createFunction(
  { id: "clerk-user-update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email_addresses[0].email_address,
        name: `${user.first_name} ${user.last_name}`,
        lastName: user.last_name,
        image: user.image_url,
      },
    });

    return "User updated in DB.";
  }
);

// DELETE USER
export const syncUserDeletion = inngest.createFunction(
  { id: "clerk-user-delete" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await prisma.user.delete({
      where: { id: event.data.id },
    });

    return "User deleted from DB.";
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];
