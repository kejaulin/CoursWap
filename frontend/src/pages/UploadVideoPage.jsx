import React, { useState, useEffect } from 'react';
import { useAuth } from '../component/AuthProvider'; 

function UploadVideoPage() {
  const { user } = useAuth(); 
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  

  useEffect(() => {
          fetch('/api/courses')
              .then(res => res.json())
              .then(data => setAllCourses(data.allCourses));
      }, []);

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', videoTitle);
      formData.append('category', videoCategory);

      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (res.ok) {
        setUploadSuccess('Vidéo envoyée avec succès !');
        setVideoFile(null);
        setVideoTitle('');
        setVideoCategory('');
        fetch(`/api/videos/user/${user._id}`)
          .then(res => res.json())
          .then(setMyVideos);
      } else {
        const err = await res.json();
        setUploadError(err.error || 'Erreur lors de l\'upload');
      }
    } catch {
      setUploadError('Erreur réseau');
    }
    setUploading(false);
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-2 text-purple-700">Uploader une vidéo</h3>
      <form onSubmit={handleVideoUpload} className="flex flex-col gap-2 mb-4">
        <input
          type="file"
          accept="video/*"
          onChange={e => setVideoFile(e.target.files[0])}
          required
        />
        <input
          type="text"
          placeholder="Titre de la vidéo"
          value={videoTitle}
          onChange={e => setVideoTitle(e.target.value)}
          className="border rounded-lg p-2"
          required
        />
        
        <div>
                                <label className="block font-semibold">Catégorie de la vidéo</label>
                                <select
                                    value={videoCategory}
                                    onChange={e => setVideoCategory(e.target.value)}
                                    className="border rounded-lg p-2 w-full text-white bg-transparent"
                                    required>
                                    <option value="" className="text-black">Choisir une catégorie</option>
                                    {allCourses.map(course => (
                                        <option key={course} value={course} className="text-black">
                                            {course}
                                        </option>
                                    ))}
                                </select>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-purple-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-600"
        >
          {uploading ? "Envoi..." : "Envoyer"}
        </button>
        {uploadError && <div className="text-red-500">{uploadError}</div>}
        {uploadSuccess && <div className="text-green-600">{uploadSuccess}</div>}
      </form>
      
    </div>
  );
}

export default UploadVideoPage;
