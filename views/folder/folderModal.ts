function initializeFolderModals() {
  const addFileBtn = document.getElementById('addFileBtn');
  const uploadModal = document.getElementById('uploadFileModal');
  const closeUploadModal = document.getElementById('closeUploadModal');
  const deleteFileModal = document.getElementById('deleteFileModal');
  const deleteFileForm = document.getElementById('deleteFileForm') as HTMLFormElement;
  const deleteFileNameSpan = document.getElementById('deleteFileName');
  const closeModalBtns = document.querySelectorAll('.close-modal');

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

  if (deleteFileModal) {
    deleteFileModal.addEventListener('click', (e) => {
      if (e.target === deleteFileModal) {
        deleteFileModal.classList.add('hidden');
      }
    });
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (uploadModal) uploadModal.classList.add('hidden');
      if (deleteFileModal) deleteFileModal.classList.add('hidden');
    });
  });

  document.querySelectorAll('.download-file-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const fileId = target.dataset.fileId;

      if (fileId) {
        const link = document.createElement('a');
        link.href = `/files/${fileId}/download`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  });

  document.querySelectorAll('.delete-file-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const fileId = target.dataset.fileId;
      const fileName = target.dataset.fileName;
      
      if (deleteFileNameSpan && fileName) {
        deleteFileNameSpan.textContent = fileName;
      }
      
      if (deleteFileForm && fileId) {
        deleteFileForm.action = `/files/${fileId}?_method=DELETE`;
      }
      
      deleteFileModal?.classList.remove('hidden');
    });
  });
}

document.addEventListener('DOMContentLoaded', initializeFolderModals);
