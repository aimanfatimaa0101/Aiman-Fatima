// ============================================================
// InkWell Blog App - Frontend JavaScript
// ============================================================

const API_BASE = 'http://localhost:5000/api';
const CATEGORIES = ['All','Technology','Travel','Food','Lifestyle','Business','Health','Education','Entertainment','Other'];

let state = {
  currentPage: 'home',
  posts: [],
  pagination: {},
  currentCategory: 'All',
  searchQuery: '',
  page: 1,
  deleteTarget: null,
  userId: localStorage.getItem('userId') || ('user_' + Math.random().toString(36).substr(2, 9))
};

localStorage.setItem('userId', state.userId);

// ===== NAVIGATION =====
function navigate(page, id = null) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.navbar-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  state.currentPage = page;
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'home') loadPosts();
  else if (page === 'detail' && id) loadDetail(id);
  else if (page === 'create') setupCreateForm();
  else if (page === 'admin') loadAdmin();
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

function scrollToBlogs() {
  document.getElementById('blogsSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== API HELPERS =====
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// ===== TOAST =====
function showToast(message, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      ${type === 'success' ? '<polyline points="20,6 9,17 4,12"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    ${message}
  `;
  wrap.appendChild(toast);
  setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ===== MODAL =====
function showDeleteModal(id) {
  state.deleteTarget = id;
  document.getElementById('deleteModal').classList.add('open');
}
function closeModal() {
  document.getElementById('deleteModal').classList.remove('open');
  state.deleteTarget = null;
}
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!state.deleteTarget) return;
  try {
    await apiFetch(`/posts/${state.deleteTarget}`, { method: 'DELETE' });
    closeModal();
    showToast('Post deleted successfully');
    if (state.currentPage === 'admin') loadAdmin();
    else loadPosts();
  } catch (e) { showToast(e.message, 'error'); }
});
document.getElementById('deleteModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ===== CATEGORY FILTERS =====
function renderCategoryFilters() {
  const wrap = document.getElementById('categoryFilters');
  wrap.innerHTML = CATEGORIES.map(c => `
    <button class="filter-btn ${c === state.currentCategory ? 'active' : ''}"
      onclick="setCategory('${c}')">${c}</button>
  `).join('');
}

function setCategory(cat) {
  state.currentCategory = cat;
  state.page = 1;
  renderCategoryFilters();
  loadPosts();
}

// ===== FOOTER CATEGORIES =====
function renderFooterCategories() {
  const el = document.getElementById('footerCategories');
  if (el) el.innerHTML = CATEGORIES.filter(c => c !== 'All').slice(0,6).map(c =>
    `<li><a onclick="setCategory('${c}');navigate('home')">${c}</a></li>`
  ).join('');
}

// ===== SEARCH =====
let searchTimer;
function debounceSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.searchQuery = val; state.page = 1; loadPosts(); }, 400);
}
function doSearch() {
  state.searchQuery = document.getElementById('searchInput').value;
  state.page = 1;
  loadPosts();
}

// ===== LOAD POSTS =====
async function loadPosts() {
  const grid = document.getElementById('postsGrid');
  const featured = document.getElementById('featuredSection');
  grid.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
  if (featured) featured.innerHTML = '';

  try {
    const params = new URLSearchParams({
      page: state.page, limit: 9,
      ...(state.searchQuery && { search: state.searchQuery }),
      ...(state.currentCategory !== 'All' && { category: state.currentCategory })
    });
    const data = await apiFetch(`/posts?${params}`);
    state.posts = data.data;
    state.pagination = data.pagination;

    // Stats
    updateHeroStats(data.pagination.total, state.posts);

    // Featured (only on first page, no search/filter)
    if (state.page === 1 && !state.searchQuery && state.currentCategory === 'All' && state.posts.length > 0) {
      renderFeatured(state.posts[0]);
      renderGrid(state.posts.slice(1));
    } else {
      renderGrid(state.posts);
    }

    renderPagination();
    updateResultsInfo();
  } catch (e) {
    grid.innerHTML = `<div class="empty-state"><h3>Could not load posts</h3><p>Make sure the backend server is running on port 5000.</p><button class="btn btn-primary" onclick="loadPosts()" style="margin-top:1rem">Retry</button></div>`;
  }
}

function updateHeroStats(total, posts) {
  document.getElementById('statPosts').textContent = total;
  const views = posts.reduce((a, p) => a + (p.views || 0), 0);
  const likes = posts.reduce((a, p) => a + (p.likes || 0), 0);
  document.getElementById('statViews').textContent = views > 999 ? (views/1000).toFixed(1)+'k' : views;
  document.getElementById('statLikes').textContent = likes;
}

function updateResultsInfo() {
  const el = document.getElementById('resultsInfo');
  const { total, page, pages } = state.pagination;
  el.textContent = total ? `${total} post${total !== 1 ? 's' : ''} found` : '';
}

function renderFeatured(post) {
  const el = document.getElementById('featuredSection');
  const img = post.featuredImage || getPlaceholderImg(post.category);
  el.innerHTML = `
    <div class="featured-post" onclick="navigate('detail', '${post._id}')">
      <img src="${img}" alt="${escHtml(post.title)}" class="featured-post-img" onerror="this.src='${getPlaceholderImg(post.category)}'">
      <div class="featured-body">
        <span class="featured-label">✦ Featured Post</span>
        <h2 class="featured-title">${escHtml(post.title)}</h2>
        <p class="featured-desc">${escHtml(post.description)}</p>
        <div style="display:flex;align-items:center;gap:1rem;font-size:.83rem;color:var(--text-muted)">
          <span>${escHtml(post.author)}</span>
          <span>·</span>
          <span>${formatDate(post.createdAt)}</span>
          <span>·</span>
          <span class="card-category">${post.category}</span>
        </div>
        <button class="btn btn-outline btn-sm" style="align-self:flex-start;margin-top:.5rem" onclick="event.stopPropagation();navigate('detail','${post._id}')">Read More →</button>
      </div>
    </div>
  `;
}

function renderGrid(posts) {
  const grid = document.getElementById('postsGrid');
  if (!posts.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
      <h3>No posts found</h3>
      <p>Try a different search or category</p>
    </div>`;
    return;
  }
  grid.innerHTML = posts.map((p, i) => renderCard(p, i)).join('');
}

function renderCard(post, delay = 0) {
  const img = post.featuredImage || getPlaceholderImg(post.category);
  const liked = (post.likedBy || []).includes(state.userId);
  return `
    <article class="card" style="animation-delay:${delay * 0.05}s">
      <div class="card-img-wrap" onclick="navigate('detail', '${post._id}')">
        <img src="${img}" alt="${escHtml(post.title)}" class="card-img" onerror="this.src='${getPlaceholderImg(post.category)}'">
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-category">${post.category}</span>
          <span>${formatDate(post.createdAt)}</span>
        </div>
        <h3 class="card-title" onclick="navigate('detail', '${post._id}')">${escHtml(post.title)}</h3>
        <p class="card-desc">${escHtml(post.description)}</p>
      </div>
      <div class="card-footer">
        <div class="card-author">
          <div class="author-avatar">${post.author.charAt(0).toUpperCase()}</div>
          <span>${escHtml(post.author)}</span>
        </div>
        <div class="card-actions">
          <button class="like-btn ${liked ? 'liked' : ''}" onclick="likePost('${post._id}', this)">
            <svg width="14" height="14" fill="${liked ? '#ef4444' : 'none'}" stroke="${liked ? '#ef4444' : 'currentColor'}" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            ${post.likes || 0}
          </button>
          <span style="display:flex;align-items:center;gap:4px">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ${(post.views || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  `;
}

// ===== PAGINATION =====
function renderPagination() {
  const { page, pages } = state.pagination;
  const el = document.getElementById('pagination');
  if (!pages || pages <= 1) { el.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goPage(${page - 1})" ${page <= 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    } else if (Math.abs(i - page) === 2) {
      html += `<span style="padding:.5rem .25rem;color:var(--text-muted)">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="goPage(${page + 1})" ${page >= pages ? 'disabled' : ''}>›</button>`;
  el.innerHTML = html;
}

function goPage(p) {
  if (p < 1 || p > state.pagination.pages) return;
  state.page = p;
  loadPosts();
  document.getElementById('blogsSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== LIKE =====
async function likePost(id, btn) {
  try {
    const data = await apiFetch(`/posts/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId: state.userId })
    });
    btn.classList.toggle('liked', data.liked);
    const svg = btn.querySelector('svg');
    svg.setAttribute('fill', data.liked ? '#ef4444' : 'none');
    svg.setAttribute('stroke', data.liked ? '#ef4444' : 'currentColor');
    btn.childNodes[btn.childNodes.length - 1].textContent = ' ' + data.likes;
  } catch (e) { showToast('Could not like post', 'error'); }
}

// ===== DETAIL PAGE =====
async function loadDetail(id) {
  const el = document.getElementById('detailContent');
  el.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';

  try {
    const [postData, commentsData] = await Promise.all([
      apiFetch(`/posts/id/${id}`),
      apiFetch(`/comments/${id}`)
    ]);
    const post = postData.data;
    const comments = commentsData.data || [];

    const img = post.featuredImage || '';
    const liked = (post.likedBy || []).includes(state.userId);
    const tagsHtml = (post.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('');

    el.innerHTML = `
      <div class="detail-hero">
        <div class="detail-hero-inner">
          <span class="detail-category" onclick="setCategory('${post.category}');navigate('home')">${post.category}</span>
          <h1 class="detail-title">${escHtml(post.title)}</h1>
          <div class="detail-meta">
            <div class="detail-author-wrap">
              <div class="detail-author-avatar">${post.author.charAt(0).toUpperCase()}</div>
              <div>
                <div style="font-weight:600;color:white;font-size:.95rem">${escHtml(post.author)}</div>
                <div style="font-size:.78rem;color:rgba(255,255,255,.5)">${formatDate(post.createdAt)}</div>
              </div>
            </div>
            <div class="detail-meta-stat">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ${(post.views || 0).toLocaleString()} views
            </div>
            <div class="detail-meta-stat">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              ${post.likes || 0} likes
            </div>
          </div>
        </div>
      </div>

      ${img ? `<div class="detail-img-section"><img src="${img}" alt="${escHtml(post.title)}" class="detail-featured-img" onerror="this.parentElement.style.display='none'"></div>` : '<div style="height:2rem"></div>'}

      <div class="detail-content-wrap">
        <div style="display:flex;gap:.75rem;margin-bottom:1.5rem;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="navigate('home')">← Back</button>
          <button class="like-btn ${liked ? 'liked' : ''}" id="detailLikeBtn" onclick="likeDetailPost('${post._id}')" style="border:1.5px solid var(--border);border-radius:8px;padding:.4rem .9rem;font-size:.85rem">
            <svg width="15" height="15" fill="${liked ? '#ef4444' : 'none'}" stroke="${liked ? '#ef4444' : 'currentColor'}" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <span id="detailLikeCount">${post.likes || 0}</span> Likes
          </button>
          <button class="btn btn-ghost btn-sm" onclick="editPost('${post._id}')">✏ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="showDeleteModal('${post._id}')">🗑 Delete</button>
        </div>

        <div class="detail-content">${post.content}</div>

        ${tagsHtml ? `<div class="tags-wrap">${tagsHtml}</div>` : ''}
      </div>

      <!-- COMMENTS -->
      <div class="comments-section">
        <h2 class="comments-title">Comments (${comments.length})</h2>
        <div class="comment-form-card">
          <h4 style="margin-bottom:1rem;font-size:1rem">Leave a Comment</h4>
          <div class="comment-form-grid">
            <input type="text" id="commentName" class="form-control" placeholder="Your name *">
            <input type="email" id="commentEmail" class="form-control" placeholder="Email address *">
          </div>
          <textarea id="commentText" class="form-control" rows="3" placeholder="Write your thoughts..." style="width:100%;margin-bottom:.75rem"></textarea>
          <button class="btn btn-primary btn-sm" onclick="submitComment('${post._id}')">Post Comment</button>
        </div>
        <div id="commentsList">
          ${comments.length ? comments.map(c => renderComment(c)).join('') : '<p class="text-muted" style="text-align:center;padding:1.5rem">Be the first to comment!</p>'}
        </div>
      </div>

      <!-- RELATED -->
      <div id="relatedSection"></div>
    `;

    // Load related posts
    loadRelated(post._id, post.category);
  } catch (e) {
    el.innerHTML = `<div class="empty-state"><h3>Post not found</h3><button class="btn btn-primary" onclick="navigate('home')" style="margin-top:1rem">Go Home</button></div>`;
  }
}

async function likeDetailPost(id) {
  try {
    const data = await apiFetch(`/posts/${id}/like`, {
      method: 'POST', body: JSON.stringify({ userId: state.userId })
    });
    const btn = document.getElementById('detailLikeBtn');
    btn.classList.toggle('liked', data.liked);
    const svg = btn.querySelector('svg');
    svg.setAttribute('fill', data.liked ? '#ef4444' : 'none');
    svg.setAttribute('stroke', data.liked ? '#ef4444' : 'currentColor');
    document.getElementById('detailLikeCount').textContent = data.likes;
  } catch (e) {}
}

async function loadRelated(id, category) {
  try {
    const data = await apiFetch(`/posts/related/${id}`);
    const posts = data.data;
    if (!posts.length) return;
    const el = document.getElementById('relatedSection');
    el.innerHTML = `
      <div class="related-section">
        <div class="related-inner">
          <h2 style="margin-bottom:1.5rem">Related Posts</h2>
          <div class="related-grid">
            ${posts.map(p => renderCard(p)).join('')}
          </div>
        </div>
      </div>
    `;
  } catch (e) {}
}

function renderComment(c) {
  return `
    <div class="comment-item">
      <div class="comment-avatar">${c.name.charAt(0).toUpperCase()}</div>
      <div>
        <div style="display:flex;align-items:center;gap:.75rem">
          <span class="comment-name">${escHtml(c.name)}</span>
          <span class="comment-date">${formatDate(c.createdAt)}</span>
        </div>
        <div class="comment-text">${escHtml(c.content)}</div>
      </div>
    </div>
  `;
}

async function submitComment(postId) {
  const name = document.getElementById('commentName').value.trim();
  const email = document.getElementById('commentEmail').value.trim();
  const content = document.getElementById('commentText').value.trim();
  if (!name || !email || !content) { showToast('Please fill all comment fields', 'error'); return; }

  try {
    const data = await apiFetch(`/comments/${postId}`, {
      method: 'POST', body: JSON.stringify({ name, email, content })
    });
    document.getElementById('commentName').value = '';
    document.getElementById('commentEmail').value = '';
    document.getElementById('commentText').value = '';
    const list = document.getElementById('commentsList');
    list.insertAdjacentHTML('afterbegin', renderComment(data.data));
    showToast('Comment posted!');
  } catch (e) { showToast(e.message, 'error'); }
}

// ===== CREATE / EDIT FORM =====
function setupCreateForm(post = null) {
  document.getElementById('formTitle').textContent = post ? 'Edit Post' : 'Write a New Post';
  document.getElementById('formSubtitle').textContent = post ? 'Update your post details' : 'Share your ideas with the world';
  document.getElementById('submitBtn').innerHTML = post
    ? '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/></svg> Update Post'
    : '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/></svg> Publish Post';

  if (post) {
    document.getElementById('editPostId').value = post._id;
    document.getElementById('fTitle').value = post.title || '';
    document.getElementById('fDescription').value = post.description || '';
    document.getElementById('fAuthor').value = post.author || '';
    document.getElementById('fCategory').value = post.category || '';
    document.getElementById('fTags').value = (post.tags || []).join(', ');
    document.getElementById('fImage').value = post.featuredImage || '';
    document.getElementById('fContent').value = post.content || '';
    if (post.featuredImage) {
      const prev = document.getElementById('imagePreview');
      prev.src = post.featuredImage;
      prev.style.display = 'block';
    }
    if (post.createdAt) {
      document.getElementById('fDate').value = new Date(post.createdAt).toISOString().split('T')[0];
    }
  } else {
    document.getElementById('postForm').reset();
    document.getElementById('editPostId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
  }
}

async function editPost(id) {
  try {
    const data = await apiFetch(`/posts/id/${id}`);
    navigate('create');
    setupCreateForm(data.data);
  } catch (e) { showToast('Could not load post', 'error'); }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editPostId').value;
  const btn = document.getElementById('submitBtn');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,.5);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite"></div> Saving...';

  const body = {
    title: document.getElementById('fTitle').value,
    description: document.getElementById('fDescription').value,
    content: document.getElementById('fContent').value,
    author: document.getElementById('fAuthor').value,
    category: document.getElementById('fCategory').value,
    tags: document.getElementById('fTags').value,
    featuredImage: document.getElementById('fImage').value,
    date: document.getElementById('fDate').value
  };

  try {
    if (editId) {
      await apiFetch(`/posts/${editId}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Post updated successfully!');
    } else {
      const data = await apiFetch('/posts', { method: 'POST', body: JSON.stringify(body) });
      showToast('Post published!');
      navigate('detail', data.data._id);
      return;
    }
    navigate('admin');
  } catch (err) {
    showToast(err.message || 'Failed to save post', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

function previewImage(url) {
  const prev = document.getElementById('imagePreview');
  if (url) { prev.src = url; prev.style.display = 'block'; }
  else prev.style.display = 'none';
}

// ===== ADMIN DASHBOARD =====
async function loadAdmin() {
  const tbody = document.getElementById('adminTableBody');
  const statsEl = document.getElementById('adminStats');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><div class="spinner" style="margin:0 auto"></div></td></tr>';

  try {
    const data = await apiFetch('/posts?limit=100');
    const posts = data.data;

    // Stats
    const totalViews = posts.reduce((a, p) => a + (p.views || 0), 0);
    const totalLikes = posts.reduce((a, p) => a + (p.likes || 0), 0);
    const categories = [...new Set(posts.map(p => p.category))].length;
    statsEl.innerHTML = [
      { label: 'Total Posts', value: data.pagination.total },
      { label: 'Total Views', value: totalViews.toLocaleString() },
      { label: 'Total Likes', value: totalLikes },
      { label: 'Categories', value: categories }
    ].map(s => `<div class="stat-card"><strong>${s.value}</strong><span>${s.label}</span></div>`).join('');

    // Table
    if (!posts.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><h3>No posts yet</h3></div></td></tr>';
      return;
    }
    tbody.innerHTML = posts.map(post => `
      <tr>
        <td><img src="${post.featuredImage || getPlaceholderImg(post.category)}" class="admin-table-thumb" onerror="this.src='${getPlaceholderImg(post.category)}'"></td>
        <td><div class="post-title-cell">${escHtml(post.title)}<small>${escHtml(post.author)}</small></div></td>
        <td><span class="card-category">${post.category}</span></td>
        <td>${(post.views || 0).toLocaleString()}</td>
        <td>${post.likes || 0}</td>
        <td>${formatDate(post.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-sm" onclick="navigate('detail','${post._id}')">View</button>
            <button class="btn btn-outline btn-sm" onclick="editPost('${post._id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="showDeleteModal('${post._id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h3>Could not load posts</h3><p>Ensure the backend is running.</p></div></td></tr>`;
  }
}

// ===== HELPERS =====
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getPlaceholderImg(category) {
  const colors = { Technology:'1a1a2e/c9a84c', Travel:'2d6a4f/ffffff', Food:'c9a84c/1a1a2e', Lifestyle:'e8643a/ffffff', Business:'2d2d4e/c9a84c', Health:'1a6b4a/ffffff', Education:'3d2b6e/ffffff', Entertainment:'e8643a/1a1a2e', Other:'4a4a6e/ffffff' };
  const c = colors[category] || '1a1a2e/ffffff';
  return `https://placehold.co/800x400/${c}?text=${encodeURIComponent(category||'Blog')}`;
}

// ===== INIT =====
function init() {
  renderCategoryFilters();
  renderFooterCategories();
  loadPosts();
}

init();
