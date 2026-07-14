const { Router } = require('express');
const prisma = require('../lib/prisma');
const cloudinary = require('cloudinary').v2;

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/', async (req, res) => {
  try {
    const { status, search, offset = 0, limit = 20, overdue } = req.query;

    const where = {};
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (overdue === 'true') {
      where.deadline = { lt: new Date() };
      where.status = 0;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { files: true },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { files: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, title, description, price, workPrice, paid, manager, startDate, deadline, files } = req.body;

    const order = await prisma.order.create({
      data: {
        code: code || null,
        title,
        description: description || null,
        price: price ? parseFloat(price) : null,
        workPrice: workPrice ? parseFloat(workPrice) : null,
        paid: paid || false,
        manager: manager || null,
        startDate: startDate ? new Date(startDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        status: 0,
        files: files?.length
          ? { create: files.map((f) => ({ publicId: f.publicId, url: f.url, format: f.format, size: f.size })) }
          : undefined,
      },
      include: { files: true },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { code, title, description, price, workPrice, paid, manager, startDate, deadline, status, files } = req.body;
    const id = parseInt(req.params.id);

    const updateData = {};
    if (code !== undefined) updateData.code = code || null;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (workPrice !== undefined) updateData.workPrice = workPrice ? parseFloat(workPrice) : null;
    if (paid !== undefined) updateData.paid = paid;
    if (manager !== undefined) updateData.manager = manager || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) updateData.status = parseInt(status);

    if (files) {
      const existing = await prisma.file.findMany({ where: { orderId: id } });
      const newPublicIds = files.map((f) => f.publicId);
      const toDelete = existing.filter((f) => !newPublicIds.includes(f.publicId));

      for (const file of toDelete) {
        try {
          await cloudinary.uploader.destroy(file.publicId);
        } catch (e) {
          console.error('Cloudinary delete error:', e.message);
        }
      }

      await prisma.file.deleteMany({ where: { orderId: id, publicId: { notIn: newPublicIds } } });

      const existingPublicIds = existing.map((f) => f.publicId);
      const toCreate = files.filter((f) => !existingPublicIds.includes(f.publicId));
      if (toCreate.length) {
        await prisma.file.createMany({
          data: toCreate.map((f) => ({ orderId: id, publicId: f.publicId, url: f.url, format: f.format, size: f.size })),
        });
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { files: true },
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const files = await prisma.file.findMany({ where: { orderId: id } });

    for (const file of files) {
      try {
        await cloudinary.uploader.destroy(file.publicId);
      } catch (e) {
        console.error('Cloudinary delete error:', e.message);
      }
    }

    await prisma.order.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!original) return res.status(404).json({ error: 'Order not found' });

    const duplicate = await prisma.order.create({
      data: {
        title: `${original.title} (копия)`,
        description: original.description,
        price: original.price,
        workPrice: original.workPrice,
        paid: original.paid,
        manager: original.manager,
        startDate: original.startDate,
        deadline: original.deadline,
        status: 0,
      },
      include: { files: true },
    });

    res.status(201).json(duplicate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to duplicate order' });
  }
});

module.exports = router;
