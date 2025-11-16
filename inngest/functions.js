import { inngest } from "@/app/api/inngest/client";
import prisma from "@/lib/prisma";

// Create User
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "user.created" },
  async ({ event, step }) => {
    const { data } = event;
    
    console.log("Received user.created event:", JSON.stringify(data));

    // Check if we have an email
    if (!data.email_addresses || data.email_addresses.length === 0) {
      console.log("No email addresses found, skipping user creation");
      return { success: false, reason: "No email address provided" };
    }

    try {
      await step.run("create-user-in-db", async () => {
        const user = await prisma.user.create({
          data: {
            id: data.id,
            email: data.email_addresses[0].email_address,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
            image: data.image_url || data.profile_image_url,
            lastName: data.last_name || null,
          },
        });
        
        console.log("User created successfully:", user.id);
        return user;
      });

      return { success: true, userId: data.id };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
);

// Update User
export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "user.updated" },
  async ({ event, step }) => {
    const { data } = event;
    
    console.log("Received user.updated event:", JSON.stringify(data));

    try {
      await step.run("update-user-in-db", async () => {
        // Prepare update data, only including fields that exist
        const updateData = {
          ...(data.email_addresses && data.email_addresses.length > 0 && {
            email: data.email_addresses[0].email_address
          }),
          ...(data.first_name || data.last_name) && {
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
          },
          ...(data.image_url || data.profile_image_url) && {
            image: data.image_url || data.profile_image_url
          },
          ...(data.last_name !== undefined && {
            lastName: data.last_name
          }),
        };

        const user = await prisma.user.update({
          where: { id: data.id },
          data: updateData,
        });
        
        console.log("User updated successfully:", user.id);
        return user;
      });

      return { success: true, userId: data.id };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
);

// Delete User
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "user.deleted" },
  async ({ event, step }) => {
    const { data } = event;
    
    console.log("Received user.deleted event:", data.id);

    try {
      await step.run("delete-user-from-db", async () => {
        const user = await prisma.user.delete({
          where: { id: data.id },
        });
        
        console.log("User deleted successfully:", user.id);
        return user;
      });

      return { success: true, userId: data.id };
    } catch (error) {
      // If user doesn't exist, that's okay for deletion
      if (error.code === 'P2025') {
        console.log("User not found, already deleted");
        return { success: true, userId: data.id, note: "User already deleted" };
      }
      console.error("Error deleting user:", error);
      throw error;
    }
  }
);
