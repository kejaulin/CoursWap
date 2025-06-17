const Video = require('../models/Video');
const s3 = require('../services/s3Service');

exports.uploadVideo = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé' });
  const { title, category } = req.body;
  const video = new Video({
    title,
    key: req.file.key,
    url: req.file.location,
    owner: req.user._id,
    category
  });
  await video.save();
  res.status(201).json(video);
};

exports.listAllVideos = async (req, res) => {
  const videos = await Video.find().populate('owner', 'nom');
  res.json(videos);
};

exports.listUserVideos = async (req, res) => {
  const videos = await Video.find({ owner: req.params.userId }).populate('owner', 'nom');
  res.json(videos);
};

exports.listCategoryVideos = async (req, res) => {
  const videos = await Video.find({ category: req.params.category }).populate('owner', 'nom');
  res.json(videos);
};

exports.getVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo non trouvée' });
  res.json(video);
};

exports.streamVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo non trouvée' });
  const params = { Bucket: process.env.AWS_S3_BUCKET, Key: video.key };
  const stream = s3.getObject(params).createReadStream();
  res.setHeader('Content-Type', 'video/mp4');
  stream.pipe(res);
};

exports.deleteVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo non trouvée' });
  // Supprimer du S3
  await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: video.key }).promise();
  // Supprimer de MongoDB
  await video.deleteOne();
  res.json({ message: 'Vidéo supprimée' });
};