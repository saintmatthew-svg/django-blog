(function(){
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const toast = qs('#toast');
  const showToast = (msg, kind = 'info') => {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast show kind-${kind}`;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  };

  const state = {
    get base(){
      return (localStorage.getItem('API_BASE') || 'http://localhost:8000/blog/').replace(/\s+$/, '');
    },
    set base(v){
      localStorage.setItem('API_BASE', v);
      renderApiBase();
    }
  };

  function renderApiBase(){
    const el = qs('#currentApiBase');
    if (el) el.textContent = `Using: ${state.base}`;
    const input = qs('#apiBase');
    if (input && !input.value) input.value = state.base;
  }

  async function api(path, { method = 'GET', body, headers } = {}){
    const base = state.base.endsWith('/') ? state.base : state.base + '/';
    const url = base + path.replace(/^\//, '');
    const opts = { method, headers: headers || {} };
    if (body instanceof FormData) {
      opts.body = body;
    } else if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    let res;
    try { res = await fetch(url, opts); }
    catch (err) { throw new Error('Network/CORS error. Check API Base URL and server.'); }
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = typeof data === 'string' ? data : (data && (data.detail || data.message)) || res.statusText;
      throw new Error(`${res.status} ${msg}`);
    }
    return data;
  }

  // Posts API
  const Posts = {
    create: (payload) => api('create/', { method: 'POST', body: payload }),
    list: () => api('get/', { method: 'GET' }),
    byTitle: (title) => api(`getbytitle/${encodeURIComponent(title)}/`, { method: 'GET' }),
    byId: (id) => api(`getbyid/${Number(id)}/`, { method: 'GET' }),
    updateById: async (id, payload) => {
      try { return await api(`updatebyid/${Number(id)}/`, { method: 'PUT', body: payload }); }
      catch (e) { return api(`updatebyid/${Number(id)}/`, { method: 'POST', body: payload }); }
    },
    updateByTitle: async (title, payload) => {
      try { return await api(`updatebytitle/${encodeURIComponent(title)}/`, { method: 'PUT', body: payload }); }
      catch (e) { return api(`updatebytitle/${encodeURIComponent(title)}/`, { method: 'POST', body: payload }); }
    },
    deleteById: (id) => api(`delete/${Number(id)}/`, { method: 'DELETE' }),
    deleteByTitle: (title) => api(`deletebytitle/${encodeURIComponent(title)}/`, { method: 'DELETE' }),
  };

  // Comments API
  const Comments = {
    add: (postId, payload) => api(`comment/${Number(postId)}/`, { method: 'POST', body: payload }),
    list: (postId) => api(`getcomments/${Number(postId)}/`, { method: 'GET' }),
    delete: (postId, commentId) => api(`deletecomment/${Number(postId)}/${Number(commentId)}/`, { method: 'DELETE' }),
  };

  // Rendering helpers
  function asText(value){
    if (value == null) return '';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  function mediaHtml(url){
    if (!url || !/^https?:/i.test(url)) return '';
    const lower = String(url).toLowerCase();
    if (/(\.mp4|\.webm|\.ogg)(\?|$)/.test(lower)) {
      return `<video class="media-element" controls src="${escapeHtml(url)}"></video>`;
    }
    if (/(\.png|\.jpe?g|\.gif|\.webp|\.svg)(\?|$)/.test(lower)) {
      return `<img class="media-element" src="${escapeHtml(url)}" alt="">`;
    }
    return `<a class="muted" href="${escapeHtml(url)}" target="_blank" rel="noopener">Open media</a>`;
  }

  function renderPostItem(post){
    const id = post.id ?? post.pk ?? post.post_id ?? '';
    const title = post.title ?? post.name ?? `Post ${id}`;
    const content = post.content ?? post.body ?? post.text ?? '';
    const li = document.createElement('li');
    li.className = 'card';
    const parts = [];
    if (post.image) parts.push(`<div class="media">${mediaHtml(post.image)}</div>`);
    if (post.video) parts.push(`<div class="media">${mediaHtml(post.video)}</div>`);
    li.innerHTML = `<strong>${escapeHtml(title)}</strong>${id !== '' ? ` <span class="muted">#${id}</span>`: ''}
      <div>${escapeHtml(String(content)).replace(/\n/g,'<br>')}</div>
      ${parts.join('')}`;
    return li;
  }

  function renderPosts(list){
    const ul = qs('#postsList');
    if (!ul) return;
    ul.innerHTML = '';
    if (!list || (Array.isArray(list) && list.length === 0)){
      const li = document.createElement('li');
      li.className = 'muted';
      li.textContent = 'No posts yet.';
      ul.appendChild(li);
      return;
    }
    const items = Array.isArray(list) ? list : (list.results || []);
    items.forEach(p => ul.appendChild(renderPostItem(p)));
  }

  function renderSinglePost(post){
    const box = qs('#singlePost');
    if (!box) return;
    if (!post){ box.innerHTML = ''; return; }
    const id = post.id ?? post.pk ?? post.post_id ?? '';
    const title = post.title ?? post.name ?? `Post ${id}`;
    const content = post.content ?? post.body ?? post.text ?? '';
    const mediaParts = [];
    if (post.image) mediaParts.push(`<div class="media">${mediaHtml(post.image)}</div>`);
    if (post.video) mediaParts.push(`<div class="media">${mediaHtml(post.video)}</div>`);
    box.innerHTML = `<h4 class="card-title">${escapeHtml(title)}${id !== '' ? ` <span class="muted">#${id}</span>`: ''}</h4>
      <pre class="preformatted">${escapeHtml(asText(content))}</pre>
      ${mediaParts.join('')}`;
  }

  function renderComments(list){
    const ul = qs('#commentsList');
    if (!ul) return;
    ul.innerHTML = '';
    if (!list || (Array.isArray(list) && list.length === 0)){
      const li = document.createElement('li');
      li.className = 'muted';
      li.textContent = 'No comments.';
      ul.appendChild(li);
      return;
    }
    const items = Array.isArray(list) ? list : (list.results || list.comments || []);
    items.forEach(c => {
      const id = c.id ?? c.pk ?? c.comment_id ?? '';
      const text = c.comment ?? c.text ?? c.body ?? c.content ?? '';
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `${id !== '' ? `<span class="muted">#${id}</span> `: ''}<div>${escapeHtml(String(text)).replace(/\n/g,'<br>')}</div>`;
      ul.appendChild(li);
    });
  }

  function escapeHtml(str){
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  // Event bindings
  function showView(name){
    const feed = qs('#feedView');
    const create = qs('#createView');
    if (name === 'create'){
      if (feed) feed.hidden = true;
      if (create) create.hidden = false;
    } else {
      if (feed) feed.hidden = false;
      if (create) create.hidden = true;
    }
  }

  function bindEvents(){
    const saveBtn = qs('#saveApiBase');
    const apiInput = qs('#apiBase');
    if (saveBtn && apiInput){
      saveBtn.addEventListener('click', () => {
        const v = apiInput.value.trim();
        if (!v){ showToast('Enter API base URL'); return; }
        state.base = v.endsWith('/') ? v : v + '/';
        showToast('API base saved');
        loadPosts();
      });
    }

    const refreshBtn = qs('#refreshPosts');
    if (refreshBtn){
      refreshBtn.addEventListener('click', loadPosts);
    }

    const openCreateBtn = qs('#openCreateBtn');
    if (openCreateBtn){
      openCreateBtn.addEventListener('click', () => showView('create'));
    }
    const backToFeedBtn = qs('#backToFeedBtn');
    if (backToFeedBtn){
      backToFeedBtn.addEventListener('click', () => showView('feed'));
    }

    const createForm = qs('#createPostForm');
    if (createForm){
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = qs('#createTitle').value.trim();
        const content = qs('#createContent').value.trim();
        const imageFile = qs('#createImage') ? qs('#createImage').files[0] : null;
        const videoFile = qs('#createVideo') ? qs('#createVideo').files[0] : null;
        if (!title && !content && !imageFile && !videoFile){ showToast('Add text or media','warn'); return; }
        try {
          const fd = new FormData();
          if (title) fd.append('title', title);
          if (content) fd.append('content', content);
          if (imageFile) fd.append('image', imageFile);
          if (videoFile) fd.append('video', videoFile);
          await Posts.create(fd);
          showToast('Post created','success');
          createForm.reset();
          loadPosts();
        } catch (err){ showToast(err.message || 'Create failed','error'); }
      });
    }

    const findByIdForm = qs('#findByIdForm');
    if (findByIdForm){
      findByIdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = qs('#findId').value;
        try { const p = await Posts.byId(id); renderSinglePost(p); showToast('Loaded post'); }
        catch (err){ renderSinglePost(null); showToast(err.message || 'Not found','error'); }
      });
    }

    const findByTitleForm = qs('#findByTitleForm');
    if (findByTitleForm){
      findByTitleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const t = qs('#findTitle').value.trim();
        try { const p = await Posts.byTitle(t); renderSinglePost(p); showToast('Loaded post'); }
        catch (err){ renderSinglePost(null); showToast(err.message || 'Not found','error'); }
      });
    }

    const updateByIdForm = qs('#updateByIdForm');
    if (updateByIdForm){
      updateByIdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = qs('#updateId').value;
        const title = qs('#updateTitle').value.trim();
        const content = qs('#updateContent').value.trim();
        const imageFile = qs('#updateImage') ? qs('#updateImage').files[0] : null;
        const videoFile = qs('#updateVideo') ? qs('#updateVideo').files[0] : null;
        let body;
        if (imageFile || videoFile){
          const fd = new FormData();
          if (title) fd.append('title', title);
          if (content) fd.append('content', content);
          if (imageFile) fd.append('image', imageFile);
          if (videoFile) fd.append('video', videoFile);
          body = fd;
        } else {
          const payload = {};
          if (title) payload.title = title;
          if (content) payload.content = content;
          if (!Object.keys(payload).length){ showToast('Provide new content or media','warn'); return; }
          body = payload;
        }
        try { await Posts.updateById(id, body); showToast('Updated','success'); loadPosts(); }
        catch (err){ showToast(err.message || 'Update failed','error'); }
      });
    }

    const updateByTitleForm = qs('#updateByTitleForm');
    if (updateByTitleForm){
      updateByTitleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const key = qs('#updateByTitleKey').value.trim();
        const newTitle = qs('#updateByTitleNew').value.trim();
        const content = qs('#updateByTitleContent').value.trim();
        const payload = {};
        if (newTitle) payload.title = newTitle;
        if (content) payload.content = content;
        if (!Object.keys(payload).length){ showToast('Provide a new title or content','warn'); return; }
        try { await Posts.updateByTitle(key, payload); showToast('Updated','success'); loadPosts(); }
        catch (err){ showToast(err.message || 'Update failed','error'); }
      });
    }

    const deleteByIdForm = qs('#deleteByIdForm');
    if (deleteByIdForm){
      deleteByIdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = qs('#deleteId').value;
        if (!confirm(`Delete post #${id}?`)) return;
        try { await Posts.deleteById(id); showToast('Deleted','success'); loadPosts(); }
        catch (err){ showToast(err.message || 'Delete failed','error'); }
      });
    }

    const deleteByTitleForm = qs('#deleteByTitleForm');
    if (deleteByTitleForm){
      deleteByTitleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const t = qs('#deleteTitle').value.trim();
        if (!confirm(`Delete post titled "${t}"?`)) return;
        try { await Posts.deleteByTitle(t); showToast('Deleted','success'); loadPosts(); }
        catch (err){ showToast(err.message || 'Delete failed','error'); }
      });
    }

    const loadCommentsForm = qs('#loadCommentsForm');
    if (loadCommentsForm){
      loadCommentsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = qs('#commentsPostId').value;
        try { const list = await Comments.list(id); renderComments(list); showToast('Comments loaded'); }
        catch (err){ renderComments([]); showToast(err.message || 'Load failed','error'); }
      });
    }

    const addCommentForm = qs('#addCommentForm');
    if (addCommentForm){
      addCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = qs('#addCommentPostId').value;
        const text = qs('#commentText').value.trim();
        if (!text){ showToast('Enter a comment','warn'); return; }
        try {
          await Comments.add(id, { post: Number(id), comment: text });
          showToast('Comment added','success');
          addCommentForm.reset();
          const list = await Comments.list(id);
          renderComments(list);
        } catch (err){ showToast(err.message || 'Add failed','error'); }
      });
    }

    const deleteCommentForm = qs('#deleteCommentForm');
    if (deleteCommentForm){
      deleteCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const postId = qs('#deleteCommentPostId').value;
        const commentId = qs('#deleteCommentId').value;
        if (!confirm(`Delete comment #${commentId} on post #${postId}?`)) return;
        try { await Comments.delete(postId, commentId); showToast('Comment deleted','success'); const list = await Comments.list(postId); renderComments(list); }
        catch (err){ showToast(err.message || 'Delete failed','error'); }
      });
    }
  }

  async function loadPosts(){
    const ul = qs('#postsList');
    if (ul){
      ul.innerHTML = '';
      const li = document.createElement('li');
      li.className = 'muted';
      li.textContent = 'Loading posts…';
      ul.appendChild(li);
    }
    try {
      const list = await Posts.list();
      renderPosts(list);
    } catch (err){
      renderPosts([]);
      showToast(err.message || 'Failed to load posts','error');
    }
  }

  function init(){
    renderApiBase();
    bindEvents();
    showView(location.hash === '#create' ? 'create' : 'feed');
    loadPosts();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
