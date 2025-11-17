import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const payload = await req.json();
    const data = payload || {};

    const id = data.id;
    if (!id) return new Response('missing id', { status: 400 });

    // extract email robustly
    const getEmail = (d) => {
      if (!d) return null;
      if (d.email_addresses && d.email_addresses.length > 0) return d.email_addresses[0].email_address;
      if (d.emailAddresses && d.emailAddresses.length > 0) return d.emailAddresses[0].emailAddress;
      if (d.primary_email_address_id && d.email_addresses) {
        const found = d.email_addresses.find(e => e.id === d.primary_email_address_id);
        if (found) return found.email_address;
      }
      if (d.primaryEmailAddress && d.primaryEmailAddress.emailAddress) return d.primaryEmailAddress.emailAddress;
      if (d.email) return d.email;
      return null;
    };

    const email = getEmail(data);

    await prisma.user.upsert({
      where: { id },
      update: {
        email: email || undefined,
        name: data.first_name || data.firstName || data.name || null,
        lastName: data.last_name || data.lastName || null,
        image: data.image_url || data.imageUrl || null,
      },
      create: {
        id,
        email: email || 'unknown@example.com',
        name: data.first_name || data.firstName || data.name || null,
        lastName: data.last_name || data.lastName || null,
        image: data.image_url || data.imageUrl || null,
      }
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('sync user error', err);
    return new Response('server error', { status: 500 });
  }
}
