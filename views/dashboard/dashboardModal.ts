function initializeDashboardModals() {
  const createModal = document.getElementById('createFolderModal') as HTMLElement;
  const editModal = document.getElementById('editFolderModal') as HTMLElement;
  const deleteModal = document.getElementById('deleteFolderModal') as HTMLElement;
  const addNewBtn = document.getElementById('addNewBtn') as HTMLButtonElement;
  const closeCreateModalBtn = document.getElementById('closeCreateModal') as HTMLButtonElement;
  const closeBtns = document.querySelectorAll('.close-modal') as NodeListOf<HTMLButtonElement>;

  const editFolderForm = document.getElementById('editFolderForm') as HTMLFormElement;
  const editFolderNameInput = document.getElementById('editFolderName') as HTMLInputElement;
  const deleteFolderForm = document.getElementById('deleteFolderForm') as HTMLFormElement;
  const deleteFolderNameSpan = document.getElementById('deleteFolderName') as HTMLSpanElement;

  function closeModal(modal: HTMLElement) {
    modal.classList.add('hidden');
  }

  addNewBtn?.addEventListener('click', () => {
    createModal?.classList.remove('hidden');
  });

  closeCreateModalBtn?.addEventListener('click', () => {
    if (createModal) closeModal(createModal);
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (editModal) closeModal(editModal);
      if (deleteModal) closeModal(deleteModal);
    });
  });

  [createModal, editModal, deleteModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e: Event) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  document.querySelectorAll('.edit-folder-btn').forEach(btn => {
    btn.addEventListener('click', (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const folderId = target.dataset.folderId;
      const folderName = target.dataset.folderName;
      
      if (editFolderNameInput && folderName) {
        editFolderNameInput.value = folderName;
      }
      
      if (editFolderForm && folderId) {
        editFolderForm.action = `/folders/${folderId}?_method=PUT`;
      }
      
      editModal?.classList.remove('hidden');
    });
  });

  document.querySelectorAll('.delete-folder-btn').forEach(btn => {
    btn.addEventListener('click', (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const folderId = target.dataset.folderId;
      const folderName = target.dataset.folderName;
      
      if (deleteFolderNameSpan && folderName) {
        deleteFolderNameSpan.textContent = folderName;
      }
      
      if (deleteFolderForm && folderId) {
        deleteFolderForm.action = `/folders/${folderId}?_method=DELETE`;
      }
      
      deleteModal?.classList.remove('hidden');
    });
  });
}

document.addEventListener('DOMContentLoaded', initializeDashboardModals);
