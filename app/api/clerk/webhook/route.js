import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const payload = await req.json();

    // Clerk event payloads vary. Common event names: "user.created", "user.updated", "user.deleted"
    // If your Clerk instance prefixes them, adjust accordingly.
    const event = payload.type || payload.name || payload.event || payload.eventType;
    const data = payload.data || payload.user || payload;

    console.log('Clerk webhook received:', event);

    if (!event) {
      return new Response('Missing event type', { status: 400 });
    }

    // Helper to get email
    function getEmail(d) {
      if (!d) return null;
      if (d.email_addresses && d.email_addresses.length > 0) return d.email_addresses[0].email_address;
      if (d.email) return d.email;
      if (d.primary_email_address_id && d.email_addresses) {
        const found = d.email_addresses.find(e => e.id === d.primary_email_address_id);
        if (found) return found.email_address;
      }
      return null;
    }

    if (event.endsWith('user.created') || event === 'user.created') {
      const email = getEmail(data);
      if (!email) return new Response('No email in payload', { status: 200 });

      // upsert to avoid duplicates
      await prisma.user.upsert({
        where: { id: data.id },
        update: {
          email,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
          lastName: data.last_name || null,
          image: data.image_url || data.profile_image_url || null,
        },
        create: {
          id: data.id,
          email,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
          lastName: data.last_name || null,
          image: data.image_url || data.profile_image_url || null,
        }
      });

      return new Response('ok', { status: 200 });
    }

    if (event.endsWith('user.updated') || event === 'user.updated') {
      const email = getEmail(data);
      const updateData = {};
      if (email) updateData.email = email;
      if (data.first_name || data.last_name) updateData.name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      if (data.image_url || data.profile_image_url) updateData.image = data.image_url || data.profile_image_url;
      if (data.last_name !== undefined) updateData.lastName = data.last_name;

      try {
        await prisma.user.update({ where: { id: data.id }, data: updateData });
      } catch (err) {
        // If user not found, create
        if (err.code === 'P2025') {
          await prisma.user.create({
            data: {
              id: data.id,
              email: email || 'unknown@example.com',
              name: updateData.name || null,
              lastName: data.last_name || null,
              image: updateData.image || null,
            }
          });
        } else {
          console.error('Error updating user from Clerk webhook', err);
          throw err;
        }
      }

      return new Response('ok', { status: 200 });
    }

    if (event.endsWith('user.deleted') || event === 'user.deleted') {
      try {
        await prisma.user.delete({ where: { id: data.id } });
      } catch (err) {
        // ignore not found
        if (err.code !== 'P2025') {
          console.error('Error deleting user from Clerk webhook', err);
          throw err;
        }
      }
      return new Response('ok', { status: 200 });
    }

    // Unknown event
    return new Response('unhandled', { status: 200 });
  } catch (err) {
    console.error('Clerk webhook handler error', err);
    return new Response('server error', { status: 500 });
  }
}
