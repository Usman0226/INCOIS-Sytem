async function serveReports(req, res) {
  try {
    const items = await Report.find({})
      .sort({ createdAt: -1 })
      .lean();

    // change this to absolute path (Over here..........)
    const mapped = items.map((r) => ({
      _id: r._id,
      text: r.text,
      lat: r.lat,
      lon: r.lon,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      image_url: Array.isArray(r.image_url)
        ? r.image_url.map((f) => `${req.protocol}://${req.get('host')}/uploads/${f}`)
        : [],
      video_url: Array.isArray(r.video_url)
        ? r.video_url.map((f) => `${req.protocol}://${req.get('host')}/uploads/${f}`)
        : [],
    }));

    return res.json({ data: mapped });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return res.status(500).json({ message: 'Failed to fetch reports' });
  }
}

module.exports = serveReports;
