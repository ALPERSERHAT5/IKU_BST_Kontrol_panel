export function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Sunucu hatası.',
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Kaynak bulunamadı.' });
}