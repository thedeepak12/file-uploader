function initializeFolderModals() {
  const addFileBtn = document.getElementById('addFileBtn');
  const uploadModal = document.getElementById('uploadFileModal');
  const closeUploadModal = document.getElementById('closeUploadModal');

  if (addFileBtn) {
    addFileBtn.addEventListener('click', () => {
      if (uploadModal) uploadModal.classList.remove('hidden');
    });
  }

  if (closeUploadModal) {
    closeUploadModal.addEventListener('click', () => {
      if (uploadModal) uploadModal.classList.add('hidden');
    });
  }

  if (uploadModal) {
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) {
        uploadModal.classList.add('hidden');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initializeFolderModals);
