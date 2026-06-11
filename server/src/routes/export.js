const { Router } = require('express');
const { stringify } = require('csv-stringify/sync');
const prisma = require('../lib/prisma');

const router = Router();

router.get('/csv', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { files: true }, orderBy: { createdAt: 'desc' } });

    const rows = orders.map((o) => ({
      id: o.id,
      code: o.code || '',
      title: o.title,
      description: o.description || '',
      price: o.price ? parseFloat(o.price) : '',
      price_with_tax: o.price ? (parseFloat(o.price) * 1.04).toFixed(2) : '',
      deadline: o.deadline ? o.deadline.toISOString() : '',
      status: o.status === 0 ? 'В работе' : 'Готово',
      files: o.files.map((f) => f.url).join('; '),
      created_at: o.createdAt.toISOString(),
    }));

    const csv = stringify(rows, {
      header: true,
      columns: ['id', 'code', 'title', 'description', 'price', 'price_with_tax', 'deadline', 'status', 'files', 'created_at'],
      bom: true,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
