import { inngest } from "@/app/api/inngest/client";
import prisma from "@/lib/prisma";

// Helper to get email from primary_email_address_id if needed
async function getEmailAddress(data) {
  // First try the email_addresses array
  if (data.email_addresses && data.email_addresses.length > 0) {
    return data.email_addresses[0].email_address;
  }
  
  // If no email in array but has primary_email_address_id, 
  // we'll skip for now (Clerk should send it eventually)
  console.log("No email found in webhook payload");
  return null;
}

// Create User
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "user.created" },
  async ({ event, step }) => {
    const { data } = event;
    
    console.log("Received user.created event:", JSON.stringify(data, null, 2));

    const email = await getEmailAddress(data);
    
    if (!email) {
      console.log("No email available, skipping user creation for now");
      return { 
        success: false, 
        reason: "No email address in webhook payload",
        userId: data.id 
      };
    }

    try {
      await step.run("create-user-in-db", async () => {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
          where: { id: data.id }
        });

        if (existing) {
          console.log("User already exists:", data.id);
          return existing;
        }

        const user = await prisma.user.create({
          data: {
            id: data.id,
            email: email,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
            image: data.image_url || data.profile_image_url || null,
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
    
    console.log("Received user.updated event:", JSON.stringify(data, null, 2));

    try {
      await step.run("update-user-in-db", async () => {
        const email = await getEmailAddress(data);
        
        const updateData = {};
        
        if (email) updateData.email = email;
        if (data.first_name || data.last_name) {
          updateData.name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
        }
        if (data.image_url || data.profile_image_url) {
          updateData.image = data.image_url || data.profile_image_url;
        }
        if (data.last_name !== undefined) {
          updateData.lastName = data.last_name;
        }

        if (Object.keys(updateData).length === 0) {
          console.log("No fields to update");
          return null;
        }

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
      if (error.code === 'P2025') {
        console.log("User not found, already deleted");
        return { success: true, userId: data.id };
      }
      console.error("Error deleting user:", error);
      throw error;
    }
  }
);
