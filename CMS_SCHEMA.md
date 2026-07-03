# CMS Schema for Resen Legal

This schema is designed for headless CMS platforms like **Sanity.io**, **Contentful**, or **Firebase Firestore**. It ensures that adding new services or members automatically updates the frontend.

## 1. Document: `Service`
| Field | Type | Note |
|-------|------|------|
| `title` | Object (i18n) | Keys: `en`, `tr`, `ar`, `es`, `zh` |
| `description` | Object (i18n) | Brief overview of the service |
| `icon` | String | Lucide icon name (e.g., "Globe", "Briefcase") |
| `slug` | Slug | Unique URL identifier |

## 2. Document: `TeamMember`
| Field | Type | Note |
|-------|------|------|
| `name` | String | Full name |
| `role` | Object (i18n) | Professional title |
| `image` | Image/URL | High-resolution portrait |
| `bio` | Object (i18n) | Extended lawyer biography |

## 3. Document: `BlogPost`
| Field | Type | Note |
|-------|------|------|
| `title` | Object (i18n) | Article heading |
| `excerpt` | Object (i18n) | Summary for cards |
| `content` | Markdown (i18n) | Full article body |
| `image` | Image | Featured image |
| `author` | Reference | Link to a `TeamMember` |
| `date` | Date | Publication date |

---

### Implementation Instructions for Cloudflare Pages
1. Deploy this code to **GitHub**.
2. Go to **Cloudflare Dashboard** > **Workers & Pages**.
3. Connect your GitHub repo.
4. Setting: Framework preset (**None / Static** for Vite output in `/dist`).
5. Build command: `npm run build`.
6. Output directory: `dist`.
